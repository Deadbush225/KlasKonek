export type GeoBoundaryGeometry =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

export type GeoBoundaryFeature = {
  type: 'Feature';
  properties: {
    shapeName: string;
  };
  geometry: GeoBoundaryGeometry;
};

export type GeoBoundaryFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoBoundaryFeature[];
};

export type LeafletPolygonPositions = [number, number][][] | [number, number][][][];

const SHAPE_NAME_TO_REGION_CODE: Record<string, string> = {
  armm: 'BARMM',
  car: 'CAR',
  ncr: 'NCR',
  'ilocos region': 'Region I',
  'cagayan valley': 'Region II',
  'central luzon': 'Region III',
  calabarzon: 'Region IV-A',
  mimaropa: 'Region IV-B',
  'bicol region': 'Region V',
  'western visayas': 'Region VI',
  'central visayas': 'Region VII',
  'eastern visayas': 'Region VIII',
  'zamboanga peninsula': 'Region IX',
  'northern mindanao': 'Region X',
  'davao region': 'Region XI',
  soccsksargen: 'Region XII',
  caraga: 'Region XIII',
};

export function shapeNameToRegionCode(shapeName: string) {
  return SHAPE_NAME_TO_REGION_CODE[shapeName.trim().toLowerCase()] ?? null;
}

function toLatLngRing(ring: number[][]) {
  return ring
    .filter((pair) => pair.length >= 2)
    .map((pair) => [pair[1], pair[0]] as [number, number]);
}

export function geometryToLeafletPositions(geometry: GeoBoundaryGeometry): LeafletPolygonPositions | null {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => toLatLngRing(ring));
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((polygon) => polygon.map((ring) => toLatLngRing(ring)));
  }

  return null;
}
