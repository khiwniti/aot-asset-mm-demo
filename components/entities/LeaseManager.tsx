// Lease Manager Component - Manage leases with expiration tracking

import React, { useEffect, useState } from 'react';
import { Plus, AlertCircle, Loader, Calendar } from 'lucide-react';
import { useLeaseStore } from '../../stores/entityStores';
import { LeaseStatus, CreateLeaseRequest, Lease } from '../../types/entities';
import { formatDistanceToNow, isBefore } from 'date-fns';

interface LeaseManagerProps {
  onLeaseCreate?: (lease: Lease) => void;
  onLeaseUpdate?: (lease: Lease) => void;
  readOnly?: boolean;
}

const LEASE_STATUS_COLORS: Record<LeaseStatus, string> = {
  [LeaseStatus.DRAFT]: 'bg-gray-100 text-gray-700',
  [LeaseStatus.ACTIVE]: 'bg-green-100 text-green-700',
  [LeaseStatus.EXPIRING]: 'bg-yellow-100 text-yellow-700',
  [LeaseStatus.EXPIRED]: 'bg-red-100 text-red-700',
  [LeaseStatus.RENEWED]: 'bg-blue-100 text-blue-700',
};

export const LeaseManager: React.FC<LeaseManagerProps> = ({
  onLeaseCreate,
  onLeaseUpdate,
  readOnly = false
}) => {
  const {
    leases,
    syncStatus,
    selectedLeases,
    selectLease,
    deselectLease,
    clearSelection,
    changeLeaseStatus,
    fetchLeases,
    fetchExpiringLeases,
    createLease,
    deleteLease
  } = useLeaseStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [createFormData, setCreateFormData] = useState<CreateLeaseRequest>({
    propertyId: '',
    propertyName: '',
    tenantId: '',
    tenantName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentAmount: 0,
    securityDeposit: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (filter === 'expiring') {
      fetchExpiringLeases(60).catch(err => {
        setError('Failed to load expiring leases');
        console.error(err);
      });
    } else {
      fetchLeases().catch(err => {
        setError('Failed to load leases');
        console.error(err);
      });
    }
  }, [filter, fetchLeases, fetchExpiringLeases]);

  const filteredLeases = leases.filter(lease => {
    if (filter === 'all') return true;
    return lease.status === filter;
  });

  const handleCreateLease = async () => {
    if (!createFormData.propertyId || !createFormData.tenantName || !createFormData.rentAmount) {
      setError('Property, tenant, and rent amount are required');
      return;
    }

    setIsLoading(true);
    try {
      const lease = await createLease(createFormData);
      onLeaseCreate?.(lease);
      setShowCreateForm(false);
      setCreateFormData({
        propertyId: '',
        propertyName: '',
        tenantId: '',
        tenantName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rentAmount: 0,
        securityDeposit: 0,
      });
    } catch (err) {
      setError(`Failed to create lease: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getExpirationStatus = (lease: Lease) => {
    const endDate = new Date(lease.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (isBefore(endDate, new Date())) {
      return { status: 'expired', label: 'Expired', color: 'text-red-600' };
    }
    if (daysUntilExpiry <= 60) {
      return { status: 'expiring', label: `Expires in ${daysUntilExpiry}d`, color: 'text-yellow-600' };
    }
    return { status: 'active', label: formatDistanceToNow(endDate, { addSuffix: true }), color: 'text-green-600' };
  };

  const stats = {
    total: leases.length,
    active: leases.filter(l => l.status === LeaseStatus.ACTIVE).length,
    expiring: leases.filter(l => l.status === LeaseStatus.EXPIRING).length,
    expired: leases.filter(l => l.status === LeaseStatus.EXPIRED).length,
    totalRent: leases.reduce((sum, l) => sum + l.rentAmount, 0),
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lease Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track and manage all property leases</p>
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
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-gray-600">Expiring</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.expiring}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600">Expired</p>
          <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600">Total Rent/mo</p>
          <p className="text-lg font-bold text-purple-700">${(stats.totalRent / 1000).toFixed(0)}K</p>
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
          <h3 className="font-semibold mb-3 text-gray-800">Create New Lease</h3>
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
            <input
              type="text"
              placeholder="Tenant Name"
              value={createFormData.tenantName}
              onChange={(e) => setCreateFormData({ ...createFormData, tenantName: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              value={createFormData.startDate}
              onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              value={createFormData.endDate}
              onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Rent Amount"
              value={createFormData.rentAmount}
              onChange={(e) => setCreateFormData({ ...createFormData, rentAmount: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Security Deposit"
              value={createFormData.securityDeposit}
              onChange={(e) => setCreateFormData({ ...createFormData, securityDeposit: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded col-span-2"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateLease}
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {(['all', 'active', 'expiring', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 font-medium text-sm transition-colors capitalize
              ${filter === f
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Leases List */}
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {filteredLeases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={24} className="mx-auto mb-2 opacity-50" />
            <p>No leases found</p>
          </div>
        ) : (
          filteredLeases.map((lease) => {
            const expStatus = getExpirationStatus(lease);
            return (
              <div
                key={lease.id}
                className={`
                  p-4 border rounded-lg hover:shadow-md transition-shadow
                  ${selectedLeases.has(lease.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedLeases.has(lease.id)}
                        onChange={(e) => e.checked ? selectLease(lease.id) : deselectLease(lease.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{lease.propertyName}</h3>
                        <p className="text-sm text-gray-600">Tenant: {lease.tenantName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">${lease.rentAmount.toLocaleString()}/mo</p>
                    <p className={`text-xs font-medium ${expStatus.color}`}>
                      {expStatus.label}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 items-center">
                  <span className={`text-xs px-2 py-1 rounded ${LEASE_STATUS_COLORS[lease.status]}`}>
                    {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-600">
                    Ends: {new Date(lease.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selection Info */}
      {selectedLeases.size > 0 && !readOnly && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-blue-700 font-medium">{selectedLeases.size} lease(s) selected</p>
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
            New Lease
          </button>
        </div>
      )}
    </div>
  );
};
