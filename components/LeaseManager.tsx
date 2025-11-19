import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Plus
} from 'lucide-react';
import { useEntityStore } from '../stores/entityStore';
import { enhancedAgentService } from '../services/enhancedAgentService';
import { Lease } from '../types/entities';

interface LeaseManagerProps {
  onLeaseClick?: (lease: Lease) => void;
  className?: string;
}

const LeaseManager: React.FC<LeaseManagerProps> = ({ 
  onLeaseClick,
  className = '' 
}) => {
  const { 
    leases, 
    isLoading, 
    isSyncing, 
    syncStatus,
    loadLeases,
    updateLeaseStatus,
    getExpiringLeases
  } = useEntityStore();

  const [selectedLeases, setSelectedLeases] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [expiringLeases, setExpiringLeases] = useState<Lease[]>([]);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    expiring: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
    renewed: 'bg-blue-100 text-blue-800'
  };

  const statusIcons = {
    draft: <Clock className="w-4 h-4" />,
    active: <CheckCircle className="w-4 h-4" />,
    expiring: <AlertTriangle className="w-4 h-4" />,
    expired: <AlertTriangle className="w-4 h-4" />,
    renewed: <RefreshCw className="w-4 h-4" />
  };

  useEffect(() => {
    loadLeases();
    loadExpiringLeases();
  }, [loadLeases]);

  const loadExpiringLeases = async () => {
    const expiring = await getExpiringLeases(60);
    setExpiringLeases(expiring);
  };

  const handleStatusChange = async (leaseId: string, newStatus: string) => {
    try {
      await updateLeaseStatus(leaseId, newStatus);
    } catch (error) {
      console.error('Failed to update lease status:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    for (const leaseId of selectedLeases) {
      try {
        await updateLeaseStatus(leaseId, newStatus);
      } catch (error) {
        console.error(`Failed to update lease ${leaseId}:`, error);
      }
    }
    setSelectedLeases([]);
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredLeases = leases.filter(lease => {
    let matchesFilter = true;
    let matchesStatus = true;
    let matchesExpiring = true;

    if (filterText) {
      matchesFilter = 
        lease.propertyName.toLowerCase().includes(filterText.toLowerCase()) ||
        lease.tenantName.toLowerCase().includes(filterText.toLowerCase()) ||
        lease.rent.toString().includes(filterText);
    }

    if (statusFilter !== 'all') {
      matchesStatus = lease.status === statusFilter;
    }

    if (showExpiringOnly) {
      matchesExpiring = lease.status === 'expiring' || getDaysUntilExpiry(lease.endDate) <= 60;
    }

    return matchesFilter && matchesStatus && matchesExpiring;
  });

  const LeaseCard: React.FC<{ lease: Lease }> = ({ lease }) => {
    const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
    const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry <= 0;

    return (
      <Card 
        key={lease.id}
        className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${
          selectedLeases.includes(lease.id) ? 'ring-2 ring-blue-500' : ''
        } ${isExpiringSoon ? 'border-yellow-400' : ''} ${isExpired ? 'border-red-400' : ''}`}
        onClick={() => onLeaseClick?.(lease)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedLeases.includes(lease.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedLeases(prev => 
                    e.target.checked 
                      ? [...prev, lease.id]
                      : prev.filter(id => id !== lease.id)
                  );
                }}
                className="rounded border-gray-300"
              />
              <div>
                <h4 className="font-medium text-sm">{lease.propertyName}</h4>
                <p className="text-xs text-gray-600">{lease.tenantName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusColors[lease.status]}>
                {statusIcons[lease.status]}
                <span className="ml-1">{lease.status}</span>
              </Badge>
              {isExpiringSoon && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  {daysUntilExpiry} days
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">
                  Expired
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-gray-500">Period</p>
                <p className="font-medium">
                  {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-gray-500">Monthly Rent</p>
                <p className="font-medium">${lease.rent.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {lease.securityDeposit && (
            <div className="mt-2 text-xs">
              <span className="text-gray-500">Security Deposit: </span>
              <span className="font-medium">${lease.securityDeposit.toLocaleString()}</span>
            </div>
          )}
          
          {lease.renewalStatus && lease.renewalStatus !== 'none' && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Renewal: {lease.renewalStatus}
              </Badge>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>v{lease.version}</span>
            </div>
            <div className="flex space-x-1">
              {lease.status === 'expiring' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(lease.id, 'renewed');
                  }}
                >
                  Renew
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit or view details
                }}
              >
                Details
              </Button>
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
          <h2 className="text-2xl font-bold">Lease Management</h2>
          <p className="text-gray-600">Manage property leases and renewals</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Lease
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(expiringLeases.length > 0 || leases.filter(l => l.status === 'expired').length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {expiringLeases.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Leases Expiring Soon</h4>
                    <p className="text-sm text-yellow-600">
                      {expiringLeases.length} lease{expiringLeases.length !== 1 ? 's' : ''} expiring in the next 60 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {leases.filter(l => l.status === 'expired').length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-800">Expired Leases</h4>
                    <p className="text-sm text-red-600">
                      {leases.filter(l => l.status === 'expired').length} lease{leases.filter(l => l.status === 'expired').length !== 1 ? 's' : ''} need attention
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Input
              type="text"
              placeholder="Search leases..."
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="renewed">Renewed</option>
          </select>
          
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showExpiringOnly}
              onChange={(e) => setShowExpiringOnly(e.target.checked)}
              className="rounded"
            />
            <span>Expiring only (60 days)</span>
          </label>
        </div>
        
        {selectedLeases.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedLeases.length} selected
            </span>
            <select
              className="text-sm border rounded px-2 py-1"
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Change status...</option>
              <option value="active">Mark Active</option>
              <option value="expiring">Mark Expiring</option>
              <option value="expired">Mark Expired</option>
              <option value="renewed">Mark Renewed</option>
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

      {/* Lease List */}
      <div className="space-y-2">
        {filteredLeases.map(lease => (
          <LeaseCard key={lease.id} lease={lease} />
        ))}
        
        {filteredLeases.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leases found</h3>
            <p className="text-gray-500">
              {filterText || statusFilter !== 'all' || showExpiringOnly
                ? 'Try adjusting your filters'
                : 'Get started by creating your first lease'}
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading leases...</p>
        </div>
      )}
    </div>
  );
};

export default LeaseManager;
