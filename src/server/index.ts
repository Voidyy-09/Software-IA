import express from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config.js';
import { incidentsRouter } from './routes/incidents.js';
import { vehiclesRouter } from './routes/vehicles.js';
import { roadsRouter } from './routes/roads.js';
import { satelliteRouter } from './routes/satellite.js';
import { dispatchRouter } from './routes/dispatch.js';
import { setupWebSocket } from './services/websocketService.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// API Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/roads', roadsRouter);
app.use('/api/satellite', satelliteRouter);
app.use('/api/dispatch', dispatchRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'operational', timestamp: new Date().toISOString(), service: 'Disaster Response Command Server' });
});

// WebSocket
setupWebSocket(server);

server.listen(config.port, () => {
  console.log(`🛰️  Disaster Response Server online at http://localhost:${config.port}`);
  console.log(`📡 WebSocket broadcasting on ws://localhost:${config.port}${config.wsPath}`);
});

export { app, server };
