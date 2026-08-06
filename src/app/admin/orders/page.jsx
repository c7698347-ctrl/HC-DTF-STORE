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
  Package
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { TRACKING_STAGES, COURIER_PARTNERS } from '@/lib/store';
import jsPDF from 'jspdf';

export default function AdminOrdersPage() {
  const { orders, updateOrderTrackingDetails } = useStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Admin Tracking Controller Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit Tracking Modal Form State
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedCourierPartner, setSelectedCourierPartner] = useState('Blue Dart');
  const [customCourierName, setCustomCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierWebsite, setCourierWebsite] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  
  // Delay states
  const [isDelayed, setIsDelayed] = useState(false);
  const [delayDays, setDelayDays] = useState(1);
  const [delayReason, setDelayReason] = useState('');

  // Timeline stage edits
  const [timelineEdits, setTimelineEdits] = useState([]);

  // Notification alert
  const [notificationMsg, setNotificationMsg] = useState('');

  const openTrackingEditor = (order) => {
    setSelectedOrder(order);
    setCurrentStageIndex(order.currentStageIndex !== undefined ? order.currentStageIndex : 0);
    
    const matchPartner = COURIER_PARTNERS.find(c => c === order.courierName);
    if (matchPartner) {
      setSelectedCourierPartner(matchPartner);
      setCustomCourierName('');
    } else if (order.courierName) {
      setSelectedCourierPartner('Other (Custom)');
      setCustomCourierName(order.courierName);
    } else {
      setSelectedCourierPartner('Blue Dart');
      setCustomCourierName('');
    }

    setTrackingNumber(order.trackingNumber || '');
    setCourierWebsite(order.courierWebsite || '');
    setShippingDate(order.shippingDate || '');
    setExpectedDeliveryDate(order.expectedDeliveryDate || '');
    setDeliveryTimeSlot(order.deliveryTimeSlot || '');
    setDispatchNotes(order.dispatchNotes || '');
    setInternalNotes(order.internalNotes || '');
    setIsDelayed(order.isDelayed || false);
    setDelayDays(order.delayDays || 1);
    setDelayReason(order.delayReason || '');

    setTimelineEdits(order.timeline || TRACKING_STAGES.map((st) => ({ 
      stageId: st.id, 
      label: st.label, 
      timestamp: 'Pending', 
      status: st.desc, 
      completed: false,
      notes: '' 
    })));
  };

  const handleSaveTracking = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const finalCourierName = selectedCourierPartner === 'Other (Custom)' ? customCourierName : selectedCourierPartner;

    updateOrderTrackingDetails(selectedOrder.id, {
      currentStageIndex: Number(currentStageIndex),
      courierName: finalCourierName,
      trackingNumber,
      courierWebsite,
      shippingDate,
      expectedDeliveryDate,
      deliveryTimeSlot,
      dispatchNotes,
      internalNotes,
      isDelayed,
      delayDays: Number(delayDays),
      delayReason,
      timeline: timelineEdits
    });

    setNotificationMsg(`Shipment & 9-stage tracking for Order #${selectedOrder.id} updated!`);
    setTimeout(() => setNotificationMsg(''), 3000);
    setSelectedOrder(null);
  };

  const handleTimelineTimestampChange = (idx, newTime) => {
    const updated = [...timelineEdits];
    updated[idx].timestamp = newTime;
    setTimelineEdits(updated);
  };

  const handleTimelineStatusChange = (idx, newStatus) => {
    const updated = [...timelineEdits];
    updated[idx].status = newStatus;
    setTimelineEdits(updated);
  };

  const printInvoicePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${order.id}`, 14, 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 36);
    doc.text(`Store GSTIN: 36ABCDE1234F1Z5`, 14, 42);

    doc.text(`Customer Name: ${order.customerName}`, 14, 52);
    doc.text(`Email / Phone: ${order.customerEmail} | ${order.customerPhone}`, 14, 58);
    doc.text(`Shipping Address: ${order.address}`, 14, 64);

    let y = 78;
    doc.text('Line Items:', 14, y);
    y += 8;

    order.items.forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${order.subtotal}`, 14, y);
    y += 6;
    doc.text(`GST (18%): Rs.${order.gst}`, 14, y);
    y += 6;
    doc.text(`Shipping Fee: Rs.${order.shipping}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Total Amount Paid: Rs.${order.total}`, 14, y);

    doc.save(`Tax_Invoice_${order.id}.pdf`);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      return matchId || matchCust;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Full Logistics & Order Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Assign Courier Partners, AWB numbers, optional tracking URLs & 9-stage pipeline</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Filter Stage:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Orders ({orders.length})</option>
            {TRACKING_STAGES.map((st) => (
              <option key={st.id} value={st.label}>{st.label}</option>
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
                <th className="p-4">Customer</th>
                <th className="p-4">Stage & Delay</th>
                <th className="p-4">Assigned Courier & AWB</th>
                <th className="p-4">Expected Delivery</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-bold space-y-2">
                    <Package size={36} className="mx-auto text-slate-700" />
                    <p className="text-white font-extrabold text-sm">No orders yet.</p>
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
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>

                    <td className="p-4 space-y-1">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-block ${
                        ord.status === 'Delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        ord.status === 'Shipped' || ord.status === 'Out For Delivery' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ord.status}
                      </span>

                      {ord.isDelayed && (
                        <span className="block text-[10px] text-rose-400 font-bold">
                          ⚠️ Delayed by {ord.delayDays || 1} day
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {ord.courierName ? (
                        <div>
                          <p className="font-bold text-white">{ord.courierName}</p>
                          <p className="text-[11px] font-mono text-emerald-400">{ord.trackingNumber || 'No AWB'}</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-bold">Unassigned (Preparing)</span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-slate-300">
                      {ord.expectedDeliveryDate || '3-4 Days'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openTrackingEditor(ord)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 transition text-xs shadow-md"
                          title="Edit Courier & 9-Stage Tracking"
                        >
                          <Edit3 size={14} /> Edit Logistics
                        </button>

                        <button
                          onClick={() => printInvoicePDF(ord)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                          title="Print PDF Tax Invoice"
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

      {/* FULL ADMIN LOGISTICS & TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />

          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white">Logistics & Tracking Controller - Order #{selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">Customer: {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-6 text-xs">
              
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                  Select Current Order Stage (1 to 9)
                </label>
                <select
                  value={currentStageIndex}
                  onChange={(e) => setCurrentStageIndex(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                >
                  {TRACKING_STAGES.map((st, idx) => (
                    <option key={st.id} value={idx}>
                      Stage {idx + 1}: {st.label} - ({st.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Courier Partner *</label>
                  <select
                    value={selectedCourierPartner}
                    onChange={(e) => setSelectedCourierPartner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  >
                    {COURIER_PARTNERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {selectedCourierPartner === 'Other (Custom)' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Enter Custom Courier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Express Cargo"
                      value={customCourierName}
                      onChange={(e) => setCustomCourierName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tracking Number (AWB)</label>
                  <input
                    type="text"
                    placeholder="e.g. AWB1049283"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Shipping Date</label>
                  <input
                    type="date"
                    value={shippingDate}
                    onChange={(e) => setShippingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Delivery Time Slot (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 02:00 PM"
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Courier Tracking URL (Optional - Shows 'Track Shipment' Button if Provided)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.delhivery.com or leave blank to hide track button"
                    value={courierWebsite}
                    onChange={(e) => setCourierWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Customer Dispatch Notes</label>
                  <input
                    type="text"
                    placeholder="Visible to customer on tracking page"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Internal Admin Notes (Private)</label>
                  <input
                    type="text"
                    placeholder="Internal store note"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-400 text-xs">
                  <input
                    type="checkbox"
                    checked={isDelayed}
                    onChange={(e) => setIsDelayed(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Mark Shipment as Delayed</span>
                </label>

                {isDelayed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Delay Days Count</label>
                      <input
                        type="number"
                        min={1}
                        value={delayDays}
                        onChange={(e) => setDelayDays(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Delay Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. Highway weather checkpost bottleneck"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-slate-800 pt-4">
                <label className="block text-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                  Manual 9-Stage Timestamps & Stage Notes
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {timelineEdits.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="font-bold text-white">{item.label}</span>
                      <input
                        type="text"
                        placeholder="Timestamp (e.g. 10:30 AM)"
                        value={item.timestamp}
                        onChange={(e) => handleTimelineTimestampChange(idx, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Stage note"
                        value={item.status}
                        onChange={(e) => handleTimelineStatusChange(idx, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
              >
                <Send size={16} /> Save & Update Customer Tracking Details
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
