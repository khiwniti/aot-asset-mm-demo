import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Route imports
import workflowRoutes from './routes/workflows.js';
import leaseRoutes from './routes/leases.js';
import taskRoutes from './routes/tasks.js';
import maintenanceRoutes from './routes/maintenance.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Create HTTP server
const server = createServer(app);

// WebSocket setup for real-time sync
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('✅ WebSocket client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 WebSocket message:', message);

      // Broadcast to all clients except sender
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
server.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  AOT Asset Management Backend              ║
║  Server running at http://localhost:${port}   ║
╚════════════════════════════════════════════╝
`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`✅ CORS Origin: ${corsOrigin}`);
  console.log(`✅ WebSocket ready for real-time sync`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
