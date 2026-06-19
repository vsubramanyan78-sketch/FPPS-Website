import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Sparkles, SendHorizontal } from 'lucide-react';
import axios from 'axios';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const Chatbot: React.FC = () => {
  const { theme, apiUrl } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: "Hello! I am your FPPS Flight Assistant. Ask me about flight prices, routes, delays, or recommended booking windows." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/assistant/chat`, { message: userMsg });
      setMessages(prev => [...prev, { sender: 'assistant', text: response.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: "Sorry, I am having trouble connecting to the aero engine right now. Please check if the server is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Optimal booking window", text: "What is the best time to book a flight?" },
    { label: "Delay risk variables", text: "How does weather affect delay risks?" },
    { label: "DEL to BOM route details", text: "Tell me about the DEL to BOM route" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-tr from-aviation-sky to-aviation-cyan text-aviation-navy shadow-[0_0_20px_rgba(0,180,216,0.6)] hover:scale-105 transition-all duration-200 flex items-center justify-center border border-white/20"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`
          w-80 sm:w-96 h-[480px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden
          ${theme === 'dark' 
            ? 'bg-aviation-navy/95 border-aviation-royal/30 text-white' 
            : 'bg-white/95 border-gray-200 text-gray-800'}
          backdrop-blur-md transition-all duration-300
        `}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-aviation-navy to-aviation-dark border-b border-aviation-royal/20 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-aviation-sky/20 rounded-lg">
                <Sparkles className="w-4.5 h-4.5 text-aviation-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-bold">FPPS Aero Assistant</h3>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  AI Agent Online
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed
                  ${msg.sender === 'user'
                    ? 'bg-aviation-sky text-aviation-navy font-semibold rounded-tr-none'
                    : theme === 'dark'
                      ? 'bg-aviation-dark/80 text-gray-200 rounded-tl-none border border-aviation-royal/25'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'}
                `}>
                  {/* Handle line breaks and basic formatting */}
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 items-center bg-aviation-dark/30 p-3 rounded-2xl rounded-tl-none border border-aviation-royal/10">
                  <span className="w-1.5 h-1.5 bg-aviation-sky rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-aviation-sky rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-aviation-sky rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick templates (when prompt list is short) */}
          {messages.length < 3 && (
            <div className="p-3 border-t border-aviation-royal/10 flex gap-2 flex-wrap bg-aviation-dark/10">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  className="text-[10px] bg-aviation-sky/10 border border-aviation-sky/20 hover:bg-aviation-sky/25 text-aviation-sky px-2 py-1 rounded-lg transition-colors text-left"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="p-3 border-t border-aviation-royal/15 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about prices, delay risk..."
              className={`
                flex-1 px-3 py-2 rounded-xl text-xs outline-none border transition-colors
                ${theme === 'dark' 
                  ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
              `}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-aviation-sky text-aviation-navy disabled:opacity-40 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <SendHorizontal className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
