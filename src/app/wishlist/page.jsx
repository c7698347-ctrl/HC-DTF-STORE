'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, t } = useStore();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Heart size={24} className="fill-current" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900">{t('wishlist')}</h1>
            <p className="text-xs text-slate-500">{wishlist.length} saved DTF designs</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500">Save items by clicking the heart icon on any DTF sheet product card.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
