import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const MOCK_BAR_DATA = [
  { zone: 'Kurla West', completed: 14, reroutedSaved: 6, failures: 0 },
  { zone: 'Vidyavihar Somaiya', completed: 9, reroutedSaved: 4, failures: 1 },
  { zone: 'Ghatkopar East', completed: 11, reroutedSaved: 5, failures: 0 },
  { zone: 'CST Road Corridor', completed: 8, reroutedSaved: 7, failures: 0 },
];

export const RouteFailureBarChart: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Dispatches vs Dynamic Reroutes Prevented
          </h3>
          <p className="text-[11px] text-slate-400">
            Route failures preempted via real-time telemetry & satellite alerts
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          96.2% MISSION SUCCESS RATE
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_BAR_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="zone" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="completed" name="Missions Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reroutedSaved" name="Rerouted / Saved from Submersion" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failures" name="Aborted" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
