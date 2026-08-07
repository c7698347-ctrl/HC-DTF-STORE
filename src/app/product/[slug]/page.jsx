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
  Package,
  Wrench,
  Check,
  Award
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products = [], addToCart, wishlist = [], toggleWishlist, moveToBuyLater } = useStore();

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
  const isHeatPress = product.category === 'HEAT PRESS MACHINES' || product.categoryId === 'cat-heatpress';

  const displayPrice = product.price || product.originalPrice || 0;
  const offerPrice = product.offerPrice || displayPrice;
  const discountPct = product.discountPercent || (displayPrice > offerPrice ? Math.round(((displayPrice - offerPrice) / displayPrice) * 100) : 0);

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['/images/juke_heat_press_16x24.png'];

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

  const getHeatPressWhatsAppUrl = () => {
    const is1624 = product.name.includes('16×24') || product.name.includes('16x24');
    const text = `Hello HC DTF STORE 👋\n\nI want to purchase\n\nJUKE Heat Press Machine\n\nModel:\n${
      is1624 ? '☑ 16×24\n□ 16×32' : '□ 16×24\n☑ 16×32'
    }\n\nPlease provide complete details.`;
    return `https://wa.me/917207528651?text=${encodeURIComponent(text)}`;
  };

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
              className={`relative aspect-square rounded-3xl overflow-hidden border border-slate-200 cursor-crosshair shadow-md ${
                isHeatPress ? 'bg-white p-6 flex items-center justify-center' : 'bg-slate-100'
              }`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img src={imagesList[activeImgIndex] || imagesList[0]} alt={product.name} className="w-full h-full object-contain" />
              <div 
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={zoomStyle}
              />
              <span className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <Maximize2 size={14} /> Hover Image for HD Zoom
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
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain p-1" />
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
              <p className="text-xs text-slate-500 mt-1">Brand: JUKE Commercial Machinery</p>
            </div>

            {/* Price Box */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-slate-900">₹{offerPrice.toLocaleString()}</span>
                {displayPrice > offerPrice && (
                  <span className="text-base text-slate-400 line-through">₹{displayPrice.toLocaleString()}</span>
                )}
                {discountPct > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Heavy Duty Commercial Equipment • Ships Across India</span>
              </p>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Stock Status: {product.stock || 50} Units Available in Factory Warehouse</span>
            </div>

            {/* Actions */}
            {isHeatPress ? (
              <div className="space-y-3">
                <a
                  href={getHeatPressWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 hover:scale-[1.01] transition duration-200"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Buy Now via WhatsApp (+91 7207528651)</span>
                </a>
              </div>
            ) : (
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
              </div>
            )}

            {/* Specifications & Technical Warranty Box */}
            {isHeatPress && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Wrench size={16} /> Machine Specifications & Features
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Machine Platen Size</span>
                    <strong className="text-white text-sm">{product.specifications?.size || (product.name.includes('16×32') ? '16×32 Inches' : '16×24 Inches')}</strong>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Operating Voltage</span>
                    <strong className="text-white text-sm">220V / 50Hz Standard</strong>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Heating Technology</span>
                    <strong className="text-white">Aluminium Teflon Coated</strong>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Digital Temp / Timer</span>
                    <strong className="text-white">0–399°C / 0–999 Sec</strong>
                  </div>
                </div>

                {/* Technical Warranty Section */}
                <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-800/80 flex items-start gap-3">
                  <Award size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-emerald-300 block">1 Year Technical Support Warranty</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Includes 1 year factory warranty on heating element and digital control board. Technical guidance provided.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Product Overview</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </div>

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200 pt-12 space-y-6">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">Related DTF Equipment</h3>
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
