import { Router, Request, Response } from 'express';
import { EntityService } from '../services/entityService.js';

const router = Router();

// Create maintenance request
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const request = await EntityService.createMaintenanceRequest(req.body, userId);
    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all maintenance requests
router.get('/', async (req: Request, res: Response) => {
  try {
    const requests = await EntityService.getMaintenanceRequests(req.query as any);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single maintenance request
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const request = await EntityService.getMaintenanceRequest(req.params.id);
    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Maintenance request not found' });
  }
});

// Update maintenance request
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const request = await EntityService.updateMaintenanceRequest(req.params.id, req.body, userId);
    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete maintenance request
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    await EntityService.deleteMaintenanceRequest(req.params.id, userId);
    res.json({ success: true, message: 'Maintenance request deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit trail for maintenance request
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const trail = await EntityService.getAuditTrail(req.params.id, 'maintenance_request');
    res.json({ success: true, data: trail });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
