import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MOCK_RESPONSE_TIME_DATA = [
  { time: '10:00', avgMinutes: 18.2, target: 15 },
  { time: '10:10', avgMinutes: 16.5, target: 15 },
  { time: '10:20', avgMinutes: 14.8, target: 15 },
  { time: '10:30', avgMinutes: 13.1, target: 15 },
  { time: '10:40', avgMinutes: 11.4, target: 15 },
  { time: '10:50', avgMinutes: 9.8, target: 15 },
  { time: '11:00', avgMinutes: 8.5, target: 15 },
];

export const ResponseTimeChart: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Golden Hour Response Time Trend
          </h3>
          <p className="text-[11px] text-slate-400">
            Average time to reach stranded victim (minutes)
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
          -53% WITH DYNAMIC REROUTING
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_RESPONSE_TIME_DATA}>
            <defs>
              <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 25]} unit="m" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="avgMinutes"
              name="Avg Response Time (min)"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#timeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
