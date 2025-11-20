import supabase from '../utils/supabaseClient.js';
import { 
  Workflow, 
  Lease, 
  Task, 
  MaintenanceRequest, 
  AuditTrail,
  PendingOperation 
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class EntityService {
  // ==================== WORKFLOWS ====================
  
  static async createWorkflow(data: Partial<Workflow>, userId: string): Promise<Workflow> {
    const workflow: Workflow = {
      id: uuidv4(),
      title: data.title || '',
      description: data.description,
      status: 'draft',
      assignee: data.assignee || '',
      due_date: data.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: data.priority || 'medium',
      property_id: data.property_id,
      version: 1,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { error } = await supabase
      .from('workflows')
      .insert([workflow]);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'workflow',
      entity_id: workflow.id,
      field_changed: 'all',
      old_value: null,
      new_value: workflow,
      operation_type: 'create',
      user_id: userId,
    });

    return workflow;
  }

  static async updateWorkflow(id: string, data: Partial<Workflow>, userId: string): Promise<Workflow> {
    const { data: existing } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) throw new Error('Workflow not found');

    const updated: Workflow = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('workflows')
      .update(updated)
      .eq('id', id);

    if (error) throw error;

    // Record audit trail for each changed field
    for (const [key, value] of Object.entries(data)) {
      if (existing[key as keyof Workflow] !== value) {
        await this.createAuditTrail({
          entity_type: 'workflow',
          entity_id: id,
          field_changed: key,
          old_value: existing[key as keyof Workflow],
          new_value: value,
          operation_type: data.status && existing.status !== data.status ? 'status_change' : 'update',
          user_id: userId,
        });
      }
    }

    return updated;
  }

  static async getWorkflow(id: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflows(filters?: Record<string, any>): Promise<Workflow[]> {
    let query = supabase
      .from('workflows')
      .select('*')
      .eq('is_deleted', false);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignee) {
      query = query.eq('assignee', filters.assignee);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async deleteWorkflow(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'workflow',
      entity_id: id,
      field_changed: 'is_deleted',
      old_value: false,
      new_value: true,
      operation_type: 'delete',
      user_id: userId,
    });
  }

  // ==================== LEASES ====================

  static async createLease(data: Partial<Lease>, userId: string): Promise<Lease> {
    const lease: Lease = {
      id: uuidv4(),
      property_id: data.property_id || '',
      property_name: data.property_name || '',
      tenant_id: data.tenant_id || '',
      tenant_name: data.tenant_name || '',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rent_amount: data.rent_amount || 0,
      status: 'draft',
      renewal_terms: data.renewal_terms,
      security_deposit: data.security_deposit || 0,
      version: 1,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { error } = await supabase
      .from('leases')
      .insert([lease]);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'lease',
      entity_id: lease.id,
      field_changed: 'all',
      old_value: null,
      new_value: lease,
      operation_type: 'create',
      user_id: userId,
    });

    return lease;
  }

  static async updateLease(id: string, data: Partial<Lease>, userId: string): Promise<Lease> {
    const { data: existing } = await supabase
      .from('leases')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) throw new Error('Lease not found');

    const updated: Lease = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('leases')
      .update(updated)
      .eq('id', id);

    if (error) throw error;

    for (const [key, value] of Object.entries(data)) {
      if (existing[key as keyof Lease] !== value) {
        await this.createAuditTrail({
          entity_type: 'lease',
          entity_id: id,
          field_changed: key,
          old_value: existing[key as keyof Lease],
          new_value: value,
          operation_type: data.status && existing.status !== data.status ? 'status_change' : 'update',
          user_id: userId,
        });
      }
    }

    return updated;
  }

  static async getLease(id: string): Promise<Lease> {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  static async getLeases(filters?: Record<string, any>): Promise<Lease[]> {
    let query = supabase
      .from('leases')
      .select('*')
      .eq('is_deleted', false);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }

    const { data, error } = await query.order('end_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async deleteLease(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('leases')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'lease',
      entity_id: id,
      field_changed: 'is_deleted',
      old_value: false,
      new_value: true,
      operation_type: 'delete',
      user_id: userId,
    });
  }

  // ==================== TASKS ====================

  static async createTask(data: Partial<Task>, userId: string): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      title: data.title || '',
      description: data.description,
      status: 'todo',
      assignee: data.assignee || '',
      due_date: data.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: data.priority || 'medium',
      parent_workflow_id: data.parent_workflow_id,
      estimated_hours: data.estimated_hours,
      actual_hours: data.actual_hours,
      version: 1,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { error } = await supabase
      .from('tasks')
      .insert([task]);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'task',
      entity_id: task.id,
      field_changed: 'all',
      old_value: null,
      new_value: task,
      operation_type: 'create',
      user_id: userId,
    });

    return task;
  }

  static async updateTask(id: string, data: Partial<Task>, userId: string): Promise<Task> {
    const { data: existing } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) throw new Error('Task not found');

    const updated: Task = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('tasks')
      .update(updated)
      .eq('id', id);

    if (error) throw error;

    for (const [key, value] of Object.entries(data)) {
      if (existing[key as keyof Task] !== value) {
        await this.createAuditTrail({
          entity_type: 'task',
          entity_id: id,
          field_changed: key,
          old_value: existing[key as keyof Task],
          new_value: value,
          operation_type: data.status && existing.status !== data.status ? 'status_change' : 'update',
          user_id: userId,
        });
      }
    }

    return updated;
  }

  static async getTask(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  static async getTasks(filters?: Record<string, any>): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('is_deleted', false);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignee) {
      query = query.eq('assignee', filters.assignee);
    }
    if (filters?.parentWorkflowId) {
      query = query.eq('parent_workflow_id', filters.parentWorkflowId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async deleteTask(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'task',
      entity_id: id,
      field_changed: 'is_deleted',
      old_value: false,
      new_value: true,
      operation_type: 'delete',
      user_id: userId,
    });
  }

  // ==================== MAINTENANCE REQUESTS ====================

  static async createMaintenanceRequest(
    data: Partial<MaintenanceRequest>,
    userId: string
  ): Promise<MaintenanceRequest> {
    const request: MaintenanceRequest = {
      id: uuidv4(),
      property_id: data.property_id || '',
      description: data.description || '',
      status: 'submitted',
      priority: data.priority || 'medium',
      assignee: data.assignee,
      vendor: data.vendor,
      cost_estimate: data.cost_estimate || 0,
      actual_cost: data.actual_cost,
      scheduled_date: data.scheduled_date,
      completion_date: data.completion_date,
      version: 1,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { error } = await supabase
      .from('maintenance_requests')
      .insert([request]);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'maintenance_request',
      entity_id: request.id,
      field_changed: 'all',
      old_value: null,
      new_value: request,
      operation_type: 'create',
      user_id: userId,
    });

    return request;
  }

  static async updateMaintenanceRequest(
    id: string,
    data: Partial<MaintenanceRequest>,
    userId: string
  ): Promise<MaintenanceRequest> {
    const { data: existing } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) throw new Error('Maintenance request not found');

    const updated: MaintenanceRequest = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('maintenance_requests')
      .update(updated)
      .eq('id', id);

    if (error) throw error;

    for (const [key, value] of Object.entries(data)) {
      if (existing[key as keyof MaintenanceRequest] !== value) {
        await this.createAuditTrail({
          entity_type: 'maintenance_request',
          entity_id: id,
          field_changed: key,
          old_value: existing[key as keyof MaintenanceRequest],
          new_value: value,
          operation_type: data.status && existing.status !== data.status ? 'status_change' : 'update',
          user_id: userId,
        });
      }
    }

    return updated;
  }

  static async getMaintenanceRequest(id: string): Promise<MaintenanceRequest> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  static async getMaintenanceRequests(filters?: Record<string, any>): Promise<MaintenanceRequest[]> {
    let query = supabase
      .from('maintenance_requests')
      .select('*')
      .eq('is_deleted', false);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async deleteMaintenanceRequest(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_requests')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await this.createAuditTrail({
      entity_type: 'maintenance_request',
      entity_id: id,
      field_changed: 'is_deleted',
      old_value: false,
      new_value: true,
      operation_type: 'delete',
      user_id: userId,
    });
  }

  // ==================== AUDIT & TRACKING ====================

  private static async createAuditTrail(data: Partial<AuditTrail>): Promise<void> {
    const trail: AuditTrail = {
      id: uuidv4(),
      entity_type: data.entity_type || 'workflow',
      entity_id: data.entity_id || '',
      field_changed: data.field_changed || '',
      old_value: data.old_value,
      new_value: data.new_value,
      operation_type: data.operation_type || 'update',
      user_id: data.user_id || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    await supabase
      .from('audit_trails')
      .insert([trail])
      .catch(err => console.error('Failed to create audit trail:', err));
  }

  static async getAuditTrail(entityId: string, entityType?: string): Promise<AuditTrail[]> {
    let query = supabase
      .from('audit_trails')
      .select('*')
      .eq('entity_id', entityId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ==================== CONFLICT DETECTION ====================

  static async checkVersionConflict(
    entityType: string,
    entityId: string,
    clientVersion: number
  ): Promise<boolean> {
    const table = this.getTableName(entityType);
    const { data } = await supabase
      .from(table)
      .select('version')
      .eq('id', entityId)
      .single();

    return data && data.version > clientVersion;
  }

  private static getTableName(entityType: string): string {
    const tableMap: Record<string, string> = {
      workflow: 'workflows',
      lease: 'leases',
      task: 'tasks',
      maintenance_request: 'maintenance_requests',
    };
    return tableMap[entityType] || entityType;
  }
}
