'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  FileText,
  AlertCircle,
  Truck,
  PlusCircle,
  MapPin,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import jsPDF from 'jspdf';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, createOrder, customerUser, setIsAuthOpen, addSavedAddress, settings } = useStore();

  // Selected Saved Address vs Custom Address Entry
  const [selectedAddressId, setSelectedAddressId] = useState(customerUser?.addresses?.[0]?.id || 'new');
  
  // Detailed Address Form Fields (Required by User)
  const [fullName, setFullName] = useState(customerUser?.name || '');
  const [mobile, setMobile] = useState(customerUser?.phone || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [houseFlatNo, setHouseFlatNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [district, setDistrict] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('500081');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  // Payment Options State (NO COD ALLOWED)
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // MANDATORY NO-RETURN POLICY CHECKBOX
  const [acceptedNoReturnPolicy, setAcceptedNoReturnPolicy] = useState(false);

  // QR Code Payment Simulation Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.offerPrice || item.price) * item.quantity, 0);
  const gstAmount = Number((subtotal * 0.18).toFixed(2));
  const shippingFee = subtotal > (settings.freeShippingAbove || 999) ? 0 : (settings.shippingCharges || 70);
  const grandTotal = Number((subtotal + gstAmount + shippingFee - appliedDiscount).toFixed(2));

  // Handle saved address selection
  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName || customerUser?.name || '');
    setMobile(addr.mobile || customerUser?.phone || '');
    setEmail(addr.email || customerUser?.email || '');
    setHouseFlatNo(addr.houseFlatNo || '');
    setStreet(addr.street || '');
    setArea(addr.area || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setDistrict(addr.district || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.toUpperCase() === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedDiscount(disc);
      setCouponMsg('Coupon WELCOME10 applied! 10% Discount applied.');
    } else {
      setCouponMsg('Invalid Coupon Code.');
    }
  };

  const generatePDFInvoice = (orderId) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${orderId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`GSTIN: ${settings.gstNumber || '36ABCDE1234F1Z5'}`, 14, 42);

    doc.text(`Customer Name: ${fullName}`, 14, 52);
    doc.text(`Email / Mobile: ${email} | ${mobile}`, 14, 58);
    doc.text(`Full Address: ${houseFlatNo}, ${street}, ${area}, ${city}, ${state} - ${pincode}`, 14, 64);

    let y = 78;
    doc.text('Order Line Items:', 14, y);
    y += 8;

    cart.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${subtotal}`, 14, y);
    y += 6;
    doc.text(`GST (18%): Rs.${gstAmount}`, 14, y);
    y += 6;
    doc.text(`Shipping Fee: Rs.${shippingFee}`, 14, y);
    y += 6;
    doc.text(`Discount: -Rs.${appliedDiscount}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total Paid: Rs.${grandTotal}`, 14, y);
    y += 12;
    doc.setFontSize(9);
    doc.text('Note: No-Returns Policy accepted by customer for custom DTF transfers.', 14, y);

    doc.save(`HC_DTF_Invoice_${orderId}.pdf`);
  };

  const processOrderSubmission = () => {
    if (!acceptedNoReturnPolicy) {
      alert('Please read and check the No-Returns Policy before proceeding to payment.');
      return;
    }

    setIsProcessing(true);

    // Automatically save address if it's new
    if (selectedAddressId === 'new') {
      addSavedAddress({
        fullName,
        mobile,
        email,
        houseFlatNo,
        street,
        area,
        landmark,
        city,
        district,
        state,
        pincode
      });
    }

    setTimeout(() => {
      const fullAddressFormatted = `${houseFlatNo}, ${street}, ${area}, ${landmark ? 'Landmark: ' + landmark + ', ' : ''}${city}, ${district}, ${state} - ${pincode}`;

      const newOrder = createOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: mobile,
        address: fullAddressFormatted,
        items: cart,
        subtotal,
        gst: gstAmount,
        shipping: shippingFee,
        total: grandTotal,
        paymentMethod: `Paid via ${paymentMethod}`
      });

      // Auto download PDF tax invoice
      generatePDFInvoice(newOrder.id);

      setIsProcessing(false);
      setShowQrModal(false);

      // Route directly to live 9-stage tracking page
      router.push(`/track-order/${newOrder.id}`);
    }, 1500);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!acceptedNoReturnPolicy) {
      alert('Please check and accept the No-Returns Policy checkbox.');
      return;
    }

    if (paymentMethod === 'QR') {
      setShowQrModal(true);
    } else {
      processOrderSubmission();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Please add DTF sheets or patches to your cart before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  // CHECKOUT OTP AUTHENTICATION GUARD
  if (!customerUser) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto font-black text-2xl">
            <KeyRound size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">OTP Login Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please sign in using Mobile Number OTP or Email OTP before entering shipping address details.
            </p>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <UserCheck size={18} /> Sign In via Mobile / Email OTP
          </button>

          <p className="text-[11px] text-slate-400">
            No password required • Account automatically created on 1st login
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Secure Express Checkout</h1>
            <p className="text-xs text-slate-500 mt-1">Direct Factory Order • 18% GST Tax Invoice • Instant Dispatch</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>OTP Verified Customer ({customerUser.phone || customerUser.email})</span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Saved Addresses & Full Address Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Saved Addresses Quick Selector */}
            {customerUser?.addresses?.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-600" />
                  Select Saved Delivery Address
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  {customerUser.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900">{addr.houseFlatNo}, {addr.street}</span>
                        <p className="text-[11px] text-slate-500">{addr.area}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      {selectedAddressId === addr.id && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                      selectedAddressId === 'new' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <PlusCircle size={16} /> Enter New Custom Address
                  </button>
                </div>
              </div>
            )}

            {/* Detailed Address Entry Form (11 Required Fields) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Full Shipping & Delivery Address Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Full Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 3. Email Address */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Email Address (For Tax Invoice PDF) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 4. House / Flat No */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">House / Flat No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot #45, Flat 402"
                    value={houseFlatNo}
                    onChange={(e) => setHouseFlatNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 5. Street */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Street *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textile Hub Main Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 6. Area */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jubilee Hills"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 7. Landmark (Optional) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Metro Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 8. City */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 9. District */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 10. State */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 11. Pincode */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector (STRICTLY NO COD) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Select Prepaid Payment Gateway (No COD)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    paymentMethod === 'Razorpay' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <CreditCard size={20} className="text-emerald-600" />
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Razorpay Gateway</p>
                    <p className="text-[10px] text-slate-500">Cards, NetBanking, Instant UPI</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    paymentMethod === 'UPI' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-black text-xs text-blue-600">GPay</span>
                    <span className="font-black text-xs text-purple-600">PhonePe</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">UPI Direct App</p>
                    <p className="text-[10px] text-slate-500">Paytm, Google Pay, PhonePe</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('QR')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    paymentMethod === 'QR' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <QrCode size={20} className="text-emerald-700" />
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">UPI QR Scan Modal</p>
                    <p className="text-[10px] text-slate-500">Scan & Pay via any UPI App</p>
                  </div>
                </button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>Note: Cash on Delivery (COD) is disabled for custom DTF gang rolls & prints.</span>
              </div>
            </div>

            {/* MANDATORY NO-RETURN POLICY CHECKBOX */}
            <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptedNoReturnPolicy}
                  onChange={(e) => setAcceptedNoReturnPolicy(e.target.checked)}
                  className="w-5 h-5 text-emerald-500 rounded mt-0.5"
                />
                <span className="text-xs leading-relaxed">
                  <strong className="text-emerald-300 block mb-0.5">Mandatory Store Policy Agreement *</strong>
                  I understand & accept the <strong>HC DTF STORE No-Returns Policy</strong>. Custom-printed DTF gang sheets, Maggam blouse necklines, and zari borders are manufactured on-demand and cannot be returned or refunded after dispatch.
                </span>
              </label>
            </div>

          </div>

          {/* Right Column: Order Summary & Pay Action */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.offerPrice || item.price}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    type="button"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && <p className="text-[11px] font-bold text-emerald-600 mt-1">{couponMsg}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-200 pt-4 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% Factory Tax)</span>
                  <span className="font-bold text-slate-900">₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{appliedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-black text-slate-900">
                  <span>Total Amount Payable</span>
                  <span className="text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !acceptedNoReturnPolicy}
                className={`w-full py-4 rounded-2xl text-xs font-extrabold shadow-xl transition flex items-center justify-center gap-2 ${
                  acceptedNoReturnPolicy
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lock size={16} />
                <span>{isProcessing ? 'Processing Secure Order...' : `Pay ₹${grandTotal.toLocaleString()} & Generate Invoice`}</span>
                <ArrowRight size={16} />
              </button>

              <div className="text-center text-[10px] text-slate-400 space-y-1">
                <p>🔒 256-Bit SSL Encrypted Payment</p>
                <p>Official Tax Invoice PDF will download automatically after payment.</p>
              </div>

            </div>

          </div>

        </form>

      </div>

      {/* QR Payment Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowQrModal(false)} />

          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 text-center space-y-4">
            <h3 className="font-black text-slate-900 text-lg">Scan UPI QR Code to Pay</h3>
            <p className="text-xs text-slate-500">Scan using Google Pay, PhonePe, Paytm, or BHIM</p>

            <div className="bg-slate-100 p-4 rounded-2xl inline-block border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=hcdtfstore@upi%26pn=HCDTFStore%26am=${grandTotal}`}
                alt="UPI Payment QR Code"
                className="w-44 h-44 mx-auto rounded-xl"
              />
            </div>

            <div className="text-xs font-black text-emerald-700">
              Amount Payable: ₹{grandTotal.toLocaleString()}
            </div>

            <button
              onClick={processOrderSubmission}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              {isProcessing ? 'Verifying Payment...' : 'I Have Completed Payment'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
