
import { GoogleGenAI, Type } from "@google/genai";
import { Message, UIPayload, InsightData } from "../types";
import { PROPERTIES, REVENUE_DATA, ALERTS, WORK_ORDERS } from "./mockData";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// --- Schemas ---

const INSIGHT_SCHEMA = {
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

const CHAT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    uiPayload: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['chart', 'approval', 'alert_list', 'map', 'navigate', 'kanban'] },
        data: { 
          type: Type.OBJECT, 
          description: "The data payload for the UI component. All fields are optional but should be used according to the type.",
          properties: {
            title: { type: Type.STRING },
            path: { type: Type.STRING },
            chartType: { type: Type.STRING },
            series: { 
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                        value2: { type: Type.NUMBER, nullable: true }
                    }
                }
            },
            property: { type: Type.STRING },
            cost: { type: Type.NUMBER },
            vendor: { type: Type.STRING },
            justification: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        severity: { type: Type.STRING },
                        location: { type: Type.STRING },
                        description: { type: Type.STRING }
                    }
                }
            },
            district: { type: Type.STRING }
          }
        },
        status: { type: Type.STRING, enum: ['pending', 'approved', 'rejected'], nullable: true }
      },
    }
  },
  required: ['text']
};

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
  3. If the user asks for a chart, return a 'chart' uiPayload with valid series data.
  4. If the user asks about alerts or risks, return an 'alert_list' uiPayload.
  5. Always output strictly in JSON format adhering to the schema.
  `;
};

// --- API Functions ---

export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  context?: { path: string }
): Promise<AIResponse> => {
  // Fallback if no API key
  if (!ai || !apiKey) {
    return simulateStructuredResponse(userMessage, context);
  }

  try {
    const currentPath = context?.path || '/';
    const systemInstruction = getSystemContext(currentPath);

    // Format history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current user message
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
    
    // Clean up or transform payload if necessary
    if (parsed.uiPayload) {
       // Fix for 'alert_list' if model returns { items: [...] } inside data
       if (parsed.uiPayload.type === 'alert_list' && !Array.isArray(parsed.uiPayload.data) && parsed.uiPayload.data?.items) {
         parsed.uiPayload.data = parsed.uiPayload.data.items;
       }
    }

    return parsed;

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    // Fallback to mock on error
    return simulateStructuredResponse(userMessage, context);
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
   // Fallback if no API key
   if (!ai || !apiKey) {
     return simulateInsightResponse(prompt);
   }

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview', // Thinking model
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
         // Thinking Config for Gemini 2.5/3.0 Pro models
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

// Mapping of natural language pages to routes
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
  'reports': '/reports',
  'compliance': '/reports',
  'analytics': '/reports',
  'settings': '/settings',
  'ask aot': '/ask-aot',
  'ai': '/ask-aot'
};

const simulateStructuredResponse = async (message: string, context?: { path: string }): Promise<AIResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Fake latency

  const lowerMsg = message.toLowerCase();
  const currentPath = context?.path || '/';

  // --- 1. Navigation Handling ---
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

  // --- 2. Generative UI Scenarios ---
  
  // Chart
  if (lowerMsg.includes('revenue') || lowerMsg.includes('trend')) {
    return {
      text: "Projected revenue growth for Q1-Q2 shows a positive trend. The jump in June corresponds to the new mall opening near Suvarnabhumi.",
      uiPayload: {
        type: 'chart',
        data: {
          title: "Revenue Projection (Q1-Q2)",
          chartType: "bar",
          series: [
            { name: "Jan", value: 330000, value2: 310000 },
            { name: "Feb", value: 345000, value2: 315000 },
            { name: "Mar", value: 360000, value2: 320000 },
            { name: "Apr", value: 385000, value2: 325000 },
            { name: "May", value: 410000, value2: 330000 },
            { name: "Jun", value: 450000, value2: 335000 },
          ]
        }
      }
    };
  }
  
  // Approval
  if (lowerMsg.includes('fix') || lowerMsg.includes('repair') || lowerMsg.includes('maintenance') || lowerMsg.includes('roof')) {
    return {
      text: "I've found a pending high-priority maintenance request for the Roof Leak. It requires immediate approval.",
      uiPayload: {
        type: 'approval',
        status: 'pending',
        data: {
          title: "Emergency HVAC Repair",
          property: "Harbor Plaza - East Wing",
          cost: 2400,
          vendor: "ABC Cooling Systems",
          justification: "Tenant reported unit failure. Requires compressor replacement."
        }
      }
    };
  }

  // Default
  return {
    text: "I'm operating in offline mode. I can help navigate or show basic mock data, but advanced AI analysis is currently unavailable."
  };
};

const simulateInsightResponse = async (prompt: string): Promise<InsightData> => {
   await new Promise(resolve => setTimeout(resolve, 1500));
   const lowerPrompt = prompt.toLowerCase();

   if (lowerPrompt.includes('revenue') || lowerPrompt.includes('trend')) {
     return {
       title: "Financial Snapshot Analysis",
       explanation: [
         "The Spend trend surges in late November and peaks in January before declining.",
         "Conversion value mirrors this pattern, suggesting seasonal campaign effectiveness."
       ],
       prediction: "Efficiency is expected to normalize in Q2 as seasonal effects wane.",
       suggestions: [
         "Reallocate spend from low-performing months.",
         "Investigate the February decline.",
         "Optimize for the January peak next year."
       ]
     };
   }
   
   return {
     title: "General Data Insight",
     explanation: [
       "Data indicates a positive upward trend driven by occupancy.",
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
