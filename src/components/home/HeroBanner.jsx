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
    subtitle: 'Upload Your Custom Design Gang Sheet & Get Fast Delivery Across India',
    buttonText: 'Order Custom Gang Roll',
    buttonLink: 'whatsapp',
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

  const whatsappMessage = `Hello HC DTF STORE 👋\n\nI want to place a Custom Gang Roll order.\n\nSize:\nDesign Count:\nQuantity:\n\nPlease guide me.`;
  const whatsappUrl = `https://wa.me/917207528651?text=${encodeURIComponent(whatsappMessage)}`;

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
            {current.buttonLink === 'whatsapp' ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 transition duration-300 flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{current.buttonText}</span>
              </a>
            ) : (
              <Link
                href={current.buttonLink}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 transition duration-300 flex items-center gap-2"
              >
                <span>{current.buttonText}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md transition"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

    </section>
  );
}
