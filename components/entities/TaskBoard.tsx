// Task Board Component - Kanban-style task management

import React, { useEffect, useState } from 'react';
import { Plus, AlertCircle, Loader, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../../stores/entityStores';
import { TaskStatus, Priority, CreateTaskRequest } from '../../types/entities';
import { EntityCard } from './EntityCard';

const TASK_STATUSES = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.BLOCKED,
  TaskStatus.COMPLETED
];

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-50 border-gray-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-50 border-blue-300',
  [TaskStatus.BLOCKED]: 'bg-red-50 border-red-300',
  [TaskStatus.COMPLETED]: 'bg-green-50 border-green-300',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.BLOCKED]: 'Blocked',
  [TaskStatus.COMPLETED]: 'Completed',
};

interface TaskBoardProps {
  onTaskCreate?: (task: any) => void;
  onTaskUpdate?: (task: any) => void;
  readOnly?: boolean;
  workflowId?: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  onTaskCreate,
  onTaskUpdate,
  readOnly = false,
  workflowId
}) => {
  const {
    tasks,
    syncStatus,
    selectTask,
    clearSelection,
    selectedTasks,
    changeTaskStatus,
    fetchTasks,
    createTask,
  } = useTaskStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: Priority.MEDIUM,
    workflowId,
  });
  const [draggedItem, setDraggedItem] = useState<{ id: string; from: TaskStatus } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTasks().catch(err => {
      setError('Failed to load tasks');
      console.error(err);
    });
  }, [fetchTasks]);

  const displayTasks = workflowId
    ? tasks.filter(t => t.workflowId === workflowId)
    : tasks;

  const handleDragStart = (taskId: string, fromStatus: TaskStatus) => {
    setDraggedItem({ id: taskId, from: fromStatus });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-opacity-75');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-opacity-75');
  };

  const handleDrop = async (e: React.DragEvent, toStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-75');

    if (!draggedItem || readOnly) return;

    try {
      await changeTaskStatus(draggedItem.id, toStatus);
      onTaskUpdate?.({ id: draggedItem.id, status: toStatus });
    } catch (err) {
      setError(`Failed to update task status: ${err}`);
    } finally {
      setDraggedItem(null);
    }
  };

  const handleCreateTask = async () => {
    if (!createFormData.title || !createFormData.assignee) {
      setError('Title and assignee are required');
      return;
    }

    setIsLoading(true);
    try {
      const task = await createTask(createFormData);
      onTaskCreate?.(task);
      setShowCreateForm(false);
      setCreateFormData({
        title: '',
        description: '',
        assignee: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: Priority.MEDIUM,
        workflowId,
      });
    } catch (err) {
      setError(`Failed to create task: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: displayTasks.length,
    todo: displayTasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: displayTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    blocked: displayTasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    completed: displayTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
          <p className="text-sm text-gray-600 mt-1">Manage tasks and track progress</p>
        </div>
        <div className="flex gap-2 items-center">
          {syncStatus === 'syncing' && <Loader size={16} className="animate-spin text-blue-600" />}
          {syncStatus === 'failed' && <AlertCircle size={16} className="text-red-600" />}
          <span className="text-xs text-gray-500 capitalize">{syncStatus}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">To Do</p>
          <p className="text-2xl font-bold text-gray-700">{stats.todo}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600">Blocked</p>
          <p className="text-2xl font-bold text-red-700">{stats.blocked}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
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
          <h3 className="font-semibold mb-3 text-gray-800">Create New Task</h3>
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
              onClick={handleCreateTask}
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
      <div className="grid grid-cols-4 gap-4">
        {TASK_STATUSES.map((status) => {
          const statusTasks = displayTasks.filter(t => t.status === status);

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
                  {statusTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={!readOnly}
                    onDragStart={() => handleDragStart(task.id, status)}
                    className={readOnly ? '' : 'cursor-grab active:cursor-grabbing'}
                  >
                    <EntityCard
                      id={task.id}
                      title={task.title}
                      subtitle={task.description}
                      priority={task.priority as Priority}
                      assignee={task.assignee}
                      dueDate={task.dueDate}
                      isSelected={selectedTasks.has(task.id)}
                      isDragging={draggedItem?.id === task.id}
                      onSelect={readOnly ? undefined : selectTask}
                      onEdit={readOnly ? undefined : (id) => console.log('Edit task', id)}
                      onDelete={readOnly ? undefined : (id) => console.log('Delete task', id)}
                    >
                      {task.blockerReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <strong>Blocker:</strong> {task.blockerReason}
                        </div>
                      )}
                      {task.estimatedHours > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Est: {task.estimatedHours}h {task.actualHours > 0 && `| Actual: ${task.actualHours}h`}
                        </p>
                      )}
                    </EntityCard>
                  </div>
                ))}
              </div>

              {/* Add Card Placeholder */}
              {status === TaskStatus.TODO && !readOnly && (
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
      {selectedTasks.size > 0 && !readOnly && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-blue-700 font-medium">{selectedTasks.size} task(s) selected</p>
          <button
            onClick={clearSelection}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Completion Rate */}
      {stats.total > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Task Completion</span>
            <span className="text-sm font-bold text-green-700">
              {Math.round((stats.completed / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
