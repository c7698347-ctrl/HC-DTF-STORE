'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Printer, 
  Truck, 
  Clock, 
  Search, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Globe, 
  Send,
  X,
  FileText,
  Clock3,
  Package,
  Tag
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { COURIER_PARTNERS } from '@/lib/store';
import jsPDF from 'jspdf';

const AMAZON_ORDER_STATUSES = [
  'Ordered',
  'Payment Confirmed',
  'Printing Started',
  'Printing Completed',
  'Quality Check',
  'Packed',
  'Shipped',
  'Arrived at Courier Hub',
  'Out For Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminOrdersPage() {
  const { orders = [], updateOrderStatus, updateOrderTrackingDetails } = useStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Admin Tracking Controller Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit Form State
  const [orderStatus, setOrderStatus] = useState('Payment Confirmed');
  const [selectedCourierPartner, setSelectedCourierPartner] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  const openTrackingEditor = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status || 'Payment Confirmed');
    setSelectedCourierPartner(order.courierPartner || order.courierName || 'Delhivery');
    setTrackingNumber(order.trackingNumber || '');
    setExpectedDeliveryDate(order.expectedDeliveryDate || '');
  };

  const handleSaveTracking = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderStatus(selectedOrder.id, orderStatus);
    if (updateOrderTrackingDetails) {
      updateOrderTrackingDetails(selectedOrder.id, {
        courierPartner: selectedCourierPartner,
        courierName: selectedCourierPartner,
        trackingNumber,
        expectedDeliveryDate
      });
    }

    setNotificationMsg(`Order #${selectedOrder.id} status & tracking details updated live! Customer notified.`);
    setTimeout(() => setNotificationMsg(''), 3500);
    setSelectedOrder(null);
  };

  const printInvoicePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${order.id}`, 14, 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 36);

    doc.text(`Customer Name: ${order.customerName}`, 14, 50);
    doc.text(`Email / Phone: ${order.email || order.customerEmail || ''} | ${order.phone || order.customerPhone || ''}`, 14, 56);
    
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      doc.text(`Shipping Address: ${addr.houseFlatNo}, ${addr.street}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`, 14, 62);
    }

    let y = 78;
    doc.text('Order Items:', 14, y);
    y += 8;

    (order.items || []).forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${order.subtotal}`, 14, y);
    y += 6;
    doc.text(`State Delivery Charge: Rs.${order.shippingFee || order.shipping || 0}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Total Amount Paid: Rs.${order.total}`, 14, y);

    doc.save(`Invoice_${order.id}.pdf`);
  };

  const printShippingLabelPDF = (order) => {
    const doc = new jsPDF('portrait', 'mm', 'a6'); // A6 Shipping Label Format
    doc.setFontSize(14);
    doc.text('HC DTF STORE - EXPENSE SHIPPING LABEL', 8, 15);
    doc.setFontSize(9);
    doc.text(`Order ID: ${order.id}`, 8, 22);
    doc.text(`Courier Partner: ${order.courierPartner || order.courierName || 'Standard Express'}`, 8, 27);
    doc.text(`AWB / Tracking #: ${order.trackingNumber || 'PENDING'}`, 8, 32);

    doc.setFontSize(10);
    doc.text('SHIP TO:', 8, 42);
    doc.setFontSize(11);
    doc.text(`${order.customerName}`, 8, 48);
    doc.setFontSize(9);
    doc.text(`Phone: ${order.phone || order.customerPhone || ''}`, 8, 54);
    
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      doc.text(`${addr.houseFlatNo}, ${addr.street}`, 8, 60);
      doc.text(`${addr.area}, ${addr.city}`, 8, 65);
      doc.text(`${addr.state} - PIN: ${addr.pincode}`, 8, 70);
    } else {
      doc.text(`${order.address || ''}`, 8, 60);
    }

    doc.setFontSize(8);
    doc.text('FROM: HC DTF STORE HQ, Plot #45, Textile Hub Road, Hyderabad, Telangana - 500081', 8, 85);

    doc.save(`Shipping_Label_${order.id}.pdf`);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(o.id).toLowerCase().includes(q);
      const matchCust = (o.customerName || '').toLowerCase().includes(q);
      return matchId || matchCust;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Amazon-Style Orders & Dispatch Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Single source of truth for customer orders, status pipeline, courier partners & AWB shipping labels</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Orders ({orders.length})</option>
            {AMAZON_ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Courier & AWB</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-bold space-y-2">
                    <Package size={36} className="mx-auto text-slate-700" />
                    <p className="text-white font-extrabold text-sm">No orders found.</p>
                    <p className="text-xs text-slate-500">Real customer orders placed on checkout will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850 transition">
                    <td className="p-4">
                      <p className="font-extrabold text-white text-xs">{ord.id}</p>
                      <p className="text-[11px] text-slate-500">{new Date(ord.createdAt).toLocaleDateString()}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">{ord.phone || ord.customerPhone} • {ord.email || ord.customerEmail}</p>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-block ${
                        ord.status === 'Delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        ord.status === 'Shipped' || ord.status === 'Out For Delivery' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ord.status || 'Payment Verified'}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{ord.courierPartner || ord.courierName || 'Unassigned'}</p>
                      <p className="text-[11px] font-mono text-emerald-400">{ord.trackingNumber || 'No AWB'}</p>
                    </td>

                    <td className="p-4 font-black text-white text-sm">
                      ₹{ord.total?.toLocaleString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openTrackingEditor(ord)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 transition text-xs shadow-md"
                          title="Update Status & Tracking"
                        >
                          <Edit3 size={14} /> Update Status
                        </button>

                        <button
                          onClick={() => printShippingLabelPDF(ord)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                          title="Print Shipping Label PDF"
                        >
                          <Tag size={14} />
                        </button>

                        <button
                          onClick={() => printInvoicePDF(ord)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                          title="Print Tax Invoice PDF"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN STATUS & TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />

          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white">Update Status & Tracking - Order #{selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">Customer: {selectedOrder.customerName}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Order Status Pipeline *</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-extrabold focus:outline-none focus:border-emerald-500"
                >
                  {AMAZON_ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Courier Partner *</label>
                  <select
                    value={selectedCourierPartner}
                    onChange={(e) => setSelectedCourierPartner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-bold"
                  >
                    {COURIER_PARTNERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Tracking Number (AWB)</label>
                  <input
                    type="text"
                    placeholder="e.g. AWB1049283"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <Send size={16} /> Update & Notify Customer
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
