# AOT Asset Management Backend

Professional backend for Interactive Domain Entity Management System with Supabase integration.

## Features

✅ **Entity Management**: Create, read, update, delete (CRUD) operations for:
- Workflows (draft → active → paused → completed → archived)
- Leases (draft → active → expiring → expired → renewed)
- Tasks (todo → in_progress → blocked → completed)
- Maintenance Requests (submitted → assigned → in_progress → completed → cancelled)

✅ **Real-Time Synchronization**: WebSocket-based sync across browser tabs with:
- Optimistic updates (UI responds instantly, backend confirms)
- Conflict detection (version-based)
- Automatic retry on network failures
- Pending operations queue

✅ **Audit Trail**: Track all entity changes with:
- Timestamp
- User who made the change
- Field-level change tracking
- Soft delete support

✅ **Data Persistence**: Supabase PostgreSQL with:
- Row-level security (RLS) ready
- Optimized indexes
- Version tracking for conflict detection

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file (already created with provided credentials):

```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_KEY=sb_publishable_7tX3ttUeWOk2jANWdC08dg_H7yxt9h5
CORS_ORIGIN=http://localhost:5173
```

### 3. Initialize Database

```bash
npm run db:migrate
```

This creates all necessary tables:
- `workflows`
- `leases`
- `tasks`
- `maintenance_requests`
- `audit_trails`
- `pending_operations`

### 4. Start Development Server

```bash
npm run dev
```

Server will run at: `http://localhost:3001`

### 5. Run Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Workflows

```
POST   /api/workflows              Create workflow
GET    /api/workflows              Get all workflows (with filters)
GET    /api/workflows/:id          Get single workflow
PUT    /api/workflows/:id          Update workflow
DELETE /api/workflows/:id          Delete workflow
GET    /api/workflows/:id/audit    Get audit trail
```

### Leases

```
POST   /api/leases                 Create lease
GET    /api/leases                 Get all leases (with filters)
GET    /api/leases/:id             Get single lease
PUT    /api/leases/:id             Update lease
DELETE /api/leases/:id             Delete lease
GET    /api/leases/:id/audit       Get audit trail
```

### Tasks

```
POST   /api/tasks                  Create task
GET    /api/tasks                  Get all tasks (with filters)
GET    /api/tasks/:id              Get single task
PUT    /api/tasks/:id              Update task
DELETE /api/tasks/:id              Delete task
GET    /api/tasks/:id/audit        Get audit trail
```

### Maintenance

```
POST   /api/maintenance            Create maintenance request
GET    /api/maintenance            Get all requests (with filters)
GET    /api/maintenance/:id        Get single request
PUT    /api/maintenance/:id        Update request
DELETE /api/maintenance/:id        Delete request
GET    /api/maintenance/:id/audit  Get audit trail
```

## Usage Examples

### Create a Workflow

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "title": "Q1 Budget Review",
    "description": "Review and approve Q1 budget",
    "assignee": "sarah@company.com",
    "due_date": "2025-03-31T00:00:00Z",
    "priority": "high"
  }'
```

### Update Workflow Status (Optimistic Update)

```bash
curl -X PUT http://localhost:3001/api/workflows/workflow-id \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "status": "active"
  }'
```

### Get All Active Workflows

```bash
curl http://localhost:3001/api/workflows?status=active
```

### Get Leases Expiring Soon

```bash
curl http://localhost:3001/api/leases?status=expiring
```

## Real-Time Sync (WebSocket)

The server includes a WebSocket server for real-time synchronization:

```javascript
import { realtimeSync } from './services/realtimeSync';

// Connect
await realtimeSync.connect();

// Listen for updates from other clients
realtimeSync.on('workflow:update', (message) => {
  console.log('Workflow updated:', message.data);
});

// Broadcast update
realtimeSync.broadcastUpdate(
  'update',
  'workflow',
  'workflow-id',
  { status: 'active' },
  1
);

// Handle conflicts
realtimeSync.onConflict((conflict) => {
  console.log('Conflict detected:', conflict);
  // Show UI for conflict resolution
});

// Monitor sync status
realtimeSync.onSyncStatusChange((status) => {
  console.log('Sync status:', status); // 'connected', 'disconnected', 'syncing', 'sync_error'
});
```

## Data Model

### Workflow
```typescript
{
  id: UUID,
  title: string,
  description?: string,
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived',
  assignee: string,
  due_date: ISO 8601 timestamp,
  priority: 'low' | 'medium' | 'high' | 'critical',
  property_id?: UUID,
  version: number,
  created_at: ISO 8601 timestamp,
  updated_at: ISO 8601 timestamp,
  created_by: string,
  is_deleted: boolean
}
```

### Lease
```typescript
{
  id: UUID,
  property_id: UUID,
  property_name: string,
  tenant_id: UUID,
  tenant_name: string,
  start_date: ISO 8601 date,
  end_date: ISO 8601 date,
  rent_amount: decimal,
  status: 'draft' | 'active' | 'expiring' | 'expired' | 'renewed',
  renewal_terms?: string,
  security_deposit: decimal,
  version: number,
  created_at: ISO 8601 timestamp,
  updated_at: ISO 8601 timestamp,
  created_by: string,
  is_deleted: boolean
}
```

### Task
```typescript
{
  id: UUID,
  title: string,
  description?: string,
  status: 'todo' | 'in_progress' | 'blocked' | 'completed',
  assignee: string,
  due_date: ISO 8601 timestamp,
  priority: 'low' | 'medium' | 'high' | 'critical',
  parent_workflow_id?: UUID,
  blocker_reason?: string,
  estimated_hours?: decimal,
  actual_hours?: decimal,
  version: number,
  created_at: ISO 8601 timestamp,
  updated_at: ISO 8601 timestamp,
  created_by: string,
  is_deleted: boolean
}
```

### Maintenance Request
```typescript
{
  id: UUID,
  property_id: UUID,
  description: string,
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  assignee?: string,
  vendor?: string,
  cost_estimate: decimal,
  actual_cost?: decimal,
  scheduled_date?: ISO 8601 date,
  completion_date?: ISO 8601 date,
  version: number,
  created_at: ISO 8601 timestamp,
  updated_at: ISO 8601 timestamp,
  created_by: string,
  is_deleted: boolean
}
```

## Error Handling

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* entity data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Performance Considerations

- **Version Tracking**: Each entity has a `version` field for conflict detection
- **Soft Delete**: Entities are marked `is_deleted` instead of deleted
- **Indexes**: All status and date fields are indexed for fast filtering
- **WebSocket Broadcast**: Updates broadcast to all connected clients in real-time
- **Retry Logic**: Failed operations automatically retry with exponential backoff

## Troubleshooting

### WebSocket Connection Failed

Check that backend is running and CORS is configured:
```bash
curl http://localhost:3001/api/health
```

### Database Migration Error

Ensure Supabase credentials are correct:
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Port Already in Use

Change PORT in .env:
```env
PORT=3002
```

## Next Steps

1. **Integration with Frontend**: Frontend API client (`services/apiClient.ts`) connects to these endpoints
2. **Agent Integration**: Gemini API can be called to interpret natural language commands
3. **Notifications**: Implement email/SMS alerts for lease expiration and cost overruns
4. **Advanced Filtering**: Add complex query support (date ranges, multi-field searches)
5. **Bulk Operations**: Support bulk create/update/delete with progress tracking
6. **Analytics**: Add aggregate endpoints for dashboards and reports

## Support

For issues or questions about the backend setup, refer to:
- Feature Specification: See project docs
- Supabase Documentation: https://supabase.com/docs
- Express.js Guide: https://expressjs.com/

---

**Created**: November 2025
**Framework**: Express.js + TypeScript
**Database**: Supabase/PostgreSQL
