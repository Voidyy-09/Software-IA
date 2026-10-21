import React, { useState } from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { getRoadStatusConfig } from '../../lib/utils';
import type { RoadSegment } from '../../types';
import { Button } from '../ui/button';
import { AlertTriangle, CheckCircle, Waves, Gauge } from 'lucide-react';

export const RoadPolylines: React.FC = () => {
  const { roadSegments, updateRoadSegmentStatus, addNotification } = useEmergencyStore();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleToggleStatus = async (segment: RoadSegment) => {
    const currentState = segment.roadStates[0];
    const isFlooded = currentState?.status === 'CLOSED_FLOODING';
    const newStatus = isFlooded ? 'OPEN' : 'CLOSED_FLOODING';
    const newFloodDepthMm = isFlooded ? 0 : 850;

    setUpdatingId(segment.id);
    try {
      const res = await fetch(`/api/roads/segments/${segment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          floodDepthMm: newFloodDepthMm,
          updatedBySource: 'DISPATCHER_MANUAL',
          restrictionNotes: isFlooded ? 'Clear for traffic' : 'Severe flood water reported by dispatcher override',
        }),
      });

      if (!res.ok) throw new Error('Failed to update road status');
      const data = await res.json();

      updateRoadSegmentStatus(segment.id, newStatus, newFloodDepthMm);

      addNotification({
        id: `road-toggle-${Date.now()}`,
        type: newStatus === 'CLOSED_FLOODING' ? 'critical' : 'success',
        title: `Road ${newStatus === 'CLOSED_FLOODING' ? 'Closed' : 'Opened'}`,
        message: `${segment.name} is now marked ${newStatus} (${newFloodDepthMm}mm depth). Dynamic rerouting engine triggered.`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error toggling road status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {roadSegments.map((segment) => {
        let latLngs: [number, number][] = [];
        try {
          const parsed = JSON.parse(segment.geometry);
          // GeoJSON LineString coordinates are [lng, lat] -> Leaflet expects [lat, lng]
          latLngs = parsed.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        } catch {
          return null;
        }

        const currentState = segment.roadStates[0];
        const status = currentState?.status || 'OPEN';
        const config = getRoadStatusConfig(status);
        const isFlooded = status === 'CLOSED_FLOODING' || status === 'CLOSED_DAMAGE';

        return (
          <Polyline
            key={segment.id}
            positions={latLngs}
            pathOptions={{
              color: config.lineColor,
              weight: isFlooded ? 6 : 5,
              opacity: isFlooded ? 0.9 : 0.7,
              dashArray: isFlooded ? '8, 8' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Popup className="tactical-popup">
              <div className="p-2 min-w-[220px] text-slate-100 font-sans">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
                  <span className="font-bold text-xs uppercase text-white truncate max-w-[140px]">
                    {segment.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      isFlooded
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Waves className="h-3 w-3 text-cyan-400" />
                      <span>Flood Depth:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {currentState?.floodDepthMm || 0} mm
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-slate-400" />
                      <span>Speed Limit:</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      {currentState?.currentSpeedKmh || segment.defaultSpeedKmh} km/h
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Class:</span>
                    <span className="text-slate-300 capitalize">{segment.classification.toLowerCase()}</span>
                  </div>

                  {currentState?.restrictionNotes && (
                    <div className="text-[11px] text-amber-300/80 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                      {currentState.restrictionNotes}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800">
                  <Button
                    size="sm"
                    variant={isFlooded ? 'default' : 'destructive'}
                    className="w-full text-xs font-bold"
                    onClick={() => handleToggleStatus(segment)}
                    disabled={updatingId === segment.id}
                  >
                    {updatingId === segment.id ? (
                      'Recalculating...'
                    ) : isFlooded ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-300" />
                        Mark Segment OPEN
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 mr-1 text-red-300" />
                        Simulate Flood (CLOSE)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
};
