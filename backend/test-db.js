import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Try to create tables
async function createTables() {
  console.log('Creating database tables...\n');

  const tables = `
    -- workflows table
    CREATE TABLE IF NOT EXISTS workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      assignee TEXT NOT NULL,
      due_date TIMESTAMP WITH TIME ZONE,
      priority TEXT NOT NULL DEFAULT 'medium',
      property_id UUID,
      version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_deleted BOOLEAN DEFAULT FALSE
    );
    
    -- leases table
    CREATE TABLE IF NOT EXISTS leases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL,
      property_name TEXT NOT NULL,
      tenant_id UUID NOT NULL,
      tenant_name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      rent_amount DECIMAL(12, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      renewal_terms TEXT,
      security_deposit DECIMAL(12, 2),
      version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_deleted BOOLEAN DEFAULT FALSE
    );
    
    -- tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      assignee TEXT NOT NULL,
      due_date TIMESTAMP WITH TIME ZONE,
      priority TEXT NOT NULL DEFAULT 'medium',
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
    
    -- maintenance_requests table
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      priority TEXT NOT NULL DEFAULT 'medium',
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
  `;

  // Insert sample data for workflows
  const { data: workflowData, error: workflowError } = await supabase
    .from('workflows')
    .insert([
      {
        title: 'Property Inspection Q4 2025',
        description: 'Annual property inspection for Q4',
        status: 'active',
        assignee: 'John Doe',
        priority: 'high',
        created_by: 'system'
      },
      {
        title: 'Lease Renewal Process',
        description: 'Process lease renewals for expiring contracts',
        status: 'active',
        assignee: 'Jane Smith',
        priority: 'medium',
        created_by: 'system'
      }
    ])
    .select();

  if (workflowError) {
    console.log('⚠️  workflows table might not exist yet:', workflowError.message);
    console.log('   Please run setup.sql in Supabase dashboard\n');
  } else {
    console.log('✅ Sample workflows created:', workflowData.length);
  }

  // Insert sample data for leases
  const { data: leaseData, error: leaseError } = await supabase
    .from('leases')
    .insert([
      {
        property_id: '550e8400-e29b-41d4-a716-446655440000',
        property_name: 'Sunset Apartments Unit 101',
        tenant_id: '550e8400-e29b-41d4-a716-446655440001',
        tenant_name: 'Alice Brown',
        start_date: '2025-01-01',
        end_date: '2026-01-01',
        rent_amount: 2500.00,
        status: 'active',
        created_by: 'system'
      },
      {
        property_id: '550e8400-e29b-41d4-a716-446655440002',
        property_name: 'Downtown Office Space',
        tenant_id: '550e8400-e29b-41d4-a716-446655440003',
        tenant_name: 'Tech Corp LLC',
        start_date: '2024-06-01',
        end_date: '2025-12-01',
        rent_amount: 5000.00,
        status: 'expiring',
        created_by: 'system'
      }
    ])
    .select();

  if (leaseError) {
    console.log('⚠️  leases table might not exist yet:', leaseError.message);
  } else {
    console.log('✅ Sample leases created:', leaseData.length);
  }

  // Insert sample data for tasks
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .insert([
      {
        title: 'Complete roof inspection',
        description: 'Inspect roof for damage after recent storm',
        status: 'todo',
        assignee: 'John Doe',
        priority: 'high',
        created_by: 'system'
      },
      {
        title: 'Update lease documents',
        description: 'Prepare renewal documents for expiring leases',
        status: 'in_progress',
        assignee: 'Jane Smith',
        priority: 'medium',
        created_by: 'system'
      }
    ])
    .select();

  if (taskError) {
    console.log('⚠️  tasks table might not exist yet:', taskError.message);
  } else {
    console.log('✅ Sample tasks created:', taskData.length);
  }

  // Insert sample data for maintenance
  const { data: maintenanceData, error: maintenanceError } = await supabase
    .from('maintenance_requests')
    .insert([
      {
        property_id: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Fix leaking faucet in Unit 205',
        status: 'submitted',
        priority: 'medium',
        cost_estimate: 150.00,
        created_by: 'system'
      },
      {
        property_id: '550e8400-e29b-41d4-a716-446655440001',
        description: 'HVAC system maintenance',
        status: 'assigned',
        priority: 'high',
        cost_estimate: 500.00,
        created_by: 'system'
      }
    ])
    .select();

  if (maintenanceError) {
    console.log('⚠️  maintenance_requests table might not exist yet:', maintenanceError.message);
  } else {
    console.log('✅ Sample maintenance requests created:', maintenanceData.length);
  }

  console.log('\n✅ Database setup completed!');
  console.log('\nIf you see errors above, please run the SQL in backend/setup.sql');
  console.log('in your Supabase SQL Editor: https://supabase.com/dashboard/project/wvbyapxobvpiozdhyxjj/sql\n');
}

createTables().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
