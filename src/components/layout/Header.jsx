'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
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
  Clock, 
  LogOut, 
  Check,
  Percent
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { LANGUAGES } from '@/lib/i18n';

export default function Header() {
  const router = useRouter();
  const { 
    lang, 
    setLang, 
    t, 
    categories, 
    products,
    cart, 
    wishlist, 
    currentUser, 
    logoutCustomer,
    setIsCartOpen,
    setIsAuthModalOpen 
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchRef = useRef(null);

  // Live search filtering
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white text-xs py-2 px-4 border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
              FLASHSALE
            </span>
            <span className="text-emerald-200 truncate">
              🔥 Extra 10% OFF on 1 Meter DTF Sheets (22×39) with Code <strong className="text-white font-semibold">WELCOME10</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-emerald-200">
            <Link href="/track-order" className="hover:text-white transition flex items-center gap-1.5">
              <Package size={13} className="text-emerald-400" />
              <span>Track Orders</span>
            </Link>
            <span className="text-emerald-700">|</span>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-emerald-400" />
              <span>Same Day Dispatch</span>
            </div>
            <span className="text-emerald-700">|</span>
            <span>Support: +91 98765 43210</span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <nav className="glass-panel backdrop-blur-md bg-white/85 border-b border-slate-200/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
                <span className="font-extrabold text-xl tracking-tighter">HC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center gap-1">
                  HC DTF <span className="text-emerald-600">STORE</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold -mt-1">
                  Premium Direct-To-Film
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-7 font-medium text-slate-700 text-sm">
              <Link href="/" className="hover:text-emerald-600 transition py-2 border-b-2 border-transparent hover:border-emerald-600">
                {t('home')}
              </Link>
              
              <Link href="/shop" className="hover:text-emerald-600 transition py-2 border-b-2 border-transparent hover:border-emerald-600">
                {t('shop')}
              </Link>

              {/* Categories Mega Dropdown */}
              <div 
                className="relative py-4"
                onMouseEnter={() => setIsCatDropdownOpen(true)}
                onMouseLeave={() => setIsCatDropdownOpen(false)}
              >
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  <span>{t('categories')}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute top-full -left-20 w-[600px] glass-panel bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-2">
                        <Link 
                          href={`/shop?cat=${encodeURIComponent(cat.name)}`}
                          onClick={() => setIsCatDropdownOpen(false)}
                          className="font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-2 text-sm transition"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {cat.name}
                        </Link>

                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="pl-3.5 space-y-1 text-xs text-slate-600">
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?cat=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`}
                                onClick={() => setIsCatDropdownOpen(false)}
                                className="block py-1 hover:text-emerald-600 transition"
                              >
                                → {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/flash-sale" className="text-amber-600 font-semibold hover:text-amber-700 transition flex items-center gap-1">
                <Flame size={15} className="text-amber-500 animate-bounce" />
                {t('flashSale')}
              </Link>

              <Link href="/shop?filter=premium" className="hover:text-emerald-600 transition flex items-center gap-1">
                <Sparkles size={15} className="text-emerald-500" />
                {t('premiumCollection')}
              </Link>

              <Link href="/shop?filter=new" className="hover:text-emerald-600 transition">
                {t('newArrivals')}
              </Link>

              <Link href="/contact" className="hover:text-emerald-600 transition">
                {t('contact')}
              </Link>
            </div>

            {/* Live Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-slate-100/90 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition duration-200"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Autocomplete Overlay */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 divide-y divide-slate-100">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(`/product/${item.slug || item.id}`);
                        setIsSearchFocused(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 text-left transition"
                    >
                      <img src={item.images[0]} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.category} • ₹{item.offerPrice}</p>
                      </div>
                    </button>
                  ))}
                  <Link
                    href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsSearchFocused(false)}
                    className="block text-center text-xs font-semibold text-emerald-600 py-2.5 bg-emerald-50 hover:bg-emerald-100 transition"
                  >
                    View all results →
                  </Link>
                </div>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="p-2 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-100 flex items-center gap-1 text-xs font-medium transition"
                  title="Change Language"
                >
                  <Globe size={18} className="text-slate-600" />
                  <span className="hidden xl:inline uppercase">{activeLangObj.code}</span>
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 max-h-64 overflow-y-auto">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
                          lang === l.code ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{l.name} ({l.native})</span>
                        {lang === l.code && <Check size={14} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link 
                href="/wishlist" 
                className="relative p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
                title={t('wishlist')}
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
                title={t('cart')}
              >
                <ShoppingBag size={20} />
                {totalCartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-emerald-600/40 animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* My Account Dropdown & Profile Photo Avatar */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-2xl transition font-medium text-xs sm:text-sm"
                >
                  {currentUser?.photo ? (
                    <img 
                      src={currentUser.photo} 
                      alt={currentUser.name} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shrink-0" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-xs border border-emerald-300 shrink-0">
                      {currentUser ? currentUser.name?.charAt(0).toUpperCase() : <User size={18} className="text-emerald-700" />}
                    </div>
                  )}

                  <span className="hidden sm:inline font-bold text-slate-900">
                    {currentUser ? currentUser.name.split(' ')[0] : t('myAccount')}
                  </span>
                  <ChevronDown size={14} className="hidden sm:inline text-slate-400" />
                </button>

                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 divide-y divide-slate-100">
                    {currentUser ? (
                      <>
                        <div className="px-4 py-3 bg-slate-50/80 flex items-center gap-3">
                          {currentUser.photo ? (
                            <img src={currentUser.photo} alt="" className="w-9 h-9 rounded-full object-cover border border-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
                              {currentUser.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>

                        <div className="py-1 text-xs font-semibold">
                          <Link href="/account" onClick={() => setIsAccountDropdownOpen(false)} className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600">
                            Dashboard & Profile
                          </Link>
                          <Link href="/account?tab=orders" onClick={() => setIsAccountDropdownOpen(false)} className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600">
                            Order History
                          </Link>
                          <Link href="/account?tab=addresses" onClick={() => setIsAccountDropdownOpen(false)} className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600">
                            Saved Addresses
                          </Link>
                        </div>

                        <div className="py-1 text-xs">
                          <button
                            onClick={() => {
                              logoutCustomer();
                              setIsAccountDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                          >
                            <LogOut size={14} />
                            <span>{t('logout')}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
                        >
                          {t('login')} / {t('register')}
                        </button>
                        <Link
                          href="/track-order"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="block text-center text-xs text-slate-600 hover:text-emerald-600 py-1.5 font-medium"
                        >
                          Guest Order Tracking
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-panel bg-white border-t border-slate-100 p-5 space-y-4 shadow-xl">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-full border border-slate-200"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="space-y-1 text-sm font-semibold text-slate-800">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-emerald-700">
                {t('home')}
              </Link>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-2">
                {t('shop')}
              </Link>
              
              <div className="py-2 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('categories')}</span>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?cat=${encodeURIComponent(c.name)}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block pl-3 py-1 text-slate-600 hover:text-emerald-600 text-xs"
                  >
                    • {c.name}
                  </Link>
                ))}
              </div>

              <Link href="/flash-sale" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-amber-600">
                🔥 {t('flashSale')}
              </Link>
              <Link href="/shop?filter=premium" onClick={() => setIsMobileMenuOpen(false)} className="block py-2">
                ✨ {t('premiumCollection')}
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2">
                {t('contact')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
