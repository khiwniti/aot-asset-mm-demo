import { createContext, useContext, useState, useRef, useEffect, PropsWithChildren } from 'react';
import { Message, ActiveVisual, InsightData, VisualContext, VoiceStatus, ReportData } from '../types';
import { generateAIResponse, generateInsight } from '../services/githubModelService';
import { useNavigate, useLocation } from 'react-router-dom';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  openChatWithPrompt: (prompt: string) => Promise<void>;
  isLoading: boolean;
  handleApproval: (messageId: string, action: 'approved' | 'rejected') => void;
  activeVisual: ActiveVisual;
  setActiveVisual: (visual: ActiveVisual) => void;
  
  // Insight Modal State
  isInsightOpen: boolean;
  closeInsight: () => void;
  triggerInsight: (prompt: string, visualData?: VisualContext) => Promise<void>;
  insightData: InsightData | null;
  isInsightLoading: boolean;
  insightVisual: VisualContext | null;

  // Voice State
  voiceStatus: VoiceStatus;
  toggleVoiceMode: () => Promise<void>;
  voiceError: string | null;

  // Shared Reports State
  generatedReports: ReportData[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// FIX: Use PropsWithChildren to correctly type the component and resolve the missing 'children' prop error.
export const ChatProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Insight Modal State
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [insightVisual, setInsightVisual] = useState<VisualContext | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  
  // Default visual state
  const [activeVisual, setActiveVisual] = useState<ActiveVisual>({
    type: 'default',
    title: 'Portfolio Overview',
    data: null
  });

  // --- State Persistence (Agent Constitution: Cross-Tab State Persistence) ---
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      role: 'ai',
      content: 'Hello! I am your AOT Assistant. How can I help you today?',
      timestamp: new Date()
    }];
  });

  // Generated Reports State
  const [generatedReports, setGeneratedReports] = useState<ReportData[]>(() => {
    const saved = localStorage.getItem('generated_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('generated_reports', JSON.stringify(generatedReports));
  }, [generatedReports]);

  // --- Voice API State ---
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('disconnected');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceStatusRef = useRef<VoiceStatus>('disconnected');

  const toggleChat = () => setIsOpen(prev => !prev);

  const sendMessage = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await generateAIResponse(content, messages, { path: location.pathname });
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.text,
        uiPayload: response.uiPayload,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Handle Generative UI Actions
      if (response.uiPayload) {
        const { type, data } = response.uiPayload;

        if (type === 'navigate' && data?.path) {
          navigate(data.path);
        } else if (type === 'chart' || type === 'map') {
          // Auto-expand visualizer
          setActiveVisual({
            type: type,
            title: data.title || 'Analysis',
            data: data
          });
        } else if (type === 'report') {
           // Add to shared state
           setGeneratedReports(prev => [data, ...prev]);
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: "I'm sorry, I encountered an error processing your request.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openChatWithPrompt = async (prompt: string) => {
    if (!isOpen) setIsOpen(true);
    setTimeout(() => {
        sendMessage(prompt);
    }, 300);
  };
  
  const triggerInsight = async (prompt: string, visualData?: VisualContext) => {
    setIsInsightOpen(true);
    setInsightData(null);
    setInsightVisual(visualData || null);
    setIsInsightLoading(true);
    try {
       const data = await generateInsight(prompt);
       setInsightData(data);
    } catch (error) {
       setIsInsightOpen(false);
    } finally {
       setIsInsightLoading(false);
    }
  };
  
  const closeInsight = () => setIsInsightOpen(false);

  const handleApproval = (messageId: string, action: 'approved' | 'rejected') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.uiPayload) {
        return { ...msg, uiPayload: { ...msg.uiPayload, status: action } };
      }
      return msg;
    }));
  };

  // --- Voice Logic (Web Speech API) ---

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const stopVoiceSession = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      synthRef.current = null;
    }

    setVoiceStatus('disconnected');
    voiceStatusRef.current = 'disconnected';
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use a good voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    synthRef.current.speak(utterance);
  };

  const toggleVoiceMode = async () => {
    if (voiceStatus === 'connected' || voiceStatus === 'connecting') {
      stopVoiceSession();
      return;
    }

    setVoiceStatus('connecting');
    setVoiceError(null);

    try {
      // Check browser support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
      }

      if (!window.speechSynthesis) {
        throw new Error("Speech synthesis not supported in this browser.");
      }

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis;
      
      // Load voices (needed for some browsers)
      if (synthRef.current.getVoices().length === 0) {
        await new Promise<void>((resolve) => {
          synthRef.current!.addEventListener('voiceschanged', () => resolve(), { once: true });
          setTimeout(() => resolve(), 1000); // Timeout fallback
        });
      }

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceStatus('connected');
        voiceStatusRef.current = 'connected';
        speakText("Hello! I'm your AOT Assistant. How can I help you today?");
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript?.trim();
        if (!transcript) return;

        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcript,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
          const response = await generateAIResponse(transcript, messages, { path: location.pathname });
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: response.text,
            uiPayload: response.uiPayload,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMsg]);
          speakText(response.text);

          if (response.uiPayload) {
            const { type, data } = response.uiPayload;

            if (type === 'navigate' && data?.path) {
              navigate(data.path);
            } else if (type === 'chart' || type === 'map') {
              setActiveVisual({
                type: type,
                title: data.title || 'Analysis',
                data: data
              });
            } else if (type === 'report') {
              setGeneratedReports(prev => [data, ...prev]);
            }
          }
        } catch (error) {
          console.error("Error processing voice input:", error);
          speakText("I'm sorry, I encountered an error processing your request.");
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'ai',
            content: "I'm sorry, I encountered an error processing your voice request.",
            timestamp: new Date()
          }]);
        } finally {
          setIsLoading(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          // Ignore no-speech errors, just keep listening
          return;
        }
        setVoiceError(`Speech recognition error: ${event.error}`);
        stopVoiceSession();
      };

      recognition.onend = () => {
        // Auto-restart if still in connected mode
        if (voiceStatusRef.current === 'connected' && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error: any) {
      console.error("Failed to start voice session", error);
      setVoiceError(error.message || "Could not connect to voice services");
      stopVoiceSession();
    }
  };

  useEffect(() => {
    return () => {
        stopVoiceSession();
    };
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen, toggleChat, messages, sendMessage, openChatWithPrompt, isLoading, handleApproval,
      activeVisual, setActiveVisual, isInsightOpen, closeInsight, triggerInsight, insightData,
      isInsightLoading, insightVisual, voiceStatus, toggleVoiceMode, voiceError,
      generatedReports
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) throw new Error('useChat must be used within a ChatProvider');
  return context;
};