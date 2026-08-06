'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  ShoppingBag, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  ExternalLink,
  Edit3,
  X,
  FileText,
  DollarSign,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import jsPDF from 'jspdf';

export default function AdminCustomersPage() {
  const { customers, orders, toggleCustomerBlock, updateOrderTrackingDetails } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Customer Profile Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Edit Order Tracking Modal State directly from Customer Profile
  const [editingOrderFromProfile, setEditingOrderFromProfile] = useState(null);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  const openCustomerProfile = (cust) => {
    setSelectedCustomer(cust);
  };

  const getCustomerOrders = (cust) => {
    return orders.filter(o => 
      (o.customerEmail && cust.email && o.customerEmail.toLowerCase() === cust.email.toLowerCase()) ||
      (o.customerPhone && cust.phone && o.customerPhone === cust.phone) ||
      o.customerName === cust.name
    );
  };

  const calculateLifetimeValue = (cust) => {
    const custOrders = getCustomerOrders(cust);
    return custOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  };

  const handleUpdateOrderFromProfile = (e) => {
    e.preventDefault();
    if (!editingOrderFromProfile) return;

    updateOrderTrackingDetails(editingOrderFromProfile.id, {
      courierName,
      trackingNumber,
      expectedDeliveryDate
    });

    setEditingOrderFromProfile(null);
  };

  const printInvoicePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${order.id}`, 14, 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 36);

    doc.text(`Customer Name: ${order.customerName}`, 14, 52);
    doc.text(`Email / Phone: ${order.customerEmail} | ${order.customerPhone}`, 14, 58);
    doc.text(`Shipping Address: ${order.address}`, 14, 64);

    let y = 78;
    doc.text('Line Items:', 14, y);
    y += 8;

    (order.items || []).forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${order.subtotal}`, 14, y);
    y += 6;
    doc.text(`GST (18%): Rs.${order.gst}`, 14, y);
    y += 6;
    doc.text(`Shipping Charges: Rs.${order.shipping}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Total Amount Paid: Rs.${order.total}`, 14, y);

    doc.save(`Tax_Invoice_${order.id}.pdf`);
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.email && c.email.toLowerCase().includes(q)) || 
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">OTP Verified Customer Database</h1>
          <p className="text-xs text-slate-400 mt-1">Deep profile analytics, saved delivery addresses, order history & instant logistics updates</p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search customer by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">Customer Contact Details</th>
                <th className="p-4">Verification & Last Login</th>
                <th className="p-4">Orders & Total Spent</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-bold space-y-2">
                    <Users size={36} className="mx-auto text-slate-700" />
                    <p className="text-white font-extrabold text-sm">No customers found.</p>
                    <p className="text-xs text-slate-500">Registered customers will appear here when accounts are created via OTP.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const lifetimeVal = calculateLifetimeValue(cust);
                  const custOrdersCount = getCustomerOrders(cust).length;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-850 transition">
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 font-black text-sm flex items-center justify-center uppercase shrink-0">
                            {cust.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-xs">{cust.name}</p>
                            <p className="text-[11px] text-emerald-400 font-mono font-bold">
                              {cust.phone ? `+91 ${cust.phone}` : 'Mobile Unset'}
                            </p>
                            <p className="text-[10px] text-slate-400">{cust.email || 'Email Unset'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                            <ShieldCheck size={12} /> {cust.verificationStatus || 'OTP Verified'}
                          </span>
                          <p className="text-[10px] text-slate-500">Last login: {cust.lastLogin || 'Recent'}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-white">{custOrdersCount} Orders</p>
                        <p className="text-[11px] font-extrabold text-emerald-400">₹{lifetimeVal.toLocaleString()} Spent</p>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                          cust.isBlocked ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {cust.isBlocked ? '🔴 Blocked' : '🟢 Active User'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCustomerProfile(cust)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1"
                          >
                            <Users size={14} /> Full Profile
                          </button>

                          <button
                            onClick={() => toggleCustomerBlock(cust.id)}
                            className={`p-2 rounded-xl transition ${
                              cust.isBlocked ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900' : 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                            }`}
                            title={cust.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                          >
                            <Ban size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL CUSTOMER PROFILE INSPECTOR MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedCustomer(null)} />

          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-400 font-black text-2xl flex items-center justify-center uppercase shrink-0">
                  {selectedCustomer.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <span>{selectedCustomer.name}</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-black uppercase">
                      {selectedCustomer.verificationStatus || 'OTP Verified'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mobile: <strong className="text-white">+91 {selectedCustomer.phone || 'Unset'}</strong> • Email: <strong className="text-white">{selectedCustomer.email || 'Unset'}</strong>
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Registered Date</span>
                <span className="font-bold text-white mt-0.5 block">{selectedCustomer.registrationDate || '2026-01-01'}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Last Login</span>
                <span className="font-bold text-white mt-0.5 block">{selectedCustomer.lastLogin || 'Recent'}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Total Orders</span>
                <span className="font-extrabold text-white mt-0.5 block">{getCustomerOrders(selectedCustomer).length} Orders</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Total Purchase</span>
                <span className="font-black text-emerald-400 mt-0.5 block">
                  ₹{calculateLifetimeValue(selectedCustomer).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Complete Addresses Section */}
            <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" />
                Complete Saved Delivery Addresses
              </h4>

              {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  {selectedCustomer.address || 'No saved address recorded yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-bold text-[10px] rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs mt-1">
                        {addr.houseFlatNo}, {addr.street}, {addr.area}
                        {addr.landmark ? ` (Landmark: ${addr.landmark})` : ''}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {addr.city}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500">Phone: +91 {addr.mobile} • Email: {addr.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Order History */}
            <div className="space-y-4 border-t border-slate-800 pt-4 text-xs">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <ShoppingBag size={16} className="text-emerald-400" />
                Current Orders & Complete Order History
              </h4>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {getCustomerOrders(selectedCustomer).length === 0 ? (
                  <p className="text-slate-500 text-xs italic">No orders placed by this customer yet.</p>
                ) : (
                  getCustomerOrders(selectedCustomer).map((ord) => (
                    <div key={ord.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <span className="font-black text-white">#{ord.id}</span>
                          <span className="text-slate-500 text-[10px] ml-2">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold text-[10px]">
                            {ord.status}
                          </span>
                          <span className="font-black text-white">₹{ord.total?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {ord.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img src={item.images?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ₹{item.offerPrice || item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div>
                          <p className="text-slate-400">Courier: <strong className="text-white">{ord.courierName || 'Unassigned'}</strong></p>
                          <p className="text-slate-400">AWB: <strong className="text-emerald-400 font-mono">{ord.trackingNumber || 'Pending'}</strong></p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingOrderFromProfile(ord);
                              setCourierName(ord.courierName || 'Blue Dart');
                              setTrackingNumber(ord.trackingNumber || '');
                              setExpectedDeliveryDate(ord.expectedDeliveryDate || '');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 size={13} /> Update Tracking
                          </button>

                          <button
                            onClick={() => printInvoicePDF(ord)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Download PDF Invoice"
                          >
                            <FileText size={13} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QUICK TRACKING UPDATE MODAL FROM CUSTOMER PROFILE */}
      {editingOrderFromProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setEditingOrderFromProfile(null)} />

          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-extrabold text-sm text-white">Update Tracking for Order #{editingOrderFromProfile.id}</h4>
              <button onClick={() => setEditingOrderFromProfile(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderFromProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Courier Name</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tracking Number (AWB)</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  required
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition"
              >
                Save & Update Live Tracking
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
