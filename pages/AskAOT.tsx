import React from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import { Sparkles } from 'lucide-react';

const AskAOT: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#f8f9fc]">
      <Header 
        title="Ask AOT" 
        subtitle="Your AI assistant for real estate asset management and analytics." 
      />

      <main className="flex-1 p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
          {/* Chat Header within the component */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-blue-200 shadow-lg">
               <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">AOT Intelligence</h2>
              <p className="text-xs text-slate-500">Powered by Gemini AI Models</p>
            </div>
          </div>

          {/* Shared Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface isFullPage={true} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AskAOT;