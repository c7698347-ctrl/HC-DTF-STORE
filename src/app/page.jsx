'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Layers 
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

import HeroBanner from '@/components/home/HeroBanner';
import AnimatedSearchBar from '@/components/home/AnimatedSearchBar';
import FloatingCornerElements from '@/components/home/FloatingCornerElements';
import ProductCard from '@/components/product/ProductCard';
import HeatPressSection from '@/components/home/HeatPressSection';

export default function HomePage() {
  const { products = [] } = useStore();

  // Published active DTF products from store database (Single Source of Truth)
  const dtfProducts = (products || []).filter(
    (p) => p.status !== 'Draft' && p.enabled !== false && p.categoryId !== 'cat-heatpress' && p.category !== 'HEAT PRESS MACHINES'
  );

  // 4. NEW ARRIVALS (All published DTF products)
  const newArrivals = dtfProducts;

  // 5. 🔥 TRENDING PRODUCTS (Products marked trending/bestseller or all published DTF products)
  const trendingProductsList = dtfProducts.filter((p) => p.isTrending || p.isBestSeller);
  const finalTrendingProducts = trendingProductsList.length > 0 ? trendingProductsList : dtfProducts;

  // Scroll references for horizontal sliders
  const newArrivalsRef = useRef(null);
  const trendingRef = useRef(null);

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const whatsappGangRollMessage = `Hello HC DTF STORE 👋\n\nI want to place a Custom Gang Roll order.\n\nSize:\nDesign Count:\nQuantity:\n\nPlease guide me.`;
  const whatsappGangRollUrl = `https://wa.me/917207528651?text=${encodeURIComponent(whatsappGangRollMessage)}`;

  return (
    <div className="space-y-12 pb-16 bg-[#FAFBFB] relative min-h-screen">
      
      {/* Subtle Corner Micro-Animations */}
      <FloatingCornerElements />

      {/* 2. HERO BANNER SLIDER */}
      <HeroBanner />

      {/* 3. PREMIUM HOMEPAGE SEARCH BAR (WITH HISTORY, TRENDING & VOICE SEARCH) */}
      <AnimatedSearchBar />

      {/* 4. NEW ARRIVALS (FIRST PRODUCT SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-emerald-600" size={28} /> NEW ARRIVALS
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold hidden sm:inline-block">
              {newArrivals.length} Items
            </span>
          </div>

          {newArrivals.length > 3 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollSlider(newArrivalsRef, 'left')}
                className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
                title="Scroll Left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollSlider(newArrivalsRef, 'right')}
                className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
                title="Scroll Right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {newArrivals.length > 0 ? (
          <div
            ref={newArrivalsRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {newArrivals.map((prod) => (
              <div key={prod.id} className="w-full">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center space-y-2 border border-slate-200 max-w-md mx-auto shadow-sm">
            <p className="text-sm font-extrabold text-slate-900">No products uploaded yet.</p>
          </div>
        )}
      </section>

      {/* 5. 🔥 TRENDING PRODUCTS (SINGLE SECTION - ZERO DUPLICATES) */}
      {finalTrendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="text-rose-500" size={26} /> 🔥 TRENDING PRODUCTS
              </h2>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-extrabold hidden sm:inline-block">
                Most Popular
              </span>
            </div>

            {finalTrendingProducts.length > 3 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollSlider(trendingRef, 'left')}
                  className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
                  title="Scroll Left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollSlider(trendingRef, 'right')}
                  className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
                  title="Scroll Right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          <div
            ref={trendingRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {finalTrendingProducts.map((prod) => (
              <div key={prod.id} className="w-full">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. CUSTOM GANG SHEETS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 relative z-10 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-700/50">
              Custom Meter Gang Sheets
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Need Custom Meter Prints? Order on WhatsApp
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Send your design files directly on WhatsApp (+91 7207528651) for 22×39 & 12×39 ready-to-print meter gang rolls.
            </p>
            <div className="pt-2">
              <a
                href={whatsappGangRollUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 inline-flex items-center gap-2.5 hover:scale-105 transition duration-300"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Order on WhatsApp</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="shrink-0 relative z-10">
            <div className="w-44 h-32 bg-slate-900/80 rounded-2xl border border-emerald-500/30 p-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase">2400 DPI Ultra HD</span>
                <Layers size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-base font-black text-white">100% Quality Checked</p>
                <p className="text-[10px] text-slate-400">25+ Wash Durability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. JUKE HEAT PRESS MACHINES BANNER */}
      <HeatPressSection />

    </div>
  );
}
