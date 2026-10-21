import React from 'react';
import { ResponseTimeChart } from './ResponseTimeChart';
import { RouteFailureBarChart } from './RouteFailureBarChart';
import { MissionHistory } from './MissionHistory';
import { BarChart3, Clock, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';

export const AnalyticsHub: React.FC = () => {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white font-['Outfit']">
                Disaster Mission Analytics & Historical Logs
              </h2>
              <p className="text-xs text-slate-400">
                Golden Hour response efficacy, dynamic route re-routing metrics, and audit trail
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>ALGORITHM: <strong>Constraint-Aware Dijkstra with Live Road Penalties</strong></span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Response Time</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-2">
            11.4 <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            ↓ 42% vs static GPS
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Dispatches Prevented</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-2">
            22 <span className="text-sm font-normal text-slate-400">rerouted</span>
          </div>
          <div className="text-[11px] text-amber-400/80 font-mono mt-1">
            0 units submerged
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Lives Extricated</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            48 <span className="text-sm font-normal text-slate-400">citizens</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 font-mono mt-1">
            100% safety record
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Golden Hour</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            96.8%
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">
            System Operational
          </div>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseTimeChart />
        <RouteFailureBarChart />
      </div>

      {/* Full Audit Log Table */}
      <MissionHistory />
    </div>
  );
};
