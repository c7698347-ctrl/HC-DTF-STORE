'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function PublicCategoriesPage() {
  const { categories } = useStore();

  const activeCategories = categories.filter((c) => c.enabled !== false);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
            <Layers size={14} /> Full Print Taxonomy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Product Categories</h1>
          <p className="text-xs sm:text-sm text-emerald-200">
            Browse our complete DTF printing catalog categories and subcategories.
          </p>
        </div>

        {/* Categories Grid */}
        {activeCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-3">
            <Package size={40} className="mx-auto text-slate-300" />
            <h3 className="font-extrabold text-slate-900 text-base">No categories found.</h3>
            <p className="text-xs text-slate-500">Store admin has not created any product categories in the database yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-lg">{cat.name}</h3>
                  <Link
                    href={`/shop?cat=${encodeURIComponent(cat.name)}`}
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition"
                    title="View Products"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {cat.description && (
                  <p className="text-xs text-slate-500">{cat.description}</p>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subcategories:</span>
                  {!cat.subcategories || cat.subcategories.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No subcategories available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/shop?cat=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
