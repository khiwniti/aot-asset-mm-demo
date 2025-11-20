# AOT Asset Management - Full Stack Setup Guide

## Overview

This is a professional full-stack application for Interactive Domain Entity Management with:
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js + TypeScript + Supabase
- **Real-Time**: WebSocket sync across browser tabs
- **Agent**: Google Gemini with ADK framework

## Architecture

```
┌─────────────────────────────────────────┐
│        React Frontend (Port 5173)        │
│  - Dashboard, Properties, Leasing, etc.  │
│  - Real-time chat with Gemini agent     │
│  - Optimistic UI updates                │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼ REST API        ▼ WebSocket
┌──────────────────────────────────┐
│   Express Backend (Port 3001)    │
│  - Entity CRUD operations        │
│  - Real-time sync                │
│  - Conflict detection            │
│  - Audit trail tracking          │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Supabase PostgreSQL            │
│  - Workflows, Leases, Tasks      │
│  - Maintenance Requests          │
│  - Audit Trails                  │
│  - Pending Operations            │
└──────────────────────────────────┘
```

## Prerequisites

- Node.js >= 16
- npm or yarn
- Supabase account (credentials provided)
- Google Gemini API key (for chat features)

## Installation

### 1. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create .env file with frontend variables
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
GEMINI_API_KEY=your-gemini-api-key-here
EOF
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install backend dependencies
npm install

# .env is already configured with Supabase credentials
# Verify environment variables are set
cat .env

# Initialize database (creates tables)
npm run db:migrate

# Return to root
cd ..
```

## Running the Application

### Option A: Run Both Frontend & Backend (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs at http://localhost:3001
# WebSocket at ws://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs at http://localhost:5173
# Opens automatically in browser
```

### Option B: Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start
# or use PM2 for process management
```

**Frontend:**
```bash
npm run build
npm preview
# or deploy to Vercel, Netlify, etc.
```

## Database Initialization

The backend automatically initializes the database with all required tables:

- **workflows**: Manage workflows through their lifecycle
- **leases**: Track rental agreements and auto-transitions
- **tasks**: Individual work items with dependencies
- **maintenance_requests**: Work orders and maintenance tracking
- **audit_trails**: Full change history for compliance
- **pending_operations**: Queue for offline/failed operations

To manually run migrations:
```bash
cd backend
npm run db:migrate
```

## Configuration Files

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api        # Backend API endpoint
VITE_WS_URL=ws://localhost:3001               # WebSocket endpoint
GEMINI_API_KEY=your-api-key-here              # For chat features
```

### Backend (backend/.env)
```env
PORT=3001                                      # Backend port
NODE_ENV=development                           # Environment
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # Service role key
SUPABASE_KEY=sb_publishable_...              # Public key
CORS_ORIGIN=http://localhost:5173            # Frontend origin
GOOGLE_API_KEY=your-gemini-api-key           # For agent features
```

## API Usage

### Example: Create a Workflow

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "title": "Q1 Budget Review",
    "assignee": "sarah@company.com",
    "priority": "high",
    "due_date": "2025-03-31T00:00:00Z"
  }'
```

### Example: Get All Leases with Status Filter

```bash
curl "http://localhost:3001/api/leases?status=active"
```

### Example: Update Workflow Status

```bash
curl -X PUT http://localhost:3001/api/workflows/workflow-id \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"status": "active"}'
```

## Frontend Features Using Backend

### 1. Real-Time Entity Management

The frontend connects to the backend API to:
- Create workflows, leases, tasks, maintenance requests
- Update entity status with optimistic UI updates
- Delete entities with soft-delete preservation
- View audit trails for compliance

### 2. Real-Time Synchronization

WebSocket sync automatically:
- Broadcasts updates to all connected clients
- Detects concurrent edit conflicts
- Retries failed operations when network reconnects
- Shows sync status (connected, syncing, failed)

### 3. Agent Integration

Gemini agent can:
- Create entities via natural language ("Create a workflow for...")
- Query entities ("Show all expiring leases")
- Transition entity statuses ("Mark workflow as completed")
- Bulk operations ("Assign all urgent maintenance to John")

## Data Flow

### Creating an Entity

1. User submits form in React component
2. Frontend API calls `POST /api/workflows`
3. Backend validates and creates entity in Supabase
4. Backend returns entity with ID and version
5. Backend broadcasts WebSocket message to other clients
6. All clients receive real-time update
7. Response returns to frontend, UI updates confirmed

### Handling Conflicts

1. User edits entity in Tab A
2. Another user edits same entity in Tab B
3. Tab B saves first (version updated in DB)
4. Tab A attempts save with old version
5. Backend detects version mismatch
6. WebSocket sends conflict notification
7. Frontend shows conflict resolution UI
8. User chooses: keep local, accept remote, or merge

### Optimistic Updates

1. User drags task status (todo → in_progress)
2. Frontend immediately shows updated status
3. Frontend calls API in background
4. If API succeeds: confirm
5. If API fails: rollback UI and show error
6. User sees changes instantly (no loading spinner)

## Monitoring & Debugging

### Backend Logs

```bash
# Development mode shows request logs
cd backend && npm run dev

# Output:
# [2025-11-20T10:30:45.123Z] GET /api/workflows
# [2025-11-20T10:30:46.456Z] POST /api/workflows
# [2025-11-20T10:30:47.789Z] PUT /api/workflows/id
```

### Health Check

```bash
curl http://localhost:3001/api/health
# Response: {"status":"ok","timestamp":"2025-11-20T..."}
```

### WebSocket Debugging

Open browser console and check WebSocket messages:
```javascript
// In browser console
// Automatically connected via realtimeSync service
// Check messages in Network tab > WS
```

## Troubleshooting

### Issue: "Cannot connect to Supabase"

**Solution:**
```bash
# Verify environment variables
cd backend && cat .env

# Check Supabase URL format
# Should be: https://[PROJECT-ID].supabase.co

# Test connection
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  https://wvbyapxobvpiozdhyxjj.supabase.co/rest/v1/
```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find and kill process using port 3001
lsof -i :3001
kill -9 <PID>

# Or change PORT in backend/.env
# PORT=3002
```

### Issue: "WebSocket connection failed"

**Solution:**
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check CORS configuration
# Ensure CORS_ORIGIN in backend/.env matches frontend origin
# CORS_ORIGIN=http://localhost:5173

# For production, update:
# CORS_ORIGIN=https://your-frontend-domain.com
```

### Issue: "CORS error on API calls"

**Solution:**
```bash
# Verify backend/.env
CORS_ORIGIN=http://localhost:5173

# For production:
CORS_ORIGIN=https://your-domain.com

# Restart backend to apply changes
```

## Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend

# Create Heroku app
heroku create aot-backend

# Set environment variables
heroku config:set \
  SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  CORS_ORIGIN=https://your-frontend.com

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Frontend Deployment (Vercel Example)

```bash
# Connect repository to Vercel
# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend.com/api
VITE_WS_URL=wss://your-backend.com

# Deploy
npm run build
# Vercel auto-deploys on git push
```

## Next Steps

1. **Connect Gemini API**: Add GOOGLE_API_KEY to enable agent
2. **Customize Entities**: Add business-specific fields to entities
3. **Add Notifications**: Implement email/SMS for lease expirations
4. **Advanced Filtering**: Add complex query support
5. **Bulk Operations**: Enhance UI for bulk create/update/delete
6. **Analytics**: Create dashboards for KPIs and reports
7. **Authentication**: Integrate with Auth0 or Supabase Auth
8. **Row-Level Security**: Configure RLS policies in Supabase

## Support Resources

- **Backend API**: `backend/README.md`
- **Feature Spec**: Feature specification in project root
- **Supabase Docs**: https://supabase.com/docs
- **Express Guide**: https://expressjs.com/
- **React Docs**: https://react.dev

## Quick Reference

### Start Development
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

### Initialize Database
```bash
cd backend && npm run db:migrate
```

### Build for Production
```bash
cd backend && npm run build
npm run build
```

### Check Health
```bash
curl http://localhost:3001/api/health
```

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Production Ready
