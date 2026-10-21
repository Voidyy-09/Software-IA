import { Router } from 'express';
import prisma from '../db/client.js';
import { broadcastMessage } from '../services/websocketService.js';

export const roadsRouter = Router();

// GET /api/roads/segments — Get all road segments with current state
roadsRouter.get('/segments', async (_req, res) => {
  try {
    const segments = await prisma.roadSegment.findMany({
      include: {
        roadStates: {
          orderBy: { lastUpdated: 'desc' },
          take: 1,
        },
      },
    });
    res.json(segments);
  } catch (error) {
    console.error('Error fetching road segments:', error);
    res.status(500).json({ error: 'Failed to fetch road segments' });
  }
});

// GET /api/roads/hazards — Get all active hazard zones
roadsRouter.get('/hazards', async (_req, res) => {
  try {
    const hazards = await prisma.hazardArea.findMany({
      orderBy: { timestamp: 'desc' },
    });
    res.json(hazards);
  } catch (error) {
    console.error('Error fetching hazard areas:', error);
    res.status(500).json({ error: 'Failed to fetch hazard areas' });
  }
});

// GET /api/roads/segments/:id — Single segment with state history
roadsRouter.get('/segments/:id', async (req, res) => {
  try {
    const segment = await prisma.roadSegment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        roadStates: { orderBy: { lastUpdated: 'desc' } },
      },
    });
    if (!segment) return res.status(404).json({ error: 'Road segment not found' });
    res.json(segment);
  } catch (error) {
    console.error('Error fetching road segment:', error);
    res.status(500).json({ error: 'Failed to fetch road segment' });
  }
});

// PATCH /api/roads/segments/:id/status — Update road status (triggers reroute check)
roadsRouter.patch('/segments/:id/status', async (req, res) => {
  try {
    const segmentId = Number(req.params.id);
    const { status, floodDepthMm, restrictionNotes, currentSpeedKmh, updatedBySource } = req.body;

    // Create new road state entry
    const roadState = await prisma.roadState.create({
      data: {
        segmentId,
        status: status || 'OPEN',
        currentSpeedKmh: currentSpeedKmh ?? (status === 'OPEN' ? 40 : 0),
        floodDepthMm: floodDepthMm ?? 0,
        restrictionNotes: restrictionNotes || null,
        updatedBySource: updatedBySource || 'DISPATCHER_MANUAL',
      },
    });

    // Broadcast road status change via WebSocket
    broadcastMessage({
      type: 'ROAD_STATUS_CHANGED',
      payload: {
        segmentId,
        newStatus: roadState.status,
        floodDepthMm: roadState.floodDepthMm,
        timestamp: new Date().toISOString(),
      },
    });

    // Check if any active routes use this segment and trigger reroute
    const affectedMissions = await prisma.missionAssignment.findMany({
      where: {
        routes: {
          some: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        routes: { where: { status: 'ACTIVE' } },
        vehicle: true,
        incident: true,
      },
    });

    // For affected missions: if new status makes segment impassable, broadcast reroute alert
    if (status === 'CLOSED_FLOODING' || status === 'CLOSED_DAMAGE') {
      for (const mission of affectedMissions) {
        broadcastMessage({
          type: 'ROUTE_INVALIDATED_REROUTING',
          payload: {
            missionId: mission.id,
            vehicleCallSign: mission.vehicle.callSign,
            incidentId: mission.incidentId,
            affectedSegmentId: segmentId,
            reason: `Road segment status changed to ${status}`,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    const segment = await prisma.roadSegment.findUnique({
      where: { id: segmentId },
      include: { roadStates: { orderBy: { lastUpdated: 'desc' }, take: 1 } },
    });

    res.json(segment);
  } catch (error) {
    console.error('Error updating road status:', error);
    res.status(500).json({ error: 'Failed to update road status' });
  }
});
