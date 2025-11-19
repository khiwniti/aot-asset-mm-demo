
import React, { createContext, useContext, useState, PropsWithChildren, useRef, useEffect } from 'react';
import { Message, ActiveVisual, InsightData, VisualContext, VoiceStatus } from '../types';
import { generateAIResponse, generateInsight } from '../services/agentService';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCM16Blob, decode, decodeAudioData } from '../services/audioUtils';
import { useNavigate, useLocation } from 'react-router-dom';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  isWakeWordListening: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Insight Modal State
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [insightVisual, setInsightVisual] = useState<VisualContext | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  
  // Default visual state for the left pane
  const [activeVisual, setActiveVisual] = useState<ActiveVisual>({
    type: 'default',
    title: 'Portfolio Overview',
    data: null
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hello! I am your AOT Assistant. I can analyze data, generate reports, and navigate you through the system. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  // --- Voice API State & Refs ---
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('disconnected');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentSessionRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

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
      // Get structured response from service, passing current path as context
      const response = await generateAIResponse(content, messages, { path: location.pathname });
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.text,
        uiPayload: response.uiPayload, // Inject the Generative UI payload
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Handle Navigation Payload
      if (response.uiPayload?.type === 'navigate' && response.uiPayload.data?.path) {
         navigate(response.uiPayload.data.path);
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
    // Small delay to let the modal open before the message appears
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
       console.error("Failed to generate insight", error);
       setIsInsightOpen(false);
    } finally {
       setIsInsightLoading(false);
    }
  };
  
  const closeInsight = () => setIsInsightOpen(false);

  // Human-in-the-loop handler
  const handleApproval = (messageId: string, action: 'approved' | 'rejected') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.uiPayload) {
        return {
          ...msg,
          uiPayload: {
            ...msg.uiPayload,
            status: action
          }
        };
      }
      return msg;
    }));

    // Simulate follow-up after action
    setTimeout(() => {
      const followUp: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: action === 'approved' 
          ? "Action confirmed. I've updated the system records." 
          : "Action rejected. I've flagged this for manual review.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, followUp]);
    }, 600);
  };

  // --- Voice Logic ---

  const stopVoiceSession = () => {
    console.log("Stopping voice session...");
    
    // 1. Disconnect Input Nodes
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }

    // 2. Stop Tracks
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    // 3. Close Input Context
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close().catch(console.error);
        inputAudioContextRef.current = null;
    }

    // 4. Stop & Clear Output Sources
    audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();
    
    // 5. Close Output Context
    if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
    }

    // 6. Close Gemini Session
    currentSessionRef.current = null;
    
    setVoiceStatus('disconnected');
    nextStartTimeRef.current = 0;
  };

  const toggleVoiceMode = async () => {
    if (voiceStatus === 'connected' || voiceStatus === 'connecting') {
        stopVoiceSession();
        return;
    }

    setVoiceStatus('connecting');
    setVoiceError(null);

    // Stop wake word listener before starting voice session
    if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { console.warn("Could not stop recognition", e)}
        setIsWakeWordListening(false);
    }

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY is missing");
        }
        
        // 1. Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        
        // Ensure contexts are running (required by some browsers)
        if (inputCtx.state === 'suspended') await inputCtx.resume();
        if (outputCtx.state === 'suspended') await outputCtx.resume();

        inputAudioContextRef.current = inputCtx;
        audioContextRef.current = outputCtx;

        // 2. Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // 3. Initialize Gemini Client
        const client = new GoogleGenAI({ apiKey });
        
        // 4. Connect to Live API
        const sessionPromise = client.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: 'You are an expert Real Estate Asset Management assistant named AOT AI. Keep responses concise and professional.',
            },
            callbacks: {
                onopen: () => {
                    console.log("Voice session opened");
                    setVoiceStatus('connected');
                    
                    // Start Audio Streaming
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        // Only send if we are still connected
                        if (!inputCtx || inputCtx.state === 'closed') return;
                        
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createPCM16Blob(inputData);
                        
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        }).catch(err => {
                           // This catches session usage errors
                        });
                    };

                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                    
                    sourceRef.current = source;
                    processorRef.current = processor;
                },
                onmessage: async (msg: any) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        const ctx = audioContextRef.current;
                        if (!ctx || ctx.state === 'closed') return;

                        // Ensure gapless playback
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                        try {
                            const audioBuffer = await decodeAudioData(
                                decode(audioData), 
                                ctx, 
                                24000
                            );

                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            
                            source.onended = () => {
                                if (audioSourcesRef.current) {
                                    audioSourcesRef.current.delete(source);
                                }
                            };
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        } catch (decodeErr) {
                            console.error("Audio decode error", decodeErr);
                        }
                    }

                    if (msg.serverContent?.interrupted) {
                        audioSourcesRef.current.forEach(s => {
                            try { s.stop(); } catch(e){}
                        });
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onclose: (e) => {
                    console.log("Voice session closed", e);
                    setVoiceStatus((prev) => {
                        // Only trigger stop if we didn't initiate it (status is not disconnected yet)
                        if (prev !== 'disconnected') {
                           setTimeout(() => stopVoiceSession(), 0);
                        }
                        return 'disconnected';
                    });
                },
                onerror: (e) => {
                    console.error("Voice Error", e);
                    setVoiceError("Connection interrupted.");
                    setTimeout(() => stopVoiceSession(), 0);
                }
            }
        });

        // Handle initial connection failure
        sessionPromise.catch(err => {
            console.error("Failed to establish voice session:", err);
            setVoiceError("Network Error: Could not connect to Gemini Live.");
            stopVoiceSession();
        });

        // Wait for connection to establish reference
        currentSessionRef.current = await sessionPromise;

    } catch (error: any) {
        console.error("Failed to start voice session:", error);
        setVoiceError(error.message || "Could not start voice session.");
        stopVoiceSession();
    }
  };

  // --- Wake Word Detection ---
  useEffect(() => {
    // If voice session is active, ensure recognition is off
    if (voiceStatus !== 'disconnected') {
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'th-TH'; // Prioritize Thai locale

    recognition.onstart = () => setIsWakeWordListening(true);
    recognition.onend = () => {
        setIsWakeWordListening(false);
        // Auto-restart if still disconnected and intentional
        if (voiceStatus === 'disconnected' && recognitionRef.current === recognition) {
            try { recognition.start(); } catch(e) { console.log('Reconnect failed', e) }
        }
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        if (transcript.includes('hi aot') || 
            transcript.includes('hello aot') || 
            transcript.includes('สวัสดี') || 
            transcript.includes('sawasdee')) {
            
            recognition.stop();
            toggleVoiceMode();
            if (!isOpen) setIsOpen(true);
        }
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Speech recognition start error:", e);
    }

    return () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
            recognitionRef.current = null;
        }
    };
  }, [voiceStatus, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopVoiceSession();
        if (recognitionRef.current) {
           try { recognitionRef.current.stop(); } catch(e) {}
        }
    };
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen,
      toggleChat,
      messages,
      sendMessage,
      openChatWithPrompt,
      isLoading,
      handleApproval,
      activeVisual,
      setActiveVisual,
      isInsightOpen,
      closeInsight,
      triggerInsight,
      insightData,
      isInsightLoading,
      insightVisual,
      voiceStatus,
      toggleVoiceMode,
      voiceError,
      isWakeWordListening
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
