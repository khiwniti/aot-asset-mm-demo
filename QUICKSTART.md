# Quick Start Guide - AOT Backend & Frontend

## What's New

You now have a **professional backend** connected to your Supabase database with:
- ✅ Express.js API server on port 3001
- ✅ Real-time WebSocket sync across tabs
- ✅ Entity management for Workflows, Leases, Tasks, Maintenance
- ✅ Automatic conflict detection
- ✅ Full audit trail
- ✅ Frontend API client & real-time sync service

## 1-Minute Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 2: Verify Database Tables

The database tables are already created. To re-initialize if needed:

```bash
npm run backend:migrate
```

### Step 3: Start Development

**Option A: Run separately (Recommended for first time)**

Terminal 1:
```bash
npm run backend:dev
# Backend starts at http://localhost:3001
```

Terminal 2:
```bash
npm run dev
# Frontend starts at http://localhost:5173
```

**Option B: Run both together (requires concurrently)**

```bash
npm install -g concurrently  # One-time install
npm run dev:full
```

## Verify It Works

### 1. Check Backend Health

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-20T..."}
```

### 2. Create a Test Workflow

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "title": "Test Workflow",
    "assignee": "test@example.com",
    "priority": "high"
  }'
```

Expected: Returns workflow object with ID

### 3. Fetch Workflows

```bash
curl http://localhost:3001/api/workflows
```

Expected: Returns array with your created workflow

### 4. Open Frontend

Visit `http://localhost:5173` in your browser

## Using the API from Frontend

### Example 1: Fetch Leases (in any page component)

```typescript
import apiClient from '../services/apiClient';
import { useEffect, useState } from 'react';
import { Lease } from '../types';

export default function LeaseList() {
  const [leases, setLeases] = useState<Lease[]>([]);

  useEffect(() => {
    apiClient.leases.getAll()
      .then(data => setLeases(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div>
      {leases.map(lease => (
        <div key={lease.id}>
          {lease.property_name} - {lease.status}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Create Entity with Real-Time Sync

```typescript
import apiClient from '../services/apiClient';
import { realtimeSync } from '../services/realtimeSync';

async function handleCreateWorkflow(title: string, assignee: string) {
  try {
    // Create in backend
    const workflow = await apiClient.workflows.create({ title, assignee });
    
    // Broadcast to other tabs
    realtimeSync.broadcastUpdate('create', 'workflow', workflow.id, workflow, workflow.version);
    
    // Update local state
    setWorkflows(prev => [workflow, ...prev]);
  } catch (error) {
    console.error('Failed to create workflow:', error);
  }
}
```

### Example 3: Drag-Drop Status Update (Optimistic)

```typescript
async function handleDragDrop(taskId: string, newStatus: string) {
  // 1. Show immediately in UI (optimistic)
  setTasks(prev => prev.map(t => 
    t.id === taskId ? { ...t, status: newStatus } : t
  ));

  try {
    // 2. Confirm with backend
    const updated = await apiClient.tasks.update(taskId, { status: newStatus });
    
    // 3. Broadcast to other clients
    realtimeSync.broadcastUpdate('update', 'task', taskId, updated, updated.version);
  } catch (error) {
    // Rollback on error
    console.error('Update failed:', error);
    setTasks(prev => [...prev]); // Reload
  }
}
```

## Real-Time Sync Demo

1. **Open two browser tabs** with frontend running
2. **In Tab A**: Create a new workflow via API or UI
3. **In Tab B**: See it appear automatically (real-time sync)
4. **In Tab A**: Change workflow status
5. **In Tab B**: See the update immediately

## Testing Conflict Resolution

1. **Open two tabs** with the same lease loaded
2. **In Tab A**: Edit lease rent amount → Save
3. **In Tab B**: Edit lease status → Save
4. **Result**: Backend detects version conflict, WebSocket broadcasts conflict notification
5. **UI**: Shows conflict dialog with both versions (implemented in BACKEND_INTEGRATION.md)

## Entity Status Transitions

### Workflows
```
draft → active → {paused, completed}
paused → active
Any status → archived
```

### Leases
```
draft → active
active → {expiring (auto), completed}
expiring → {expired (auto), renewed}
```

### Tasks
```
todo → in_progress
in_progress → {blocked, completed}
blocked → in_progress
```

### Maintenance
```
submitted → assigned
assigned → in_progress
in_progress → completed
Any status → cancelled
```

## API Quick Reference

### Create
```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"title":"My Workflow","assignee":"user@example.com"}'
```

### List
```bash
curl http://localhost:3001/api/workflows
curl http://localhost:3001/api/workflows?status=active
```

### Get Single
```bash
curl http://localhost:3001/api/workflows/workflow-id
```

### Update
```bash
curl -X PUT http://localhost:3001/api/workflows/workflow-id \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

### Delete (Soft)
```bash
curl -X DELETE http://localhost:3001/api/workflows/workflow-id
```

### Audit Trail
```bash
curl http://localhost:3001/api/workflows/workflow-id/audit
```

## Database Visualization

### Tables in Supabase

1. **workflows** - Manage coordinated work processes
2. **leases** - Track rental agreements
3. **tasks** - Individual work items
4. **maintenance_requests** - Work orders for repairs
5. **audit_trails** - Change history (read-only)
6. **pending_operations** - Failed operations queue

All tables have:
- `id` - UUID primary key
- `version` - For conflict detection
- `is_deleted` - Soft delete flag
- `created_at`, `updated_at` - Timestamps
- `created_by` - User who created

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
GEMINI_API_KEY=your-key-for-chat
```

### Backend (backend/.env)
```env
PORT=3001
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CORS_ORIGIN=http://localhost:5173
```

## Troubleshooting

### "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check if port 3001 is free
lsof -i :3001
```

### "WebSocket connection failed"
```bash
# Check CORS origin in backend/.env
cat backend/.env | grep CORS_ORIGIN
# Should match frontend URL: http://localhost:5173
```

### "Supabase connection error"
```bash
# Verify credentials
cat backend/.env | grep SUPABASE

# Should have:
# - SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
# - SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### "Port already in use"
```bash
# Change port in backend/.env
echo "PORT=3002" >> backend/.env

# Or kill process using port
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

## Next Steps

1. ✅ **Backend running** - Express server with entity CRUD
2. ✅ **Database connected** - Supabase with 4 entity tables
3. ✅ **Real-time sync** - WebSocket for cross-tab updates
4. 📋 **Integrate pages** - Use apiClient in page components (see BACKEND_INTEGRATION.md)
5. 🎯 **Add Gemini** - Connect natural language agent for entity commands
6. 📧 **Add notifications** - Email/SMS for lease expirations
7. 📊 **Analytics** - Dashboard KPIs from real data

## Documentation

- **Full Setup**: See `SETUP.md`
- **Backend API**: See `backend/README.md`
- **Integration Guide**: See `BACKEND_INTEGRATION.md`
- **Feature Spec**: See root specification document

## Support Commands

```bash
# Install all dependencies
npm run install:all

# Start both services
npm run dev:full

# Backend operations
npm run backend:dev        # Start dev server
npm run backend:build      # Build for production
npm run backend:start      # Start production
npm run backend:migrate    # Initialize database

# Frontend operations
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
```

---

**Everything is ready!** Start with `npm run dev` and `npm run backend:dev` in separate terminals.

Questions? Check:
- `SETUP.md` for detailed installation
- `BACKEND_INTEGRATION.md` for code examples
- `backend/README.md` for API documentation
