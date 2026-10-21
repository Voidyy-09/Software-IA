import React, { useState, useEffect } from 'react';
import { ConfidenceSlider } from './ConfidenceSlider';
import { DetectionOverlay } from './DetectionOverlay';
import { Button } from '../ui/button';
import { Satellite, Scan, CheckCircle2, AlertOctagon, Radio, Crosshair, Sparkles } from 'lucide-react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import type { SatelliteAnalysisResult, SatelliteDetection } from '../../types';

export const SatelliteWorkbench: React.FC = () => {
  const { addNotification } = useEmergencyStore();
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [floodDepthThresholdMm, setFloodDepthThresholdMm] = useState(200);
  const [analysisResult, setAnalysisResult] = useState<SatelliteAnalysisResult | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [activeBand, setActiveBand] = useState<'ALL' | 'SAR' | 'OPTICAL'>('ALL');

  // Run analysis when sliders change or on initial mount
  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/satellite/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confidenceThreshold,
          floodDepthThresholdMm,
        }),
      });

      if (!res.ok) throw new Error('Analysis request failed');
      const data: SatelliteAnalysisResult = await res.json();
      setAnalysisResult(data);
      if (data.detections.length > 0) {
        setSelectedDetectionId(data.detections[0].id);
      }
    } catch (err) {
      console.error('Satellite scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleRunScan();
  }, [confidenceThreshold, floodDepthThresholdMm]);

  // Apply detections to live map
  const handleApplyToMap = async () => {
    if (!analysisResult || analysisResult.detections.length === 0) return;
    setIsApplying(true);

    try {
      const detectionIds = analysisResult.detections.map((d) => d.id);
      const res = await fetch('/api/satellite/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detectionIds }),
      });

      if (!res.ok) throw new Error('Failed to apply detections');
      const data = await res.json();

      addNotification({
        id: `sat-apply-${Date.now()}`,
        type: 'critical',
        title: 'Satellite AI Hazards Ingested',
        message: `${data.applied} road segments updated with verified satellite flood/damage telemetry. Map updated.`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error applying detections:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const filteredDetections = (analysisResult?.detections || []).filter((d) => {
    if (activeBand === 'SAR') return d.imagery.includes('SAR');
    if (activeBand === 'OPTICAL') return d.imagery.includes('OPTICAL');
    return true;
  });

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Workbench Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Satellite className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white font-['Outfit']">
                AI Satellite Hazard Detector Workbench
              </h2>
              <p className="text-xs text-slate-400">
                Synthetic Aperture Radar (SAR) & Multispectral Optical Hazard Segmentation Engine
              </p>
            </div>
          </div>
        </div>

        {/* Live Satellite Feed Info Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-slate-400">FEED:</span>
            <span className="font-bold text-white">ISRO RISAT-2B</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-700" />
          <div className="text-slate-400">
            RES: <span className="text-cyan-300 font-bold">5m/px</span>
          </div>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Interactive Simulated Satellite Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col justify-between p-4 group">
            {/* Tactical Grid Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(6,182,212,0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(6,182,212,0.15) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transform -skew-x-12 animate-[pulse_4s_ease-in-out_infinite]" />
            </div>

            {/* Top HUD Overlay */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-cyan-400">
              <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30">
                <Crosshair className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '10s' }} />
                <span>COORDS: 19.0732° N, 72.8997° E</span>
              </div>

              {/* Band Filter Selector */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                {(['ALL', 'SAR', 'OPTICAL'] as const).map((band) => (
                  <button
                    key={band}
                    onClick={() => setActiveBand(band)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeBand === band
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Satellite Visual Display */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center p-6 text-center">
              <div className="relative w-48 h-48 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-950/10 backdrop-blur-sm shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="absolute inset-4 rounded-full border border-dashed border-cyan-500/20" />
                <div className="absolute inset-12 rounded-full border border-slate-700/40" />
                
                {/* Visual Flood Polygon Representation */}
                <div className="absolute w-28 h-20 bg-red-500/25 border border-red-500/60 rounded-xl transform rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
                  <span className="text-[10px] font-mono font-bold text-red-300 uppercase">
                    MITHI RIVER OVERFLOW
                  </span>
                </div>

                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>

              <div className="mt-4 font-mono text-xs text-slate-300">
                <span className="text-cyan-400 font-bold">ANALYZING PASS:</span> Mithi Basin - Kurla Industrial Complex
              </div>
            </div>

            {/* Bottom HUD Overlay */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-2">
              <div className="flex items-center gap-2">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>SPECTRAL DECOMPOSITION: ACTIVE</span>
              </div>
              <div>
                SCAN TIME: {analysisResult?.metadata.passTime ? new Date(analysisResult.metadata.passTime).toLocaleTimeString() : '--:--:--'}
              </div>
            </div>
          </div>

          {/* Threshold Sensitivity Sliders */}
          <ConfidenceSlider
            confidenceThreshold={confidenceThreshold}
            setConfidenceThreshold={setConfidenceThreshold}
            floodDepthThresholdMm={floodDepthThresholdMm}
            setFloodDepthThresholdMm={setFloodDepthThresholdMm}
          />
        </div>

        {/* Right Pane: Detections Breakdown & Action (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl backdrop-blur-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>AI Detections Pipeline</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {filteredDetections.length} anomaly clusters flagged
                </span>
              </div>

              <Button
                size="sm"
                variant="tactical"
                onClick={handleRunScan}
                disabled={isScanning}
                className="text-xs"
              >
                <Scan className="h-3.5 w-3.5 mr-1" />
                {isScanning ? 'Scanning...' : 'Rescan'}
              </Button>
            </div>

            {/* Detections List */}
            <DetectionOverlay
              detections={filteredDetections}
              selectedDetectionId={selectedDetectionId}
              onSelectDetection={setSelectedDetectionId}
            />
          </div>

          {/* Action Commit Button */}
          <div className="pt-4 border-t border-slate-800">
            <Button
              size="lg"
              variant="default"
              onClick={handleApplyToMap}
              disabled={isApplying || filteredDetections.length === 0}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-950 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isApplying
                  ? 'Committing to Live System...'
                  : `Apply ${filteredDetections.length} Detections to Live Map`}
              </span>
            </Button>
            <p className="text-[11px] text-slate-500 text-center mt-2 font-mono">
              Injects validated satellite hazard vectors into road state graph & recalculates routes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
