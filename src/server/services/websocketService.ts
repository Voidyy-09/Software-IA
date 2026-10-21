import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { config } from '../config.js';
import prisma from '../db/client.js';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

/**
 * Initialize WebSocket server on the HTTP server instance
 */
export function setupWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: config.wsPath });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log(`📡 WebSocket client connected (total: ${clients.size})`);

    // Send initial connection acknowledgment
    ws.send(
      JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        payload: {
          message: 'Connected to Disaster Response Command Server',
          timestamp: new Date().toISOString(),
        },
      })
    );

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`📡 WebSocket client disconnected (total: ${clients.size})`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      clients.delete(ws);
    });
  });

  // Start simulated telemetry broadcast
  startTelemetryBroadcast();

  console.log(`📡 WebSocket server initialized on path: ${config.wsPath}`);
}

/**
 * Broadcast a message to all connected WebSocket clients
 */
export function broadcastMessage(message: { type: string; payload: any }): void {
  const data = JSON.stringify(message);
  let sent = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      sent++;
    }
  }
  if (sent > 0) {
    console.log(`📡 Broadcast [${message.type}] to ${sent} client(s)`);
  }
}

/**
 * Simulate vehicle GPS telemetry updates every 3 seconds.
 * Slightly moves each dispatched/en-route vehicle along random headings.
 */
function startTelemetryBroadcast(): void {
  setInterval(async () => {
    if (clients.size === 0) return;

    try {
      const telemetryRecords = await prisma.vehicleTelemetry.findMany({
        include: {
          vehicle: { select: { id: true, callSign: true, type: true, status: true } },
        },
      });

      const updates = [];

      for (const t of telemetryRecords) {
        const location = JSON.parse(t.location);
        const isMoving =
          t.vehicle.status === 'DISPATCHED' || t.vehicle.status === 'EN_ROUTE';

        if (isMoving) {
          // Simulate slight GPS movement
          const jitterLng = (Math.random() - 0.5) * 0.001;
          const jitterLat = (Math.random() - 0.5) * 0.001;
          location.coordinates[0] += jitterLng;
          location.coordinates[1] += jitterLat;

          // Update in database
          await prisma.vehicleTelemetry.update({
            where: { id: t.id },
            data: {
              location: JSON.stringify(location),
              currentSpeedKmh: 15 + Math.random() * 25,
              heading: (t.heading + (Math.random() - 0.5) * 30) % 360,
              fuelLevelPercent: Math.max(0, t.fuelLevelPercent - 0.05),
            },
          });
        }

        updates.push({
          vehicleId: t.vehicle.id,
          callSign: t.vehicle.callSign,
          type: t.vehicle.type,
          status: t.vehicle.status,
          location: location.coordinates,
          speed: isMoving ? 15 + Math.random() * 25 : 0,
          heading: t.heading,
          fuelLevel: t.fuelLevelPercent,
        });
      }

      if (updates.length > 0) {
        broadcastMessage({
          type: 'TELEMETRY_UPDATE',
          payload: {
            vehicles: updates,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      // Silently handle — telemetry is best-effort
    }
  }, 3000);
}
