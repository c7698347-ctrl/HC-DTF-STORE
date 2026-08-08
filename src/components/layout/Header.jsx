'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingBag, 
  User, 
  ChevronDown, 
  Globe, 
  Sparkles, 
  Flame, 
  Menu, 
  X, 
  Package, 
  Truck, 
  LogOut, 
  Check,
  PhoneCall,
  Tag,
  Wrench
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { LANGUAGES } from '@/lib/i18n';

export default function Header() {
  const router = useRouter();
  const { 
    lang, 
    setLang, 
    categories = [], 
    cart = [], 
    wishlist = [], 
    currentUser, 
    logoutCustomer,
    setIsCartOpen,
    setIsAuthModalOpen,
    settings = {}
  } = useStore();

  const [isDrawerMenuOpen, setIsDrawerMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const activeLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
              Factory Direct
            </span>
            <span className="hidden sm:inline">2400 DPI High-Density DTF Sheet Roll Transfers</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-300">
            <Link href="/track-order" className="hover:text-emerald-400 flex items-center gap-1 transition">
              <Package size={13} className="text-emerald-400" />
              <span>Track Order</span>
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <Truck size={13} className="text-emerald-400" />
              <span>Fast Delivery</span>
            </div>
            <span className="text-slate-700">|</span>
            <span>Support: +91 8121635407</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3">
            
            {/* 1. Left Menu Button */}
            <button
              onClick={() => setIsDrawerMenuOpen(true)}
              className="p-2 text-slate-900 hover:text-emerald-600 hover:bg-slate-100 rounded-2xl transition flex items-center gap-2 font-extrabold text-xs shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} />
              <span className="hidden sm:inline uppercase tracking-wider font-black">☰ Menu</span>
            </button>

            {/* 2. Official HC DTF STORE Logo + Beside Text */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group py-1 min-w-0">
              <img
                src="/images/hc_official_logo.jpg"
                alt="HC DTF STORE Official Logo"
                className="h-10 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-xl shrink-0"
              />
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-black text-base sm:text-xl md:text-2xl text-slate-900 tracking-tight whitespace-nowrap">
                  HC DTF <span className="text-emerald-600">STORE</span>
                </span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block -mt-0.5 whitespace-nowrap">
                  PREMIUM DTF PRINTING
                </span>
              </div>
            </Link>

            {/* 3. Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              
              {/* 🌐 Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Globe size={18} className="text-emerald-600" />
                  <span className="hidden sm:inline uppercase">{activeLangObj.code}</span>
                  <ChevronDown size={12} />
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 space-y-1 max-h-64 overflow-y-auto">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold flex items-center justify-between transition ${
                          lang === l.code ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{l.native} ({l.name})</span>
                        {lang === l.code && <Check size={14} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ♡ Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-slate-700 hover:text-emerald-600 rounded-xl transition">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* 🛒 Cart Drawer */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition shadow-md shadow-emerald-600/20"
              >
                <ShoppingBag size={20} />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* 👤 My Account */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-2xl text-slate-700 hover:bg-slate-100 transition"
                  aria-label="User Account"
                >
                  <User size={20} />
                </button>

                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
                    {currentUser ? (
                      <>
                        <div className="p-3 bg-slate-50 rounded-xl mb-2">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                        </div>
                        <Link href="/account" onClick={() => setIsAccountDropdownOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition">
                          My Account Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logoutCustomer();
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsAccountDropdownOpen(false);
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                      >
                        Sign In via OTP
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </nav>

      {/* SIDE MENU DRAWER */}
      {isDrawerMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsDrawerMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/hc_official_logo.jpg"
                    alt="HC DTF STORE Logo"
                    className="h-12 w-auto object-contain rounded-lg"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">HC DTF STORE</h3>
                    <p className="text-[10px] text-slate-400">PREMIUM DTF PRINTING</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Category Navigation List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-bold text-slate-800">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 block mb-1">
                    DTF Transfer Collections
                  </span>

                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?cat=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsDrawerMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition ${
                        cat.name === 'HEAT PRESS MACHINES'
                          ? 'bg-slate-900 text-white hover:bg-slate-800 font-black mt-2'
                          : 'hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {cat.name === 'HEAT PRESS MACHINES' ? (
                        <Wrench size={16} className="text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 block mb-1">
                    Quick Navigation
                  </span>

                  <Link href="/shop?filter=bestseller" onClick={() => setIsDrawerMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition">
                    <Tag size={16} className="text-emerald-600" /> Best Sellers
                  </Link>

                  <Link href="/shop?filter=new" onClick={() => setIsDrawerMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition">
                    <Sparkles size={16} className="text-emerald-600" /> New Arrivals
                  </Link>

                  <Link href="/flash-sale" onClick={() => setIsDrawerMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl text-amber-600 hover:bg-amber-50 transition">
                    <Flame size={16} className="text-amber-500" /> Offers & Flash Sale
                  </Link>

                  <Link href="/track-order" onClick={() => setIsDrawerMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition">
                    <Package size={16} className="text-emerald-600" /> Orders & Live Tracking
                  </Link>

                  <Link href="/wishlist" onClick={() => setIsDrawerMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition">
                    <Heart size={16} className="text-emerald-600" /> Wishlist ({wishlist.length})
                  </Link>

                  <Link href="/contact" onClick={() => setIsDrawerMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition">
                    <PhoneCall size={16} className="text-emerald-600" /> Support & Contact
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </header>
  );
}
