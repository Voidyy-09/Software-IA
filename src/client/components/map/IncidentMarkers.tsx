import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { getPriorityConfig } from '../../lib/utils';
import type { IncidentReport } from '../../types';
import { Send, AlertTriangle, Users } from 'lucide-react';

export const IncidentMarkers: React.FC = () => {
  const { incidents, selectedIncidentId, setSelectedIncident, setDispatchModalOpen, setPreviewRoute } =
    useEmergencyStore();

  const handleIncidentSelect = (incident: IncidentReport) => {
    setSelectedIncident(incident.id);

    // Calculate and preview route for this incident on map
    fetch('/api/dispatch/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId: incident.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        const topRec = data.recommendations?.[0];
        if (topRec?.route?.pathGeometry) {
          setPreviewRoute({
            pathGeometry: topRec.route.pathGeometry,
            callSign: `${topRec.vehicle.callSign} → #${incident.id}`,
            estimatedTimeMinutes: topRec.route.estimatedTimeMinutes,
            distanceKm: topRec.route.distanceKm,
          });
        }
      })
      .catch(() => {});
  };

  const createIncidentIcon = (incident: IncidentReport, isSelected: boolean) => {
    const config = getPriorityConfig(incident.priority);
    const isCritical = incident.priority === 'CRITICAL';
    const isResolved = incident.status === 'RESOLVED';

    const pulseClass = isCritical && !isResolved ? 'animate-ping' : '';
    const glowClass = isCritical ? 'shadow-[0_0_20px_#ef4444]' : 'shadow-[0_0_12px_#f59e0b]';
    const selectedClass = isSelected ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950 scale-110' : '';

    return L.divIcon({
      className: 'custom-incident-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          ${
            !isResolved
              ? `<span class="absolute inline-flex h-9 w-9 rounded-full ${
                  isCritical ? 'bg-red-500' : 'bg-amber-500'
                } opacity-40 ${pulseClass}"></span>`
              : ''
          }
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 border-2 ${
            isCritical ? 'border-red-500' : 'border-amber-500'
          } ${glowClass} ${selectedClass} text-white transform hover:scale-125 transition-transform duration-200">
            <span class="text-xs select-none">${isResolved ? '✅' : config.icon}</span>
          </div>
          <div class="absolute -bottom-4 whitespace-nowrap bg-slate-950/95 text-[9px] font-mono font-bold uppercase tracking-wider ${
            isCritical ? 'text-red-400 border-red-500/40' : 'text-amber-400 border-amber-500/40'
          } px-1.5 py-0.2 rounded border shadow-lg">
            ${incident.priority}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20],
    });
  };

  return (
    <>
      {incidents.map((incident) => {
        let position: [number, number] | null = null;
        try {
          const parsed = JSON.parse(incident.reportedLocation);
          position = [parsed.coordinates[1], parsed.coordinates[0]]; // [lat, lng]
        } catch {
          position = null;
        }

        if (!position) return null;

        const config = getPriorityConfig(incident.priority);
        const isSelected = selectedIncidentId === incident.id;

        return (
          <Marker
            key={incident.id}
            position={position}
            icon={createIncidentIcon(incident, isSelected)}
            eventHandlers={{
              click: () => {
                handleIncidentSelect(incident);
              },
            }}
          >
            <Popup className="tactical-popup">
              <div className="p-2 min-w-[220px] text-slate-100 font-sans">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{config.icon}</span>
                    <span>INCIDENT #{incident.id}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${config.bgClass}`}
                  >
                    {incident.priority}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Emergency Type:</span>
                    <span className="font-medium text-cyan-300">{incident.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Incident Details:</span>
                    <p className="text-slate-200 text-xs leading-relaxed mt-0.5 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                      {incident.description}
                    </p>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Current Status:</span>
                    <span className="font-bold font-mono text-amber-400">{incident.status}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedIncident(incident.id);
                      setDispatchModalOpen(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-950 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Dispatch Rescue Fleet</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
