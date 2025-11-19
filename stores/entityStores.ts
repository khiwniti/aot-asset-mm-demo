// Entity State Stores - Zustand stores for real-time state management

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Workflow,
  Lease,
  Task,
  MaintenanceRequest,
  WorkflowStatus,
  LeaseStatus,
  TaskStatus,
  MaintenanceStatus,
  Priority,
  SyncStatus,
  PendingOperation,
  ConflictInfo,
  VALID_WORKFLOW_TRANSITIONS,
  VALID_LEASE_TRANSITIONS,
  VALID_TASK_TRANSITIONS,
  VALID_MAINTENANCE_TRANSITIONS,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  CreateLeaseRequest,
  UpdateLeaseRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
} from '../types/entities';
import {
  workflowAPI,
  leaseAPI,
  taskAPI,
  maintenanceAPI,
} from '../services/entityService';

// ============ WORKFLOW STORE ============

interface WorkflowStore {
  workflows: Workflow[];
  syncStatus: SyncStatus;
  conflicts: ConflictInfo[];
  pendingOperations: PendingOperation[];
  selectedWorkflows: Set<string>;

  // Workflows
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflowLocal: (id: string, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;
  
  // Sync
  setSyncStatus: (status: SyncStatus) => void;
  addConflict: (conflict: ConflictInfo) => void;
  resolveConflict: (conflictId: string, resolution: any) => void;
  
  // Bulk Operations
  selectWorkflow: (id: string) => void;
  deselectWorkflow: (id: string) => void;
  clearSelection: () => void;
  
  // API Operations (with optimistic updates)
  createWorkflow: (data: CreateWorkflowRequest) => Promise<Workflow>;
  updateWorkflow: (id: string, data: UpdateWorkflowRequest) => Promise<Workflow>;
  changeWorkflowStatus: (id: string, status: WorkflowStatus) => Promise<Workflow>;
  deleteWorkflow: (id: string) => Promise<void>;
  fetchWorkflows: () => Promise<void>;
  bulkUpdateWorkflows: (
    ids: string[],
    updates: Partial<UpdateWorkflowRequest>
  ) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  syncStatus: 'offline',
  conflicts: [],
  pendingOperations: [],
  selectedWorkflows: new Set(),

  setWorkflows: (workflows) => set({ workflows }),
  
  addWorkflow: (workflow) =>
    set((state) => ({
      workflows: [...state.workflows, workflow],
    })),

  updateWorkflowLocal: (id, updates) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id
          ? {
              ...w,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: w.version + 1,
            }
          : w
      ),
    })),

  removeWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    })),

  setSyncStatus: (status) => set({ syncStatus: status }),

  addConflict: (conflict) =>
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
    })),

  resolveConflict: (conflictId, resolution) =>
    set((state) => ({
      conflicts: state.conflicts.filter((c) => c.entityId !== conflictId),
    })),

  selectWorkflow: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedWorkflows);
      newSelection.add(id);
      return { selectedWorkflows: newSelection };
    }),

  deselectWorkflow: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedWorkflows);
      newSelection.delete(id);
      return { selectedWorkflows: newSelection };
    }),

  clearSelection: () => set({ selectedWorkflows: new Set() }),

  createWorkflow: async (data) => {
    const store = get();
    const optimisticWorkflow: Workflow = {
      id: uuidv4(),
      ...data,
      status: WorkflowStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      version: 1,
    };

    store.addWorkflow(optimisticWorkflow);
    store.setSyncStatus('syncing');

    try {
      const created = await workflowAPI.create(data);
      store.updateWorkflowLocal(optimisticWorkflow.id, created);
      store.setSyncStatus('synced');
      return created;
    } catch (error) {
      store.removeWorkflow(optimisticWorkflow.id);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  updateWorkflow: async (id, data) => {
    const store = get();
    const workflow = store.workflows.find((w) => w.id === id);
    if (!workflow) throw new Error('Workflow not found');

    const previousState = { ...workflow };
    store.updateWorkflowLocal(id, data);
    store.setSyncStatus('syncing');

    try {
      const updated = await workflowAPI.update(id, data);
      store.updateWorkflowLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateWorkflowLocal(id, previousState);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  changeWorkflowStatus: async (id, newStatus) => {
    const store = get();
    const workflow = store.workflows.find((w) => w.id === id);
    if (!workflow) throw new Error('Workflow not found');

    const validTransitions = VALID_WORKFLOW_TRANSITIONS[workflow.status];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${workflow.status} to ${newStatus}`
      );
    }

    const previousStatus = workflow.status;
    store.updateWorkflowLocal(id, { status: newStatus });
    store.setSyncStatus('syncing');

    try {
      const updated = await workflowAPI.changeStatus(id, newStatus);
      store.updateWorkflowLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateWorkflowLocal(id, { status: previousStatus });
      store.setSyncStatus('failed');
      throw error;
    }
  },

  deleteWorkflow: async (id) => {
    const store = get();
    const workflow = store.workflows.find((w) => w.id === id);
    if (!workflow) throw new Error('Workflow not found');

    store.removeWorkflow(id);
    store.setSyncStatus('syncing');

    try {
      await workflowAPI.delete(id);
      store.setSyncStatus('synced');
    } catch (error) {
      store.addWorkflow(workflow);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchWorkflows: async () => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const workflows = await workflowAPI.getAll();
      store.setWorkflows(workflows);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  bulkUpdateWorkflows: async (ids, updates) => {
    const store = get();
    const previousStates = store.workflows
      .filter((w) => ids.includes(w.id))
      .map((w) => ({ ...w }));

    store.workflows.forEach((w) => {
      if (ids.includes(w.id)) {
        store.updateWorkflowLocal(w.id, updates);
      }
    });
    store.setSyncStatus('syncing');

    try {
      await workflowAPI.bulkUpdate(ids, updates);
      store.setSyncStatus('synced');
    } catch (error) {
      previousStates.forEach((w) => {
        store.updateWorkflowLocal(w.id, w);
      });
      store.setSyncStatus('failed');
      throw error;
    }
  },
}));

// ============ LEASE STORE ============

interface LeaseStore {
  leases: Lease[];
  syncStatus: SyncStatus;
  selectedLeases: Set<string>;

  setLeases: (leases: Lease[]) => void;
  addLease: (lease: Lease) => void;
  updateLeaseLocal: (id: string, updates: Partial<Lease>) => void;
  removeLease: (id: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  selectLease: (id: string) => void;
  deselectLease: (id: string) => void;
  clearSelection: () => void;

  createLease: (data: CreateLeaseRequest) => Promise<Lease>;
  updateLease: (id: string, data: UpdateLeaseRequest) => Promise<Lease>;
  changeLeaseStatus: (id: string, status: LeaseStatus) => Promise<Lease>;
  deleteLease: (id: string) => Promise<void>;
  fetchLeases: () => Promise<void>;
  fetchExpiringLeases: (daysAhead?: number) => Promise<void>;
  bulkUpdateLeases: (
    ids: string[],
    updates: Partial<UpdateLeaseRequest>
  ) => Promise<void>;
}

export const useLeaseStore = create<LeaseStore>((set, get) => ({
  leases: [],
  syncStatus: 'offline',
  selectedLeases: new Set(),

  setLeases: (leases) => set({ leases }),

  addLease: (lease) =>
    set((state) => ({
      leases: [...state.leases, lease],
    })),

  updateLeaseLocal: (id, updates) =>
    set((state) => ({
      leases: state.leases.map((l) =>
        l.id === id
          ? {
              ...l,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: l.version + 1,
            }
          : l
      ),
    })),

  removeLease: (id) =>
    set((state) => ({
      leases: state.leases.filter((l) => l.id !== id),
    })),

  setSyncStatus: (status) => set({ syncStatus: status }),

  selectLease: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedLeases);
      newSelection.add(id);
      return { selectedLeases: newSelection };
    }),

  deselectLease: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedLeases);
      newSelection.delete(id);
      return { selectedLeases: newSelection };
    }),

  clearSelection: () => set({ selectedLeases: new Set() }),

  createLease: async (data) => {
    const store = get();
    const optimisticLease: Lease = {
      id: uuidv4(),
      ...data,
      status: LeaseStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      version: 1,
    };

    store.addLease(optimisticLease);
    store.setSyncStatus('syncing');

    try {
      const created = await leaseAPI.create(data);
      store.updateLeaseLocal(optimisticLease.id, created);
      store.setSyncStatus('synced');
      return created;
    } catch (error) {
      store.removeLease(optimisticLease.id);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  updateLease: async (id, data) => {
    const store = get();
    const lease = store.leases.find((l) => l.id === id);
    if (!lease) throw new Error('Lease not found');

    const previousState = { ...lease };
    store.updateLeaseLocal(id, data);
    store.setSyncStatus('syncing');

    try {
      const updated = await leaseAPI.update(id, data);
      store.updateLeaseLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateLeaseLocal(id, previousState);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  changeLeaseStatus: async (id, newStatus) => {
    const store = get();
    const lease = store.leases.find((l) => l.id === id);
    if (!lease) throw new Error('Lease not found');

    const validTransitions = VALID_LEASE_TRANSITIONS[lease.status];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${lease.status} to ${newStatus}`
      );
    }

    const previousStatus = lease.status;
    store.updateLeaseLocal(id, { status: newStatus });
    store.setSyncStatus('syncing');

    try {
      const updated = await leaseAPI.changeStatus(id, newStatus);
      store.updateLeaseLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateLeaseLocal(id, { status: previousStatus });
      store.setSyncStatus('failed');
      throw error;
    }
  },

  deleteLease: async (id) => {
    const store = get();
    const lease = store.leases.find((l) => l.id === id);
    if (!lease) throw new Error('Lease not found');

    store.removeLease(id);
    store.setSyncStatus('syncing');

    try {
      await leaseAPI.delete(id);
      store.setSyncStatus('synced');
    } catch (error) {
      store.addLease(lease);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchLeases: async () => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const leases = await leaseAPI.getAll();
      store.setLeases(leases);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchExpiringLeases: async (daysAhead = 60) => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const leases = await leaseAPI.getExpiringLeases(daysAhead);
      store.setLeases(leases);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  bulkUpdateLeases: async (ids, updates) => {
    const store = get();
    const previousStates = store.leases
      .filter((l) => ids.includes(l.id))
      .map((l) => ({ ...l }));

    store.leases.forEach((l) => {
      if (ids.includes(l.id)) {
        store.updateLeaseLocal(l.id, updates);
      }
    });
    store.setSyncStatus('syncing');

    try {
      await leaseAPI.bulkUpdate(ids, updates);
      store.setSyncStatus('synced');
    } catch (error) {
      previousStates.forEach((l) => {
        store.updateLeaseLocal(l.id, l);
      });
      store.setSyncStatus('failed');
      throw error;
    }
  },
}));

// ============ TASK STORE ============

interface TaskStore {
  tasks: Task[];
  syncStatus: SyncStatus;
  selectedTasks: Set<string>;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTaskLocal: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  selectTask: (id: string) => void;
  deselectTask: (id: string) => void;
  clearSelection: () => void;

  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  changeTaskStatus: (id: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchByWorkflow: (workflowId: string) => Promise<void>;
  bulkUpdateTasks: (ids: string[], updates: Partial<UpdateTaskRequest>) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  syncStatus: 'offline',
  selectedTasks: new Set(),

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTaskLocal: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: t.version + 1,
            }
          : t
      ),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  setSyncStatus: (status) => set({ syncStatus: status }),

  selectTask: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedTasks);
      newSelection.add(id);
      return { selectedTasks: newSelection };
    }),

  deselectTask: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedTasks);
      newSelection.delete(id);
      return { selectedTasks: newSelection };
    }),

  clearSelection: () => set({ selectedTasks: new Set() }),

  createTask: async (data) => {
    const store = get();
    const optimisticTask: Task = {
      id: uuidv4(),
      ...data,
      status: TaskStatus.TODO,
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      version: 1,
    };

    store.addTask(optimisticTask);
    store.setSyncStatus('syncing');

    try {
      const created = await taskAPI.create(data);
      store.updateTaskLocal(optimisticTask.id, created);
      store.setSyncStatus('synced');
      return created;
    } catch (error) {
      store.removeTask(optimisticTask.id);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  updateTask: async (id, data) => {
    const store = get();
    const task = store.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');

    const previousState = { ...task };
    store.updateTaskLocal(id, data);
    store.setSyncStatus('syncing');

    try {
      const updated = await taskAPI.update(id, data);
      store.updateTaskLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateTaskLocal(id, previousState);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  changeTaskStatus: async (id, newStatus) => {
    const store = get();
    const task = store.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');

    const validTransitions = VALID_TASK_TRANSITIONS[task.status];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${task.status} to ${newStatus}`
      );
    }

    if (newStatus === TaskStatus.COMPLETED && task.blockerReason) {
      throw new Error('Cannot complete a blocked task');
    }

    const previousStatus = task.status;
    store.updateTaskLocal(id, { status: newStatus });
    store.setSyncStatus('syncing');

    try {
      const updated = await taskAPI.changeStatus(id, newStatus);
      store.updateTaskLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateTaskLocal(id, { status: previousStatus });
      store.setSyncStatus('failed');
      throw error;
    }
  },

  deleteTask: async (id) => {
    const store = get();
    const task = store.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');

    store.removeTask(id);
    store.setSyncStatus('syncing');

    try {
      await taskAPI.delete(id);
      store.setSyncStatus('synced');
    } catch (error) {
      store.addTask(task);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchTasks: async () => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const tasks = await taskAPI.getAll();
      store.setTasks(tasks);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchByWorkflow: async (workflowId) => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const tasks = await taskAPI.getByWorkflow(workflowId);
      store.setTasks(tasks);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  bulkUpdateTasks: async (ids, updates) => {
    const store = get();
    const previousStates = store.tasks
      .filter((t) => ids.includes(t.id))
      .map((t) => ({ ...t }));

    store.tasks.forEach((t) => {
      if (ids.includes(t.id)) {
        store.updateTaskLocal(t.id, updates);
      }
    });
    store.setSyncStatus('syncing');

    try {
      await taskAPI.bulkUpdate(ids, updates);
      store.setSyncStatus('synced');
    } catch (error) {
      previousStates.forEach((t) => {
        store.updateTaskLocal(t.id, t);
      });
      store.setSyncStatus('failed');
      throw error;
    }
  },
}));

// ============ MAINTENANCE STORE ============

interface MaintenanceStore {
  requests: MaintenanceRequest[];
  syncStatus: SyncStatus;
  selectedRequests: Set<string>;

  setRequests: (requests: MaintenanceRequest[]) => void;
  addRequest: (request: MaintenanceRequest) => void;
  updateRequestLocal: (id: string, updates: Partial<MaintenanceRequest>) => void;
  removeRequest: (id: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  selectRequest: (id: string) => void;
  deselectRequest: (id: string) => void;
  clearSelection: () => void;

  createRequest: (data: CreateMaintenanceRequest) => Promise<MaintenanceRequest>;
  updateRequest: (id: string, data: UpdateMaintenanceRequest) => Promise<MaintenanceRequest>;
  changeRequestStatus: (id: string, status: MaintenanceStatus) => Promise<MaintenanceRequest>;
  deleteRequest: (id: string) => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchByProperty: (propertyId: string) => Promise<void>;
  bulkUpdateRequests: (ids: string[], updates: Partial<UpdateMaintenanceRequest>) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  requests: [],
  syncStatus: 'offline',
  selectedRequests: new Set(),

  setRequests: (requests) => set({ requests }),

  addRequest: (request) =>
    set((state) => ({
      requests: [...state.requests, request],
    })),

  updateRequestLocal: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: r.version + 1,
            }
          : r
      ),
    })),

  removeRequest: (id) =>
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== id),
    })),

  setSyncStatus: (status) => set({ syncStatus: status }),

  selectRequest: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedRequests);
      newSelection.add(id);
      return { selectedRequests: newSelection };
    }),

  deselectRequest: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedRequests);
      newSelection.delete(id);
      return { selectedRequests: newSelection };
    }),

  clearSelection: () => set({ selectedRequests: new Set() }),

  createRequest: async (data) => {
    const store = get();
    const optimisticRequest: MaintenanceRequest = {
      id: uuidv4(),
      ...data,
      status: MaintenanceStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      version: 1,
    };

    store.addRequest(optimisticRequest);
    store.setSyncStatus('syncing');

    try {
      const created = await maintenanceAPI.create(data);
      store.updateRequestLocal(optimisticRequest.id, created);
      store.setSyncStatus('synced');
      return created;
    } catch (error) {
      store.removeRequest(optimisticRequest.id);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  updateRequest: async (id, data) => {
    const store = get();
    const request = store.requests.find((r) => r.id === id);
    if (!request) throw new Error('Maintenance request not found');

    const previousState = { ...request };
    store.updateRequestLocal(id, data);
    store.setSyncStatus('syncing');

    try {
      const updated = await maintenanceAPI.update(id, data);
      store.updateRequestLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateRequestLocal(id, previousState);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  changeRequestStatus: async (id, newStatus) => {
    const store = get();
    const request = store.requests.find((r) => r.id === id);
    if (!request) throw new Error('Maintenance request not found');

    const validTransitions = VALID_MAINTENANCE_TRANSITIONS[request.status];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${request.status} to ${newStatus}`
      );
    }

    const previousStatus = request.status;
    store.updateRequestLocal(id, { status: newStatus });
    store.setSyncStatus('syncing');

    try {
      const updated = await maintenanceAPI.changeStatus(id, newStatus);
      store.updateRequestLocal(id, updated);
      store.setSyncStatus('synced');
      return updated;
    } catch (error) {
      store.updateRequestLocal(id, { status: previousStatus });
      store.setSyncStatus('failed');
      throw error;
    }
  },

  deleteRequest: async (id) => {
    const store = get();
    const request = store.requests.find((r) => r.id === id);
    if (!request) throw new Error('Maintenance request not found');

    store.removeRequest(id);
    store.setSyncStatus('syncing');

    try {
      await maintenanceAPI.delete(id);
      store.setSyncStatus('synced');
    } catch (error) {
      store.addRequest(request);
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchRequests: async () => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const requests = await maintenanceAPI.getAll();
      store.setRequests(requests);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  fetchByProperty: async (propertyId) => {
    const store = get();
    store.setSyncStatus('syncing');
    try {
      const requests = await maintenanceAPI.getByProperty(propertyId);
      store.setRequests(requests);
      store.setSyncStatus('synced');
    } catch (error) {
      store.setSyncStatus('failed');
      throw error;
    }
  },

  bulkUpdateRequests: async (ids, updates) => {
    const store = get();
    const previousStates = store.requests
      .filter((r) => ids.includes(r.id))
      .map((r) => ({ ...r }));

    store.requests.forEach((r) => {
      if (ids.includes(r.id)) {
        store.updateRequestLocal(r.id, updates);
      }
    });
    store.setSyncStatus('syncing');

    try {
      await maintenanceAPI.bulkUpdate(ids, updates);
      store.setSyncStatus('synced');
    } catch (error) {
      previousStates.forEach((r) => {
        store.updateRequestLocal(r.id, r);
      });
      store.setSyncStatus('failed');
      throw error;
    }
  },
}));
