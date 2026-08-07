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
  ExternalLink, 
  MessageSquare, 
  RefreshCw, 
  Check, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const FIRST_WELCOME_MESSAGE = `👋 Welcome to HC DTF STORE.

Please choose your preferred language.

🇮🇳 English
🇮🇳 తెలుగు
🇮🇳 हिन्दी
🇮🇳 ಕನ್ನಡ
🇮🇳 தமிழ்
🇮🇳 മലയാളം`;

export default function HisuhiAiWidget() {
  const router = useRouter();
  const { orders, products, addToCart } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'hisuhi',
      text: FIRST_WELCOME_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🇮🇳 English', payload: 'Hello' },
        { label: '🇮🇳 తెలుగు', payload: 'నమస్కారం' },
        { label: '🇮🇳 हिन्दी', payload: 'नमस्ते' },
        { label: '🇮🇳 ಕನ್ನಡ', payload: 'ನಮಸ್ಕಾರ' },
        { label: '🇮🇳 தமிழ்', payload: 'வணக்கம்' },
        { label: '🇮🇳 മലയാളം', payload: 'നമസ്കാരം' }
      ]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const queryText = (textToSend || inputMsg).trim();
    if (!queryText) return;

    const userMessageObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInputMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: messages,
          orders,
          products
        })
      });

      const data = await res.json();
      setIsLoading(false);

      const botMessageObj = {
        id: `bot-${Date.now()}`,
        sender: 'hisuhi',
        text: data.reply || "Hello! I'm HISUHI AI. How can I assist your order today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: data.type,
        products: data.products,
        showWhatsApp: data.showWhatsApp,
        whatsappNumber: data.whatsappNumber || '7207528651',
        prefilledMsg: data.prefilledMsg || 'Hi HC DTF STORE 👋 I need assistance regarding my order.',
        suggestedActions: data.suggestedActions
      };

      setMessages((prev) => [...prev, botMessageObj]);

    } catch (e) {
      console.error('HISUHI AI Communication Error', e);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'hisuhi',
          text: "I'm HISUHI AI, your shopping assistant! How can I help you choose or track your order today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported on this browser. Please type your message.');
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
      {/* FLOATING TRIGGER BUTTON WITH IDLE BREATHING ANIMATION */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-slate-900 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-xl border border-emerald-500/40 animate-pulse flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chat with HISUHI AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-400/40 relative group animate-bounce duration-[3000ms]"
          title="Open HISUHI AI Shopping Assistant"
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

      {/* CHAT MODAL WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* TOP HEADER */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-black">
                  <Bot size={22} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white tracking-tight">HISUHI AI</h3>
                  <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Official Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">HC DTF STORE Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-sans'
                  }`}
                >
                  {msg.text}

                  {/* PRODUCT RECOMMENDATIONS CARDS */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2 text-left">
                      {msg.products.map((prod) => (
                        <div key={prod.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[11px] text-slate-900 truncate">{prod.name}</p>
                            <p className="text-[10px] text-emerald-700 font-extrabold">₹{prod.offerPrice || prod.price}</p>
                          </div>
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg shrink-0 hover:bg-emerald-700 transition"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WHATSAPP SUPPORT BUTTON */}
                  {msg.showWhatsApp && (
                    <div className="mt-3 text-left">
                      <a
                        href={`https://wa.me/91${msg.whatsappNumber || '7207528651'}?text=${encodeURIComponent(msg.prefilledMsg || 'Hi HC DTF STORE 👋 I need assistance regarding my order.')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition inline-block text-center"
                      >
                        <PhoneCall size={14} /> Connect on WhatsApp (+91 {msg.whatsappNumber})
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                {/* SUGGESTED QUICK ACTION PILLS */}
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
                <span>HISUHI AI is typing...</span>
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
              title="Speak message"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder="Ask HISUHI AI anything..."
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
