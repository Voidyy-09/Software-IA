import { Router } from 'express';
import prisma from '../db/client.js';

export const incidentsRouter = Router();

// GET /api/incidents — List all incidents with optional filters
incidentsRouter.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const incidents = await prisma.incidentReport.findMany({
      where,
      include: {
        missions: {
          include: {
            vehicle: true,
            routes: { orderBy: { generatedAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: [
        { priority: 'asc' }, // CRITICAL first
        { timestamp: 'desc' },
      ],
    });

    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/incidents/:id — Get single incident
incidentsRouter.get('/:id', async (req, res) => {
  try {
    const incident = await prisma.incidentReport.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        missions: {
          include: {
            vehicle: { include: { telemetry: true, equipment: { include: { equipment: true } } } },
            routes: { orderBy: { generatedAt: 'desc' } },
          },
        },
      },
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// POST /api/incidents — Create new incident
incidentsRouter.post('/', async (req, res) => {
  try {
    const { reportedLocation, type, description, priority } = req.body;
    const incident = await prisma.incidentReport.create({
      data: {
        reportedLocation: typeof reportedLocation === 'string' ? reportedLocation : JSON.stringify(reportedLocation),
        type,
        description,
        priority: priority || 'HIGH',
        status: 'NEW',
      },
    });
    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// PATCH /api/incidents/:id — Update incident status
incidentsRouter.patch('/:id', async (req, res) => {
  try {
    const { status, priority } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    const incident = await prisma.incidentReport.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});
