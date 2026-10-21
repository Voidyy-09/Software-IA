import { Router } from 'express';
import prisma from '../db/client.js';
import { findOptimalRoute, checkVehicleConstraints } from '../services/routingEngine.js';
import { broadcastMessage } from '../services/websocketService.js';

export const dispatchRouter = Router();

// POST /api/dispatch/recommend — Calculate optimal vehicle + route
dispatchRouter.post('/recommend', async (req, res) => {
  try {
    const { incidentId } = req.body;

    const incident = await prisma.incidentReport.findUnique({
      where: { id: Number(incidentId) },
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const incidentLocation = JSON.parse(incident.reportedLocation);

    // Get available vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        telemetry: true,
        equipment: { include: { equipment: true } },
      },
    });

    // Get road segments with current states
    const segments = await prisma.roadSegment.findMany({
      include: { roadStates: { orderBy: { lastUpdated: 'desc' }, take: 1 } },
    });

    // Evaluate each vehicle
    const recommendations = [];
    for (const vehicle of vehicles) {
      const vehicleLocation = JSON.parse(
        vehicle.telemetry?.location || vehicle.defaultAssetLocation
      );

      const constraints = checkVehicleConstraints(vehicle, segments);
      const route = findOptimalRoute(vehicleLocation, incidentLocation, segments, vehicle);

      recommendations.push({
        vehicle: {
          id: vehicle.id,
          callSign: vehicle.callSign,
          type: vehicle.type,
          maxWaterDepthMm: vehicle.maxWaterDepthMm,
          maxWeightKg: vehicle.maxWeightKg,
          clearanceM: vehicle.clearanceM,
          fuelLevel: vehicle.telemetry?.fuelLevelPercent ?? 100,
          equipment: vehicle.equipment.map((e) => ({
            name: e.equipment.name,
            quantity: e.quantity,
          })),
        },
        constraintCheck: constraints,
        route: route
          ? {
              pathGeometry: route.path,
              estimatedTimeMinutes: route.estimatedTimeMinutes,
              distanceKm: route.distanceKm,
              segmentsUsed: route.segmentIds,
              hazardWarnings: route.warnings,
            }
          : null,
        score: route
          ? calculateDispatchScore(vehicle, route, constraints)
          : 0,
      });
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    const vehicleId = req.body.vehicleId ? Number(req.body.vehicleId) : null;
    const matchedRec = vehicleId
      ? recommendations.find((r) => r.vehicle.id === vehicleId) || recommendations[0]
      : recommendations[0];

    res.json({
      incidentId: incident.id,
      incidentPriority: incident.priority,
      recommendation: matchedRec || null,
      recommendations,
    });
  } catch (error) {
    console.error('Error computing recommendations:', error);
    res.status(500).json({ error: 'Failed to compute dispatch recommendations' });
  }
});

// POST /api/dispatch/assign — Create mission assignment
dispatchRouter.post('/assign', async (req, res) => {
  try {
    const { incidentId, vehicleId, routeGeometry } = req.body;

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: Number(vehicleId) },
      data: { status: 'EN_ROUTE' },
    });

    // Update incident status
    await prisma.incidentReport.update({
      where: { id: Number(incidentId) },
      data: { status: 'IN_PROGRESS' },
    });

    // Create mission
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(vehicleId) },
      include: { telemetry: true },
    });
    const incident = await prisma.incidentReport.findUnique({ where: { id: Number(incidentId) } });

    if (!vehicle || !incident) {
      return res.status(404).json({ error: 'Vehicle or incident not found' });
    }

    let finalRouteGeometry = routeGeometry;
    if (!finalRouteGeometry) {
      try {
        const segments = await prisma.roadSegment.findMany({
          include: { roadStates: { orderBy: { lastUpdated: 'desc' }, take: 1 } },
        });
        const vLoc = JSON.parse(vehicle.telemetry?.location || vehicle.defaultAssetLocation);
        const incLoc = JSON.parse(incident.reportedLocation);
        const calc = findOptimalRoute(vLoc, incLoc, segments, vehicle);
        if (calc) {
          finalRouteGeometry = calc.path;
        }
      } catch (err) {
        console.error('Fallback route calculation failed:', err);
      }
    }

    const mission = await prisma.missionAssignment.create({
      data: {
        incidentId: Number(incidentId),
        vehicleId: Number(vehicleId),
        routes: {
          create: {
            pathGeometry: finalRouteGeometry || JSON.stringify({ type: 'LineString', coordinates: [] }),
            origin: vehicle.telemetry?.location || vehicle.defaultAssetLocation,
            destination: incident.reportedLocation,
            etaTimestamp: new Date(Date.now() + 15 * 60000),
            status: 'ACTIVE',
          },
        },
      },
      include: {
        vehicle: true,
        incident: true,
        routes: true,
      },
    });

    // Broadcast dispatch event
    broadcastMessage({
      type: 'VEHICLE_DISPATCHED',
      payload: {
        missionId: mission.id,
        vehicleId: vehicle.id,
        vehicleCallSign: vehicle.callSign,
        vehicleType: vehicle.type,
        incidentId: incident.id,
        incidentType: incident.type,
        route: mission.routes[0],
        timestamp: new Date().toISOString(),
      },
    });

    res.status(201).json(mission);
  } catch (error) {
    console.error('Error assigning dispatch:', error);
    res.status(500).json({ error: 'Failed to assign dispatch' });
  }
});

function calculateDispatchScore(
  vehicle: any,
  route: { estimatedTimeMinutes: number; warnings: string[] },
  constraints: { passable: boolean; failedSegments: number[] }
): number {
  let score = 100;

  // Penalize for route time
  score -= route.estimatedTimeMinutes * 2;

  // Penalize for warnings
  score -= route.warnings.length * 10;

  // Penalize for constraint failures
  if (!constraints.passable) score -= 50;

  // Bonus for fuel level
  const fuel = vehicle.telemetry?.fuelLevelPercent ?? 100;
  score += fuel * 0.1;

  // Bonus for equipment
  score += (vehicle.equipment?.length ?? 0) * 5;

  return Math.max(0, Math.round(score));
}
