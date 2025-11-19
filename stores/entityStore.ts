import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Workflow, 
  Lease, 
  Task, 
  MaintenanceRequest, 
  SyncEvent,
  PendingOperation,
  EntityConflict,
  Notification
} from '../types/entities';
import { supabaseService } from '../services/supabaseService';

interface EntityState {
  // Entity data
  workflows: Workflow[];
  leases: Lease[];
  tasks: Task[];
  maintenanceRequests: MaintenanceRequest[];
  
  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  syncStatus: 'synced' | 'syncing' | 'failed' | 'offline';
  
  // Conflict and offline support
  pendingOperations: PendingOperation[];
  conflicts: EntityConflict[];
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  // Workflow actions
  loadWorkflows: () => Promise<void>;
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  updateWorkflowStatus: (id: string, status: string) => Promise<void>;
  
  // Lease actions
  loadLeases: () => Promise<void>;
  addLease: (lease: Omit<Lease, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateLease: (id: string, updates: Partial<Lease>) => Promise<void>;
  deleteLease: (id: string) => Promise<void>;
  updateLeaseStatus: (id: string, status: string) => Promise<void>;
  getExpiringLeases: (days: number) => Promise<Lease[]>;
  
  // Task actions
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<void>;
  getTasksByWorkflow: (workflowId: string) => Task[];
  
  // Maintenance actions
  loadMaintenanceRequests: () => Promise<void>;
  addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateMaintenanceRequest: (id: string, updates: Partial<MaintenanceRequest>) => Promise<void>;
  deleteMaintenanceRequest: (id: string) => Promise<void>;
  updateMaintenanceStatus: (id: string, status: string) => Promise<void>;
  
  // Sync and conflict management
  handleRealtimeUpdate: (event: SyncEvent) => void;
  retryPendingOperations: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: 'local' | 'remote' | 'manual') => Promise<void>;
  
  // Notification actions
  loadNotifications: (userId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  
  // Utility actions
  setSyncStatus: (status: 'synced' | 'syncing' | 'failed' | 'offline') => void;
  clearCache: () => void;
}

export const useEntityStore = create<EntityState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    workflows: [],
    leases: [],
    tasks: [],
    maintenanceRequests: [],
    isLoading: false,
    isSyncing: false,
    syncStatus: 'synced',
    pendingOperations: [],
    conflicts: [],
    notifications: [],

    // Workflow actions
    loadWorkflows: async () => {
      set({ isLoading: true });
      try {
        const { data, error } = await supabaseService.getAll('workflows');
        if (error) throw error;
        set({ workflows: data || [], isLoading: false });
      } catch (error) {
        console.error('Failed to load workflows:', error);
        set({ isLoading: false, syncStatus: 'failed' });
      }
    },

    addWorkflow: async (workflowData) => {
      const workflow = {
        ...workflowData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      // Optimistic update
      set(state => ({ 
        workflows: [...state.workflows, workflow],
        isSyncing: true 
      }));

      try {
        const { data, error } = await supabaseService.create('workflows', workflow);
        if (error) throw error;
        
        // Update with server data
        if (data) {
          set(state => ({
            workflows: state.workflows.map(w => w.id === workflow.id ? data : w),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        // Rollback on error
        set(state => ({
          workflows: state.workflows.filter(w => w.id !== workflow.id),
          isSyncing: false,
          syncStatus: 'failed'
        }));
        
        // Add to pending operations
        const pendingOp: PendingOperation = {
          id: `pending-${Date.now()}`,
          entityType: 'workflow',
          operationType: 'create',
          operationData: workflow,
          status: 'pending',
          retryCount: 0,
          createdAt: new Date().toISOString(),
          userId: workflowData.createdBy
        };
        
        set(state => ({ pendingOperations: [...state.pendingOperations, pendingOp] }));
      }
    },

    updateWorkflow: async (id, updates) => {
      const originalWorkflow = get().workflows.find(w => w.id === id);
      if (!originalWorkflow) return;

      // Optimistic update
      set(state => ({
        workflows: state.workflows.map(w => w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w),
        isSyncing: true
      }));

      try {
        const { data, error } = await supabaseService.update('workflows', id, updates);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            workflows: state.workflows.map(w => w.id === id ? data : w),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        // Rollback on error
        set(state => ({
          workflows: state.workflows.map(w => w.id === id ? originalWorkflow : w),
          isSyncing: false,
          syncStatus: 'failed'
        }));
        
        // Add to pending operations
        const pendingOp: PendingOperation = {
          id: `pending-${Date.now()}`,
          entityType: 'workflow',
          entityId: id,
          operationType: 'update',
          operationData: updates,
          status: 'pending',
          retryCount: 0,
          createdAt: new Date().toISOString(),
          userId: updates.updatedBy || 'unknown'
        };
        
        set(state => ({ pendingOperations: [...state.pendingOperations, pendingOp] }));
      }
    },

    deleteWorkflow: async (id) => {
      const originalWorkflow = get().workflows.find(w => w.id === id);
      if (!originalWorkflow) return;

      // Optimistic update
      set(state => ({
        workflows: state.workflows.filter(w => w.id !== id),
        isSyncing: true
      }));

      try {
        const { error } = await supabaseService.delete('workflows', id);
        if (error) throw error;
        
        set({ isSyncing: false, syncStatus: 'synced' });
      } catch (error) {
        // Rollback on error
        set(state => ({
          workflows: [...state.workflows, originalWorkflow],
          isSyncing: false,
          syncStatus: 'failed'
        }));
        
        // Add to pending operations
        const pendingOp: PendingOperation = {
          id: `pending-${Date.now()}`,
          entityType: 'workflow',
          entityId: id,
          operationType: 'delete',
          operationData: {},
          status: 'pending',
          retryCount: 0,
          createdAt: new Date().toISOString(),
          userId: 'unknown'
        };
        
        set(state => ({ pendingOperations: [...state.pendingOperations, pendingOp] }));
      }
    },

    updateWorkflowStatus: async (id, status) => {
      await get().updateWorkflow(id, { status });
    },

    // Lease actions
    loadLeases: async () => {
      set({ isLoading: true });
      try {
        const { data, error } = await supabaseService.getAll('leases');
        if (error) throw error;
        set({ leases: data || [], isLoading: false });
      } catch (error) {
        console.error('Failed to load leases:', error);
        set({ isLoading: false, syncStatus: 'failed' });
      }
    },

    addLease: async (leaseData) => {
      const lease = {
        ...leaseData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      set(state => ({ 
        leases: [...state.leases, lease],
        isSyncing: true 
      }));

      try {
        const { data, error } = await supabaseService.create('leases', lease);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            leases: state.leases.map(l => l.id === lease.id ? data : l),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        set(state => ({
          leases: state.leases.filter(l => l.id !== lease.id),
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    updateLease: async (id, updates) => {
      const originalLease = get().leases.find(l => l.id === id);
      if (!originalLease) return;

      set(state => ({
        leases: state.leases.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l),
        isSyncing: true
      }));

      try {
        const { data, error } = await supabaseService.update('leases', id, updates);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            leases: state.leases.map(l => l.id === id ? data : l),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        set(state => ({
          leases: state.leases.map(l => l.id === id ? originalLease : l),
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    deleteLease: async (id) => {
      const originalLease = get().leases.find(l => l.id === id);
      if (!originalLease) return;

      set(state => ({
        leases: state.leases.filter(l => l.id !== id),
        isSyncing: true
      }));

      try {
        const { error } = await supabaseService.delete('leases', id);
        if (error) throw error;
        
        set({ isSyncing: false, syncStatus: 'synced' });
      } catch (error) {
        set(state => ({
          leases: [...state.leases, originalLease],
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    updateLeaseStatus: async (id, status) => {
      await get().updateLease(id, { status });
    },

    getExpiringLeases: async (days) => {
      try {
        const { data, error } = await supabaseService.getLeasesExpiringWithin(days);
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Failed to get expiring leases:', error);
        return [];
      }
    },

    // Task actions
    loadTasks: async () => {
      set({ isLoading: true });
      try {
        const { data, error } = await supabaseService.getAll('tasks');
        if (error) throw error;
        set({ tasks: data || [], isLoading: false });
      } catch (error) {
        console.error('Failed to load tasks:', error);
        set({ isLoading: false, syncStatus: 'failed' });
      }
    },

    addTask: async (taskData) => {
      const task = {
        ...taskData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      set(state => ({ 
        tasks: [...state.tasks, task],
        isSyncing: true 
      }));

      try {
        const { data, error } = await supabaseService.create('tasks', task);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            tasks: state.tasks.map(t => t.id === task.id ? data : t),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== task.id),
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    updateTask: async (id, updates) => {
      const originalTask = get().tasks.find(t => t.id === id);
      if (!originalTask) return;

      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
        isSyncing: true
      }));

      try {
        const { data, error } = await supabaseService.update('tasks', id, updates);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            tasks: state.tasks.map(t => t.id === id ? data : t),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? originalTask : t),
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    deleteTask: async (id) => {
      const originalTask = get().tasks.find(t => t.id === id);
      if (!originalTask) return;

      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isSyncing: true
      }));

      try {
        const { error } = await supabaseService.delete('tasks', id);
        if (error) throw error;
        
        set({ isSyncing: false, syncStatus: 'synced' });
      } catch (error) {
        set(state => ({
          tasks: [...state.tasks, originalTask],
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    updateTaskStatus: async (id, status) => {
      await get().updateTask(id, { status });
    },

    getTasksByWorkflow: (workflowId) => {
      return get().tasks.filter(task => task.parentWorkflowId === workflowId);
    },

    // Maintenance actions
    loadMaintenanceRequests: async () => {
      set({ isLoading: true });
      try {
        const { data, error } = await supabaseService.getAll('maintenance_requests');
        if (error) throw error;
        set({ maintenanceRequests: data || [], isLoading: false });
      } catch (error) {
        console.error('Failed to load maintenance requests:', error);
        set({ isLoading: false, syncStatus: 'failed' });
      }
    },

    addMaintenanceRequest: async (requestData) => {
      const request = {
        ...requestData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      set(state => ({ 
        maintenanceRequests: [...state.maintenanceRequests, request],
        isSyncing: true 
      }));

      try {
        const { data, error } = await supabaseService.create('maintenance_requests', request);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            maintenanceRequests: state.maintenanceRequests.map(r => r.id === request.id ? data : r),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        set(state => ({
          maintenanceRequests: state.maintenanceRequests.filter(r => r.id !== request.id),
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    updateMaintenanceRequest: async (id, updates) => {
      const originalRequest = get().maintenanceRequests.find(r => r.id === id);
      if (!originalRequest) return;

      set(state => ({
        maintenanceRequests: state.maintenanceRequests.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r),
        isSyncing: true
      }));

      try {
        const { data, error } = await supabaseService.update('maintenance_requests', id, updates);
        if (error) throw error;
        
        if (data) {
          set(state => ({
            maintenanceRequests: state.maintenanceRequests.map(r => r.id === id ? data : r),
            isSyncing: false,
            syncStatus: 'synced'
          }));
        }
      } catch (error) {
        set(state => ({
          maintenanceRequests: state.maintenanceRequests.map(r => r.id === id ? originalRequest : r),
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    deleteMaintenanceRequest: async (id) => {
      const originalRequest = get().maintenanceRequests.find(r => r.id === id);
      if (!originalRequest) return;

      set(state => ({
        maintenanceRequests: state.maintenanceRequests.filter(r => r.id !== id),
        isSyncing: true
      }));

      try {
        const { error } = await supabaseService.delete('maintenance_requests', id);
        if (error) throw error;
        
        set({ isSyncing: false, syncStatus: 'synced' });
      } catch (error) {
        set(state => ({
          maintenanceRequests: [...state.maintenanceRequests, originalRequest],
          isSyncing: false,
          syncStatus: 'failed'
        }));
      }
    },

    updateMaintenanceStatus: async (id, status) => {
      await get().updateMaintenanceRequest(id, { status });
    },

    // Sync and conflict management
    handleRealtimeUpdate: (event: SyncEvent) => {
      const { type, entityType, entityId, data } = event;
      
      switch (entityType) {
        case 'workflow':
          if (type === 'entity_deleted') {
            set(state => ({ workflows: state.workflows.filter(w => w.id !== entityId) }));
          } else {
            set(state => ({
              workflows: state.workflows.map(w => w.id === entityId ? { ...w, ...data } : w)
            }));
          }
          break;
        case 'lease':
          if (type === 'entity_deleted') {
            set(state => ({ leases: state.leases.filter(l => l.id !== entityId) }));
          } else {
            set(state => ({
              leases: state.leases.map(l => l.id === entityId ? { ...l, ...data } : l)
            }));
          }
          break;
        case 'task':
          if (type === 'entity_deleted') {
            set(state => ({ tasks: state.tasks.filter(t => t.id !== entityId) }));
          } else {
            set(state => ({
              tasks: state.tasks.map(t => t.id === entityId ? { ...t, ...data } : t)
            }));
          }
          break;
        case 'maintenance_request':
          if (type === 'entity_deleted') {
            set(state => ({ maintenanceRequests: state.maintenanceRequests.filter(r => r.id !== entityId) }));
          } else {
            set(state => ({
              maintenanceRequests: state.maintenanceRequests.map(r => r.id === entityId ? { ...r, ...data } : r)
            }));
          }
          break;
      }
    },

    retryPendingOperations: async () => {
      const pendingOps = get().pendingOperations.filter(op => op.status === 'pending');
      
      for (const operation of pendingOps) {
        try {
          // Retry the operation based on type
          // This is a simplified version - in production, you'd handle each operation type properly
          set(state => ({
            pendingOperations: state.pendingOperations.filter(op => op.id !== operation.id)
          }));
        } catch (error) {
          console.error('Failed to retry operation:', error);
        }
      }
    },

    resolveConflict: async (conflictId, resolution) => {
      // Handle conflict resolution logic
      set(state => ({
        conflicts: state.conflicts.filter(c => c.id !== conflictId)
      }));
    },

    // Notification actions
    loadNotifications: async (userId) => {
      try {
        const { data, error } = await supabaseService.getUnreadNotifications(userId);
        if (error) throw error;
        set({ notifications: data || [] });
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    },

    markNotificationRead: async (notificationId) => {
      try {
        await supabaseService.markNotificationRead(notificationId);
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        }));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },

    addNotification: (notification) => {
      const newNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({ notifications: [...state.notifications, newNotification] }));
    },

    // Utility actions
    setSyncStatus: (status) => set({ syncStatus: status }),
    
    clearCache: () => set({
      workflows: [],
      leases: [],
      tasks: [],
      maintenanceRequests: [],
      pendingOperations: [],
      conflicts: [],
      notifications: []
    })
  }))
);

// Initialize real-time subscription
supabaseService.subscribeToChanges((event: SyncEvent) => {
  useEntityStore.getState().handleRealtimeUpdate(event);
});
