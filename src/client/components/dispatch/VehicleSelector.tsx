import React from 'react';
import type { Vehicle } from '../../types';
import { getVehicleConfig } from '../../lib/utils';
import { Check, Waves, BatteryCharging, Wrench } from 'lucide-react';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: number | null;
  onSelectVehicle: (id: number) => void;
  requiredWaterDepthMm?: number;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  requiredWaterDepthMm = 300,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
        Select Fleet Asset ({vehicles.length} Units Available)
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {vehicles.map((vehicle) => {
          const config = getVehicleConfig(vehicle.type);
          const isSelected = selectedVehicleId === vehicle.id;
          const isWaterDepthCapable = vehicle.maxWaterDepthMm >= requiredWaterDepthMm;
          const isAvailable = vehicle.status === 'AVAILABLE';

          return (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {vehicle.callSign}
                    </h4>
                    <span className="text-[10px] text-slate-400">{config.label}</span>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex h-5 w-5 rounded-full bg-cyan-500 items-center justify-center text-slate-950 font-bold">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[11px] font-mono">
                <div className="flex items-center gap-1 text-slate-400">
                  <Waves className="h-3 w-3 text-cyan-400" />
                  <span className={isWaterDepthCapable ? 'text-cyan-300' : 'text-red-400'}>
                    {vehicle.maxWaterDepthMm}mm
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <BatteryCharging className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-300">
                    {vehicle.telemetry?.fuelLevelPercent || 100}%
                  </span>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                    isAvailable
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {vehicle.status}
                </span>

                {isWaterDepthCapable ? (
                  <span className="text-[9px] font-mono text-emerald-400">
                    ✓ Flood Capable
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-red-400">
                    ⚠ Depth Incompatible
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
