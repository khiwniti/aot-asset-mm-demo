# Quick Start Guide - Entity Management System

## Overview

This guide helps you quickly get started with the Interactive Domain Entity Management System.

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Navigate to Entity Management
```
http://localhost:5173/#/entity-management
```

You should see the unified entity management hub with 4 tabs.

## 10-Minute Walkthrough

### Workflows Tab
1. Click "New" button under Draft column
2. Fill in form: Title, Assignee, Due Date
3. Click "Create"
4. Drag the new workflow to "Active" column
5. Watch it update in real-time

### Leases Tab
1. Click "New Lease" button
2. Fill in form: Property, Tenant, Rent Amount, Dates
3. Click "Create"
4. View expiration tracking and statistics
5. Filter by status using tabs

### Tasks Tab
1. Click "New" button under To Do column
2. Create a task
3. Drag to "In Progress"
4. Add blocker reason
5. Drag to "Blocked" - note it prevents completion

### Maintenance Tab
1. Create maintenance request
2. Note priority coloring
3. Sort by priority or cost
4. Update status and watch cost tracking

## Using with Agent

Try these natural language commands in the chat:

```
"Create a workflow for Q1 review"
"Show me all leases expiring soon"
"Create a task for me"
"What maintenance requests are urgent?"
```

The agent will render appropriate UI components or create entities.

## Integration Points

### Using Stores Directly

```typescript
import { useWorkflowStore } from '@/stores/entityStores';

function MyComponent() {
  const { workflows, createWorkflow, syncStatus } = useWorkflowStore();
  
  // Use directly in your component
}
```

### Using Components

```typescript
import { WorkflowStatusManager } from '@/components/entities';

<WorkflowStatusManager
  onWorkflowCreate={(workflow) => console.log('Created:', workflow)}
/>
```

### Agent Integration

The agent service automatically:
- Parses natural language entity commands
- Renders appropriate UI components
- Creates entities via chat interface
- Handles status transitions

## Key Files to Know

| File | Purpose |
|------|---------|
| `types/entities.ts` | All entity type definitions |
| `stores/entityStores.ts` | State management (Zustand) |
| `services/entityService.ts` | Backend API client |
| `services/agentService/` | AI agent logic |
| `components/entities/` | UI components (Kanban, etc) |
| `pages/EntityManagement.tsx` | Main hub page |

## Common Tasks

### Create an Entity
```typescript
const { createWorkflow } = useWorkflowStore();

await createWorkflow({
  title: 'My Workflow',
  description: 'Description',
  assignee: 'user@example.com',
  dueDate: '2024-12-31',
  priority: Priority.HIGH
});
```

### Change Entity Status
```typescript
const { changeWorkflowStatus } = useWorkflowStore();

await changeWorkflowStatus(workflowId, WorkflowStatus.ACTIVE);
```

### Bulk Update
```typescript
const { bulkUpdateWorkflows } = useWorkflowStore();

await bulkUpdateWorkflows(
  [id1, id2, id3],
  { status: WorkflowStatus.COMPLETED }
);
```

### Handle Sync Status
```typescript
const { syncStatus } = useWorkflowStore();

if (syncStatus === 'syncing') {
  // Show loading indicator
}
if (syncStatus === 'failed') {
  // Show error indicator
}
```

## Status Transitions

### Workflow
```
draft → active → paused → completed
              ↘         ↙
                archived
```

### Lease
```
draft → active → expiring → expired
                     ↘
                    renewed → active
```

### Task
```
todo → in_progress → blocked → in_progress
              ↓
          completed
```

### Maintenance
```
submitted → assigned → in_progress → completed
    ↓           ↓             ↓           ↓
           cancelled
```

## Testing Locally

### Test Real-Time Sync
1. Open entity management in two browser tabs
2. Create an entity in one tab
3. Watch it appear in the other tab within 1 second

### Test Offline Behavior
1. Open DevTools (F12)
2. Go to Network tab
3. Mark offline
4. Try to create an entity - note optimistic update
5. Go back online - watch it sync

### Test Concurrent Edits
1. Open in two tabs
2. Drag entity to different status in each tab simultaneously
3. Note conflict detection and resolution UI

## Building

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## What's Missing (Backend Work)

The system is ready for backend integration. You need to implement:

1. **API Endpoints** at `/api/`
   - `/workflows/*`
   - `/leases/*`
   - `/tasks/*`
   - `/maintenance/*`
   - `/audit/*`
   - `/sync/*`

See `BACKEND_API_SPEC.md` for complete specification.

## Troubleshooting

### "API not available" errors
- Backend endpoints not implemented yet
- Check environment variable `REACT_APP_API_URL`
- See `BACKEND_API_SPEC.md` for implementation

### Entities not persisting
- Backend endpoints required
- Use mock data for frontend testing only
- Stores support local-only mode

### Sync not working across tabs
- localStorage sync included by default
- Future: implement WebSocket for real-time sync
- Check browser DevTools > Application > LocalStorage

## Next Steps

1. **Backend Team**: Implement API endpoints from `BACKEND_API_SPEC.md`
2. **Frontend Team**: Customize UI/styling as needed
3. **QA Team**: Run acceptance tests from feature specification
4. **Deployment**: Test in staging before production

## Documentation

- **[ENTITY_MANAGEMENT_README.md](./ENTITY_MANAGEMENT_README.md)** - Architecture & features
- **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)** - Complete API specification
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built

## Support

Need help? Check:
1. Component JSDoc comments
2. Type definitions in `types/entities.ts`
3. Store implementations in `stores/entityStores.ts`
4. Agent logic in `services/agentService/`

---

Happy coding! 🚀
