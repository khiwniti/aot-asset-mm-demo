import React, { useEffect } from 'react';
import WorkflowStatusManager from '../components/WorkflowStatusManager';
import LeaseManager from '../components/LeaseManager';
import TaskBoard from '../components/TaskBoard';
import MaintenanceTracker from '../components/MaintenanceTracker';
import { useEntityStore } from '../stores/entityStore';
import { Workflow, Lease, Task, MaintenanceRequest } from '../types/entities';

const EntityManagementDemo: React.FC = () => {
  const { 
    loadWorkflows, 
    loadLeases, 
    loadTasks, 
    loadMaintenanceRequests,
    workflows,
    leases,
    tasks,
    maintenanceRequests
  } = useEntityStore();

  useEffect(() => {
    // Load all entity data on component mount
    loadWorkflows();
    loadLeases();
    loadTasks();
    loadMaintenanceRequests();
  }, [loadWorkflows, loadLeases, loadTasks, loadMaintenanceRequests]);

  const handleWorkflowClick = (workflow: Workflow) => {
    console.log('Workflow clicked:', workflow);
    // Navigate to workflow details or open modal
  };

  const handleLeaseClick = (lease: Lease) => {
    console.log('Lease clicked:', lease);
    // Navigate to lease details or open modal
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    // Navigate to task details or open modal
  };

  const handleMaintenanceClick = (request: MaintenanceRequest) => {
    console.log('Maintenance request clicked:', request);
    // Navigate to maintenance details or open modal
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interactive Entity Management System
          </h1>
          <p className="text-lg text-gray-600">
            Professional backend with Supabase integration and Enhanced Agent Framework (ADK)
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Workflows</h3>
            <p className="text-2xl font-bold text-blue-600">{workflows.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Leases</h3>
            <p className="text-2xl font-bold text-green-600">{leases.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tasks</h3>
            <p className="text-2xl font-bold text-orange-600">{tasks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Maintenance Requests</h3>
            <p className="text-2xl font-bold text-red-600">{maintenanceRequests.length}</p>
          </div>
        </div>

        {/* Entity Management Components */}
        <div className="space-y-12">
          {/* Workflow Management */}
          <section>
            <WorkflowStatusManager 
              onWorkflowClick={handleWorkflowClick}
              className="bg-white rounded-lg p-6 shadow-sm"
            />
          </section>

          {/* Lease Management */}
          <section>
            <LeaseManager 
              onLeaseClick={handleLeaseClick}
              className="bg-white rounded-lg p-6 shadow-sm"
            />
          </section>

          {/* Task Board */}
          <section>
            <TaskBoard 
              onTaskClick={handleTaskClick}
              className="bg-white rounded-lg p-6 shadow-sm"
            />
          </section>

          {/* Maintenance Tracker */}
          <section>
            <MaintenanceTracker 
              onRequestClick={handleMaintenanceClick}
              className="bg-white rounded-lg p-6 shadow-sm"
            />
          </section>
        </div>

        {/* Agent Integration Demo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">🤖 Agent Integration</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Natural Language Commands</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>"Create workflow for Q1 budget review due March 31st, assign to Sarah"</li>
                <li>"Show me all leases expiring in next 60 days"</li>
                <li>"Create urgent maintenance request for broken HVAC at Terminal Building"</li>
                <li>"Mark all high priority tasks as completed"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>✅ Real-time synchronization across tabs</li>
                <li>✅ Optimistic updates with rollback</li>
                <li>✅ Conflict resolution for concurrent edits</li>
                <li>✅ Offline support with operation queuing</li>
                <li>✅ Complete audit trail for compliance</li>
                <li>✅ Drag-and-drop status transitions</li>
                <li>✅ Bulk operations with progress tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Backend Information */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Backend Configuration</h2>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Database</h3>
              <p className="text-gray-600">Supabase PostgreSQL with real-time subscriptions</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Agent Framework</h3>
              <p className="text-gray-600">Enhanced Agent Service with Gemini 1.5 Pro integration</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">API Server</h3>
              <p className="text-gray-600">Express.js with comprehensive REST endpoints</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityManagementDemo;
