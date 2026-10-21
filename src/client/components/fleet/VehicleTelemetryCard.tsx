import React from 'react';
import type { Vehicle, TelemetryUpdate } from '../../types';
import { getVehicleConfig } from '../../lib/utils';
import { CapacityProgress } from './CapacityProgress';
import { Badge } from '../ui/badge';
import { Waves, Gauge, Compass, Shield, Anchor, BatteryCharging } from 'lucide-react';

interface VehicleTelemetryCardProps {
  vehicle: Vehicle;
  liveTelemetry?: TelemetryUpdate;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const VehicleTelemetryCard: React.FC<VehicleTelemetryCardProps> = ({
  vehicle,
  liveTelemetry,
  isSelected,
  onSelect,
}) => {
  const config = getVehicleConfig(vehicle.type);
  const fuel = liveTelemetry ? liveTelemetry.fuelLevel : vehicle.telemetry?.fuelLevelPercent || 100;
  const speed = liveTelemetry ? liveTelemetry.speed : vehicle.telemetry?.currentSpeedKmh || 0;
  const heading = liveTelemetry ? liveTelemetry.heading : vehicle.telemetry?.heading || 0;

  const hasWinch = vehicle.equipment?.some((e) => e.equipment.name === 'WINCH');
  const isEnRoute = vehicle.status === 'EN_ROUTE' || vehicle.status === 'DISPATCHED';

  const fuelColor =
    fuel > 50 ? 'bg-emerald-500' : fuel > 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-4 transition-all cursor-pointer backdrop-blur-md ${
        isSelected
          ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-700 text-xl shadow-inner">
            {config.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              {vehicle.callSign}
            </h4>
            <span className="text-xs text-slate-400 font-medium">{config.label}</span>
          </div>
        </div>

        <Badge
          variant={
            vehicle.status === 'AVAILABLE'
              ? 'success'
              : vehicle.status === 'EN_ROUTE' || vehicle.status === 'DISPATCHED'
              ? 'warning'
              : 'outline'
          }
          className="text-[10px] font-mono"
        >
          {vehicle.status}
        </Badge>
      </div>

      {/* Hard Operational Limits Grid */}
      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Waves className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-400">Clearance:</span>
          <span className="font-bold text-cyan-300">{vehicle.maxWaterDepthMm}mm</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400">Payload:</span>
          <span className="font-bold">{vehicle.maxWeightKg}kg</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Anchor className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-slate-400">Winch:</span>
          <span className={hasWinch ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
            {hasWinch ? 'Mounted' : 'None'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Gauge className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400">Speed:</span>
          <span className="font-bold text-emerald-300">{speed.toFixed(1)} km/h</span>
        </div>
      </div>

      {/* Fuel / Battery Bar */}
      <CapacityProgress
        label="Fuel / Battery Level"
        value={Math.round(fuel)}
        colorClass={fuelColor}
      />

      {/* Real-time telemetry badge */}
      {isEnRoute && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-cyan-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            ACTIVE MISSION IN PROGRESS
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Compass className="h-3 w-3" />
            {heading}° HDG
          </span>
        </div>
      )}
    </div>
  );
};
