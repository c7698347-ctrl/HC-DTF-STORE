'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function TrackOrderSearchPage() {
  const router = useRouter();
  const { orders } = useStore();
  const [orderQuery, setOrderQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    const q = orderQuery.trim().toUpperCase();
    const found = orders.find((o) => o.id.toUpperCase() === q || o.trackingNumber?.toUpperCase() === q);
    
    if (found) {
      router.push(`/track-order/${found.id}`);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Package size={30} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Track Order Progress</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter your Order ID (e.g. HC-ORD-1049) or Courier Tracking AWB Number to view 9-stage live factory & delivery tracking.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Enter Order ID (e.g. HC-ORD-1049)"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 font-bold uppercase text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="submit"
            className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <span>Track Order</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {searched && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2 max-w-md mx-auto">
            <p className="text-sm font-bold text-rose-600">Order ID or Tracking Number not found in database.</p>
            <p className="text-xs text-slate-500">Please verify your order number from your invoice or contact customer helpline at +91 98765 43210.</p>
          </div>
        )}

      </div>
    </div>
  );
}
