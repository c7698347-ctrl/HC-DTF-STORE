'use client';

import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  Truck, 
  Globe, 
  Save, 
  CheckCircle2, 
  MessageSquare, 
  Flame, 
  Clock, 
  Calendar, 
  Copy, 
  Image as ImageIcon, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminSettingsPage() {
  const { 
    settings, 
    setSettings, 
    flashSale, 
    createFlashSale, 
    duplicateFlashSale, 
    banners, 
    setBanners 
  } = useStore();

  const [savedMsg, setSavedMsg] = useState('');

  // Store General Settings Form
  const [storeName, setStoreName] = useState(settings.storeName || 'HC DTF STORE');
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || '36ABCDE1234F1Z5');
  const [shippingCharges, setShippingCharges] = useState(settings.shippingCharges || 70);
  const [freeShippingAbove, setFreeShippingAbove] = useState(settings.freeShippingAbove || 999);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '+919876543210');
  const [phone, setPhone] = useState(settings.phone || '+91 98765 43210');
  const [email, setEmail] = useState(settings.email || 'support@hcdtfstore.com');
  const [address, setAddress] = useState(settings.address || 'HC DTF STORE HQ, Hyderabad, India');
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || '');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(settings.googleAnalyticsId || '');

  // Flash Sale Manager Form State
  const [flashTitle, setFlashTitle] = useState(flashSale.title || 'Weekend Festival Mega Flash Sale');
  const [flashStartDate, setFlashStartDate] = useState(flashSale.startDate || '2026-08-06');
  const [flashStartTime, setFlashStartTime] = useState(flashSale.startTime || '00:00');
  const [flashEndDate, setFlashEndDate] = useState(flashSale.endDate || '2026-08-10');
  const [flashEndTime, setFlashEndTime] = useState(flashSale.endTime || '23:59');
  const [flashRepeatMode, setFlashRepeatMode] = useState(flashSale.repeatMode || 'Weekly');
  const [flashDiscount, setFlashDiscount] = useState(flashSale.discountPercent || 40);
  const [flashEnabled, setFlashEnabled] = useState(flashSale.enabled !== false);

  // Banner Manager Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDesktop, setBannerDesktop] = useState('');
  const [bannerMobile, setBannerMobile] = useState('');

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    setSettings({
      ...settings,
      storeName,
      gstNumber,
      shippingCharges: Number(shippingCharges),
      freeShippingAbove: Number(freeShippingAbove),
      whatsappNumber,
      phone,
      email,
      address,
      seoTitle,
      seoDescription,
      googleAnalyticsId
    });

    setSavedMsg('Store configuration saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveFlashSale = (e) => {
    e.preventDefault();
    createFlashSale({
      title: flashTitle,
      startDate: flashStartDate,
      startTime: flashStartTime,
      endDate: flashEndDate,
      endTime: flashEndTime,
      repeatMode: flashRepeatMode,
      discountPercent: Number(flashDiscount),
      enabled: flashEnabled
    });

    setSavedMsg('Flash Sale configuration updated live!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!bannerDesktop.trim()) return;

    const newB = {
      id: `b-${Date.now()}`,
      title: bannerTitle || 'HC DTF Banner',
      subtitle: 'Premium Ultra-HD DTF Print Sheets',
      desktopImage: bannerDesktop,
      mobileImage: bannerMobile || bannerDesktop,
      image: bannerDesktop,
      buttonText: 'Shop Collection',
      buttonLink: '/shop',
      active: true
    };

    setBanners([...banners, newB]);
    setBannerTitle('');
    setBannerDesktop('');
    setBannerMobile('');
    setSavedMsg('New Hero Banner added!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleDeleteBanner = (id) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-white">Store Settings, Flash Sale & Banner Controller</h1>
        <p className="text-xs text-slate-400 mt-1">Configure Flash Sale schedules, Hero Banners, GSTIN & Store Metadata</p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. FLASH SALE MANAGEMENT SECTION */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg">Flash Sale Manager & Scheduler</h2>
              <p className="text-xs text-slate-400">Control countdown timers, automatic repeat schedules & revenue history</p>
            </div>
          </div>

          <button
            onClick={duplicateFlashSale}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Copy size={14} /> Duplicate Flash Sale
          </button>
        </div>

        <form onSubmit={handleSaveFlashSale} className="space-y-6 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Flash Sale Campaign Title</label>
              <input
                type="text"
                required
                value={flashTitle}
                onChange={(e) => setFlashTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Repeat Mode</label>
              <select
                value={flashRepeatMode}
                onChange={(e) => setFlashRepeatMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
              >
                <option value="Run Once">Run Once (Single Event)</option>
                <option value="Daily">Daily Recurring</option>
                <option value="Weekly">Weekly Recurring</option>
                <option value="Monthly">Monthly Recurring</option>
                <option value="Custom">Custom Interval</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Start Date</label>
              <input
                type="date"
                required
                value={flashStartDate}
                onChange={(e) => setFlashStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Start Time</label>
              <input
                type="time"
                required
                value={flashStartTime}
                onChange={(e) => setFlashStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">End Date</label>
              <input
                type="date"
                required
                value={flashEndDate}
                onChange={(e) => setFlashEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">End Time</label>
              <input
                type="time"
                required
                value={flashEndTime}
                onChange={(e) => setFlashEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Flash Discount (%)</label>
              <input
                type="number"
                required
                value={flashDiscount}
                onChange={(e) => setFlashDiscount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-extrabold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Campaign Status</label>
              <select
                value={flashEnabled ? 'true' : 'false'}
                onChange={(e) => setFlashEnabled(e.target.value === 'true')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
              >
                <option value="true">🟢 Active (Countdown ON)</option>
                <option value="false">🔴 Disabled (Off-season)</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl text-xs shadow-lg transition flex items-center gap-2"
          >
            <Save size={16} /> Save Flash Sale Schedule
          </button>

        </form>

        {/* Flash Sale Previous History Table */}
        <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
          <h3 className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">
            Flash Sale Revenue & Orders History
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flashSale.history?.map((h) => (
              <div key={h.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{h.title}</p>
                  <p className="text-[10px] text-slate-500">{h.date} • {h.orders} Orders</p>
                </div>
                <span className="font-extrabold text-emerald-400">₹{h.revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2. HERO BANNERS MANAGEMENT SECTION */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <ImageIcon size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-lg">Desktop & Mobile Banner Uploader</h2>
            <p className="text-xs text-slate-400">Manage responsive homepage sliders for mobile & desktop views</p>
          </div>
        </div>

        {/* Existing Banners List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="relative group bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <img src={b.desktopImage || b.image} alt="" className="w-full h-28 object-cover opacity-80" />
              <div className="p-3 space-y-1">
                <p className="font-bold text-white text-xs truncate">{b.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{b.buttonLink}</p>
              </div>
              <button
                onClick={() => handleDeleteBanner(b.id)}
                className="absolute top-2 right-2 p-1.5 bg-rose-950/80 text-rose-300 rounded-lg opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Banner Form */}
        <form onSubmit={handleAddBanner} className="space-y-4 text-xs pt-4 border-t border-slate-800">
          <h3 className="font-bold text-emerald-400">Add New Hero Banner</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Banner Title</label>
              <input
                type="text"
                placeholder="e.g. Festival Maggam Special"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Desktop Banner Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={bannerDesktop}
                onChange={(e) => setBannerDesktop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Mobile Banner Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={bannerMobile}
                onChange={(e) => setBannerMobile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Hero Banner
          </button>
        </form>
      </div>

      {/* 3. STORE GENERAL & GST SETTINGS FORM */}
      <form onSubmit={handleSaveStoreSettings} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <Store size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-lg">General Store & Tax Settings</h2>
            <p className="text-xs text-slate-400">Configure official GSTIN, shipping thresholds, contact numbers & SEO</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Official GSTIN Number *</label>
            <input
              type="text"
              required
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Base Shipping Fee (₹) *</label>
            <input
              type="number"
              required
              value={shippingCharges}
              onChange={(e) => setShippingCharges(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Free Shipping Order Threshold (₹) *</label>
            <input
              type="number"
              required
              value={freeShippingAbove}
              onChange={(e) => setFreeShippingAbove(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">WhatsApp Support Number *</label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Customer Helpline Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-bold mb-1">Factory & Registered Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="sm:col-span-2 space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-slate-200 font-extrabold uppercase text-[11px]">Global Store SEO & Analytics</label>
            <input
              type="text"
              placeholder="Store SEO Meta Title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
            <input
              type="text"
              placeholder="Google Analytics Tracking ID (e.g. G-HCDTF12345)"
              value={googleAnalyticsId}
              onChange={(e) => setGoogleAnalyticsId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
        >
          <Save size={16} /> Save All Store Configuration Changes
        </button>

      </form>

    </div>
  );
}
