import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors, sendSuccess } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
}
