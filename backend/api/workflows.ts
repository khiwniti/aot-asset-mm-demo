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
          // Check if it's an audit trail request
          if (query.audit === 'true') {
            const trail = await EntityService.getAuditTrail(id, 'workflow');
            sendSuccess(res, trail);
          } else {
            // Get single workflow
            const workflow = await EntityService.getWorkflow(id);
            sendSuccess(res, workflow);
          }
        } else {
          // Get all workflows
          const workflows = await EntityService.getWorkflows(query as any);
          sendSuccess(res, workflows);
        }
        break;

      case 'POST':
        const newWorkflow = await EntityService.createWorkflow(req.body, userId);
        sendSuccess(res, newWorkflow, 201);
        break;

      case 'PUT':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Workflow ID required'), 400);
        }
        const updatedWorkflow = await EntityService.updateWorkflow(id, req.body, userId);
        sendSuccess(res, updatedWorkflow);
        break;

      case 'DELETE':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Workflow ID required'), 400);
        }
        await EntityService.deleteWorkflow(id, userId);
        sendSuccess(res, { message: 'Workflow deleted' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    sendError(res, error, error.message.includes('not found') ? 404 : 500);
  }
}
