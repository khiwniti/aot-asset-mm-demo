# Backend API Specification for Entity Management System

This document specifies the backend API endpoints required to support the Interactive Domain Entity Management System frontend.

## Base URL
`http://localhost:3000/api`

## Authentication
All endpoints should validate user permissions based on the authenticated user context.

## Response Format

### Success Response (2xx)
```json
{
  "data": { /* entity or array of entities */ },
  "timestamp": "2024-01-19T10:30:00Z",
  "version": 1
}
```

### Error Response (4xx/5xx)
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-19T10:30:00Z"
}
```

## Entity Schemas

### Workflow
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  assignee: string;
  dueDate: string; // ISO 8601
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  propertyId?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string;
  version: number;
}
```

### Lease
```typescript
{
  id: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  rentAmount: number;
  status: 'draft' | 'active' | 'expiring' | 'expired' | 'renewed';
  renewalTerms?: string;
  securityDeposit: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string;
  version: number;
}
```

### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  assignee: string;
  dueDate: string; // ISO 8601
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  workflowId?: string;
  blockerReason?: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[]; // Array of task IDs
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string;
  version: number;
}
```

### MaintenanceRequest
```typescript
{
  id: string;
  propertyId: string;
  propertyName: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  assignee?: string;
  costEstimate: number;
  actualCost?: number;
  scheduledDate: string; // ISO 8601
  completionDate?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string;
  version: number;
}
```

### AuditTrailEntry
```typescript
{
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance';
  entityId: string;
  operationType: 'create' | 'update' | 'delete' | 'status_change';
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  userId: string;
  reason?: string;
  createdAt: string; // ISO 8601
  version: number;
}
```

## Endpoints

### WORKFLOWS

#### POST /workflows
Create a new workflow.

**Request Body:**
```json
{
  "title": string,
  "description": string,
  "assignee": string,
  "dueDate": string,
  "priority": string,
  "propertyId": string (optional)
}
```

**Response:** 201 Created
```json
{
  "data": { /* Workflow */ }
}
```

**Validation:**
- title: required, max 255 chars
- assignee: required, must be valid user ID
- dueDate: required, must be valid date

---

#### GET /workflows
List all workflows (with pagination).

**Query Parameters:**
- `status`: Filter by status (optional)
- `assignee`: Filter by assignee (optional)
- `page`: Page number, default 1
- `limit`: Items per page, default 20

**Response:** 200 OK
```json
{
  "data": [ /* array of Workflows */ ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number
  }
}
```

---

#### GET /workflows/:id
Get a specific workflow.

**Response:** 200 OK
```json
{
  "data": { /* Workflow */ }
}
```

**Errors:**
- 404 Not Found: Workflow not found

---

#### PATCH /workflows/:id
Update a workflow.

**Request Body:** (all fields optional)
```json
{
  "title": string,
  "description": string,
  "assignee": string,
  "dueDate": string,
  "priority": string
}
```

**Response:** 200 OK
```json
{
  "data": { /* updated Workflow */ }
}
```

**Errors:**
- 404 Not Found
- 409 Conflict: Version mismatch (include version in request headers: `X-Resource-Version`)

---

#### DELETE /workflows/:id
Delete (soft delete) a workflow.

**Response:** 204 No Content

**Errors:**
- 404 Not Found
- 409 Conflict: Has active tasks

---

#### PATCH /workflows/:id/status
Change workflow status with validation.

**Request Body:**
```json
{
  "status": string
}
```

**Response:** 200 OK
```json
{
  "data": { /* updated Workflow */ }
}
```

**Validation Rules:**
- draft → active, archived
- active → paused, completed, archived
- paused → active, completed, archived
- completed → archived
- archived → (no transitions)

**Errors:**
- 400 Bad Request: Invalid status transition
- 404 Not Found

---

#### PATCH /workflows/bulk
Bulk update workflows.

**Request Body:**
```json
{
  "ids": [string],
  "updates": {
    "status": string,
    "assignee": string,
    "priority": string
  }
}
```

**Response:** 200 OK
```json
{
  "data": {
    "successful": [string],
    "failed": [
      {
        "id": string,
        "error": string
      }
    ]
  }
}
```

**Limit:** Max 50 workflows per request

---

### LEASES

#### POST /leases
Create a new lease.

**Request Body:**
```json
{
  "propertyId": string,
  "propertyName": string,
  "tenantId": string,
  "tenantName": string,
  "startDate": string,
  "endDate": string,
  "rentAmount": number,
  "securityDeposit": number,
  "renewalTerms": string (optional)
}
```

**Response:** 201 Created

**Validation:**
- All fields required except renewalTerms
- endDate > startDate
- rentAmount > 0

---

#### GET /leases
List all leases with optional filtering.

**Query Parameters:**
- `status`: Filter by status
- `propertyId`: Filter by property
- `tenantId`: Filter by tenant
- `expiringDays`: Show leases expiring within N days
- `page`: Page number
- `limit`: Items per page

**Response:** 200 OK

---

#### GET /leases/:id
Get a specific lease.

**Response:** 200 OK

---

#### PATCH /leases/:id
Update a lease.

**Request Body:** (all fields optional)
```json
{
  "tenantName": string,
  "endDate": string,
  "rentAmount": number,
  "renewalTerms": string
}
```

**Response:** 200 OK

---

#### DELETE /leases/:id
Delete (soft delete) a lease.

**Response:** 204 No Content

---

#### GET /leases/expiring?days=60
Get leases expiring within the specified number of days.

**Response:** 200 OK
```json
{
  "data": [
    {
      "id": string,
      "propertyName": string,
      "tenantName": string,
      "endDate": string,
      "status": string,
      "daysUntilExpiry": number
    }
  ]
}
```

**Business Logic:**
- Automatically transition lease to "expiring" status when endDate is within 60 days
- Automatically transition lease to "expired" status when endDate has passed

---

#### PATCH /leases/:id/status
Change lease status.

**Validation Rules:**
- draft → active
- active → expiring (manual or auto-triggered by date)
- expiring → expired, renewed
- expired → (no transitions)
- renewed → active

**Response:** 200 OK

---

#### PATCH /leases/bulk
Bulk update leases.

**Response:** 200 OK

**Limit:** Max 50 leases per request

---

### TASKS

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": string,
  "description": string,
  "assignee": string,
  "dueDate": string,
  "priority": string,
  "workflowId": string (optional),
  "estimatedHours": number (optional, default 0)
}
```

**Response:** 201 Created

**Validation:**
- title, assignee, dueDate: required
- estimatedHours: >= 0

---

#### GET /tasks
List all tasks.

**Query Parameters:**
- `status`: Filter by status
- `assignee`: Filter by assignee
- `workflowId`: Filter by workflow
- `page`: Page number
- `limit`: Items per page

**Response:** 200 OK

---

#### GET /tasks/:id
Get a specific task.

**Response:** 200 OK

---

#### PATCH /tasks/:id
Update a task.

**Request Body:** (all fields optional)
```json
{
  "title": string,
  "description": string,
  "assignee": string,
  "dueDate": string,
  "priority": string,
  "blockerReason": string,
  "actualHours": number,
  "dependencies": [string]
}
```

**Response:** 200 OK

---

#### DELETE /tasks/:id
Delete (soft delete) a task.

**Response:** 204 No Content

---

#### GET /tasks/workflow/:workflowId
Get all tasks for a specific workflow.

**Response:** 200 OK
```json
{
  "data": [ /* array of Tasks */ ]
}
```

---

#### PATCH /tasks/:id/status
Change task status.

**Validation Rules:**
- todo → in_progress
- in_progress → blocked, completed
- blocked → in_progress
- completed → (no transitions, read-only)

**Additional Rules:**
- Cannot transition to completed if task has blockerReason
- Cannot set blockerReason if status is not blocked

**Response:** 200 OK

---

#### PATCH /tasks/bulk
Bulk update tasks.

**Response:** 200 OK

**Limit:** Max 50 tasks per request

---

### MAINTENANCE REQUESTS

#### POST /maintenance
Create a new maintenance request.

**Request Body:**
```json
{
  "propertyId": string,
  "propertyName": string,
  "description": string,
  "priority": string,
  "costEstimate": number,
  "scheduledDate": string
}
```

**Response:** 201 Created

**Validation:**
- All fields required
- costEstimate > 0
- priority: one of low, medium, high, urgent, critical

---

#### GET /maintenance
List all maintenance requests.

**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority
- `propertyId`: Filter by property
- `page`: Page number
- `limit`: Items per page

**Response:** 200 OK

---

#### GET /maintenance/:id
Get a specific maintenance request.

**Response:** 200 OK

---

#### PATCH /maintenance/:id
Update a maintenance request.

**Request Body:** (all fields optional)
```json
{
  "description": string,
  "priority": string,
  "assignee": string,
  "actualCost": number,
  "completionDate": string
}
```

**Response:** 200 OK

**Business Logic:**
- If actualCost > costEstimate * 1.2, trigger alert/notification to requestor

---

#### DELETE /maintenance/:id
Delete (soft delete) a maintenance request.

**Response:** 204 No Content

---

#### PATCH /maintenance/:id/status
Change maintenance status.

**Validation Rules:**
- submitted → assigned, cancelled
- assigned → in_progress, cancelled
- in_progress → completed, cancelled
- completed → (no transitions, read-only)
- cancelled → (no transitions, read-only)

**Response:** 200 OK

---

#### GET /maintenance/property/:propertyId
Get all maintenance requests for a specific property.

**Response:** 200 OK
```json
{
  "data": [ /* array of MaintenanceRequests */ ]
}
```

---

#### PATCH /maintenance/bulk
Bulk update maintenance requests.

**Response:** 200 OK

**Limit:** Max 50 requests per request

---

### AUDIT TRAIL

#### GET /audit/:entityType/:entityId
Get audit trail for a specific entity.

**Query Parameters:**
- `limit`: Number of entries to return, default 50

**Response:** 200 OK
```json
{
  "data": [
    {
      "id": string,
      "operationType": string,
      "fieldChanged": string,
      "oldValue": any,
      "newValue": any,
      "userId": string,
      "timestamp": string,
      "reason": string
    }
  ]
}
```

---

#### GET /audit
Get all audit entries (paginated).

**Query Parameters:**
- `entityType`: Filter by entity type
- `userId`: Filter by user
- `operationType`: Filter by operation type
- `limit`: Items per page
- `offset`: Pagination offset

**Response:** 200 OK

---

### SYNC & CONFLICT RESOLUTION

#### POST /sync/operations
Sync pending operations from offline queue.

**Request Body:**
```json
{
  "operations": [
    {
      "id": string,
      "entityType": string,
      "entityId": string,
      "operationType": string,
      "operationData": object,
      "retryCount": number
    }
  ]
}
```

**Response:** 200 OK
```json
{
  "data": {
    "successful": [string],
    "failed": [
      {
        "operationId": string,
        "error": string,
        "retryable": boolean
      }
    ]
  }
}
```

---

#### GET /sync/version/:entityType/:entityId
Get current version of an entity for conflict detection.

**Response:** 200 OK
```json
{
  "data": {
    "version": number,
    "updatedAt": string,
    "updatedBy": string
  }
}
```

---

#### POST /sync/resolve-conflict
Resolve a conflict between concurrent edits.

**Request Body:**
```json
{
  "entityType": string,
  "entityId": string,
  "strategy": "keep_local" | "accept_remote" | "merge",
  "mergeData": object (optional, required if strategy is "merge")
}
```

**Response:** 200 OK
```json
{
  "data": {
    "resolved": boolean,
    "entity": object,
    "auditEntry": object
  }
}
```

---

### HEALTH CHECK

#### GET /health
Check API health status.

**Response:** 200 OK
```json
{
  "status": "ok",
  "timestamp": string,
  "version": string
}
```

---

## Rate Limiting

Recommended rate limits:
- 1000 requests per minute per user (general)
- 100 requests per minute per user (for bulk operations)

Return `429 Too Many Requests` when rate limit exceeded.

---

## Error Codes

| Code | HTTP Status | Meaning |
|------|------------|---------|
| INVALID_INPUT | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Entity not found |
| CONFLICT | 409 | Conflict (version mismatch, invalid state transition) |
| INVALID_STATE_TRANSITION | 409 | Invalid status transition |
| DEPENDENCY_ERROR | 409 | Cannot delete due to dependencies |
| RATE_LIMITED | 429 | Rate limit exceeded |
| SERVER_ERROR | 500 | Internal server error |

---

## Implementation Guide

### Database Schema Considerations
- Use versioning/timestamps for optimistic concurrency control
- Implement soft deletes (add deleted_at column)
- Create indexes on frequently queried fields (status, assignee, propertyId)
- Implement row-level security (RLS) for multi-tenant support

### Validation Logic
- Status transitions should be validated server-side before persisting
- Required fields validation
- Reference integrity checks (assignee exists, property exists, etc.)

### Audit Trail
- Log every create, update, delete, and status change
- Include old value, new value, user ID, and timestamp
- Soft delete should also be logged

### Performance Optimization
- Pagination for list endpoints (default 20, max 100 per page)
- Bulk operation limits (max 50 entities per request)
- Index on (entityType, entityId) for audit queries

### Notifications (Future)
- Webhook on entity creation
- Email notifications for status changes
- Alert on cost overruns (maintenance)
- Reminder on lease expiration (60, 30, 14, 7 days)
