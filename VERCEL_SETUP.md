# Vercel Setup & Configuration

This document provides complete setup instructions for deploying the AOT Asset Management application to Vercel with embedded environment variables in `vercel.json` files.

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed locally
- Vercel account (https://vercel.com)
- Git repository connected to Vercel
- All required environment secrets ready

### 2. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 3. Configure Environment Variables

#### Backend Environment Secrets (Sensitive)

These MUST be added through Vercel UI or CLI (never commit):

```bash
cd backend
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add GEMINI_API_KEY
# Paste your Google Gemini API key

vercel env add GOOGLE_API_KEY
# Paste your Google API key (optional)
```

#### Frontend Environment Secrets

```bash
vercel env add GEMINI_API_KEY
# Paste your Google Gemini API key
```

### 4. Deploy Frontend

```bash
# From project root
vercel deploy --prod
```

**Note the deployment URL** - you'll need it to update backend's CORS_ORIGIN

### 5. Deploy Backend

```bash
cd backend
vercel deploy --prod
cd ..
```

**Note the deployment URL** - you'll need it for frontend's API_URL

### 6. Update CORS Origin in Backend

If your frontend URL is different from `https://aot-frontend.vercel.app`:

```bash
cd backend
vercel env add CORS_ORIGIN
# Paste: https://your-actual-frontend-url.vercel.app
cd ..
```

### 7. Update API URLs in Frontend (if needed)

If your backend URL is different from `https://aot-backend.vercel.app`:

Add to your `.env`:
```
VITE_API_URL=https://your-actual-backend-url.vercel.app/api
VITE_WS_URL=wss://your-actual-backend-url.vercel.app
```

Then redeploy frontend:
```bash
vercel deploy --prod
```

## Project Structure for Vercel

```
/home/engine/project/
├── vercel.json                    # Frontend config
├── vite.config.ts                 # Vite build config
├── package.json                   # Frontend + install scripts
├── .env.example                   # Example env vars
├── dist/                          # Built frontend (created on deploy)
├── src/                           # Frontend source
├── backend/
│   ├── vercel.json               # Backend config
│   ├── package.json              # Backend dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── dist/                     # Built backend (created on deploy)
│   └── src/
│       ├── server.ts             # Express app entry
│       ├── routes/               # API endpoints
│       ├── services/             # Business logic
│       ├── database/             # Database utilities
│       ├── types/                # TypeScript types
│       └── utils/                # Utilities
└── scripts/
    └── vercel-deploy.sh          # Deployment helper
```

## Configuration Files

### Root vercel.json

**Location**: `/home/engine/project/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm run install:all -- --legacy-peer-deps",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": {
      "description": "Backend API URL",
      "value": "https://aot-backend.vercel.app/api"
    },
    "VITE_WS_URL": {
      "description": "WebSocket URL",
      "value": "wss://aot-backend.vercel.app"
    }
  }
}
```

**Key configurations:**
- `installCommand`: Includes `--legacy-peer-deps` for React 19 compatibility
- `buildCommand`: Runs `npm run build` which builds both frontend via Vite
- `outputDirectory`: `dist` - where Vite outputs the built SPA
- `env`: Non-sensitive environment variables embedded in config
- `framework`: `vite` - tells Vercel this is a Vite project

### Backend vercel.json

**Location**: `/home/engine/project/backend/vercel.json`

```json
{
  "version": 2,
  "name": "aot-backend",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "runtime": "nodejs20.x",
  "env": {
    "PORT": { "value": "3001" },
    "NODE_ENV": { "value": "production" },
    "SUPABASE_URL": { "value": "https://wvbyapxobvpiozdhyxjj.supabase.co" },
    "SUPABASE_KEY": { "value": "sb_publishable_7tX3ttUeWOk2jANWdC08dg_H7yxt9h5" },
    "CORS_ORIGIN": { "value": "https://aot-frontend.vercel.app" }
  },
  "functions": {
    "src/server.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

**Key configurations:**
- `buildCommand`: `npm run build` - runs TypeScript compilation
- `outputDirectory`: `dist` - where compiled JS is output
- `runtime`: `nodejs20.x` - Node.js version for serverless
- `env`: Default environment variables (non-sensitive)
- `functions`: Serverless function memory and timeout settings

## Environment Variables Reference

### Frontend Environment Variables

These are used by the React SPA at build and runtime:

| Variable | Source | Example |
|----------|--------|---------|
| `VITE_API_URL` | vercel.json | `https://aot-backend.vercel.app/api` |
| `VITE_WS_URL` | vercel.json | `wss://aot-backend.vercel.app` |
| `GEMINI_API_KEY` | Vercel UI (secret) | `AIza...` |

### Backend Environment Variables

These are used by the Express server:

| Variable | Source | Example | Required |
|----------|--------|---------|----------|
| `PORT` | vercel.json | `3001` | No |
| `NODE_ENV` | vercel.json | `production` | No |
| `SUPABASE_URL` | vercel.json | `https://wvbyapxobvpiozdhyxjj.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel UI (secret) | `eyJ...` | Yes |
| `SUPABASE_KEY` | vercel.json | `sb_publishable_...` | No |
| `CORS_ORIGIN` | vercel.json | `https://aot-frontend.vercel.app` | No |
| `GOOGLE_API_KEY` | Vercel UI (secret) | `AIza...` | No |

## Verification Steps

### 1. Check Deployment Status

```bash
# Frontend
curl https://aot-frontend.vercel.app/

# Backend API Health
curl https://aot-backend.vercel.app/api/health
```

Expected response from backend:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Check Environment Variables

```bash
# List frontend env vars
vercel env ls

# List backend env vars
cd backend
vercel env ls
```

### 3. Monitor Logs

```bash
# Frontend logs
vercel logs

# Backend logs
cd backend
vercel logs
```

### 4. Test API Connection from Frontend

Open https://aot-frontend.vercel.app and check browser console:

```javascript
// Should show successful connection
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('WS URL:', import.meta.env.VITE_WS_URL);
```

## Troubleshooting

### Build Failures

**Problem**: `npm install` fails with peer dependency errors

**Solution**: Root `vercel.json` already includes `--legacy-peer-deps`:
```json
{
  "installCommand": "npm run install:all -- --legacy-peer-deps"
}
```

### WebSocket Connection Fails

**Problem**: Frontend can't connect to WebSocket

**Solution**: 
1. Verify backend is deployed: `curl https://aot-backend.vercel.app/api/health`
2. Check frontend env vars point to correct backend URL
3. Update `CORS_ORIGIN` in backend if frontend URL changed

```bash
cd backend
vercel env add CORS_ORIGIN
# Add your frontend URL
```

### Database Connection Fails

**Problem**: Backend can't connect to Supabase

**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in backend
2. Check Supabase project is active
3. Verify firewall/IP allowlist includes Vercel

```bash
cd backend
vercel env ls  # Check SUPABASE_SERVICE_ROLE_KEY is present
```

### CORS Errors

**Problem**: Browser blocks requests with CORS error

**Solution**: Update backend's `CORS_ORIGIN` environment variable to match frontend URL:

```bash
cd backend
vercel env add CORS_ORIGIN
# Paste your actual frontend URL from https://vercel.com/dashboard
```

Then redeploy backend:
```bash
vercel deploy --prod
```

### API URLs Not Updating

**Problem**: Frontend still using old backend URL

**Solution**: 
1. Update `vite.config.ts` or `.env` file
2. Trigger frontend redeployment
3. Or add `VITE_API_URL` and `VITE_WS_URL` in Vercel dashboard

```bash
vercel deploy --prod
```

## Deployment Helper Script

Use the provided deployment script for easier management:

```bash
# Deploy both frontend and backend
./scripts/vercel-deploy.sh both

# Deploy only frontend
./scripts/vercel-deploy.sh frontend

# Deploy only backend
./scripts/vercel-deploy.sh backend

# Preview (non-production) deployment
./scripts/vercel-deploy.sh preview

# List environment variables
./scripts/vercel-deploy.sh env-list

# Add environment variable
./scripts/vercel-deploy.sh env-add VARIABLE_NAME

# Rollback deployment
./scripts/vercel-deploy.sh rollback frontend

# Show logs
./scripts/vercel-deploy.sh logs backend

# Help
./scripts/vercel-deploy.sh help
```

## Local Development

To test locally before Vercel deployment:

```bash
# Install dependencies
npm run install:all -- --legacy-peer-deps

# Start both frontend and backend
npm run dev:full

# Or start separately
npm run backend:dev  # Terminal 1 - Backend at http://localhost:3001
npm run dev         # Terminal 2 - Frontend at http://localhost:5173
```

## Production Environment

Once deployed to Vercel:

**Frontend**: https://aot-frontend.vercel.app
- Built SPA served from CDN
- Auto-connected to backend via `VITE_API_URL` and `VITE_WS_URL`

**Backend**: https://aot-backend.vercel.app
- Express server running as serverless functions
- WebSocket support for real-time sync
- Connected to Supabase PostgreSQL

## Adding Custom Domains

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Follow DNS configuration instructions
6. Update `CORS_ORIGIN` in backend if needed

## CI/CD Automatic Deployments

Vercel automatically deploys when pushing to your main branch:

```bash
# Push to main/deploy branch
git push origin deploy-vercel-embed-env-backend-frontend
```

Vercel will:
1. Install dependencies with configured command
2. Build frontend and backend
3. Run any configured tests
4. Deploy to CDN (frontend) and serverless (backend)

## Important Notes

1. **Environment Secrets**: Never commit sensitive values like `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to git. Add them through Vercel UI only.

2. **Legacy Peer Deps**: React 19 requires `--legacy-peer-deps` flag. It's included in `vercel.json` installCommand.

3. **Cold Starts**: First request after deployment may be slower due to serverless cold start. Subsequent requests are fast.

4. **WebSocket**: Use `wss://` (secure) for WebSocket in production, not `ws://`.

5. **CORS**: Make sure `CORS_ORIGIN` matches your frontend URL exactly.

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Express on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/node.js)
- [Supabase Documentation](https://supabase.com/docs)

## Next Steps

1. Set up Vercel projects for frontend and backend
2. Add environment secrets via Vercel UI
3. Deploy frontend: `vercel deploy --prod`
4. Deploy backend: `cd backend && vercel deploy --prod`
5. Verify both deployments working
6. Monitor logs: `vercel logs`
7. Update any URLs if different from defaults
