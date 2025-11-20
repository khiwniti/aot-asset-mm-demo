import { Workflow, Lease, Task, MaintenanceRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USER_ID = 'user-' + Math.random().toString(36).substr(2, 9); // Temporary user ID

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-user-id': USER_ID,
};

// ==================== WORKFLOWS ====================

export const workflowsApi = {
  async create(data: Partial<Workflow>): Promise<Workflow> {
    const res = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<Workflow> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async getAll(filters?: Record<string, any>): Promise<Workflow[]> {
    const query = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${API_BASE_URL}/workflows${query ? '?' + query : ''}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<Workflow[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async getOne(id: string): Promise<Workflow> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<Workflow> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async update(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<Workflow> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    const result: ApiResponse<void> = await res.json();
    if (!result.success) throw new Error(result.error);
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}/audit`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<any[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },
};

// ==================== LEASES ====================

export const leasesApi = {
  async create(data: Partial<Lease>): Promise<Lease> {
    const res = await fetch(`${API_BASE_URL}/leases`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<Lease> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async getAll(filters?: Record<string, any>): Promise<Lease[]> {
    const query = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${API_BASE_URL}/leases${query ? '?' + query : ''}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<Lease[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async getOne(id: string): Promise<Lease> {
    const res = await fetch(`${API_BASE_URL}/leases/${id}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<Lease> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async update(id: string, data: Partial<Lease>): Promise<Lease> {
    const res = await fetch(`${API_BASE_URL}/leases/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<Lease> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/leases/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    const result: ApiResponse<void> = await res.json();
    if (!result.success) throw new Error(result.error);
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/leases/${id}/audit`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<any[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },
};

// ==================== TASKS ====================

export const tasksApi = {
  async create(data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<Task> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async getAll(filters?: Record<string, any>): Promise<Task[]> {
    const query = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${API_BASE_URL}/tasks${query ? '?' + query : ''}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<Task[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async getOne(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<Task> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<Task> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    const result: ApiResponse<void> = await res.json();
    if (!result.success) throw new Error(result.error);
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/audit`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<any[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },
};

// ==================== MAINTENANCE ====================

export const maintenanceApi = {
  async create(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<MaintenanceRequest> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async getAll(filters?: Record<string, any>): Promise<MaintenanceRequest[]> {
    const query = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${API_BASE_URL}/maintenance${query ? '?' + query : ''}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<MaintenanceRequest[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async getOne(id: string): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<MaintenanceRequest> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async update(id: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const result: ApiResponse<MaintenanceRequest> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    const result: ApiResponse<void> = await res.json();
    if (!result.success) throw new Error(result.error);
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}/audit`, {
      headers: defaultHeaders,
    });
    const result: ApiResponse<any[]> = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },
};

export default {
  workflows: workflowsApi,
  leases: leasesApi,
  tasks: tasksApi,
  maintenance: maintenanceApi,
};
