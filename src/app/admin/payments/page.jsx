'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  FileText, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  X
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminPaymentVerificationPage() {
  const { 
    orders, 
    verifyOrderPayment, 
    rejectOrderPayment, 
    requestNewPaymentScreenshot,
    addOrderInternalNotes 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('pending'); // 'pending', 'verified', 'rejected', 'all'
  
  // Screenshot Lightbox Modal State
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  // Reject Payment Modal State
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('UTR not found in bank statement');

  // Internal Notes State
  const [editingNotesOrder, setEditingNotesOrder] = useState(null);
  const [notesInput, setNotesInput] = useState('');

  const pendingPayments = orders.filter(o => o.paymentStatus === 'Verification Pending' || o.paymentStatus === 'Screenshot Required');
  const verifiedPayments = orders.filter(o => o.paymentStatus === 'Paid');
  const rejectedPayments = orders.filter(o => o.paymentStatus === 'Rejected');

  const getFilteredOrders = () => {
    let list = orders;
    if (filterTab === 'pending') {
      list = pendingPayments;
    } else if (filterTab === 'verified') {
      list = verifiedPayments;
    } else if (filterTab === 'rejected') {
      list = rejectedPayments;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(o => 
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q))
      );
    }
    return list;
  };

  const filteredOrders = getFilteredOrders();

  const handleVerify = (orderId) => {
    verifyOrderPayment(orderId);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    rejectOrderPayment(rejectingOrder.id, rejectionReason);
    setRejectingOrder(null);
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    if (!editingNotesOrder) return;
    addOrderInternalNotes(editingNotesOrder.id, notesInput);
    setEditingNotesOrder(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Manual UPI Payment Verifications</h1>
          <p className="text-xs text-slate-400 mt-1">Audit customer UPI transaction IDs, UTR numbers & payment screenshots</p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search UTR ID, customer name, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <button
          onClick={() => setFilterTab('pending')}
          className={`p-5 rounded-3xl border text-left transition ${
            filterTab === 'pending' ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px] uppercase tracking-wider">Pending Verification</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{pendingPayments.length}</p>
          <p className="text-[10px] text-amber-300/80 mt-0.5">Requires UTR bank credit check</p>
        </button>

        <button
          onClick={() => setFilterTab('verified')}
          className={`p-5 rounded-3xl border text-left transition ${
            filterTab === 'verified' ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px] uppercase tracking-wider">Verified & Paid</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{verifiedPayments.length}</p>
          <p className="text-[10px] text-emerald-300/80 mt-0.5">Moved to Printing Queue</p>
        </button>

        <button
          onClick={() => setFilterTab('rejected')}
          className={`p-5 rounded-3xl border text-left transition ${
            filterTab === 'rejected' ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px] uppercase tracking-wider">Rejected Payments</span>
            <XCircle size={18} className="text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{rejectedPayments.length}</p>
          <p className="text-[10px] text-rose-300/80 mt-0.5">Customer asked to resubmit proof</p>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setFilterTab('pending')}
          className={`px-4 py-2 rounded-xl transition ${filterTab === 'pending' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Pending Verifications ({pendingPayments.length})
        </button>
        <button
          onClick={() => setFilterTab('verified')}
          className={`px-4 py-2 rounded-xl transition ${filterTab === 'verified' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Verified Payments ({verifiedPayments.length})
        </button>
        <button
          onClick={() => setFilterTab('rejected')}
          className={`px-4 py-2 rounded-xl transition ${filterTab === 'rejected' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Rejected Payments ({rejectedPayments.length})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl transition ${filterTab === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          All Orders ({orders.length})
        </button>
      </div>

      {/* Payment Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-16 text-center border border-slate-800 space-y-3">
          <CreditCard size={40} className="mx-auto text-slate-700" />
          <h3 className="font-extrabold text-white text-base">No payment records found.</h3>
          <p className="text-xs text-slate-500">Orders submitted by customers via Manual UPI will appear here for verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {filteredOrders.map((ord) => (
            <div key={ord.id} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-xl text-slate-300">
              
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-black text-white text-base">#{ord.id}</span>
                  <p className="text-[10px] text-slate-500">{new Date(ord.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    ord.paymentStatus === 'Paid' 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                      : ord.paymentStatus === 'Rejected'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {ord.paymentStatus || 'Verification Pending'}
                  </span>

                  <span className="font-black text-white text-sm">₹{ord.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* UTR & Screenshot Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">UPI Transaction ID / UTR</span>
                  <p className="font-mono font-black text-emerald-400 text-sm break-all">
                    {ord.transactionId || 'Not Provided'}
                  </p>

                  <div className="pt-2 text-[11px]">
                    <span className="text-slate-400 block font-bold">Customer:</span>
                    <strong className="text-white">{ord.customerName}</strong>
                    <p className="text-slate-400">{ord.customerPhone} • {ord.customerEmail}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Uploaded Receipt Screenshot</span>
                  
                  {ord.paymentScreenshot ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-28">
                      <img
                        src={ord.paymentScreenshot}
                        alt="Payment Receipt"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <button
                        onClick={() => setViewingScreenshot(ord.paymentScreenshot)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition backdrop-blur-sm gap-1"
                      >
                        <Eye size={14} /> Full Inspection
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-400 italic bg-rose-950/40 p-2 rounded border border-rose-900">
                      No Screenshot Uploaded
                    </p>
                  )}
                </div>

              </div>

              {/* Order Products */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Line Items:</span>
                <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-slate-200 font-bold truncate max-w-[200px]">{item.name}</span>
                      <span className="text-slate-400">Qty: {item.quantity} × ₹{item.offerPrice || item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="text-[11px] space-y-0.5">
                <span className="text-slate-500 font-bold block">Delivery Address:</span>
                <p className="text-slate-300">{ord.address}</p>
              </div>

              {/* Rejection Reason or Internal Notes */}
              {ord.rejectionReason && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-[11px]">
                  <strong>Rejection Note sent to customer:</strong> {ord.rejectionReason}
                </div>
              )}

              {ord.internalNotes && (
                <div className="p-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl text-[11px]">
                  <strong>Internal Staff Note:</strong> {ord.internalNotes}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                
                <div className="flex items-center gap-2">
                  {ord.paymentStatus !== 'Paid' && (
                    <button
                      onClick={() => handleVerify(ord.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition flex items-center gap-1 text-xs shadow-md"
                    >
                      <CheckCircle2 size={15} /> Verify & Move to Printing
                    </button>
                  )}

                  {ord.paymentStatus !== 'Rejected' && (
                    <button
                      onClick={() => {
                        setRejectingOrder(ord);
                        setRejectionReason('UTR not found in bank statement');
                      }}
                      className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-800 transition flex items-center gap-1 text-xs"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingNotesOrder(ord);
                      setNotesInput(ord.internalNotes || '');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    title="Add Internal Note"
                  >
                    <MessageSquare size={15} />
                  </button>
                  
                  <button
                    onClick={() => requestNewPaymentScreenshot(ord.id)}
                    className="px-3 py-2 bg-amber-950 text-amber-300 hover:bg-amber-900 rounded-xl border border-amber-800 font-bold text-[11px] transition"
                    title="Request New Screenshot"
                  >
                    Ask New Screenshot
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* FULL SCREENSHOT LIGHTBOX MODAL */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setViewingScreenshot(null)} />

          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white">Full Resolution Payment Receipt Screenshot</h3>
              <button onClick={() => setViewingScreenshot(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto rounded-2xl bg-slate-950 p-2 border border-slate-800 flex items-center justify-center">
              <img src={viewingScreenshot} alt="Full Receipt" className="max-w-full h-auto rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT REASON MODAL */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setRejectingOrder(null)} />

          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-rose-400">Reject Payment for Order #{rejectingOrder.id}</h3>
              <button onClick={() => setRejectingOrder(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UTR number 421589012345 was not received in store bank statement. Please upload valid receipt."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERNAL NOTES MODAL */}
      {editingNotesOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setEditingNotesOrder(null)} />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white">Add Internal Staff Note #{editingNotesOrder.id}</h3>
              <button onClick={() => setEditingNotesOrder(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Internal Note</label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Verified in ICICI Bank app statement at 12:45 PM by Staff Ramesh."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNotesOrder(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  Save Internal Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
