'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  Copy, 
  QrCode, 
  Upload, 
  Truck, 
  Clock, 
  AlertCircle,
  HelpCircle,
  FileText,
  MapPin
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { jsPDF } from 'jspdf';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cart = [], 
    clearCart, 
    customerUser, 
    savedAddresses = [], 
    addOrder,
    settings,
    getShippingFeeForState
  } = useStore();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Shipping Form State
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

  // Manual Prepaid UPI Payment Verification Inputs
  const [step, setStep] = useState(1);
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);

  // Automatic State-Wise Shipping Fee Calculation
  const shippingFee = getShippingFeeForState(state);

  // Financial calculations (NO GST)
  const subtotal = cart.reduce((acc, item) => acc + (item.offerPrice || item.price) * item.quantity, 0);
  const couponDiscount = appliedDiscount;
  const taxableTotal = Math.max(0, subtotal - couponDiscount);
  const grandTotal = Number((taxableTotal + shippingFee).toFixed(2));

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

  const generatePDFInvoice = (orderId, utrVal) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL ORDER INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${orderId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.text(`Customer Name: ${fullName}`, 14, 46);
    doc.text(`Email / Mobile: ${email} | ${mobile}`, 14, 52);
    doc.text(`Shipping Address: ${houseFlatNo}, ${street}, ${area}, ${city}, ${state} - ${pincode}`, 14, 58);
    doc.text(`UPI UTR / Transaction ID: ${utrVal || 'Submitted (Verification Pending)'}`, 14, 64);

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
    doc.text(`State Delivery Charge (${state}): Rs.${shippingFee}`, 14, y);
    y += 6;
    doc.text(`Discount: -Rs.${appliedDiscount}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs.${grandTotal}`, 14, y);
    y += 12;
    doc.setFontSize(9);
    doc.text('Note: Factory Direct Order • Payment Verification Pending', 14, y);
    doc.save(`HC_DTF_Invoice_${orderId}.pdf`);
  };

  const handleFinalOrderSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      alert('Please enter your 12-digit UPI UTR / Transaction ID.');
      return;
    }

    setIsSubmittingOrder(true);

    const newOrderObj = {
      id: `HC-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customerName: fullName,
      phone: mobile,
      email: email,
      shippingAddress: {
        houseFlatNo,
        street,
        area,
        landmark,
        city,
        district,
        state,
        pincode
      },
      items: cart,
      subtotal,
      shippingFee,
      appliedDiscount,
      total: grandTotal,
      paymentMethod: 'Prepaid Manual UPI (Verification Pending)',
      upiTransactionId: transactionId.trim(),
      paymentScreenshotUrl: paymentScreenshot || null,
      status: 'Payment Verification Pending',
      trackingNumber: '',
      courierPartner: ''
    };

    try {
      addOrder(newOrderObj);
      setCreatedOrderData(newOrderObj);
      clearCart();
      setIsSubmittingOrder(false);
      setStep(3); // Step 3 = Order Submitted Success Screen
    } catch (err) {
      console.error(err);
      setIsSubmittingOrder(false);
      alert('Error creating order. Please try again.');
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Checkout Cart is Empty</h2>
          <p className="text-xs text-slate-500">Add products to your cart before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            Explore DTF Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Prepaid Express Checkout</h1>
            <p className="text-xs text-slate-500">Official Factory Direct Order • Ships within 1–3 Business Days</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Prepaid UPI Transfer</span>
          </div>
        </div>

        {/* STEP 1: SHIPPING ADDRESS & STORE POLICY AGREEMENT */}
        {step === 1 && (
          <form onSubmit={handleProceedToPaymentStep} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-6">
              
              {/* Saved Addresses Quick Selector */}
              {savedAddresses.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
                    Select From Saved Addresses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-slate-900">{addr.fullName}</span>
                          <MapPin size={14} className="text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{addr.houseFlatNo}, {addr.street}, {addr.city}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{addr.mobile}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address Inputs */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                  1. Customer Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">House / Flat / Door No *</label>
                    <input
                      type="text"
                      required
                      value={houseFlatNo}
                      onChange={(e) => setHouseFlatNo(e.target.value)}
                      placeholder="Flat No, Building, House"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Street / Road *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street name"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Area / Colony *</label>
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Colony or Area"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near landmark"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh (₹150)</option>
                      <option value="Telangana">Telangana (₹150)</option>
                      <option value="Tamil Nadu">Tamil Nadu (₹180)</option>
                      <option value="Karnataka">Karnataka (₹180)</option>
                      <option value="Kerala">Kerala (₹200)</option>
                      <option value="Maharashtra">Maharashtra (₹200)</option>
                      <option value="Gujarat">Gujarat (₹200)</option>
                      <option value="Delhi">Delhi (₹200)</option>
                      <option value="Other States">Other States (₹200)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6-digit pincode"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

              </div>

              {/* No Returns Policy Agreement */}
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
                <span>Proceed to Complete Payment</span>
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

                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                    <span>Grand Total Amount</span>
                    <span className="text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        )}

        {/* STEP 2: PREPAID DYNAMIC UPI PAYMENT & 1-TAP "I HAVE COMPLETED PAYMENT" */}
        {step === 2 && (
          <form onSubmit={handleFinalOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
                      Prepaid Payment Only
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">Prepaid UPI Express Payment</h3>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white underline">
                    Edit Address
                  </button>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Account Name:</span>
                    <strong className="text-white font-mono text-sm">{merchantName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Contact Number:</span>
                    <strong className="text-emerald-400 font-mono text-sm">+91 8121635407</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Official UPI ID:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-mono text-xs bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        {officialUpiId}
                      </strong>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dynamic QR Code */}
                <div className="bg-white p-6 rounded-3xl text-center space-y-3 max-w-xs mx-auto shadow-xl">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Scan with any UPI App
                  </p>
                  <img
                    src={dynamicQrCodeUrl}
                    alt="Prepaid UPI QR Code"
                    className="w-48 h-48 mx-auto object-contain rounded-xl border border-slate-200"
                  />
                  <p className="text-base font-black text-emerald-700">₹{grandTotal}</p>
                  <a
                    href={upiDeepLinkUri}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <span>Pay ₹{grandTotal} in GPay / PhonePe</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

              </div>
            </div>

            {/* Right Column: 1-Tap Payment Submission Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Confirm Payment Details</h3>
                  <p className="text-xs text-slate-500">Enter your UPI UTR Transaction ID to complete order verification.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-900">
                      12-Digit UPI Transaction ID / UTR *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 324109854123"
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Upload Payment Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder || !transactionId.trim()}
                  className={`w-full py-4 rounded-2xl text-xs font-extrabold shadow-xl transition flex items-center justify-center gap-2 ${
                    transactionId.trim() && !isSubmittingOrder
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-95'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Check size={18} />
                  <span>I HAVE COMPLETED PAYMENT</span>
                </button>

              </div>
            </div>

          </form>
        )}

        {/* STEP 3: ORDER SUBMITTED SUCCESS DISPLAY */}
        {step === 3 && createdOrderData && (
          <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check size={40} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Verification Pending
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Thank You for Your Order!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Your payment request has been submitted. Our system is verifying your payment and we will start processing your order shortly.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <strong className="text-slate-900 font-mono">{createdOrderData.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grand Total:</span>
                <strong className="text-emerald-700 font-mono">₹{createdOrderData.total}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID (UTR):</span>
                <strong className="text-slate-900 font-mono">{createdOrderData.upiTransactionId}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => generatePDFInvoice(createdOrderData.id, createdOrderData.upiTransactionId)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition"
              >
                <FileText size={16} />
                <span>Download Invoice PDF</span>
              </button>

              <Link
                href="/account?tab=orders"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition"
              >
                Track Order Status
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
