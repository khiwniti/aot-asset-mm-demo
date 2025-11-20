import { Router, Request, Response } from 'express';
import { EntityService } from '../services/entityService.js';

const router = Router();

// Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const task = await EntityService.createTask(req.body, userId);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const tasks = await EntityService.getTasks(req.query as any);
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await EntityService.getTask(req.params.id);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Task not found' });
  }
});

// Update task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const task = await EntityService.updateTask(req.params.id, req.body, userId);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    await EntityService.deleteTask(req.params.id, userId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit trail for task
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const trail = await EntityService.getAuditTrail(req.params.id, 'task');
    res.json({ success: true, data: trail });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
