import React, { useState } from 'react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { IncidentPriorityBadge } from './IncidentPriorityBadge';
import { IncidentFilter } from './IncidentFilter';
import { AlertCircle, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export const IncidentQueue: React.FC = () => {
  const { incidents, selectedIncidentId, setSelectedIncident, setDispatchModalOpen } = useEmergencyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriority === 'ALL' || incident.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Queue Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Incident Queue ({filteredIncidents.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
          PRIORITY DISPATCH
        </span>
      </div>

      {/* Filter bar */}
      <IncidentFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
      />

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-280px)]">
        {filteredIncidents.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No incidents match filter criteria
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedIncidentId === incident.id;
            const isResolved = incident.status === 'RESOLVED';

            const handleQueueSelect = () => {
              setSelectedIncident(incident.id);
              if (!isResolved) {
                fetch('/api/dispatch/recommend', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ incidentId: incident.id }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const topRec = data.recommendations?.[0];
                    if (topRec?.route?.pathGeometry) {
                      useEmergencyStore.getState().setPreviewRoute({
                        pathGeometry: topRec.route.pathGeometry,
                        callSign: `${topRec.vehicle.callSign} → #${incident.id}`,
                        estimatedTimeMinutes: topRec.route.estimatedTimeMinutes,
                        distanceKm: topRec.route.distanceKm,
                      });
                    }
                  })
                  .catch(() => {});
              }
            };

            return (
              <div
                key={incident.id}
                onClick={handleQueueSelect}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">
                      #{incident.id}
                    </span>
                    <span className="text-xs font-semibold text-cyan-300">
                      {incident.type}
                    </span>
                  </div>
                  <IncidentPriorityBadge priority={incident.priority} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2 font-sans">
                  {incident.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/50 font-mono">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <span
                    className={`font-semibold uppercase text-[10px] ${
                      isResolved
                        ? 'text-emerald-400'
                        : incident.status === 'IN_PROGRESS'
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>

                {/* Dispatch Trigger on active/selected */}
                {isSelected && !isResolved && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full text-xs font-bold uppercase tracking-wider"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(incident.id);
                        setDispatchModalOpen(true);
                      }}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Dispatch Rescue Fleet
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
