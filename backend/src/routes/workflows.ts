import { Router, Request, Response } from 'express';
import { EntityService } from '../services/entityService.js';
import { Workflow } from '../types/index.js';

const router = Router();

// Create workflow
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const workflow = await EntityService.createWorkflow(req.body, userId);
    res.status(201).json({ success: true, data: workflow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workflows
router.get('/', async (req: Request, res: Response) => {
  try {
    const workflows = await EntityService.getWorkflows(req.query as any);
    res.json({ success: true, data: workflows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single workflow
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await EntityService.getWorkflow(req.params.id);
    res.json({ success: true, data: workflow });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Workflow not found' });
  }
});

// Update workflow
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const workflow = await EntityService.updateWorkflow(req.params.id, req.body, userId);
    res.json({ success: true, data: workflow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    await EntityService.deleteWorkflow(req.params.id, userId);
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit trail for workflow
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const trail = await EntityService.getAuditTrail(req.params.id, 'workflow');
    res.json({ success: true, data: trail });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
