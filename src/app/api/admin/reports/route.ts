import type { NextRequest } from 'next/server';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import { REGION_DISPLAY_NAMES } from '@/lib/constants';
import { getRegionalInsightsDashboard } from '@/lib/regional-insights';

export const dynamic = 'force-dynamic';

type ReportType = 'annual-planning' | 'twinning-targets' | 'school-activity';

function csvEscape(value: string | number | null | undefined) {
  const normalized = String(value ?? '');

  if (/[,"\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const lines = [headers.map((header) => csvEscape(header)).join(',')];

  for (const row of rows) {
    lines.push(row.map((cell) => csvEscape(cell)).join(','));
  }

  return `\uFEFF${lines.join('\n')}\n`;
}

function timeStampForFile() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  const hour = `${now.getHours()}`.padStart(2, '0');
  const minute = `${now.getMinutes()}`.padStart(2, '0');
  return `${year}${month}${day}-${hour}${minute}`;
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'report';
}

function normalizeReportType(value: string | null): ReportType {
  if (value === 'twinning-targets' || value === 'school-activity') {
    return value;
  }

  return 'annual-planning';
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response('Authentication required.', { status: 401 });
  }

  if (!hasAcceptedLatestTerms(user)) {
    return new Response('Terms acceptance required.', { status: 403 });
  }

  if (user.role !== 'admin') {
    return new Response('Admin access required.', { status: 403 });
  }

  const type = normalizeReportType(request.nextUrl.searchParams.get('type'));
  const insights = await getRegionalInsightsDashboard();
  const timestamp = timeStampForFile();

  if (type === 'twinning-targets') {
    const rows = insights.twinningTargets.map((target) => [
      REGION_DISPLAY_NAMES[target.region] ?? target.region,
      target.targetSchool,
      target.mentorSchool ?? 'No mentor school identified',
      target.targetTeacherCount,
      target.targetActivityScore,
      target.mentorTeacherCount,
      target.mentorActivityScore,
      target.priorityScore,
      target.rationale,
    ]);

    const csv = toCsv(
      [
        'Region',
        'Target School',
        'Mentor School',
        'Target Teacher Count',
        'Target Activity Score',
        'Mentor Teacher Count',
        'Mentor Activity Score',
        'Priority Score',
        'Rationale',
      ],
      rows,
    );

    const fileName = sanitizeFileName(`twinning-targets-${timestamp}.csv`);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  }

  if (type === 'school-activity') {
    const rows = insights.schoolActivity.map((school) => [
      REGION_DISPLAY_NAMES[school.region] ?? school.region,
      school.school,
      school.teacherCount,
      school.forumTopicCount,
      school.forumCommentCount,
      school.resourceShareCount,
      school.activityScore,
      school.activityPerTeacher,
      school.isIsolated ? 'Yes' : 'No',
      school.interventionPriority,
      school.lastActivityAt ?? '',
    ]);

    const csv = toCsv(
      [
        'Region',
        'School',
        'Teacher Count',
        'Forum Topics',
        'Forum Comments',
        'Shared Resources',
        'Activity Score',
        'Activity Per Teacher',
        'Is Isolated',
        'Intervention Priority',
        'Last Activity At',
      ],
      rows,
    );

    const fileName = sanitizeFileName(`school-activity-${timestamp}.csv`);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  }

  const coverageByRegion = new Map(insights.coverageGaps.map((item) => [item.region, item]));
  const recommendationsByRegion = new Map(insights.programRecommendations.map((item) => [item.region, item]));
  const twinningCountByRegion = insights.twinningTargets.reduce((acc, item) => {
    acc.set(item.region, (acc.get(item.region) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const rows = insights.topPriorityRegions.map((item) => {
    const coverage = coverageByRegion.get(item.region);
    const recommendations = recommendationsByRegion.get(item.region);

    return [
      REGION_DISPLAY_NAMES[item.region] ?? item.region,
      item.teacherCount,
      item.priorityScore,
      item.averageUnderservedScore,
      item.starAccessRate,
      item.completenessPercentage,
      coverage?.coveragePercentage ?? 0,
      coverage?.gapLevel ?? 'unknown',
      (coverage?.missingDivisions ?? []).join('; '),
      twinningCountByRegion.get(item.region) ?? 0,
      (recommendations?.recommendedPrograms ?? []).join('; '),
      item.reasons.join('; '),
    ];
  });

  const csv = toCsv(
    [
      'Region',
      'Teacher Count',
      'Priority Score',
      'Average Underserved Score',
      'Program Access Rate (%)',
      'Completeness (%)',
      'Division Coverage (%)',
      'Coverage Gap Level',
      'Missing Divisions',
      'Twinning Targets',
      'Recommended Programs',
      'Priority Drivers',
    ],
    rows,
  );

  const fileName = sanitizeFileName(`annual-planning-${timestamp}.csv`);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}
