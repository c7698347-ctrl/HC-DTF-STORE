'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, Sparkles, Flame, ArrowRight, Layers } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const PLACEHOLDERS = [
  'Search Saree Borders...',
  'Search Blouse Designs...',
  'Search Festival Stickers...',
  'Search Metallic DTF...',
  'Search Custom Prints...'
];

export default function AnimatedSearchBar() {
  const router = useRouter();
  const { products } = useStore();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef(null);

  // Rotating typing placeholder effect
  useEffect(() => {
    let timeout;
    const currentTargetText = PLACEHOLDERS[placeholderIndex];

    if (isTyping) {
      if (displayedPlaceholder.length < currentTargetText.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentTargetText.slice(0, displayedPlaceholder.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1));
        }, 40);
      } else {
        setIsTyping(true);
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isTyping, placeholderIndex]);

  // Filter search results
  useEffect(() => {
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const filtered = (products || []).filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)))
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [query, products]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported on this browser.');
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
      setQuery(transcript);
      router.push(`/shop?search=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 relative my-8">
      
      {/* Decorative Micro-Animations around Search Bar */}
      <div className="absolute -top-3 left-8 text-emerald-500 opacity-40 animate-pulse pointer-events-none">
        <Sparkles size={16} />
      </div>
      <div className="absolute -bottom-3 right-12 text-amber-500 opacity-30 animate-bounce pointer-events-none">
        <Flame size={16} />
      </div>

      <form onSubmit={handleSearchSubmit} className="relative z-10">
        <div className="glass-card bg-white/95 backdrop-blur-md rounded-3xl p-2.5 sm:p-3 shadow-xl border border-slate-200/90 flex items-center gap-3 transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
          
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ml-1">
            <Search size={20} />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={displayedPlaceholder || 'Search DTF Prints...'}
              className="w-full bg-transparent text-slate-900 font-extrabold text-sm sm:text-base placeholder:text-slate-400 placeholder:font-medium focus:outline-none py-2"
            />
          </div>

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2.5 rounded-2xl transition shrink-0 ${
              isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Voice Search"
          >
            <Mic size={18} />
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Search</span>
            <ArrowRight size={16} />
          </button>

        </div>
      </form>

      {/* Live Auto-Suggestions Dropdown */}
      {isFocused && searchResults.length > 0 && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100">
          {searchResults.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                router.push(`/product/${item.slug || item.id}`);
                setIsFocused(false);
              }}
              className="w-full p-3.5 flex items-center gap-3 hover:bg-emerald-50/60 text-left transition"
            >
              <img
                src={item.images?.[0]}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{item.category} • ₹{item.offerPrice || item.price}</p>
              </div>
            </button>
          ))}
          
          <button
            onClick={() => {
              router.push(`/shop?search=${encodeURIComponent(query)}`);
              setIsFocused(false);
            }}
            className="w-full text-center text-xs font-bold text-emerald-700 py-3 bg-emerald-50 hover:bg-emerald-100 transition"
          >
            View all search results →
          </button>
        </div>
      )}

    </div>
  );
}
