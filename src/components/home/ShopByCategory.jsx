'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Package, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ShopByCategory() {
  const { categories, t } = useStore();

  const activeCategories = categories.filter((c) => c.enabled !== false);

  if (activeCategories.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
              <Layers size={14} /> Catalog Architecture
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('shopByCategory')}
            </h2>
          </div>

          <Link
            href="/categories"
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>Explore All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid (Admin-Created Categories ONLY) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCategories.map((cat) => (
            <div
              key={cat.id}
              className="group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between p-6 h-64"
            >
              {/* Category Background Image */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex items-center justify-center opacity-70">
                  <Package size={48} className="text-emerald-700/40" />
                </div>
              )}

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Top Header Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/30">
                  Category Entity
                </span>

                <Link
                  href={`/shop?cat=${encodeURIComponent(cat.name)}`}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md transition"
                  title={`View ${cat.name} Products`}
                >
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Bottom Content & Subcategories */}
              <div className="relative z-10 space-y-2">
                <Link href={`/shop?cat=${encodeURIComponent(cat.name)}`} className="block">
                  <h3 className="font-black text-white text-xl sm:text-2xl group-hover:text-emerald-300 transition tracking-tight">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-slate-300 line-clamp-1 opacity-90">{cat.description}</p>
                  )}
                </Link>

                {/* Subcategory Pills */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 3).map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/shop?cat=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`}
                        className="text-[10px] font-bold text-slate-200 bg-white/10 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg backdrop-blur-sm transition border border-white/10"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <Link
                        href={`/shop?cat=${encodeURIComponent(cat.name)}`}
                        className="text-[10px] font-bold text-emerald-300 hover:underline py-1 px-1"
                      >
                        +{cat.subcategories.length - 3} more
                      </Link>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
