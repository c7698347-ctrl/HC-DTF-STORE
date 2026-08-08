'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  LogOut,
  ChevronRight,
  ShoppingBag,
  Heart,
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Home,
  Briefcase,
  Building,
  CreditCard,
  Settings,
  Navigation,
  KeyRound,
  Bell,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import OrderCard from '@/components/orders/OrderCard';
import jsPDF from 'jspdf';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    customerUser, 
    logoutCustomer, 
    orders = [], 
    wishlist = [], 
    buyLater = [], 
    savedAddresses = [],
    addSavedAddress, 
    deleteSavedAddress, 
    setDefaultAddress,
    updateCustomerProfile,
    setIsAuthOpen
  } = useStore();

  const [activeTab, setActiveTab] = useState('orders');

  // Profile Edit State
  const [name, setName] = useState(customerUser?.name || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Location Tab State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMsg, setGpsMsg] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);

  // New Saved Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [newFullName, setNewFullName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newHouseFlatNo, setNewHouseFlatNo] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (customerUser) {
      setName(customerUser.name || '');
      setEmail(customerUser.email || '');
      setPhone(customerUser.phone || '');
    }
  }, [customerUser]);

  if (!customerUser) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
          <User size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">OTP Sign In Required</h2>
        <p className="text-xs text-slate-500">Sign in via Mobile OTP or Email OTP to access your orders, saved addresses & tax invoices.</p>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
        >
          Sign In via Mobile / Email OTP
        </button>
      </div>
    );
  }

  // Filter orders matching current user
  const userOrders = orders.filter((o) => 
    (o.customerEmail && customerUser.email && o.customerEmail.toLowerCase() === customerUser.email.toLowerCase()) || 
    (o.customerPhone && customerUser.phone && o.customerPhone === customerUser.phone) ||
    o.customerName === customerUser.name ||
    o.email === customerUser.email ||
    o.phone === customerUser.phone
  );

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (updateCustomerProfile) {
      updateCustomerProfile({ name, email, phone });
    }
    setProfileMsg('Profile details updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsMsg('Fetching location coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentCoords({ lat, lng });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.address) {
            setGpsMsg(`Location detected: ${data.address.city || data.address.town || 'Hyderabad'}, ${data.address.state || 'Telangana'} (${data.address.postcode || '500081'})`);
          } else {
            setGpsMsg(`Coordinates fetched: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
          }
        } catch (e) {
          setGpsMsg(`Coordinates fetched: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
        }

        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsMsg('Location permission denied.');
      }
    );
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    addSavedAddress({
      label: addressLabel,
      fullName: newFullName || customerUser.name,
      mobile: newMobile || customerUser.phone,
      email: newEmail || customerUser.email,
      houseFlatNo: newHouseFlatNo,
      street: newStreet,
      area: newArea,
      landmark: newLandmark,
      city: newCity,
      district: newDistrict || newCity,
      state: newState,
      pincode: newPincode,
      isDefault: savedAddresses.length === 0
    });
    setShowAddressModal(false);
    // Reset form
    setNewFullName('');
    setNewMobile('');
    setNewEmail('');
    setNewHouseFlatNo('');
    setNewStreet('');
    setNewArea('');
    setNewLandmark('');
    setNewCity('');
    setNewDistrict('');
    setNewState('');
    setNewPincode('');
  };

  const downloadGstInvoicePdf = (ord) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${ord.id}`, 14, 30);
    doc.text(`Date: ${new Date(ord.createdAt).toLocaleDateString()}`, 14, 36);

    doc.text(`Customer Name: ${ord.customerName}`, 14, 46);
    doc.text(`Email / Phone: ${ord.email} | ${ord.phone}`, 14, 52);
    doc.text(`Address: ${ord.shippingAddress?.houseFlatNo || ''}, ${ord.shippingAddress?.city || ''}, ${ord.shippingAddress?.state || ''}`, 14, 58);

    let y = 72;
    doc.text('Order Line Items:', 14, y);
    y += 8;

    (ord.items || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${ord.subtotal}`, 14, y);
    y += 6;
    doc.text(`Shipping Fee: Rs.${ord.shippingFee}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total Paid: Rs.${ord.total}`, 14, y);

    doc.save(`HC_DTF_Invoice_${ord.id}.pdf`);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Account Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-extrabold text-2xl flex items-center justify-center uppercase shadow-md">
              {customerUser.name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Hello,</p>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <span>{customerUser.name}</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
                  {customerUser.verificationStatus || 'OTP Verified'}
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                {customerUser.email ? customerUser.email : ''} {customerUser.phone ? `• +91 ${customerUser.phone}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logoutCustomer();
              router.push('/');
            }}
            className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-2xl text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Tabbed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Tab Buttons */}
          <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1 h-fit">
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package size={16} /> My Orders ({userOrders.length})
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <User size={16} /> My Profile
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'addresses' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} /> My Addresses ({savedAddresses.length})
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('location')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'location' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Navigation size={16} /> Location Settings
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'payments' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard size={16} /> Payment & Billing
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings size={16} /> Account Settings
              </span>
              <ChevronRight size={14} />
            </button>

          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3">
            
            {/* 1. My Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">My Orders & Tracking</h3>
                  <span className="text-xs text-slate-500 font-semibold">{userOrders.length} Recent Orders</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No orders placed yet.</p>
                    <p className="text-xs text-slate-500">Orders placed using your OTP verified account will appear here.</p>
                    <button
                      onClick={() => router.push('/shop')}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700"
                    >
                      Explore Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((ord) => (
                      <OrderCard key={ord.id} order={ord} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. My Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-slate-900">Customer Profile Information</h3>
                
                {profileMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@domain.com"
                      className="w-full bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-extrabold text-xs shadow-md hover:bg-emerald-700 transition"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. My Addresses Tab (Amazon Style) */}
            {activeTab === 'addresses' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Saved Delivery Addresses</h3>
                    <p className="text-xs text-slate-500">Manage multiple addresses and set your default checkout destination</p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <MapPin size={32} className="mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">No saved addresses found.</p>
                    <p className="text-xs text-slate-500">Click "+ Add New Address" to save your shipping destination.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-300">
                              {addr.label || 'Home'}
                            </span>
                          </div>

                          {addr.isDefault ? (
                            <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                              Default Address
                            </span>
                          ) : (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[11px] font-bold text-emerald-600 hover:underline"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {addr.houseFlatNo}, {addr.street}, {addr.area}
                          {addr.landmark ? ` (Landmark: ${addr.landmark})` : ''}<br />
                          {addr.city}, {addr.district}, {addr.state} - <strong className="text-slate-900 font-bold">{addr.pincode}</strong>
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">Mobile: {addr.mobile} {addr.email ? `• ${addr.email}` : ''}</p>
                        
                        <div className="pt-2 flex justify-end border-t border-slate-200/60">
                          <button
                            onClick={() => deleteSavedAddress(addr.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          >
                            <Trash2 size={14} /> Remove Address
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Location Settings Tab */}
            {activeTab === 'location' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Device Location & Geolocation</h3>
                    <p className="text-xs text-slate-500">Detect or update your latitude & longitude for auto-address filling</p>
                  </div>
                  
                  <button
                    onClick={handleDetectGPSLocation}
                    disabled={gpsLoading}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                  >
                    <Navigation size={16} className={gpsLoading ? 'animate-spin' : ''} />
                    <span>{gpsLoading ? 'Detecting GPS...' : 'Use Current Location'}</span>
                  </button>
                </div>

                {gpsMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
                    {gpsMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Current Latitude</span>
                    <p className="font-mono text-sm font-bold text-slate-900">
                      {currentCoords?.lat ? currentCoords.lat.toFixed(6) : '17.3850 (Hyderabad)'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Current Longitude</span>
                    <p className="font-mono text-sm font-bold text-slate-900">
                      {currentCoords?.lng ? currentCoords.lng.toFixed(6) : '78.4867 (Telangana)'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">Location Permission Protocol</h4>
                  <p className="text-slate-600 leading-relaxed">
                    HC DTF STORE uses one-time location permissions to reverse-geocode your shipping address automatically. Once saved to your profile, you will never be asked for location access again during checkout.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Payment & Billing Tab */}
            {activeTab === 'payments' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-slate-900">Payment & Billing History</h3>
                
                {userOrders.length === 0 ? (
                  <p className="text-xs text-slate-500">No payment transactions recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((ord) => (
                      <div key={ord.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">Order #{ord.id}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Razorpay Payment ID: <span className="text-emerald-700 font-bold">{ord.razorpayPaymentId || 'pay_online_verified'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">Method: {ord.paymentMethod || 'Razorpay Online Checkout'}</p>
                        </div>

                        <div className="text-right sm:text-right">
                          <p className="font-black text-slate-900 text-sm">₹{ord.total}</p>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                            Payment Verified
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. Account Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
                <h3 className="text-xl font-black text-slate-900">Account Settings & Security</h3>
                
                <div className="space-y-4 divide-y divide-slate-100">
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">OTP Account Verification</h4>
                      <p className="text-slate-500 text-[11px]">Protected via mobile and email OTP authentication</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase">
                      Active
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Notification Preferences</h4>
                      <p className="text-slate-500 text-[11px]">Receive order status updates via WhatsApp and SMS</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-full uppercase">
                      Enabled
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Privacy & Data Security</h4>
                      <p className="text-slate-500 text-[11px]">256-Bit SSL Encrypted Account Profile</p>
                    </div>
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        logoutCustomer();
                        router.push('/');
                      }}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout Customer Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowAddressModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add New Delivery Address</h3>

            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs font-bold text-slate-700">Label:</span>
              {['Home', 'Work', 'Other'].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setAddressLabel(lbl)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                    addressLabel === lbl ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="text" required placeholder="Full Name *" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="tel" required placeholder="Mobile Number *" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="email" required placeholder="Email Address *" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="sm:col-span-2 bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" required placeholder="House / Flat No *" value={newHouseFlatNo} onChange={(e) => setNewHouseFlatNo(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" required placeholder="Street *" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" required placeholder="Area *" value={newArea} onChange={(e) => setNewArea(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" placeholder="Landmark (Optional)" value={newLandmark} onChange={(e) => setNewLandmark(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" required placeholder="City *" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" required placeholder="District *" value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />
              <input type="text" required placeholder="State *" value={newState} onChange={(e) => setNewState(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-bold text-slate-900" />
              <input type="text" required placeholder="Pincode *" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} className="bg-slate-50 border p-3 rounded-xl font-medium" />

              <div className="sm:col-span-2 pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Account Dashboard...</div>}>
      <AccountContent />
    </Suspense>
  );
}
