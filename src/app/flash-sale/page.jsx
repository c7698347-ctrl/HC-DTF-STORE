'use client';

import React from 'react';
import { Flame, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';

export default function FlashSalePage() {
  const { products, t } = useStore();

  const flashSaleProducts = products.filter((p) => p.status !== 'Draft' && p.enabled !== false);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-gradient-to-r from-amber-500 via-emerald-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
            <Flame size={36} className="animate-bounce" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-black">{t('flashSale')} Exclusive Deals</h1>
            <p className="text-xs sm:text-sm text-amber-200 mt-1">
              Factory direct offers on 1 Meter DTF Print sheets (22×39) and ready-to-press patches
            </p>
          </div>
        </div>

        {flashSaleProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-3">
            <Package size={40} className="mx-auto text-slate-300" />
            <h3 className="font-extrabold text-slate-900 text-base">No flash sales active.</h3>
            <p className="text-xs text-slate-500">Check back soon for exclusive limited-time deals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
