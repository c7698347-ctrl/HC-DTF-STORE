'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Maximize2,
  Bookmark,
  Package
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products = [], addToCart, wishlist = [], toggleWishlist, moveToBuyLater, t } = useStore();

  const slugOrId = params?.slug;
  const product = products.find((p) => p.slug === slugOrId || p.id === slugOrId) || products[0];

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  if (!product) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-sm">
          <Package size={44} className="mx-auto text-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500">The requested product design is not available in the store database.</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:bg-emerald-700 transition"
          >
            Explore All Products
          </button>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const displayPrice = product.price || product.originalPrice || 0;
  const offerPrice = product.offerPrice || displayPrice;
  const discountPct = product.discountPercent || (displayPrice > offerPrice ? Math.round(((displayPrice - offerPrice) / displayPrice) * 100) : 0);

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000'];

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imagesList[activeImgIndex] || imagesList[0]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '220%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span>/</span>
          <span className="hover:underline cursor-pointer" onClick={() => router.push(`/shop?cat=${encodeURIComponent(product.category || '')}`)}>
            {product.category || 'Category'}
          </span>
          <span>/</span>
          <span className="text-slate-900 font-bold">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Preview Images + Zoom */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 cursor-crosshair shadow-md"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img src={imagesList[activeImgIndex] || imagesList[0]} alt={product.name} className="w-full h-full object-cover" />
              <div 
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={zoomStyle}
              />
              <span className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <Maximize2 size={14} /> Hover Image for 2400 DPI HD Zoom
              </span>
            </div>

            {/* Thumbnails */}
            {imagesList.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${
                      activeImgIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Purchase */}
          <div className="space-y-6">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category || 'DTF Sheet'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">Subcategory: {product.subcategory || 'General'}</p>
            </div>

            {/* Price Box */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-slate-900">₹{offerPrice}</span>
                {displayPrice > offerPrice && (
                  <span className="text-base text-slate-400 line-through">₹{displayPrice}</span>
                )}
                {discountPct > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Price includes 18% GST • Same-Day Dispatch Across India</span>
              </p>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Factory Stock Ready: {product.stock || 100} Rolls Available</span>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 font-bold text-slate-600">-</button>
                  <span className="w-10 text-center text-xs font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 font-bold text-slate-600">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>

                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    router.push('/checkout');
                  }}
                  className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition"
                >
                  <Zap size={18} /> Buy Now
                </button>
              </div>

              <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 pt-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-1.5 ${isWishlisted ? 'text-rose-600' : 'hover:text-rose-600'}`}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button onClick={() => moveToBuyLater(product)} className="flex items-center gap-1.5 hover:text-emerald-600">
                  <Bookmark size={16} /> Save for Later
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{product.description || 'High-density 2400 DPI DTF transfer sheet.'}</p>
            </div>

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200 pt-12 space-y-6">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">Related DTF Collections</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
