export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  isDeleted: boolean;
}

// Workflow Entity
export interface Workflow extends BaseEntity {
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  assignee: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  propertyId?: string;
  tags?: string[];
}

// Lease Entity
export interface Lease extends BaseEntity {
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rent: number;
  securityDeposit?: number;
  status: 'draft' | 'active' | 'expiring' | 'expired' | 'renewed';
  renewalStatus?: 'none' | 'draft' | 'sent' | 'negotiating' | 'signed';
  renewalTerms?: string;
  autoRenewal: boolean;
}

// Task Entity
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  assignee: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parentWorkflowId?: string;
  parentTaskIds?: string[];
  blockerReason?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
}

// Maintenance Request Entity
export interface MaintenanceRequest extends BaseEntity {
  propertyId: string;
  propertyName: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string; // vendor or staff member
  vendorId?: string;
  costEstimate?: number;
  actualCost?: number;
  scheduledDate?: string;
  completionDate?: string;
  category: string;
  photos?: string[];
  notes?: string;
}

// Entity Audit Trail
export interface EntityAuditTrail {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityId: string;
  timestamp: string;
  userId: string;
  operation: 'create' | 'update' | 'delete' | 'status_change';
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

// Pending Operation for offline/sync queue
export interface PendingOperation {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityId?: string;
  operationType: 'create' | 'update' | 'delete' | 'status_change';
  operationData: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  retryCount: number;
  createdAt: string;
  lastRetryAt?: string;
  errorMessage?: string;
  userId: string;
}

// Conflict Resolution
export interface EntityConflict {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityId: string;
  localVersion: Record<string, any>;
  remoteVersion: Record<string, any>;
  conflictType: 'concurrent_edit' | 'version_mismatch';
  createdAt: string;
  userId: string;
  resolved: boolean;
}

// Real-time Sync Event
export interface SyncEvent {
  type: 'entity_created' | 'entity_updated' | 'entity_deleted' | 'status_changed';
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityId: string;
  data: Record<string, any>;
  userId: string;
  timestamp: string;
}

// Agent Command Types
export interface AgentCommand {
  type: 'create' | 'update' | 'query' | 'bulk_operation';
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  naturalLanguage: string;
  parsedData?: Record<string, any>;
  userId: string;
}

// Agent Response
export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  uiComponent?: {
    type: 'workflow_manager' | 'lease_manager' | 'task_board' | 'maintenance_tracker';
    props: Record<string, any>;
  };
  errors?: string[];
}

// Status Transition Rules
export interface StatusTransitionRule {
  from: string;
  to: string[];
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  validation?: (entity: any, newStatus: string) => boolean;
}

// Bulk Operation
export interface BulkOperation {
  type: 'assign' | 'change_status' | 'change_priority' | 'delete';
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityIds: string[];
  data: Record<string, any>;
  userId: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'lease_expiring' | 'task_assigned' | 'maintenance_overrun' | 'sync_failed' | 'conflict_detected';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}
