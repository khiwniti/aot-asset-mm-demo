// Agent Service - Separate module for handling all AI agent interactions
// This service is designed to be separable and can be moved to a separate package

export { generateAIResponse, generateInsight } from './gemini';
export { handleEntityCommand, parseEntityIntent } from './entityCommands';
export { ENTITY_COMMAND_SCHEMA, ENTITY_INTENT_TYPES } from './schemas';

// Re-export types if needed
export type { AIResponse, EntityCommand, EntityIntent } from './types';
