'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, Package, ShieldCheck, Truck, Star, RefreshCw, ThumbsUp } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

import HeroBanner from '@/components/home/HeroBanner';
import FlashSale from '@/components/home/FlashSale';
import FAQSection from '@/components/home/FAQSection';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const { products, t } = useStore();

  // Published active products from single products database
  const publishedProducts = (products || []).filter((p) => p.status !== 'Draft' && p.enabled !== false);

  const trendingProducts = publishedProducts.filter(p => p.isTrending || p.rating >= 4.5).slice(0, 4);
  const bestSellerProducts = publishedProducts.filter(p => p.isBestSeller || (p.stock || 0) > 0).slice(0, 4);
  const newArrivalProducts = publishedProducts.slice(0, 4);
  const recommendedProducts = publishedProducts.filter(p => p.isPremium || p.price >= 300).slice(0, 4);

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO BANNER SLIDER */}
      <HeroBanner />

      {/* 2. FLASH SALE SECTION */}
      <FlashSale />

      {/* 3. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              <TrendingUp size={14} /> Trending Now
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trending DTF Transfers
            </h2>
          </div>
          <Link href="/shop?filter=trending" className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.length > 0 ? (
            trendingProducts.map((prod) => <ProductCard key={prod.id} product={prod} />)
          ) : (
            publishedProducts.slice(0, 4).map((prod) => <ProductCard key={prod.id} product={prod} />)
          )}
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="bg-slate-900 py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold border border-amber-500/30">
                <Award size={14} /> Highest Demand
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Best Sellers Collection
              </h2>
            </div>
            <Link href="/shop?filter=bestseller" className="text-xs sm:text-sm font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Explore Best Sellers <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellerProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
              <Sparkles size={14} className="text-emerald-600" /> Factory Fresh
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link href="/shop?filter=new" className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            View New Release <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivalProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. RECOMMENDED PRODUCTS */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Recommended For You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">Handpicked 2400 DPI Metallic & Zari Blouse Transfer Collections</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Verified Testimonials
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">What Our Boutique Clients Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "The 3D Gold Zari maggam blouse transfer sheets are unbelievable quality! Pressed at 160°C for 15 seconds, and the color depth is stunning."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <strong className="text-slate-900">Sri Laxmi Boutique</strong>
              <span className="text-emerald-700 font-bold">Hyderabad, TS</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "Same-day dispatch is 100% real. Ordered 1 Meter gang roll in the morning and received tracking AWB by evening. Best DTF supplier in South India!"
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <strong className="text-slate-900">Venkata Garments</strong>
              <span className="text-emerald-700 font-bold">Vijayawada, AP</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "Washing durability is fantastic. Even after 40 commercial washes, the DTF stickers showed zero cracking or peeling. Very impressed."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <strong className="text-slate-900">Royal Fashion Studio</strong>
              <span className="text-emerald-700 font-bold">Bengaluru, KA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WHY CHOOSE HC DTF STORE */}
      <section className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white">Why Choose HC DTF STORE</h2>
            <p className="text-xs sm:text-sm text-slate-400">Direct factory manufacturer for textile printers, boutiques & garment brands</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
              <Award className="text-emerald-400" size={32} />
              <h3 className="font-extrabold text-sm text-white">2400 DPI Resolution</h3>
              <p className="text-xs text-slate-400">Japanese high-density RIP software printing with rich vibrant color gamut.</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
              <Truck className="text-emerald-400" size={32} />
              <div className="font-extrabold text-sm text-white">State-Wise Express Delivery</div>
              <p className="text-xs text-slate-400">AP/TS: ₹150 | TN/KA: ₹180 | Kerala & Others: ₹200. FREE above ₹999.</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
              <ShieldCheck className="text-emerald-400" size={32} />
              <h3 className="font-extrabold text-sm text-white">Prepaid Verification</h3>
              <p className="text-xs text-slate-400">Direct bank account verification for instant order printing confirmation.</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
              <ThumbsUp className="text-emerald-400" size={32} />
              <h3 className="font-extrabold text-sm text-white">50+ Wash Guarantee</h3>
              <p className="text-xs text-slate-400">TPU powder curing formula guarantees long-lasting stretch without cracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <FAQSection />

    </div>
  );
}
