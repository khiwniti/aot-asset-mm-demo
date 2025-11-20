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
            const trail = await EntityService.getAuditTrail(id, 'task');
            sendSuccess(res, trail);
          } else {
            const task = await EntityService.getTask(id);
            sendSuccess(res, task);
          }
        } else {
          const tasks = await EntityService.getTasks(query as any);
          sendSuccess(res, tasks);
        }
        break;

      case 'POST':
        const newTask = await EntityService.createTask(req.body, userId);
        sendSuccess(res, newTask, 201);
        break;

      case 'PUT':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Task ID required'), 400);
        }
        const updatedTask = await EntityService.updateTask(id, req.body, userId);
        sendSuccess(res, updatedTask);
        break;

      case 'DELETE':
        if (!id || typeof id !== 'string') {
          return sendError(res, new Error('Task ID required'), 400);
        }
        await EntityService.deleteTask(id, userId);
        sendSuccess(res, { message: 'Task deleted' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    sendError(res, error, error.message.includes('not found') ? 404 : 500);
  }
}
