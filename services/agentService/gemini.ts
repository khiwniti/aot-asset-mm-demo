// Gemini Agent Service - AI model interactions

import { GoogleGenAI } from "@google/genai";
import { Message, InsightData } from "../../types";
import { AIResponse } from "./types";
import { PROPERTIES, ALERTS, WORK_ORDERS } from "../mockData";
import { CHAT_RESPONSE_SCHEMA, INSIGHT_SCHEMA } from "./schemas";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// --- Context Helpers ---

const getSystemContext = (path: string): string => {
  const baseContext = `You are AOT Assistant, an expert Real Estate Asset Management AI.
  You have access to a real estate portfolio with ${PROPERTIES.length} properties.
  Your goal is to help the Asset Manager optimize revenue, reduce risk, and manage operations.
  
  Current Page: ${path}
  
  Routing Knowledge:
  - Dashboard: /
  - Portfolio: /properties
  - Financial: /financial
  - Leasing: /leasing
  - Maintenance: /maintenance
  - Reports: /reports
  - Entity Management (Workflows): /workflows
  - Entity Management (Leases): /leases
  - Entity Management (Tasks): /tasks
  - Entity Management (Maintenance Tracking): /maintenance-tracking
  `;

  let dataContext = "";
  
  if (path === '/' || path.includes('dashboard')) {
    dataContext = `
      Key Metrics: 
      - Total Value: $102M
      - Occupancy: 76%
      - Revenue Trend: Rising, peak $3.5M in Dec.
      - Critical Alerts: ${ALERTS.filter(a => a.severity === 'critical').length} active.
    `;
  } else if (path.includes('properties')) {
    dataContext = `
      Properties: ${PROPERTIES.map(p => `${p.name} (${p.type}, ${p.status})`).join(', ')}.
      Focus: Identifying vacancy risks and renovation opportunities.
    `;
  } else if (path.includes('financial')) {
    dataContext = `
      Financials:
      - Total Revenue: $2.4M
      - Expenses: $980K
      - Net Income: $1.42M
      - Top Expense: Maintenance ($400K due to HVAC repairs).
    `;
  } else if (path.includes('maintenance')) {
    dataContext = `
      Work Orders:
      - Open: 12
      - High Priority: ${WORK_ORDERS.filter(w => w.priority === 'High').map(w => w.title).join(', ')}.
      - Pending Approval: Roof Leak Repair ($2,400).
    `;
  }

  return `${baseContext}\n${dataContext}\n
  RESPONSE GUIDELINES:
  1. Be concise and professional.
  2. If the user asks to navigate, return a 'navigate' uiPayload with the correct path.
  3. If the user asks for entity management (workflows, leases, tasks, maintenance), render appropriate component.
  4. If user requests entity operations (create, update, query), use structured entity handling.
  5. Always output strictly in JSON format adhering to the schema.
  `;
};

// --- API Functions ---

export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  context?: { path: string }
): Promise<AIResponse> => {
  if (!ai || !apiKey) {
    return simulateStructuredResponse(userMessage, context);
  }

  try {
    const currentPath = context?.path || '/';
    const systemInstruction = getSystemContext(currentPath);

    const contents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: CHAT_RESPONSE_SCHEMA,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const parsed = JSON.parse(text);
    
    if (parsed.uiPayload) {
      if (parsed.uiPayload.type === 'alert_list' && !Array.isArray(parsed.uiPayload.data) && parsed.uiPayload.data?.items) {
        parsed.uiPayload.data = parsed.uiPayload.data.items;
      }
    }

    return parsed;

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return simulateStructuredResponse(userMessage, context);
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
  if (!ai || !apiKey) {
    return simulateInsightResponse(prompt);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{
        role: 'user',
        parts: [{ text: `Analyze the following request and provide a strategic insight: "${prompt}". 
        Context: Use general real estate asset management principles and assume a mixed portfolio of Commercial and Residential properties in Bangkok/Southeast Asia.
        Data Reference (if relevant to prompt):
        - Revenue: Growing, $2.4M/mo
        - Occupancy: 76%
        - Maintenance Issues: HVAC, Roof Leaks common
        ` }]
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: INSIGHT_SCHEMA,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty insight response");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return simulateInsightResponse(prompt);
  }
};

// --- Fallback Mocks ---

const PAGE_ROUTES: Record<string, string> = {
  'dashboard': '/',
  'home': '/',
  'main': '/',
  'portfolio': '/properties',
  'properties': '/properties',
  'listing': '/properties',
  'list': '/properties',
  'financial': '/financial',
  'finance': '/financial',
  'money': '/financial',
  'leasing': '/leasing',
  'lease': '/leasing',
  'tenants': '/leasing',
  'maintenance': '/maintenance',
  'repairs': '/maintenance',
  'work orders': '/maintenance',
  'workflows': '/workflows',
  'tasks': '/tasks',
  'leases': '/leases',
  'maintenance tracking': '/maintenance-tracking',
  'reports': '/reports',
  'compliance': '/reports',
  'analytics': '/reports',
  'settings': '/settings',
  'ask aot': '/ask-aot',
  'ai': '/ask-aot'
};

const simulateStructuredResponse = async (message: string, context?: { path: string }): Promise<AIResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerMsg = message.toLowerCase();
  const currentPath = context?.path || '/';

  // Navigation Handling
  const navIntent = Object.keys(PAGE_ROUTES).find(page => 
    lowerMsg.includes(`go to ${page}`) || 
    lowerMsg.includes(`navigate to ${page}`) || 
    lowerMsg.includes(`show ${page}`) ||
    lowerMsg.includes(`open ${page}`)
  );

  if (navIntent) {
    const route = PAGE_ROUTES[navIntent];
    if (route === currentPath) {
      return { text: `You are already on the ${navIntent} page.` };
    }
    return {
      text: `Navigating to ${navIntent}...`,
      uiPayload: {
        type: 'navigate',
        data: { path: route }
      }
    };
  }

  // Entity Management Detection
  if (lowerMsg.includes('workflow') || lowerMsg.includes('create workflow')) {
    return {
      text: "I'll help you manage workflows. Let me show you the workflow manager.",
      uiPayload: {
        type: 'workflow_manager',
        data: {
          title: "Workflow Management",
          description: "Create, update, and track workflows"
        }
      }
    };
  }

  if (lowerMsg.includes('lease') || lowerMsg.includes('leasing')) {
    return {
      text: "I'll help you manage leases. Let me show you the lease manager with expiration tracking.",
      uiPayload: {
        type: 'lease_manager',
        data: {
          title: "Lease Management",
          description: "Manage leases and track expirations"
        }
      }
    };
  }

  if (lowerMsg.includes('task') || lowerMsg.includes('board')) {
    return {
      text: "I'll show you the task board for team coordination.",
      uiPayload: {
        type: 'task_board',
        data: {
          title: "Task Board",
          description: "Kanban-style task management"
        }
      }
    };
  }

  if (lowerMsg.includes('maintenance') || lowerMsg.includes('request')) {
    return {
      text: "I'll show you the maintenance tracker to manage work requests.",
      uiPayload: {
        type: 'maintenance_tracker',
        data: {
          title: "Maintenance Tracker",
          description: "Track and manage maintenance requests"
        }
      }
    };
  }

  // Generative UI for other queries
  if (lowerMsg.includes('revenue') || lowerMsg.includes('trend')) {
    return {
      text: "Projected revenue growth for Q1-Q2 shows a positive trend.",
      uiPayload: {
        type: 'chart',
        data: {
          title: "Revenue Projection (Q1-Q2)",
          chartType: "bar",
          series: [
            { name: "Jan", value: 330000, value2: 310000 },
            { name: "Feb", value: 345000, value2: 315000 },
            { name: "Mar", value: 360000, value2: 320000 },
          ]
        }
      }
    };
  }

  return {
    text: "I'm operating in offline mode. I can help navigate or show basic mock data, but advanced AI analysis is currently unavailable."
  };
};

const simulateInsightResponse = async (prompt: string): Promise<InsightData> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    title: "General Data Insight",
    explanation: [
      "Data indicates a positive upward trend driven by operational efficiency.",
      "Expenses remain within budget tolerances."
    ],
    prediction: "Steady growth projected for the next quarter.",
    suggestions: [
      "Conduct a utility audit.",
      "Review vendor contracts.",
      "Survey tenants for satisfaction."
    ]
  };
};
