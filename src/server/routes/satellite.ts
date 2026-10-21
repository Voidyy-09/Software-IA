import { Router } from 'express';
import prisma from '../db/client.js';
import { broadcastMessage } from '../services/websocketService.js';

export const satelliteRouter = Router();

// Simulated satellite AI detection data for the Vidyavihar/Kurla region
const MOCK_SATELLITE_DETECTIONS = [
  {
    id: 'SAT-DET-001',
    type: 'FLOOD',
    confidence: 0.92,
    estimatedDepthMm: 850,
    affectedArea: {
      type: 'Polygon',
      coordinates: [[[72.875, 19.070], [72.890, 19.070], [72.890, 19.078], [72.875, 19.078], [72.875, 19.070]]],
    },
    affectedSegmentIds: [1],
    description: 'Mithi River basin overflow — severe flooding detected via SAR imagery',
    imagery: 'SAR_BAND_C',
  },
  {
    id: 'SAT-DET-002',
    type: 'FLOOD',
    confidence: 0.78,
    estimatedDepthMm: 350,
    affectedArea: {
      type: 'Polygon',
      coordinates: [[[72.850, 19.075], [72.870, 19.075], [72.870, 19.082], [72.850, 19.082], [72.850, 19.075]]],
    },
    affectedSegmentIds: [5],
    description: 'Low-lying section waterlogging detected on Andheri-Kurla Road corridor',
    imagery: 'OPTICAL_MULTISPECTRAL',
  },
  {
    id: 'SAT-DET-003',
    type: 'STRUCTURAL_DAMAGE',
    confidence: 0.85,
    estimatedDepthMm: 0,
    affectedArea: {
      type: 'Point',
      coordinates: [72.866, 19.073],
    },
    affectedSegmentIds: [6],
    description: 'Bridge structural deformation detected — Mithi River crossing',
    imagery: 'SAR_INTERFEROMETRY',
  },
  {
    id: 'SAT-DET-004',
    type: 'FLOOD',
    confidence: 0.45,
    estimatedDepthMm: 120,
    affectedArea: {
      type: 'Polygon',
      coordinates: [[[72.895, 19.072], [72.905, 19.072], [72.905, 19.078], [72.895, 19.078], [72.895, 19.072]]],
    },
    affectedSegmentIds: [4],
    description: 'Minor waterlogging near Somaiya campus — low confidence',
    imagery: 'OPTICAL_RGB',
  },
  {
    id: 'SAT-DET-005',
    type: 'DEBRIS',
    confidence: 0.67,
    estimatedDepthMm: 0,
    affectedArea: {
      type: 'Point',
      coordinates: [72.908, 19.076],
    },
    affectedSegmentIds: [7],
    description: 'Debris field detected near Ghatkopar — possible wall collapse rubble',
    imagery: 'OPTICAL_RGB',
  },
];

// POST /api/satellite/analyze — Run mock AI satellite analysis
satelliteRouter.post('/analyze', async (req, res) => {
  try {
    const { confidenceThreshold = 0.5, floodDepthThresholdMm = 100 } = req.body;

    // Simulate processing delay (200-800ms)
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 600));

    // Filter detections by thresholds
    const detections = MOCK_SATELLITE_DETECTIONS.filter(
      (d) => d.confidence >= confidenceThreshold &&
        (d.type !== 'FLOOD' || d.estimatedDepthMm >= floodDepthThresholdMm)
    );

    res.json({
      analysisId: `ANALYSIS-${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalDetections: detections.length,
      confidenceThreshold,
      floodDepthThresholdMm,
      detections,
      metadata: {
        satelliteId: 'ISRO-RISAT-2B',
        passTime: new Date(Date.now() - 15 * 60000).toISOString(),
        resolution: '5m',
        coverageArea: 'Mumbai Vidyavihar/Kurla Sector',
      },
    });
  } catch (error) {
    console.error('Error in satellite analysis:', error);
    res.status(500).json({ error: 'Satellite analysis failed' });
  }
});

// POST /api/satellite/apply — Apply satellite detections to road states
satelliteRouter.post('/apply', async (req, res) => {
  try {
    const { detectionIds } = req.body;

    const detectionsToApply = MOCK_SATELLITE_DETECTIONS.filter(
      (d) => detectionIds.includes(d.id)
    );

    const updates = [];
    for (const detection of detectionsToApply) {
      for (const segmentId of detection.affectedSegmentIds) {
        let status: 'OPEN' | 'CLOSED_FLOODING' | 'CLOSED_DAMAGE' | 'RESTRICTED' = 'RESTRICTED';
        let speed = 10;

        if (detection.type === 'FLOOD' && detection.estimatedDepthMm > 500) {
          status = 'CLOSED_FLOODING';
          speed = 0;
        } else if (detection.type === 'STRUCTURAL_DAMAGE') {
          status = 'CLOSED_DAMAGE';
          speed = 0;
        }

        const roadState = await prisma.roadState.create({
          data: {
            segmentId,
            status,
            currentSpeedKmh: speed,
            floodDepthMm: detection.estimatedDepthMm,
            updatedBySource: 'SATELLITE_AI',
            restrictionNotes: detection.description,
          },
        });

        updates.push(roadState);

        broadcastMessage({
          type: 'ROAD_STATUS_CHANGED',
          payload: {
            segmentId,
            newStatus: status,
            floodDepthMm: detection.estimatedDepthMm,
            source: 'SATELLITE_AI',
            detectionId: detection.id,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    // Also create HazardArea records
    for (const detection of detectionsToApply) {
      await prisma.hazardArea.create({
        data: {
          type: detection.type,
          severityIndex: detection.confidence * 10,
          geometry: JSON.stringify(detection.affectedArea),
        },
      });
    }

    broadcastMessage({
      type: 'HAZARD_DETECTED',
      payload: {
        detectionCount: detectionsToApply.length,
        source: 'SATELLITE_AI',
        timestamp: new Date().toISOString(),
      },
    });

    res.json({
      applied: updates.length,
      detections: detectionsToApply.map((d) => d.id),
      message: `Applied ${updates.length} road state updates from satellite AI`,
    });
  } catch (error) {
    console.error('Error applying satellite detections:', error);
    res.status(500).json({ error: 'Failed to apply satellite detections' });
  }
});
