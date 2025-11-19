// Entity Service - API calls to backend for CRUD operations and real data

import {
  Workflow,
  Lease,
  Task,
  MaintenanceRequest,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  CreateLeaseRequest,
  UpdateLeaseRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  BulkOperationResult,
  AuditTrailEntry,
  PendingOperation
} from '../types/entities';

// API Base URL - adjust based on your backend setup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper for API calls with error handling and retry logic
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error('Failed to complete API call');
}

// ============ WORKFLOW API ============

export const workflowAPI = {
  async create(data: CreateWorkflowRequest): Promise<Workflow> {
    return apiCall<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<Workflow[]> {
    return apiCall<Workflow[]>('/workflows');
  },

  async getById(id: string): Promise<Workflow> {
    return apiCall<Workflow>(`/workflows/${id}`);
  },

  async update(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    return apiCall<Workflow>(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/workflows/${id}`, { method: 'DELETE' });
  },

  async bulkUpdate(
    ids: string[],
    updates: Partial<UpdateWorkflowRequest>
  ): Promise<BulkOperationResult> {
    return apiCall<BulkOperationResult>('/workflows/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, updates }),
    });
  },

  async changeStatus(
    id: string,
    status: string
  ): Promise<Workflow> {
    return apiCall<Workflow>(`/workflows/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ============ LEASE API ============

export const leaseAPI = {
  async create(data: CreateLeaseRequest): Promise<Lease> {
    return apiCall<Lease>('/leases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<Lease[]> {
    return apiCall<Lease[]>('/leases');
  },

  async getById(id: string): Promise<Lease> {
    return apiCall<Lease>(`/leases/${id}`);
  },

  async update(id: string, data: UpdateLeaseRequest): Promise<Lease> {
    return apiCall<Lease>(`/leases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/leases/${id}`, { method: 'DELETE' });
  },

  async getExpiringLeases(daysAhead: number = 60): Promise<Lease[]> {
    return apiCall<Lease[]>(`/leases/expiring?days=${daysAhead}`);
  },

  async changeStatus(id: string, status: string): Promise<Lease> {
    return apiCall<Lease>(`/leases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async bulkUpdate(
    ids: string[],
    updates: Partial<UpdateLeaseRequest>
  ): Promise<BulkOperationResult> {
    return apiCall<BulkOperationResult>('/leases/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, updates }),
    });
  },
};

// ============ TASK API ============

export const taskAPI = {
  async create(data: CreateTaskRequest): Promise<Task> {
    return apiCall<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<Task[]> {
    return apiCall<Task[]>('/tasks');
  },

  async getById(id: string): Promise<Task> {
    return apiCall<Task>(`/tasks/${id}`);
  },

  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    return apiCall<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/tasks/${id}`, { method: 'DELETE' });
  },

  async getByWorkflow(workflowId: string): Promise<Task[]> {
    return apiCall<Task[]>(`/tasks/workflow/${workflowId}`);
  },

  async changeStatus(id: string, status: string): Promise<Task> {
    return apiCall<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async bulkUpdate(
    ids: string[],
    updates: Partial<UpdateTaskRequest>
  ): Promise<BulkOperationResult> {
    return apiCall<BulkOperationResult>('/tasks/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, updates }),
    });
  },
};

// ============ MAINTENANCE API ============

export const maintenanceAPI = {
  async create(data: CreateMaintenanceRequest): Promise<MaintenanceRequest> {
    return apiCall<MaintenanceRequest>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<MaintenanceRequest[]> {
    return apiCall<MaintenanceRequest[]>('/maintenance');
  },

  async getById(id: string): Promise<MaintenanceRequest> {
    return apiCall<MaintenanceRequest>(`/maintenance/${id}`);
  },

  async update(
    id: string,
    data: UpdateMaintenanceRequest
  ): Promise<MaintenanceRequest> {
    return apiCall<MaintenanceRequest>(`/maintenance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/maintenance/${id}`, { method: 'DELETE' });
  },

  async changeStatus(
    id: string,
    status: string
  ): Promise<MaintenanceRequest> {
    return apiCall<MaintenanceRequest>(`/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async bulkUpdate(
    ids: string[],
    updates: Partial<UpdateMaintenanceRequest>
  ): Promise<BulkOperationResult> {
    return apiCall<BulkOperationResult>('/maintenance/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, updates }),
    });
  },

  async getByProperty(propertyId: string): Promise<MaintenanceRequest[]> {
    return apiCall<MaintenanceRequest[]>(
      `/maintenance/property/${propertyId}`
    );
  },
};

// ============ AUDIT TRAIL API ============

export const auditAPI = {
  async getForEntity(
    entityType: string,
    entityId: string
  ): Promise<AuditTrailEntry[]> {
    return apiCall<AuditTrailEntry[]>(
      `/audit/${entityType}/${entityId}`
    );
  },

  async getAll(limit: number = 100): Promise<AuditTrailEntry[]> {
    return apiCall<AuditTrailEntry[]>(`/audit?limit=${limit}`);
  },
};

// ============ SYNC API ============

export const syncAPI = {
  async syncPendingOperations(
    operations: PendingOperation[]
  ): Promise<BulkOperationResult> {
    return apiCall<BulkOperationResult>('/sync/operations', {
      method: 'POST',
      body: JSON.stringify({ operations }),
    });
  },

  async getEntityVersion(
    entityType: string,
    entityId: string
  ): Promise<{ version: number; updatedAt: string }> {
    return apiCall<{ version: number; updatedAt: string }>(
      `/sync/version/${entityType}/${entityId}`
    );
  },

  async resolveConflict(
    entityType: string,
    entityId: string,
    strategy: 'keep_local' | 'accept_remote' | 'merge',
    mergeData?: Record<string, any>
  ): Promise<any> {
    return apiCall<any>('/sync/resolve-conflict', {
      method: 'POST',
      body: JSON.stringify({
        entityType,
        entityId,
        strategy,
        mergeData,
      }),
    });
  },
};

// ============ HEALTH CHECK ============

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch {
    return false;
  }
};
