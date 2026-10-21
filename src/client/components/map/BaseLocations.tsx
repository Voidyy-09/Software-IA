import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Building2, Shield, Hospital, Home } from 'lucide-react';

export interface BaseLocation {
  id: string;
  name: string;
  type: 'COMMAND' | 'TRIAGE' | 'SHELTER' | 'DEPOT';
  position: [number, number]; // [lat, lng]
  agency: string;
  capacity?: string;
  icon: string;
  status: string;
  description: string;
}

export const BASE_LOCATIONS: BaseLocation[] = [
  {
    id: 'base-ndrf',
    name: 'NDRF Battalion 5 Tactical Base',
    type: 'COMMAND',
    position: [19.0715, 72.8680],
    agency: 'National Disaster Response Force',
    capacity: 'Heavy Equipment & Boat Squad',
    icon: '🏢',
    status: 'ACTIVE_DEPLOYMENT',
    description: 'Primary amphibious rescue staging base. Rapid deployment to Mithi River basin.',
  },
  {
    id: 'base-bmc',
    name: 'BMC Disaster Management Operations Depot',
    type: 'DEPOT',
    position: [19.0785, 72.8985],
    agency: 'Brihanmumbai Municipal Corporation',
    capacity: 'High-flow pumps & recovery 4x4s',
    icon: '🏛️',
    status: 'OPERATIONAL',
    description: 'Central flood coordination hub. Monitoring drainage grids and road blockages.',
  },
  {
    id: 'base-triage',
    name: 'Somaiya Emergency Trauma & Triage Center',
    type: 'TRIAGE',
    position: [19.0735, 72.8995],
    agency: 'Emergency Medical Services',
    capacity: '120 Emergency Beds | Level 1 Trauma',
    icon: '🏥',
    status: 'RECEIVING_PATIENTS',
    description: 'Designated high-ground emergency hospital. Amphibious and 4x4 ambulance bay.',
  },
  {
    id: 'base-shelter',
    name: 'Kurla High-Ground Civilian Evacuation Shelter',
    type: 'SHELTER',
    position: [19.0665, 72.8850],
    agency: 'District Relief Command',
    capacity: '500 Persons | Food & Clean Water',
    icon: '🛡️',
    status: 'OPEN_SHELTER',
    description: 'Reinforced multi-story shelter safe from 2000mm flood surge.',
  },
];

const createBaseIcon = (base: BaseLocation) => {
  const getBadgeColor = () => {
    switch (base.type) {
      case 'COMMAND':
        return 'border-indigo-500/80 bg-indigo-950/90 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]';
      case 'TRIAGE':
        return 'border-emerald-500/80 bg-emerald-950/90 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
      case 'SHELTER':
        return 'border-amber-500/80 bg-amber-950/90 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      default:
        return 'border-cyan-500/80 bg-cyan-950/90 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
    }
  };

  return L.divIcon({
    className: 'custom-base-marker',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer">
        <div class="relative flex h-8 w-8 items-center justify-center rounded-lg border ${getBadgeColor()} backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
          <span class="text-sm select-none">${base.icon}</span>
        </div>
        <div class="absolute -bottom-4 whitespace-nowrap bg-slate-950/95 text-[9px] font-mono font-bold text-slate-300 px-1.5 py-0.2 rounded border border-slate-700/80 pointer-events-none shadow-md">
          ${base.name.split(' ')[0]}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const BaseLocations: React.FC = () => {
  return (
    <>
      {BASE_LOCATIONS.map((base) => (
        <Marker key={base.id} position={base.position} icon={createBaseIcon(base)}>
          <Popup className="tactical-popup">
            <div className="p-2 min-w-[220px] text-slate-100 font-sans">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
                <span className="font-bold text-xs uppercase text-cyan-400 flex items-center gap-1.5">
                  <span>{base.icon}</span>
                  <span className="truncate max-w-[160px]">{base.name}</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {base.type}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Agency:</span>
                  <span className="text-slate-200">{base.agency}</span>
                </div>
                {base.capacity && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Capacity & Assets:</span>
                    <span className="font-mono text-cyan-300 text-[11px]">{base.capacity}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status:</span>
                  <span className="font-mono text-emerald-400 text-[11px] font-bold">{base.status}</span>
                </div>
                <p className="text-[11px] text-slate-300 bg-slate-900/70 p-1.5 rounded border border-slate-800 leading-relaxed mt-1">
                  {base.description}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
