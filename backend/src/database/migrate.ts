import supabase from '../utils/supabaseClient.js';

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    // Create workflows table
    const { error: workflowError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    // Create leases table
    const { error: leaseError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    // Create tasks table
    const { error: taskError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed')),
          assignee TEXT NOT NULL,
          due_date TIMESTAMP WITH TIME ZONE,
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
          parent_workflow_id UUID REFERENCES workflows(id),
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
      `
    });

    // Create maintenance_requests table
    const { error: maintenanceError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    // Create audit_trails table
    const { error: auditError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    // Create pending_operations table
    const { error: pendingError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
