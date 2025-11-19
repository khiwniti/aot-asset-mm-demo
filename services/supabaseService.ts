import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Workflow, 
  Lease, 
  Task, 
  MaintenanceRequest, 
  EntityAuditTrail,
  PendingOperation,
  EntityConflict,
  Notification,
  SyncEvent
} from '../types/entities';

class SupabaseService {
  private client: SupabaseClient;
  private realtime: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://wvbyapxobvpiozdhyxjj.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    this.initializeRealtime();
  }

  private initializeRealtime() {
    this.realtime = this.client.channel('entity-changes');
    this.realtime.on('broadcast', { event: 'entity-update' }, (payload: any) => {
      this.handleRealtimeUpdate(payload);
    });
    this.realtime.subscribe();
  }

  private handleRealtimeUpdate(payload: any) {
    // This will be handled by the store subscribers
    console.log('Realtime update received:', payload);
  }

  // Generic CRUD operations
  async create<T>(table: string, data: Partial<T>): Promise<{ data: T | null; error: any }> {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (!error && result) {
      this.broadcastChange('entity_created', table, result.id, result);
    }
    
    return { data: result, error };
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<{ data: T | null; error: any }> {
    // Increment version for optimistic concurrency
    const updateData = { ...data, updatedAt: new Date().toISOString(), version: this.client.rpc('increment_version') };
    
    const { data: result, error } = await this.client
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && result) {
      this.broadcastChange('entity_updated', table, id, result);
    }
    
    return { data: result, error };
  }

  async delete(table: string, id: string): Promise<{ error: any }> {
    const { error } = await this.client
      .from(table)
      .update({ isDeleted: true, updatedAt: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) {
      this.broadcastChange('entity_deleted', table, id, { id, isDeleted: true });
    }
    
    return { error };
  }

  async getById<T>(table: string, id: string): Promise<{ data: T | null; error: any }> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('isDeleted', false)
      .single();
    
    return { data, error };
  }

  async getAll<T>(table: string, filters?: Record<string, any>): Promise<{ data: T[] | null; error: any }> {
    let query = this.client
      .from(table)
      .select('*')
      .eq('isDeleted', false);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query.order('createdAt', { ascending: false });
    
    return { data, error };
  }

  // Workflow specific operations
  async getWorkflowsByStatus(status: string): Promise<{ data: Workflow[] | null; error: any }> {
    const { data, error } = await this.client
      .from('workflows')
      .select('*')
      .eq('status', status)
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false });
    
    return { data, error };
  }

  async updateWorkflowStatus(id: string, status: string, userId: string): Promise<{ data: Workflow | null; error: any }> {
    return this.update('workflows', id, { 
      status, 
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });
  }

  // Lease specific operations
  async getLeasesExpiringWithin(days: number): Promise<{ data: Lease[] | null; error: any }> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await this.client
      .from('leases')
      .select('*')
      .eq('isDeleted', false)
      .lte('endDate', futureDate.toISOString())
      .gte('endDate', new Date().toISOString())
      .order('endDate', { ascending: true });
    
    return { data, error };
  }

  async updateLeaseStatus(id: string, status: string, userId: string): Promise<{ data: Lease | null; error: any }> {
    return this.update('leases', id, { 
      status, 
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });
  }

  // Task specific operations
  async getTasksByWorkflow(workflowId: string): Promise<{ data: Task[] | null; error: any }> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('parentWorkflowId', workflowId)
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false });
    
    return { data, error };
  }

  async updateTaskStatus(id: string, status: string, userId: string): Promise<{ data: Task | null; error: any }> {
    return this.update('tasks', id, { 
      status, 
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });
  }

  // Maintenance specific operations
  async getMaintenanceByPriority(priority: string): Promise<{ data: MaintenanceRequest[] | null; error: any }> {
    const { data, error } = await this.client
      .from('maintenance_requests')
      .select('*')
      .eq('priority', priority)
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false });
    
    return { data, error };
  }

  async updateMaintenanceStatus(id: string, status: string, userId: string): Promise<{ data: MaintenanceRequest | null; error: any }> {
    return this.update('maintenance_requests', id, { 
      status, 
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });
  }

  // Audit Trail operations
  async createAuditTrail(entry: Omit<EntityAuditTrail, 'id' | 'timestamp'>): Promise<{ error: any }> {
    const { error } = await this.client
      .from('entity_audit_trail')
      .insert({
        ...entry,
        timestamp: new Date().toISOString()
      });
    
    return { error };
  }

  async getAuditTrail(entityType: string, entityId: string): Promise<{ data: EntityAuditTrail[] | null; error: any }> {
    const { data, error } = await this.client
      .from('entity_audit_trail')
      .select('*')
      .eq('entityType', entityType)
      .eq('entityId', entityId)
      .order('timestamp', { ascending: false });
    
    return { data, error };
  }

  // Pending Operations
  async createPendingOperation(operation: Omit<PendingOperation, 'id' | 'createdAt'>): Promise<{ data: PendingOperation | null; error: any }> {
    return this.create('pending_operations', {
      ...operation,
      createdAt: new Date().toISOString()
    });
  }

  async getPendingOperations(userId: string): Promise<{ data: PendingOperation[] | null; error: any }> {
    const { data, error } = await this.client
      .from('pending_operations')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'pending')
      .order('createdAt', { ascending: true });
    
    return { data, error };
  }

  // Conflict Resolution
  async createConflict(conflict: Omit<EntityConflict, 'id' | 'createdAt'>): Promise<{ data: EntityConflict | null; error: any }> {
    return this.create('entity_conflicts', {
      ...conflict,
      createdAt: new Date().toISOString()
    });
  }

  async resolveConflict(conflictId: string): Promise<{ error: any }> {
    const { error } = await this.client
      .from('entity_conflicts')
      .update({ resolved: true })
      .eq('id', conflictId);
    
    return { error };
  }

  // Notifications
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<{ data: Notification | null; error: any }> {
    return this.create('notifications', {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  async getUnreadNotifications(userId: string): Promise<{ data: Notification[] | null; error: any }> {
    const { data, error } = await this.client
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .eq('read', false)
      .order('createdAt', { ascending: false });
    
    return { data, error };
  }

  async markNotificationRead(notificationId: string): Promise<{ error: any }> {
    const { error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    return { error };
  }

  // Real-time broadcasting
  private broadcastChange(type: string, entityType: string, entityId: string, data: any) {
    this.realtime.send({
      type: 'broadcast',
      event: 'entity-update',
      payload: {
        type,
        entityType,
        entityId,
        data,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Subscribe to real-time changes
  subscribeToChanges(callback: (event: SyncEvent) => void) {
    this.realtime.on('broadcast', { event: 'entity-update' }, (payload: any) => {
      callback(payload.payload as SyncEvent);
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('workflows').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
