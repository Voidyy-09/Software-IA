import React from 'react';
import { Slider } from '../ui/slider';
import { Target, Waves } from 'lucide-react';

interface ConfidenceSliderProps {
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  floodDepthThresholdMm: number;
  setFloodDepthThresholdMm: (val: number) => void;
}

export const ConfidenceSlider: React.FC<ConfidenceSliderProps> = ({
  confidenceThreshold,
  setConfidenceThreshold,
  floodDepthThresholdMm,
  setFloodDepthThresholdMm,
}) => {
  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-cyan-400" />
            AI Confidence Threshold
          </span>
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {Math.round(confidenceThreshold * 100)}%
          </span>
        </div>
        <Slider
          min={10}
          max={95}
          step={5}
          value={Math.round(confidenceThreshold * 100)}
          onValueChange={(val) => setConfidenceThreshold(val / 100)}
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Loose (10%)</span>
          <span>Balanced (50%)</span>
          <span>Strict (95%)</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Waves className="h-3.5 w-3.5 text-cyan-400" />
            Min Flood Depth Threshold
          </span>
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {floodDepthThresholdMm} mm
          </span>
        </div>
        <Slider
          min={50}
          max={1000}
          step={50}
          value={floodDepthThresholdMm}
          onValueChange={setFloodDepthThresholdMm}
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Surface (50mm)</span>
          <span>Severe (500mm)</span>
          <span>Submerged (1000mm)</span>
        </div>
      </div>
    </div>
  );
};
