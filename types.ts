

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
  trendLabel: string; // e.g. "since last month"
  isPositive: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number; // For comparison charts
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  date: string;
}

// Generative UI Types
export type UIComponentType = 'chart' | 'approval' | 'alert_list' | 'property_card' | 'map' | 'kanban' | 'navigate';

export interface UIPayload {
  type: UIComponentType;
  data: any; // Flexible payload depending on type
  status?: 'pending' | 'approved' | 'rejected'; // For HITL state
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  uiPayload?: UIPayload; // Optional structured data for Generative UI
}

// New Type for the Left Pane Visualizer
export interface ActiveVisual {
  type: 'default' | 'chart' | 'map' | 'kanban';
  title: string;
  data: any;
}

// Visual Context for Insight Modal
export interface VisualContext {
  type: 'chart' | 'map';
  title: string;
  data: any; // ChartData[] or specific map data
  chartType?: 'bar' | 'area' | 'pie';
}

export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  tenant: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: 'Active' | 'Expiring' | 'New';
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

// Voice API Types
export type VoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
