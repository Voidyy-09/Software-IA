import { create } from 'zustand';
import type {
  IncidentReport,
  Vehicle,
  RoadSegment,
  HazardArea,
  TelemetryUpdate,
  SatelliteDetection,
} from '../types';

interface EmergencyState {
  // Data
  incidents: IncidentReport[];
  vehicles: Vehicle[];
  roadSegments: RoadSegment[];
  hazardAreas: HazardArea[];
  telemetryUpdates: TelemetryUpdate[];
  notifications: Notification[];
  satelliteDetections: SatelliteDetection[];

  // UI State
  activeTab: string;
  selectedIncidentId: number | null;
  selectedVehicleId: number | null;
  isDispatchModalOpen: boolean;
  isConnected: boolean;

  // Active Route Preview & Map Settings
  previewRoute: {
    pathGeometry: string;
    callSign?: string;
    isFailed?: boolean;
    failureReason?: string;
    estimatedTimeMinutes?: number;
    distanceKm?: number;
  } | null;
  activeMapLayer: 'dark' | 'satellite' | 'street';
  visibleLayers: {
    fleets: boolean;
    incidents: boolean;
    roads: boolean;
    hazards: boolean;
    bases: boolean;
    routes: boolean;
  };

  // Golden Hour
  goldenHourStart: Date;
  goldenHourRemaining: number;

  // Actions
  setIncidents: (incidents: IncidentReport[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setRoadSegments: (segments: RoadSegment[]) => void;
  setHazardAreas: (areas: HazardArea[]) => void;
  updateTelemetry: (updates: TelemetryUpdate[]) => void;
  setSatelliteDetections: (detections: SatelliteDetection[]) => void;

  setActiveTab: (tab: string) => void;
  setSelectedIncident: (id: number | null) => void;
  setSelectedVehicle: (id: number | null) => void;
  setDispatchModalOpen: (open: boolean) => void;
  setConnected: (connected: boolean) => void;
  setGoldenHourRemaining: (seconds: number) => void;

  setPreviewRoute: (route: EmergencyState['previewRoute']) => void;
  setActiveMapLayer: (layer: 'dark' | 'satellite' | 'street') => void;
  toggleLayer: (layerKey: keyof EmergencyState['visibleLayers']) => void;

  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;

  // Update road segment status locally
  updateRoadSegmentStatus: (segmentId: number, status: string, floodDepthMm: number) => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  // Initial state
  incidents: [],
  vehicles: [],
  roadSegments: [],
  hazardAreas: [],
  telemetryUpdates: [],
  notifications: [],
  satelliteDetections: [],

  activeTab: 'map',
  selectedIncidentId: null,
  selectedVehicleId: null,
  isDispatchModalOpen: false,
  isConnected: false,

  previewRoute: null,
  activeMapLayer: 'dark',
  visibleLayers: {
    fleets: true,
    incidents: true,
    roads: true,
    hazards: true,
    bases: true,
    routes: true,
  },

  goldenHourStart: new Date(),
  goldenHourRemaining: 60 * 60, // 1 hour in seconds

  // Actions
  setIncidents: (incidents) => set({ incidents }),
  setVehicles: (vehicles) => set({ vehicles }),
  setRoadSegments: (segments) => set({ roadSegments: segments }),
  setHazardAreas: (areas) => set({ hazardAreas: areas }),
  updateTelemetry: (updates) => set({ telemetryUpdates: updates }),
  setSatelliteDetections: (detections) => set({ satelliteDetections: detections }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedIncident: (id) => set({ selectedIncidentId: id }),
  setSelectedVehicle: (id) => set({ selectedVehicleId: id }),
  setDispatchModalOpen: (open) => set({ isDispatchModalOpen: open }),
  setConnected: (connected) => set({ isConnected: connected }),
  setGoldenHourRemaining: (seconds) => set({ goldenHourRemaining: seconds }),

  setPreviewRoute: (route) => set({ previewRoute: route }),
  setActiveMapLayer: (layer) => set({ activeMapLayer: layer }),
  toggleLayer: (layerKey) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerKey]: !state.visibleLayers[layerKey],
      },
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),
  clearNotifications: () => set({ notifications: [] }),

  updateRoadSegmentStatus: (segmentId, status, floodDepthMm) =>
    set((state) => ({
      roadSegments: state.roadSegments.map((seg) =>
        seg.id === segmentId
          ? {
              ...seg,
              roadStates: [
                {
                  ...seg.roadStates[0],
                  status: status as any,
                  floodDepthMm,
                  lastUpdated: new Date().toISOString(),
                },
              ],
            }
          : seg
      ),
    })),
}));
