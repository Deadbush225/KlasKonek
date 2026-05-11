'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import styles from './charts.module.css';

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

type Props = {
  needsSegmentation: NeedsSegmentation[];
  topPriorityRegions: PriorityRegion[];
  freshnessIndicators: FreshnessIndicator[];
  coverageGaps: CoverageGap[];
  divisionSnapshots: DivisionSnapshot[];
  regions: string[];
  regionDisplayNames: Record<string, string>;
};

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function shortName(displayName: string) {
  return displayName.replace(/\s*\(.*?\)\s*/g, '').trim();
}

type RegionProfile = {
  totalTeachers: number;
  newTeachers: number;
  midCareerTeachers: number;
  veteranTeachers: number;
  masterTrackTeachers: number;
  stemGap: number;
  priorityScore: number;
  starAccessRate: number;
  completeness: number;
  underservedScore: number;
  coveragePercentage: number;
  coveredDivisions: number;
  expectedDivisions: number;
  avgExperience: number;
};

export default function RegionCompare({
  needsSegmentation,
  topPriorityRegions,
  freshnessIndicators,
  coverageGaps,
  divisionSnapshots,
  regions,
  regionDisplayNames,
}: Props) {
  const [regionA, setRegionA] = useState('');
  const [regionB, setRegionB] = useState('');

  const segMap = useMemo(() => new Map(needsSegmentation.map((r) => [r.region, r])), [needsSegmentation]);
  const prioMap = useMemo(() => new Map(topPriorityRegions.map((r) => [r.region, r])), [topPriorityRegions]);
  const freshMap = useMemo(() => new Map(freshnessIndicators.map((r) => [r.region, r])), [freshnessIndicators]);
  const covMap = useMemo(() => new Map(coverageGaps.map((r) => [r.region, r])), [coverageGaps]);

  function buildProfile(region: string): RegionProfile | null {
    if (!region) return null;
    const seg = segMap.get(region);
    const prio = prioMap.get(region);
    const fresh = freshMap.get(region);
    const cov = covMap.get(region);
    const regionSnaps = divisionSnapshots.filter((d) => d.region === region);

    const totalTeachers = seg?.totalTeachers ?? 0;
    const avgExperience = regionSnaps.length > 0
      ? round(regionSnaps.reduce((s, d) => s + d.averageExperience * d.teacherCount, 0) / Math.max(totalTeachers, 1))
      : 0;

    return {
      totalTeachers,
      newTeachers: seg?.newTeachers ?? 0,
      midCareerTeachers: seg?.midCareerTeachers ?? 0,
      veteranTeachers: seg?.veteranTeachers ?? 0,
      masterTrackTeachers: seg?.masterTrackTeachers ?? 0,
      stemGap: seg?.stemSpecializationGap ?? 0,
      priorityScore: prio?.priorityScore ?? 0,
      starAccessRate: prio?.starAccessRate ?? 0,
      completeness: fresh?.completenessPercentage ?? 0,
      underservedScore: prio?.averageUnderservedScore ?? 0,
      coveragePercentage: cov?.coveragePercentage ?? 0,
      coveredDivisions: cov?.coveredDivisions ?? 0,
      expectedDivisions: cov?.expectedDivisions ?? 0,
      avgExperience,
    };
  }

  const profileA = buildProfile(regionA);
  const profileB = buildProfile(regionB);

  const nameA = regionA ? shortName(regionDisplayNames[regionA] ?? regionA) : 'Region A';
  const nameB = regionB ? shortName(regionDisplayNames[regionB] ?? regionB) : 'Region B';

  const hasBoth = profileA !== null && profileB !== null;

  /* ── Side-by-side bar chart data ───────────── */
  const comparisonBarData = hasBoth
    ? [
        { metric: 'Teachers', [nameA]: profileA.totalTeachers, [nameB]: profileB.totalTeachers },
        { metric: 'New', [nameA]: profileA.newTeachers, [nameB]: profileB.newTeachers },
        { metric: 'Mid-Career', [nameA]: profileA.midCareerTeachers, [nameB]: profileB.midCareerTeachers },
        { metric: 'Veteran', [nameA]: profileA.veteranTeachers, [nameB]: profileB.veteranTeachers },
        { metric: 'STEM Gap', [nameA]: profileA.stemGap, [nameB]: profileB.stemGap },
      ]
    : [];

  /* ── Radar chart data ──────────────────────── */
  const radarData = hasBoth
    ? [
        { metric: 'Program Access', A: profileA.starAccessRate, B: profileB.starAccessRate },
        { metric: 'Completeness', A: profileA.completeness, B: profileB.completeness },
        { metric: 'Coverage', A: profileA.coveragePercentage, B: profileB.coveragePercentage },
        { metric: '100 - Priority', A: Math.max(0, 100 - profileA.priorityScore), B: Math.max(0, 100 - profileB.priorityScore) },
        { metric: '100 - Underserved', A: Math.max(0, 100 - profileA.underservedScore), B: Math.max(0, 100 - profileB.underservedScore) },
      ]
    : [];

  /* ── Detailed comparison rows ──────────────── */
  type CompRow = { label: string; a: string; b: string; deltaLabel: string; deltaClass: string };
  const compRows: CompRow[] = hasBoth
    ? [
        (() => { const d = profileA.totalTeachers - profileB.totalTeachers; return { label: 'Total Teachers', a: `${profileA.totalTeachers}`, b: `${profileB.totalTeachers}`, deltaLabel: d > 0 ? `+${d}` : `${d}`, deltaClass: d > 0 ? styles.deltaPositive : d < 0 ? styles.deltaNegative : styles.deltaNeutral }; })(),
        (() => { const d = round(profileA.avgExperience - profileB.avgExperience); return { label: 'Avg Experience (yr)', a: `${profileA.avgExperience}`, b: `${profileB.avgExperience}`, deltaLabel: d > 0 ? `+${d}` : `${d}`, deltaClass: d > 0 ? styles.deltaPositive : d < 0 ? styles.deltaNegative : styles.deltaNeutral }; })(),
        (() => { const d = round(profileA.starAccessRate - profileB.starAccessRate); return { label: 'Program Access Rate', a: `${profileA.starAccessRate}%`, b: `${profileB.starAccessRate}%`, deltaLabel: `${d > 0 ? '+' : ''}${d}pp`, deltaClass: d > 0 ? styles.deltaPositive : d < 0 ? styles.deltaNegative : styles.deltaNeutral }; })(),
        (() => { const d = round(profileA.completeness - profileB.completeness); return { label: 'Data Completeness', a: `${profileA.completeness}%`, b: `${profileB.completeness}%`, deltaLabel: `${d > 0 ? '+' : ''}${d}pp`, deltaClass: d > 0 ? styles.deltaPositive : d < 0 ? styles.deltaNegative : styles.deltaNeutral }; })(),
        (() => { const d = round(profileA.coveragePercentage - profileB.coveragePercentage); return { label: 'Division Coverage', a: `${profileA.coveredDivisions}/${profileA.expectedDivisions} (${profileA.coveragePercentage}%)`, b: `${profileB.coveredDivisions}/${profileB.expectedDivisions} (${profileB.coveragePercentage}%)`, deltaLabel: `${d > 0 ? '+' : ''}${d}pp`, deltaClass: d > 0 ? styles.deltaPositive : d < 0 ? styles.deltaNegative : styles.deltaNeutral }; })(),
        (() => { const d = round(profileA.priorityScore - profileB.priorityScore); return { label: 'Priority Score', a: `${profileA.priorityScore}`, b: `${profileB.priorityScore}`, deltaLabel: d > 0 ? `+${d}` : `${d}`, deltaClass: d > 0 ? styles.deltaNegative : d < 0 ? styles.deltaPositive : styles.deltaNeutral }; })(),
        (() => { const d = round(profileA.underservedScore - profileB.underservedScore); return { label: 'Underserved Score', a: `${profileA.underservedScore}`, b: `${profileB.underservedScore}`, deltaLabel: d > 0 ? `+${d}` : `${d}`, deltaClass: d > 0 ? styles.deltaNegative : d < 0 ? styles.deltaPositive : styles.deltaNeutral }; })(),
        (() => { const d = profileA.stemGap - profileB.stemGap; return { label: 'STEM Specialization Gap', a: `${profileA.stemGap}`, b: `${profileB.stemGap}`, deltaLabel: d > 0 ? `+${d}` : `${d}`, deltaClass: d > 0 ? styles.deltaNegative : d < 0 ? styles.deltaPositive : styles.deltaNeutral }; })(),
        (() => { const d = profileA.masterTrackTeachers - profileB.masterTrackTeachers; return { label: 'Master Track', a: `${profileA.masterTrackTeachers}`, b: `${profileB.masterTrackTeachers}`, deltaLabel: d > 0 ? `+${d}` : `${d}`, deltaClass: d > 0 ? styles.deltaPositive : d < 0 ? styles.deltaNegative : styles.deltaNeutral }; })(),
      ]
    : [];

  return (
    <section>
      {/* ── Controls ──────────────────────────── */}
      <div className={`card ${styles.compareControls}`} style={{ padding: '1.25rem' }}>
        <div className={styles.compareField}>
          <label className={styles.compareFieldLabel}>Region A</label>
          <select
            className={styles.compareSelect}
            value={regionA}
            onChange={(e) => setRegionA(e.target.value)}
          >
            <option value="">Select a region…</option>
            {regions.map((region) => (
              <option key={region} value={region} disabled={region === regionB}>
                {regionDisplayNames[region] ?? region}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.compareField}>
          <label className={styles.compareFieldLabel}>Region B</label>
          <select
            className={styles.compareSelect}
            value={regionB}
            onChange={(e) => setRegionB(e.target.value)}
          >
            <option value="">Select a region…</option>
            {regions.map((region) => (
              <option key={region} value={region} disabled={region === regionA}>
                {regionDisplayNames[region] ?? region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Empty state ───────────────────────── */}
      {!hasBoth && (
        <div className={styles.compareEmpty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem' }}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <div className={styles.compareEmptyText}>Select two regions to compare</div>
          <div className={styles.compareEmptyHint}>Choose Region A and Region B above to see a side-by-side analysis.</div>
        </div>
      )}

      {/* ── Summary cards ─────────────────────── */}
      {hasBoth && (
        <>
          <div className={styles.compareMetrics} style={{ marginTop: '1.25rem' }}>
            <div className={`card ${styles.compareSummaryCard}`}>
              <h3 className={`${styles.compareSummaryTitle} ${styles.compareSummaryTitleA}`}>
                {regionDisplayNames[regionA] ?? regionA}
              </h3>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Teachers</span><span className={styles.compareStatValue}>{profileA.totalTeachers}</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Program Access</span><span className={styles.compareStatValue}>{profileA.starAccessRate}%</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Completeness</span><span className={styles.compareStatValue}>{profileA.completeness}%</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Priority Score</span><span className={styles.compareStatValue}>{profileA.priorityScore}</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Avg Experience</span><span className={styles.compareStatValue}>{profileA.avgExperience} yr</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Coverage</span><span className={styles.compareStatValue}>{profileA.coveragePercentage}%</span></div>
            </div>
            <div className={`card ${styles.compareSummaryCard}`}>
              <h3 className={`${styles.compareSummaryTitle} ${styles.compareSummaryTitleB}`}>
                {regionDisplayNames[regionB] ?? regionB}
              </h3>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Teachers</span><span className={styles.compareStatValue}>{profileB.totalTeachers}</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Program Access</span><span className={styles.compareStatValue}>{profileB.starAccessRate}%</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Completeness</span><span className={styles.compareStatValue}>{profileB.completeness}%</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Priority Score</span><span className={styles.compareStatValue}>{profileB.priorityScore}</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Avg Experience</span><span className={styles.compareStatValue}>{profileB.avgExperience} yr</span></div>
              <div className={styles.compareStatRow}><span className={styles.compareStatLabel}>Coverage</span><span className={styles.compareStatValue}>{profileB.coveragePercentage}%</span></div>
            </div>
          </div>

          {/* ── Charts ─────────────────────────── */}
          <div className={styles.chartGrid}>
            {/* Side-by-Side Bar Chart */}
            <div className={`card ${styles.chartCard}`}>
              <h3 className={styles.chartTitle}>Teacher Composition Comparison</h3>
              <p className={styles.chartSubtitle}>Side-by-side breakdown of teacher counts</p>
              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonBarData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
                    <Bar dataKey={nameA} fill="#154597" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey={nameB} fill="#ffbd59" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className={`card ${styles.chartCard}`}>
              <h3 className={styles.chartTitle}>Regional Health Radar</h3>
              <p className={styles.chartSubtitle}>Normalized scores (higher = better)</p>
              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name={nameA} dataKey="A" stroke="#154597" fill="#154597" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={nameB} dataKey="B" stroke="#ffbd59" fill="#ffbd59" fillOpacity={0.2} strokeWidth={2} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Detailed Comparison Table ──────── */}
          <div className="card" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
            <h3 className={styles.chartTitle}>Detailed Metric Comparison</h3>
            <p className={styles.chartSubtitle} style={{ marginBottom: '0.5rem' }}>All key indicators with delta analysis</p>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>{nameA}</th>
                  <th>{nameB}</th>
                  <th>Delta</th>
                </tr>
              </thead>
              <tbody>
                {compRows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.a}</td>
                    <td>{row.b}</td>
                    <td className={row.deltaClass}>{row.deltaLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
