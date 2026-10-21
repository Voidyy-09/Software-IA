import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { History, Search, Download, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface MissionLog {
  id: string;
  timestamp: string;
  callSign: string;
  incidentType: string;
  action: 'DISPATCH' | 'REROUTE_TRIGGERED' | 'SATELLITE_HAZARD_APPLIED' | 'MISSION_RESOLVED';
  status: 'SUCCESS' | 'REROUTED' | 'ALERT';
  notes: string;
}

const MOCK_MISSION_LOGS: MissionLog[] = [
  {
    id: 'LOG-1092',
    timestamp: '2026-10-21T01:15:30Z',
    callSign: 'NDRF-AMPHIB-01',
    incidentType: 'Mithi River Stranded',
    action: 'REROUTE_TRIGGERED',
    status: 'REROUTED',
    notes: 'LBS Marg flooded (850mm > clearance). Dijkstra recalculation routed via EE Highway.',
  },
  {
    id: 'LOG-1091',
    timestamp: '2026-10-21T01:12:00Z',
    callSign: 'SYSTEM_AI',
    incidentType: 'Hazard Scan',
    action: 'SATELLITE_HAZARD_APPLIED',
    status: 'ALERT',
    notes: 'RISAT-2B SAR detection SAT-DET-001 committed to GIS layer. 850mm flood vector added.',
  },
  {
    id: 'LOG-1090',
    timestamp: '2026-10-21T01:05:12Z',
    callSign: 'NDRF-BOAT-02',
    incidentType: 'Kurla West Rescue',
    action: 'DISPATCH',
    status: 'SUCCESS',
    notes: 'Inflatable boat unit authorized. Water clearance satisfied (unlimited float).',
  },
  {
    id: 'LOG-1089',
    timestamp: '2026-10-21T00:52:45Z',
    callSign: '4X4-AMB-03',
    incidentType: 'Somaiya Campus Medical',
    action: 'MISSION_RESOLVED',
    status: 'SUCCESS',
    notes: 'Extricated 3 stranded faculty. Transported to Rajawadi Hospital safe.',
  },
  {
    id: 'LOG-1088',
    timestamp: '2026-10-21T00:40:19Z',
    callSign: 'NDRF-AMPHIB-01',
    incidentType: 'Ghatkopar Wall Collapse',
    action: 'DISPATCH',
    status: 'SUCCESS',
    notes: 'Winch equipment constraint verified. Deployed with heavy hydraulic extrication kit.',
  },
];

export const MissionHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = MOCK_MISSION_LOGS.filter((log) => {
    const matchesSearch =
      log.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.incidentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-md">
      {/* Logs Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Real-Time Audit Trail & Historic Dispatches ({filteredLogs.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail..."
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
          >
            <option value="ALL">All Events</option>
            <option value="DISPATCH">Dispatches</option>
            <option value="REROUTE_TRIGGERED">Reroutes</option>
            <option value="SATELLITE_HAZARD_APPLIED">Satellite Alerts</option>
            <option value="MISSION_RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead>Log ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Unit / Source</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Audit Log Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-slate-800/60 hover:bg-slate-800/30">
                <TableCell className="font-mono text-xs font-bold text-slate-400">
                  {log.id}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-cyan-300">
                  {log.callSign}
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.status === 'SUCCESS'
                        ? 'success'
                        : log.status === 'REROUTED'
                        ? 'warning'
                        : 'destructive'
                    }
                    className="text-[10px] font-mono"
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-300 max-w-md font-sans">
                  {log.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
