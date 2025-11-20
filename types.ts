
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'Commercial' | 'Residential' | 'Industrial' | 'Office';
  status: 'Active' | 'Pending' | 'Maintenance';
  value: number;
  occupancyRate: number;
  monthlyRent: number;
  image: string;
  tenantCount: number;
  lastRenovated: string;
}

export interface KPI {
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
  isPositive: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  date: string;
}

export type UIComponentType = 'chart' | 'approval' | 'alert_list' | 'property_card' | 'map' | 'kanban' | 'navigate' | 'report';

export interface ReportData {
  id: string;
  title: string;
  type: 'Financial' | 'Operational' | 'Market' | 'Compliance';
  period: string;
  summary: string;
  keyMetrics: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }[];
  generatedAt: string;
}

export interface UIPayload {
  type: UIComponentType;
  data: any; 
  status?: 'pending' | 'approved' | 'rejected'; 
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  uiPayload?: UIPayload;
}

export interface ActiveVisual {
  type: 'default' | 'chart' | 'map' | 'kanban';
  title: string;
  data: any;
}

export interface VisualContext {
  type: 'chart' | 'map';
  title: string;
  data: any;
  chartType?: 'bar' | 'area' | 'pie';
}

export interface Lease {
  id: string;
  property_id: string;
  property_name: string;
  tenant_id: string;
  tenant_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: 'draft' | 'active' | 'expiring' | 'expired' | 'renewed';
  renewal_terms?: string;
  security_deposit: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  version: number;
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  assignee: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  property_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  version: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  assignee: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parent_workflow_id?: string;
  blocker_reason?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  version: number;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  vendor?: string;
  cost_estimate: number;
  actual_cost?: number;
  scheduled_date?: string;
  completion_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  version: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  property: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Submitted' | 'Approved' | 'In Progress' | 'Completed';
  assignedTo?: string;
  category: string;
}

export interface Activity {
  id: string;
  type: 'lease' | 'maintenance' | 'financial' | 'system';
  description: string;
  time: string;
}

export interface InsightData {
  title: string;
  explanation: string[];
  prediction: string;
  suggestions: string[];
}

export type VoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';