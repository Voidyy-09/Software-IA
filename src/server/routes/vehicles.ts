import { Router } from 'express';
import prisma from '../db/client.js';

export const vehiclesRouter = Router();

// GET /api/vehicles — List all vehicles with telemetry & equipment
vehiclesRouter.get('/', async (_req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        agency: true,
        telemetry: true,
        equipment: { include: { equipment: true } },
        missions: {
          where: { routes: { some: { status: 'ACTIVE' } } },
          include: { incident: true, routes: { where: { status: 'ACTIVE' }, take: 1 } },
        },
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// GET /api/vehicles/telemetry — Live telemetry for all vehicles
vehiclesRouter.get('/telemetry', async (_req, res) => {
  try {
    const telemetry = await prisma.vehicleTelemetry.findMany({
      include: {
        vehicle: {
          select: { id: true, callSign: true, type: true, status: true },
        },
      },
    });
    res.json(telemetry);
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

// GET /api/vehicles/:id — Single vehicle detail
vehiclesRouter.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        agency: true,
        telemetry: true,
        equipment: { include: { equipment: true } },
        missions: { include: { incident: true, routes: true } },
      },
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// PATCH /api/vehicles/:id/status — Update vehicle status
vehiclesRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { telemetry: true },
    });
    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    res.status(500).json({ error: 'Failed to update vehicle status' });
  }
});
