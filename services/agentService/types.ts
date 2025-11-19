// Agent Service Types

import { Message } from '../../types';

export interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

export type UIPayloadType = 'chart' | 'approval' | 'alert_list' | 'property_card' | 'map' | 'kanban' | 'navigate' | 'workflow_manager' | 'lease_manager' | 'task_board' | 'maintenance_tracker';

export interface UIPayload {
  type: UIPayloadType;
  data: any;
  status?: 'pending' | 'approved' | 'rejected';
}

export type EntityIntentType = 'create' | 'update' | 'query' | 'status_change' | 'bulk_operation' | 'navigate';

export interface EntityCommand {
  intent: EntityIntentType;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance';
  data: Record<string, any>;
  context?: Record<string, any>;
}

export interface EntityIntent {
  type: EntityIntentType;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance' | null;
  confidence: number;
  extractedData: Record<string, any>;
  suggestedAction: string;
}
