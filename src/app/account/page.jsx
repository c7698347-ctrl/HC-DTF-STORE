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
  Clock
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
    orders, 
    wishlist, 
    buyLater, 
    addSavedAddress, 
    deleteSavedAddress, 
    updateCustomerProfile,
    setIsAuthOpen
  } = useStore();

  const [activeTab, setActiveTab] = useState('orders');

  // Profile Edit State
  const [name, setName] = useState(customerUser?.name || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // New Saved Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
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
    o.customerName === customerUser.name
  );

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateCustomerProfile({ name, email, phone });
    setProfileMsg('Profile details updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    addSavedAddress({
      fullName: newFullName,
      mobile: newMobile,
      email: newEmail,
      houseFlatNo: newHouseFlatNo,
      street: newStreet,
      area: newArea,
      landmark: newLandmark,
      city: newCity,
      district: newDistrict,
      state: newState,
      pincode: newPincode
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
    doc.text(`GSTIN: 36ABCDE1234F1Z5`, 14, 42);

    doc.text(`Customer Name: ${ord.customerName}`, 14, 52);
    doc.text(`Email / Phone: ${ord.customerEmail} | ${ord.customerPhone}`, 14, 58);
    doc.text(`Address: ${ord.address}`, 14, 64);

    let y = 78;
    doc.text('Order Line Items:', 14, y);
    y += 8;

    (ord.items || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${ord.subtotal}`, 14, y);
    y += 6;
    doc.text(`GST (18%): Rs.${ord.gst}`, 14, y);
    y += 6;
    doc.text(`Shipping Fee: Rs.${ord.shipping}`, 14, y);
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
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-extrabold text-2xl flex items-center justify-center uppercase">
              {customerUser.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <span>{customerUser.name}</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
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
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Tabbed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Tab Buttons (NO PASSWORD ANYWHERE) */}
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
              onClick={() => setActiveTab('addresses')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'addresses' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} /> Saved Addresses ({customerUser.addresses?.length || 0})
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'wishlist' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart size={16} /> Wishlist & Buy Later
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
                <User size={16} /> Customer Profile
              </span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
                activeTab === 'invoices' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText size={16} /> GST Tax Invoices
              </span>
              <ChevronRight size={14} />
            </button>

          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3">
            
            {/* Orders Tab */}
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

            {/* Saved Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Saved Delivery Addresses</h3>
                    <p className="text-xs text-slate-500">Manage multiple addresses for fast express checkout</p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>

                {(!customerUser.addresses || customerUser.addresses.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <MapPin size={32} className="mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">No saved addresses found.</p>
                    <p className="text-xs text-slate-500">Click "+ Add New Address" to save your shipping destination.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerUser.addresses.map((addr) => (
                      <div key={addr.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.houseFlatNo}, {addr.street}, {addr.area}
                          {addr.landmark ? ` (Landmark: ${addr.landmark})` : ''}<br />
                          {addr.city}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                        <p className="text-xs text-slate-500">Phone: {addr.mobile} • {addr.email}</p>
                        
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => deleteSavedAddress(addr.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist & Buy Later Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-slate-900">Wishlist & Saved Items</h3>
                {wishlist.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                    Your wishlist is empty. Browse shop to save items for later.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {item.images?.[0] && <img src={item.images[0]} alt="" className="w-12 h-12 object-cover rounded-xl" />}
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-emerald-600 font-extrabold">₹{item.offerPrice || item.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-900">OTP Verified Customer Profile</h3>
                
                {profileMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@domain.com"
                      className="w-full bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-extrabold text-xs shadow-md hover:bg-emerald-700 transition"
                    >
                      Update Profile Details
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* GST Tax Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-900">GST Tax Invoices</h3>
                {userOrders.length === 0 ? (
                  <p className="text-xs text-slate-500">No completed orders to generate tax invoices for.</p>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((ord) => (
                      <div key={ord.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">Invoice #INV-{ord.id}</p>
                          <p className="text-slate-500">Total: ₹{ord.total} (Includes 18% GST)</p>
                        </div>
                        <button
                          onClick={() => downloadGstInvoicePdf(ord)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <FileText size={14} /> Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

            <form onSubmit={handleAddAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="text" required placeholder="Full Name *" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="tel" required placeholder="Mobile Number *" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="email" required placeholder="Email Address *" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="sm:col-span-2 bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="House / Flat No *" value={newHouseFlatNo} onChange={(e) => setNewHouseFlatNo(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="Street *" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="Area *" value={newArea} onChange={(e) => setNewArea(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" placeholder="Landmark (Optional)" value={newLandmark} onChange={(e) => setNewLandmark(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="City *" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="District *" value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="State *" value={newState} onChange={(e) => setNewState(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />
              <input type="text" required placeholder="Pincode *" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} className="bg-slate-50 border p-3 rounded-xl" />

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
