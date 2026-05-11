import { NextResponse } from 'next/server';
import { REGION_DISPLAY_NAMES, REGION_DIVISIONS_BY_REGION, REGISTRATION_REGIONS } from '@/lib/constants';
import { getRegionalInsightsDashboard } from '@/lib/regional-insights';
import { getMapTimelineFrames } from '@/lib/map-timeline';

export const revalidate = 300;

type MapSeverity = 'low' | 'medium' | 'high' | 'critical';

type RegionMapPoint = {
  region: string;
  displayName: string;
  teacherCount: number;
  teacherDensity: number;
  averageExperience: number;
  underservedScore: number;
  expectedDivisions: number;
  divisionCoverageRate: number;
  severity: MapSeverity;
  highlights: string[];
};

type ActionableInsight = {
  id: string;
  title: string;
  description: string;
  level: 'stable' | 'warning' | 'critical';
};

type DivisionDensityRankRow = {
  division: string;
  teacherCount: number;
  averageExperience: number;
  underservedScore: number;
  densityIndex: number;
};

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toSeverity(teacherCount: number, underservedScore: number): MapSeverity {
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

function summarizeHighlights(
  teacherCount: number,
  averageExperience: number,
  reasonEntries: Array<[string, number]>,
): string[] {
  if (teacherCount === 0) {
    return ['No teacher records captured yet', 'Prioritize onboarding and profile completion'];
  }

  const highlights: string[] = [];

  if (averageExperience <= 5) {
    highlights.push('High share of early-career teachers');
  } else if (averageExperience >= 12) {
    highlights.push('Strong veteran-teacher base');
  }

  for (const [reason] of reasonEntries.slice(0, 2)) {
    highlights.push(reason);
  }

  if (highlights.length === 0) {
    highlights.push('No significant risk signals detected');
  }

  return highlights.slice(0, 3);
}

export async function GET() {
  const insights = await getRegionalInsightsDashboard();
  const coverageGapByRegion = new Map(insights.coverageGaps.map((item) => [item.region, item]));

  const regionMapPoints: RegionMapPoint[] = REGISTRATION_REGIONS.map((region) => {
    const snapshots = insights.divisionSnapshots.filter((item) => item.region === region);
    const coverageGap = coverageGapByRegion.get(region);
    const teacherCount = snapshots.reduce((sum, item) => sum + item.teacherCount, 0);
    const expectedDivisions = coverageGap?.expectedDivisions ?? Math.max(1, snapshots.length);

    const weightedExperience = snapshots.reduce((sum, item) => {
      return sum + (item.averageExperience * item.teacherCount);
    }, 0);

    const averageExperience = teacherCount > 0 ? round(weightedExperience / teacherCount) : 0;

    const averageUnderservedScore = snapshots.length > 0
      ? round(snapshots.reduce((sum, item) => sum + item.underservedScore, 0) / snapshots.length)
      : 100;

    const reasonCounter = new Map<string, number>();
    for (const snapshot of snapshots) {
      for (const reason of snapshot.underservedReasons) {
        reasonCounter.set(reason, (reasonCounter.get(reason) ?? 0) + 1);
      }
    }

    const reasonEntries = [...reasonCounter.entries()].sort((a, b) => b[1] - a[1]);

    return {
      region,
      displayName: REGION_DISPLAY_NAMES[region] ?? region,
      teacherCount,
      teacherDensity: expectedDivisions > 0 ? round(teacherCount / expectedDivisions) : 0,
      averageExperience,
      underservedScore: averageUnderservedScore,
      expectedDivisions,
      divisionCoverageRate: coverageGap?.coveragePercentage ?? 0,
      severity: toSeverity(teacherCount, averageUnderservedScore),
      highlights: summarizeHighlights(teacherCount, averageExperience, reasonEntries),
    } satisfies RegionMapPoint;
  });

  const actionableInsights: ActionableInsight[] = insights.topPriorityRegions.slice(0, 3).map((item) => {
    const riskLevel: ActionableInsight['level'] = item.priorityScore >= 70
      ? 'critical'
      : item.priorityScore >= 45
        ? 'warning'
        : 'stable';

    const reasonSummary = item.reasons.slice(0, 2).join('; ');

    return {
      id: item.region,
      title: `${REGION_DISPLAY_NAMES[item.region] ?? item.region} priority score ${item.priorityScore}`,
      description: `${item.teacherCount} teachers captured. ${reasonSummary || 'Continue monitoring current indicators.'}`,
      level: riskLevel,
    };
  });

  const divisionDensityByRegion: Record<string, DivisionDensityRankRow[]> = Object.fromEntries(
    REGISTRATION_REGIONS.map((region) => {
      const snapshots = insights.divisionSnapshots.filter((item) => item.region === region);
      const snapshotByDivision = new Map(snapshots.map((item) => [item.division, item]));
      const configuredDivisions = REGION_DIVISIONS_BY_REGION[region] ?? [];

      const normalizedRows: DivisionDensityRankRow[] = configuredDivisions.map((division) => {
        const snapshot = snapshotByDivision.get(division);

        return {
          division,
          teacherCount: snapshot?.teacherCount ?? 0,
          averageExperience: snapshot?.averageExperience ?? 0,
          underservedScore: snapshot?.underservedScore ?? 0,
          densityIndex: 0,
        };
      });

      const extraRows = snapshots
        .filter((item) => !configuredDivisions.includes(item.division))
        .map((item) => ({
          division: item.division,
          teacherCount: item.teacherCount,
          averageExperience: item.averageExperience,
          underservedScore: item.underservedScore,
          densityIndex: 0,
        } satisfies DivisionDensityRankRow));

      const allRows = [...normalizedRows, ...extraRows];
      const averageTeacherCountPerDivision = allRows.length > 0
        ? allRows.reduce((sum, item) => sum + item.teacherCount, 0) / allRows.length
        : 0;

      const rankedRows = allRows
        .map((item) => ({
          ...item,
          densityIndex: averageTeacherCountPerDivision > 0
            ? round(item.teacherCount / averageTeacherCountPerDivision)
            : 0,
        }))
        .sort((a, b) => {
          if (b.teacherCount !== a.teacherCount) {
            return b.teacherCount - a.teacherCount;
          }

          if (b.densityIndex !== a.densityIndex) {
            return b.densityIndex - a.densityIndex;
          }

          return a.division.localeCompare(b.division, 'en');
        });

      return [region, rankedRows];
    }),
  );

  const timelineMonths = await getMapTimelineFrames(regionMapPoints, 12);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      regions: regionMapPoints,
      actionableInsights,
      timelineMonths,
      divisionDensityByRegion,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
      },
    },
  );
}
