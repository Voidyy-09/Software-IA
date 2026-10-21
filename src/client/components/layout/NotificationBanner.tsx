import React from 'react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const NotificationBanner: React.FC = () => {
  const { notifications, clearNotifications } = useEmergencyStore();

  if (notifications.length === 0) return null;

  // Display only the latest 3 notifications to avoid clutter
  const activeAlerts = notifications.slice(0, 3);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-400 shrink-0 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-cyan-400 shrink-0" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-950/80 border-red-500/50 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
      case 'warning':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'success':
        return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      default:
        return 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {activeAlerts.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl ${getAlertBg(
              n.type
            )}`}
          >
            <div className="flex items-start gap-2.5">
              {getAlertIcon(n.type)}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">{n.title}</h4>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-[10px] opacity-60 font-mono mt-1 block">
                  {new Date(n.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button
              onClick={clearNotifications}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Clear alerts"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
