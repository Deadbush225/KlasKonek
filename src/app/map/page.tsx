'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import mapStyles from './map.module.css';

type MapSeverity = 'low' | 'medium' | 'high' | 'critical';
type ChoroplethMetric = 'teacherDensity' | 'averageExperience' | 'underservedScore';
type TemporalGranularity = 'monthly' | 'quarterly';

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

type MapApiResponse = {
  generatedAt: string;
  regions: RegionMapPoint[];
  actionableInsights: ActionableInsight[];
  timelineMonths: TemporalFrame[];
};

type TemporalFrame = {
  periodStart: string;
  label: string;
  regions: RegionMapPoint[];
};

type MetricLegendItem = {
  color: string;
  label: string;
};

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function metricLabel(metric: ChoroplethMetric) {
  if (metric === 'teacherDensity') {
    return 'Teacher Density';
  }

  if (metric === 'averageExperience') {
    return 'Average Experience';
  }

  return 'Underserved Score';
}

function getMetricValue(region: RegionMapPoint, metric: ChoroplethMetric) {
  if (metric === 'teacherDensity') {
    return region.teacherDensity;
  }

  if (metric === 'averageExperience') {
    return region.averageExperience;
  }

  return region.underservedScore;
}

function getChoroplethColor(metric: ChoroplethMetric, normalizedValue: number) {
  const value = clamp(normalizedValue, 0, 1);

  if (metric === 'underservedScore') {
    if (value >= 0.85) return '#8b0000';
    if (value >= 0.65) return '#c62828';
    if (value >= 0.45) return '#ef6c00';
    if (value >= 0.25) return '#f9a825';
    return '#2e7d32';
  }

  if (value >= 0.85) return '#1b5e20';
  if (value >= 0.65) return '#2e7d32';
  if (value >= 0.45) return '#f9a825';
  if (value >= 0.25) return '#ef6c00';
  return '#b71c1c';
}

function formatLegendValue(metric: ChoroplethMetric, value: number) {
  if (metric === 'teacherDensity') {
    return `${round(value, 2)} teachers/div`;
  }

  if (metric === 'averageExperience') {
    return `${round(value, 2)} yrs`;
  }

  return `${round(value, 2)} score`;
}

function buildMetricLegend(metric: ChoroplethMetric, minValue: number, maxValue: number): MetricLegendItem[] {
  const normalizedStops = [0, 0.25, 0.45, 0.65, 0.85, 1];
  const range = Math.max(0.0001, maxValue - minValue);

  return normalizedStops.slice(0, -1).map((start, index) => {
    const end = normalizedStops[index + 1];
    const midPoint = (start + end) / 2;
    const color = getChoroplethColor(metric, midPoint);
    const fromValue = minValue + (range * start);
    const toValue = minValue + (range * end);

    return {
      color,
      label: `${formatLegendValue(metric, fromValue)} - ${formatLegendValue(metric, toValue)}`,
    };
  });
}

function toQuarterLabel(periodStart: string) {
  const date = new Date(`${periodStart}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown Quarter';
  }

  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${date.getUTCFullYear()}`;
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

function buildQuarterlyFrames(monthlyFrames: TemporalFrame[]) {
  if (monthlyFrames.length === 0) {
    return [];
  }

  const grouped = new Map<string, TemporalFrame[]>();

  for (const frame of monthlyFrames) {
    const label = toQuarterLabel(frame.periodStart);
    const bucket = grouped.get(label) ?? [];
    bucket.push(frame);
    grouped.set(label, bucket);
  }

  return [...grouped.entries()].map(([label, frames]) => {
    const byRegion = new Map<string, {
      last: RegionMapPoint;
      count: number;
      teacherCount: number;
      teacherDensity: number;
      averageExperience: number;
      underservedScore: number;
      divisionCoverageRate: number;
    }>();

    for (const frame of frames) {
      for (const region of frame.regions) {
        const existing = byRegion.get(region.region);

        if (!existing) {
          byRegion.set(region.region, {
            last: region,
            count: 1,
            teacherCount: region.teacherCount,
            teacherDensity: region.teacherDensity,
            averageExperience: region.averageExperience,
            underservedScore: region.underservedScore,
            divisionCoverageRate: region.divisionCoverageRate,
          });
          continue;
        }

        byRegion.set(region.region, {
          last: region,
          count: existing.count + 1,
          teacherCount: existing.teacherCount + region.teacherCount,
          teacherDensity: existing.teacherDensity + region.teacherDensity,
          averageExperience: existing.averageExperience + region.averageExperience,
          underservedScore: existing.underservedScore + region.underservedScore,
          divisionCoverageRate: existing.divisionCoverageRate + region.divisionCoverageRate,
        });
      }
    }

    const regions = [...byRegion.values()].map((entry) => {
      const teacherCount = Math.round(entry.teacherCount / entry.count);
      const teacherDensity = round(entry.teacherDensity / entry.count);
      const averageExperience = round(entry.averageExperience / entry.count);
      const underservedScore = round(entry.underservedScore / entry.count);
      const divisionCoverageRate = round(entry.divisionCoverageRate / entry.count);

      return {
        ...entry.last,
        teacherCount,
        teacherDensity,
        averageExperience,
        underservedScore,
        divisionCoverageRate,
        severity: toSeverity(teacherCount, underservedScore),
      } satisfies RegionMapPoint;
    });

    return {
      periodStart: frames[0]?.periodStart ?? '',
      label,
      regions,
    } satisfies TemporalFrame;
  });
}

function deriveInsightsFromRegions(regions: RegionMapPoint[]): ActionableInsight[] {
  if (regions.length === 0) {
    return [];
  }

  return [...regions]
    .sort((a, b) => b.underservedScore - a.underservedScore || a.teacherCount - b.teacherCount)
    .slice(0, 3)
    .map((region) => {
      const level: ActionableInsight['level'] = region.underservedScore >= 60
        ? 'critical'
        : region.underservedScore >= 40
          ? 'warning'
          : 'stable';

      return {
        id: region.region,
        title: `${region.displayName} priority score ${region.underservedScore}`,
        description: `${region.teacherCount} teachers, density ${region.teacherDensity} per division, experience ${region.averageExperience} years.`,
        level,
      };
    });
}

// Dynamically import Map to prevent SSR errors with Leaflet accessing window
const MapWithNoSSR = dynamic(() => import('@/components/MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className={mapStyles.loadingMap}>
      <div className={mapStyles.mapSkeleton}>
        <div className={mapStyles.skeletonShimmer} />
        <span className={mapStyles.skeletonTitle}>Loading Philippine Regional Map</span>
        <span className={mapStyles.skeletonHint}>Preparing geospatial layers and regional markers...</span>
      </div>
    </div>
  )
});

export default function RegionalMapPage() {
  const [payload, setPayload] = useState<MapApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<ChoroplethMetric>('underservedScore');
  const [granularity, setGranularity] = useState<TemporalGranularity>('quarterly');
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadMapData() {
      try {
        const response = await fetch('/api/map/regions', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Unable to load regional map data.');
        }

        const data = (await response.json()) as MapApiResponse;

        if (isActive) {
          setPayload(data);
          setError(null);
        }
      } catch {
        if (isActive) {
          setError('Unable to load live regional data. Please refresh and try again.');
        }
      }
    }

    loadMapData();

    return () => {
      isActive = false;
    };
  }, []);

  const monthlyFrames = payload?.timelineMonths ?? [];
  const frames = granularity === 'quarterly'
    ? buildQuarterlyFrames(monthlyFrames)
    : monthlyFrames;
  const activeFrame = frames[frameIndex] ?? null;
  const displayRegions = activeFrame?.regions ?? payload?.regions ?? [];
  const displayInsights = deriveInsightsFromRegions(displayRegions);
  const metricValues = displayRegions.map((item) => getMetricValue(item, metric));
  const metricMin = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  const metricMax = metricValues.length > 0 ? Math.max(...metricValues) : 1;
  const metricLegend = buildMetricLegend(metric, metricMin, metricMax);

  useEffect(() => {
    if (frames.length === 0) {
      setFrameIndex(0);
      return;
    }

    setFrameIndex(frames.length - 1);
  }, [granularity, frames.length]);

  return (
    <div className={mapStyles.pageContainer}>
      <div className={mapStyles.header}>
        <h1 className={mapStyles.title}>Regional Teacher Profile Map</h1>
        <p className={mapStyles.subtitle}>
          Philippine-focused geospatial view of science and mathematics teacher profiles. 
          Identify underserved areas and generate actionable insights to inform strategic delivery of STAR programs.
        </p>
      </div>

      <section className={`${mapStyles.controlsPanel} card`}>
        <div className={mapStyles.controlRow}>
          <label className={mapStyles.controlField}>
            Choropleth Metric
            <select value={metric} onChange={(event) => setMetric(event.target.value as ChoroplethMetric)}>
              <option value="teacherDensity">Teacher Density</option>
              <option value="averageExperience">Average Experience</option>
              <option value="underservedScore">Underserved Score</option>
            </select>
          </label>

          <label className={mapStyles.controlField}>
            Historical Cadence
            <select value={granularity} onChange={(event) => setGranularity(event.target.value as TemporalGranularity)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </label>
        </div>

        <div className={mapStyles.sliderRow}>
          <div>
            <strong>Historical Timeline</strong>
            <p className={mapStyles.sliderHint}>
              Slide through stored {granularity} snapshots from the regional history table.
            </p>
          </div>
          <strong>{activeFrame?.label ?? 'Current Snapshot'}</strong>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, frames.length - 1)}
          value={frameIndex}
          onChange={(event) => setFrameIndex(Number(event.target.value))}
          className={mapStyles.timeSlider}
          disabled={frames.length <= 1}
        />

        <div className={mapStyles.legendInline}>
          <span>Active Layer: {metricLabel(metric)}</span>
          <span>{displayRegions.length} regions visible</span>
        </div>

        <div className={mapStyles.metricLegend}>
          {metricLegend.map((item, index) => (
            <span key={`${index}-${item.label}`} className={mapStyles.legendItem}>
              <span className={mapStyles.legendSwatch} style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </section>

      <div className={mapStyles.contentGrid}>
        <div className={`${mapStyles.mapContainer} card`}>
          <MapWithNoSSR
            regions={displayRegions}
            activeMetric={metric}
            activeTimeLabel={activeFrame?.label ?? 'Current Snapshot'}
          />
        </div>

        <div className={mapStyles.sidebar}>
          <div className="card">
            <h3 className={mapStyles.sidebarTitle}>Actionable Insights</h3>
            {error ? <p>{error}</p> : null}

            {!payload ? (
              <p>Loading live regional insights...</p>
            ) : displayInsights.length === 0 ? (
              <p>No actionable insights are available yet.</p>
            ) : (
              <ul className={mapStyles.insightList}>
                {displayInsights.map((item) => (
                  <li
                    key={item.id}
                    className={
                      item.level === 'critical'
                        ? mapStyles.critical
                        : item.level === 'warning'
                          ? mapStyles.warning
                          : mapStyles.stable
                    }
                  >
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
