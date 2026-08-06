'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Zap, 
  Check, 
  Star, 
  ShieldCheck, 
  Truck, 
  Clock, 
  RotateCcw,
  Maximize2,
  Bookmark
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ProductDetailModal() {
  const router = useRouter();
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    wishlist, 
    toggleWishlist,
    moveToBuyLater,
    products,
    t 
  } = useStore();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const isWishlisted = wishlist.some((item) => item.id === selectedProduct.id);

  // Fallback image list to guarantee minimum 5 preview images
  const previewImages = [
    selectedProduct.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000',
    selectedProduct.images[1] || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000',
    selectedProduct.images[2] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000',
    selectedProduct.images[3] || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=1000',
    selectedProduct.images[4] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1000'
  ];

  // Mouse hover zoom calculations
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${previewImages[activeImgIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '220%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    router.push('/checkout');
  };

  // Find related products in same category
  const relatedProducts = products.filter(
    (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setSelectedProduct(null)}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-emerald-400 font-bold">{selectedProduct.category}</span>
            <span>/</span>
            <span>{selectedProduct.subcategory}</span>
          </div>
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Image Gallery with Interactive Zoom */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 cursor-crosshair group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={previewImages[activeImgIndex]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />

              {/* Magnifier Zoom Layer */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl shadow-inner transition-all duration-75"
                style={zoomStyle}
              />

              <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 pointer-events-none">
                <Maximize2 size={12} /> Hover to Zoom
              </span>
            </div>

            {/* Minimum 5 Preview Images Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {previewImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                    activeImgIndex === idx 
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details & Pricing */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedProduct.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <Star size={14} className="fill-current" /> {selectedProduct.rating || '4.9'} ({selectedProduct.reviewCount || 100}+ reviews)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {selectedProduct.name}
              </h2>

              <p className="text-xs text-slate-500 mt-1">Subcategory: {selectedProduct.subcategory}</p>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900">₹{selectedProduct.offerPrice}</span>
                <span className="text-sm text-slate-400 line-through">₹{selectedProduct.originalPrice}</span>
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  {selectedProduct.discount}% OFF
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Check size={14} className="text-emerald-600" /> Price includes 18% GST • Same-Day Express Dispatch
              </p>
            </div>

            {/* Stock Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-700">In Stock ({selectedProduct.stock || 120} Rolls Available)</span>
            </div>

            {/* Quantity Selector & Main CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:text-emerald-600"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:text-emerald-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addToCart(selectedProduct, quantity)}
                  className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <Zap size={16} />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Wishlist & Save for Later buttons */}
              <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                <button
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition ${
                    isWishlisted ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={() => {
                    moveToBuyLater(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 py-1.5 px-3 rounded-lg transition"
                >
                  <Bookmark size={16} />
                  <span>Save for Later</span>
                </button>
              </div>
            </div>

            {/* Description & Technical Specs */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Product Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedProduct.description}</p>

              {selectedProduct.specifications && (
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">Technical Specifications</h4>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-200 text-xs">
                    {selectedProduct.specifications.map((spec, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between">
                        <span className="text-slate-500 font-medium">{spec.key}</span>
                        <span className="text-slate-900 font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
