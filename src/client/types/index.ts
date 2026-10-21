// ============================================
// Shared TypeScript interfaces for the
// Disaster Response System
// ============================================

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

// --- Enums ---
export type RoadStatus = 'OPEN' | 'CLOSED_FLOODING' | 'CLOSED_DAMAGE' | 'RESTRICTED';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'NEW' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED';
export type VehicleStatus = 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'OFFLINE';
export type VehicleType = 'AMPHIBIOUS_TRUCK' | 'BOAT' | '4X4_AMBULANCE' | 'HELICOPTER' | 'STANDARD';

// --- Models ---
export interface Agency {
  id: number;
  name: string;
  contactInfo: string;
  jurisdictionBoundary: string;
}

export interface RoadSegment {
  id: number;
  name: string;
  classification: string;
  geometry: string;
  defaultSpeedKmh: number;
  maxWeightKg: number;
  maxHeightM: number;
  isOneWay: boolean;
  roadStates: RoadState[];
}

export interface RoadState {
  id: number;
  segmentId: number;
  status: RoadStatus;
  currentSpeedKmh: number;
  restrictionNotes: string | null;
  floodDepthMm: number;
  lastUpdated: string;
  updatedBySource: string;
}

export interface HazardArea {
  id: number;
  type: string;
  severityIndex: number;
  geometry: string;
  timestamp: string;
}

export interface IncidentReport {
  id: number;
  reportedLocation: string;
  type: string;
  description: string;
  priority: PriorityLevel;
  status: IncidentStatus;
  timestamp: string;
  missions: MissionAssignment[];
}

export interface Vehicle {
  id: number;
  agencyId: number;
  agency?: Agency;
  callSign: string;
  type: VehicleType;
  status: VehicleStatus;
  defaultAssetLocation: string;
  maxWeightKg: number;
  maxWaterDepthMm: number;
  clearanceM: number;
  telemetry: VehicleTelemetry | null;
  equipment: VehicleEquipmentWithType[];
  missions?: MissionAssignment[];
}

export interface VehicleTelemetry {
  id: number;
  vehicleId: number;
  location: string;
  currentSpeedKmh: number;
  heading: number;
  fuelLevelPercent: number;
  lastSeen: string;
}

export interface EquipmentType {
  id: number;
  name: string;
  description: string | null;
}

export interface VehicleEquipmentWithType {
  vehicleId: number;
  equipmentId: number;
  quantity: number;
  equipment: EquipmentType;
}

export interface MissionAssignment {
  id: number;
  incidentId: number;
  vehicleId: number;
  assignedTimestamp: string;
  incident?: IncidentReport;
  vehicle?: Vehicle;
  routes: GeneratedRoute[];
}

export interface GeneratedRoute {
  id: number;
  missionId: number;
  pathGeometry: string;
  origin: string;
  destination: string;
  etaTimestamp: string;
  status: string;
  failureReason: string | null;
  generatedAt: string;
}

// --- WebSocket messages ---
export interface WSMessage {
  type: string;
  payload: any;
}

export interface TelemetryUpdate {
  vehicleId: number;
  callSign: string;
  type: VehicleType;
  status: VehicleStatus;
  location: [number, number];
  speed: number;
  heading: number;
  fuelLevel: number;
}

// --- Satellite ---
export interface SatelliteDetection {
  id: string;
  type: string;
  confidence: number;
  estimatedDepthMm: number;
  affectedArea: GeoJSONPolygon | GeoJSONPoint;
  affectedSegmentIds: number[];
  description: string;
  imagery: string;
}

export interface SatelliteAnalysisResult {
  analysisId: string;
  timestamp: string;
  totalDetections: number;
  confidenceThreshold: number;
  floodDepthThresholdMm: number;
  detections: SatelliteDetection[];
  metadata: {
    satelliteId: string;
    passTime: string;
    resolution: string;
    coverageArea: string;
  };
}

// --- Dispatch ---
export interface DispatchRecommendation {
  vehicle: {
    id: number;
    callSign: string;
    type: string;
    maxWaterDepthMm: number;
    maxWeightKg: number;
    clearanceM: number;
    fuelLevel: number;
    equipment: { name: string; quantity: number }[];
  };
  constraintCheck: {
    passable: boolean;
    failedSegments: number[];
    details: Array<{
      segmentId: number;
      segmentName: string;
      reason: string;
      passed: boolean;
    }>;
  };
  route: {
    pathGeometry: string;
    estimatedTimeMinutes: number;
    distanceKm: number;
    segmentsUsed: number[];
    hazardWarnings: string[];
  } | null;
  score: number;
}
