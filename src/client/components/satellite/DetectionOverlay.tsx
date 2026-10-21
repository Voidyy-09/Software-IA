import React from 'react';
import type { SatelliteDetection } from '../../types';
import { Badge } from '../ui/badge';
import { Waves, AlertTriangle, Layers, CheckCircle } from 'lucide-react';

interface DetectionOverlayProps {
  detections: SatelliteDetection[];
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          Detected Hazards & Anomalies ({detections.length})
        </span>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {detections.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No hazard anomalies detected above current thresholds.
            Adjust sensitivity sliders to scan again.
          </div>
        ) : (
          detections.map((detection) => {
            const isSelected = selectedDetectionId === detection.id;
            const isCritical = detection.confidence >= 0.8 || detection.estimatedDepthMm >= 500;

            return (
              <div
                key={detection.id}
                onClick={() => onSelectDetection(detection.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-300">
                      {detection.id}
                    </span>
                    <Badge
                      variant={isCritical ? 'destructive' : 'warning'}
                      className="text-[9px] font-mono"
                    >
                      {Math.round(detection.confidence * 100)}% AI CONFIDENCE
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {detection.imagery}
                  </span>
                </div>

                <p className="text-xs text-slate-200 mt-1.5 font-medium leading-relaxed">
                  {detection.description}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  {detection.estimatedDepthMm > 0 ? (
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Waves className="h-3 w-3" />
                      <span>Depth: {detection.estimatedDepthMm}mm</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-300">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Structural Hazard</span>
                    </span>
                  )}

                  <span className="text-slate-400">
                    Segments: #{detection.affectedSegmentIds.join(', #')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
