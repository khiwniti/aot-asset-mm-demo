# Vercel Deployment Guide - Frontend & Backend with Embedded Environment Variables

This guide explains how to deploy both the frontend and backend to Vercel with environment variables embedded in the `vercel.json` configuration files.

## Architecture Overview

- **Frontend**: React + Vite SPA deployed to Vercel (CDN)
- **Backend**: Express.js API deployed to Vercel (Serverless/Standalone)
- **Database**: Supabase PostgreSQL (external)
- **Real-Time**: WebSocket for browser tab sync

## Prerequisites

1. **Vercel Account** - Create at https://vercel.com
2. **Git Repository** - Connected to your Vercel account
3. **Environment Secrets** - Ready to be added to Vercel

## Environment Variables

### Required Secrets (Must be set in Vercel UI or CLI)

These sensitive values should NOT be committed to the repository:

```
SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (backend only)
GEMINI_API_KEY - Google Gemini API key
GOOGLE_API_KEY - Google API key (optional)
```

### Default Values (Embedded in vercel.json)

These non-sensitive values are embedded in the configuration:

```
VITE_API_URL=https://aot-backend.vercel.app/api
VITE_WS_URL=wss://aot-backend.vercel.app
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_KEY=sb_publishable_7tX3ttUeWOk2jANWdC08dg_H7yxt9h5
CORS_ORIGIN=https://aot-frontend.vercel.app
```

## Deployment Options

### Option 1: Separate Vercel Projects (Recommended)

Deploy frontend and backend as separate Vercel projects for better scalability and management.

#### 1.1 Deploy Frontend

```bash
# From project root
cd /home/engine/project
vercel deploy --prod
```

During the first deployment, Vercel will ask:
- **Project name**: `aot-frontend`
- **Framework preset**: `Vite`
- **Root directory**: `./` (current directory)

#### 1.2 Deploy Backend

```bash
# From backend directory
cd /home/engine/project/backend
vercel deploy --prod
```

During the first deployment:
- **Project name**: `aot-backend`
- **Framework preset**: `Node.js`
- **Root directory**: `./` (backend directory)

#### 1.3 Set Environment Secrets

For each Vercel project:

**Backend Project:**
```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YnlhcHhvYnZwaW96ZGh5eGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIxNTEyNSwiZXhwIjoyMDc2NzkxMTI1fQ.uvJwKkJfsvoLhWwZ9HbkOUZK-gEZbJ_L0xlXxUXAuvs

vercel env add GEMINI_API_KEY
# Paste your Gemini API key

vercel env add GOOGLE_API_KEY
# Paste your Google API key (if available)
```

**Frontend Project:**
```bash
vercel env add GEMINI_API_KEY
# Paste your Gemini API key
```

### Option 2: Monorepo with Root vercel.json

Deploy as a single Vercel project with both frontend and backend.

**Frontend setup uses root vercel.json**
**Backend API routes are available at `/api/*`**

```bash
# Deploy from project root
vercel deploy --prod
```

### Option 3: Using Vercel CLI Dashboard

1. Visit https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Vite (for frontend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm run install:all -- --legacy-peer-deps`
5. Add environment variables in "Settings" → "Environment Variables"

## Configuration Files

### Root vercel.json (Frontend Primary)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm run install:all -- --legacy-peer-deps",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": {
      "value": "https://aot-backend.vercel.app/api"
    },
    "VITE_WS_URL": {
      "value": "wss://aot-backend.vercel.app"
    }
  }
}
```

### backend/vercel.json (Backend Standalone)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "runtime": "nodejs20.x",
  "env": {
    "PORT": { "value": "3001" },
    "NODE_ENV": { "value": "production" }
  }
}
```

## Environment Variables Reference

### Frontend Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://aot-backend.vercel.app/api` | All |
| `VITE_WS_URL` | `wss://aot-backend.vercel.app` | All |
| `GEMINI_API_KEY` | Your API key | Embedded |

### Backend Variables

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `3001` | vercel.json |
| `NODE_ENV` | `production` | vercel.json |
| `SUPABASE_URL` | `https://wvbyapxobvpiozdhyxjj.supabase.co` | vercel.json |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Vercel UI |
| `SUPABASE_KEY` | `sb_publishable_...` | vercel.json |
| `CORS_ORIGIN` | `https://aot-frontend.vercel.app` | vercel.json |
| `GOOGLE_API_KEY` | Secret | Vercel UI |

## Post-Deployment

### 1. Verify Frontend

```bash
curl https://aot-frontend.vercel.app/
# Should return HTML with React app
```

### 2. Verify Backend

```bash
curl https://aot-backend.vercel.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Test API Connection

Open https://aot-frontend.vercel.app and check browser console:
```
✅ Connected to https://aot-backend.vercel.app/api
✅ WebSocket connected to wss://aot-backend.vercel.app
```

### 4. Update CORS_ORIGIN if Needed

If your frontend URL differs, update in backend's Vercel environment variables:

```bash
cd backend
vercel env add CORS_ORIGIN
# Paste: https://your-frontend-url.vercel.app
```

## Troubleshooting

### Build Failures

**Issue**: `npm install` fails with peer dependency warnings

**Solution**: Ensure `--legacy-peer-deps` is in install command:
```json
{
  "installCommand": "npm run install:all -- --legacy-peer-deps"
}
```

### WebSocket Connection Failed

**Issue**: Frontend can't connect to WebSocket

**Solution**: Check that backend is deployed and verify URLs:
- Frontend: `VITE_WS_URL` should point to backend
- Backend: `CORS_ORIGIN` should include frontend URL

```bash
# Test WebSocket connection
wscat -c wss://aot-backend.vercel.app
```

### Database Connection Failed

**Issue**: Backend can't connect to Supabase

**Solution**: Verify environment variables:
```bash
# Check backend env
cd backend
vercel env ls
```

Ensure:
- `SUPABASE_URL` is correct
- `SUPABASE_SERVICE_ROLE_KEY` is set
- Supabase project is active

### CORS Errors

**Issue**: Browser blocks API requests with CORS error

**Solution**: Update `CORS_ORIGIN` in backend environment:
```bash
cd backend
vercel env add CORS_ORIGIN
# Paste your frontend's actual URL
```

### Vercel CLI Not Installed

```bash
npm install -g vercel
vercel login
```

## Development vs Production

### Local Development

```bash
npm run install:all -- --legacy-peer-deps
npm run dev:full
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- WebSocket: ws://localhost:3001

### Production (Vercel)

- Frontend: https://aot-frontend.vercel.app
- Backend: https://aot-backend.vercel.app
- WebSocket: wss://aot-backend.vercel.app

Environment variables automatically injected from vercel.json and Vercel UI.

## Advanced Configuration

### Custom Domain

1. Add domain in Vercel dashboard
2. Update DNS records
3. Update `CORS_ORIGIN` if needed

### Performance

- Frontend: CDN cache (default 60s)
- Backend: Cold start optimization in vercel.json
- Database: Supabase connection pooling

### Monitoring

- Vercel Dashboard: Real-time logs
- Supabase Dashboard: Database queries
- Frontend console: API errors and WebSocket status

## CI/CD Pipeline

Push to main/deploy branch to automatically trigger Vercel deployment:

```bash
git push origin deploy-vercel-embed-env-backend-frontend
```

Vercel will:
1. Install dependencies with `--legacy-peer-deps`
2. Build frontend and backend
3. Run tests (if configured)
4. Deploy to CDN and serverless

## Rollback

To rollback to previous deployment:

1. Go to Vercel dashboard
2. Select the project
3. Find previous successful deployment
4. Click "Redeploy"

Or via CLI:
```bash
vercel rollback
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Express on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/node.js)
- [Supabase Client](https://supabase.com/docs/reference/javascript)

## Quick Reference Commands

```bash
# Deploy frontend
vercel deploy --prod

# Deploy backend
cd backend && vercel deploy --prod

# Check deployment logs
vercel logs

# View environment variables
vercel env ls

# Add/update environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env remove VARIABLE_NAME

# Switch projects
vercel switch

# Pull environment variables locally
vercel env pull .env.local
```

## Support

For issues or questions:
- Check Vercel logs: `vercel logs`
- Review vercel.json configuration
- Verify environment variables are set
- Test API endpoints directly
- Check browser console for frontend errors
