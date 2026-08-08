'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Search, 
  Package, 
  AlertCircle,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminFlashSalePage() {
  const router = useRouter();
  const { 
    adminUser, 
    flashSale = {}, 
    settings = {}, 
    setSettings, 
    products = [], 
    updateProduct 
  } = useStore();

  const [isEnabled, setIsEnabled] = useState(settings.flashSaleEnabled !== false);
  const [title, setTitle] = useState(flashSale.title || '⚡ 24-Hour Express Flash Sale');
  const [subtitle, setSubtitle] = useState(flashSale.subtitle || 'Factory Direct Discounts Up To 50% OFF');
  const [endTime, setEndTime] = useState(
    settings.flashSaleEndTime 
      ? new Date(settings.flashSaleEndTime).toISOString().slice(0, 16)
      : new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('hc_dtf_admin_session');
    if (!adminUser && !saved) {
      router.push('/admin-login');
    }
  }, [adminUser, router]);

  const handleSaveGeneralSettings = (e) => {
    e.preventDefault();
    
    const updatedSettings = {
      ...settings,
      flashSaleEnabled: isEnabled,
      flashSaleEndTime: new Date(endTime).toISOString()
    };

    setSettings(updatedSettings);
    localStorage.setItem('hc_dtf_settings', JSON.stringify(updatedSettings));

    const updatedFlashSaleObj = {
      ...flashSale,
      title,
      subtitle,
      enabled: isEnabled,
      endTime: new Date(endTime).toISOString()
    };

    localStorage.setItem('hc_dtf_flash_sale', JSON.stringify(updatedFlashSaleObj));

    setToastMsg('Flash Sale settings saved successfully! Live homepage updated.');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleToggleProductFlashSale = (prod) => {
    const nextState = !prod.isFlashSale;
    updateProduct(prod.id, { isFlashSale: nextState });
    
    setToastMsg(`"${prod.name}" ${nextState ? 'added to' : 'removed from'} Flash Sale.`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flashSaleProductCount = products.filter((p) => p.isFlashSale).length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Flame size={36} className="text-amber-500 animate-pulse" />
            Flash Sale Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control live flash sale banner, countdown timer, and featured sale products
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border ${
            isEnabled 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}>
            {isEnabled ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            <span>Status: {isEnabled ? 'Flash Sale Active' : 'Flash Sale Disabled'}</span>
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* General Settings Form */}
      <form onSubmit={handleSaveGeneralSettings} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl text-white">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Clock size={18} />
          Flash Sale Timer & Banner Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Banner Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Banner Subtitle / Tagline *</label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold flex items-center gap-1">
              <Calendar size={14} className="text-amber-400" /> Flash Sale End Time *
            </label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer font-extrabold text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 w-full">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <span>Enable Flash Sale Section on Homepage</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Save size={16} /> Save Banner & Timer Settings
          </button>
        </div>
      </form>

      {/* Product Selector Table / List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6 sm:p-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <Package size={18} className="text-amber-500" />
              Flash Sale Products ({flashSaleProductCount} Selected)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Toggle products to include in the Flash Sale section</p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search products to include..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">Include in Flash Sale</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Offer Price (₹)</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                    No products found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-850 transition">
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleProductFlashSale(prod)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                          prod.isFlashSale 
                            ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md' 
                            : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500'
                        }`}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </button>
                    </td>

                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img
                        src={prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <span>{prod.name}</span>
                    </td>

                    <td className="p-4 font-medium text-slate-400">
                      {prod.category || 'General'}
                    </td>

                    <td className="p-4 font-black text-amber-400 text-sm">
                      ₹{prod.offerPrice || prod.price}
                    </td>

                    <td className="p-4 text-right font-extrabold">
                      {prod.isFlashSale ? (
                        <span className="text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800 text-[10px]">
                          ⚡ On Sale
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Regular</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 divide-y divide-slate-800">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleProductFlashSale(prod)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                    prod.isFlashSale 
                      ? 'bg-amber-500 border-amber-400 text-slate-950' 
                      : 'bg-slate-950 border-slate-700 text-transparent'
                  }`}
                >
                  <Check size={14} className="stroke-[3]" />
                </button>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate">{prod.name}</h4>
                  <p className="text-[10px] text-amber-400 font-black">₹{prod.offerPrice || prod.price}</p>
                </div>
              </div>

              {prod.isFlashSale && (
                <span className="text-amber-400 text-[10px] font-black shrink-0">⚡ On Sale</span>
              )}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
