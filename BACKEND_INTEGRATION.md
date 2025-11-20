# Backend Integration Guide

This guide shows how to integrate the backend API into existing frontend pages.

## Quick Start: Replace Mock Data with Real API

### 1. Import API Client

In any page component, import the API client:

```typescript
import apiClient from '../services/apiClient';
```

### 2. Update useEffect to Call API

**Before (Mock Data):**
```typescript
useEffect(() => {
  // Using mock data from mockData.ts
  setWorkflows(mockWorkflows);
}, []);
```

**After (Real API):**
```typescript
useEffect(() => {
  // Call backend API
  apiClient.workflows.getAll()
    .then(workflows => setWorkflows(workflows))
    .catch(error => console.error('Error fetching workflows:', error));
}, []);
```

### 3. Implement Real-Time Sync (Optional)

```typescript
import { realtimeSync } from '../services/realtimeSync';

useEffect(() => {
  // Connect to WebSocket for real-time updates
  realtimeSync.connect().catch(console.error);

  // Listen for workflow updates from other clients
  realtimeSync.on('workflow:update', (message) => {
    setWorkflows(prev => prev.map(w => 
      w.id === message.entityId ? message.data : w
    ));
  });

  return () => {
    realtimeSync.off('workflow:update');
  };
}, []);
```

## Page-by-Page Integration

### LeasingManagement.tsx

**Replace Mock Leases:**

```typescript
import { useEffect, useState } from 'react';
import { Lease } from '../types';
import apiClient from '../services/apiClient';

export default function LeasingManagement() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all leases
    apiClient.leases.getAll()
      .then(data => {
        setLeases(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load leases:', error);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (leaseId: string, newStatus: string) => {
    try {
      // Update lease status in backend
      const updated = await apiClient.leases.update(leaseId, {
        status: newStatus as any
      });
      
      // Update local state (optimistic update already applied)
      setLeases(prev => prev.map(l => l.id === leaseId ? updated : l));
    } catch (error) {
      console.error('Failed to update lease:', error);
      // Rollback optimistic update
      setLeases(prev => [...prev]); // Re-fetch or revert
    }
  };

  if (loading) return <div>Loading leases...</div>;

  return (
    <div>
      {leases.map(lease => (
        <div key={lease.id}>
          {lease.property_name} - {lease.status}
          <button onClick={() => handleStatusChange(lease.id, 'active')}>
            Mark Active
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Maintenance.tsx

**Replace Mock Work Orders:**

```typescript
import { useEffect, useState } from 'react';
import { MaintenanceRequest } from '../types';
import apiClient from '../services/apiClient';

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch maintenance requests
    apiClient.maintenance.getAll()
      .then(data => {
        // Sort by priority (urgent first)
        const sorted = [...data].sort((a, b) => {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        setRequests(sorted);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load maintenance requests:', error);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (description: string, priority: string) => {
    try {
      const newRequest = await apiClient.maintenance.create({
        description,
        priority: priority as any,
        property_id: 'P001', // Get from context
        cost_estimate: 0
      });
      setRequests(prev => [newRequest, ...prev]);
    } catch (error) {
      console.error('Failed to create maintenance request:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await apiClient.maintenance.update(id, {
        status: newStatus as any
      });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (error) {
      console.error('Failed to update maintenance request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="kanban-board">
      {['submitted', 'assigned', 'in_progress', 'completed'].map(status => (
        <div key={status} className="column">
          <h3>{status}</h3>
          {requests
            .filter(r => r.status === status)
            .map(request => (
              <div key={request.id} className="card">
                <h4>{request.description}</h4>
                <p>Priority: {request.priority}</p>
                <p>Cost: ${request.cost_estimate}</p>
                <button onClick={() => {
                  // Move to next status
                  const nextStatus = getNextStatus(status);
                  handleStatusChange(request.id, nextStatus);
                }}>
                  Move
                </button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function getNextStatus(current: string): string {
  const transitions: Record<string, string> = {
    submitted: 'assigned',
    assigned: 'in_progress',
    in_progress: 'completed',
    completed: 'completed'
  };
  return transitions[current] || current;
}
```

### PropertyListing.tsx

**Add Workflow Management:**

```typescript
import { useEffect, useState } from 'react';
import { Workflow } from '../types';
import apiClient from '../services/apiClient';

export default function PropertyListing() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    // Fetch workflows for current properties
    apiClient.workflows.getAll({ status: 'active' })
      .then(data => setWorkflows(data))
      .catch(error => console.error('Failed to load workflows:', error));
  }, []);

  const handleCreateWorkflow = async (title: string, assignee: string) => {
    try {
      const workflow = await apiClient.workflows.create({
        title,
        assignee,
        status: 'draft'
      });
      setWorkflows(prev => [workflow, ...prev]);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  return (
    <div>
      <h2>Active Workflows</h2>
      {workflows.map(workflow => (
        <div key={workflow.id}>
          <h3>{workflow.title}</h3>
          <p>Assigned to: {workflow.assignee}</p>
          <p>Status: {workflow.status}</p>
          <p>Due: {new Date(workflow.due_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## Real-Time Sync Implementation

### Listen for Entity Updates

```typescript
import { realtimeSync } from '../services/realtimeSync';

useEffect(() => {
  // Connect WebSocket
  realtimeSync.connect()
    .then(() => {
      // Listen for workflow updates
      realtimeSync.on('workflow:update', (message) => {
        console.log('Workflow updated from another tab:', message.data);
        setWorkflows(prev => prev.map(w => 
          w.id === message.entityId ? message.data : w
        ));
      });

      // Listen for new workflows
      realtimeSync.on('workflow:create', (message) => {
        console.log('New workflow created:', message.data);
        setWorkflows(prev => [message.data, ...prev]);
      });

      // Monitor sync status
      realtimeSync.onSyncStatusChange((status) => {
        console.log('Sync status:', status);
        setSyncStatus(status);
      });

      // Handle conflicts
      realtimeSync.onConflict((conflict) => {
        console.warn('Conflict detected:', conflict);
        showConflictDialog(conflict);
      });
    })
    .catch(error => console.error('Failed to connect WebSocket:', error));

  return () => {
    realtimeSync.off('workflow:update');
    realtimeSync.off('workflow:create');
  };
}, []);
```

### Broadcast Updates to Other Clients

```typescript
const handleUpdateWorkflow = async (id: string, changes: any) => {
  // Optimistic update (immediate UI response)
  setWorkflows(prev => prev.map(w => 
    w.id === id ? { ...w, ...changes, version: w.version + 1 } : w
  ));

  try {
    // Send to backend
    const updated = await apiClient.workflows.update(id, changes);
    
    // Broadcast to other clients via WebSocket
    realtimeSync.broadcastUpdate(
      'update',
      'workflow',
      id,
      updated,
      updated.version
    );
  } catch (error) {
    // Rollback on error
    console.error('Update failed:', error);
    setWorkflows(prev => prev.filter(w => w.id !== id)); // Re-fetch
  }
};
```

## Conflict Resolution UI

```typescript
import { ConflictInfo } from '../services/realtimeSync';

function ConflictDialog({ conflict, onResolve }: {
  conflict: ConflictInfo;
  onResolve: (choice: 'local' | 'remote' | 'merge') => void;
}) {
  return (
    <div className="dialog">
      <h2>Conflict Detected</h2>
      <p>Entity {conflict.entityId} was modified in another location</p>
      
      <div className="versions">
        <div className="local">
          <h3>Your Changes (Local)</h3>
          <pre>{JSON.stringify(conflict.localData, null, 2)}</pre>
          <button onClick={() => onResolve('local')}>Keep Mine</button>
        </div>

        <div className="remote">
          <h3>Remote Changes</h3>
          <pre>{JSON.stringify(conflict.remoteData, null, 2)}</pre>
          <button onClick={() => onResolve('remote')}>Accept Theirs</button>
        </div>
      </div>

      <button onClick={() => onResolve('merge')}>Merge Manually</button>
    </div>
  );
}
```

## Optimistic Updates Pattern

```typescript
const handleDragDropStatus = async (taskId: string, newStatus: string) => {
  // Find task and get current state
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Save previous state for rollback
  const previousStatus = task.status;

  // 1. Optimistic update (immediate UI response)
  setTasks(prev => prev.map(t => 
    t.id === taskId ? { ...t, status: newStatus as any } : t
  ));

  // 2. Show loading indicator
  setTaskLoading[taskId] = true;

  try {
    // 3. Send to backend
    const updated = await apiClient.tasks.update(taskId, {
      status: newStatus as any
    });

    // 4. Confirm update with server response
    setTasks(prev => prev.map(t => 
      t.id === taskId ? updated : t
    ));

    // 5. Broadcast to other clients
    realtimeSync.broadcastUpdate('update', 'task', taskId, updated, updated.version);

  } catch (error) {
    // 6. Rollback on error
    console.error('Update failed, rolling back:', error);
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: previousStatus } : t
    ));

    // Show error notification
    showNotification('Failed to update task status', 'error');
  } finally {
    setTaskLoading[taskId] = false;
  }
};
```

## Error Handling

```typescript
async function withErrorHandling<T>(
  apiCall: Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T | null> {
  try {
    return await apiCall;
  } catch (error: any) {
    console.error(errorMessage, error);
    
    // Show user-friendly error
    if (error.status === 404) {
      showNotification('Entity not found', 'error');
    } else if (error.status === 409) {
      showNotification('Conflict detected - changes made elsewhere', 'warning');
    } else if (error.status === 500) {
      showNotification('Server error - please try again', 'error');
    } else {
      showNotification(errorMessage, 'error');
    }
    
    return null;
  }
}

// Usage:
const result = await withErrorHandling(
  apiClient.workflows.update(id, changes),
  'Failed to update workflow'
);
```

## Pagination (Future Enhancement)

```typescript
const [page, setPage] = useState(1);
const [pageSize] = useState(20);

useEffect(() => {
  apiClient.workflows.getAll({
    skip: (page - 1) * pageSize,
    limit: pageSize
  })
    .then(data => setWorkflows(data))
    .catch(console.error);
}, [page]);
```

## Bulk Operations

```typescript
async function bulkUpdateStatus(
  entityIds: string[],
  newStatus: string,
  entityType: 'workflow' | 'task' | 'maintenance_request'
) {
  const api = {
    workflow: apiClient.workflows,
    task: apiClient.tasks,
    maintenance_request: apiClient.maintenance
  }[entityType];

  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  // Process one by one for better error handling
  for (const id of entityIds) {
    try {
      const updated = await api.update(id, { status: newStatus });
      realtimeSync.broadcastUpdate('update', entityType, id, updated, updated.version);
      successful++;
    } catch (error: any) {
      failed++;
      errors.push(`${id}: ${error.message}`);
    }
  }

  // Show summary
  showNotification(
    `${successful} succeeded, ${failed} failed`,
    failed === 0 ? 'success' : 'warning'
  );

  if (errors.length > 0) {
    console.error('Bulk operation errors:', errors);
  }
}
```

## Testing Integration

```typescript
// Test with mock data first
import apiClient from '../services/apiClient';

// Mock the API
jest.mock('../services/apiClient', () => ({
  workflows: {
    getAll: jest.fn().mockResolvedValue([
      { id: '1', title: 'Test', status: 'active' }
    ])
  }
}));

test('loads workflows from API', async () => {
  const { getByText } = render(<Maintenance />);
  
  await waitFor(() => {
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```

## Migration Checklist

- [ ] Import API client in component
- [ ] Replace mock data fetch with `apiClient.getAll()`
- [ ] Implement create/update/delete handlers
- [ ] Add WebSocket sync listeners
- [ ] Handle loading and error states
- [ ] Test with backend running
- [ ] Verify CORS is configured correctly
- [ ] Test conflict resolution (edit same entity in 2 tabs)
- [ ] Test offline behavior (disable network, see queue)
- [ ] Deploy and test in production

## Support

Refer to:
- `backend/README.md` - API documentation
- `services/apiClient.ts` - API client implementation
- `services/realtimeSync.ts` - Real-time sync service
- Feature specification - Requirements and use cases

---

**Last Updated**: November 2025
**Version**: 1.0.0
