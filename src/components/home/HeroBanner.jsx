'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HeroBanner() {
  const { banners, settings } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = banners.filter((b) => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!settings.bannerEnabled || activeBanners.length === 0) return null;

  const current = activeBanners[currentSlide];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-12 md:py-20 text-white">
      {/* Background Image with Dark Emerald Overlay Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover opacity-35 transition-all duration-700 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-emerald-600/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400 animate-spin" />
            <span>Official Factory Direct-To-Film Transfer Sheets</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {current.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {current.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={current.buttonLink || '/shop'}
              className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 transition duration-300 flex items-center gap-2"
            >
              <span>{current.buttonText || 'Shop DTF Sheets'}</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/shop?cat=Blouse+Designs"
              className="px-7 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm border border-slate-700 backdrop-blur-md transition duration-300"
            >
              Browse Blouse Necklines
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">2400 DPI</p>
              <p className="text-[11px] text-slate-400">HD Resolution</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">50+ Washes</p>
              <p className="text-[11px] text-slate-400">Ultra Durability</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">Same-Day</p>
              <p className="text-[11px] text-slate-400">Express Dispatch</p>
            </div>
          </div>

        </div>
      </div>

      {/* Slider Controls */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-bold text-slate-300 px-2">
            {currentSlide + 1} / {activeBanners.length}
          </span>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

    </section>
  );
}
