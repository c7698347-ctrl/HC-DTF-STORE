'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Check, 
  Truck, 
  MapPin,
  AlertCircle,
  FileText,
  CreditCard,
  Zap,
  RefreshCw,
  Navigation,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Plus,
  Edit,
  Home,
  Briefcase,
  Building,
  CheckCircle2,
  ChevronRight
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
    loginCustomerWithOtp,
    addOrder,
    getShippingFeeForState,
    products = [],
    updateProduct,
    savedAddresses = [],
    addSavedAddress,
    setDefaultAddress
  } = useStore();

  // Login / OTP Form State if guest
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('1234');
  const [otpStep, setOtpStep] = useState(1);
  const [loginError, setLoginError] = useState('');

  // Selected Address State
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form State
  const [addressLabel, setAddressLabel] = useState('Home');
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
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMsg, setGpsMsg] = useState('');

  // Store Policy Agreement
  const [acceptedNoReturnPolicy, setAcceptedNoReturnPolicy] = useState(false);

  // Razorpay Checkout State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Auto-Select Default Address
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        populateFields(defaultAddr);
      }
    } else {
      setIsAddingNewAddress(true);
    }
  }, [savedAddresses]);

  useEffect(() => {
    if (customerUser) {
      if (customerUser.name && !fullName) setFullName(customerUser.name);
      if (customerUser.phone && !mobile) setMobile(customerUser.phone);
      if (customerUser.email && !email) setEmail(customerUser.email);
    }
  }, [customerUser]);

  const populateFields = (addr) => {
    setFullName(addr.fullName || customerUser?.name || '');
    setMobile(addr.mobile || customerUser?.phone || '');
    setEmail(addr.email || customerUser?.email || '');
    setHouseFlatNo(addr.houseFlatNo || '');
    setStreet(addr.street || '');
    setArea(addr.area || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || 'Hyderabad');
    setDistrict(addr.district || addr.city || 'Hyderabad');
    setState(addr.state || 'Telangana');
    setPincode(addr.pincode || '500081');
    setLat(addr.lat || null);
    setLng(addr.lng || null);
  };

  // Single Location Request during Sign-up / First Address Setup
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsMsg('Detecting location via GPS...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          // OpenStreetMap Reverse Geocoding API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          if (data && data.address) {
            const add = data.address;
            setCity(add.city || add.town || add.village || add.suburb || 'Hyderabad');
            setDistrict(add.state_district || add.county || add.city || 'Hyderabad');
            setState(add.state || 'Telangana');
            setPincode(add.postcode || '500081');
            setArea(add.suburb || add.neighbourhood || add.residential || '');
            setStreet(add.road || add.pedestrian || '');
            setGpsMsg('Location detected & address auto-filled! Please verify before saving.');
          } else {
            setGpsMsg('GPS Coordinates captured. Please verify City, State & Pincode.');
          }
        } catch (e) {
          setGpsMsg('GPS Location captured. Defaulted to Telangana region.');
          setCity('Hyderabad');
          setDistrict('Hyderabad');
          setState('Telangana');
          setPincode('500081');
        }

        setGpsLoading(false);
        setTimeout(() => setGpsMsg(''), 5000);
      },
      (error) => {
        setGpsLoading(false);
        setGpsMsg('Location permission denied or unavailable. Please select State manually.');
        setTimeout(() => setGpsMsg(''), 4000);
      }
    );
  };

  const handleSaveNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !mobile || !email || !houseFlatNo || !street || !area || !city || !state || !pincode) {
      alert('Please fill out all required address fields.');
      return;
    }

    const created = addSavedAddress({
      label: addressLabel,
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
      pincode,
      lat,
      lng,
      isDefault: savedAddresses.length === 0
    });

    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
    setIsChangingAddress(false);
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    populateFields(addr);
    setIsChangingAddress(false);
  };

  // Guest OTP Login Handler
  const handleGuestLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginPhoneOrEmail.trim()) return;

    if (otpStep === 1) {
      setOtpStep(2);
      return;
    }

    const res = loginCustomerWithOtp(loginPhoneOrEmail.trim(), loginOtp);
    if (!res.success) {
      setLoginError(res.error || 'Invalid OTP code');
    } else {
      setLoginError('');
    }
  };

  // Selected Active Address
  const activeAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // Dynamic Admin Shipping Fee Lookup (NO HARDCODED FALLBACKS)
  const currentStateName = activeAddress ? activeAddress.state : state;
  const shippingFee = getShippingFeeForState(currentStateName);
  const isShippingUnavailable = shippingFee === null || shippingFee === undefined;

  const subtotal = cart.reduce((acc, item) => acc + (item.offerPrice || item.price) * item.quantity, 0);
  const grandTotal = Number((subtotal + (isShippingUnavailable ? 0 : shippingFee)).toFixed(2));

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
    doc.text(`Shipping Fee (${order.shippingAddress.state}): Rs.${order.shippingFee}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total Paid: Rs.${order.total}`, 14, y);
    doc.save(`Invoice_${order.id}.pdf`);
  };

  // Official Razorpay Checkout Modal Workflow
  const handlePayNowWithRazorpay = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (isShippingUnavailable) {
      setPaymentError('Shipping is currently unavailable for this location. Please contact support.');
      return;
    }

    if (!customerUser) {
      alert('Mandatory Login Required: Please sign in to your customer account before proceeding to payment.');
      return;
    }

    if (!acceptedNoReturnPolicy) {
      alert('Please accept the Mandatory Store Policy Agreement before proceeding.');
      return;
    }

    const currentShippingAddr = activeAddress || {
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
    };

    if (!currentShippingAddr.fullName || !currentShippingAddr.mobile || !currentShippingAddr.houseFlatNo || !currentShippingAddr.state || !currentShippingAddr.pincode) {
      alert('Please select or provide a complete shipping address.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        setIsProcessingPayment(false);
        setPaymentError('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
        return;
      }

      const resOrder = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: currentShippingAddr.fullName,
            phone: currentShippingAddr.mobile,
            email: currentShippingAddr.email,
            state: currentShippingAddr.state,
            shippingFee: shippingFee
          }
        })
      });

      const orderData = await resOrder.json();

      if (!orderData.success || !orderData.id) {
        setIsProcessingPayment(false);
        setPaymentError(orderData.error || 'Failed to initialize Razorpay checkout order.');
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HC DTF STORE',
        description: `Prepaid Order for ${cart.length} Item(s)`,
        image: '/icon-192.png',
        order_id: orderData.id,
        prefill: {
          name: currentShippingAddr.fullName,
          email: currentShippingAddr.email,
          contact: currentShippingAddr.mobile
        },
        notes: {
          address: `${currentShippingAddr.houseFlatNo}, ${currentShippingAddr.street}, ${currentShippingAddr.area}, ${currentShippingAddr.city}, ${currentShippingAddr.state} - ${currentShippingAddr.pincode}`
        },
        theme: {
          color: '#059669'
        },

        handler: async function (response) {
          try {
            await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const finalPaymentId = response.razorpay_payment_id;

            cart.forEach((cartItem) => {
              const targetProd = products.find((p) => p.id === cartItem.id);
              if (targetProd && updateProduct) {
                const newStock = Math.max(0, (targetProd.stock || 100) - cartItem.quantity);
                updateProduct(targetProd.id, { stock: newStock });
              }
            });

            // Copy Shipping Address permanently to order snapshot
            const newOrderObj = {
              id: `HC-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
              createdAt: new Date().toISOString(),
              customerName: currentShippingAddr.fullName,
              phone: currentShippingAddr.mobile,
              email: currentShippingAddr.email,
              shippingAddress: {
                houseFlatNo: currentShippingAddr.houseFlatNo,
                street: currentShippingAddr.street,
                area: currentShippingAddr.area,
                landmark: currentShippingAddr.landmark,
                city: currentShippingAddr.city,
                district: currentShippingAddr.district || currentShippingAddr.city,
                state: currentShippingAddr.state,
                pincode: currentShippingAddr.pincode
              },
              items: cart,
              subtotal,
              shippingFee,
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

        {/* 1. MANDATORY LOGIN GUARD IF NOT LOGGED IN */}
        {!customerUser && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Mandatory Customer Account Login Required</h3>
                <p className="text-xs text-slate-500">Sign in via Mobile OTP or Email OTP to complete express checkout</p>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl">
                {loginError}
              </div>
            )}

            <form onSubmit={handleGuestLoginSubmit} className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Number or Email Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or name@domain.com"
                  value={loginPhoneOrEmail}
                  onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {otpStep === 2 && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Enter 4-Digit OTP Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 text-center tracking-widest text-base"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default test OTP: 1234</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                {otpStep === 1 ? 'Send One-Time OTP Code' : 'Verify OTP & Continue Checkout'}
              </button>
            </form>
          </div>
        )}

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
            
            {/* AMAZON-STYLE SAVED ADDRESS & CHECKOUT CARD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Delivering to
                  </h3>
                </div>

                {savedAddresses.length > 0 && !isAddingNewAddress && !isChangingAddress && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingAddress(true)}
                      className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Change Address
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(true);
                        setIsChangingAddress(false);
                      }}
                      className="text-xs font-extrabold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add New Address
                    </button>
                  </div>
                )}
              </div>

              {/* A. SAVED DEFAULT ADDRESS CARD (NO REPEATED LOCATION REQUESTS) */}
              {activeAddress && !isChangingAddress && !isAddingNewAddress && (
                <div className="p-5 bg-slate-50 border-2 border-emerald-500/40 rounded-2xl space-y-2 relative transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{activeAddress.fullName}</span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase border border-emerald-300">
                        {activeAddress.label || 'Home'}
                      </span>
                      {activeAddress.isDefault && (
                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded-md uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {activeAddress.houseFlatNo}, {activeAddress.street}, {activeAddress.area}
                    {activeAddress.landmark ? `, Near ${activeAddress.landmark}` : ''}, {activeAddress.city}, {activeAddress.state} - <strong className="text-slate-900 font-bold">{activeAddress.pincode}</strong>
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                    <span>Mobile: <strong>{activeAddress.mobile}</strong></span>
                    {activeAddress.email && <span>Email: {activeAddress.email}</span>}
                  </div>
                </div>
              )}

              {/* B. ADDRESS SELECTOR DRAWER / LIST IF CUSTOMER CLICKS CHANGE ADDRESS */}
              {isChangingAddress && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Select Saved Delivery Address:</h4>
                  
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-bold">{addr.fullName}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {addr.houseFlatNo}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>

                      {selectedAddressId === addr.id && (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingAddress(false)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Cancel & Keep Active Address
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(true);
                        setIsChangingAddress(false);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Another Address
                    </button>
                  </div>
                </div>
              )}

              {/* C. NEW ADDRESS FORM (SHOWN FOR FIRST TIME OR WHEN ADDING NEW ADDRESS) */}
              {(isAddingNewAddress || savedAddresses.length === 0) && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900">
                      {savedAddresses.length === 0 ? 'First-Time Location & Delivery Setup' : 'Add New Shipping Address'}
                    </span>

                    {/* GPS LOCATION BUTTON SHOWN ONCE FOR NEW ADDRESS SETUP */}
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={gpsLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Navigation size={14} className={gpsLoading ? 'animate-spin' : ''} />
                      <span>{gpsLoading ? 'Detecting Location...' : 'Use Current Location'}</span>
                    </button>
                  </div>

                  {gpsMsg && (
                    <div className="p-3 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-800">
                      {gpsMsg}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pb-1">
                    <span className="text-xs font-bold text-slate-700">Save Address As:</span>
                    {['Home', 'Work', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressLabel(lbl)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                          addressLabel === lbl
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

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
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter state"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
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

                  <div className="flex items-center justify-end gap-3 pt-2">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveNewAddressSubmit}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition"
                    >
                      Save Address & Use for Delivery
                    </button>
                  </div>
                </div>
              )}

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
              disabled={isProcessingPayment || !acceptedNoReturnPolicy || !customerUser || isShippingUnavailable}
              className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-extrabold shadow-xl transition flex items-center justify-center gap-2.5 ${
                acceptedNoReturnPolicy && customerUser && !isShippingUnavailable && !isProcessingPayment
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.01] active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Opening Razorpay Secure Checkout Popup...</span>
                </>
              ) : isShippingUnavailable ? (
                <span>Shipping Unavailable for {currentStateName}</span>
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

              {/* DYNAMIC ADMIN SHIPPING FEE BREAKDOWN */}
              <div className="space-y-2 text-xs border-t border-slate-200 pt-3 text-slate-600">
                <div className="flex justify-between">
                  <span>Products Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-bold">
                  <span>State Delivery Charge ({currentStateName})</span>
                  {isShippingUnavailable ? (
                    <span className="text-rose-600 font-extrabold">Unavailable</span>
                  ) : (
                    <span className="text-emerald-700">₹{shippingFee}</span>
                  )}
                </div>

                {isShippingUnavailable && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>Shipping is currently unavailable for this location. Please contact support.</span>
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
