# Backend Deployment Guide - Vercel Serverless

## Overview

The backend has been converted from an Express monolith to **Vercel serverless functions**. Each API endpoint is now an independent serverless function in the `api/` directory.

## Architecture Change

**Before (Express Monolith):**
```
src/server.ts (single Express app)
├── routes/workflows.ts
├── routes/leases.ts
├── routes/tasks.ts
└── routes/maintenance.ts
```

**After (Vercel Serverless):**
```
api/
├── _utils.ts (shared utilities)
├── health.ts (GET /api/health)
├── workflows.ts (all /api/workflows/* endpoints)
├── leases.ts (all /api/leases/* endpoints)
├── tasks.ts (all /api/tasks/* endpoints)
└── maintenance.ts (all /api/maintenance/* endpoints)
```

## Serverless Functions

Each function handles multiple HTTP methods and routes:

### api/workflows.ts
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get single workflow
- `GET /api/workflows/:id/audit` - Get audit trail
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

Same pattern for leases, tasks, and maintenance endpoints.

## Prerequisites

1. **Vercel CLI** (already installed globally)
2. **Vercel Account** - Sign up at https://vercel.com
3. **Supabase Credentials** - From backend/.env

## Local Testing

### Option 1: Vercel Dev (Recommended)

```bash
cd backend
vercel dev
```

This simulates the Vercel serverless environment locally:
- Runs functions on http://localhost:3000
- Hotreloads on file changes
- Simulates production environment

Test endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Get workflows
curl http://localhost:3000/api/workflows

# Create workflow
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"title":"Test Workflow","assignee":"John Doe"}'
```

### Option 2: Original Express Server (Development Only)

The original Express server still works for local development:

```bash
npm run backend:dev
# Runs on http://localhost:3001
```

**Note:** This won't work on Vercel, only use for local development.

## Production Deployment

### Step 1: Login to Vercel

```bash
vercel login
```

Follow prompts to authenticate.

### Step 2: Configure Environment Variables

You need to set these environment variables in Vercel:

```bash
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
SUPABASE_KEY=<your_anon_key>
CORS_ORIGIN=<your_frontend_url>
```

**Option A: Set via Vercel Dashboard**
1. Go to your project settings
2. Navigate to Environment Variables
3. Add each variable above

**Option B: Set via CLI**
```bash
cd backend
vercel env add SUPABASE_URL production
# Enter value when prompted
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_KEY production
vercel env add CORS_ORIGIN production
```

### Step 3: Deploy Backend

```bash
cd backend
vercel --prod
```

Expected output:
```
🔍  Inspect: https://vercel.com/your-org/aot-backend/...
✅  Production: https://aot-backend-xyz.vercel.app
```

**Important:** Save the production URL! You'll need it for frontend configuration.

### Step 4: Test Deployment

```bash
# Test health endpoint
curl https://your-backend-url.vercel.app/api/health

# Test workflows endpoint
curl https://your-backend-url.vercel.app/api/workflows
```

### Step 5: Deploy Frontend

```bash
cd ..  # Return to root directory

# Create production environment file
echo "VITE_API_URL=https://your-backend-url.vercel.app/api" > .env.production

# Deploy frontend
vercel --prod
```

Save the frontend URL.

### Step 6: Update CORS Origin

Go back to backend project in Vercel dashboard and update `CORS_ORIGIN` to your frontend URL:

```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

Then redeploy backend:
```bash
cd backend
vercel --prod
```

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Yes | eyJhbGc... |
| `SUPABASE_KEY` | Public anon key | Yes | eyJhbGc... |
| `CORS_ORIGIN` | Frontend URL | Yes | https://your-app.vercel.app |
| `NODE_ENV` | Environment | Auto-set | production |

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | https://backend.vercel.app/api |
| `VITE_AI_PROVIDER` | AI provider (github/gemini) | Optional | github |
| `VITE_GITHUB_TOKEN` | GitHub token for AI | Optional | ghp_xxx |

## Troubleshooting

### Error: "Module not found"

Make sure all imports use `.js` extension even for TypeScript files:
```typescript
// ✅ Correct
import { EntityService } from '../src/services/entityService.js';

// ❌ Wrong
import { EntityService } from '../src/services/entityService';
```

### Error: "CORS policy" in browser

1. Check `CORS_ORIGIN` env var is set to frontend URL
2. Verify frontend URL exactly matches (including https://)
3. Redeploy backend after changing CORS_ORIGIN

### Error: "Supabase connection failed"

1. Verify all Supabase env vars are set in Vercel dashboard
2. Check Supabase credentials are correct
3. Test connection: Run `npm run backend:test` locally first

### Error: "Function timeout"

Vercel serverless functions have a 10-second timeout (configurable in vercel.json):
```json
"functions": {
  "api/**/*.ts": {
    "maxDuration": 10
  }
}
```

To increase (Pro plans only):
- Hobby: max 10 seconds
- Pro: max 60 seconds
- Enterprise: max 900 seconds

### Error: "Cannot find module @vercel/node"

```bash
cd backend
npm install
```

## WebSocket Limitation

⚠️ **Important:** Vercel serverless functions do **NOT** support WebSockets.

The real-time sync feature (WebSocket in `src/server.ts`) will not work on Vercel.

**Solutions:**
1. **Disable real-time sync** in production (simplest)
2. **Use Supabase Realtime** instead (recommended)
3. **Deploy WebSocket server separately** to Railway/Render

See `VERCEL_WEBSOCKET_ALTERNATIVE.md` for detailed alternatives.

## Monitoring

Monitor your deployment:
- **Logs:** Vercel dashboard → Your Project → Logs
- **Analytics:** Vercel dashboard → Analytics
- **Functions:** See individual function invocations and errors

## Cost Considerations

**Vercel Hobby (Free) Plan:**
- 100GB bandwidth
- 100 hours serverless function execution/month
- 10-second max duration per function
- Unlimited deployments

**Typical Usage for AOT Asset Management:**
- Average function execution: 200-500ms
- Expected monthly executions: ~10,000 (well within limits)
- Bandwidth usage: ~5-10GB/month

The free tier should be sufficient for development and moderate production use.

## Deployment Checklist

- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Environment variables configured in Vercel dashboard
- [ ] Backend deployed (`cd backend && vercel --prod`)
- [ ] Backend URL saved
- [ ] Frontend .env.production created with backend URL
- [ ] Frontend deployed (`vercel --prod`)
- [ ] Frontend URL saved
- [ ] CORS_ORIGIN updated in backend with frontend URL
- [ ] Backend redeployed with new CORS setting
- [ ] Tested all API endpoints in production
- [ ] Verified CORS works from frontend
- [ ] Documented deployment URLs

## Rollback

If you need to rollback:

```bash
# View deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Continuous Deployment

To enable automatic deployments from Git:

1. Go to Vercel dashboard
2. Import Git repository
3. Configure build settings:
   - **Backend:** Root Directory: `backend`
   - **Frontend:** Root Directory: `.` (root)
4. Set environment variables
5. Enable automatic deployments from main branch

## Next Steps

After deployment:
1. Update CLAUDE.md with production URLs
2. Test all features in production
3. Monitor for errors in Vercel dashboard
4. Consider implementing Supabase Realtime for real-time sync
5. Set up custom domain (optional)

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Supabase Docs: https://supabase.io/docs
