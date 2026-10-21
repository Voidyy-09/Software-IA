import React from 'react';
import { Filter, Search } from 'lucide-react';

interface IncidentFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
}

export const IncidentFilter: React.FC<IncidentFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPriority,
  setSelectedPriority,
}) => {
  const priorities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'];

  return (
    <div className="space-y-2 p-3 bg-slate-900/60 border-b border-slate-800">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter incidents or locations..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Filter className="h-3 w-3 text-slate-500 shrink-0" />
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPriority(p)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all ${
              selectedPriority === p
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800/60'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
