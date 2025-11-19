// Workflow Status Manager - Kanban-style workflow board with drag-and-drop

import React, { useEffect, useState } from 'react';
import { Plus, AlertCircle, Loader } from 'lucide-react';
import { useWorkflowStore } from '../../stores/entityStores';
import { WorkflowStatus, Priority, CreateWorkflowRequest } from '../../types/entities';
import { EntityCard } from './EntityCard';

const WORKFLOW_STATUSES = [
  WorkflowStatus.DRAFT,
  WorkflowStatus.ACTIVE,
  WorkflowStatus.PAUSED,
  WorkflowStatus.COMPLETED,
  WorkflowStatus.ARCHIVED
];

const STATUS_COLORS: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: 'bg-gray-50 border-gray-300',
  [WorkflowStatus.ACTIVE]: 'bg-blue-50 border-blue-300',
  [WorkflowStatus.PAUSED]: 'bg-yellow-50 border-yellow-300',
  [WorkflowStatus.COMPLETED]: 'bg-green-50 border-green-300',
  [WorkflowStatus.ARCHIVED]: 'bg-slate-50 border-slate-300',
};

const STATUS_LABELS: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: 'Draft',
  [WorkflowStatus.ACTIVE]: 'Active',
  [WorkflowStatus.PAUSED]: 'Paused',
  [WorkflowStatus.COMPLETED]: 'Completed',
  [WorkflowStatus.ARCHIVED]: 'Archived',
};

interface WorkflowManagerProps {
  onWorkflowCreate?: (workflow: any) => void;
  onWorkflowUpdate?: (workflow: any) => void;
  readOnly?: boolean;
}

export const WorkflowStatusManager: React.FC<WorkflowManagerProps> = ({
  onWorkflowCreate,
  onWorkflowUpdate,
  readOnly = false
}) => {
  const {
    workflows,
    syncStatus,
    selectWorkflow,
    clearSelection,
    selectedWorkflows,
    changeWorkflowStatus,
    fetchWorkflows,
    createWorkflow
  } = useWorkflowStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateWorkflowRequest>({
    title: '',
    description: '',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: Priority.MEDIUM,
  });
  const [draggedItem, setDraggedItem] = useState<{ id: string; from: WorkflowStatus } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkflows().catch(err => {
      setError('Failed to load workflows');
      console.error(err);
    });
  }, [fetchWorkflows]);

  const handleDragStart = (workflowId: string, fromStatus: WorkflowStatus) => {
    setDraggedItem({ id: workflowId, from: fromStatus });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-opacity-75');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-opacity-75');
  };

  const handleDrop = async (e: React.DragEvent, toStatus: WorkflowStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-75');

    if (!draggedItem || readOnly) return;

    try {
      await changeWorkflowStatus(draggedItem.id, toStatus);
      onWorkflowUpdate?.({ id: draggedItem.id, status: toStatus });
    } catch (err) {
      setError(`Failed to update workflow status: ${err}`);
    } finally {
      setDraggedItem(null);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!createFormData.title || !createFormData.assignee) {
      setError('Title and assignee are required');
      return;
    }

    setIsLoading(true);
    try {
      const workflow = await createWorkflow(createFormData);
      onWorkflowCreate?.(workflow);
      setShowCreateForm(false);
      setCreateFormData({
        title: '',
        description: '',
        assignee: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: Priority.MEDIUM,
      });
    } catch (err) {
      setError(`Failed to create workflow: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Workflow Management</h2>
          <p className="text-sm text-gray-600 mt-1">Drag workflows between columns to update status</p>
        </div>
        <div className="flex gap-2 items-center">
          {syncStatus === 'syncing' && <Loader size={16} className="animate-spin text-blue-600" />}
          {syncStatus === 'failed' && <AlertCircle size={16} className="text-red-600" />}
          <span className="text-xs text-gray-500 capitalize">{syncStatus}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && !readOnly && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800">Create New Workflow</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={createFormData.title}
              onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Assignee"
              value={createFormData.assignee}
              onChange={(e) => setCreateFormData({ ...createFormData, assignee: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              value={createFormData.dueDate}
              onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <select
              value={createFormData.priority}
              onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value as Priority })}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value={Priority.LOW}>Low</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.HIGH}>High</option>
              <option value={Priority.CRITICAL}>Critical</option>
            </select>
            <textarea
              placeholder="Description"
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded col-span-2 h-20"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateWorkflow}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {WORKFLOW_STATUSES.map((status) => {
          const statusWorkflows = workflows.filter(w => w.status === status);

          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`
                rounded-lg p-4 min-h-96 transition-colors
                ${STATUS_COLORS[status]}
              `}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">{STATUS_LABELS[status]}</h3>
                <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                  {statusWorkflows.length}
                </span>
              </div>

              {/* Workflow Cards */}
              <div className="space-y-3">
                {statusWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    draggable={!readOnly}
                    onDragStart={() => handleDragStart(workflow.id, status)}
                    className={readOnly ? '' : 'cursor-grab active:cursor-grabbing'}
                  >
                    <EntityCard
                      id={workflow.id}
                      title={workflow.title}
                      subtitle={workflow.description}
                      priority={workflow.priority as Priority}
                      assignee={workflow.assignee}
                      dueDate={workflow.dueDate}
                      isSelected={selectedWorkflows.has(workflow.id)}
                      isDragging={draggedItem?.id === workflow.id}
                      onSelect={readOnly ? undefined : selectWorkflow}
                      onEdit={readOnly ? undefined : (id) => console.log('Edit workflow', id)}
                      onDelete={readOnly ? undefined : (id) => console.log('Delete workflow', id)}
                    />
                  </div>
                ))}
              </div>

              {/* Add Card Placeholder */}
              {status === WorkflowStatus.DRAFT && !readOnly && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:bg-white/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>New</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Info */}
      {selectedWorkflows.size > 0 && !readOnly && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-blue-700 font-medium">{selectedWorkflows.size} workflow(s) selected</p>
          <button
            onClick={clearSelection}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};
