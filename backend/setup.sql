-- AOT Asset Management System Database Schema
-- Run this in your Supabase SQL Editor

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  assignee TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  property_id UUID,
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_assignee ON workflows(assignee);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);

-- Create leases table
CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  property_name TEXT NOT NULL,
  tenant_id UUID NOT NULL,
  tenant_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expiring', 'expired', 'renewed')),
  renewal_terms TEXT,
  security_deposit DECIMAL(12, 2),
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_leases_end_date ON leases(end_date);
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed')),
  assignee TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  parent_workflow_id UUID,
  blocker_reason TEXT,
  estimated_hours DECIMAL(5, 1),
  actual_hours DECIMAL(5, 1),
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_workflow_id ON tasks(parent_workflow_id);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT,
  vendor TEXT,
  cost_estimate DECIMAL(12, 2) NOT NULL,
  actual_cost DECIMAL(12, 2),
  scheduled_date DATE,
  completion_date DATE,
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_requests(property_id);

-- Create audit_trails table
CREATE TABLE IF NOT EXISTS audit_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_changed TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  operation_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity_id ON audit_trails(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity_type ON audit_trails(entity_type);

-- Create pending_operations table
CREATE TABLE IF NOT EXISTS pending_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  operation_type TEXT NOT NULL,
  operation_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_operations(status);

-- Insert sample data

-- Sample workflows
INSERT INTO workflows (title, description, status, assignee, priority, created_by) 
VALUES 
  ('Property Inspection Q4 2025', 'Annual property inspection for Q4', 'active', 'John Doe', 'high', 'system'),
  ('Lease Renewal Process', 'Process lease renewals for expiring contracts', 'active', 'Jane Smith', 'medium', 'system'),
  ('Maintenance Schedule', 'Scheduled maintenance for all properties', 'draft', 'Mike Johnson', 'medium', 'system')
ON CONFLICT DO NOTHING;

-- Sample leases
INSERT INTO leases (property_id, property_name, tenant_id, tenant_name, start_date, end_date, rent_amount, status, created_by)
VALUES
  (gen_random_uuid(), 'Sunset Apartments Unit 101', gen_random_uuid(), 'Alice Brown', '2025-01-01', '2026-01-01', 2500.00, 'active', 'system'),
  (gen_random_uuid(), 'Downtown Office Space', gen_random_uuid(), 'Tech Corp LLC', '2024-06-01', '2025-12-01', 5000.00, 'expiring', 'system'),
  (gen_random_uuid(), 'Riverside Villa', gen_random_uuid(), 'Bob Wilson', '2025-03-15', '2026-03-15', 3200.00, 'active', 'system')
ON CONFLICT DO NOTHING;

-- Sample tasks
INSERT INTO tasks (title, description, status, assignee, priority, created_by)
VALUES
  ('Complete roof inspection', 'Inspect roof for damage after recent storm', 'todo', 'John Doe', 'high', 'system'),
  ('Update lease documents', 'Prepare renewal documents for expiring leases', 'in_progress', 'Jane Smith', 'medium', 'system'),
  ('Review maintenance requests', 'Process pending maintenance requests', 'todo', 'Mike Johnson', 'medium', 'system')
ON CONFLICT DO NOTHING;

-- Sample maintenance requests
INSERT INTO maintenance_requests (property_id, description, status, priority, cost_estimate, created_by)
VALUES
  (gen_random_uuid(), 'Fix leaking faucet in Unit 205', 'submitted', 'medium', 150.00, 'system'),
  (gen_random_uuid(), 'HVAC system maintenance', 'assigned', 'high', 500.00, 'system'),
  (gen_random_uuid(), 'Replace broken window', 'in_progress', 'urgent', 300.00, 'system')
ON CONFLICT DO NOTHING;
