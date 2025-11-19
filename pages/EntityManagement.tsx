// Entity Management Hub - Unified page for managing all domain entities

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { WorkflowStatusManager, LeaseManager, TaskBoard, MaintenanceTracker } from '../components/entities';
import { Workflow, Lease, Task, MaintenanceRequest } from '../types/entities';

const EntityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [statistics, setStatistics] = useState({
    workflowsCreated: 0,
    leasesManaged: 0,
    tasksCompleted: 0,
    maintenanceResolved: 0,
  });

  const handleWorkflowCreate = (workflow: Workflow) => {
    console.log('Workflow created:', workflow);
    setStatistics(prev => ({
      ...prev,
      workflowsCreated: prev.workflowsCreated + 1
    }));
  };

  const handleLeaseCreate = (lease: Lease) => {
    console.log('Lease created:', lease);
    setStatistics(prev => ({
      ...prev,
      leasesManaged: prev.leasesManaged + 1
    }));
  };

  const handleTaskCreate = (task: Task) => {
    console.log('Task created:', task);
  };

  const handleMaintenanceCreate = (request: MaintenanceRequest) => {
    console.log('Maintenance request created:', request);
    setStatistics(prev => ({
      ...prev,
      maintenanceResolved: prev.maintenanceResolved + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Entity Management Hub</h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage workflows, leases, tasks, and maintenance requests with real-time synchronization
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Workflows Created</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.workflowsCreated}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Leases Managed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{statistics.leasesManaged}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Tasks Completed</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.tasksCompleted}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Maintenance Resolved</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{statistics.maintenanceResolved}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 border-b border-gray-200 rounded-t-lg">
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="leases">Leases</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows">
              <WorkflowStatusManager
                onWorkflowCreate={handleWorkflowCreate}
              />
            </TabsContent>

            <TabsContent value="leases">
              <LeaseManager
                onLeaseCreate={handleLeaseCreate}
              />
            </TabsContent>

            <TabsContent value="tasks">
              <TaskBoard
                onTaskCreate={handleTaskCreate}
              />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceTracker
                onRequestCreate={handleMaintenanceCreate}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Using Entity Management</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✓ Drag entity cards between columns to update status instantly</li>
            <li>✓ Use the agent to create entities with natural language commands</li>
            <li>✓ Select multiple entities for bulk operations</li>
            <li>✓ Changes sync across all open browser tabs automatically</li>
            <li>✓ Click on entity details to view or edit properties</li>
            <li>✓ The system automatically retries failed operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EntityManagement;
