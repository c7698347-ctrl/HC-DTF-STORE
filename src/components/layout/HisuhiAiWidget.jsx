'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  ShoppingBag, 
  RefreshCw, 
  PhoneCall,
  RotateCcw,
  Eye,
  Share2,
  Check
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HisuhiAiWidget() {
  const router = useRouter();
  const { orders = [], products = [], machines = [], settings = {}, addToCart } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('hisuhi_chat_history_v2');
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved chat history', e);
        }
      }

      setMessages([
        {
          id: 'welcome-active',
          sender: 'hisuhi',
          text: "Hello 👋 Welcome to HC DTF STORE. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: '🔥 JUKE Heat Press Machines', payload: 'Heat press machine price' },
            { label: '📦 Custom Gang Sheets', payload: 'Do you have DTF Gang Sheets?' },
            { label: '🚚 Shipping Rates', payload: 'How much is shipping?' },
            { label: '💳 Payment Options', payload: 'How do I pay?' }
          ]
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const saveSession = (newMessages) => {
    setMessages(newMessages);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hisuhi_chat_history_v2', JSON.stringify(newMessages.slice(-25)));
    }
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = (textToSend || inputMsg).trim();
    if (!queryText) return;

    const userMessageObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedUserMessages = [...messages, userMessageObj];
    saveSession(updatedUserMessages);
    setInputMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: updatedUserMessages,
          orders,
          products,
          machines,
          settings
        })
      });

      const data = await res.json();
      setIsLoading(false);

      const botMessageObj = {
        id: `bot-${Date.now()}`,
        sender: 'hisuhi',
        text: data.reply || "Hello! How can I assist you with HC DTF STORE products or orders today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: data.type,
        products: data.products,
        showWhatsApp: data.showWhatsApp,
        whatsappNumber: data.whatsappNumber || '7207528651',
        prefilledMsg: data.prefilledMsg || `Hello HC DTF STORE 👋 I have a question regarding: ${queryText}`,
        suggestedActions: data.suggestedActions
      };

      const finalMessages = [...updatedUserMessages, botMessageObj];
      saveSession(finalMessages);

    } catch (e) {
      console.error('HISUHI AI Communication Error', e);
      setIsLoading(false);
      const errMessageObj = {
        id: `bot-err-${Date.now()}`,
        sender: 'hisuhi',
        text: "I'll connect you directly with our WhatsApp team (+91 7207528651) for immediate assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showWhatsApp: true,
        whatsappNumber: '7207528651',
        prefilledMsg: `Hello HC DTF STORE 👋 I need assistance regarding: ${queryText}`
      };
      saveSession([...updatedUserMessages, errMessageObj]);
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hisuhi_chat_history_v2');
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'hisuhi',
        text: "Hello 👋 Welcome to HC DTF STORE. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '🔥 JUKE Heat Press Machines', payload: 'Heat press machine price' },
          { label: '📦 Custom Gang Sheets', payload: 'Do you have DTF Gang Sheets?' },
          { label: '🚚 Shipping Rates', payload: 'How much is shipping?' },
          { label: '💳 Payment Options', payload: 'How do I pay?' }
        ]
      }
    ]);
  };

  const handleShareProduct = (prod) => {
    const link = `${window.location.origin}/product/${prod.slug || prod.id}`;
    if (navigator.share) {
      navigator.share({ title: prod.name, text: `${prod.name} - ₹${prod.price}`, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(link);
      setCopiedId(prod.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported on this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMsg(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-slate-900 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-xl border border-emerald-500/40 flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chat with HISUHI AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-400/40 relative group"
          title="Open HISUHI AI Conversational Assistant"
        >
          {isOpen ? (
            <X size={26} />
          ) : (
            <div className="relative">
              <Bot size={28} className="text-white" />
              <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-300 animate-spin" />
            </div>
          )}
        </button>
      </div>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* HEADER */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-black">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white tracking-tight">HISUHI AI</h3>
                  <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded uppercase">
                    Conversational
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">HC DTF STORE Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetSession}
                className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-xl hover:bg-slate-800 transition"
                title="Reset Chat Session"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-sans'
                  }`}
                >
                  {msg.text}

                  {/* RICH PRODUCT CAROUSEL CARDS */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-3 text-left">
                      {msg.products.map((prod) => (
                        <div key={prod.id || prod.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex gap-3 items-center">
                            <img
                              src={prod.image || prod.images?.[0] || '/images/juke_heat_press_16x24.png'}
                              alt={prod.name}
                              className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-xs text-slate-900 line-clamp-1">{prod.name}</p>
                              <p className="text-emerald-600 font-black text-sm">₹{(prod.price || prod.offerPrice)?.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500 font-bold">Stock: {prod.stock || 50} Available</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                            <a
                              href={`https://wa.me/917207528651?text=${encodeURIComponent(`Hello HC DTF STORE 👋 I want to order ${prod.name}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                            >
                              <PhoneCall size={12} /> Buy Now
                            </a>

                            <button
                              onClick={() => handleShareProduct(prod)}
                              className="py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                            >
                              {copiedId === prod.id ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
                              <span>{copiedId === prod.id ? 'Copied' : 'Share'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WHATSAPP SUPPORT DIRECT BUTTON */}
                  {msg.showWhatsApp && (
                    <div className="mt-3 text-left">
                      <a
                        href={`https://wa.me/91${msg.whatsappNumber || '7207528651'}?text=${encodeURIComponent(msg.prefilledMsg || 'Hello HC DTF STORE 👋 I need assistance.')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition inline-block text-center"
                      >
                        <PhoneCall size={14} /> Connect on WhatsApp (+91 {msg.whatsappNumber})
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                {/* SUGGESTED ACTIONS */}
                {msg.suggestedActions && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(act.payload)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-full shadow-2xs transition"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <RefreshCw size={14} className="animate-spin text-emerald-600" />
                <span>HISUHI AI is thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* CHAT INPUT FIELD */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl transition ${
                isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder="Type your message..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMsg.trim() || isLoading}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
