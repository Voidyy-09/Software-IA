import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a timestamp to a readable time string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Format a duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Parse GeoJSON coordinate from string
 */
export function parseGeoJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Get priority display config
 */
export function getPriorityConfig(priority: string) {
  const configs: Record<string, { label: string; color: string; bgClass: string; icon: string }> = {
    CRITICAL: { label: 'CRITICAL', color: '#ef4444', bgClass: 'status-critical', icon: '🔴' },
    HIGH: { label: 'HIGH', color: '#f59e0b', bgClass: 'status-high', icon: '🟠' },
    MEDIUM: { label: 'MEDIUM', color: '#3b82f6', bgClass: 'status-medium', icon: '🔵' },
    LOW: { label: 'LOW', color: '#22c55e', bgClass: 'status-low', icon: '🟢' },
  };
  return configs[priority] || configs.MEDIUM;
}

/**
 * Get vehicle type display config
 */
export function getVehicleConfig(type: string) {
  const configs: Record<string, { label: string; icon: string; color: string }> = {
    AMPHIBIOUS_TRUCK: { label: 'Amphibious Truck', icon: '🚛', color: '#06b6d4' },
    BOAT: { label: 'Inflatable Boat', icon: '🚤', color: '#3b82f6' },
    '4X4_AMBULANCE': { label: '4×4 Ambulance', icon: '🚑', color: '#10b981' },
    HELICOPTER: { label: 'Helicopter', icon: '🚁', color: '#8b5cf6' },
    STANDARD: { label: 'Standard Unit', icon: '🚐', color: '#64748b' },
  };
  return configs[type] || configs.STANDARD;
}

/**
 * Get road status display config
 */
export function getRoadStatusConfig(status: string) {
  const configs: Record<string, { label: string; color: string; lineColor: string }> = {
    OPEN: { label: 'Open', color: '#22c55e', lineColor: '#22c55e' },
    CLOSED_FLOODING: { label: 'Flooded', color: '#ef4444', lineColor: '#ef4444' },
    CLOSED_DAMAGE: { label: 'Damaged', color: '#f43f5e', lineColor: '#f43f5e' },
    RESTRICTED: { label: 'Restricted', color: '#f59e0b', lineColor: '#f59e0b' },
  };
  return configs[status] || configs.OPEN;
}
