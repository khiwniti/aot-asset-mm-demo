# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AOT Asset Management System is a full-stack property management platform with AI chat, real-time sync, and interactive maps. Built with React 19 + TypeScript frontend, Express + Supabase backend, and GitHub Models AI integration.

## Development Commands

### Start Development
```bash
# Install all dependencies (root + backend)
npm run install:all

# Start both frontend and backend together
npm run dev:full

# Or start separately:
npm run dev              # Frontend only (Vite on port 12000)
npm run backend:dev      # Backend only (Express on port 8080)
```

### Database Operations
```bash
npm run backend:migrate  # Run Supabase migrations (creates all tables)
npm run backend:seed     # Populate with sample data
```

### Testing
```bash
npm run backend:test     # Run 12 backend API tests
npm run test:e2e        # Run 9 E2E test scenarios
# Frontend tests: see __tests__/frontend-manual-tests.md (24 test cases)
```

### Building
```bash
npm run build           # Build frontend for production
npm run backend:build   # Compile TypeScript backend
```

### Deployment
```bash
# Backend deployment (from backend/ directory)
cd backend
vercel --prod

# Frontend deployment (from root directory)
vercel --prod
```

## Architecture

### Backend Architecture

**Generic Entity Service Pattern**: The backend uses `backend/src/services/entityService.ts` as a centralized service that handles ALL CRUD operations for workflows, leases, tasks, and maintenance requests. This is the core of the backend architecture.

Key features:
- **Version tracking**: Every entity has a `version` field that increments on updates
- **Soft deletes**: `is_deleted` flag instead of hard deletes
- **Audit trails**: Automatic tracking of all changes in `audit_trails` table
- **Conflict detection**: `checkVersionConflict()` method prevents concurrent edit issues
- **Graceful fallback**: Falls back to mock data if Supabase connection fails

**Routes**: All routes in `backend/src/routes/` (workflows.ts, leases.ts, tasks.ts, maintenance.ts) follow identical patterns and delegate to EntityService.

**WebSocket Server**: Real-time sync is implemented directly in `backend/src/server.ts` using the `ws` library. The WebSocket server broadcasts entity changes to all connected clients for cross-tab synchronization.

### Frontend Architecture

**Real-time Synchronization**: `services/realtimeSync.ts` contains `RealtimeSyncService` class that:
- Connects to backend WebSocket
- Broadcasts local changes to other clients
- Handles incoming sync messages
- Manages conflict detection and resolution
- Queues pending operations during disconnection
- Auto-reconnects with exponential backoff

**API Client**: `services/apiClient.ts` provides typed API methods for all entities (workflows, leases, tasks, maintenance). Each entity has: `create()`, `getAll()`, `getOne()`, `update()`, `delete()`, `getAuditTrail()`.

**AI Service**: `services/aiService.ts` provides GitHub Models AI integration:
- Uses GitHub Models API (GPT-4o, GPT-4o-mini)
- Generous free tier with no disclosed daily limits
- Requires `VITE_GITHUB_TOKEN` environment variable (GitHub Personal Access Token)
- Used for chat, insights, and AI assistance throughout app
- Note: Gemini integration has been removed (migration completed)

**Map Integration**: `components/LeafletMap.tsx` uses Leaflet.js with React Leaflet bindings:
- Theme-aware tiles (OpenStreetMap for light, CartoDB for dark)
- Custom markers with property info
- Popups with property details
- Click handlers for navigation

### Database Schema

All tables in Supabase PostgreSQL have this standard structure:
- `id` (UUID, primary key)
- `version` (INTEGER, for conflict detection)
- `created_by` (TEXT, user identifier)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `is_deleted` (BOOLEAN, for soft deletes)

Entity-specific fields vary. Run `backend/src/database/migrate.ts` to see full schema definitions.

### Key Technical Patterns

1. **Optimistic Updates**: Frontend updates UI immediately, then syncs with backend
2. **Version-based Conflict Detection**: Client and server versions are compared on updates
3. **Audit Trail**: Every change is logged with old/new values, operation type, and user
4. **Cross-tab Sync**: WebSocket broadcasts ensure all browser tabs stay in sync
5. **Graceful Degradation**: Mock data fallback when database unavailable

## Important Environment Variables

### Backend (`backend/.env`)
```bash
PORT=8080
NODE_ENV=development
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_KEY=<anon_key>
CORS_ORIGIN=http://localhost:12000
```

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
VITE_GITHUB_TOKEN=<github_token>  # Required for AI features
```

**Note on GitHub Token**: To get a GitHub Personal Access Token:
1. Visit https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: 'repo' and 'read:user'
4. Copy token (starts with ghp_)
5. Set as VITE_GITHUB_TOKEN in .env

**Note**: The `.env.example` in backend/ contains pre-configured Supabase credentials for development. Copy it to `.env` to get started quickly.

## Vercel Deployment Configuration

### Backend Deployment

The backend is configured for Vercel serverless deployment via `backend/vercel.json`:
- **Serverless Functions**: Each API endpoint in `backend/api/` is a separate serverless function
  - `api/health.ts` - Health check endpoint
  - `api/workflows.ts` - Workflow CRUD operations
  - `api/leases.ts` - Lease management
  - `api/tasks.ts` - Task operations
  - `api/maintenance.ts` - Maintenance requests
  - `api/_utils.ts` - Shared utilities for serverless functions
- **Route Rewrites**: RESTful routes (e.g., `/api/workflows/:id`) are rewritten to query params
- **Environment Variables**: Configured via Vercel dashboard (referenced with `@` syntax)
- **Critical Limitation**: WebSocket support is limited on Vercel serverless functions
  - Real-time sync may not work in production
  - Consider Railway, Render, or Heroku for WebSocket support
  - Or use Supabase Realtime as alternative

**Development vs Production**: In development, `backend/src/server.ts` runs as a single Express server. In production, each API route is a separate serverless function in `backend/api/`.

### Frontend Deployment

The frontend is configured via `vercel.json`:
- Static build with `@vercel/static-build`
- SPA routing (all routes serve index.html)
- Asset caching headers for performance
- Environment variables injected at build time

### Deployment Steps

1. **Deploy Backend First**:
   ```bash
   cd backend
   vercel --prod
   # Note the deployed URL: https://your-backend.vercel.app
   ```

2. **Configure Backend Environment Variables** in Vercel dashboard:
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_KEY
   - CORS_ORIGIN (set to frontend URL after deploying frontend)

3. **Deploy Frontend**:
   ```bash
   cd ..  # Return to root
   # Create production env file
   echo "VITE_API_URL=https://your-backend.vercel.app/api" > .env.production
   echo "VITE_AI_PROVIDER=github" >> .env.production
   vercel --prod
   ```

4. **Update Backend CORS**: Go back to backend Vercel project and update CORS_ORIGIN to frontend URL, then redeploy.

## Common Development Tasks

### Adding a New Entity Type

1. Define TypeScript type in `backend/src/types/index.ts`
2. Add table creation in `backend/src/database/migrate.ts`
3. Add CRUD methods in `backend/src/services/entityService.ts`
4. Create route file in `backend/src/routes/` (follow existing patterns)
5. Register route in `backend/src/server.ts`
6. Add API methods in `services/apiClient.ts`
7. Create React page component in `pages/`

### Modifying Database Schema

1. Edit `backend/src/database/migrate.ts` (add new columns or tables)
2. Run `npm run backend:migrate` to apply changes
3. Update TypeScript types in `backend/src/types/index.ts`
4. Update EntityService methods if needed

### Testing Changes

Always test in this order:
1. Backend API tests: `npm run backend:test`
2. Manual frontend tests: Follow `__tests__/frontend-manual-tests.md`
3. E2E scenarios: `npm run test:e2e`

### Debugging WebSocket Issues

- Check connection: `realtimeSync.isConnected()` in browser console
- View pending operations: `realtimeSync.getPendingOperationsCount()`
- Monitor messages: Look for `📨 Sync message received:` in browser console
- Backend logs: Check `✅ WebSocket client connected` in terminal

### Working with AI Features

The AI service (`services/aiService.ts`) is used throughout the app:
- Dashboard insights: Auto-generates KPI analysis
- Chat: Full conversational AI assistant
- Context-aware help: "Ask AI about this" buttons on pages

To modify AI behavior:
1. Edit prompts in component files (e.g., `pages/Dashboard.tsx`)
2. Ensure VITE_GITHUB_TOKEN is set in `.env`
3. Restart frontend if token changes: `npm run dev`

GitHub Models benefits:
- Generous free tier (no disclosed daily limits)
- Production-ready reliability
- No quota errors (unlike Gemini's 250 req/day limit)

## Production Considerations

### Known Issues

1. **WebSocket on Vercel**: Vercel serverless functions have limited WebSocket support
   - Real-time sync may not work in production
   - Solutions: Use alternative hosting (Railway, Render) or Supabase Realtime

2. **Serverless Timeouts**: Vercel has 10-60 second execution limits
   - Keep database queries optimized
   - Long operations may fail

3. **Cold Starts**: First request after inactivity may take 1-3 seconds
   - Accept as trade-off for serverless benefits

### Security

- All API endpoints should validate input (add validation middleware if handling sensitive data)
- CORS is configured to allow multiple origins in development (see `backend/src/server.ts`)
- Tighten CORS in production (set specific CORS_ORIGIN)
- Never commit `.env` files (already in `.gitignore`)
- Supabase RLS (Row Level Security) is not yet implemented - add when implementing authentication

### Performance

- Frontend bundle size: ~350KB (target: <500KB)
- API response time: ~200ms (target: <500ms)
- Map render time: ~800ms (target: <1s)
- Consider marker clustering if displaying 1000+ properties

## Testing Documentation

See these files for comprehensive testing info:
- `TEST_PLAN.md` - Overall testing strategy
- `QA_CHECKLIST.md` - 200+ verification items
- `__tests__/README.md` - Test suite documentation
- `TESTING_QUICKSTART.md` - 5-minute quick start guide

## Recent Changes

### AI Provider Migration (Completed)
- Migrated from Google Gemini to GitHub Models API
- Removed Gemini fallback code completely
- Benefits: No more quota limits, production-ready AI
- See: `GITHUB_MODELS_MIGRATION_COMPLETE.txt` for full details

### Port Configuration
- Frontend: Port 12000 (changed from 5173)
- Backend: Port 8080 (changed from 3001)
- Update CORS_ORIGIN in backend/.env if needed
