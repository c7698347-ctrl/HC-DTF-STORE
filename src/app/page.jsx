'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, Layers, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

import HeroBanner from '@/components/home/HeroBanner';
import FlashSale from '@/components/home/FlashSale';
import ShopByCategory from '@/components/home/ShopByCategory';
import FAQSection from '@/components/home/FAQSection';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const { products, t } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  // Filter published active products from single products database
  const publishedProducts = products.filter((p) => p.status !== 'Draft' && p.enabled !== false);

  const getActiveTabProducts = () => {
    if (activeTab === 'trending') {
      return publishedProducts.filter(p => p.isTrending || p.rating >= 4.5);
    }
    if (activeTab === 'bestsellers') {
      return publishedProducts.filter(p => p.isBestSeller || (p.stock || 0) > 0);
    }
    if (activeTab === 'premium') {
      return publishedProducts.filter(p => p.isPremium || p.price >= 499);
    }
    return publishedProducts;
  };

  const activeProducts = getActiveTabProducts();

  return (
    <div className="space-y-12">
      
      {/* 1. Hero Banner Slider */}
      <HeroBanner />

      {/* 2. Flash Sale Section with Countdown Timer */}
      <FlashSale />

      {/* 3. Shop By Category Visual Grid */}
      <ShopByCategory />

      {/* 4. Main Product Showcase Tabs */}
      <section className="py-12 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Curated DTF Collections ({publishedProducts.length} Live Items)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">2400 DPI High-Density DTF transfer sheets, maggam prints & zari borders</p>
            </div>

            {/* Showcase Tabs Switcher */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Products
              </button>

              <button
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'trending' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trending
              </button>

              <button
                onClick={() => setActiveTab('bestsellers')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'bestsellers' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Best Sellers
              </button>

              <button
                onClick={() => setActiveTab('premium')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'premium' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Premium
              </button>
            </div>
          </div>

          {/* Product Cards Grid or Professional Empty State */}
          {activeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-2 max-w-md mx-auto shadow-sm">
              <Package size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-extrabold text-slate-900">No products available in database.</p>
              <p className="text-xs text-slate-500">Uploaded products will appear here immediately from the database.</p>
            </div>
          )}

          {activeProducts.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition"
              >
                <span>Explore Complete Catalog ({publishedProducts.length} Items)</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* 5. FAQ & Support */}
      <FAQSection />

    </div>
  );
}
