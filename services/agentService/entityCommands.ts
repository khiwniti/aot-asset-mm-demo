// Entity Command Handling - Parse and execute entity management commands

import { EntityCommand, EntityIntent } from "./types";
import { Priority, WorkflowStatus, LeaseStatus, TaskStatus, MaintenanceStatus } from "../../types/entities";

// Keyword mappings for entity detection
const ENTITY_KEYWORDS = {
  workflow: ['workflow', 'workflow', 'process', 'project'],
  lease: ['lease', 'leasing', 'tenant', 'rental', 'rent'],
  task: ['task', 'todo', 'assignment', 'job', 'work item'],
  maintenance: ['maintenance', 'repair', 'fix', 'service', 'work order', 'maintenance request']
};

const INTENT_KEYWORDS = {
  create: ['create', 'add', 'new', 'make', 'set up', 'start'],
  update: ['update', 'edit', 'modify', 'change', 'set', 'update'],
  query: ['show', 'list', 'get', 'find', 'search', 'display', 'what', 'list all'],
  status_change: ['mark', 'transition', 'move', 'change status', 'set status', 'complete', 'finish'],
  bulk_operation: ['bulk', 'all', 'multiple', 'assign all', 'update all', 'batch'],
  navigate: ['go to', 'navigate', 'take me', 'show me']
};

const PRIORITY_MAP: Record<string, Priority> = {
  'low': Priority.LOW,
  'medium': Priority.MEDIUM,
  'high': Priority.HIGH,
  'urgent': Priority.URGENT,
  'critical': Priority.CRITICAL,
  'low priority': Priority.LOW,
  'medium priority': Priority.MEDIUM,
  'high priority': Priority.HIGH,
  'urgent priority': Priority.URGENT
};

const STATUS_MAPS = {
  workflow: {
    'draft': WorkflowStatus.DRAFT,
    'active': WorkflowStatus.ACTIVE,
    'paused': WorkflowStatus.PAUSED,
    'completed': WorkflowStatus.COMPLETED,
    'archived': WorkflowStatus.ARCHIVED,
  },
  lease: {
    'draft': LeaseStatus.DRAFT,
    'active': LeaseStatus.ACTIVE,
    'expiring': LeaseStatus.EXPIRING,
    'expired': LeaseStatus.EXPIRED,
    'renewed': LeaseStatus.RENEWED,
  },
  task: {
    'todo': TaskStatus.TODO,
    'todo': TaskStatus.TODO,
    'in progress': TaskStatus.IN_PROGRESS,
    'in_progress': TaskStatus.IN_PROGRESS,
    'blocked': TaskStatus.BLOCKED,
    'completed': TaskStatus.COMPLETED,
  },
  maintenance: {
    'submitted': MaintenanceStatus.SUBMITTED,
    'assigned': MaintenanceStatus.ASSIGNED,
    'in progress': MaintenanceStatus.IN_PROGRESS,
    'in_progress': MaintenanceStatus.IN_PROGRESS,
    'completed': MaintenanceStatus.COMPLETED,
    'cancelled': MaintenanceStatus.CANCELLED,
  }
};

/**
 * Parse natural language to detect entity intent
 */
export function parseEntityIntent(message: string): EntityIntent {
  const lowerMsg = message.toLowerCase();

  // Detect intent
  let detectedIntent = 'query' as const;
  let maxConfidence = 0.5;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matches = keywords.filter(kw => lowerMsg.includes(kw)).length;
    const confidence = matches / keywords.length;
    if (confidence > maxConfidence) {
      detectedIntent = intent as any;
      maxConfidence = confidence;
    }
  }

  // Detect entity type
  let detectedEntity: 'workflow' | 'lease' | 'task' | 'maintenance' | null = null;
  let entityConfidence = 0;

  for (const [entity, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    const matches = keywords.filter(kw => lowerMsg.includes(kw)).length;
    const confidence = matches / keywords.length;
    if (confidence > entityConfidence) {
      detectedEntity = entity as any;
      entityConfidence = confidence;
    }
  }

  // Extract data from message
  const extractedData = extractEntityData(message, detectedEntity);

  return {
    type: detectedIntent as any,
    entityType: detectedEntity,
    confidence: (maxConfidence + entityConfidence) / 2,
    extractedData,
    suggestedAction: `${detectedIntent} ${detectedEntity || 'entity'}`
  };
}

/**
 * Extract specific data fields from message
 */
function extractEntityData(
  message: string,
  entityType: string | null
): Record<string, any> {
  const data: Record<string, any> = {};
  const lowerMsg = message.toLowerCase();

  // Extract common fields
  if (lowerMsg.includes('title:') || lowerMsg.includes('name:')) {
    const titleMatch = message.match(/(?:title|name):\s*([^,\n]+)/i);
    if (titleMatch) data.title = titleMatch[1].trim();
  }

  if (lowerMsg.includes('description:')) {
    const descMatch = message.match(/description:\s*([^,\n]+)/i);
    if (descMatch) data.description = descMatch[1].trim();
  }

  if (lowerMsg.includes('assignee:') || lowerMsg.includes('assign to:') || lowerMsg.includes('assign')) {
    const assignMatch = message.match(/(?:assignee|assign(?:\s+to)?|assigned to):\s*([^,\n]+)/i);
    if (assignMatch) data.assignee = assignMatch[1].trim();
  }

  if (lowerMsg.includes('due:') || lowerMsg.includes('due date:')) {
    const dueMatch = message.match(/(?:due|due\s+date):\s*([^,\n]+)/i);
    if (dueMatch) data.dueDate = dueMatch[1].trim();
  }

  // Extract priority
  for (const [keyword, priority] of Object.entries(PRIORITY_MAP)) {
    if (lowerMsg.includes(keyword)) {
      data.priority = priority;
      break;
    }
  }

  // Extract status
  if (entityType && STATUS_MAPS[entityType as keyof typeof STATUS_MAPS]) {
    const statusMap = STATUS_MAPS[entityType as keyof typeof STATUS_MAPS];
    for (const [keyword, status] of Object.entries(statusMap)) {
      if (lowerMsg.includes(keyword)) {
        data.status = status;
        break;
      }
    }
  }

  // Entity-specific extractions
  if (entityType === 'lease') {
    if (lowerMsg.includes('tenant:') || lowerMsg.includes('tenant')) {
      const tenantMatch = message.match(/tenant(?:\s+name)?:\s*([^,\n]+)/i);
      if (tenantMatch) data.tenantName = tenantMatch[1].trim();
    }
    if (lowerMsg.includes('property:') || lowerMsg.includes('property id:')) {
      const propMatch = message.match(/property(?:\s+id)?:\s*([^,\n]+)/i);
      if (propMatch) data.propertyId = propMatch[1].trim();
    }
    if (lowerMsg.includes('rent:') || lowerMsg.includes('rental:')) {
      const rentMatch = message.match(/rent(?:al)?:\s*\$?([\d,]+)/i);
      if (rentMatch) data.rentAmount = parseFloat(rentMatch[1].replace(/,/g, ''));
    }
  }

  if (entityType === 'maintenance') {
    if (lowerMsg.includes('property:') || lowerMsg.includes('location:')) {
      const propMatch = message.match(/(?:property|location):\s*([^,\n]+)/i);
      if (propMatch) data.propertyId = propMatch[1].trim();
    }
    if (lowerMsg.includes('cost estimate:') || lowerMsg.includes('estimate:') || lowerMsg.includes('$')) {
      const costMatch = message.match(/(?:cost\s+estimate|estimate):\s*\$?([\d,]+)/i) ||
                       message.match(/\$\s*(\d+(?:,\d{3})*)/);
      if (costMatch) data.costEstimate = parseFloat(costMatch[1].replace(/,/g, ''));
    }
  }

  return data;
}

/**
 * Handle entity command execution
 * This function determines what action to take based on the parsed command
 */
export function handleEntityCommand(command: EntityCommand): {
  success: boolean;
  action: string;
  payload: any;
  error?: string;
} {
  const { intent, entityType, data } = command;

  // Validate command
  if (!entityType) {
    return {
      success: false,
      action: 'none',
      payload: null,
      error: 'Could not determine entity type from command'
    };
  }

  // Based on intent, determine action
  switch (intent) {
    case 'create':
      return handleCreateEntity(entityType, data);
    
    case 'update':
      return handleUpdateEntity(entityType, data);
    
    case 'query':
      return handleQueryEntity(entityType, data);
    
    case 'status_change':
      return handleStatusChange(entityType, data);
    
    case 'bulk_operation':
      return handleBulkOperation(entityType, data);
    
    default:
      return {
        success: false,
        action: 'none',
        payload: null,
        error: `Unknown intent: ${intent}`
      };
  }
}

function handleCreateEntity(
  entityType: string,
  data: Record<string, any>
): {
  success: boolean;
  action: string;
  payload: any;
  error?: string;
} {
  // Validate required fields
  const requiredFields = getRequiredFieldsForEntity(entityType, 'create');
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    return {
      success: false,
      action: 'none',
      payload: null,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return {
    success: true,
    action: `create_${entityType}`,
    payload: {
      type: `${entityType}_manager`,
      data: {
        mode: 'create',
        entityType,
        formData: data
      }
    }
  };
}

function handleUpdateEntity(
  entityType: string,
  data: Record<string, any>
): {
  success: boolean;
  action: string;
  payload: any;
  error?: string;
} {
  if (!data.id) {
    return {
      success: false,
      action: 'none',
      payload: null,
      error: 'Update requires entity ID'
    };
  }

  return {
    success: true,
    action: `update_${entityType}`,
    payload: {
      type: `${entityType}_manager`,
      data: {
        mode: 'edit',
        entityType,
        entityId: data.id,
        formData: data
      }
    }
  };
}

function handleQueryEntity(
  entityType: string,
  data: Record<string, any>
): {
  success: boolean;
  action: string;
  payload: any;
  error?: string;
} {
  return {
    success: true,
    action: `query_${entityType}`,
    payload: {
      type: `${entityType}_manager`,
      data: {
        mode: 'list',
        entityType,
        filter: data.filter || {}
      }
    }
  };
}

function handleStatusChange(
  entityType: string,
  data: Record<string, any>
): {
  success: boolean;
  action: string;
  payload: any;
  error?: string;
} {
  if (!data.id || !data.status) {
    return {
      success: false,
      action: 'none',
      payload: null,
      error: 'Status change requires entity ID and target status'
    };
  }

  return {
    success: true,
    action: `status_change_${entityType}`,
    payload: {
      type: `${entityType}_manager`,
      data: {
        mode: 'status_change',
        entityType,
        entityId: data.id,
        targetStatus: data.status
      }
    }
  };
}

function handleBulkOperation(
  entityType: string,
  data: Record<string, any>
): {
  success: boolean;
  action: string;
  payload: any;
  error?: string;
} {
  if (!data.ids || data.ids.length === 0) {
    return {
      success: false,
      action: 'none',
      payload: null,
      error: 'Bulk operation requires entity IDs'
    };
  }

  return {
    success: true,
    action: `bulk_${entityType}`,
    payload: {
      type: `${entityType}_manager`,
      data: {
        mode: 'bulk',
        entityType,
        entityIds: data.ids,
        updates: data.updates || {}
      }
    }
  };
}

function getRequiredFieldsForEntity(
  entityType: string,
  operation: 'create' | 'update'
): string[] {
  const requirements: Record<string, Record<string, string[]>> = {
    workflow: {
      create: ['title', 'assignee', 'dueDate'],
      update: []
    },
    lease: {
      create: ['propertyId', 'tenantName', 'startDate', 'endDate', 'rentAmount'],
      update: []
    },
    task: {
      create: ['title', 'assignee', 'dueDate'],
      update: []
    },
    maintenance: {
      create: ['propertyId', 'description', 'priority', 'costEstimate'],
      update: []
    }
  };

  return requirements[entityType]?.[operation] || [];
}
