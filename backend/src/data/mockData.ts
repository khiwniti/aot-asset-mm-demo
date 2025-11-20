// Mock data for development/testing

export const mockWorkflows = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Property Inspection Q4 2025',
    description: 'Annual property inspection for Q4',
    status: 'active',
    assignee: 'John Doe',
    priority: 'high',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Lease Renewal Process',
    description: 'Process lease renewals for expiring contracts',
    status: 'active',
    assignee: 'Jane Smith',
    priority: 'medium',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Maintenance Schedule',
    description: 'Scheduled maintenance for all properties',
    status: 'draft',
    assignee: 'Mike Johnson',
    priority: 'medium',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  }
];

export const mockLeases = [
  {
    id: '650e8400-e29b-41d4-a716-446655440000',
    property_id: 'prop-001',
    property_name: 'Sunset Apartments Unit 101',
    tenant_id: 'tenant-001',
    tenant_name: 'Alice Brown',
    start_date: '2025-01-01',
    end_date: '2026-01-01',
    rent_amount: 2500.00,
    status: 'active',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440001',
    property_id: 'prop-002',
    property_name: 'Downtown Office Space',
    tenant_id: 'tenant-002',
    tenant_name: 'Tech Corp LLC',
    start_date: '2024-06-01',
    end_date: '2025-12-01',
    rent_amount: 5000.00,
    status: 'expiring',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440002',
    property_id: 'prop-003',
    property_name: 'Riverside Villa',
    tenant_id: 'tenant-003',
    tenant_name: 'Bob Wilson',
    start_date: '2025-03-15',
    end_date: '2026-03-15',
    rent_amount: 3200.00,
    status: 'active',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  }
];

export const mockTasks = [
  {
    id: '750e8400-e29b-41d4-a716-446655440000',
    title: 'Complete roof inspection',
    description: 'Inspect roof for damage after recent storm',
    status: 'todo',
    assignee: 'John Doe',
    priority: 'high',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '750e8400-e29b-41d4-a716-446655440001',
    title: 'Update lease documents',
    description: 'Prepare renewal documents for expiring leases',
    status: 'in_progress',
    assignee: 'Jane Smith',
    priority: 'medium',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '750e8400-e29b-41d4-a716-446655440002',
    title: 'Review maintenance requests',
    description: 'Process pending maintenance requests',
    status: 'todo',
    assignee: 'Mike Johnson',
    priority: 'medium',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  }
];

export const mockMaintenance = [
  {
    id: '850e8400-e29b-41d4-a716-446655440000',
    property_id: 'prop-001',
    description: 'Fix leaking faucet in Unit 205',
    status: 'submitted',
    priority: 'medium',
    cost_estimate: 150.00,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '850e8400-e29b-41d4-a716-446655440001',
    property_id: 'prop-002',
    description: 'HVAC system maintenance',
    status: 'assigned',
    priority: 'high',
    assignee: 'HVAC Specialist',
    vendor: 'CoolAir Services',
    cost_estimate: 500.00,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  },
  {
    id: '850e8400-e29b-41d4-a716-446655440002',
    property_id: 'prop-003',
    description: 'Replace broken window',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'John Doe',
    vendor: 'Glass Masters',
    cost_estimate: 300.00,
    actual_cost: 280.00,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    version: 1
  }
];
