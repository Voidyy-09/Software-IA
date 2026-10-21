import React, { useEffect, useState } from 'react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { formatDuration } from '../../lib/utils';
import { Radio, AlertTriangle, Shield, Clock, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '../ui/badge';

export const CommandHeader: React.FC = () => {
  const { isConnected, incidents, vehicles, goldenHourRemaining, setGoldenHourRemaining } = useEmergencyStore();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    }, 1000);

    const timerInterval = setInterval(() => {
      setGoldenHourRemaining(Math.max(0, goldenHourRemaining - 1));
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(timerInterval);
    };
  }, [goldenHourRemaining, setGoldenHourRemaining]);

  const criticalCount = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const activeVehicles = vehicles.filter((v) => v.status === 'DISPATCHED' || v.status === 'EN_ROUTE').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0a0e1a]/95 backdrop-blur-md px-4 py-3 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Zone */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="h-5 w-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-['Outfit']">
                Disaster Response <span className="text-cyan-400">Command System</span>
              </h1>
              <Badge variant="outline" className="text-[10px] bg-slate-900 border-cyan-500/40 text-cyan-400 font-mono">
                KJSCE SRS v2.4
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SECTOR: <strong>Kurla / Vidyavihar Severe Monsoon Flooding Zone</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Golden Hour, Telemetry Status, Clock */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Golden Hour Countdown Box */}
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Clock className="h-4 w-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Golden Hour Window</div>
              <div className="font-mono text-sm sm:text-base font-extrabold text-amber-300 tracking-wider">
                {formatDuration(goldenHourRemaining)}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-slate-400">Critical:</span>
              <span className="font-bold text-red-400">{criticalCount}</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-400">Deployed:</span>
              <span className="font-bold text-cyan-300">{activeVehicles}/{vehicles.length}</span>
            </div>
          </div>

          {/* Clock & WebSocket Indicator */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block font-mono text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-slate-800">
              {currentTime || '--:--:-- IST'}
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border ${
                isConnected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
              }`}
            >
              {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline font-mono text-[11px]">{isConnected ? 'LIVE WS' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
