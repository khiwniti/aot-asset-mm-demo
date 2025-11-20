import { Router, Request, Response } from 'express';
import { EntityService } from '../services/entityService.js';

const router = Router();

// Create lease
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const lease = await EntityService.createLease(req.body, userId);
    res.status(201).json({ success: true, data: lease });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all leases
router.get('/', async (req: Request, res: Response) => {
  try {
    const leases = await EntityService.getLeases(req.query as any);
    res.json({ success: true, data: leases });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single lease
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lease = await EntityService.getLease(req.params.id);
    res.json({ success: true, data: lease });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Lease not found' });
  }
});

// Update lease
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    const lease = await EntityService.updateLease(req.params.id, req.body, userId);
    res.json({ success: true, data: lease });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete lease
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'system';
    await EntityService.deleteLease(req.params.id, userId);
    res.json({ success: true, message: 'Lease deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit trail for lease
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const trail = await EntityService.getAuditTrail(req.params.id, 'lease');
    res.json({ success: true, data: trail });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
