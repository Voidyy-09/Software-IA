import React, { useState, useEffect } from 'react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ConstraintChecker } from './ConstraintChecker';
import { VehicleSelector } from './VehicleSelector';
import { AlertCircle, Send, CheckCircle2, Navigation, Clock, ShieldCheck, Gauge } from 'lucide-react';
import type { DispatchRecommendation } from '../../types';

export const DispatchModal: React.FC = () => {
  const {
    isDispatchModalOpen,
    setDispatchModalOpen,
    selectedIncidentId,
    incidents,
    vehicles,
    setIncidents,
    setVehicles,
    addNotification,
  } = useEmergencyStore();

  const incident = incidents.find((i) => i.id === selectedIncidentId);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<DispatchRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Set default selected vehicle when modal opens
  useEffect(() => {
    if (isDispatchModalOpen && vehicles.length > 0) {
      // Prefer an amphibious or available unit
      const preferred =
        vehicles.find((v) => v.type === 'AMPHIBIOUS_TRUCK' && v.status === 'AVAILABLE') ||
        vehicles.find((v) => v.status === 'AVAILABLE') ||
        vehicles[0];
      setSelectedVehicleId(preferred.id);
    }
  }, [isDispatchModalOpen, vehicles]);

  // Request route recommendation when vehicle or incident changes
  useEffect(() => {
    if (!isDispatchModalOpen || !incident || !selectedVehicleId) return;

    let isMounted = true;
    setIsLoading(true);

    fetch('/api/dispatch/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: incident.id,
        vehicleId: selectedVehicleId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          const rec =
            data.recommendation ||
            data.recommendations?.find((r: any) => r.vehicle?.id === selectedVehicleId) ||
            data.recommendations?.[0] ||
            null;

          setRecommendation(rec);

          // Sync preview route directly onto the GIS map behind the modal
          if (rec?.route?.pathGeometry) {
            useEmergencyStore.getState().setPreviewRoute({
              pathGeometry: rec.route.pathGeometry,
              callSign: selectedVehicle.callSign,
              estimatedTimeMinutes: rec.route.estimatedTimeMinutes,
              distanceKm: rec.route.distanceKm,
            });
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching recommendation:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDispatchModalOpen, incident, selectedVehicleId]);

  if (!incident) return null;

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const handleConfirmDispatch = async () => {
    if (!selectedVehicleId || !incident) return;
    setIsAssigning(true);

    try {
      const res = await fetch('/api/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          vehicleId: selectedVehicleId,
          routeGeometry: recommendation?.route?.pathGeometry,
        }),
      });

      if (!res.ok) throw new Error('Dispatch assignment failed');
      const data = await res.json();

      // Update incident status locally
      setIncidents(
        incidents.map((inc) =>
          inc.id === incident.id ? { ...inc, status: 'IN_PROGRESS' } : inc
        )
      );

      // Re-fetch vehicles to synchronize full mission and route geometry
      try {
        const vRes = await fetch('/api/vehicles');
        if (vRes.ok) {
          const vData = await vRes.json();
          setVehicles(vData);
        }
      } catch {}

      addNotification({
        id: `dispatch-${Date.now()}`,
        type: 'success',
        title: 'Mission Dispatched',
        message: `${selectedVehicle.callSign} assigned to Incident #${incident.id}. Route pushed over tactical link.`,
        timestamp: new Date().toISOString(),
      });

      useEmergencyStore.getState().setPreviewRoute(null);
      setDispatchModalOpen(false);
    } catch (err) {
      console.error('Failed to dispatch unit:', err);
      addNotification({
        id: `err-${Date.now()}`,
        type: 'critical',
        title: 'Dispatch Assignment Error',
        message: 'Unable to commit mission assignment. Check telemetry link.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    setDispatchModalOpen(open);
    if (!open) {
      useEmergencyStore.getState().setPreviewRoute(null);
    }
  };

  return (
    <Dialog open={isDispatchModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950/98 border border-slate-700/80 text-slate-100 shadow-[0_0_60px_rgba(0,0,0,0.9)] z-[10000]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-cyan-400" />
            <span>Mission Dispatch Protocol & Constraint Verification</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Evaluating optimal route and equipment compatibility for Incident #{incident.id}
          </DialogDescription>
        </DialogHeader>

        {/* Incident Summary Banner */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-400 uppercase bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                {incident.priority}
              </span>
              <h3 className="text-sm font-bold text-white">{incident.type}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{incident.description}</p>
          </div>
        </div>

        {/* Vehicle Selection Grid */}
        <VehicleSelector
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          requiredWaterDepthMm={incident.description.toLowerCase().includes('flood') ? 800 : 300}
        />

        {/* Constraint Verification Matrix */}
        {selectedVehicle && (
          <ConstraintChecker vehicle={selectedVehicle} incident={incident} />
        )}

        {/* Route Assessment Breakdown */}
        {recommendation?.route && (
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Navigation className="h-4 w-4" />
                Optimal Route Calculation
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                PASSABLE PATH FOUND
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">ETA</span>
                <span className="font-bold text-cyan-300 text-sm">
                  {recommendation.route.estimatedTimeMinutes} mins
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Distance</span>
                <span className="font-bold text-slate-200 text-sm">
                  {recommendation.route.distanceKm} km
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase">Segments</span>
                <span className="font-bold text-slate-200 text-sm">
                  {recommendation.route.segmentsUsed.length} linked
                </span>
              </div>
            </div>

            {recommendation.route.hazardWarnings?.length > 0 && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs mt-2">
                <span className="font-bold uppercase text-[10px] block">Hazard Advisory:</span>
                {recommendation.route.hazardWarnings.join(' • ')}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => setDispatchModalOpen(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirmDispatch}
            disabled={isAssigning || !selectedVehicle}
            className="bg-cyan-600 hover:bg-cyan-500 font-bold"
          >
            {isAssigning ? 'Deploying...' : '🚀 Authorize Mission Dispatch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
