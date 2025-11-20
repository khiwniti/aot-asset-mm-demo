import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors, sendError, sendSuccess, getUserId } from './_utils';
import { EntityService } from '../src/services/entityService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { method, query } = req;
  const { id } = query;

  try {
    const userId = getUserId(req);

    switch (method) {
      case 'GET':
        if (id && typeof id === 'string') {
          if (query.audit === 'true') {
            const trail = await EntityService.getAuditTrail(id, 'maintenance_request');
            sendSuccess(res, trail);
          } else {
            const request = await EntityService.getMaintenanceRequest(id);
            sendSuccess(res, request);
          }
        } else {
          const requests = await EntityService.getMaintenanceRequests(query as any);
          sendSuccess(res, requests);
        }
        break;

      case 'POST':
        const newRequest = await EntityService.createMaintenanceRequest(req.body, userId);
        sendSuccess(res, newRequest, 201);
        break;

      case 'PUT':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Maintenance request ID required'), 400);
        }
        const updatedRequest = await EntityService.updateMaintenanceRequest(id, req.body, userId);
        sendSuccess(res, updatedRequest);
        break;

      case 'DELETE':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Maintenance request ID required'), 400);
        }
        await EntityService.deleteMaintenanceRequest(id, userId);
        sendSuccess(res, { message: 'Maintenance request deleted' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    sendError(res, error, error.message.includes('not found') ? 404 : 500);
  }
}
