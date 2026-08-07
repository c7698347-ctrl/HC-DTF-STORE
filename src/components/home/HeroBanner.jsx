'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Premium DTF Transfers',
    subtitle: 'Ultra-HD 2400 DPI Garment Transfer Rolls & Gang Sheets',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'slide-2',
    title: 'Festival Collection',
    subtitle: 'Metallic Gold, Dussehra & Diwali Garment Transfer Prints',
    buttonText: 'Explore Collection',
    buttonLink: '/shop?cat=Festival',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'slide-3',
    title: 'Custom Printing',
    subtitle: 'Upload Your Custom Design Gang Sheet & Get Dispatch Within 1-3 Business Days',
    buttonText: 'Upload Your Design',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200'
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = HERO_SLIDES[currentSlide];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[520px] flex items-center justify-between">
      
      {/* Background Slides with Fixed Aspect Ratio & Crossfade */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-30 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-105"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 z-20 bg-radial-gradient from-emerald-600/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-30 py-16 sm:py-24">
        <div className="max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400 animate-spin" />
            <span>HC DTF STORE • Premium DTF Printing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight min-h-[72px]">
            {current.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl min-h-[48px]">
            {current.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={current.buttonLink}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 transition duration-300 flex items-center gap-2"
            >
              <span>{current.buttonText}</span>
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
              <p className="text-xl sm:text-2xl font-black text-emerald-400">25+ Washes</p>
              <p className="text-[11px] text-slate-400">Wash Durability</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">1-3 Days</p>
              <p className="text-[11px] text-slate-400">Fast Dispatch</p>
            </div>
          </div>

        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition shadow-lg"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs font-mono font-bold text-slate-300 px-2">
          {currentSlide + 1} / {HERO_SLIDES.length}
        </span>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition shadow-lg"
          aria-label="Next Slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

    </section>
  );
}
