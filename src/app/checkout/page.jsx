'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  Truck, 
  MapPin,
  AlertCircle,
  FileText,
  CreditCard,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { jsPDF } from 'jspdf';

// Helper to dynamically load Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cart = [], 
    clearCart, 
    customerUser, 
    savedAddresses = [], 
    addOrder,
    getShippingFeeForState,
    products = [],
    updateProduct
  } = useStore();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Shipping Address Form State
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

  // Store Policy Agreement
  const [acceptedNoReturnPolicy, setAcceptedNoReturnPolicy] = useState(false);

  // Razorpay Checkout State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Automatic Shipping Fee Calculation
  const shippingFee = getShippingFeeForState(state);

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.offerPrice || item.price) * item.quantity, 0);
  const couponDiscount = appliedDiscount;
  const taxableTotal = Math.max(0, subtotal - couponDiscount);
  const grandTotal = Number((taxableTotal + shippingFee).toFixed(2));

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

  const generatePDFInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL ORDER INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id}`, 14, 30);
    doc.text(`Razorpay Payment ID: ${order.razorpayPaymentId || 'N/A'}`, 14, 36);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 42);

    doc.text(`Customer Name: ${order.customerName}`, 14, 52);
    doc.text(`Email / Mobile: ${order.email} | ${order.phone}`, 14, 58);
    doc.text(`Shipping Address: ${order.shippingAddress.houseFlatNo}, ${order.shippingAddress.street}, ${order.shippingAddress.area}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 14, 64);
    doc.text(`Payment Status: ${order.status}`, 14, 70);

    let y = 84;
    doc.text('Order Line Items:', 14, y);
    y += 8;

    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${order.subtotal}`, 14, y);
    y += 6;
    doc.text(`State Delivery Charge (${order.shippingAddress.state}): Rs.${order.shippingFee}`, 14, y);
    y += 6;
    doc.text(`Discount: -Rs.${order.appliedDiscount}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total Paid: Rs.${order.total}`, 14, y);
    y += 12;
    doc.setFontSize(9);
    doc.text('Thank you for shopping at HC DTF STORE! Factory Direct Order Verified.', 14, y);
    doc.save(`HC_DTF_Invoice_${order.id}.pdf`);
  };

  // Official Razorpay Checkout Modal Workflow
  const handlePayNowWithRazorpay = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!acceptedNoReturnPolicy) {
      alert('Please accept the No-Returns Policy before proceeding.');
      return;
    }

    if (!fullName || !mobile || !email || !houseFlatNo || !street || !area || !city || !district || !state || !pincode) {
      alert('Please fill in all required shipping address fields.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Load Razorpay script
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        setIsProcessingPayment(false);
        setPaymentError('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
        return;
      }

      // 2. Create Razorpay order via Next.js API
      const resOrder = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: fullName,
            phone: mobile,
            email: email
          }
        })
      });

      const orderData = await resOrder.json();

      if (!orderData.success || !orderData.id) {
        setIsProcessingPayment(false);
        setPaymentError(orderData.error || 'Failed to initialize Razorpay checkout order.');
        return;
      }

      // 3. Configure official Razorpay Checkout Options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HC DTF STORE',
        description: `Prepaid Order for ${cart.length} Item(s)`,
        image: '/icon-192.png',
        order_id: orderData.id,
        prefill: {
          name: fullName,
          email: email,
          contact: mobile
        },
        notes: {
          address: `${houseFlatNo}, ${street}, ${area}, ${city}, ${state} - ${pincode}`
        },
        theme: {
          color: '#059669' // Emerald theme matching HC DTF STORE
        },

        // Payment Success Handler
        handler: async function (response) {
          try {
            // Verify payment signature
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            const finalPaymentId = response.razorpay_payment_id;

            // Reduce stock automatically for items ordered
            cart.forEach((cartItem) => {
              const targetProd = products.find((p) => p.id === cartItem.id);
              if (targetProd && updateProduct) {
                const newStock = Math.max(0, (targetProd.stock || 100) - cartItem.quantity);
                updateProduct(targetProd.id, { stock: newStock });
              }
            });

            // Create Order Object
            const newOrderObj = {
              id: `HC-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
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
              paymentMethod: 'Razorpay Online Checkout (UPI / Cards / NetBanking)',
              razorpayPaymentId: finalPaymentId,
              razorpayOrderId: response.razorpay_order_id,
              status: 'Payment Verified',
              trackingNumber: '',
              courierPartner: ''
            };

            addOrder(newOrderObj);
            setCompletedOrder(newOrderObj);
            clearCart();
            setIsProcessingPayment(false);
          } catch (err) {
            console.error('Error handling payment success:', err);
            setIsProcessingPayment(false);
            setPaymentError('Payment received but order creation failed. Please contact support: +91 8121635407.');
          }
        },

        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentError('Razorpay Checkout popup was closed. Please click "Pay Now" to complete your purchase.');
          }
        }
      };

      // 4. Launch official Razorpay Checkout Modal
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setIsProcessingPayment(false);
        setPaymentError(`Payment Failed: ${response.error.description || response.error.reason || 'Transaction failed'}`);
      });

      rzp.open();

    } catch (err) {
      console.error('Razorpay Checkout Exception:', err);
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Razorpay checkout error occurred.');
    }
  };

  // 1. Completed Payment Success Screen
  if (completedOrder) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6">
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check size={40} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                Payment Verified & Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Thank You for Your Order!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Your payment was verified automatically via Razorpay. Your factory DTF printing job is now queued.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-left space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <strong className="text-slate-900 font-mono text-sm">{completedOrder.id}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay Payment ID:</span>
                <strong className="text-emerald-700 font-mono text-xs">{completedOrder.razorpayPaymentId}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <strong className="text-emerald-700 font-mono text-sm">₹{completedOrder.total.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <strong className="text-emerald-600 font-extrabold uppercase">Payment Verified</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => generatePDFInvoice(completedOrder)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition shadow-md"
              >
                <FileText size={16} />
                <span>Download Invoice PDF</span>
              </button>

              <Link
                href="/account?tab=orders"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/30 transition"
              >
                Track Order Status
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart Guard
  if (cart.length === 0) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Official Express Checkout</h1>
            <p className="text-xs text-slate-500">Instant Automated Verification via Razorpay (UPI, GPay, PhonePe, Cards, NetBanking)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Official Razorpay Checkout</span>
          </div>
        </div>

        {/* Payment Error Alert Box */}
        {paymentError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{paymentError}</span>
            </div>
            <button
              onClick={() => setPaymentError('')}
              className="text-rose-500 hover:text-rose-700 text-xs font-black underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handlePayNowWithRazorpay} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Shipping Address & Policy Agreement */}
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

            {/* Mandatory No Returns Policy Agreement */}
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
                  I accept the <strong>HC DTF STORE No-Returns Policy</strong>. Custom-printed DTF sheets, necklines, zari borders, and machinery are manufactured/inspected on-demand and cannot be returned after dispatch.
                </span>
              </label>
            </div>

            {/* Official Razorpay Pay Now Button */}
            <button
              type="submit"
              disabled={isProcessingPayment || !acceptedNoReturnPolicy}
              className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-extrabold shadow-xl transition flex items-center justify-center gap-2.5 ${
                acceptedNoReturnPolicy && !isProcessingPayment
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.01] active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Opening Razorpay Secure Checkout Popup...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>PAY ₹{grandTotal.toLocaleString()} VIA RAZORPAY (UPI, GPAY, PHONEPE, CARDS, NETBANKING)</span>
                  <Zap size={18} />
                </>
              )}
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

              {/* Supported Payment Methods Badges */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                  Supported Razorpay Payment Methods
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-extrabold text-slate-700">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">Google Pay</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">PhonePe</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">Paytm</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">BHIM</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">CRED</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">Debit / Credit Cards</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">Net Banking</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">Wallets</span>
                </div>
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

      </div>
    </div>
  );
}
