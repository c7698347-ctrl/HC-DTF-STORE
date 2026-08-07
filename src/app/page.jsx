'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

import HeroBanner from '@/components/home/HeroBanner';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const { products = [] } = useStore();

  // Filter published active products from single products database
  const publishedProducts = (products || []).filter((p) => p.status !== 'Draft' && p.enabled !== false);

  // Ensure 4 non-overlapping sets of 8-10 distinct products
  const trendingProducts = publishedProducts.slice(0, 8);
  const bestSellerProducts = publishedProducts.slice(4, 12).length >= 4 ? publishedProducts.slice(4, 12) : publishedProducts.slice(0, 8);
  const newArrivalProducts = publishedProducts.slice(8, 16).length >= 4 ? publishedProducts.slice(8, 16) : publishedProducts.slice(2, 10);
  const recommendedProducts = publishedProducts.filter(p => p.isPremium || p.price >= 300).slice(0, 8);

  const trendingRef = useRef(null);
  const bestSellerRef = useRef(null);
  const newArrivalRef = useRef(null);
  const recommendedRef = useRef(null);

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 pb-16 bg-[#FAFBFB]">
      
      {/* 1. HERO BANNER SLIDER */}
      <HeroBanner />

      {/* 2. TRENDING PRODUCTS (HORIZONTAL SCROLL 8-10 PRODUCTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              <TrendingUp size={14} /> Trending Now
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trending Products
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollLeft(trendingRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollRight(trendingRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={trendingRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
        >
          {trendingProducts.map((prod) => (
            <div key={`trending-${prod.id}`} className="min-w-[260px] sm:min-w-[290px] max-w-[290px] shrink-0 snap-start">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS (HORIZONTAL SCROLL 8-10 PRODUCTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-200">
              <Award size={14} className="text-amber-600" /> Best Sellers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Best Sellers
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollLeft(bestSellerRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollRight(bestSellerRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={bestSellerRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
        >
          {bestSellerProducts.map((prod) => (
            <div key={`bestseller-${prod.id}`} className="min-w-[260px] sm:min-w-[290px] max-w-[290px] shrink-0 snap-start">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS (HORIZONTAL SCROLL 8-10 PRODUCTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
              <Sparkles size={14} className="text-emerald-600" /> New Arrivals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              New Arrivals
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollLeft(newArrivalRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollRight(newArrivalRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={newArrivalRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
        >
          {newArrivalProducts.map((prod) => (
            <div key={`new-${prod.id}`} className="min-w-[260px] sm:min-w-[290px] max-w-[290px] shrink-0 snap-start">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECOMMENDED FOR YOU (AI PERSONALIZED, HORIZONTAL SCROLL 8-10 PRODUCTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
              <Sparkles size={14} className="text-emerald-600 animate-spin" /> Recommended For You
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Recommended For You
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollLeft(recommendedRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollRight(recommendedRef)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={recommendedRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
        >
          {recommendedProducts.map((prod) => (
            <div key={`recommended-${prod.id}`} className="min-w-[260px] sm:min-w-[290px] max-w-[290px] shrink-0 snap-start">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
