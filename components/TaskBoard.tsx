import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  Plus,
  Filter,
  Link,
  Timer,
  Play,
  Square
} from 'lucide-react';
import { useEntityStore } from '../stores/entityStore';
import { enhancedAgentService } from '../services/enhancedAgentService';
import { Task } from '../types/entities';

interface TaskBoardProps {
  onTaskClick?: (task: Task) => void;
  workflowId?: string;
  className?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ 
  onTaskClick,
  workflowId,
  className = '' 
}) => {
  const { 
    tasks, 
    isLoading, 
    isSyncing, 
    syncStatus,
    loadTasks,
    updateTaskStatus,
    getTasksByWorkflow
  } = useEntityStore();

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const displayTasks = workflowId ? getTasksByWorkflow(workflowId) : tasks;

  const statusColumns = [
    { 
      id: 'todo', 
      title: 'To Do', 
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-gray-100 border-gray-200'
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      icon: <Play className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'blocked', 
      title: 'Blocked', 
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      color: 'bg-red-50 border-red-200'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      color: 'bg-green-50 border-green-200'
    }
  ];

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    // Validate status transition
    if (!enhancedAgentService.validateStatusTransition('task', draggedTask.status, newStatus)) {
      alert(`Cannot transition from ${draggedTask.status} to ${newStatus}`);
      return;
    }

    // Special validation for blocked tasks
    if (draggedTask.status === 'blocked' && newStatus === 'completed') {
      alert('Cannot complete a blocked task. Unblock it first.');
      return;
    }

    try {
      await updateTaskStatus(draggedTask.id, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
    
    setDraggedTask(null);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    for (const taskId of selectedTasks) {
      try {
        await updateTaskStatus(taskId, newStatus);
      } catch (error) {
        console.error(`Failed to update task ${taskId}:`, error);
      }
    }
    setSelectedTasks([]);
  };

  const filteredTasks = displayTasks.filter(task => 
    task.title.toLowerCase().includes(filterText.toLowerCase()) ||
    task.description?.toLowerCase().includes(filterText.toLowerCase()) ||
    task.assignee.toLowerCase().includes(filterText.toLowerCase())
  );

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card 
      key={task.id}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      className={`mb-3 cursor-move hover:shadow-md transition-shadow ${
        selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''
      } ${task.status === 'blocked' ? 'border-red-200' : ''}`}
      onClick={() => onTaskClick?.(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedTasks(prev => 
                  e.target.checked 
                    ? [...prev, task.id]
                    : prev.filter(id => id !== task.id)
                );
              }}
              className="rounded border-gray-300"
            />
            <h4 className="font-medium text-sm">{task.title}</h4>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            {task.status === 'blocked' && (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        {task.blockerReason && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
            <div className="flex items-center space-x-1 text-xs text-red-800">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-medium">Blocked:</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{task.blockerReason}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>v{task.version}</span>
          </div>
        </div>
        
        {(task.estimatedHours || task.actualHours) && (
          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
            {task.estimatedHours && (
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3" />
                <span>Est: {task.estimatedHours}h</span>
              </div>
            )}
            {task.actualHours && (
              <div className="flex items-center space-x-1">
                <Square className="w-3 h-3" />
                <span>Actual: {task.actualHours}h</span>
              </div>
            )}
          </div>
        )}
        
        {task.parentWorkflowId && (
          <div className="flex items-center space-x-1 text-xs text-blue-600">
            <Link className="w-3 h-3" />
            <span>Part of workflow</span>
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
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
          <h2 className="text-2xl font-bold">
            {workflowId ? 'Workflow Tasks' : 'Task Board'}
          </h2>
          <p className="text-gray-600">
            {workflowId 
              ? 'Manage tasks for this workflow' 
              : 'Drag and drop tasks to change status'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <div className="flex items-center space-x-1">
            <Filter className="w-4 h-4" />
            <Input
              type="text"
              placeholder="Filter tasks..."
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
        {selectedTasks.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedTasks.length} selected
            </span>
            <select
              className="text-sm border rounded px-2 py-1"
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Change status...</option>
              <option value="todo">Move to To Do</option>
              <option value="in_progress">Move to In Progress</option>
              <option value="blocked">Move to Blocked</option>
              <option value="completed">Move to Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Status Columns */}
      <div className="grid grid-cols-4 gap-4">
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
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {getTasksByStatus(column.id).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            
            {getTasksByStatus(column.id).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">
                  {column.id === 'todo' ? '📝' :
                   column.id === 'in_progress' ? '⚡' :
                   column.id === 'blocked' ? '🚫' :
                   '✅'}
                </div>
                <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading tasks...</p>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
