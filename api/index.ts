import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Route imports
import workflowRoutes from '../backend/src/routes/workflows.js';
import leaseRoutes from '../backend/src/routes/leases.js';
import taskRoutes from '../backend/src/routes/tasks.js';
import maintenanceRoutes from '../backend/src/routes/maintenance.js';

dotenv.config();

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/workflows', workflowRoutes);
app.use('/leases', leaseRoutes);
app.use('/tasks', taskRoutes);
app.use('/maintenance', maintenanceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Vercel Serverless Function Handler
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
