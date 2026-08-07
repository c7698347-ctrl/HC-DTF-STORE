'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const DEFAULT_HERO_BANNERS = [
  {
    id: 'banner-1',
    title: 'Premium DTF Prints',
    subtitle: 'Ultra-HD 2400 DPI Garment Transfer Rolls & Gang Sheets',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'banner-2',
    title: 'Festival Collection',
    subtitle: 'Metallic Gold, Dussehra & Diwali Garment Transfer Prints',
    buttonText: 'Explore',
    buttonLink: '/shop?cat=Festival',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'banner-3',
    title: 'Custom DTF Printing',
    subtitle: 'Upload Your Custom Design Gang Sheet & Get Express Same-Day Dispatch',
    buttonText: 'Upload Design',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200'
  }
];

export default function HeroBanner() {
  const { banners = [] } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const displayBanners = (Array.isArray(banners) && banners.filter((b) => b.active).length > 0)
    ? banners.filter((b) => b.active)
    : DEFAULT_HERO_BANNERS;

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const current = displayBanners[currentSlide];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 md:py-24 text-white">
      {/* Background Image with Dark Gradient Transition */}
      <div className="absolute inset-0 z-0">
        <img
          key={current.id || currentSlide}
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover opacity-30 transition-all duration-700 ease-in-out scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-emerald-600/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400 animate-spin" />
            <span>HC DTF STORE • Premium DTF Printing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            {current.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {current.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={current.buttonLink || '/shop'}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 transition duration-300 flex items-center gap-2"
            >
              <span>{current.buttonText || 'Shop Now'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">2400 DPI</p>
              <p className="text-[11px] text-slate-400">Ultra-HD Quality</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">50+ Washes</p>
              <p className="text-[11px] text-slate-400">Wash Durability</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">Same-Day</p>
              <p className="text-[11px] text-slate-400">Express Dispatch</p>
            </div>
          </div>

        </div>
      </div>

      {/* Slider Controls */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length)}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition shadow-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 px-2">
            {currentSlide + 1} / {displayBanners.length}
          </span>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % displayBanners.length)}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition shadow-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

    </section>
  );
}
