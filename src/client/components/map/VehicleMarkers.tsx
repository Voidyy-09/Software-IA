import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { getVehicleConfig } from '../../lib/utils';
import type { Vehicle } from '../../types';
import { Gauge, Waves, BatteryCharging, Send, CheckCircle2 } from 'lucide-react';

export const VehicleMarkers: React.FC = () => {
  const { vehicles, telemetryUpdates, selectedVehicleId, setSelectedVehicle, setDispatchModalOpen } =
    useEmergencyStore();

  const createVehicleIcon = (vehicle: Vehicle, telemetry: any, isSelected: boolean) => {
    const config = getVehicleConfig(vehicle.type);
    const isEnRoute = vehicle.status === 'EN_ROUTE' || vehicle.status === 'DISPATCHED';
    const isAvailable = vehicle.status === 'AVAILABLE';

    let borderClass = 'ring-1 ring-slate-600 bg-slate-900';
    let ringEffect = '';

    if (isEnRoute) {
      borderClass = 'ring-2 ring-cyan-400 bg-slate-950 shadow-[0_0_20px_#06b6d4]';
      ringEffect = '<span class="absolute inline-flex h-11 w-11 rounded-full bg-cyan-400/40 animate-ping"></span>';
    } else if (isAvailable) {
      borderClass = 'ring-1 ring-emerald-500/80 bg-slate-900 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
      ringEffect = '<span class="absolute inline-flex h-9 w-9 rounded-full bg-emerald-500/20"></span>';
    }

    if (isSelected) {
      borderClass += ' outline outline-2 outline-offset-2 outline-cyan-300';
    }

    return L.divIcon({
      className: 'custom-vehicle-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          ${ringEffect}
          <div class="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/50 ${borderClass} text-white shadow-xl transform hover:scale-115 transition-transform duration-200">
            <span class="text-base select-none">${config.icon}</span>
          </div>
          <div class="absolute -bottom-4 whitespace-nowrap bg-slate-950/95 text-[10px] font-mono font-bold ${
            isEnRoute ? 'text-cyan-300 border-cyan-400/50' : 'text-slate-300 border-slate-700'
          } px-1.5 py-0.2 rounded border shadow-lg">
            ${vehicle.callSign}
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
      {vehicles.map((vehicle) => {
        const liveTel = telemetryUpdates.find((t) => t.vehicleId === vehicle.id);

        let position: [number, number] | null = null;
        if (liveTel && liveTel.location && liveTel.location.length >= 2) {
          position = [liveTel.location[1], liveTel.location[0]];
        } else if (vehicle.telemetry?.location) {
          try {
            const parsed = JSON.parse(vehicle.telemetry.location);
            position = [parsed.coordinates[1], parsed.coordinates[0]];
          } catch {
            position = null;
          }
        }

        if (!position && vehicle.defaultAssetLocation) {
          try {
            const parsed = JSON.parse(vehicle.defaultAssetLocation);
            position = [parsed.coordinates[1], parsed.coordinates[0]];
          } catch {
            position = null;
          }
        }

        if (!position) return null;

        const config = getVehicleConfig(vehicle.type);
        const isSelected = selectedVehicleId === vehicle.id;
        const fuel = liveTel ? liveTel.fuelLevel : vehicle.telemetry?.fuelLevelPercent ?? 100;
        const speed = liveTel ? liveTel.speed : vehicle.telemetry?.currentSpeedKmh ?? 0;

        return (
          <Marker
            key={vehicle.id}
            position={position}
            icon={createVehicleIcon(vehicle, liveTel || vehicle.telemetry, isSelected)}
            eventHandlers={{
              click: () => {
                setSelectedVehicle(vehicle.id);
              },
            }}
          >
            <Popup className="tactical-popup">
              <div className="p-2 min-w-[220px] text-slate-100 font-sans">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400">
                    <span className="text-sm">{config.icon}</span>
                    <span>{vehicle.callSign}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      vehicle.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : vehicle.status === 'EN_ROUTE' || vehicle.status === 'DISPATCHED'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="font-semibold text-white">{config.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Waves className="h-3 w-3 text-cyan-400" />
                      <span>Max Water Clearance:</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{vehicle.maxWaterDepthMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Weight:</span>
                    <span className="font-mono text-slate-300">{vehicle.maxWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="h-3 w-3 text-emerald-400" />
                      <span>Fuel / Battery:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{Math.round(fuel)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-amber-400" />
                      <span>Live Speed:</span>
                    </span>
                    <span className="font-mono text-amber-300">{speed.toFixed(1)} km/h</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Select Fleet Asset
                  </button>

                  {vehicle.status === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setDispatchModalOpen(true);
                      }}
                      className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase flex items-center gap-1 transition-all"
                    >
                      <Send className="h-2.5 w-2.5" />
                      Dispatch
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
