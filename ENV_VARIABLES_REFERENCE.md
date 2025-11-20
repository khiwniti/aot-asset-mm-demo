# Environment Variables Reference

Complete reference for all environment variables used in the AOT Asset Management application.

## Table of Contents

1. [Frontend Variables](#frontend-variables)
2. [Backend Variables](#backend-variables)
3. [Vercel Configuration](#vercel-configuration)
4. [Development vs Production](#development-vs-production)
5. [Security Guidelines](#security-guidelines)

---

## Frontend Variables

### Application Environment Variables

These variables are used by the React frontend application.

#### VITE_API_URL

**Description**: Base URL for backend API calls

**Type**: URL

**Example Values**:
- Development: `http://localhost:3001/api`
- Production: `https://aot-backend.vercel.app/api`
- Custom: `https://api.yourdomain.com/api`

**Used By**: `services/apiClient.ts`

**Vercel Source**: `vercel.json` (root)

```json
{
  "env": {
    "VITE_API_URL": {
      "description": "Backend API URL",
      "value": "https://aot-backend.vercel.app/api"
    }
  }
}
```

#### VITE_WS_URL

**Description**: WebSocket URL for real-time sync

**Type**: WebSocket URL

**Example Values**:
- Development: `ws://localhost:3001`
- Production: `wss://aot-backend.vercel.app`
- Custom: `wss://ws.yourdomain.com`

**Used By**: `services/realtimeSync.ts`

**Vercel Source**: `vercel.json` (root)

```json
{
  "env": {
    "VITE_WS_URL": {
      "description": "WebSocket URL",
      "value": "wss://aot-backend.vercel.app"
    }
  }
}
```

#### GEMINI_API_KEY

**Description**: Google Gemini API key for AI features

**Type**: Secret API Key

**Example**: `AIzaSyD...` (starts with `AIza`)

**Used By**: `components/ChatContext.tsx`, AI features

**Vercel Source**: Vercel UI → Environment Variables (secret)

**Security**: 
- 🔒 NEVER commit to git
- 🔒 Add only through Vercel UI or CLI
- 🔒 Rotate regularly
- 🔒 Monitor usage for unauthorized access

---

## Backend Variables

### Server Configuration

#### PORT

**Description**: Port number for Express server

**Type**: Number

**Default**: `3001`

**Development**: `3001`

**Production**: `3001` (Vercel manages actual port)

**Vercel Source**: `backend/vercel.json`

```json
{
  "env": {
    "PORT": { "value": "3001" }
  }
}
```

#### NODE_ENV

**Description**: Application environment

**Type**: Enum

**Valid Values**: 
- `development` - Development mode
- `production` - Production mode

**Development**: `development`

**Production**: `production`

**Vercel Source**: `backend/vercel.json`

```json
{
  "env": {
    "NODE_ENV": { "value": "production" }
  }
}
```

### Database Configuration

#### SUPABASE_URL

**Description**: Supabase project URL

**Type**: URL

**Example**: `https://wvbyapxobvpiozdhyxjj.supabase.co`

**Used By**: `backend/src/utils/supabaseClient.ts`

**Vercel Source**: `backend/vercel.json`

```json
{
  "env": {
    "SUPABASE_URL": {
      "value": "https://wvbyapxobvpiozdhyxjj.supabase.co"
    }
  }
}
```

**Finding Your Value**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "Project URL"

#### SUPABASE_SERVICE_ROLE_KEY

**Description**: Supabase service role API key (backend only)

**Type**: Secret API Key

**Security**: 
- 🔒 NEVER commit to git
- 🔒 Backend only (never use in frontend)
- 🔒 Provides full database access
- 🔒 Add only through Vercel UI or CLI

**Used By**: `backend/src/utils/supabaseClient.ts`

**Vercel Source**: Vercel UI → Environment Variables (secret)

```bash
# Set via CLI
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiI...
```

**Finding Your Value**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "service_role" key (marked as SECRET)

#### SUPABASE_KEY

**Description**: Supabase public API key

**Type**: Public API Key

**Example**: `sb_publishable_7tX3ttUeWOk2jANWdC08dg_H7yxt9h5`

**Used By**: `backend/src/utils/supabaseClient.ts`

**Vercel Source**: `backend/vercel.json`

```json
{
  "env": {
    "SUPABASE_KEY": {
      "value": "sb_publishable_7tX3ttUeWOk2jANWdC08dg_H7yxt9h5"
    }
  }
}
```

**Finding Your Value**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "anon" key (public key is safe to expose)

### CORS Configuration

#### CORS_ORIGIN

**Description**: Allowed origin for CORS requests

**Type**: URL

**Example Values**:
- Development: `http://localhost:5173`
- Production: `https://aot-frontend.vercel.app`
- Multiple: Use array format

**Used By**: `backend/src/server.ts`

**Vercel Source**: `backend/vercel.json`

```json
{
  "env": {
    "CORS_ORIGIN": {
      "value": "https://aot-frontend.vercel.app"
    }
  }
}
```

**Setting Multiple Origins**:

For development, you might need both localhost and production:

```javascript
// In backend/src/server.ts
const corsOrigin = process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));
```

### AI/External Services

#### GOOGLE_API_KEY

**Description**: Google Cloud API key (optional)

**Type**: Secret API Key

**Used By**: Optional for additional Google Cloud services

**Vercel Source**: Vercel UI → Environment Variables (secret)

**Security**: 
- 🔒 NEVER commit to git
- 🔒 Add only through Vercel UI or CLI
- 🔒 Restrict API key permissions

---

## Vercel Configuration

### Root vercel.json (Frontend)

**Location**: `/vercel.json`

**Purpose**: Configures frontend build and deployment

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
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

**Key Points**:
- Includes `--legacy-peer-deps` for React 19 compatibility
- Vite framework handles SPA build
- Non-sensitive env vars embedded
- Sensitive vars added through Vercel UI

### Backend vercel.json

**Location**: `/backend/vercel.json`

**Purpose**: Configures backend build and deployment

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
    "SUPABASE_KEY": { "value": "sb_publishable_..." },
    "CORS_ORIGIN": { "value": "https://aot-frontend.vercel.app" }
  }
}
```

**Key Points**:
- Node.js 20.x runtime
- TypeScript compiled to JavaScript
- Non-sensitive env vars embedded
- Sensitive vars added through Vercel UI

---

## Development vs Production

### Development Environment

**File**: `.env` (local development)

```
# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
GEMINI_API_KEY=dev_key_optional

# Backend (backend/.env)
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_dev_key
SUPABASE_KEY=sb_publishable_...
CORS_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=optional
```

### Production Environment (Vercel)

**Source**: `vercel.json` + Vercel UI

**Frontend Env**:
- `VITE_API_URL` = `https://aot-backend.vercel.app/api` (from vercel.json)
- `VITE_WS_URL` = `wss://aot-backend.vercel.app` (from vercel.json)
- `GEMINI_API_KEY` = Set in Vercel UI (secret)

**Backend Env**:
- `PORT` = `3001` (from backend/vercel.json)
- `NODE_ENV` = `production` (from backend/vercel.json)
- `SUPABASE_URL` = `https://...` (from backend/vercel.json)
- `SUPABASE_SERVICE_ROLE_KEY` = Set in Vercel UI (secret)
- `SUPABASE_KEY` = `sb_publishable_...` (from backend/vercel.json)
- `CORS_ORIGIN` = `https://aot-frontend.vercel.app` (from backend/vercel.json)
- `GOOGLE_API_KEY` = Set in Vercel UI (secret)

---

## Security Guidelines

### Sensitive Variables (🔒 NEVER in Git)

These values MUST be added through Vercel UI or CLI only:

1. **SUPABASE_SERVICE_ROLE_KEY**
   - Grants full database access
   - Backend only
   - 🔒 Add via: `vercel env add SUPABASE_SERVICE_ROLE_KEY`

2. **GEMINI_API_KEY**
   - Google Cloud API credentials
   - Can be used in frontend or backend
   - 🔒 Add via: `vercel env add GEMINI_API_KEY`

3. **GOOGLE_API_KEY**
   - Additional Google Cloud services
   - 🔒 Add via: `vercel env add GOOGLE_API_KEY`

### Non-Sensitive Variables (Can be in vercel.json)

These values are safe to embed in version control:

1. **SUPABASE_URL** - Public project identifier
2. **SUPABASE_KEY** - Public anon key (restricted permissions)
3. **VITE_API_URL** - Public API endpoint
4. **VITE_WS_URL** - Public WebSocket endpoint
5. **CORS_ORIGIN** - Frontend URL (public)
6. **NODE_ENV** - Environment name (public)
7. **PORT** - Server port (standard value)

### Best Practices

1. ✅ Use `.env.example` to show required variables
2. ✅ Add `.env` to `.gitignore`
3. ✅ Use Vercel UI for secrets
4. ✅ Rotate sensitive keys regularly
5. ✅ Monitor API key usage
6. ✅ Use different keys for dev/prod
7. ✅ Limit API key permissions
8. ✅ Document all variables
9. ✅ Use HTTPS/WSS in production
10. ✅ Review env vars before deployment

### Checking If Variables Are Exposed

```bash
# Check if secrets in git history
git log -p | grep -i "SUPABASE_SERVICE_ROLE_KEY\|GEMINI_API_KEY"

# Check current .env files
git status | grep .env

# List all env vars
vercel env ls
```

---

## Variable Resolution Order

### Frontend (Vite)

1. `.env.local` (highest priority)
2. `.env.[mode].local` (e.g., `.env.production.local`)
3. `.env` (lowest priority)
4. vercel.json (Vercel build environment)
5. Default values in `vite.config.ts`

### Backend (Node.js)

1. `.env` (highest priority)
2. vercel.json (Vercel environment)
3. System environment variables
4. Default values in code

---

## Troubleshooting

### Variable Not Found

**Problem**: `import.meta.env.VITE_API_URL` is undefined

**Solution**:
1. Check `.env` file exists locally
2. Verify variable name starts with `VITE_`
3. Restart dev server: `npm run dev`
4. Check `vite.config.ts` uses `loadEnv()`

### CORS Errors

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Check `CORS_ORIGIN` in backend env
2. Verify it matches frontend URL exactly
3. Update in Vercel: `vercel env add CORS_ORIGIN`
4. Redeploy backend: `vercel deploy --prod`

### WebSocket Connection Failed

**Problem**: WebSocket connection to `ws://...` failed

**Solution**:
1. Check `VITE_WS_URL` points to backend
2. Use `wss://` (secure) in production
3. Verify backend is deployed
4. Check CORS allows WebSocket upgrade

### API Calls Timeout

**Problem**: API requests timeout or hang

**Solution**:
1. Verify `VITE_API_URL` is correct
2. Test: `curl https://aot-backend.vercel.app/api/health`
3. Check backend logs: `vercel logs`
4. Verify Supabase connection

---

## Quick Reference Table

| Variable | Type | Dev Value | Prod Value | Source | Secret |
|----------|------|-----------|-----------|--------|--------|
| `PORT` | Number | 3001 | 3001 | vercel.json | ❌ |
| `NODE_ENV` | String | development | production | vercel.json | ❌ |
| `VITE_API_URL` | URL | http://localhost:3001/api | https://aot-backend.vercel.app/api | vercel.json | ❌ |
| `VITE_WS_URL` | URL | ws://localhost:3001 | wss://aot-backend.vercel.app | vercel.json | ❌ |
| `SUPABASE_URL` | URL | https://...co | https://...co | vercel.json | ❌ |
| `SUPABASE_KEY` | Key | sb_publishable_... | sb_publishable_... | vercel.json | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | Key | dev_key | prod_key | Vercel UI | ✅ |
| `GEMINI_API_KEY` | Key | optional | required | Vercel UI | ✅ |
| `GOOGLE_API_KEY` | Key | optional | optional | Vercel UI | ✅ |
| `CORS_ORIGIN` | URL | http://localhost:5173 | https://aot-frontend.vercel.app | vercel.json | ❌ |

---

## For More Information

- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Setup instructions
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Deployment guide
- [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [.env.example](./.env.example) - Example environment file
- [backend/.env.example](./backend/.env.example) - Backend example
