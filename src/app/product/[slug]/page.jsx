'use client';

import React, { useState, useEffect } from 'react';
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
  Award,
  Share2,
  Star,
  Truck,
  RotateCcw,
  CheckCircle2,
  FileText,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Copy
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    products = [], 
    machines = [], 
    addToCart, 
    wishlist = [], 
    toggleWishlist,
    recentlyViewed = []
  } = useStore();

  const slugOrId = params?.slug;

  // Search product in products array or machines array
  const matchedProd = (products || []).find((p) => p.slug === slugOrId || p.id === slugOrId);
  const matchedMachine = (machines || []).find((m) => m.slug === slugOrId || m.id === slugOrId);

  const product = matchedProd || (matchedMachine ? {
    id: matchedMachine.id,
    name: matchedMachine.name,
    slug: matchedMachine.slug,
    category: 'HEAT PRESS MACHINES',
    categoryId: 'cat-heatpress',
    price: matchedMachine.price,
    offerPrice: matchedMachine.price,
    stock: matchedMachine.stock,
    rating: 5.0,
    images: [matchedMachine.image],
    description: matchedMachine.description,
    features: matchedMachine.features,
    voltage: matchedMachine.voltage,
    warranty: matchedMachine.warranty,
    size: matchedMachine.size
  } : products[0]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState('');
  const [activeTab, setActiveTab] = useState('specs');
  const [showLightbox, setShowLightbox] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review Form State
  const [reviews, setReviews] = useState([
    { id: 'rev-1', author: 'Rajesh Kumar', rating: 5, date: '2 days ago', text: 'Exceptional 2400 DPI print quality. Easy to press and vivid gold colors!' },
    { id: 'rev-2', author: 'Anita Tailors', rating: 5, date: '1 week ago', text: 'Loved the maggam blouse transfers. Saves us hours of manual handwork.' }
  ]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState('');

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
    : product.image ? [product.image] : ['/images/juke_heat_press_16x24.png'];

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug || product.id}` : '';

  const handleShareProduct = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on HC DTF STORE - ₹${offerPrice}`,
        url: productUrl
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setPincodeStatus(`Fast Delivery Available to ${pincode.trim()} • Quality Inspected`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit PIN code.');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;

    setReviews([
      {
        id: `rev_${Date.now()}`,
        author: newReviewAuthor.trim(),
        rating: Number(newReviewRating),
        date: 'Just now',
        text: newReviewText.trim()
      },
      ...reviews
    ]);

    setNewReviewAuthor('');
    setNewReviewText('');
    setReviewSuccess('Thank you! Your product review has been submitted.');
    setTimeout(() => setReviewSuccess(''), 3000);
  };

  const getHeatPressWhatsAppUrl = () => {
    const text = `Hello HC DTF STORE 👋\n\nI want to purchase\n\n${product.name}\n\nPlease provide complete details.`;
    return `https://wa.me/917207528651?text=${encodeURIComponent(text)}`;
  };

  // Similar products from same category
  const similarProducts = products.filter((p) => p.id !== product.id && (p.category === product.category || p.categoryId === product.categoryId)).slice(0, 8);

  return (
    <div className="py-10 bg-slate-50 min-h-screen pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span>/</span>
          <span className="hover:underline cursor-pointer" onClick={() => router.push(`/shop?cat=${encodeURIComponent(product.category || '')}`)}>
            {product.category || 'Category'}
          </span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* TOP MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* LEFT: IMAGE GALLERY WITH THUMBNAILS & LIGHTBOX */}
          <div className="space-y-4">
            {/* Main Preview Box */}
            <div className="relative aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 group">
              <img
                src={imagesList[activeImgIndex] || imagesList[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                onClick={() => setShowLightbox(true)}
              />

              {/* Discount Tag */}
              {discountPct > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                  {discountPct}% OFF
                </span>
              )}

              {/* Floating Lightbox Trigger */}
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute bottom-4 right-4 p-2.5 bg-slate-900/80 text-white rounded-2xl backdrop-blur-md hover:bg-slate-900 transition"
                title="Full Screen Preview"
              >
                <Maximize2 size={18} />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-20 h-20 rounded-2xl border-2 overflow-hidden bg-slate-100 shrink-0 transition ${
                      activeImgIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS, PRICES, PINCODE & ACTIONS */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category || 'DTF Transfer'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareProduct}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Share Product"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 rounded-full transition ${
                      isWishlisted ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-600'
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>

              {/* Title & SKU */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">SKU: SKU-HC-{product.id} • 2400 DPI Ultra-HD Printing</p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500 font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-slate-800">{product.rating || 5.0}</span>
                <span className="text-slate-400">• (128 Verified Ratings)</span>
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
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Quality Inspected • Fast Delivery Across India</span>
                </p>
              </div>

              {/* Stock Status Badge */}
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Stock Status: {product.stock || 50} Units Available in Factory Warehouse</span>
              </div>

              {/* PINCODE DELIVERY CHECKER */}
              <form onSubmit={handlePincodeCheck} className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">Check Delivery Pincode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus && (
                  <p className="text-xs font-bold text-emerald-700">{pincodeStatus}</p>
                )}
              </form>

              {/* ACTION BUTTONS: BUY NOW & ADD TO CART */}
              {isHeatPress ? (
                <div className="space-y-3 pt-2">
                  <a
                    href={getHeatPressWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 hover:scale-[1.01] transition duration-200"
                  >
                    <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>Order via WhatsApp (+91 7207528651)</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
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

            </div>
          </div>

        </div>

        {/* COMPREHENSIVE TABS: SPECIFICATIONS, REVIEWS & Q&A */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Tab Controls */}
          <div className="flex border-b border-slate-200 gap-6 text-sm font-extrabold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 border-b-2 transition ${activeTab === 'specs' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              Product Specifications & Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 border-b-2 transition ${activeTab === 'reviews' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              Customer Reviews ({reviews.length})
            </button>
          </div>

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div>
                <h3 className="font-black text-slate-900 text-base mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {product.description || 'High-density 2400 DPI DTF film transfer sheet for professional garment printing.'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="p-2 border-b border-slate-200 flex justify-between">
                    <span className="text-slate-500 font-medium">Printing Type:</span>
                    <strong className="text-slate-900 font-bold">2400 DPI Ultra-HD DTF</strong>
                  </div>
                  <div className="p-2 border-b border-slate-200 flex justify-between">
                    <span className="text-slate-500 font-medium">Material:</span>
                    <strong className="text-slate-900 font-bold">PET Transfer Sheet Film</strong>
                  </div>
                  <div className="p-2 border-b border-slate-200 flex justify-between">
                    <span className="text-slate-500 font-medium">Durability:</span>
                    <strong className="text-emerald-700 font-bold">25+ Wash Guarantee</strong>
                  </div>
                  <div className="p-2 border-b border-slate-200 flex justify-between">
                    <span className="text-slate-500 font-medium">Heat Press Temp:</span>
                    <strong className="text-slate-900 font-bold">160°C for 15 Seconds</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <h4 className="font-black text-slate-900 text-sm">Write a Customer Review</h4>
                
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl">
                    {reviewSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="bg-white border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(e.target.value)}
                    className="bg-white border border-slate-200 p-3 rounded-xl font-bold"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Share your experience pressing or using this DTF transfer sheet..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition"
                >
                  Submit Review
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{rev.author}</span>
                      <span className="text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 font-medium">{rev.text}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* SIMILAR PRODUCTS SLIDER */}
        {similarProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Similar Products You May Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 md:hidden flex gap-3 shadow-2xl">
        <button
          onClick={() => addToCart(product, quantity)}
          className="flex-1 py-3 bg-slate-900 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <ShoppingBag size={16} /> Add to Cart
        </button>
        <button
          onClick={() => {
            addToCart(product, quantity);
            router.push('/checkout');
          }}
          className="flex-1 py-3 bg-emerald-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
        >
          <Zap size={16} /> Buy Now
        </button>
      </div>

      {/* LIGHTBOX MODAL */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowLightbox(false)}>
          <img
            src={imagesList[activeImgIndex] || imagesList[0]}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
}
