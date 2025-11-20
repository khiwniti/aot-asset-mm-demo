/**
 * Backend API Integration Tests
 * Tests all REST API endpoints for CRUD operations
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

let testWorkflowId: string;
let testLeaseId: string;
let testTaskId: string;
let testMaintenanceId: string;

describe('Backend API Tests', () => {
  
  // ==================== HEALTH CHECK ====================
  describe('Health Check', () => {
    test('GET /api/health should return 200 with status ok', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
    });
  });

  // ==================== WORKFLOWS API ====================
  describe('Workflows API', () => {
    test('POST /api/workflows - Create workflow with valid data', async () => {
      const workflow = {
        name: 'Test Workflow',
        description: 'Test workflow for QA',
        status: 'draft',
        assignedTo: 'test-user@aot.com'
      };

      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(workflow.name);
      expect(data.data.id).toBeDefined();
      
      testWorkflowId = data.data.id;
    });

    test('POST /api/workflows - Should reject workflow with missing name', async () => {
      const workflow = {
        description: 'Test workflow without name',
        status: 'draft'
      };

      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    test('GET /api/workflows - Get all workflows', async () => {
      const response = await fetch(`${API_BASE_URL}/workflows`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('GET /api/workflows/:id - Get one workflow', async () => {
      const response = await fetch(`${API_BASE_URL}/workflows/${testWorkflowId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testWorkflowId);
    });

    test('GET /api/workflows/:id - Should return 404 for non-existent workflow', async () => {
      const response = await fetch(`${API_BASE_URL}/workflows/non-existent-id`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    test('PUT /api/workflows/:id - Update workflow', async () => {
      const updates = {
        status: 'active',
        description: 'Updated description'
      };

      const response = await fetch(`${API_BASE_URL}/workflows/${testWorkflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('active');
      expect(data.data.description).toBe('Updated description');
    });

    test('GET /api/workflows/:id/audit - Get audit trail', async () => {
      const response = await fetch(`${API_BASE_URL}/workflows/${testWorkflowId}/audit`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('DELETE /api/workflows/:id - Delete workflow', async () => {
      const response = await fetch(`${API_BASE_URL}/workflows/${testWorkflowId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ==================== LEASES API ====================
  describe('Leases API', () => {
    test('POST /api/leases - Create lease', async () => {
      const lease = {
        tenantName: 'Test Tenant',
        propertyId: 'prop-123',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        monthlyRent: 25000,
        status: 'draft'
      };

      const response = await fetch(`${API_BASE_URL}/leases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lease)
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.tenantName).toBe(lease.tenantName);
      
      testLeaseId = data.data.id;
    });

    test('GET /api/leases - Get all leases', async () => {
      const response = await fetch(`${API_BASE_URL}/leases`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('PUT /api/leases/:id - Update lease status', async () => {
      const response = await fetch(`${API_BASE_URL}/leases/${testLeaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('active');
    });
  });

  // ==================== TASKS API ====================
  describe('Tasks API', () => {
    test('POST /api/tasks - Create task', async () => {
      const task = {
        title: 'Test Task',
        description: 'QA Test Task',
        status: 'todo',
        priority: 'high',
        assignedTo: 'test-user@aot.com',
        dueDate: '2024-12-31'
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(task.title);
      
      testTaskId = data.data.id;
    });

    test('GET /api/tasks - Get all tasks', async () => {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('PUT /api/tasks/:id - Update task to in_progress', async () => {
      const response = await fetch(`${API_BASE_URL}/tasks/${testTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('in_progress');
    });
  });

  // ==================== MAINTENANCE API ====================
  describe('Maintenance Requests API', () => {
    test('POST /api/maintenance - Create maintenance request', async () => {
      const maintenance = {
        propertyId: 'prop-123',
        title: 'Fix Plumbing',
        description: 'Leaking pipe in bathroom',
        priority: 'high',
        status: 'submitted'
      };

      const response = await fetch(`${API_BASE_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenance)
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(maintenance.title);
      
      testMaintenanceId = data.data.id;
    });

    test('GET /api/maintenance - Get all maintenance requests', async () => {
      const response = await fetch(`${API_BASE_URL}/maintenance`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('PUT /api/maintenance/:id - Update to assigned', async () => {
      const response = await fetch(`${API_BASE_URL}/maintenance/${testMaintenanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'assigned',
          assignedTo: 'technician@aot.com'
        })
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('assigned');
    });
  });
});
