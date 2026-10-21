import React from 'react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { Map, Satellite, Truck, BarChart3, AlertOctagon } from 'lucide-react';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, incidents } = useEmergencyStore();

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  const tabs = [
    {
      id: 'map',
      label: 'Map Command',
      icon: Map,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'satellite',
      label: 'AI Satellite Scanner',
      icon: Satellite,
      badge: 'LIVE AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      id: 'fleet',
      label: 'Fleet Telemetry',
      icon: Truck,
    },
    {
      id: 'analytics',
      label: 'Analytics & Logs',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950/60 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
