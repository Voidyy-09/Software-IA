import React, { useEffect, useState } from 'react';
import { useEmergencyStore } from './store/useEmergencyStore';
import { useWebSocket } from './hooks/useWebSocket';
import { CommandHeader } from './components/layout/CommandHeader';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { NotificationBanner } from './components/layout/NotificationBanner';
import { GisMapCanvas } from './components/map/GisMapCanvas';
import { IncidentQueue } from './components/incidents/IncidentQueue';
import { DispatchModal } from './components/dispatch/DispatchModal';
import { SatelliteWorkbench } from './components/satellite/SatelliteWorkbench';
import { FleetTable } from './components/fleet/FleetTable';
import { AnalyticsHub } from './components/analytics/AnalyticsHub';

export const App: React.FC = () => {
  // Initialize WebSocket connection
  useWebSocket();

  const {
    activeTab,
    setIncidents,
    setVehicles,
    setRoadSegments,
    setHazardAreas,
  } = useEmergencyStore();

  const [isLoading, setIsLoading] = useState(true);

  // Initial data bootstrap
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, vehRes, roadRes, hazardRes] = await Promise.all([
          fetch('/api/incidents'),
          fetch('/api/vehicles'),
          fetch('/api/roads/segments'),
          fetch('/api/roads/hazards'),
        ]);

        if (incRes.ok) {
          const incData = await incRes.json();
          setIncidents(incData);
        }

        if (vehRes.ok) {
          const vehData = await vehRes.json();
          setVehicles(vehData);

          // Seed immediate telemetry state so markers render with live position
          const initialTel = vehData
            .filter((v: any) => v.telemetry)
            .map((v: any) => {
              let loc: [number, number] = [72.87, 19.07];
              try {
                const parsed = JSON.parse(v.telemetry.location || v.defaultAssetLocation);
                loc = parsed.coordinates;
              } catch {}
              return {
                vehicleId: v.id,
                callSign: v.callSign,
                type: v.type,
                status: v.status,
                location: loc,
                speed: v.telemetry.currentSpeedKmh || 0,
                heading: v.telemetry.heading || 0,
                fuelLevel: v.telemetry.fuelLevelPercent ?? 100,
              };
            });
          if (initialTel.length > 0) {
            useEmergencyStore.getState().updateTelemetry(initialTel);
          }
        }

        if (roadRes.ok) {
          const roadData = await roadRes.json();
          setRoadSegments(Array.isArray(roadData) ? roadData : roadData.segments || []);
        }

        if (hazardRes.ok) {
          const hazardData = await hazardRes.json();
          if (Array.isArray(hazardData)) {
            setHazardAreas(hazardData);
          }
        }
      } catch (err) {
        console.error('Failed to load initial mission data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setIncidents, setVehicles, setRoadSegments, setHazardAreas]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Tactical Header */}
      <CommandHeader />

      {/* 4-Tab Navigation */}
      <NavigationTabs />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-pulse">
              <span className="text-2xl">🛰️</span>
            </div>
            <div className="text-center font-mono">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Initializing Tactical Command Environment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to Vidyavihar/Kurla GIS mesh & telemetry feeds...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab 1: Live Incident & Map Command Center */}
            {activeTab === 'map' && (
              <div className="flex-1 flex flex-col lg:flex-row p-3 gap-3 h-[calc(100vh-115px)] overflow-hidden">
                {/* Left: Incident Queue */}
                <div className="w-full lg:w-96 shrink-0 h-72 lg:h-full">
                  <IncidentQueue />
                </div>

                {/* Right: Interactive GIS Map Canvas */}
                <div className="flex-1 h-full min-h-[400px]">
                  <GisMapCanvas />
                </div>
              </div>
            )}

            {/* Tab 2: AI Satellite Scanner */}
            {activeTab === 'satellite' && <SatelliteWorkbench />}

            {/* Tab 3: Fleet Telemetry & Capabilities */}
            {activeTab === 'fleet' && <FleetTable />}

            {/* Tab 4: Mission Analytics & Historical Logs */}
            {activeTab === 'analytics' && <AnalyticsHub />}
          </>
        )}
      </main>

      {/* Dispatch Protocol Modal */}
      <DispatchModal />

      {/* Real-time Alert Notification Banner */}
      <NotificationBanner />
    </div>
  );
};

export default App;
