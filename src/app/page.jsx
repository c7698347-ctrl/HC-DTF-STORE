'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

import HeroBanner from '@/components/home/HeroBanner';
import AnimatedSearchBar from '@/components/home/AnimatedSearchBar';
import FloatingCornerElements from '@/components/home/FloatingCornerElements';
import ProductCard from '@/components/product/ProductCard';
import WhyChooseUs from '@/components/home/WhyChooseUs';

export default function HomePage() {
  const { products = [], categories = [] } = useStore();

  // Published active products from single products database
  const publishedProducts = (products || []).filter((p) => p.status !== 'Draft' && p.enabled !== false);

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-16 bg-[#FAFBFB] relative min-h-screen">
      
      {/* Corner Floating Micro-Animations */}
      <FloatingCornerElements />

      {/* 1. HERO BANNER */}
      <HeroBanner />

      {/* 2. LARGE SEARCH BAR */}
      <AnimatedSearchBar />

      {/* 3. FEATURED BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-emerald-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 relative z-10 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-700/50">
              Custom Meter Gang Sheets
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Order Custom 22×39 & 12×39 Ready To Print Rolls
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Upload your high-res design files and get factory inspected DTF transfer sheets shipped directly across India.
            </p>
            <div className="pt-2">
              <Link
                href="/shop?cat=Custom+Printing"
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/30 inline-flex items-center gap-2 transition"
              >
                <span>Order Custom Gang Roll</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="shrink-0 relative z-10">
            <div className="w-48 h-36 bg-slate-900/80 rounded-2xl border border-emerald-500/30 p-4 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase">2400 DPI Ultra HD</span>
                <Layers size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-black text-white">100% Quality Checked</p>
                <p className="text-[11px] text-slate-400">25+ Wash Durability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              NEW ARRIVALS
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold hidden sm:inline-block">
              {publishedProducts.length} Items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {publishedProducts.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none pb-6 pt-1 scroll-smooth snap-x snap-mandatory"
          >
            {publishedProducts.map((prod) => (
              <div key={prod.id} className="min-w-[270px] sm:min-w-[300px] max-w-[300px] shrink-0 snap-start">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center space-y-2 border border-slate-200 max-w-md mx-auto shadow-sm">
            <p className="text-sm font-extrabold text-slate-900">No products uploaded yet.</p>
            <p className="text-xs text-slate-500">Products uploaded in Admin Panel will appear here automatically.</p>
          </div>
        )}
      </section>

      {/* 5. COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            COLLECTIONS
          </h2>
          <Link href="/shop" className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            Browse All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?cat=${encodeURIComponent(cat.name)}`}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition group space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition">
                  {cat.name}
                </span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {cat.description || 'Explore factory direct DTF transfers'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <WhyChooseUs />

    </div>
  );
}
