'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';

export default function FlashSale() {
  const { products, settings, flashSale, t } = useStore();
  
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!settings.flashSaleEndTime) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(settings.flashSaleEndTime).getTime();
      const diff = Math.max(0, endTime - now);

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.flashSaleEndTime]);

  const flashSaleProducts = products.filter((p) => p.isFlashSale && p.enabled !== false).slice(0, 4);

  if (!settings.flashSaleEnabled || !flashSale?.enabled || flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 via-emerald-50/40 to-white border-y border-amber-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Flash Header & Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Flame size={26} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                {flashSale.title || t('flashSale')}
              </h2>
              <p className="text-xs text-slate-600">Limited time discounts on DTF print sheets & patches</p>
            </div>
          </div>

          {/* Dynamic Countdown Timer Boxes */}
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl">
            <Clock size={16} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-300 mr-1">{t('offerEndsIn')}</span>
            <div className="flex items-center gap-1 font-black text-sm">
              <span className="bg-slate-800 text-amber-400 px-2 py-1 rounded-md">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-slate-800 text-amber-400 px-2 py-1 rounded-md">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-slate-800 text-amber-400 px-2 py-1 rounded-md">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/flash-sale"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            <span>View All Flash Sale Deals</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
