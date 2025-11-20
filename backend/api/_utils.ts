import { VercelRequest, VercelResponse } from '@vercel/node';

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:12000',
  'http://localhost:12001',
  process.env.CORS_ORIGIN,
  'https://work-1-nvjkruptxhrwgfhq.prod-runtime.all-hands.dev',
  'https://work-2-nvjkruptxhrwgfhq.prod-runtime.all-hands.dev'
].filter(Boolean);

export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Allow all origins in development
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

export function sendError(res: VercelResponse, error: any, status: number = 500) {
  console.error('Error:', error);
  res.status(status).json({
    success: false,
    error: error.message || 'Internal server error'
  });
}

export function sendSuccess(res: VercelResponse, data: any, status: number = 200) {
  res.status(status).json({
    success: true,
    data
  });
}

export function getUserId(req: VercelRequest): string {
  return (req.headers['x-user-id'] as string) || 'system';
}
