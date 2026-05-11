export type RegionGeometry = {
  center: [number, number];
  polygon: [number, number][];
};

type RegionShape = {
  center: [number, number];
  latRadius: number;
  lngRadius: number;
};

function buildPolygon(shape: RegionShape): [number, number][] {
  const [lat, lng] = shape.center;
  const latRadius = shape.latRadius;
  const lngRadius = shape.lngRadius;

  return [
    [lat + latRadius, lng - lngRadius * 0.45],
    [lat + latRadius * 0.4, lng + lngRadius],
    [lat - latRadius * 0.35, lng + lngRadius * 0.8],
    [lat - latRadius, lng + lngRadius * 0.2],
    [lat - latRadius * 0.55, lng - lngRadius],
    [lat + latRadius * 0.25, lng - lngRadius * 0.9],
  ];
}

const REGION_SHAPES: Record<string, RegionShape> = {
  CAR: { center: [17.33, 121.13], latRadius: 0.72, lngRadius: 0.65 },
  'Region I': { center: [16.1, 120.35], latRadius: 0.75, lngRadius: 0.7 },
  'Region II': { center: [17.6, 121.8], latRadius: 0.85, lngRadius: 0.8 },
  'Region III': { center: [15.35, 120.75], latRadius: 0.72, lngRadius: 0.72 },
  NCR: { center: [14.6, 121.0], latRadius: 0.2, lngRadius: 0.24 },
  'Region IV-A': { center: [14.12, 121.35], latRadius: 0.7, lngRadius: 0.72 },
  'Region IV-B': { center: [12.65, 121.2], latRadius: 1.1, lngRadius: 1.05 },
  'Region V': { center: [13.5, 123.3], latRadius: 0.86, lngRadius: 0.78 },
  'Region VI': { center: [11.1, 122.6], latRadius: 0.74, lngRadius: 0.82 },
  'Region VII': { center: [10.35, 123.9], latRadius: 0.74, lngRadius: 0.72 },
  'Region VIII': { center: [11.75, 124.85], latRadius: 0.82, lngRadius: 0.8 },
  'Region IX': { center: [8.15, 123.55], latRadius: 0.78, lngRadius: 0.86 },
  'Region X': { center: [8.35, 124.7], latRadius: 0.76, lngRadius: 0.84 },
  'Region XI': { center: [7.3, 125.8], latRadius: 0.72, lngRadius: 0.75 },
  'Region XII': { center: [6.7, 124.8], latRadius: 0.72, lngRadius: 0.72 },
  'Region XIII': { center: [9.4, 125.8], latRadius: 0.83, lngRadius: 0.9 },
  BARMM: { center: [7.45, 124.2], latRadius: 0.86, lngRadius: 0.92 },
};

export const REGION_GEOMETRY: Record<string, RegionGeometry> = Object.fromEntries(
  Object.entries(REGION_SHAPES).map(([region, shape]) => [
    region,
    {
      center: shape.center,
      polygon: buildPolygon(shape),
    } satisfies RegionGeometry,
  ])
);
