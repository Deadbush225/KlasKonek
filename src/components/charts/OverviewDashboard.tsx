'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import styles from './charts.module.css';

/* ── Inline SVG Icons (solid, no emoji) ──────── */

function IconTeachers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ── chart palette: muted, institutional ────── */
const CHART_BLUE = '#1d4f91';
const CHART_BLUE_LIGHT = '#2d6ab8';
const CHART_NAVY = '#3f448c';
const CHART_TEAL = '#0e7c7b';
const CHART_SLATE = '#4b5c6b';
const CHART_GOLD = '#b8860b';
const PIE_COLORS = [CHART_BLUE, CHART_TEAL, CHART_GOLD, CHART_NAVY, CHART_SLATE, CHART_BLUE_LIGHT];

type NeedsSegmentation = {
  region: string;
  totalTeachers: number;
  newTeachers: number;
  midCareerTeachers: number;
  veteranTeachers: number;
  masterTrackTeachers: number;
  stemSpecializationGap: number;
};

type PriorityRegion = {
  region: string;
  teacherCount: number;
  priorityScore: number;
  averageUnderservedScore: number;
  starAccessRate: number;
  completenessPercentage: number;
  reasons: string[];
};

type FreshnessIndicator = {
  region: string;
  teacherCount: number;
  lastUpdatedAt: string;
  completenessPercentage: number;
};

type CoverageGap = {
  region: string;
  teacherCount: number;
  expectedDivisions: number;
  coveredDivisions: number;
  coveragePercentage: number;
  missingDivisions: string[];
  gapLevel: 'critical' | 'warning' | 'healthy';
};

type DivisionSnapshot = {
  region: string;
  division: string;
  teacherCount: number;
  averageExperience: number;
  experienceDistribution: { newTeachers: number; midCareer: number; veteran: number };
  qualificationLevels: Array<{ level: string; count: number }>;
  subjectMix: Array<{ subject: string; count: number }>;
  participationRates: Array<{ status: string; rate: number; count: number }>;
  underservedScore: number;
  underservedReasons: string[];
};

type ProgramRecommendation = {
  region: string;
  priorityScore: number;
  teacherCount: number;
  recommendedPrograms: string[];
  rationale: string[];
};

type AnonymizedSummary = {
  totalConsentedTeachers: number;
  anonymizedDatasetRows: number;
  includedRegions: number;
};

type Props = {
  needsSegmentation: NeedsSegmentation[];
  topPriorityRegions: PriorityRegion[];
  freshnessIndicators: FreshnessIndicator[];
  coverageGaps: CoverageGap[];
  divisionSnapshots: DivisionSnapshot[];
  programRecommendations: ProgramRecommendation[];
  anonymizedResearchSummary: AnonymizedSummary;
  regionDisplayNames: Record<string, string>;
};

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export default function OverviewDashboard({
  needsSegmentation,
  topPriorityRegions,
  freshnessIndicators,
  coverageGaps,
  divisionSnapshots,
  programRecommendations,
  anonymizedResearchSummary,
  regionDisplayNames,
}: Props) {
  /* ── National KPIs ─────────────────────────── */
  const totalTeachers = needsSegmentation.reduce((sum, region) => sum + region.totalTeachers, 0);
  const regionsWithData = needsSegmentation.filter((region) => region.totalTeachers > 0).length;
  const totalRegions = needsSegmentation.length || 17;

  const weightedStarAccess =
    totalTeachers > 0
      ? round(
          topPriorityRegions.reduce((sum, region) => sum + region.starAccessRate * region.teacherCount, 0) /
            totalTeachers,
        )
      : 0;

  const underservedDivisions = divisionSnapshots.filter((snapshot) => snapshot.underservedScore >= 35).length;

  const avgCompleteness =
    freshnessIndicators.length > 0
      ? round(
          freshnessIndicators.reduce((sum, item) => sum + item.completenessPercentage, 0) / freshnessIndicators.length,
        )
      : 0;

  /* ── Chart Data: Experience Distribution ────── */
  const nationalNew = needsSegmentation.reduce((sum, region) => sum + region.newTeachers, 0);
  const nationalMid = needsSegmentation.reduce((sum, region) => sum + region.midCareerTeachers, 0);
  const nationalVet = needsSegmentation.reduce((sum, region) => sum + region.veteranTeachers, 0);

  const experienceData = [
    { name: 'New (≤3yr)', value: nationalNew },
    { name: 'Mid-Career (4-10yr)', value: nationalMid },
    { name: 'Veteran (10+yr)', value: nationalVet },
  ];

  /* ── Chart Data: Teacher Distribution by Region */
  const regionTeacherData = [...needsSegmentation]
    .sort((a, b) => b.totalTeachers - a.totalTeachers)
    .slice(0, 12)
    .map((region) => ({
      name: regionDisplayNames[region.region]?.replace(/\s*\(.*?\)\s*/g, '') ?? region.region,
      teachers: region.totalTeachers,
    }));

  /* ── Chart Data: Qualification Mix ─────────── */
  const qualMap = new Map<string, number>();
  for (const snapshot of divisionSnapshots) {
    for (const q of snapshot.qualificationLevels) {
      qualMap.set(q.level, (qualMap.get(q.level) ?? 0) + q.count);
    }
  }
  const qualificationData = [...qualMap.entries()]
    .map(([name, value]) => ({ name: name.length > 22 ? name.slice(0, 20) + '…' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  /* ── Chart Data: Priority Regions (ALL regions, sorted by score desc) ───── */
  const priorityData = [...topPriorityRegions]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10)
    .map((region) => ({
      name: regionDisplayNames[region.region]?.replace(/\s*\(.*?\)\s*/g, '') ?? region.region,
      score: region.priorityScore,
      accessRate: region.starAccessRate,
    }));

  /* ── Chart Data: Subject Coverage ──────────── */
  const subjectMap = new Map<string, number>();
  for (const snapshot of divisionSnapshots) {
    for (const s of snapshot.subjectMix) {
      subjectMap.set(s.subject, (subjectMap.get(s.subject) ?? 0) + s.count);
    }
  }
  const subjectData = [...subjectMap.entries()]
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  /* ── Alerts ────────────────────────────────── */
  const criticalAlerts = coverageGaps
    .filter((gap) => gap.gapLevel === 'critical' || gap.gapLevel === 'warning')
    .sort((a, b) => a.coveragePercentage - b.coveragePercentage)
    .slice(0, 6)
    .map((gap) => ({
      region: regionDisplayNames[gap.region] ?? gap.region,
      level: gap.gapLevel,
      detail: gap.teacherCount === 0
        ? 'No teacher records captured. Regional onboarding is urgently needed.'
        : `Only ${gap.coveredDivisions}/${gap.expectedDivisions} divisions covered (${gap.coveragePercentage}%).`,
      teachers: gap.teacherCount,
      coverage: gap.coveragePercentage,
      programs: programRecommendations.find((r) => r.region === gap.region)?.recommendedPrograms.slice(0, 2) ?? [],
    }));

  return (
    <section>
      {/* ── KPI Row ──────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconTeachers /></span>
          <span className={styles.kpiValue}>{totalTeachers.toLocaleString()}</span>
          <span className={styles.kpiLabel}>Teachers Profiled</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconMap /></span>
          <span className={styles.kpiValue}>{regionsWithData}/{totalRegions}</span>
          <span className={styles.kpiLabel}>Regions with Data</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconStar /></span>
          <span className={styles.kpiValue}>{weightedStarAccess}%</span>
          <span className={styles.kpiLabel}>STAR Access Rate</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconAlert /></span>
          <span className={styles.kpiValue}>{underservedDivisions}</span>
          <span className={styles.kpiLabel}>Underserved Divisions</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconChart /></span>
          <span className={styles.kpiValue}>{avgCompleteness}%</span>
          <span className={styles.kpiLabel}>Data Completeness</span>
        </div>
      </div>

      {/* ── Charts Grid ──────────────────────── */}
      <div className={styles.chartGrid}>
        {/* Experience Distribution */}
        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Experience Distribution</h3>
          <p className={styles.chartSubtitle}>National breakdown of teacher experience levels</p>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={experienceData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="72%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {experienceData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                  formatter={(value) => [`${value} teachers`, '']}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teacher Distribution by Region */}
        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Teacher Distribution by Region</h3>
          <p className={styles.chartSubtitle}>Top regions by number of profiled teachers</p>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={regionTeacherData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                />
                <Bar dataKey="teachers" fill={CHART_BLUE} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qualification Mix */}
        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Qualification Mix</h3>
          <p className={styles.chartSubtitle}>Distribution of teacher qualification levels</p>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={qualificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius="42%"
                  outerRadius="70%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {qualificationData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                  formatter={(value) => [`${value} teachers`, '']}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.72rem', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Priority Regions - now shows ALL regions, not just > 0 */}
        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Top Priority Regions</h3>
          <p className={styles.chartSubtitle}>Regions ranked by intervention priority score</p>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                  formatter={(value, name) => {
                    if (name === 'score') return [`${value}`, 'Priority Score'];
                    return [`${value}%`, 'STAR Access'];
                  }}
                />
                <Bar dataKey="score" fill={CHART_BLUE} radius={[0, 4, 4, 0]} barSize={14} name="score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Coverage - Wide: single dark blue, grid lines */}
        <div className={`card ${styles.chartCardWide}`}>
          <h3 className={styles.chartTitle}>Subject Specialization Coverage</h3>
          <p className={styles.chartSubtitle}>Most common subject specializations across all regions</p>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectData} margin={{ left: 0, right: 16, top: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} vertical={true} horizontal={true} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)', angle: 0 }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                  formatter={(value) => [`${value} teachers`, '']}
                />
                <Bar dataKey="value" fill={CHART_BLUE} radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── STAR Program Consent Summary ─────── */}
      <div className={styles.kpiRow} style={{ marginBottom: '1.5rem' }}>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconCheck /></span>
          <span className={styles.kpiValue}>{anonymizedResearchSummary.totalConsentedTeachers}</span>
          <span className={styles.kpiLabel}>Research-Consented</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconLock /></span>
          <span className={styles.kpiValue}>{anonymizedResearchSummary.anonymizedDatasetRows}</span>
          <span className={styles.kpiLabel}>Anonymized Records</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}><IconGlobe /></span>
          <span className={styles.kpiValue}>{anonymizedResearchSummary.includedRegions}</span>
          <span className={styles.kpiLabel}>Regions in Dataset</span>
        </div>
      </div>

      {/* ── Critical Alerts ──────────────────── */}
      {criticalAlerts.length > 0 && (
        <div className={styles.alertsSection}>
          <h3 className={styles.alertsTitle}>
            <IconAlert /> Critical Alerts &amp; Action Items
          </h3>
          <div className={styles.alertGrid}>
            {criticalAlerts.map((alert) => (
              <div
                key={alert.region}
                className={`card ${styles.alertCard} ${
                  alert.level === 'critical' ? styles.alertCritical : styles.alertWarning
                }`}
              >
                <span className={styles.alertIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={alert.level === 'critical' ? '#b91c1c' : '#b8860b'} stroke="none">
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                </span>
                <div className={styles.alertBody}>
                  <div className={styles.alertRegion}>{alert.region}</div>
                  <div className={styles.alertDetail}>{alert.detail}</div>
                  <div className={styles.alertMeta}>
                    <span>Teachers: {alert.teachers}</span>
                    <span>Coverage: {alert.coverage}%</span>
                  </div>
                  {alert.programs.length > 0 && (
                    <div className={styles.alertDetail} style={{ marginTop: '0.35rem', fontStyle: 'italic' }}>
                      Recommended: {alert.programs.join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
