import React from 'react';
import type { Vehicle, IncidentReport } from '../../types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Waves, Anchor, Scale } from 'lucide-react';

interface ConstraintCheckerProps {
  vehicle: Vehicle;
  incident: IncidentReport;
}

export const ConstraintChecker: React.FC<ConstraintCheckerProps> = ({ vehicle, incident }) => {
  // Infer incident constraint demands based on description/type
  const isFloodIncident =
    incident.type === 'EVACUATION' ||
    incident.description.toLowerCase().includes('flood') ||
    incident.description.toLowerCase().includes('trapped');

  const isStructuralCollapse =
    incident.type === 'TRAPPED' ||
    incident.description.toLowerCase().includes('collapse') ||
    incident.description.toLowerCase().includes('wall');

  // Estimated flood depth at incident site
  const incidentFloodDepthMm = isFloodIncident ? 850 : 250;

  // Equipment required
  const requiresWinch = isStructuralCollapse;
  const requiresBoatOrAmphibious = incidentFloodDepthMm > 500;

  // Check individual constraints
  const waterDepthPassed = vehicle.maxWaterDepthMm >= incidentFloodDepthMm;
  const hasWinch = vehicle.equipment?.some((e) => e.equipment.name === 'WINCH');
  const winchPassed = !requiresWinch || hasWinch;
  const fuelPassed = (vehicle.telemetry?.fuelLevelPercent || 100) > 25;
  const availabilityPassed = vehicle.status === 'AVAILABLE';

  const allPassed = waterDepthPassed && winchPassed && fuelPassed && availabilityPassed;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-cyan-400" />
          Safety & Constraint Verification Matrix
        </span>
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
            allPassed
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
              : 'bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
          }`}
        >
          {allPassed ? '🟢 ALL CONSTRAINTS PASSED' : '🔴 CONSTRAINTS BREACHED'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Water Clearance Check */}
        <div
          className={`p-2.5 rounded-lg border flex items-start justify-between ${
            waterDepthPassed
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/30 border-red-500/40 text-red-300'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Waves className="h-3.5 w-3.5 text-cyan-400" />
              <span>Water Clearance</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Vehicle: {vehicle.maxWaterDepthMm}mm | Required: {incidentFloodDepthMm}mm
            </div>
          </div>
          {waterDepthPassed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          )}
        </div>

        {/* Winch & Extrication Equipment */}
        <div
          className={`p-2.5 rounded-lg border flex items-start justify-between ${
            winchPassed
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/30 border-red-500/40 text-red-300'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Anchor className="h-3.5 w-3.5 text-amber-400" />
              <span>Heavy Winch Equipment</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {hasWinch ? 'Winch Mounted' : 'No Winch'} {requiresWinch ? '(Required)' : '(Optional)'}
            </div>
          </div>
          {winchPassed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          )}
        </div>

        {/* Fuel / Battery Range */}
        <div
          className={`p-2.5 rounded-lg border flex items-start justify-between ${
            fuelPassed
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              <span>Fuel / Operational Range</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Current: {vehicle.telemetry?.fuelLevelPercent || 100}% (Threshold: &gt;25%)
            </div>
          </div>
          {fuelPassed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          )}
        </div>

        {/* Operational Status */}
        <div
          className={`p-2.5 rounded-lg border flex items-start justify-between ${
            availabilityPassed
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span>Unit Status</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Current State: {vehicle.status}
            </div>
          </div>
          {availabilityPassed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          )}
        </div>
      </div>
    </div>
  );
};
