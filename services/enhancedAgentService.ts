import { GoogleGenerativeAI } from '@google/genai';
import { 
  AgentCommand, 
  AgentResponse, 
  Workflow, 
  Lease, 
  Task, 
  MaintenanceRequest,
  StatusTransitionRule
} from '../types/entities';
import { supabaseService } from './supabaseService';

class EnhancedAgentService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private statusTransitionRules: Map<string, StatusTransitionRule[]> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    this.initializeStatusTransitionRules();
  }

  private initializeStatusTransitionRules() {
    // Workflow transitions
    this.statusTransitionRules.set('workflow', [
      { from: 'draft', to: ['active', 'archived'], entityType: 'workflow' },
      { from: 'active', to: ['paused', 'completed', 'archived'], entityType: 'workflow' },
      { from: 'paused', to: ['active', 'archived'], entityType: 'workflow' },
      { from: 'completed', to: ['archived'], entityType: 'workflow' },
      { from: 'archived', to: [], entityType: 'workflow' }
    ]);

    // Lease transitions
    this.statusTransitionRules.set('lease', [
      { from: 'draft', to: ['active'], entityType: 'lease' },
      { from: 'active', to: ['expiring'], entityType: 'lease' },
      { from: 'expiring', to: ['expired', 'renewed'], entityType: 'lease' },
      { from: 'expired', to: [], entityType: 'lease' },
      { from: 'renewed', to: ['active'], entityType: 'lease' }
    ]);

    // Task transitions
    this.statusTransitionRules.set('task', [
      { from: 'todo', to: ['in_progress'], entityType: 'task' },
      { from: 'in_progress', to: ['blocked', 'completed'], entityType: 'task' },
      { from: 'blocked', to: ['in_progress'], entityType: 'task' },
      { from: 'completed', to: [], entityType: 'task' }
    ]);

    // Maintenance transitions
    this.statusTransitionRules.set('maintenance_request', [
      { from: 'submitted', to: ['assigned', 'cancelled'], entityType: 'maintenance_request' },
      { from: 'assigned', to: ['in_progress', 'cancelled'], entityType: 'maintenance_request' },
      { from: 'in_progress', to: ['completed', 'cancelled'], entityType: 'maintenance_request' },
      { from: 'completed', to: [], entityType: 'maintenance_request' },
      { from: 'cancelled', to: [], entityType: 'maintenance_request' }
    ]);
  }

  async processCommand(command: AgentCommand): Promise<AgentResponse> {
    try {
      // Parse natural language command
      const parsedData = await this.parseNaturalLanguage(command);
      
      if (!parsedData.success) {
        return {
          success: false,
          message: 'Failed to understand the command',
          errors: parsedData.errors
        };
      }

      // Execute the command based on type
      switch (command.type) {
        case 'create':
          return await this.handleCreate(command, parsedData.data);
        case 'update':
          return await this.handleUpdate(command, parsedData.data);
        case 'query':
          return await this.handleQuery(command, parsedData.data);
        case 'bulk_operation':
          return await this.handleBulkOperation(command, parsedData.data);
        default:
          return {
            success: false,
            message: 'Unknown command type',
            errors: [`Unsupported command type: ${command.type}`]
          };
      }
    } catch (error) {
      console.error('Agent command processing error:', error);
      return {
        success: false,
        message: 'Internal error processing command',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async parseNaturalLanguage(command: AgentCommand): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    const prompt = `
You are an AI assistant for a real estate asset management system. Parse the following natural language command and extract structured data.

Command: "${command.naturalLanguage}"
Entity Type: ${command.entityType}
Command Type: ${command.type}

Return a JSON response with the following structure:
{
  "action": "create|update|query|bulk_operation",
  "entityType": "workflow|lease|task|maintenance_request",
  "data": {
    // Entity-specific fields based on the command
  },
  "filters": {}, // For query commands
  "bulkOperation": { // For bulk operations
    "type": "assign|change_status|change_priority|delete",
    "criteria": {},
    "data": {}
  }
}

Entity schemas:
- Workflow: title, description, assignee, dueDate, priority (low|medium|high|critical), propertyId, tags
- Lease: propertyId, propertyName, tenantId, tenantName, startDate, endDate, rent, securityDeposit, autoRenewal
- Task: title, description, assignee, dueDate, priority, parentWorkflowId, parentTaskIds, blockerReason, estimatedHours
- Maintenance Request: propertyId, propertyName, description, priority, assignee, costEstimate, scheduledDate, category

Extract dates in YYYY-MM-DD format. For priorities, use: low, medium, high, critical, urgent (for maintenance).
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, data: parsed };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to parse natural language']
      };
    }
  }

  private async handleCreate(command: AgentCommand, parsedData: any): Promise<AgentResponse> {
    const entityData = {
      ...parsedData.data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: command.userId,
      updatedBy: command.userId,
      version: 1,
      isDeleted: false
    };

    let tableName: string;
    switch (command.entityType) {
      case 'workflow':
        tableName = 'workflows';
        break;
      case 'lease':
        tableName = 'leases';
        break;
      case 'task':
        tableName = 'tasks';
        break;
      case 'maintenance_request':
        tableName = 'maintenance_requests';
        break;
      default:
        return {
          success: false,
          message: 'Unknown entity type',
          errors: [`Unsupported entity type: ${command.entityType}`]
        };
    }

    const { data, error } = await supabaseService.create(tableName, entityData);
    
    if (error) {
      return {
        success: false,
        message: 'Failed to create entity',
        errors: [error.message]
      };
    }

    // Create audit trail
    await supabaseService.createAuditTrail({
      entityType: command.entityType,
      entityId: entityData.id,
      userId: command.userId,
      operation: 'create',
      newValue: entityData
    });

    // Generate UI component
    const uiComponent = this.generateUIComponent(command.entityType, 'create', data);

    return {
      success: true,
      message: `${command.entityType} created successfully`,
      data,
      uiComponent
    };
  }

  private async handleUpdate(command: AgentCommand, parsedData: any): Promise<AgentResponse> {
    // This would handle updates - for now, return a placeholder
    return {
      success: true,
      message: 'Update functionality will be implemented',
      data: parsedData
    };
  }

  private async handleQuery(command: AgentCommand, parsedData: any): Promise<AgentResponse> {
    let tableName: string;
    switch (command.entityType) {
      case 'workflow':
        tableName = 'workflows';
        break;
      case 'lease':
        tableName = 'leases';
        break;
      case 'task':
        tableName = 'tasks';
        break;
      case 'maintenance_request':
        tableName = 'maintenance_requests';
        break;
      default:
        return {
          success: false,
          message: 'Unknown entity type',
          errors: [`Unsupported entity type: ${command.entityType}`]
        };
    }

    const { data, error } = await supabaseService.getAll(tableName, parsedData.filters);
    
    if (error) {
      return {
        success: false,
        message: 'Failed to query entities',
        errors: [error.message]
      };
    }

    // Generate UI component
    const uiComponent = this.generateUIComponent(command.entityType, 'query', data);

    return {
      success: true,
      message: `Found ${data?.length || 0} ${command.entityType}s`,
      data,
      uiComponent
    };
  }

  private async handleBulkOperation(command: AgentCommand, parsedData: any): Promise<AgentResponse> {
    // This would handle bulk operations - for now, return a placeholder
    return {
      success: true,
      message: 'Bulk operation functionality will be implemented',
      data: parsedData
    };
  }

  private generateUIComponent(entityType: string, operation: string, data: any) {
    switch (entityType) {
      case 'workflow':
        return {
          type: 'workflow_manager',
          props: {
            workflows: Array.isArray(data) ? data : [data],
            operation
          }
        };
      case 'lease':
        return {
          type: 'lease_manager',
          props: {
            leases: Array.isArray(data) ? data : [data],
            operation
          }
        };
      case 'task':
        return {
          type: 'task_board',
          props: {
            tasks: Array.isArray(data) ? data : [data],
            operation
          }
        };
      case 'maintenance_request':
        return {
          type: 'maintenance_tracker',
          props: {
            requests: Array.isArray(data) ? data : [data],
            operation
          }
        };
      default:
        return null;
    }
  }

  validateStatusTransition(entityType: string, fromStatus: string, toStatus: string): boolean {
    const rules = this.statusTransitionRules.get(entityType);
    if (!rules) return false;

    const rule = rules.find(r => r.from === fromStatus);
    return rule ? rule.to.includes(toStatus) : false;
  }

  getValidTransitions(entityType: string, currentStatus: string): string[] {
    const rules = this.statusTransitionRules.get(entityType);
    if (!rules) return [];

    const rule = rules.find(r => r.from === currentStatus);
    return rule ? rule.to : [];
  }

  async generateContextualSuggestions(currentPage: string, userRole: string): Promise<string[]> {
    const prompt = `
You are an AI assistant for a real estate asset management system. Generate contextual suggestions for a user.

Current Page: ${currentPage}
User Role: ${userRole}

Provide 3-5 helpful suggestions for what the user might want to do next. These should be natural language commands that can be processed by the system.

Format as a JSON array of strings:
["suggestion 1", "suggestion 2", "suggestion 3"]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check for the agent service
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello');
      return !!result.response;
    } catch {
      return false;
    }
  }
}

export const enhancedAgentService = new EnhancedAgentService();
