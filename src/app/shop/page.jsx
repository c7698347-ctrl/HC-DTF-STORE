'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Search, RefreshCw, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';
import { DEFAULT_CATEGORIES } from '@/lib/store';

function ShopContent() {
  const searchParams = useSearchParams();
  const { products, t } = useStore();

  const [selectedCatId, setSelectedCatId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('cat');
    const search = searchParams.get('search');

    if (cat) {
      // Find matching default category ID or name case-insensitively
      const target = DEFAULT_CATEGORIES.find(
        (c) => c.id === cat || c.name.toLowerCase() === cat.toLowerCase() || c.slug === cat.toLowerCase()
      );
      if (target) {
        setSelectedCatId(target.id);
      }
    }
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Filtering logic strictly matching published products
  let filtered = products.filter((p) => {
    // Hide drafts if status is set to Draft
    if (p.status === 'Draft' || p.enabled === false) return false;

    // Filter by Category ID (Case-insensitive matching)
    if (selectedCatId) {
      const matchCatId = p.categoryId === selectedCatId;
      const targetCat = DEFAULT_CATEGORIES.find(c => c.id === selectedCatId);
      const matchCatName = targetCat && p.category?.toLowerCase() === targetCat.name.toLowerCase();
      if (!matchCatId && !matchCatName) return false;
    }

    // Filter by Stock
    if (inStockOnly && (p.stock || 0) <= 0) return false;

    // Search Engine: Product Name, Tags Array, Description, Category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchTags = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q));
      return matchName || matchCat || matchDesc || matchTags;
    }

    return true;
  });

  // Sorting logic
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
  }

  const resetFilters = () => {
    setSelectedCatId('');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
  };

  const activeCategoryObj = DEFAULT_CATEGORIES.find(c => c.id === selectedCatId);

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              {activeCategoryObj ? activeCategoryObj.name : 'Explore All DTF Products'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200">
              {activeCategoryObj ? activeCategoryObj.description : 'Factory direct 1 Meter sheets, maggam blouse prints, zari borders & stickers'}
            </p>
          </div>
        </div>

        {/* Filter Controls & Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-600" /> Filters
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>

            {/* Default System Categories Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Default Category</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-extrabold focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Categories ({products.length})</option>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Instant Live Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Instant Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, tags, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>

          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-semibold text-slate-600">
                Showing <strong className="text-slate-900">{filtered.length}</strong> items
              </p>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
                <Package size={40} className="mx-auto text-slate-400" />
                <p className="text-base font-bold text-slate-800">No products available in this category yet.</p>
                <p className="text-xs text-slate-500">Products uploaded by admin will appear here automatically.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading HC DTF Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
