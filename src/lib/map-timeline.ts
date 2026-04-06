import { db } from './db';
import { REGION_DISPLAY_NAMES, REGISTRATION_REGIONS } from './constants';

type Severity = 'low' | 'medium' | 'high' | 'critical';

type BaseRegionPoint = {
  region: string;
  displayName: string;
  teacherCount: number;
  teacherDensity: number;
  averageExperience: number;
  underservedScore: number;
  expectedDivisions: number;
  divisionCoverageRate: number;
  severity: Severity;
  highlights: string[];
};

type SnapshotRow = {
  snapshot_month: string | Date;
  region: string;
  teacher_count: number | string;
  teacher_density: number | string;
  average_experience: number | string;
  underserved_score: number | string;
  expected_divisions: number | string;
  division_coverage_rate: number | string;
};

export type TimelineFrame = {
  periodStart: string;
  label: string;
  regions: BaseRegionPoint[];
};

let mapTimelineSchemaReady: Promise<void> | null = null;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toSeverity(teacherCount: number, underservedScore: number): Severity {
  if (teacherCount === 0 || underservedScore >= 60) {
    return 'critical';
  }

  if (underservedScore >= 40) {
    return 'high';
  }

  if (underservedScore >= 20) {
    return 'medium';
  }

  return 'low';
}

function toMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, monthOffset: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthOffset, 1));
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDateKey(value: string | Date) {
  if (value instanceof Date) {
    return toIsoDate(toMonthStart(value));
  }

  return String(value).slice(0, 10);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

async function ensureMapTimelineSchema() {
  if (!mapTimelineSchemaReady) {
    mapTimelineSchemaReady = (async () => {
      await db`
        create table if not exists map_region_snapshots (
          id uuid primary key default gen_random_uuid(),
          snapshot_month date not null,
          region text not null,
          teacher_count integer not null default 0,
          teacher_density numeric(10,2) not null default 0,
          average_experience numeric(10,2) not null default 0,
          underserved_score numeric(10,2) not null default 100,
          expected_divisions integer not null default 1,
          division_coverage_rate numeric(10,2) not null default 0,
          generated_from text not null default 'backfill',
          created_at timestamptz not null default timezone('utc'::text, now()),
          unique(snapshot_month, region)
        )
      `;

      await db`
        create index if not exists map_region_snapshots_month_idx
        on map_region_snapshots(snapshot_month asc)
      `;

      await db`
        create index if not exists map_region_snapshots_region_month_idx
        on map_region_snapshots(region, snapshot_month asc)
      `;
    })().catch((error) => {
      mapTimelineSchemaReady = null;
      throw error;
    });
  }

  await mapTimelineSchemaReady;
}

function buildRecentMonthStarts(monthCount: number) {
  const currentMonth = toMonthStart(new Date());
  return Array.from({ length: monthCount }, (_, index) => {
    const offset = index - (monthCount - 1);
    return addMonths(currentMonth, offset);
  });
}

async function upsertCurrentMonth(baseByRegion: Map<string, BaseRegionPoint>) {
  const currentMonth = toMonthStart(new Date());
  const monthIso = toIsoDate(currentMonth);

  for (const region of REGISTRATION_REGIONS) {
    const baseline = baseByRegion.get(region);
    const teacherCount = baseline?.teacherCount ?? 0;
    const expectedDivisions = Math.max(1, baseline?.expectedDivisions ?? 1);
    const teacherDensity = baseline?.teacherDensity ?? round(teacherCount / expectedDivisions);
    const averageExperience = baseline?.averageExperience ?? 0;
    const underservedScore = baseline?.underservedScore ?? 100;
    const coverageRate = baseline?.divisionCoverageRate ?? 0;

    await db`
      insert into map_region_snapshots (
        snapshot_month,
        region,
        teacher_count,
        teacher_density,
        average_experience,
        underserved_score,
        expected_divisions,
        division_coverage_rate,
        generated_from
      )
      values (
        ${monthIso},
        ${region},
        ${teacherCount},
        ${teacherDensity},
        ${averageExperience},
        ${underservedScore},
        ${expectedDivisions},
        ${coverageRate},
        ${'live-refresh'}
      )
      on conflict (snapshot_month, region)
      do update set
        teacher_count = excluded.teacher_count,
        teacher_density = excluded.teacher_density,
        average_experience = excluded.average_experience,
        underserved_score = excluded.underserved_score,
        expected_divisions = excluded.expected_divisions,
        division_coverage_rate = excluded.division_coverage_rate,
        generated_from = excluded.generated_from
    `;
  }
}

async function backfillHistoricalMonths(baseByRegion: Map<string, BaseRegionPoint>, monthCount: number) {
  const monthStarts = buildRecentMonthStarts(monthCount);
  const firstIso = toIsoDate(monthStarts[0]);
  const lastIso = toIsoDate(monthStarts[monthStarts.length - 1]);

  const existingRows = (await db`
    select snapshot_month, region
    from map_region_snapshots
    where snapshot_month >= ${firstIso}
      and snapshot_month <= ${lastIso}
  `) as Array<{ snapshot_month: string | Date; region: string }>;

  const existingKeySet = new Set(
    existingRows.map((row) => `${toDateKey(row.snapshot_month)}::${row.region}`),
  );

  for (let monthIndex = 0; monthIndex < monthStarts.length; monthIndex += 1) {
    const month = monthStarts[monthIndex];
    const monthIso = toIsoDate(month);

    const monthEndExclusive = addMonths(month, 1).toISOString();
    const monthAggregates = (await db`
      select
        region,
        count(*)::int as teacher_count,
        coalesce(avg(years_of_experience), 0)::numeric(10,2) as average_experience,
        count(distinct division)::int as covered_divisions
      from profiles
      where role = 'teacher'
        and consent_data_processing = true
        and profile_last_updated_at < ${monthEndExclusive}
      group by region
    `) as Array<{
      region: string;
      teacher_count: number;
      average_experience: number | string;
      covered_divisions: number;
    }>;

    const aggregateByRegion = new Map(monthAggregates.map((row) => [row.region, row]));

    for (const region of REGISTRATION_REGIONS) {
      const baseline = baseByRegion.get(region);
      if (!baseline) {
        continue;
      }

      const key = `${monthIso}::${region}`;
      if (existingKeySet.has(key)) {
        continue;
      }

      const aggregate = aggregateByRegion.get(region);

      const expectedDivisions = Math.max(1, baseline.expectedDivisions);
      const teacherCount = Math.max(0, aggregate?.teacher_count ?? 0);
      const teacherDensity = round(teacherCount / expectedDivisions);
      const averageExperience = round(clamp(toNumber(aggregate?.average_experience ?? baseline.averageExperience), 0, 45));
      const coveredDivisions = Math.max(0, aggregate?.covered_divisions ?? 0);
      const divisionCoverageRate = round(clamp((coveredDivisions / expectedDivisions) * 100, 0, 100));
      const underservedScore = teacherCount === 0
        ? 100
        : baseline.underservedScore;

      await db`
        insert into map_region_snapshots (
          snapshot_month,
          region,
          teacher_count,
          teacher_density,
          average_experience,
          underserved_score,
          expected_divisions,
          division_coverage_rate,
          generated_from
        )
        values (
          ${monthIso},
          ${region},
          ${teacherCount},
          ${teacherDensity},
          ${averageExperience},
          ${underservedScore},
          ${expectedDivisions},
          ${divisionCoverageRate},
          ${'historical-backfill'}
        )
        on conflict (snapshot_month, region) do nothing
      `;
    }
  }
}

function toNumber(value: number | string) {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

export async function getMapTimelineFrames(baseRegions: BaseRegionPoint[], monthCount = 12) {
  await ensureMapTimelineSchema();

  const baseByRegion = new Map(baseRegions.map((region) => [region.region, region]));

  await backfillHistoricalMonths(baseByRegion, monthCount);
  await upsertCurrentMonth(baseByRegion);

  const monthStarts = buildRecentMonthStarts(monthCount);
  const firstIso = toIsoDate(monthStarts[0]);
  const lastIso = toIsoDate(monthStarts[monthStarts.length - 1]);

  const rows = (await db`
    select
      snapshot_month,
      region,
      teacher_count,
      teacher_density,
      average_experience,
      underserved_score,
      expected_divisions,
      division_coverage_rate
    from map_region_snapshots
    where snapshot_month >= ${firstIso}
      and snapshot_month <= ${lastIso}
    order by snapshot_month asc, region asc
  `) as SnapshotRow[];

  const frameMap = new Map<string, BaseRegionPoint[]>();

  for (const row of rows) {
    const monthKey = toDateKey(row.snapshot_month);
    const baseline = baseByRegion.get(row.region);

    const regionPoint: BaseRegionPoint = {
      region: row.region,
      displayName: baseline?.displayName ?? REGION_DISPLAY_NAMES[row.region] ?? row.region,
      teacherCount: Math.max(0, Math.round(toNumber(row.teacher_count))),
      teacherDensity: round(Math.max(0, toNumber(row.teacher_density))),
      averageExperience: round(Math.max(0, toNumber(row.average_experience))),
      underservedScore: round(clamp(toNumber(row.underserved_score), 0, 100)),
      expectedDivisions: Math.max(1, Math.round(toNumber(row.expected_divisions))),
      divisionCoverageRate: round(clamp(toNumber(row.division_coverage_rate), 0, 100)),
      severity: toSeverity(Math.max(0, Math.round(toNumber(row.teacher_count))), round(clamp(toNumber(row.underserved_score), 0, 100))),
      highlights: baseline?.highlights ?? [],
    };

    const frameRows = frameMap.get(monthKey) ?? [];
    frameRows.push(regionPoint);
    frameMap.set(monthKey, frameRows);
  }

  return monthStarts.map((month) => {
    const periodStart = toIsoDate(month);
    const existingRows = frameMap.get(periodStart) ?? [];
    const rowsByRegion = new Map(existingRows.map((row) => [row.region, row]));

    const regions = REGISTRATION_REGIONS.map((region) => {
      const fromRow = rowsByRegion.get(region);

      if (fromRow) {
        return fromRow;
      }

      const baseline = baseByRegion.get(region);
      const teacherCount = baseline?.teacherCount ?? 0;
      const expectedDivisions = Math.max(1, baseline?.expectedDivisions ?? 1);
      const underservedScore = baseline?.underservedScore ?? 100;

      return {
        region,
        displayName: baseline?.displayName ?? REGION_DISPLAY_NAMES[region] ?? region,
        teacherCount,
        teacherDensity: baseline?.teacherDensity ?? round(teacherCount / expectedDivisions),
        averageExperience: baseline?.averageExperience ?? 0,
        underservedScore,
        expectedDivisions,
        divisionCoverageRate: baseline?.divisionCoverageRate ?? 0,
        severity: toSeverity(teacherCount, underservedScore),
        highlights: baseline?.highlights ?? [],
      } satisfies BaseRegionPoint;
    });

    return {
      periodStart,
      label: monthLabel(month),
      regions,
    } satisfies TimelineFrame;
  });
}
