import React, { useState } from 'react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { VehicleTelemetryCard } from './VehicleTelemetryCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { getVehicleConfig } from '../../lib/utils';
import { Truck, LayoutGrid, ListFilter, Activity, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export const FleetTable: React.FC = () => {
  const { vehicles, telemetryUpdates, selectedVehicleId, setSelectedVehicle } = useEmergencyStore();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter === 'ALL') return true;
    return v.status === statusFilter;
  });

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Fleet Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white font-['Outfit']">
                Fleet Telemetry & Capability Manager
              </h2>
              <p className="text-xs text-slate-400">
                Live asset tracking, water clearance limits, and mechanical readiness
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Toggles */}
        <div className="flex items-center gap-2">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {['ALL', 'AVAILABLE', 'EN_ROUTE', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Card / Table Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'cards' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const liveTel = telemetryUpdates.find((t) => t.vehicleId === vehicle.id);
            return (
              <VehicleTelemetryCard
                key={vehicle.id}
                vehicle={vehicle}
                liveTelemetry={liveTel}
                isSelected={selectedVehicleId === vehicle.id}
                onSelect={() => setSelectedVehicle(vehicle.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead>Call Sign</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Water Depth Max</TableHead>
                <TableHead>Max Payload</TableHead>
                <TableHead>Fuel / Battery</TableHead>
                <TableHead>Current Speed</TableHead>
                <TableHead>Equipment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const config = getVehicleConfig(vehicle.type);
                const liveTel = telemetryUpdates.find((t) => t.vehicleId === vehicle.id);
                const fuel = liveTel ? liveTel.fuelLevel : vehicle.telemetry?.fuelLevelPercent || 100;
                const speed = liveTel ? liveTel.speed : vehicle.telemetry?.currentSpeedKmh || 0;

                return (
                  <TableRow
                    key={vehicle.id}
                    className="border-slate-800/60 hover:bg-slate-800/40 cursor-pointer"
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <TableCell className="font-bold font-mono text-cyan-300 flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{vehicle.callSign}</span>
                    </TableCell>
                    <TableCell className="text-slate-300">{config.label}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          vehicle.status === 'AVAILABLE'
                            ? 'success'
                            : vehicle.status === 'EN_ROUTE'
                            ? 'warning'
                            : 'outline'
                        }
                        className="text-[10px] font-mono"
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-cyan-300 font-semibold">
                      {vehicle.maxWaterDepthMm} mm
                    </TableCell>
                    <TableCell className="font-mono text-slate-300">
                      {vehicle.maxWeightKg} kg
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-emerald-400">{Math.round(fuel)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-amber-300">
                      {speed.toFixed(1)} km/h
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.equipment?.map((eq) => (
                          <span
                            key={eq.equipmentId}
                            className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700"
                          >
                            {eq.equipment.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
