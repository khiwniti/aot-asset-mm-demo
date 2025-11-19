import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Pause, 
  Archive,
  Plus,
  Filter
} from 'lucide-react';
import { useEntityStore } from '../stores/entityStore';
import { enhancedAgentService } from '../services/enhancedAgentService';
import { Workflow } from '../types/entities';

interface WorkflowStatusManagerProps {
  onWorkflowClick?: (workflow: Workflow) => void;
  className?: string;
}

const WorkflowStatusManager: React.FC<WorkflowStatusManagerProps> = ({ 
  onWorkflowClick,
  className = '' 
}) => {
  const { 
    workflows, 
    isLoading, 
    isSyncing, 
    syncStatus,
    loadWorkflows,
    updateWorkflowStatus 
  } = useEntityStore();

  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [draggedWorkflow, setDraggedWorkflow] = useState<Workflow | null>(null);

  const statusColumns = [
    { 
      id: 'draft', 
      title: 'Draft', 
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-gray-100 border-gray-200'
    },
    { 
      id: 'active', 
      title: 'Active', 
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      color: 'bg-green-50 border-green-200'
    },
    { 
      id: 'paused', 
      title: 'Paused', 
      icon: <Pause className="w-4 h-4 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: <CheckCircle className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'archived', 
      title: 'Archived', 
      icon: <Archive className="w-4 h-4 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200'
    }
  ];

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleDragStart = (e: React.DragEvent, workflow: Workflow) => {
    setDraggedWorkflow(workflow);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedWorkflow) return;
    
    // Validate status transition
    if (!enhancedAgentService.validateStatusTransition('workflow', draggedWorkflow.status, newStatus)) {
      alert(`Cannot transition from ${draggedWorkflow.status} to ${newStatus}`);
      return;
    }

    try {
      await updateWorkflowStatus(draggedWorkflow.id, newStatus);
    } catch (error) {
      console.error('Failed to update workflow status:', error);
    }
    
    setDraggedWorkflow(null);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    for (const workflowId of selectedWorkflows) {
      try {
        await updateWorkflowStatus(workflowId, newStatus);
      } catch (error) {
        console.error(`Failed to update workflow ${workflowId}:`, error);
      }
    }
    setSelectedWorkflows([]);
  };

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.title.toLowerCase().includes(filterText.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(filterText.toLowerCase()) ||
    workflow.assignee.toLowerCase().includes(filterText.toLowerCase())
  );

  const getWorkflowsByStatus = (status: string) => {
    return filteredWorkflows.filter(workflow => workflow.status === status);
  };

  const WorkflowCard: React.FC<{ workflow: Workflow }> = ({ workflow }) => (
    <Card 
      key={workflow.id}
      draggable
      onDragStart={(e) => handleDragStart(e, workflow)}
      className={`mb-3 cursor-move hover:shadow-md transition-shadow ${
        selectedWorkflows.includes(workflow.id) ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onWorkflowClick?.(workflow)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedWorkflows.includes(workflow.id)}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedWorkflows(prev => 
                  e.target.checked 
                    ? [...prev, workflow.id]
                    : prev.filter(id => id !== workflow.id)
                );
              }}
              className="rounded border-gray-300"
            />
            <h4 className="font-medium text-sm">{workflow.title}</h4>
          </div>
          <Badge className={priorityColors[workflow.priority]}>
            {workflow.priority}
          </Badge>
        </div>
        
        {workflow.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {workflow.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{workflow.assignee}</span>
            </div>
            {workflow.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(workflow.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>v{workflow.version}</span>
          </div>
        </div>
        
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {workflow.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Management</h2>
          <p className="text-gray-600">Drag and drop workflows to change status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
          <div className="flex items-center space-x-1">
            <Filter className="w-4 h-4" />
            <Input
              type="text"
              placeholder="Filter workflows..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'synced' ? 'bg-green-500' :
            syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {syncStatus === 'synced' ? 'All changes synced' :
             syncStatus === 'syncing' ? 'Syncing changes...' :
             'Sync failed - retrying...'}
          </span>
        </div>
        {selectedWorkflows.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedWorkflows.length} selected
            </span>
            <select
              className="text-sm border rounded px-2 py-1"
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Change status...</option>
              <option value="active">Move to Active</option>
              <option value="paused">Move to Paused</option>
              <option value="completed">Move to Completed</option>
              <option value="archived">Move to Archived</option>
            </select>
          </div>
        )}
      </div>

      {/* Status Columns */}
      <div className="grid grid-cols-5 gap-4">
        {statusColumns.map(column => (
          <div
            key={column.id}
            className={`${column.color} border rounded-lg p-4 min-h-[400px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {column.icon}
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">
                  {getWorkflowsByStatus(column.id).length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {getWorkflowsByStatus(column.id).map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
            
            {getWorkflowsByStatus(column.id).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">No workflows in {column.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading workflows...</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatusManager;
