-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workflow table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    assignee TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    property_id TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Lease table
CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL,
    property_name TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'expiring', 'expired', 'renewed')),
    renewal_status TEXT CHECK (renewal_status IN ('none', 'draft', 'sent', 'negotiating', 'signed')),
    renewal_terms TEXT,
    auto_renewal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Task table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed')),
    assignee TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    parent_workflow_id TEXT,
    parent_task_ids TEXT[],
    blocker_reason TEXT,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Maintenance requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL,
    property_name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('submitted', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignee TEXT,
    vendor_id TEXT,
    cost_estimate DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    category TEXT NOT NULL,
    photos TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Entity audit trail
CREATE TABLE IF NOT EXISTS entity_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('workflow', 'lease', 'task', 'maintenance_request')),
    entity_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'status_change')),
    field_changed TEXT,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB
);

-- Pending operations for offline/sync queue
CREATE TABLE IF NOT EXISTS pending_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('workflow', 'lease', 'task', 'maintenance_request')),
    entity_id TEXT,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'status_change')),
    operation_data JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_retry_at TIMESTAMPTZ,
    error_message TEXT,
    user_id TEXT NOT NULL
);

-- Entity conflicts for concurrent editing
CREATE TABLE IF NOT EXISTS entity_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('workflow', 'lease', 'task', 'maintenance_request')),
    entity_id TEXT NOT NULL,
    local_version JSONB NOT NULL,
    remote_version JSONB NOT NULL,
    conflict_type TEXT NOT NULL CHECK (conflict_type IN ('concurrent_edit', 'version_mismatch')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lease_expiring', 'task_assigned', 'maintenance_overrun', 'sync_failed', 'conflict_detected')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_assignee ON workflows(assignee);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);
CREATE INDEX IF NOT EXISTS idx_workflows_is_deleted ON workflows(is_deleted);

CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_leases_end_date ON leases(end_date);
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_is_deleted ON leases(is_deleted);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_workflow_id ON tasks(parent_workflow_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_is_deleted ON maintenance_requests(is_deleted);

CREATE INDEX IF NOT EXISTS idx_entity_audit_trail_entity ON entity_audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_audit_trail_timestamp ON entity_audit_trail(timestamp);

CREATE INDEX IF NOT EXISTS idx_pending_operations_user_id ON pending_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_operations_status ON pending_operations(status);

CREATE INDEX IF NOT EXISTS idx_entity_conflicts_entity ON entity_conflicts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_conflicts_resolved ON entity_conflicts(resolved);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment version
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for version increment
CREATE TRIGGER increment_workflows_version BEFORE UPDATE ON workflows
    FOR EACH ROW WHEN (OLD.version IS NOT NULL)
    EXECUTE FUNCTION increment_version();

CREATE TRIGGER increment_leases_version BEFORE UPDATE ON leases
    FOR EACH ROW WHEN (OLD.version IS NOT NULL)
    EXECUTE FUNCTION increment_version();

CREATE TRIGGER increment_tasks_version BEFORE UPDATE ON tasks
    FOR EACH ROW WHEN (OLD.version IS NOT NULL)
    EXECUTE FUNCTION increment_version();

CREATE TRIGGER increment_maintenance_requests_version BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW WHEN (OLD.version IS NOT NULL)
    EXECUTE FUNCTION increment_version();

-- Function to automatically transition lease status based on end date
CREATE OR REPLACE FUNCTION update_lease_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-transition to expiring when end date is within 60 days
    IF NEW.end_date <= NOW() + INTERVAL '60 days' AND NEW.end_date > NOW() AND NEW.status = 'active' THEN
        NEW.status = 'expiring';
    END IF;
    
    -- Auto-transition to expired when end date has passed
    IF NEW.end_date < NOW() AND NEW.status IN ('active', 'expiring') THEN
        NEW.status = 'expired';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic lease status updates
CREATE TRIGGER update_lease_status_trigger BEFORE INSERT OR UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_lease_status();

-- Row Level Security (RLS) policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic example - customize based on your auth system)
CREATE POLICY "Users can view their own workflows" ON workflows
    FOR SELECT USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own workflows" ON workflows
    FOR INSERT WITH CHECK (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own workflows" ON workflows
    FOR UPDATE USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own leases" ON leases
    FOR SELECT USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own leases" ON leases
    FOR INSERT WITH CHECK (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own leases" ON leases
    FOR UPDATE USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own maintenance requests" ON maintenance_requests
    FOR SELECT USING (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own maintenance requests" ON maintenance_requests
    FOR INSERT WITH CHECK (created_by = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own maintenance requests" ON maintenance_requests
    FOR UPDATE USING (created_by = current_setting('app.current_user_id', true));

-- Audit trail policies (read-only for users who created the entity)
CREATE POLICY "Users can view audit trail for their entities" ON entity_audit_trail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows w 
            WHERE w.id = entity_audit_trail.entity_id 
            AND w.created_by = current_setting('app.current_user_id', true)
            AND entity_audit_trail.entity_type = 'workflow'
        )
        OR EXISTS (
            SELECT 1 FROM leases l 
            WHERE l.id = entity_audit_trail.entity_id 
            AND l.created_by = current_setting('app.current_user_id', true)
            AND entity_audit_trail.entity_type = 'lease'
        )
        OR EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = entity_audit_trail.entity_id 
            AND t.created_by = current_setting('app.current_user_id', true)
            AND entity_audit_trail.entity_type = 'task'
        )
        OR EXISTS (
            SELECT 1 FROM maintenance_requests mr 
            WHERE mr.id = entity_audit_trail.entity_id 
            AND mr.created_by = current_setting('app.current_user_id', true)
            AND entity_audit_trail.entity_type = 'maintenance_request'
        )
    );

-- Pending operations policies
CREATE POLICY "Users can view their own pending operations" ON pending_operations
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own pending operations" ON pending_operations
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own pending operations" ON pending_operations
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Entity conflicts policies
CREATE POLICY "Users can view their own conflicts" ON entity_conflicts
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Insert sample data (optional - for testing)
INSERT INTO workflows (title, description, status, assignee, priority, created_by, updated_by) VALUES
('Q1 Budget Review', 'Annual budget review for Q1 2024', 'draft', 'Sarah Johnson', 'high', 'admin', 'admin'),
('HVAC Maintenance', 'Regular HVAC system maintenance', 'active', 'Mike Chen', 'medium', 'admin', 'admin'),
('Lease Renewal Campaign', 'Contact tenants with expiring leases', 'active', 'Emily Davis', 'critical', 'admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO leases (property_id, property_name, tenant_id, tenant_name, start_date, end_date, rent, status, created_by, updated_by) VALUES
('P001', 'Suvarnabhumi Residence - Unit 5F', 'T001', 'TechCorp Inc.', '2023-01-15', '2025-12-15', 8500.00, 'expiring', 'admin', 'admin'),
('P003', 'Park Villa - 204', 'T002', 'Design Studio LLC', '2022-06-01', '2026-05-31', 6200.00, 'active', 'admin', 'admin'),
('P004', 'Sriracha View - 8A', 'T003', 'Medical Group', '2024-03-01', '2027-02-28', 4800.00, 'active', 'admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, assignee, priority, parent_workflow_id, created_by, updated_by) VALUES
('Review financial documents', 'Gather and review Q1 financial statements', 'todo', 'Sarah Johnson', 'high', 'Q1 Budget Review', 'admin', 'admin'),
('Schedule budget meeting', 'Coordinate with stakeholders for budget review meeting', 'todo', 'Sarah Johnson', 'medium', 'Q1 Budget Review', 'admin', 'admin'),
('Inspect HVAC systems', 'Perform routine inspection of all HVAC units', 'in_progress', 'Mike Chen', 'medium', 'HVAC Maintenance', 'admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO maintenance_requests (property_id, property_name, description, status, priority, category, cost_estimate, created_by, updated_by) VALUES
('P001', 'Suvarnabhumi Residence', 'HVAC system not cooling properly in common areas', 'submitted', 'high', 'HVAC', 5000.00, 'admin', 'admin'),
('P003', 'Park Villa', 'Leaky faucet in unit 204', 'assigned', 'low', 'Plumbing', 150.00, 'admin', 'admin'),
('P004', 'Sriracha View', 'Electrical outlet not working in lobby', 'in_progress', 'medium', 'Electrical', 300.00, 'admin', 'admin')
ON CONFLICT DO NOTHING;
