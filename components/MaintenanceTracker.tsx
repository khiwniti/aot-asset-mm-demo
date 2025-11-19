import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  Wrench,
  Plus,
  Filter,
  AlertCircle,
  Tool,
  Truck
} from 'lucide-react';
import { useEntityStore } from '../stores/entityStore';
import { enhancedAgentService } from '../services/enhancedAgentService';
import { MaintenanceRequest } from '../types/entities';

interface MaintenanceTrackerProps {
  onRequestClick?: (request: MaintenanceRequest) => void;
  className?: string;
}

const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({ 
  onRequestClick,
  className = '' 
}) => {
  const { 
    maintenanceRequests, 
    isLoading, 
    isSyncing, 
    syncStatus,
    loadMaintenanceRequests,
    updateMaintenanceStatus
  } = useEntityStore();

  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [draggedRequest, setDraggedRequest] = useState<MaintenanceRequest | null>(null);

  const statusColumns = [
    { 
      id: 'submitted', 
      title: 'Submitted', 
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-gray-100 border-gray-200'
    },
    { 
      id: 'assigned', 
      title: 'Assigned', 
      icon: <User className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      icon: <Wrench className="w-4 h-4 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      color: 'bg-green-50 border-green-200'
    },
    { 
      id: 'cancelled', 
      title: 'Cancelled', 
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
      color: 'bg-red-50 border-red-200'
    }
  ];

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const categoryIcons = {
    'HVAC': <Tool className="w-4 h-4" />,
    'Plumbing': <Wrench className="w-4 h-4" />,
    'Electrical': <AlertTriangle className="w-4 h-4" />,
    'Structural': <Truck className="w-4 h-4" />,
    'Cosmetic': <Plus className="w-4 h-4" />,
    'Janitorial': <Plus className="w-4 h-4" />
  };

  useEffect(() => {
    loadMaintenanceRequests();
  }, [loadMaintenanceRequests]);

  const handleDragStart = (e: React.DragEvent, request: MaintenanceRequest) => {
    setDraggedRequest(request);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedRequest) return;
    
    // Validate status transition
    if (!enhancedAgentService.validateStatusTransition('maintenance_request', draggedRequest.status, newStatus)) {
      alert(`Cannot transition from ${draggedRequest.status} to ${newStatus}`);
      return;
    }

    try {
      await updateMaintenanceStatus(draggedRequest.id, newStatus);
    } catch (error) {
      console.error('Failed to update maintenance status:', error);
    }
    
    setDraggedRequest(null);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    for (const requestId of selectedRequests) {
      try {
        await updateMaintenanceStatus(requestId, newStatus);
      } catch (error) {
        console.error(`Failed to update request ${requestId}:`, error);
      }
    }
    setSelectedRequests([]);
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    let matchesFilter = true;
    let matchesStatus = true;
    let matchesPriority = true;

    if (filterText) {
      matchesFilter = 
        request.propertyName.toLowerCase().includes(filterText.toLowerCase()) ||
        request.description.toLowerCase().includes(filterText.toLowerCase()) ||
        request.category.toLowerCase().includes(filterText.toLowerCase());
    }

    if (statusFilter !== 'all') {
      matchesStatus = request.status === statusFilter;
    }

    if (priorityFilter !== 'all') {
      matchesPriority = request.priority === priorityFilter;
    }

    return matchesFilter && matchesStatus && matchesPriority;
  });

  const getRequestsByStatus = (status: string) => {
    return filteredRequests.filter(request => request.status === status);
  };

  const getCostOverrunPercentage = (estimate?: number, actual?: number) => {
    if (!estimate || !actual) return 0;
    return ((actual - estimate) / estimate) * 100;
  };

  const MaintenanceCard: React.FC<{ request: MaintenanceRequest }> = ({ request }) => {
    const costOverrun = getCostOverrunPercentage(request.costEstimate, request.actualCost);
    const isOverBudget = costOverrun > 20;

    return (
      <Card 
        key={request.id}
        draggable
        onDragStart={(e) => handleDragStart(e, request)}
        className={`mb-3 cursor-move hover:shadow-md transition-shadow ${
          selectedRequests.includes(request.id) ? 'ring-2 ring-blue-500' : ''
        } ${request.priority === 'urgent' ? 'border-red-400' : ''} ${isOverBudget ? 'border-orange-400' : ''}`}
        onClick={() => onRequestClick?.(request)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedRequests.includes(request.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedRequests(prev => 
                    e.target.checked 
                      ? [...prev, request.id]
                      : prev.filter(id => id !== request.id)
                  );
                }}
                className="rounded border-gray-300"
              />
              <div>
                <h4 className="font-medium text-sm">{request.propertyName}</h4>
                <p className="text-xs text-gray-600">{request.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={priorityColors[request.priority]}>
                {request.priority}
              </Badge>
              {categoryIcons[request.category as keyof typeof categoryIcons] || <Wrench className="w-4 h-4" />}
            </div>
          </div>
          
          <p className="text-xs text-gray-700 mb-3 line-clamp-2">
            {request.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-gray-500">Cost</p>
                <p className="font-medium">
                  ${request.actualCost || request.costEstimate || 0}
                  {request.costEstimate && request.actualCost && (
                    <span className={`ml-1 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      ({costOverrun > 0 ? '+' : ''}{costOverrun.toFixed(0)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
            {request.assignee && (
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 text-gray-400" />
                <div>
                  <p className="text-gray-500">Assigned to</p>
                  <p className="font-medium">{request.assignee}</p>
                </div>
              </div>
            )}
          </div>
          
          {request.scheduledDate && (
            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
              <Calendar className="w-3 h-3" />
              <span>Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {request.completionDate && (
            <div className="flex items-center space-x-2 text-xs text-green-600 mb-2">
              <CheckCircle className="w-3 h-3" />
              <span>Completed: {new Date(request.completionDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {isOverBudget && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
              <div className="flex items-center space-x-1 text-xs text-orange-800">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-medium">Cost Alert:</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Over budget by {costOverrun.toFixed(0)}%
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>v{request.version}</span>
            </div>
            <div className="flex space-x-1">
              {request.status === 'submitted' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMaintenanceStatus(request.id, 'assigned');
                  }}
                >
                  Assign
                </Button>
              )}
              {request.status === 'assigned' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMaintenanceStatus(request.id, 'in_progress');
                  }}
                >
                  Start
                </Button>
              )}
              {request.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMaintenanceStatus(request.id, 'completed');
                  }}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Tracker</h2>
          <p className="text-gray-600">Track and manage maintenance requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Urgent Requests Alert */}
      {filteredRequests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Urgent Maintenance Required</h4>
                <p className="text-sm text-red-600">
                  {filteredRequests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length} urgent request{filteredRequests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length !== 1 ? 's' : ''} need immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Input
              type="text"
              placeholder="Search requests..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-64"
            />
          </div>
          
          <select
            className="text-sm border rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            className="text-sm border rounded px-3 py-2"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        {selectedRequests.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedRequests.length} selected
            </span>
            <select
              className="text-sm border rounded px-2 py-1"
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Change status...</option>
              <option value="assigned">Assign</option>
              <option value="in_progress">Start Work</option>
              <option value="completed">Mark Complete</option>
              <option value="cancelled">Cancel</option>
            </select>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
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
                  {getRequestsByStatus(column.id).length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {getRequestsByStatus(column.id).map(request => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
            
            {getRequestsByStatus(column.id).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">
                  {column.id === 'submitted' ? '📝' :
                   column.id === 'assigned' ? '👤' :
                   column.id === 'in_progress' ? '🔧' :
                   column.id === 'completed' ? '✅' :
                   '❌'}
                </div>
                <p className="text-sm">No requests in {column.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading maintenance requests...</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTracker;
