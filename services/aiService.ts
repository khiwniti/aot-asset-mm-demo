/**
 * AI Service - Supports multiple AI providers
 * Providers: GitHub Models (free), Gemini (quota-limited)
 */

import { Message, UIPayload, InsightData } from "../types";
import { PROPERTIES, REVENUE_DATA, ALERTS, WORK_ORDERS } from "./mockData";

// Determine which AI provider to use
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'github'; // 'github' or 'gemini'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// --- Tool Definitions (Agent Constitution: Tool-Based Architecture) ---

export const APP_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "navigate",
        description: "Navigate to a specific page in the application.",
        parameters: {
          type: "OBJECT",
          properties: {
            path: { type: "STRING", description: "The route path (e.g., /properties, /financial)" }
          },
          required: ["path"]
        }
      },
      {
        name: "render_chart",
        description: "Display a chart to visualize data.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            chartType: { type: "STRING", enum: ["bar", "pie", "area"] },
            series: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  value: { type: "NUMBER" },
                  value2: { type: "NUMBER" }
                }
              }
            }
          },
          required: ["title", "chartType", "series"]
        }
      },
      {
        name: "show_alerts",
        description: "Display a list of alerts or risks.",
        parameters: {
          type: "OBJECT",
          properties: {
            items: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  severity: { type: "STRING", enum: ["critical", "warning", "info"] },
                  location: { type: "STRING" },
                  description: { type: "STRING" }
                }
              }
            }
          },
          required: ["items"]
        }
      },
      {
        name: "request_approval",
        description: "Request user approval for a maintenance or financial action.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            property: { type: "STRING" },
            cost: { type: "NUMBER" },
            vendor: { type: "STRING" },
            justification: { type: "STRING" }
          },
          required: ["title", "property", "cost", "vendor", "justification"]
        }
      },
      {
        name: "generate_report",
        description: "Generate a structured report (Financial, Operational, Market) with key metrics.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            type: { type: "STRING", enum: ["Financial", "Operational", "Market", "Compliance"] },
            period: { type: "STRING", description: "e.g., November 2024, Q3 2024" },
            summary: { type: "STRING", description: "A concise executive summary of the report." },
            keyMetrics: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  label: { type: "STRING" },
                  value: { type: "STRING" },
                  trend: { type: "STRING", enum: ["up", "down", "neutral"] }
                }
              }
            }
          },
          required: ["title", "type", "period", "summary", "keyMetrics"]
        }
      }
    ]
  },
  // Deep Research Integration
  { googleSearch: {} }
];

const INSIGHT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', description: "A concise, catchy title for the insight" },
    explanation: { 
      type: 'ARRAY', 
      items: { type: 'STRING' }, 
      description: "2-3 bullet points explaining the data trend or issue" 
    },
    prediction: { type: 'STRING', description: "A forward-looking prediction based on the data" },
    suggestions: { 
      type: 'ARRAY', 
      items: { type: 'STRING' }, 
      description: "3 actionable suggestions for the user" 
    },
  },
  required: ['title', 'explanation', 'prediction', 'suggestions'],
};

/**
 * GitHub Models API Integration
 * Uses GitHub's free AI models (GPT-4o, GPT-4o-mini, etc.)
 */
async function generateWithGitHub(prompt: string, context: Message[]): Promise<AIResponse> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not configured');
  }

  const messages = [
    {
      role: 'system',
      content: `You are AOT AI Assistant, an expert in real estate asset management. 
You help users manage properties, analyze data, and make informed decisions.
Be concise, professional, and data-driven in your responses.`
    },
    ...context.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    })),
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Free model on GitHub
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub Models API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || 'No response generated.';

    return { text };
  } catch (error) {
    console.error('GitHub Models API Error:', error);
    throw error;
  }
}

/**
 * Gemini API Integration (fallback)
 */
async function generateWithGemini(prompt: string, context: Message[]): Promise<AIResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const chat = ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  });

  const result = await chat;
  const text = result.response?.text() || 'No response generated.';

  return { text };
}

/**
 * Main AI generation function
 * Automatically selects provider based on configuration
 */
export async function generateAIResponse(
  prompt: string,
  context: Message[] = []
): Promise<AIResponse> {
  try {
    if (AI_PROVIDER === 'github' && GITHUB_TOKEN) {
      console.log('🤖 Using GitHub Models API');
      return await generateWithGitHub(prompt, context);
    } else if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
      console.log('🤖 Using Gemini API');
      return await generateWithGemini(prompt, context);
    } else if (GITHUB_TOKEN) {
      // Fallback to GitHub if available
      console.log('🤖 Falling back to GitHub Models API');
      return await generateWithGitHub(prompt, context);
    } else if (GEMINI_API_KEY) {
      // Fallback to Gemini if available
      console.log('🤖 Falling back to Gemini API');
      return await generateWithGemini(prompt, context);
    } else {
      throw new Error('No AI provider configured. Please set VITE_GITHUB_TOKEN or VITE_GEMINI_API_KEY');
    }
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    
    // Return helpful error message
    return {
      text: `I apologize, but I'm currently experiencing connection issues. ${
        error.message?.includes('quota') 
          ? 'The AI service quota has been exceeded. Please try again later or contact your administrator.' 
          : error.message?.includes('GITHUB_TOKEN')
          ? 'GitHub Models is not configured. Please set VITE_GITHUB_TOKEN in your .env file.'
          : 'Please try again in a moment.'
      }`
    };
  }
}

/**
 * Generate insights with structured schema for modal display
 */
export async function generateInsight(prompt: string): Promise<InsightData> {
  // Only use Gemini for insights (it supports structured output)
  if (!GEMINI_API_KEY) {
    return simulateInsightResponse(prompt);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        role: 'user',
        parts: [{ text: `Analyze the following request and provide a strategic insight: "${prompt}". 
        Context: Use general real estate asset management principles and assume a mixed portfolio.
        ` }]
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: INSIGHT_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty insight response");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return simulateInsightResponse(prompt);
  }
}

// Fallback simulation for insights
const simulateInsightResponse = async (prompt: string): Promise<InsightData> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    title: "General Data Insight",
    explanation: ["Data indicates a positive trend.", "Expenses are stable."],
    prediction: "Growth projected for next quarter.",
    suggestions: ["Review contracts.", "Check utility usage.", "Survey tenants."]
  };
};

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return !!(GITHUB_TOKEN || GEMINI_API_KEY);
}

/**
 * Get current AI provider
 */
export function getAIProvider(): string {
  if (AI_PROVIDER === 'github' && GITHUB_TOKEN) return 'GitHub Models';
  if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) return 'Google Gemini';
  if (GITHUB_TOKEN) return 'GitHub Models (fallback)';
  if (GEMINI_API_KEY) return 'Google Gemini (fallback)';
  return 'None';
}
