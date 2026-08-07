'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CartDrawer() {
  const router = useRouter();
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart = [], 
    removeFromCart, 
    updateCartQuantity,
    moveToBuyLater,
    t,
    settings,
    getShippingFeeForState
  } = useStore();

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  // Robust, Crash-Proof Cart Financial Calculations
  const cartItems = Array.isArray(cart) ? cart : [];
  
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const unitPrice = Number(item.offerPrice ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 1);
    return sum + (unitPrice * qty);
  }, 0);

  const couponDiscount = appliedCoupon ? Math.round((cartSubtotal * (Number(appliedCoupon.percent) || 0)) / 100) : 0;
  const taxableTotal = Math.max(0, cartSubtotal - couponDiscount);
  const gstAmount = Math.round(taxableTotal * 0.18);
  const estimatedShipping = cartSubtotal > (settings.freeShippingAbove || 999) || cartSubtotal === 0 ? 0 : 150;
  const cartTotal = taxableTotal + gstAmount + estimatedShipping;

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', percent: 10 });
      setCouponMsg('10% Discount Applied Successfully!');
    } else if (code === 'DTF100' && cartSubtotal >= 999) {
      setAppliedCoupon({ code: 'DTF100', percent: 15 });
      setCouponMsg('15% VIP Bulk Discount Applied!');
    } else {
      setCouponMsg('Invalid Coupon Code or minimum purchase not met.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('cart')}</h3>
                <p className="text-xs text-slate-400">{cartItems.length} unique items</p>
              </div>
            </div>

            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShoppingBag size={36} />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Your Cart is Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our high definition DTF transfers, Maggam blouse necklines & Saree borders.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/shop');
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = Number(item.offerPrice ?? item.price ?? 0);
                const originalPrice = Number(item.price ?? item.originalPrice ?? itemPrice);
                const discount = item.discountPercent ?? (originalPrice > itemPrice ? Math.round(((originalPrice - itemPrice) / originalPrice) * 100) : 0);
                const qty = Number(item.quantity ?? 1);

                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    <img 
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'} 
                      alt={item.name || 'Product'} 
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0" 
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name || 'DTF Sheet'}</h4>
                      <p className="text-[11px] text-slate-500">{item.category || 'General'}</p>
                      
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-bold text-emerald-700">₹{(itemPrice).toLocaleString('en-IN')}</span>
                        {originalPrice > itemPrice && (
                          <span className="text-[11px] text-slate-400 line-through">₹{(originalPrice).toLocaleString('en-IN')}</span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Modifier */}
                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
                          <button 
                            onClick={() => updateCartQuantity(item.id, qty - 1)}
                            className="p-1 text-slate-600 hover:text-emerald-700"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-900 px-2">{qty}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, qty + 1)}
                            className="p-1 text-slate-600 hover:text-emerald-700"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 text-xs">
                          <button 
                            onClick={() => moveToBuyLater(item)}
                            className="text-slate-400 hover:text-emerald-600 transition text-[11px]"
                            title="Move to Buy Later"
                          >
                            Save Later
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon Code Section */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 uppercase font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 font-semibold bg-emerald-100/60 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Check size={14} /> Coupon <strong>{appliedCoupon.code}</strong> Applied ({appliedCoupon.percent}% OFF)
                  </span>
                  <button 
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponMsg('');
                    }}
                    className="text-rose-600 hover:underline text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponMsg && !appliedCoupon && (
                <p className="mt-1.5 text-[11px] text-rose-600 font-medium">{couponMsg}</p>
              )}
            </div>
          )}

          {/* Cart Pricing Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-slate-200 space-y-3 shadow-2xl">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-slate-900">₹{(cartSubtotal ?? 0).toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>- ₹{(couponDiscount ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (18% Factory Tax)</span>
                  <span className="font-semibold text-slate-900">₹{(gstAmount ?? 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>State-Wise Shipping</span>
                  <span>{estimatedShipping === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `From ₹${estimatedShipping}`}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-emerald-700 text-base">₹{(cartTotal ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-600 shrink-0" />
                <span>AP/TS: ₹150 | TN/KA: ₹180 | Kerala & Others: ₹200 (Auto-calculated on checkout)</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-700/20 hover:from-emerald-700 hover:to-emerald-900 transition duration-200"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Direct Factory Order • Manual UPI Express Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
