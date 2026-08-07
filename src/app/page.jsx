'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

import HeroBanner from '@/components/home/HeroBanner';
import AnimatedSearchBar from '@/components/home/AnimatedSearchBar';
import FloatingCornerElements from '@/components/home/FloatingCornerElements';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const { products = [] } = useStore();

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

      {/* 1. HERO BANNER SLIDER */}
      <HeroBanner />

      {/* 2. LARGE PREMIUM SEARCH BAR */}
      <AnimatedSearchBar />

      {/* 3. NEW ARRIVALS (ONLY ONE HORIZONTAL SCROLL PRODUCT SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Clean, Non-Repetitive Section Header */}
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

        {/* Horizontal Scrolling Products (Never Duplicated) */}
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

        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition"
          >
            <span>Explore Complete Store Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </section>

    </div>
  );
}
