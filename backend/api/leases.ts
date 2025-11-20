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
            const trail = await EntityService.getAuditTrail(id, 'lease');
            sendSuccess(res, trail);
          } else {
            const lease = await EntityService.getLease(id);
            sendSuccess(res, lease);
          }
        } else {
          const leases = await EntityService.getLeases(query as any);
          sendSuccess(res, leases);
        }
        break;

      case 'POST':
        const newLease = await EntityService.createLease(req.body, userId);
        sendSuccess(res, newLease, 201);
        break;

      case 'PUT':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Lease ID required'), 400);
        }
        const updatedLease = await EntityService.updateLease(id, req.body, userId);
        sendSuccess(res, updatedLease);
        break;

      case 'DELETE':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Lease ID required'), 400);
        }
        await EntityService.deleteLease(id, userId);
        sendSuccess(res, { message: 'Lease deleted' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    sendError(res, error, error.message.includes('not found') ? 404 : 500);
  }
}
