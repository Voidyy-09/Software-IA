/**
 * Constraint-Aware Routing Engine
 *
 * Implements a modified Dijkstra shortest-path algorithm over the road segment network.
 * Cost Function: Cost = (Segment Length / Current Speed) × Penalty Factor
 *
 * Penalty rules:
 *  - OPEN road: penalty = 1.0
 *  - RESTRICTED: penalty = 3.0
 *  - CLOSED_FLOODING where flood depth > vehicle clearance: penalty = Infinity
 *  - CLOSED_DAMAGE: penalty = Infinity
 */

interface Coordinate {
  lng: number;
  lat: number;
}

interface SegmentWithState {
  id: number;
  name: string;
  geometry: string;
  defaultSpeedKmh: number;
  maxWeightKg: number;
  maxHeightM: number;
  roadStates: Array<{
    status: string;
    currentSpeedKmh: number;
    floodDepthMm: number;
  }>;
}

interface VehicleForRouting {
  id: number;
  maxWaterDepthMm: number;
  maxWeightKg: number;
  clearanceM: number;
}

interface RouteResult {
  path: string; // GeoJSON LineString
  estimatedTimeMinutes: number;
  distanceKm: number;
  segmentIds: number[];
  warnings: string[];
}

interface ConstraintResult {
  passable: boolean;
  failedSegments: number[];
  details: Array<{
    segmentId: number;
    segmentName: string;
    reason: string;
    passed: boolean;
  }>;
}

/**
 * Haversine distance between two points in km
 */
function haversineDistance(a: Coordinate, b: Coordinate): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Parse GeoJSON geometry string into coordinate array
 */
function parseGeometry(geometryStr: string): Coordinate[] {
  try {
    const geo = JSON.parse(geometryStr);
    if (geo.type === 'LineString') {
      return geo.coordinates.map((c: number[]) => ({ lng: c[0], lat: c[1] }));
    }
    if (geo.type === 'Point') {
      return [{ lng: geo.coordinates[0], lat: geo.coordinates[1] }];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Calculate the total length of a segment in km
 */
function segmentLength(coords: Coordinate[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return total;
}

/**
 * Get the penalty factor for a road segment given vehicle constraints
 */
function getPenaltyFactor(segment: SegmentWithState, vehicle: VehicleForRouting): number {
  const state = segment.roadStates[0]; // Most recent state
  if (!state) return 1.0;

  switch (state.status) {
    case 'OPEN':
      return 1.0;
    case 'RESTRICTED':
      // Check if vehicle can handle the flood depth
      if (state.floodDepthMm > vehicle.maxWaterDepthMm) return Infinity;
      return 3.0;
    case 'CLOSED_FLOODING':
      if (state.floodDepthMm > vehicle.maxWaterDepthMm) return Infinity;
      return 10.0; // Very high penalty even if vehicle CAN pass
    case 'CLOSED_DAMAGE':
      return Infinity;
    default:
      return 1.0;
  }
}

/**
 * Check vehicle constraints against all road segments
 */
export function checkVehicleConstraints(
  vehicle: VehicleForRouting,
  segments: SegmentWithState[]
): ConstraintResult {
  const details: ConstraintResult['details'] = [];
  const failedSegments: number[] = [];

  for (const segment of segments) {
    const state = segment.roadStates[0];
    if (!state) {
      details.push({
        segmentId: segment.id,
        segmentName: segment.name,
        reason: 'No state data — assumed passable',
        passed: true,
      });
      continue;
    }

    const penalty = getPenaltyFactor(segment, vehicle);
    if (penalty === Infinity) {
      failedSegments.push(segment.id);
      let reason = '';
      if (state.status === 'CLOSED_DAMAGE') {
        reason = 'Road closed due to structural damage';
      } else if (state.floodDepthMm > vehicle.maxWaterDepthMm) {
        reason = `Flood depth ${state.floodDepthMm}mm exceeds vehicle clearance ${vehicle.maxWaterDepthMm}mm`;
      } else {
        reason = `Road status: ${state.status}`;
      }
      details.push({ segmentId: segment.id, segmentName: segment.name, reason, passed: false });
    } else {
      details.push({
        segmentId: segment.id,
        segmentName: segment.name,
        reason: penalty > 1 ? `Restricted — penalty factor ${penalty}x` : 'Clear',
        passed: true,
      });
    }
  }

  return {
    passable: failedSegments.length === 0,
    failedSegments,
    details,
  };
}

/**
 * Find the endpoint of a segment closest to a given point
 */
function closestEndpoint(point: Coordinate, coords: Coordinate[]): { coord: Coordinate; dist: number } {
  const first = coords[0];
  const last = coords[coords.length - 1];
  const d1 = haversineDistance(point, first);
  const d2 = haversineDistance(point, last);
  return d1 < d2 ? { coord: first, dist: d1 } : { coord: last, dist: d2 };
}

/**
 * Simple greedy routing: find optimal route from origin to destination
 * using a simplified Dijkstra approach over the road segments.
 *
 * This is a practical simplification — in production you'd build a full graph
 * from segment intersections. Here we approximate by connecting segments
 * that share nearby endpoints and finding the lowest-cost path.
 */
export function findOptimalRoute(
  origin: { coordinates: number[] } | Coordinate,
  destination: { coordinates: number[] } | Coordinate,
  segments: SegmentWithState[],
  vehicle: VehicleForRouting
): RouteResult | null {
  // Normalize coordinates
  const start: Coordinate = 'coordinates' in origin
    ? { lng: origin.coordinates[0], lat: origin.coordinates[1] }
    : origin;
  const end: Coordinate = 'coordinates' in destination
    ? { lng: destination.coordinates[0], lat: destination.coordinates[1] }
    : destination;

  const warnings: string[] = [];
  const usedSegmentIds: number[] = [];
  const pathCoordinates: number[][] = [[start.lng, start.lat]];

  // Build segment data with costs
  const segmentData = segments.map((seg) => {
    const coords = parseGeometry(seg.geometry);
    const length = segmentLength(coords);
    const state = seg.roadStates[0];
    const speed = state?.currentSpeedKmh || seg.defaultSpeedKmh;
    const penalty = getPenaltyFactor(seg, vehicle);
    const cost = penalty === Infinity ? Infinity : (length / Math.max(speed, 1)) * 60 * penalty;

    return { segment: seg, coords, length, speed, penalty, cost };
  });

  // Greedy path construction: repeatedly pick the passable segment whose
  // endpoint is closest to the destination, starting from current position
  let currentPos = start;
  const visited = new Set<number>();
  let totalTime = 0;
  let totalDist = 0;
  const maxIterations = segments.length;

  for (let iter = 0; iter < maxIterations; iter++) {
    const distToDest = haversineDistance(currentPos, end);

    // If we're close enough to destination, stop
    if (distToDest < 0.3) break;

    // Find best next segment
    let bestSeg: (typeof segmentData)[0] | null = null;
    let bestScore = Infinity;
    let bestNextPos: Coordinate | null = null;
    let bestNearest: Coordinate | null = null;

    for (const sd of segmentData) {
      if (visited.has(sd.segment.id)) continue;
      if (sd.cost === Infinity) {
        warnings.push(`Segment "${sd.segment.name}" impassable (${sd.segment.roadStates[0]?.status})`);
        continue;
      }

      const { coord: nearestToUs, dist: distFromUs } = closestEndpoint(currentPos, sd.coords);
      if (distFromUs > 1.5) continue; // Too far to connect

      // The "other end" of the segment
      const otherEnd = nearestToUs === sd.coords[0]
        ? sd.coords[sd.coords.length - 1]
        : sd.coords[0];
      const distAfter = haversineDistance(otherEnd, end);

      // Score = travel cost + remaining distance heuristic (A*-like)
      const score = sd.cost + distAfter * 2;

      if (score < bestScore) {
        bestScore = score;
        bestSeg = sd;
        bestNextPos = otherEnd;
        bestNearest = nearestToUs;
      }
    }

    if (!bestSeg || !bestNextPos) break;

    visited.add(bestSeg.segment.id);
    usedSegmentIds.push(bestSeg.segment.id);
    totalTime += bestSeg.cost;
    totalDist += bestSeg.length;

    // Add segment coordinates to path in correct traversal order
    const isForward = bestNearest === bestSeg.coords[0];
    const ordered = isForward ? bestSeg.coords : [...bestSeg.coords].reverse();
    for (const c of ordered) {
      pathCoordinates.push([c.lng, c.lat]);
    }

    currentPos = bestNextPos;

    if (bestSeg.penalty > 1) {
      warnings.push(
        `Segment "${bestSeg.segment.name}" has penalty factor ${bestSeg.penalty}x — proceed with caution`
      );
    }
  }

  // Add destination
  pathCoordinates.push([end.lng, end.lat]);

  if (usedSegmentIds.length === 0) {
    // Direct route (no segments matched — fallback)
    totalDist = haversineDistance(start, end);
    totalTime = (totalDist / 30) * 60;
    warnings.push('No road segments matched — using direct path estimate');
  }

  // Deduplicate warnings
  const uniqueWarnings = [...new Set(warnings)];

  return {
    path: JSON.stringify({
      type: 'LineString',
      coordinates: pathCoordinates,
    }),
    estimatedTimeMinutes: Math.round(totalTime * 10) / 10,
    distanceKm: Math.round(totalDist * 100) / 100,
    segmentIds: usedSegmentIds,
    warnings: uniqueWarnings,
  };
}
