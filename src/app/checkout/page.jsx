'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  PlusCircle,
  MapPin,
  KeyRound,
  UserCheck,
  Upload,
  Copy,
  Check,
  Clock,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import jsPDF from 'jspdf';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cart, 
    createOrder, 
    customerUser, 
    setIsAuthOpen, 
    addSavedAddress, 
    settings,
    getShippingFeeForState 
  } = useStore();

  // Selected Saved Address vs Custom Address Entry
  const [selectedAddressId, setSelectedAddressId] = useState(customerUser?.addresses?.[0]?.id || 'new');
  
  // Detailed Address Form Fields (Required)
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

  // Mandatory No-Returns Agreement
  const [acceptedNoReturnPolicy, setAcceptedNoReturnPolicy] = useState(false);

  // Manual UPI Payment Verification Inputs (STRICTLY REQUIRED)
  const [step, setStep] = useState(1); // 1 = Address & Policy, 2 = Manual UPI Payment & Verification Proof
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);

  // Automatic State-Wise Shipping Fee Calculation
  const shippingFee = getShippingFeeForState(state);

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.offerPrice || item.price) * item.quantity, 0);
  const couponDiscount = appliedDiscount;
  const taxableTotal = Math.max(0, subtotal - couponDiscount);
  const gstAmount = Number((taxableTotal * 0.18).toFixed(2));
  const grandTotal = Number((taxableTotal + gstAmount + shippingFee).toFixed(2));

  // Dynamic UPI Deep Link & Dynamic QR Code (Exact Amount Prefilled)
  const officialUpiId = settings.upiId || 'sunillankapalli77@okhdfcbank';
  const merchantName = settings.upiAccountName || 'Sunil Kumar';
  const orderRefNote = `Order payment for ${cart.length} item(s)`;
  
  const upiDeepLinkUri = `upi://pay?pa=${encodeURIComponent(officialUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&tn=${encodeURIComponent(orderRefNote)}&cu=INR`;
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiDeepLinkUri)}`;

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
    setState(addr.state || 'Telangana');
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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentScreenshot(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToPaymentStep = (e) => {
    e.preventDefault();
    if (!acceptedNoReturnPolicy) {
      alert('Please read and check the No-Returns Policy checkbox before proceeding.');
      return;
    }
    if (!fullName || !mobile || !email || !houseFlatNo || !street || !area || !city || !district || !state || !pincode) {
      alert('Please fill in all required shipping address fields.');
      return;
    }

    setStep(2);
  };

  const generatePDFInvoice = (orderId) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${orderId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`GSTIN: ${settings.gstNumber || '36ABCDE1234F1Z5'}`, 14, 42);

    doc.text(`Customer Name: ${fullName}`, 14, 52);
    doc.text(`Email / Mobile: ${email} | ${mobile}`, 14, 58);
    doc.text(`Shipping Address: ${houseFlatNo}, ${street}, ${area}, ${city}, ${state} - ${pincode}`, 14, 64);
    doc.text(`UPI UTR Transaction ID: ${transactionId}`, 14, 70);

    let y = 84;
    doc.text('Order Line Items:', 14, y);
    y += 8;

    cart.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${subtotal}`, 14, y);
    y += 6;
    doc.text(`State Delivery Charge (${state}): Rs.${shippingFee}`, 14, y);
    y += 6;
    doc.text(`GST (18%): Rs.${gstAmount}`, 14, y);
    y += 6;
    doc.text(`Discount: -Rs.${appliedDiscount}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs.${grandTotal}`, 14, y);
    y += 12;
    doc.setFontSize(9);
    doc.text('Payment Status: Payment Verification Pending (Verification in Progress)', 14, y);

    doc.save(`HC_DTF_Invoice_${orderId}.pdf`);
  };

  const handleFinalOrderSubmit = (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      alert('Please enter your 12-digit UPI UTR / Transaction ID.');
      return;
    }
    if (!paymentScreenshot) {
      alert('Please upload your UPI Payment Screenshot receipt before completing order submission.');
      return;
    }

    setIsSubmittingOrder(true);

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
        shippingState: state,
        items: cart,
        subtotal,
        gst: gstAmount,
        shipping: shippingFee,
        total: grandTotal,
        transactionId: transactionId.trim(),
        paymentScreenshot,
        paymentStatus: 'Verification Pending',
        status: 'Payment Verification Pending'
      });

      generatePDFInvoice(newOrder.id);
      setIsSubmittingOrder(false);
      setCreatedOrderData(newOrder);
    }, 1200);
  };

  if (cart.length === 0 && !createdOrderData) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Please add DTF transfer sheets or patches before proceeding to checkout.</p>
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

  // OTP AUTHENTICATION GUARD
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

  // PAYMENT VERIFICATION PENDING SUCCESS MODAL / SCREEN
  if (createdOrderData) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full text-center space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
            <Clock size={40} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full uppercase tracking-wider inline-block">
              Payment Verification Pending
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Order #{createdOrderData.id} Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pt-2">
              "Your payment is under verification. We will verify your payment and start processing your order."
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Grand Total Amount Paid:</span>
              <strong className="text-slate-900 font-black">₹{createdOrderData.total?.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Submitted UTR / Transaction ID:</span>
              <strong className="text-emerald-700 font-mono font-bold">{createdOrderData.transactionId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <strong className="text-amber-600 font-bold">Payment Verification Pending</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => router.push(`/track-order/${createdOrderData.id}`)}
              className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition"
            >
              Track Order Status Live
            </button>
            <button
              onClick={() => router.push('/account')}
              className="py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition"
            >
              Go to My Account
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Step Indicator */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Manual UPI Express Checkout</h1>
            <p className="text-xs text-slate-500 mt-1">Direct Factory Order • State-Wise Delivery • 18% GST Invoice</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`px-3 py-1.5 rounded-full ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1. Address & State Delivery
            </span>
            <span className="text-slate-400">→</span>
            <span className={`px-3 py-1.5 rounded-full ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2. Auto-Prefilled UPI & Verification
            </span>
          </div>
        </div>

        {/* STEP 1: ADDRESS & NO-RETURNS POLICY */}
        {step === 1 && (
          <form onSubmit={handleProceedToPaymentStep} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-6">
              
              {/* Saved Addresses Selector */}
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

              {/* Detailed Address Entry Form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Full Shipping & Delivery Address Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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

                  {/* 10. State Selector (Triggers Live Delivery Charge Calculation) */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">State (Auto-Calculates Delivery Charge) *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-bold text-slate-900"
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh (Delivery: ₹150)</option>
                      <option value="Telangana">Telangana (Delivery: ₹150)</option>
                      <option value="Tamil Nadu">Tamil Nadu (Delivery: ₹180)</option>
                      <option value="Karnataka">Karnataka (Delivery: ₹180)</option>
                      <option value="Kerala">Kerala (Delivery: ₹200)</option>
                      <option value="Maharashtra">Maharashtra (Delivery: ₹200)</option>
                      <option value="Delhi">Delhi (Delivery: ₹200)</option>
                      <option value="Gujarat">Gujarat (Delivery: ₹200)</option>
                      <option value="Other States">Other States (Delivery: ₹200)</option>
                    </select>
                  </div>

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
                    I accept the <strong>HC DTF STORE No-Returns Policy</strong>. Custom-printed DTF sheets, necklines, and zari borders are manufactured on-demand and cannot be returned after dispatch.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!acceptedNoReturnPolicy}
                className={`w-full py-4 rounded-2xl text-xs font-extrabold shadow-xl transition flex items-center justify-center gap-2 ${
                  acceptedNoReturnPolicy
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Auto-Prefilled Payment Details</span>
                <ArrowRight size={18} />
              </button>

            </div>

            {/* Right Summary Breakdown */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
                  Complete Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between py-1.5 border-b border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ₹{item.offerPrice || item.price}</p>
                      </div>
                      <span className="font-black text-slate-900">₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* 8. COMPLETE ORDER SUMMARY DISPLAY */}
                <div className="space-y-2 text-xs border-t border-slate-200 pt-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>Products Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>State Delivery Charge ({state})</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>GST (18% Factory Tax)</span>
                    <span className="font-bold text-slate-900">₹{gstAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                    <span>Grand Total Amount</span>
                    <span className="text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        )}

        {/* STEP 2: AUTO-PREFILLED DYNAMIC UPI PAYMENT & VERIFICATION PROOF */}
        {step === 2 && (
          <form onSubmit={handleFinalOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Official Store UPI Details & Dynamic QR Code */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
                      Official Account
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">Auto-Prefilled UPI Payment</h3>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white underline">
                    ← Edit Address
                  </button>
                </div>

                {/* Account Details Box */}
                <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Account Name:</span>
                    <strong className="text-white font-extrabold text-sm">{merchantName}</strong>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Contact Number:</span>
                    <strong className="text-white font-mono font-bold text-sm">{settings.upiMobile || '+91 8121635407'}</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Official UPI ID:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-400 font-mono font-black text-sm">{officialUpiId}</strong>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 rounded-lg border border-emerald-700 transition"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* 4. DYNAMIC PREFILLED AMOUNT UPI QR CODE & DIRECT PAY BUTTON */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <p className="text-xs font-extrabold text-emerald-400">
                    Scan below or tap button — Amount ₹{grandTotal.toFixed(2)} is automatically prefilled!
                  </p>

                  {/* Dynamic QR Code containing exact amount */}
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-2xl border border-slate-200">
                    <img
                      src={dynamicQrCodeUrl}
                      alt={`Dynamic UPI QR Code for ₹${grandTotal}`}
                      className="w-64 sm:w-72 h-auto max-w-full mx-auto rounded-xl object-contain shadow-md"
                    />
                  </div>

                  {/* Direct Launch Button for Mobile UPI Apps */}
                  <div className="pt-2">
                    <a
                      href={upiDeepLinkUri}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition"
                    >
                      <Smartphone size={18} />
                      <span>Tap to Pay ₹{grandTotal.toFixed(2)} in Google Pay / PhonePe / Paytm</span>
                      <ExternalLink size={16} />
                    </a>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      No manual amount typing required. The app will open directly with ₹{grandTotal.toFixed(2)}.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Required Verification Proof Form */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
                
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Payment Verification Proof</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter transaction UTR number & upload payment screenshot to submit order.
                  </p>
                </div>

                {/* 1. UPI Transaction ID / UTR Number */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    UPI Transaction ID / 12-Digit UTR Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 421589012345 (Found in GPay / PhonePe receipt)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Transaction ID is required to match bank credits.</p>
                </div>

                {/* 2. Payment Screenshot Upload */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    Payment Screenshot Receipt *
                  </label>

                  <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 text-center bg-slate-50 space-y-2">
                    {paymentScreenshot ? (
                      <div className="space-y-3">
                        <img
                          src={paymentScreenshot}
                          alt="Payment Screenshot"
                          className="w-36 h-48 object-cover rounded-2xl mx-auto border-2 border-emerald-500 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot('')}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          Remove & Upload Different Screenshot
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto text-emerald-600" />
                        <p className="text-xs font-bold text-slate-800">Upload screenshot of completed payment</p>
                        <p className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP receipts</p>
                        
                        <input
                          type="file"
                          required
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          id="upi-ss-upload"
                        />
                        <label
                          htmlFor="upi-ss-upload"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-block transition"
                        >
                          Browse Receipt Image
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmittingOrder || !transactionId.trim() || !paymentScreenshot}
                  className={`w-full py-4 rounded-2xl text-xs font-black shadow-xl transition flex items-center justify-center gap-2 ${
                    transactionId.trim() && paymentScreenshot
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Lock size={16} />
                  <span>
                    {isSubmittingOrder ? 'Submitting Payment Proof...' : `Submit Payment Proof & Place Order (₹${grandTotal.toFixed(2)})`}
                  </span>
                  <ArrowRight size={16} />
                </button>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 font-medium leading-relaxed">
                  <strong>Verification Note:</strong> Order status will be set to <em>Payment Verification Pending</em>. Account details belong to <strong>{merchantName}</strong>. Our team will verify your UTR and confirm your order.
                </div>

              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
