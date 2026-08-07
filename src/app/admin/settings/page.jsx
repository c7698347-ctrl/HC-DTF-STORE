'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Truck, 
  Save, 
  CheckCircle2, 
  CreditCard,
  Flame,
  Wrench,
  Package,
  DollarSign
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { STATE_SHIPPING_RATES } from '@/lib/store';

export default function AdminSettingsPage() {
  const { 
    settings, 
    setSettings, 
    products = [],
    updateProduct
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

  // Homepage CMS & JUKE Machinery Controller State
  const [heatPressEnabled, setHeatPressEnabled] = useState(settings.heatPressSectionEnabled !== false);
  const [heatPressTitle, setHeatPressTitle] = useState(settings.heatPressTitle || '🔥 JUKE HEAT PRESS MACHINES');
  const [heatPressSubtitle, setHeatPressSubtitle] = useState(settings.heatPressSubtitle || 'Professional Heat Press Machines for DTF Printing');

  // Heat Press Products state
  const juke1624 = products.find(p => p.id === 'prod-juke-1624' || p.name?.includes('16×24')) || {};
  const juke1632 = products.find(p => p.id === 'prod-juke-1632' || p.name?.includes('16×32')) || {};

  const [price1624, setPrice1624] = useState(juke1624.price || 25000);
  const [stock1624, setStock1624] = useState(juke1624.stock ?? 50);
  
  const [price1632, setPrice1632] = useState(juke1632.price || 30000);
  const [stock1632, setStock1632] = useState(juke1632.stock ?? 50);

  const handleStateRateChange = (stateName, value) => {
    setStateRates((prev) => ({
      ...prev,
      [stateName]: Number(value) || 0
    }));
  };

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    
    // Save Settings
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
      seoDescription,
      heatPressSectionEnabled: heatPressEnabled,
      heatPressTitle,
      heatPressSubtitle
    });

    // Update Machinery Prices & Stock in Live Products Store
    if (juke1624.id && updateProduct) {
      updateProduct(juke1624.id, {
        price: Number(price1624),
        offerPrice: Number(price1624),
        stock: Number(stock1624)
      });
    }

    if (juke1632.id && updateProduct) {
      updateProduct(juke1632.id, {
        price: Number(price1632),
        offerPrice: Number(price1632),
        stock: Number(stock1632)
      });
    }

    setSavedMsg('Store configuration, Homepage CMS & JUKE Machinery inventory saved live!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-white">Settings → Store, Homepage CMS & JUKE Machinery</h1>
        <p className="text-xs text-slate-400 mt-1">Manage Homepage CMS, JUKE Heat Press Prices & Stock, Shipping Rates & Official UPI</p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. HOMEPAGE CMS & JUKE HEAT PRESS MACHINERY CONTROLLER */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg">Homepage CMS → JUKE Heat Press Machinery Section</h2>
              <p className="text-xs text-slate-400">Configure visibility, titles, live prices & stock levels</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
            <input
              type="checkbox"
              checked={heatPressEnabled}
              onChange={(e) => setHeatPressEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded"
            />
            <span className="text-xs font-extrabold text-white">
              {heatPressEnabled ? 'Section Enabled' : 'Section Hidden'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Homepage Section Title</label>
            <input
              type="text"
              value={heatPressTitle}
              onChange={(e) => setHeatPressTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Homepage Section Subtitle</label>
            <input
              type="text"
              value={heatPressSubtitle}
              onChange={(e) => setHeatPressSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium"
            />
          </div>
        </div>

        {/* Live Machinery Inventory & Price Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* JUKE 16x24 Management */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-white text-xs">JUKE Heat Press Machine 16×24</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Model: 16×24
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price1624}
                  onChange={(e) => setPrice1624(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Stock Available</label>
                <input
                  type="number"
                  value={stock1624}
                  onChange={(e) => setStock1624(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-extrabold"
                />
              </div>
            </div>
          </div>

          {/* JUKE 16x32 Management */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-white text-xs">JUKE Heat Press Machine 16×32</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Model: 16×32
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price1632}
                  onChange={(e) => setPrice1632(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Stock Available</label>
                <input
                  type="number"
                  value={stock1632}
                  onChange={(e) => setStock1632(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-extrabold"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SETTINGS → SHIPPING (STATE-WISE PRICING MANAGER) */}
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

      {/* 3. OFFICIAL MANUAL UPI PAYMENT ACCOUNT SETTINGS */}
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

      {/* 4. STORE GENERAL SETTINGS FORM */}
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
