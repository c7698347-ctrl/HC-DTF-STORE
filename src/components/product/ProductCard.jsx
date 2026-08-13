'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Star, Share2, Check } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ProductCard({ product }) {
  const { 
    addToCart, 
    wishlist, 
    toggleWishlist
  } = useStore();

  const [copied, setCopied] = useState(false);

  const isWishlisted = (wishlist || []).some((item) => item.id === product.id);

  const displayPrice = product.price || product.originalPrice || 0;
  const offerPrice = product.offerPrice || displayPrice;
  const discountPct = product.discountPercent || (displayPrice > offerPrice ? Math.round(((displayPrice - offerPrice) / displayPrice) * 100) : 0);

  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/product/${product.slug || product.id}`
    : `/product/${product.slug || product.id}`;

  const handleShareProduct = (e) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: `🔥 Check out this DTF Design on HC DTF STORE: ${product.name} - ₹${offerPrice}`,
      url: productUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col group relative border border-slate-200/80 bg-white hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
      
      {/* Top Image Container - Clicking Navigates Directly to Product Detail Page */}
      <Link href={`/product/${product.slug || product.id}`} className="relative aspect-[4/3] bg-slate-100 overflow-hidden block">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Discount Badge */}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md shadow-emerald-950/20">
            {discountPct}% OFF
          </span>
        )}

        {/* Stock Status Badge */}
        <span className={`absolute bottom-3 left-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm ${
          product.stock > 10 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
            : product.stock > 0 
            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
            : 'bg-rose-100 text-rose-800 border border-rose-300'
        }`}>
          {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} Left` : 'Out of Stock'}
        </span>

        {/* Top Right Floating Action Icons: Wishlist & Share */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={handleShareProduct}
            className="p-2 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-emerald-600 backdrop-blur-md transition shadow-sm"
            title={copied ? 'Link Copied!' : 'Share Product'}
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
              isWishlisted 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' 
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Eye Hover Overlay - Directly Links to Product Page */}
        <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 justify-end">
          <span
            className="p-2 bg-slate-900/90 text-white text-xs font-bold rounded-xl backdrop-blur-sm flex items-center justify-center gap-1 shadow-lg"
          >
            <Eye size={16} /> View Details
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
              {product.category || 'DTF Sheet'}
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={12} className="fill-current" /> {product.rating || '5.0'}
            </span>
          </div>

          <Link href={`/product/${product.slug || product.id}`}>
            <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 hover:text-emerald-600 transition leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add To Cart Button */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">₹{offerPrice}</span>
              {displayPrice > offerPrice && (
                <span className="text-xs text-slate-400 line-through">₹{displayPrice}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">Factory Direct Price</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={product.stock <= 0}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition ${
              product.stock > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Add</span>
          </button>
        </div>

      </div>
    </div>
  );
}
