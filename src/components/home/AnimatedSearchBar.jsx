'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, Sparkles, Flame, ArrowRight, Clock, Trash2, X, TrendingUp } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const PLACEHOLDERS = [
  'Search Saree Borders...',
  'Search Blouse Designs...',
  'Search Festival Stickers...',
  'Search Metallic DTF...',
  'Search Custom Gang Sheets...',
  'Search Heat Press Machines...'
];

const TRENDING_SEARCH_KEYWORDS = [
  'Festival Collection',
  'Saree Borders',
  'Blouse Designs',
  'Neck Designs',
  'Metallic Prints',
  'Kids Collection',
  'Custom Gang Sheets',
  'Heat Press Machines'
];

export default function AnimatedSearchBar() {
  const router = useRouter();
  const { products = [] } = useStore();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('Search DTF Prints...');
  const [isTyping, setIsTyping] = useState(true);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hc_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save search query to history
  const saveSearchToHistory = (term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((s) => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 10);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hc_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteHistoryItem = (e, itemToDelete) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== itemToDelete);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hc_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllHistory = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('hc_recent_searches');
    } catch (err) {
      console.error(err);
    }
  };

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
      saveSearchToHistory(transcript);
      router.push(`/shop?search=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearchToHistory(query.trim());
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const executeKeywordSearch = (keyword) => {
    saveSearchToHistory(keyword);
    setQuery(keyword);
    router.push(`/shop?search=${encodeURIComponent(keyword)}`);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 relative my-8 min-h-[64px]">
      
      {/* Decorative Micro-Animations around Search Bar */}
      <div className="absolute -top-3 left-8 text-emerald-500/40 animate-pulse pointer-events-none">
        <Sparkles size={16} />
      </div>
      <div className="absolute -bottom-3 right-12 text-amber-500/30 animate-bounce pointer-events-none">
        <Flame size={16} />
      </div>

      <form onSubmit={handleSearchSubmit} className="relative z-10">
        <div className="glass-card bg-white/95 backdrop-blur-md rounded-3xl p-2.5 sm:p-3 shadow-xl border border-slate-200/90 flex items-center gap-3 transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 min-h-[58px]">
          
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ml-1">
            <Search size={20} />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={displayedPlaceholder}
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

      {/* DROPDOWN MENU: HISTORY, TRENDING & LIVE SUGGESTIONS */}
      {isFocused && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-4 space-y-4">
          
          {/* 1. Live Auto-Suggestions while typing */}
          {query.trim().length > 1 && searchResults.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                ⚡ Instant Live Suggestions
              </span>
              <div className="divide-y divide-slate-100">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      saveSearchToHistory(item.name);
                      router.push(`/product/${item.slug || item.id}`);
                      setIsFocused(false);
                    }}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-emerald-50/60 rounded-2xl text-left transition"
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-xl shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{item.category} • ₹{item.offerPrice || item.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Recent Search History (When query is empty or short) */}
          {recentSearches.length > 0 && query.trim().length <= 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-600" /> 🕒 Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearAllHistory}
                  className="text-[10px] text-rose-600 hover:underline font-bold"
                >
                  Clear History
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => executeKeywordSearch(term)}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold cursor-pointer transition"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={(e) => deleteHistoryItem(e, term)}
                      className="p-0.5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Trending Searches */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 px-1">
              <Flame size={14} className="text-rose-500" /> 🔥 Trending Searches
            </span>

            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCH_KEYWORDS.map((kw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => executeKeywordSearch(kw)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200/90 text-slate-700 text-xs font-extrabold transition shadow-xs"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
