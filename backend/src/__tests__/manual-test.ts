/**
 * Manual API Test Script
 * Run this to test all backend endpoints without Jest
 * Usage: npm run test:manual
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, status: 'PASS', duration });
    console.log(`✅ PASS: ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, status: 'FAIL', message: error.message, duration });
    console.error(`❌ FAIL: ${name} (${duration}ms)\n   ${error.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

async function testHealthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);
  const data = await response.json();
  
  assertEqual(response.status, 200, 'Health check should return 200');
  assertEqual(data.status, 'ok', 'Health check status should be ok');
  assert(data.timestamp, 'Health check should have timestamp');
}

// Store test entity IDs
let workflowId: string;
let leaseId: string;
let taskId: string;
let maintenanceId: string;

async function testCreateWorkflow() {
  const workflow = {
    name: 'QA Test Workflow',
    description: 'Automated test workflow',
    status: 'draft',
    assignedTo: 'qa-tester@aot.com'
  };

  const response = await fetch(`${API_BASE_URL}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  const data = await response.json();

  assertEqual(response.status, 201, 'Create workflow should return 201');
  assertEqual(data.success, true, 'Response should indicate success');
  assertEqual(data.data.name, workflow.name, 'Workflow name should match');
  assert(data.data.id, 'Workflow should have an ID');
  
  workflowId = data.data.id;
}

async function testGetAllWorkflows() {
  const response = await fetch(`${API_BASE_URL}/workflows`);
  const data = await response.json();

  assertEqual(response.status, 200, 'Get all workflows should return 200');
  assert(Array.isArray(data.data), 'Data should be an array');
  assert(data.data.length > 0, 'Should have at least one workflow');
}

async function testGetOneWorkflow() {
  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`);
  const data = await response.json();

  assertEqual(response.status, 200, 'Get workflow should return 200');
  assertEqual(data.data.id, workflowId, 'Workflow ID should match');
}

async function testUpdateWorkflow() {
  const updates = {
    status: 'active',
    description: 'Updated by QA test'
  };

  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await response.json();

  assertEqual(response.status, 200, 'Update workflow should return 200');
  assertEqual(data.data.status, 'active', 'Status should be updated');
}

async function testGetWorkflowAudit() {
  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/audit`);
  const data = await response.json();

  assertEqual(response.status, 200, 'Get audit trail should return 200');
  assert(Array.isArray(data.data), 'Audit trail should be an array');
}

async function testDeleteWorkflow() {
  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
    method: 'DELETE'
  });
  const data = await response.json();

  assertEqual(response.status, 200, 'Delete workflow should return 200');
  assertEqual(data.success, true, 'Delete should be successful');
}

async function testCreateLease() {
  const lease = {
    tenantName: 'QA Test Tenant',
    propertyId: 'prop-qa-001',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 30000,
    status: 'draft'
  };

  const response = await fetch(`${API_BASE_URL}/leases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lease)
  });
  const data = await response.json();

  assertEqual(response.status, 201, 'Create lease should return 201');
  assertEqual(data.data.tenantName, lease.tenantName, 'Tenant name should match');
  
  leaseId = data.data.id;
}

async function testCreateTask() {
  const task = {
    title: 'QA Test Task',
    description: 'Automated test task',
    status: 'todo',
    priority: 'high',
    assignedTo: 'qa-tester@aot.com',
    dueDate: '2024-12-31'
  };

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  const data = await response.json();

  assertEqual(response.status, 201, 'Create task should return 201');
  assertEqual(data.data.title, task.title, 'Task title should match');
  
  taskId = data.data.id;
}

async function testCreateMaintenance() {
  const maintenance = {
    propertyId: 'prop-qa-001',
    title: 'QA Test Maintenance',
    description: 'Automated test maintenance request',
    priority: 'medium',
    status: 'submitted'
  };

  const response = await fetch(`${API_BASE_URL}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(maintenance)
  });
  const data = await response.json();

  assertEqual(response.status, 201, 'Create maintenance should return 201');
  assertEqual(data.data.title, maintenance.title, 'Maintenance title should match');
  
  maintenanceId = data.data.id;
}

async function test404NotFound() {
  const response = await fetch(`${API_BASE_URL}/workflows/non-existent-id-12345`);
  const data = await response.json();

  assertEqual(response.status, 404, 'Should return 404 for non-existent workflow');
  assertEqual(data.success, false, 'Success should be false');
}

async function testInvalidEndpoint() {
  const response = await fetch(`${API_BASE_URL}/invalid-endpoint`);
  assertEqual(response.status, 404, 'Invalid endpoint should return 404');
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  AOT Backend API - Manual Test Suite          ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`Testing API at: ${API_BASE_URL}\n`);

  const startTime = Date.now();

  // Health Check
  console.log('🏥 Health Check Tests');
  await runTest('Health check endpoint', testHealthCheck);

  // Workflows
  console.log('\n📋 Workflow Tests');
  await runTest('Create workflow', testCreateWorkflow);
  await runTest('Get all workflows', testGetAllWorkflows);
  await runTest('Get one workflow', testGetOneWorkflow);
  await runTest('Update workflow', testUpdateWorkflow);
  await runTest('Get workflow audit trail', testGetWorkflowAudit);
  await runTest('Delete workflow', testDeleteWorkflow);

  // Leases
  console.log('\n📄 Lease Tests');
  await runTest('Create lease', testCreateLease);

  // Tasks
  console.log('\n✅ Task Tests');
  await runTest('Create task', testCreateTask);

  // Maintenance
  console.log('\n🔧 Maintenance Tests');
  await runTest('Create maintenance request', testCreateMaintenance);

  // Error Handling
  console.log('\n⚠️  Error Handling Tests');
  await runTest('404 Not Found', test404NotFound);
  await runTest('Invalid endpoint', testInvalidEndpoint);

  // Summary
  const totalTime = Date.now() - startTime;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(2)}%`);
  console.log('═'.repeat(50) + '\n');

  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.name}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('💥 Test suite failed with error:', error);
  process.exit(1);
});
