'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Truck, 
  Save, 
  CheckCircle2, 
  CreditCard
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { STATE_SHIPPING_RATES } from '@/lib/store';

export default function AdminSettingsPage() {
  const { 
    settings, 
    setSettings, 
    flashSale, 
    createFlashSale
  } = useStore();

  const [savedMsg, setSavedMsg] = useState('');

  // Store General Settings Form
  const [storeName, setStoreName] = useState(settings.storeName || 'HC DTF STORE');
  const [shippingCharges, setShippingCharges] = useState(settings.shippingCharges || 150);
  const [freeShippingAbove, setFreeShippingAbove] = useState(settings.freeShippingAbove || 999);

  // State-Wise Shipping Rates
  const [stateRates, setStateRates] = useState(settings.stateShippingRates || STATE_SHIPPING_RATES);

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '+918121635407');
  const [phone, setPhone] = useState(settings.phone || '+91 8121635407');
  const [email, setEmail] = useState(settings.email || 'support@hcdtfstore.com');
  const [address, setAddress] = useState(settings.address || 'HC DTF STORE HQ, Hyderabad, India');
  const [upiAccountName, setUpiAccountName] = useState(settings.upiAccountName || 'Sunil Kumar');
  const [upiMobile, setUpiMobile] = useState(settings.upiMobile || '+91 8121635407');
  const [upiId, setUpiId] = useState(settings.upiId || 'sunillankapalli77@okhdfcbank');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState(settings.upiQrCodeUrl || '/gpay-qr.png');
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || '');

  const handleStateRateChange = (stateName, value) => {
    setStateRates((prev) => ({
      ...prev,
      [stateName]: Number(value) || 0
    }));
  };

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    setSettings({
      ...settings,
      storeName,
      shippingCharges: Number(shippingCharges),
      freeShippingAbove: Number(freeShippingAbove),
      stateShippingRates: stateRates,
      whatsappNumber,
      phone,
      email,
      address,
      upiAccountName,
      upiMobile,
      upiId,
      upiQrCodeUrl,
      seoTitle,
      seoDescription
    });

    setSavedMsg('Store configuration & State-Wise shipping rates saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-white">Settings → Shipping & Official UPI Controller</h1>
        <p className="text-xs text-slate-400 mt-1">Configure State-Wise Delivery Pricing, Minimum Free Shipping & Official UPI Details</p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. SETTINGS → SHIPPING (STATE-WISE PRICING MANAGER) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <Truck size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-lg">Settings → Shipping & Delivery Pricing</h2>
            <p className="text-xs text-slate-400">Configure state-wise delivery charges & minimum free shipping threshold</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div className="sm:col-span-2 lg:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="block text-slate-300 font-bold mb-1">Minimum Free Shipping Order Threshold (₹) *</label>
            <input
              type="number"
              required
              value={freeShippingAbove}
              onChange={(e) => setFreeShippingAbove(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 font-extrabold"
            />
            <p className="text-[11px] text-slate-500 mt-1">Orders with subtotal above this amount get FREE delivery.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Andhra Pradesh Delivery Charge (₹)</label>
            <input
              type="number"
              required
              value={stateRates['Andhra Pradesh'] || 150}
              onChange={(e) => handleStateRateChange('Andhra Pradesh', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Telangana Delivery Charge (₹)</label>
            <input
              type="number"
              required
              value={stateRates['Telangana'] || 150}
              onChange={(e) => handleStateRateChange('Telangana', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Tamil Nadu Delivery Charge (₹)</label>
            <input
              type="number"
              required
              value={stateRates['Tamil Nadu'] || 180}
              onChange={(e) => handleStateRateChange('Tamil Nadu', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Karnataka Delivery Charge (₹)</label>
            <input
              type="number"
              required
              value={stateRates['Karnataka'] || 180}
              onChange={(e) => handleStateRateChange('Karnataka', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Kerala Delivery Charge (₹)</label>
            <input
              type="number"
              required
              value={stateRates['Kerala'] || 200}
              onChange={(e) => handleStateRateChange('Kerala', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Other States Delivery Charge (₹)</label>
            <input
              type="number"
              required
              value={stateRates['Other States'] || 200}
              onChange={(e) => handleStateRateChange('Other States', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

        </div>
      </div>

      {/* 2. OFFICIAL MANUAL UPI PAYMENT ACCOUNT SETTINGS */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-lg">Official Store UPI Payment Details</h2>
            <p className="text-xs text-slate-400">Displayed to customers during express checkout step</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Official Account Name *</label>
            <input
              type="text"
              required
              value={upiAccountName}
              onChange={(e) => setUpiAccountName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Official Contact Number *</label>
            <input
              type="text"
              required
              value={upiMobile}
              onChange={(e) => setUpiMobile(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Official UPI ID *</label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">QR Code Image Path / URL *</label>
            <input
              type="text"
              required
              value={upiQrCodeUrl}
              onChange={(e) => setUpiQrCodeUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. STORE GENERAL SETTINGS FORM */}
      <form onSubmit={handleSaveStoreSettings} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <Store size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-lg">General Store Settings</h2>
            <p className="text-xs text-slate-400">Configure official contact numbers & SEO</p>
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
            <label className="block text-slate-300 font-bold mb-1">WhatsApp Support Number *</label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Customer Helpline Phone *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Support Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
        >
          <Save size={16} /> Save All Store & Shipping Configuration Changes
        </button>

      </form>

    </div>
  );
}
