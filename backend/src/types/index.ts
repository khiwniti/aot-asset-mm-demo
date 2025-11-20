export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
}

// Workflow
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface Workflow extends BaseEntity {
  title: string;
  description: string;
  status: WorkflowStatus;
  assignee: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  property_id?: string;
  version: number;
}

// Lease
export type LeaseStatus = 'draft' | 'active' | 'expiring' | 'expired' | 'renewed';

export interface Lease extends BaseEntity {
  property_id: string;
  property_name: string;
  tenant_id: string;
  tenant_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: LeaseStatus;
  renewal_terms?: string;
  security_deposit: number;
  version: number;
}

// Task
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export interface Task extends BaseEntity {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parent_workflow_id?: string;
  blocker_reason?: string;
  estimated_hours?: number;
  actual_hours?: number;
  version: number;
}

// Maintenance Request
export type MaintenanceStatus = 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceRequest extends BaseEntity {
  property_id: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  assignee?: string;
  vendor?: string;
  cost_estimate: number;
  actual_cost?: number;
  scheduled_date?: string;
  completion_date?: string;
  version: number;
}

// Audit Trail
export interface AuditTrail extends BaseEntity {
  entity_type: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entity_id: string;
  field_changed: string;
  old_value: any;
  new_value: any;
  operation_type: 'create' | 'update' | 'delete' | 'status_change';
  user_id: string;
}

// Pending Operations
export type OperationType = 'create' | 'update' | 'delete';

export interface PendingOperation extends BaseEntity {
  entity_type: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entity_id: string;
  operation_type: OperationType;
  operation_data: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  retry_count: number;
  last_retry_at?: string;
  error_message?: string;
}

// Conflict Detection
export interface ConflictDetection {
  entity_id: string;
  entity_type: string;
  conflict_type: 'concurrent_edit' | 'version_mismatch';
  local_version: number;
  remote_version: number;
  local_data: Record<string, any>;
  remote_data: Record<string, any>;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
