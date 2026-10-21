import React from 'react';
import { Polygon, Circle, Popup } from 'react-leaflet';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { AlertOctagon, Waves } from 'lucide-react';

export const HazardOverlays: React.FC = () => {
  const { hazardAreas } = useEmergencyStore();

  return (
    <>
      {hazardAreas.map((hazard) => {
        let geometry: any = null;
        try {
          geometry = JSON.parse(hazard.geometry);
        } catch {
          return null;
        }

        const isCircle = geometry.type === 'Circle';
        const isPolygon = geometry.type === 'Polygon';

        const severityColor =
          hazard.severityIndex >= 8 ? '#ef4444' : hazard.severityIndex >= 5 ? '#f59e0b' : '#3b82f6';

        if (isCircle) {
          const center: [number, number] = [geometry.center[1], geometry.center[0]];
          const radius = geometry.radiusMeters || 400;

          return (
            <Circle
              key={hazard.id}
              center={center}
              radius={radius}
              pathOptions={{
                color: severityColor,
                fillColor: severityColor,
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '4, 6',
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-2 min-w-[180px] text-slate-100 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-red-400 border-b border-slate-700/60 pb-1 mb-2">
                    <Waves className="h-4 w-4" />
                    <span>Hazard Zone #{hazard.id}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="font-semibold text-white">{hazard.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Severity Index:</span>
                      <span className="font-mono font-bold text-red-400">{hazard.severityIndex}/10.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Radius:</span>
                      <span className="font-mono text-slate-300">{radius} m</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        }

        if (isPolygon) {
          const latLngs = geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]);

          return (
            <Polygon
              key={hazard.id}
              positions={latLngs}
              pathOptions={{
                color: severityColor,
                fillColor: severityColor,
                fillOpacity: 0.2,
                weight: 2,
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-2 min-w-[180px] text-slate-100 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-amber-400 border-b border-slate-700/60 pb-1 mb-2">
                    <AlertOctagon className="h-4 w-4" />
                    <span>Hazard Perimeter #{hazard.id}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="font-semibold text-white">{hazard.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Severity Index:</span>
                      <span className="font-mono font-bold text-red-400">{hazard.severityIndex}/10.0</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        }

        return null;
      })}
    </>
  );
};
