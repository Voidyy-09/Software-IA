import React from 'react';
import { Polyline, Popup, CircleMarker } from 'react-leaflet';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { Navigation, AlertTriangle, CheckCircle, Clock, Compass } from 'lucide-react';

interface ActiveRouteProps {
  customRoute?: {
    pathGeometry: string;
    isFailed?: boolean;
    failureReason?: string;
  } | null;
}

export const RoutePolyline: React.FC<ActiveRouteProps> = ({ customRoute }) => {
  const { vehicles, previewRoute } = useEmergencyStore();

  const effectivePreview = customRoute || previewRoute;

  const routesToRender: Array<{
    id: string;
    callSign: string;
    coordinates: [number, number][];
    status: string;
    failureReason?: string | null;
    estimatedTimeMinutes?: number;
    distanceKm?: number;
    isPreview?: boolean;
  }> = [];

  // 1. Proposed / Preview route from store or props
  if (effectivePreview && effectivePreview.pathGeometry) {
    try {
      const parsed = JSON.parse(effectivePreview.pathGeometry);
      const coords = parsed.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      if (coords.length > 0) {
        routesToRender.push({
          id: 'preview-proposed-route',
          callSign: effectivePreview.callSign ? `PROPOSED: ${effectivePreview.callSign}` : 'PROPOSED MISSION PATH',
          coordinates: coords,
          status: effectivePreview.isFailed ? 'REROUTED_FAILURE' : 'OPTIMAL_PROPOSED',
          failureReason: effectivePreview.failureReason,
          estimatedTimeMinutes: (effectivePreview as any).estimatedTimeMinutes,
          distanceKm: (effectivePreview as any).distanceKm,
          isPreview: true,
        });
      }
    } catch (e) {
      console.error('Error parsing preview route:', e);
    }
  }

  // 2. Active assigned missions from vehicles
  vehicles.forEach((vehicle) => {
    vehicle.missions?.forEach((mission) => {
      mission.routes?.forEach((route) => {
        try {
          const parsed = JSON.parse(route.pathGeometry);
          const coords = parsed.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          if (coords.length > 0) {
            routesToRender.push({
              id: `route-${route.id}`,
              callSign: vehicle.callSign,
              coordinates: coords,
              status: route.status,
              failureReason: route.failureReason,
              isPreview: false,
            });
          }
        } catch (e) {
          console.error('Error parsing route geometry:', e);
        }
      });
    });
  });

  return (
    <>
      {routesToRender.map((route) => {
        const isFailed = route.status === 'REROUTED_FAILURE';
        const isPreview = route.isPreview;
        const startPoint = route.coordinates[0];
        const endPoint = route.coordinates[route.coordinates.length - 1];

        const primaryColor = isFailed ? '#ef4444' : isPreview ? '#f59e0b' : '#06b6d4';
        const glowColor = isFailed ? '#dc2626' : isPreview ? '#d97706' : '#0891b2';

        return (
          <React.Fragment key={route.id}>
            {/* Outer Glow Line */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: glowColor,
                weight: isPreview ? 8 : 10,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Inner Tactical Neon Line */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: primaryColor,
                weight: isPreview ? 4 : 5,
                opacity: 0.95,
                dashArray: isPreview ? '8, 8' : isFailed ? '6, 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-2.5 min-w-[220px] text-slate-100 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
                    <span className="font-bold text-xs uppercase text-cyan-400 flex items-center gap-1.5">
                      <Navigation className="h-4 w-4" />
                      <span>{route.callSign}</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isFailed
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : isPreview
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5">
                    {route.estimatedTimeMinutes && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-400" />
                          <span>Estimated ETA:</span>
                        </span>
                        <span className="font-mono font-bold text-cyan-300">
                          {route.estimatedTimeMinutes} mins
                        </span>
                      </div>
                    )}
                    {route.distanceKm && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Compass className="h-3 w-3 text-slate-400" />
                          <span>Mission Distance:</span>
                        </span>
                        <span className="font-mono text-slate-200">
                          {route.distanceKm} km
                        </span>
                      </div>
                    )}

                    {isFailed && route.failureReason && (
                      <div className="text-red-300 bg-red-950/60 p-2 rounded border border-red-500/30 text-[11px] leading-relaxed">
                        <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-red-400" />
                        {route.failureReason}
                      </div>
                    )}

                    {!isFailed && (
                      <div className="text-emerald-300 text-[11px] flex items-center gap-1 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/30">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Passable path evaluated under current monsoon flood levels</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* Route Start Point Indicator */}
            {startPoint && (
              <CircleMarker
                center={startPoint}
                radius={5}
                pathOptions={{
                  color: primaryColor,
                  fillColor: '#0a0e1a',
                  fillOpacity: 1,
                  weight: 2,
                }}
              />
            )}

            {/* Route Target Point Indicator */}
            {endPoint && (
              <CircleMarker
                center={endPoint}
                radius={6}
                pathOptions={{
                  color: primaryColor,
                  fillColor: primaryColor,
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
