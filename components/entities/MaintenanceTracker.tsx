// Maintenance Tracker Component - Track and manage maintenance requests

import React, { useEffect, useState } from 'react';
import { Plus, AlertCircle, Loader, Wrench, TrendingUp } from 'lucide-react';
import { useMaintenanceStore } from '../../stores/entityStores';
import { MaintenanceStatus, Priority, CreateMaintenanceRequest, MaintenanceRequest } from '../../types/entities';

interface MaintenanceTrackerProps {
  onRequestCreate?: (request: MaintenanceRequest) => void;
  onRequestUpdate?: (request: MaintenanceRequest) => void;
  readOnly?: boolean;
}

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.SUBMITTED]: 'bg-blue-100 text-blue-700',
  [MaintenanceStatus.ASSIGNED]: 'bg-yellow-100 text-yellow-700',
  [MaintenanceStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-700',
  [MaintenanceStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [MaintenanceStatus.CANCELLED]: 'bg-red-100 text-red-700',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'border-blue-300 bg-blue-50',
  [Priority.MEDIUM]: 'border-yellow-300 bg-yellow-50',
  [Priority.HIGH]: 'border-orange-300 bg-orange-50',
  [Priority.URGENT]: 'border-red-300 bg-red-50',
  [Priority.CRITICAL]: 'border-red-500 bg-red-100',
};

export const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({
  onRequestCreate,
  onRequestUpdate,
  readOnly = false
}) => {
  const {
    requests,
    syncStatus,
    selectedRequests,
    selectRequest,
    deselectRequest,
    clearSelection,
    fetchRequests,
    createRequest,
    changeRequestStatus,
  } = useMaintenanceStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'cost'>('priority');
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | 'all'>('all');
  const [createFormData, setCreateFormData] = useState<CreateMaintenanceRequest>({
    propertyId: '',
    propertyName: '',
    description: '',
    priority: Priority.MEDIUM,
    costEstimate: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRequests().catch(err => {
      setError('Failed to load maintenance requests');
      console.error(err);
    });
  }, [fetchRequests]);

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = {
        [Priority.CRITICAL]: 0,
        [Priority.URGENT]: 1,
        [Priority.HIGH]: 2,
        [Priority.MEDIUM]: 3,
        [Priority.LOW]: 4,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === 'date') {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    if (sortBy === 'cost') {
      return (b.actualCost || b.costEstimate) - (a.actualCost || a.costEstimate);
    }
    return 0;
  });

  const handleCreateRequest = async () => {
    if (!createFormData.propertyId || !createFormData.description) {
      setError('Property and description are required');
      return;
    }

    setIsLoading(true);
    try {
      const request = await createRequest(createFormData);
      onRequestCreate?.(request);
      setShowCreateForm(false);
      setCreateFormData({
        propertyId: '',
        propertyName: '',
        description: '',
        priority: Priority.MEDIUM,
        costEstimate: 0,
        scheduledDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(`Failed to create request: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: requests.length,
    urgent: requests.filter(r => r.priority === Priority.URGENT || r.priority === Priority.CRITICAL).length,
    costOverrun: requests.filter(r => r.actualCost && r.actualCost > r.costEstimate * 1.2).length,
    totalCost: requests.reduce((sum, r) => sum + (r.actualCost || r.costEstimate), 0),
    completed: requests.filter(r => r.status === MaintenanceStatus.COMPLETED).length,
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Maintenance Tracker</h2>
          <p className="text-sm text-gray-600 mt-1">Track and manage maintenance requests</p>
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
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600">Urgent</p>
          <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-gray-600">Cost Overrun</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.costOverrun}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600">Total Cost</p>
          <p className="text-lg font-bold text-purple-700">${(stats.totalCost / 1000).toFixed(0)}K</p>
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
          <h3 className="font-semibold mb-3 text-gray-800">Create New Maintenance Request</h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Property ID"
              value={createFormData.propertyId}
              onChange={(e) => setCreateFormData({ ...createFormData, propertyId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Property Name"
              value={createFormData.propertyName}
              onChange={(e) => setCreateFormData({ ...createFormData, propertyName: e.target.value })}
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
              <option value={Priority.URGENT}>Urgent</option>
              <option value={Priority.CRITICAL}>Critical</option>
            </select>
            <input
              type="date"
              value={createFormData.scheduledDate}
              onChange={(e) => setCreateFormData({ ...createFormData, scheduledDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Cost Estimate"
              value={createFormData.costEstimate}
              onChange={(e) => setCreateFormData({ ...createFormData, costEstimate: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <textarea
              placeholder="Description"
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded col-span-2 h-20"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateRequest}
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

      {/* Controls */}
      <div className="flex gap-4 mb-6 items-center">
        <div>
          <label className="text-sm text-gray-600 mr-2">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="priority">Priority</option>
            <option value="date">Scheduled Date</option>
            <option value="cost">Cost</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mr-2">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All</option>
            <option value={MaintenanceStatus.SUBMITTED}>Submitted</option>
            <option value={MaintenanceStatus.ASSIGNED}>Assigned</option>
            <option value={MaintenanceStatus.IN_PROGRESS}>In Progress</option>
            <option value={MaintenanceStatus.COMPLETED}>Completed</option>
            <option value={MaintenanceStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-y-auto max-h-96 border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedRequests.size === sortedRequests.length && sortedRequests.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      sortedRequests.forEach(r => selectRequest(r.id));
                    } else {
                      clearSelection();
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Property</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Priority</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Cost</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <Wrench size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No maintenance requests found</p>
                </td>
              </tr>
            ) : (
              sortedRequests.map((request) => {
                const costOverrun = request.actualCost && request.actualCost > request.costEstimate * 1.2;
                return (
                  <tr
                    key={request.id}
                    className={`
                      border-b border-gray-200 hover:bg-gray-50 transition-colors
                      ${selectedRequests.has(request.id) ? 'bg-blue-50' : ''}
                      ${PRIORITY_COLORS[request.priority]}
                    `}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.has(request.id)}
                        onChange={(e) => e.checked ? selectRequest(request.id) : deselectRequest(request.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{request.propertyName}</td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-xs">{request.description}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.priority === Priority.CRITICAL ? 'bg-red-600 text-white' :
                        request.priority === Priority.URGENT ? 'bg-red-500 text-white' :
                        request.priority === Priority.HIGH ? 'bg-orange-500 text-white' :
                        request.priority === Priority.MEDIUM ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 font-medium">
                        ${(request.actualCost || request.costEstimate).toLocaleString()}
                        {costOverrun && (
                          <div className="text-red-600 text-xs flex items-center gap-1 mt-1">
                            <TrendingUp size={12} />
                            Overrun
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(request.scheduledDate).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selection Info */}
      {selectedRequests.size > 0 && !readOnly && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-blue-700 font-medium">{selectedRequests.size} request(s) selected</p>
          <button
            onClick={clearSelection}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            New Request
          </button>
        </div>
      )}
    </div>
  );
};
