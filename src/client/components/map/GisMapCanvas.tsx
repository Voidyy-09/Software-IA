import React, { useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { RoadPolylines } from './RoadPolylines';
import { HazardOverlays } from './HazardOverlays';
import { VehicleMarkers } from './VehicleMarkers';
import { IncidentMarkers } from './IncidentMarkers';
import { RoutePolyline } from './RoutePolyline';
import { BaseLocations, BASE_LOCATIONS } from './BaseLocations';
import {
  Layers,
  RotateCcw,
  Zap,
  Waves,
  Eye,
  Maximize2,
  MapPin,
  Truck,
  AlertCircle,
  Building2,
  Navigation,
  Globe,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import L from 'leaflet';

// Center coordinates for Mumbai Vidyavihar / Kurla
const DEFAULT_CENTER: [number, number] = [19.0732, 72.8850];
const DEFAULT_ZOOM = 13.5;

function MapControls({
  onFitBounds,
  onResetView,
}: {
  onFitBounds: () => void;
  onResetView: () => void;
}) {
  return (
    <div className="leaflet-top leaflet-right !mt-14 !mr-3 z-20 flex flex-col gap-1.5">
      <div className="leaflet-bar border-0 shadow-xl flex flex-col gap-1.5 bg-transparent">
        <button
          onClick={onResetView}
          className="bg-slate-900/95 hover:bg-slate-800 text-cyan-400 p-2 rounded-lg border border-slate-700/80 flex items-center justify-center transition-all shadow-lg group backdrop-blur-md"
          title="Reset to Kurla/Vidyavihar Center"
        >
          <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
        </button>
        <button
          onClick={onFitBounds}
          className="bg-slate-900/95 hover:bg-slate-800 text-cyan-400 p-2 rounded-lg border border-slate-700/80 flex items-center justify-center transition-all shadow-lg group backdrop-blur-md"
          title="Auto-Fit Active Mission Grid"
        >
          <Maximize2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}

// Controller component inside MapContainer to execute imperative map operations
function MapCameraController({
  triggerFit,
  triggerReset,
}: {
  triggerFit: number;
  triggerReset: number;
}) {
  const map = useMap();
  const { vehicles, incidents, roadSegments } = useEmergencyStore();

  React.useEffect(() => {
    if (triggerReset > 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
    }
  }, [triggerReset, map]);

  React.useEffect(() => {
    if (triggerFit > 0) {
      const bounds = L.latLngBounds([DEFAULT_CENTER]);

      // Add vehicles
      vehicles.forEach((v) => {
        try {
          if (v.telemetry?.location) {
            const parsed = JSON.parse(v.telemetry.location);
            bounds.extend([parsed.coordinates[1], parsed.coordinates[0]]);
          } else if (v.defaultAssetLocation) {
            const parsed = JSON.parse(v.defaultAssetLocation);
            bounds.extend([parsed.coordinates[1], parsed.coordinates[0]]);
          }
        } catch {}
      });

      // Add incidents
      incidents.forEach((inc) => {
        try {
          const parsed = JSON.parse(inc.reportedLocation);
          bounds.extend([parsed.coordinates[1], parsed.coordinates[0]]);
        } catch {}
      });

      // Add bases
      BASE_LOCATIONS.forEach((b) => {
        bounds.extend(b.position);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], animate: true, maxZoom: 15 });
      }
    }
  }, [triggerFit, map, vehicles, incidents]);

  return null;
}

export const GisMapCanvas: React.FC = () => {
  const {
    roadSegments,
    updateRoadSegmentStatus,
    addNotification,
    vehicles,
    incidents,
    previewRoute,
    isDispatchModalOpen,
    activeMapLayer,
    setActiveMapLayer,
    visibleLayers,
    toggleLayer,
  } = useEmergencyStore();

  const [showLegend, setShowLegend] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isSimulatingFlood, setIsSimulatingFlood] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Trigger rapid simulation of LBS Marg or Mithi flood
  const handleQuickFloodSimulation = async () => {
    setIsSimulatingFlood(true);
    try {
      const lbsSegment =
        roadSegments.find(
          (s) => s.name.toLowerCase().includes('lbs') || s.name.toLowerCase().includes('kurla')
        ) || roadSegments[0];

      if (!lbsSegment) return;

      const currentState = lbsSegment.roadStates[0];
      const isFlooded = currentState?.status === 'CLOSED_FLOODING';
      const targetStatus = isFlooded ? 'OPEN' : 'CLOSED_FLOODING';
      const targetDepth = isFlooded ? 0 : 920;

      const res = await fetch(`/api/roads/segments/${lbsSegment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          floodDepthMm: targetDepth,
          updatedBySource: 'SIMULATION_OVERRIDE',
          restrictionNotes: isFlooded
            ? 'Water receded. Road declared passable.'
            : 'FLASH FLOOD EMERGENCY: Water depth reached 920mm. High current risk.',
        }),
      });

      if (res.ok) {
        updateRoadSegmentStatus(lbsSegment.id, targetStatus, targetDepth);
        addNotification({
          id: `sim-${Date.now()}`,
          type: targetStatus === 'CLOSED_FLOODING' ? 'critical' : 'success',
          title: `Infrastructure Disruption Simulated`,
          message: `${lbsSegment.name} ${
            targetStatus === 'CLOSED_FLOODING' ? 'submerged under 920mm water' : 'cleared'
          }. Dynamic reroute algorithms evaluated.`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setIsSimulatingFlood(false);
    }
  };

  const floodedCount = roadSegments.filter((s) =>
    s.roadStates.some((st) => st.status === 'CLOSED_FLOODING' || st.status === 'CLOSED_DAMAGE')
  ).length;

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl isolate z-0">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ZoomControl position="topright" />
        <MapControls
          onFitBounds={() => setFitTrigger((prev) => prev + 1)}
          onResetView={() => setResetTrigger((prev) => prev + 1)}
        />
        <MapCameraController triggerFit={fitTrigger} triggerReset={resetTrigger} />

        {/* Dynamic Basemap Tile Provider */}
        {activeMapLayer === 'dark' && (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
        )}
        {activeMapLayer === 'satellite' && (
          <TileLayer
            attribution='&copy; Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}
        {activeMapLayer === 'street' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Dynamic Map Tactical Overlays */}
        {visibleLayers.hazards && <HazardOverlays />}
        {visibleLayers.roads && <RoadPolylines />}
        {visibleLayers.bases && <BaseLocations />}
        {visibleLayers.routes && <RoutePolyline />}
        {visibleLayers.fleets && <VehicleMarkers />}
        {visibleLayers.incidents && <IncidentMarkers />}
      </MapContainer>

      {/* Floating Tactical Controls - Top Left */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="tactical"
          onClick={handleQuickFloodSimulation}
          disabled={isSimulatingFlood}
          className="text-xs bg-slate-950/95 backdrop-blur-md shadow-xl border border-slate-700/80"
        >
          <Zap className="h-3.5 w-3.5 mr-1 text-amber-400" />
          <span>{isSimulatingFlood ? 'Calculating...' : '⚡ Trigger Flood Scenario'}</span>
        </Button>

        {/* Map Style Selector */}
        <div className="flex items-center bg-slate-950/95 border border-slate-700/80 rounded-lg p-0.5 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setActiveMapLayer('dark')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeMapLayer === 'dark'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="CartoDB Tactical Dark Map"
          >
            🌙 Dark
          </button>
          <button
            onClick={() => setActiveMapLayer('satellite')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeMapLayer === 'satellite'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Satellite Optical & SAR View"
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setActiveMapLayer('street')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeMapLayer === 'street'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="OpenStreetMap Navigation Layer"
          >
            🗺️ Street
          </button>
        </div>

        {/* Layer Visibility Toggle Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="text-xs bg-slate-950/90 backdrop-blur-md border border-slate-700/80"
          >
            <Layers className="h-3.5 w-3.5 mr-1 text-cyan-400" />
            <span>Tactical Layers</span>
          </Button>

          {showLayerMenu && (
            <div className="absolute top-10 left-0 bg-slate-950/98 border border-slate-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-md min-w-[190px] z-30 space-y-1.5 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-1 border-b border-slate-800 pb-1 mb-1">
                Toggle Layer Visibility
              </div>
              <label className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Fleet Units ({vehicles.length})</span>
                </span>
                <input
                  type="checkbox"
                  checked={visibleLayers.fleets}
                  onChange={() => toggleLayer('fleets')}
                  className="rounded border-slate-700 text-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  <span>Incidents ({incidents.length})</span>
                </span>
                <input
                  type="checkbox"
                  checked={visibleLayers.incidents}
                  onChange={() => toggleLayer('incidents')}
                  className="rounded border-slate-700 text-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Road Network ({roadSegments.length})</span>
                </span>
                <input
                  type="checkbox"
                  checked={visibleLayers.roads}
                  onChange={() => toggleLayer('roads')}
                  className="rounded border-slate-700 text-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5 text-amber-400" />
                  <span>Flood Hazards</span>
                </span>
                <input
                  type="checkbox"
                  checked={visibleLayers.hazards}
                  onChange={() => toggleLayer('hazards')}
                  className="rounded border-slate-700 text-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Command Bases</span>
                </span>
                <input
                  type="checkbox"
                  checked={visibleLayers.bases}
                  onChange={() => toggleLayer('bases')}
                  className="rounded border-slate-700 text-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Mission Routes</span>
                </span>
                <input
                  type="checkbox"
                  checked={visibleLayers.routes}
                  onChange={() => toggleLayer('routes')}
                  className="rounded border-slate-700 text-cyan-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Legend Toggle Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLegend(!showLegend)}
          className="text-xs bg-slate-950/90 backdrop-blur-md border border-slate-700/80"
        >
          <Eye className="h-3.5 w-3.5 mr-1 text-cyan-400" />
          <span>{showLegend ? 'Hide Legend' : 'Show Legend'}</span>
        </Button>
      </div>

      {/* Floating Tactical Status Bar - Top Center / Banner */}
      {previewRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-cyan-950/95 border border-cyan-400/50 rounded-xl px-4 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-3 font-mono text-xs text-cyan-200">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-bold">{previewRoute.callSign || 'OPTIMAL ROUTE PREVIEW'}</span>
          {previewRoute.estimatedTimeMinutes && (
            <span className="bg-cyan-900/80 px-2 py-0.5 rounded text-[11px] text-cyan-300 font-bold border border-cyan-500/30">
              ETA: {previewRoute.estimatedTimeMinutes}m
            </span>
          )}
          {previewRoute.distanceKm && (
            <span className="text-slate-300 text-[11px]">{previewRoute.distanceKm} km</span>
          )}
        </div>
      )}

      {/* Tactical Map Legend - Bottom Left (Cleaned z-index and hidden when dispatch modal is open) */}
      {showLegend && !isDispatchModalOpen && (
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 text-xs shadow-2xl max-w-xs transition-all">
          <div className="font-bold uppercase tracking-wider text-[11px] text-cyan-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              GIS Tactical Layer Map
            </span>
            <span className="text-[9px] font-mono text-slate-500">KURLA-VIDYAVIHAR</span>
          </div>
          <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 flex items-center justify-center rounded bg-indigo-950 border border-indigo-400 text-[9px]">
                🏢
              </span>
              <span>Command Base / Triage Hospital</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]"></span>
              <span>Passable Road (OPEN)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-red-500 inline-block shadow-[0_0_6px_#ef4444]"></span>
              <span>Submerged Road (FLOODED)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-amber-500 inline-block shadow-[0_0_6px_#f59e0b]"></span>
              <span>Restricted / Slow Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500 inline-block"></span>
              <span>Hazard Zone (Mithi River Surge)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500/40 border border-cyan-400 inline-block"></span>
              <span>Active Rescue Vehicle (Live GPS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-cyan-400 inline-block shadow-[0_0_6px_#06b6d4]"></span>
              <span>Mission Optimal Rescue Route</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Summary Card - Bottom Right (Hidden during modal) */}
      {!isDispatchModalOpen && (
        <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-3 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2 text-xs font-mono shadow-2xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Fleets:</span>
            <span className="font-bold text-white">{vehicles.length} Units</span>
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-slate-400">Flooded:</span>
            <span className="font-bold text-red-300">{floodedCount} Roads</span>
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Pending:</span>
            <span className="font-bold text-amber-300">
              {incidents.filter((i) => i.status !== 'RESOLVED').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
