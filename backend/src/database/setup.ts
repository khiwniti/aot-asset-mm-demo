import supabase from '../utils/supabaseClient.js';

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database tables...\n');

    // Create workflows table
    console.log('Creating workflows table...');
    const { error: workflowError } = await supabase.from('workflows').select('count').limit(1);
    if (workflowError && workflowError.message.includes('does not exist')) {
      console.log('Note: workflows table needs to be created in Supabase dashboard');
    } else {
      console.log('✅ workflows table exists');
    }

    // Create leases table
    console.log('Creating leases table...');
    const { error: leaseError } = await supabase.from('leases').select('count').limit(1);
    if (leaseError && leaseError.message.includes('does not exist')) {
      console.log('Note: leases table needs to be created in Supabase dashboard');
    } else {
      console.log('✅ leases table exists');
    }

    // Create tasks table
    console.log('Creating tasks table...');
    const { error: taskError } = await supabase.from('tasks').select('count').limit(1);
    if (taskError && taskError.message.includes('does not exist')) {
      console.log('Note: tasks table needs to be created in Supabase dashboard');
    } else {
      console.log('✅ tasks table exists');
    }

    // Create maintenance_requests table
    console.log('Creating maintenance_requests table...');
    const { error: maintenanceError } = await supabase.from('maintenance_requests').select('count').limit(1);
    if (maintenanceError && maintenanceError.message.includes('does not exist')) {
      console.log('Note: maintenance_requests table needs to be created in Supabase dashboard');
    } else {
      console.log('✅ maintenance_requests table exists');
    }

    console.log('\n✅ Database setup check completed');
    console.log('\nIf tables do not exist, run the SQL in setup.sql in your Supabase dashboard');
  } catch (error) {
    console.error('❌ Setup check failed:', error);
    process.exit(1);
  }
};

setupDatabase();
