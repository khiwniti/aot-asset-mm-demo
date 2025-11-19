// Agent Service Schemas for Gemini structured output

import { Type } from '@google/genai';

export const ENTITY_INTENT_TYPES = ['create', 'update', 'query', 'status_change', 'bulk_operation', 'navigate'] as const;

export const ENTITY_COMMAND_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: { 
      type: Type.STRING, 
      enum: ENTITY_INTENT_TYPES,
      description: "The type of operation to perform on the entity"
    },
    entityType: { 
      type: Type.STRING, 
      enum: ['workflow', 'lease', 'task', 'maintenance'],
      description: "The type of entity being managed"
    },
    data: {
      type: Type.OBJECT,
      description: "The data payload for the operation. Fields depend on intent and entityType.",
      properties: {
        id: { type: Type.STRING, nullable: true },
        title: { type: Type.STRING, nullable: true },
        description: { type: Type.STRING, nullable: true },
        status: { type: Type.STRING, nullable: true },
        assignee: { type: Type.STRING, nullable: true },
        dueDate: { type: Type.STRING, nullable: true },
        priority: { type: Type.STRING, nullable: true },
        propertyId: { type: Type.STRING, nullable: true },
        tenantName: { type: Type.STRING, nullable: true },
        rentAmount: { type: Type.NUMBER, nullable: true },
        costEstimate: { type: Type.NUMBER, nullable: true },
        ids: { 
          type: Type.ARRAY,
          items: { type: Type.STRING },
          nullable: true,
          description: "Array of IDs for bulk operations"
        },
        filter: { type: Type.OBJECT, nullable: true }
      }
    },
    context: {
      type: Type.OBJECT,
      nullable: true,
      description: "Additional context for the operation"
    }
  },
  required: ['intent', 'entityType', 'data']
};

export const CHAT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "Natural language response to the user" },
    uiPayload: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        type: { 
          type: Type.STRING, 
          enum: ['chart', 'approval', 'alert_list', 'map', 'navigate', 'kanban', 'workflow_manager', 'lease_manager', 'task_board', 'maintenance_tracker'],
          description: "Type of UI component to render"
        },
        data: { 
          type: Type.OBJECT,
          nullable: true,
          description: "Data payload for the UI component"
        },
        status: { 
          type: Type.STRING, 
          enum: ['pending', 'approved', 'rejected'],
          nullable: true
        }
      }
    }
  },
  required: ['text']
};

export const INSIGHT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise, catchy title for the insight" },
    explanation: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "2-3 bullet points explaining the data trend or issue" 
    },
    prediction: { type: Type.STRING, description: "A forward-looking prediction based on the data" },
    suggestions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "3 actionable suggestions for the user" 
    },
  },
  required: ['title', 'explanation', 'prediction', 'suggestions'],
};
