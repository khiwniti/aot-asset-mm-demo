/**
 * AI Service - GitHub Models Integration
 * Using GitHub Models API for unlimited free AI capabilities
 */

import { Message, UIPayload, InsightData } from "../types";
import { PROPERTIES, REVENUE_DATA, ALERTS, WORK_ORDERS } from "./mockData";

// GitHub Models configuration
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

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

/**
 * GitHub Models API Integration
 * Uses GitHub's free AI models (GPT-4o-mini with unlimited tier)
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
 * Main AI generation function using GitHub Models
 */
export async function generateAIResponse(
  prompt: string,
  context: Message[] = []
): Promise<AIResponse> {
  if (!GITHUB_TOKEN) {
    return {
      text: 'GitHub Models is not configured. Please set VITE_GITHUB_TOKEN in your .env file.'
    };
  }

  try {
    console.log('🤖 Using GitHub Models API (GPT-4o-mini)');
    return await generateWithGitHub(prompt, context);
  } catch (error: any) {
    console.error('GitHub Models API Error:', error);
    
    // Return helpful error message
    return {
      text: `I apologize, but I'm currently experiencing connection issues. ${
        error.message?.includes('GITHUB_TOKEN')
          ? 'GitHub Models is not configured properly. Please check your VITE_GITHUB_TOKEN.'
          : error.message || 'Please try again in a moment.'
      }`
    };
  }
}

/**
 * Generate insights with structured schema for modal display
 * Now using GitHub Models for unlimited free tier
 */
export async function generateInsight(prompt: string): Promise<InsightData> {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub Token not configured, using simulated response');
    return simulateInsightResponse(prompt);
  }

  try {
    const systemPrompt = `You are an AI assistant specializing in real estate asset management. 
Analyze data and provide strategic insights for property managers.
Respond ONLY with valid JSON matching this exact structure (no markdown, no code blocks):
{
  "title": "A concise, catchy title for the insight",
  "explanation": ["2-3 bullet points explaining the data trend or issue"],
  "prediction": "A forward-looking prediction based on the data",
  "suggestions": ["3 actionable suggestions for the user"]
}`;

    const userPrompt = `Analyze the following request and provide a strategic insight: "${prompt}". 
Context: Use general real estate asset management principles and assume a mixed portfolio.`;

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub Models API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    
    if (!text) throw new Error("Empty insight response");

    // Parse and validate the JSON response
    const insight = JSON.parse(text);
    
    // Validate required fields
    if (!insight.title || !insight.explanation || !insight.prediction || !insight.suggestions) {
      throw new Error("Invalid insight structure");
    }

    return insight as InsightData;

  } catch (error) {
    console.error("GitHub Models Insight Error:", error);
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
  return !!GITHUB_TOKEN;
}

/**
 * Get current AI provider
 */
export function getAIProvider(): string {
  return GITHUB_TOKEN ? 'GitHub Models (GPT-4o-mini)' : 'None';
}
