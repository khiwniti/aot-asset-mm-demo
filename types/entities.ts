// Entity Types and Enums

// ============ ENUMS ============

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum LeaseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
  RENEWED = 'renewed'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed'
}

export enum MaintenanceStatus {
  SUBMITTED = 'submitted',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change'
}

export enum SyncStatus {
  SYNCED = 'synced',
  SYNCING = 'syncing',
  FAILED = 'failed',
  OFFLINE = 'offline'
}

// ============ INTERFACES ============

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

// Workflow Entity
export interface Workflow extends BaseEntity {
  title: string;
  description: string;
  status: WorkflowStatus;
  assignee: string;
  dueDate: string;
  priority: Priority;
  propertyId?: string;
}

// Lease Entity
export interface Lease extends BaseEntity {
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: LeaseStatus;
  renewalTerms?: string;
  securityDeposit: number;
}

// Task Entity
export interface Task extends BaseEntity {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  priority: Priority;
  workflowId?: string;
  blockerReason?: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
}

// Maintenance Request Entity
export interface MaintenanceRequest extends BaseEntity {
  propertyId: string;
  propertyName: string;
  description: string;
  status: MaintenanceStatus;
  priority: Priority;
  assignee?: string;
  costEstimate: number;
  actualCost?: number;
  scheduledDate: string;
  completionDate?: string;
}

// Audit Trail Entry
export interface AuditTrailEntry extends BaseEntity {
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance';
  entityId: string;
  operationType: OperationType;
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  userId: string;
  reason?: string;
}

// Pending Operation (for retry queue)
export interface PendingOperation {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance';
  entityId: string;
  operationType: OperationType;
  operationData: any;
  status: 'pending' | 'success' | 'failed';
  retryCount: number;
  createdAt: string;
  lastRetryAt?: string;
  errorMessage?: string;
}

// Conflict Information
export interface ConflictInfo {
  entityId: string;
  entityType: string;
  localVersion: number;
  remoteVersion: number;
  localChanges: Record<string, any>;
  remoteChanges: Record<string, any>;
  timestamp: string;
  userId: string;
}

// Bulk Operation Result
export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    entityId: string;
    error: string;
  }>;
  totalProcessed: number;
  totalRequested: number;
}

// Status Transition Info
export const VALID_WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  [WorkflowStatus.DRAFT]: [WorkflowStatus.ACTIVE, WorkflowStatus.ARCHIVED],
  [WorkflowStatus.ACTIVE]: [WorkflowStatus.PAUSED, WorkflowStatus.COMPLETED, WorkflowStatus.ARCHIVED],
  [WorkflowStatus.PAUSED]: [WorkflowStatus.ACTIVE, WorkflowStatus.COMPLETED, WorkflowStatus.ARCHIVED],
  [WorkflowStatus.COMPLETED]: [WorkflowStatus.ARCHIVED],
  [WorkflowStatus.ARCHIVED]: []
};

export const VALID_LEASE_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
  [LeaseStatus.DRAFT]: [LeaseStatus.ACTIVE],
  [LeaseStatus.ACTIVE]: [LeaseStatus.EXPIRING],
  [LeaseStatus.EXPIRING]: [LeaseStatus.EXPIRED, LeaseStatus.RENEWED],
  [LeaseStatus.EXPIRED]: [],
  [LeaseStatus.RENEWED]: [LeaseStatus.ACTIVE]
};

export const VALID_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.BLOCKED, TaskStatus.COMPLETED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.COMPLETED]: []
};

export const VALID_MAINTENANCE_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.SUBMITTED]: [MaintenanceStatus.ASSIGNED, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.ASSIGNED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.COMPLETED]: [],
  [MaintenanceStatus.CANCELLED]: []
};

// API Request/Response Types
export interface CreateWorkflowRequest {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority?: Priority;
  propertyId?: string;
}

export interface UpdateWorkflowRequest {
  title?: string;
  description?: string;
  status?: WorkflowStatus;
  assignee?: string;
  dueDate?: string;
  priority?: Priority;
}

export interface CreateLeaseRequest {
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  renewalTerms?: string;
}

export interface UpdateLeaseRequest {
  tenantName?: string;
  endDate?: string;
  rentAmount?: number;
  status?: LeaseStatus;
  renewalTerms?: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority?: Priority;
  workflowId?: string;
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee?: string;
  dueDate?: string;
  priority?: Priority;
  blockerReason?: string;
  actualHours?: number;
  dependencies?: string[];
}

export interface CreateMaintenanceRequest {
  propertyId: string;
  propertyName: string;
  description: string;
  priority: Priority;
  costEstimate: number;
  scheduledDate: string;
}

export interface UpdateMaintenanceRequest {
  description?: string;
  status?: MaintenanceStatus;
  priority?: Priority;
  assignee?: string;
  actualCost?: number;
  completionDate?: string;
}

// Sync Event Type
export interface SyncEvent {
  type: 'entity_updated' | 'entity_deleted' | 'entity_created' | 'conflict_detected';
  entityType: string;
  entityId: string;
  data: any;
  timestamp: string;
  userId?: string;
}
