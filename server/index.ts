import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabaseService } from '../services/supabaseService';
import { enhancedAgentService } from '../services/enhancedAgentService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const supabaseHealthy = await supabaseService.healthCheck();
    const agentHealthy = await enhancedAgentService.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseHealthy ? 'healthy' : 'unhealthy',
        agent: agentHealthy ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Agent command endpoint
app.post('/api/agent/command', async (req, res) => {
  try {
    const command = req.body;
    
    // Validate command structure
    if (!command.type || !command.entityType || !command.naturalLanguage || !command.userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid command structure',
        errors: ['Missing required fields: type, entityType, naturalLanguage, userId']
      });
    }
    
    const response = await enhancedAgentService.processCommand(command);
    res.json(response);
  } catch (error) {
    console.error('Agent command error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process agent command',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
});

// Entity CRUD endpoints
app.get('/api/entities/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const filters = req.query;
    
    const { data, error } = await supabaseService.getAll(type, filters);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch entities',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Entity fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/entities/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    const { data, error } = await supabaseService.getById(type, id);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch entity',
        error: error.message
      });
    }
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Entity fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/entities/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const entityData = req.body;
    
    // Add timestamps and version
    const enhancedData = {
      ...entityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    const { data, error } = await supabaseService.create(type, enhancedData);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create entity',
        error: error.message
      });
    }
    
    // Create audit trail
    await supabaseService.createAuditTrail({
      entityType: type,
      entityId: data.id,
      userId: entityData.createdBy || 'unknown',
      operation: 'create',
      newValue: data
    });
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Entity creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create entity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/entities/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const updates = req.body;
    
    // Get current entity for audit trail
    const { data: currentData, error: fetchError } = await supabaseService.getById(type, id);
    if (fetchError || !currentData) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }
    
    // Add updated timestamp
    const enhancedUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const { data, error } = await supabaseService.update(type, id, enhancedUpdates);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update entity',
        error: error.message
      });
    }
    
    // Create audit trail
    await supabaseService.createAuditTrail({
      entityType: type,
      entityId: id,
      userId: updates.updatedBy || 'unknown',
      operation: 'update',
      newValue: data
    });
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Entity update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update entity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/entities/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { userId } = req.body;
    
    // Get current entity for audit trail
    const { data: currentData, error: fetchError } = await supabaseService.getById(type, id);
    if (fetchError || !currentData) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }
    
    const { error } = await supabaseService.delete(type, id);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete entity',
        error: error.message
      });
    }
    
    // Create audit trail
    await supabaseService.createAuditTrail({
      entityType: type,
      entityId: id,
      userId: userId || 'unknown',
      operation: 'delete',
      oldValue: currentData
    });
    
    res.json({
      success: true,
      message: 'Entity deleted successfully'
    });
  } catch (error) {
    console.error('Entity deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Status change endpoints
app.put('/api/entities/:type/:id/status', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status, userId } = req.body;
    
    // Validate status transition
    const currentEntity = await supabaseService.getById(type, id);
    if (!currentEntity.data) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }
    
    const isValidTransition = enhancedAgentService.validateStatusTransition(
      type, 
      currentEntity.data.status, 
      status
    );
    
    if (!isValidTransition) {
      const validTransitions = enhancedAgentService.getValidTransitions(
        type, 
        currentEntity.data.status
      );
      
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentEntity.data.status} to ${status}`,
        validTransitions
      });
    }
    
    const { data, error } = await supabaseService.update(type, id, { 
      status, 
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update status',
        error: error.message
      });
    }
    
    // Create audit trail
    await supabaseService.createAuditTrail({
      entityType: type,
      entityId: id,
      userId: userId || 'unknown',
      operation: 'status_change',
      fieldChanged: 'status',
      oldValue: currentEntity.data.status,
      newValue: status
    });
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Lease-specific endpoints
app.get('/api/leases/expiring/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    const { data, error } = await supabaseService.getLeasesExpiringWithin(days);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch expiring leases',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Expiring leases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring leases',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Task-specific endpoints
app.get('/api/tasks/workflow/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { data, error } = await supabaseService.getTasksByWorkflow(workflowId);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch workflow tasks',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Workflow tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow tasks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Maintenance-specific endpoints
app.get('/api/maintenance/priority/:priority', async (req, res) => {
  try {
    const { priority } = req.params;
    const { data, error } = await supabaseService.getMaintenanceByPriority(priority);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch maintenance requests by priority',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Maintenance priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance requests by priority',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Audit trail endpoints
app.get('/api/audit/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { data, error } = await supabaseService.getAuditTrail(entityType, entityId);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch audit trail',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Audit trail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Notification endpoints
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabaseService.getUnreadNotifications(userId);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { error } = await supabaseService.markNotificationRead(notificationId);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Agent endpoint: http://localhost:${PORT}/api/agent/command`);
  console.log(`📝 Entity CRUD: http://localhost:${PORT}/api/entities/:type`);
});

export default app;
