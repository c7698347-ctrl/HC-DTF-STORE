'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  ExternalLink, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Upload,
  X,
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useStore } from '@/context/StoreContext';

export default function OrderCard({ order }) {
  const { settings, resubmitOrderPaymentProof } = useStore();

  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [newTransactionId, setNewTransactionId] = useState(order.transactionId || '');
  const [newScreenshot, setNewScreenshot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePDFInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${order.id}`, 14, 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 36);
    doc.text(`GSTIN: ${settings?.gstNumber || '36ABCDE1234F1Z5'}`, 14, 42);

    doc.text(`Customer Name: ${order.customerName}`, 14, 52);
    doc.text(`Email / Phone: ${order.customerEmail} | ${order.customerPhone}`, 14, 58);
    doc.text(`Shipping Address: ${order.address}`, 14, 64);
    doc.text(`UPI UTR ID: ${order.transactionId}`, 14, 70);

    let y = 84;
    doc.text('Items:', 14, y);
    y += 8;

    (order.items || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
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

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setNewScreenshot(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResubmitSubmit = (e) => {
    e.preventDefault();
    if (!newTransactionId.trim() || !newScreenshot) {
      alert('Please provide UTR number and upload new payment screenshot receipt.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      resubmitOrderPaymentProof(order.id, {
        transactionId: newTransactionId.trim(),
        paymentScreenshot: newScreenshot
      });
      setIsSubmitting(false);
      setShowResubmitModal(false);
    }, 1000);
  };

  const hasCourierAssigned = Boolean(order.courierName || order.trackingNumber);
  const hasTrackingUrl = Boolean(order.courierWebsite);
  const isPaymentPending = order.paymentStatus === 'Verification Pending';
  const isPaymentRejected = order.paymentStatus === 'Rejected' || order.paymentStatus === 'Screenshot Required';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition hover:shadow-md">
      
      {/* Card Header Bar */}
      <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">Order #{order.id}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            UTR: <strong className="text-emerald-700 font-mono font-bold">{order.transactionId || 'Pending'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
            order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            isPaymentRejected ? 'bg-rose-100 text-rose-800 border border-rose-300' :
            'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{order.status || 'Payment Verification Pending'}</span>
          </span>

          <span className="font-black text-slate-900 text-sm sm:text-base">
            ₹{order.total?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6 space-y-5">
        
        {/* Verification Pending Alert Banner */}
        {isPaymentPending && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1 flex items-start gap-3">
            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-900">Payment Verification Pending</p>
              <p className="text-amber-800 font-medium leading-relaxed">
                "Your payment is under verification. We will verify your payment and start processing your order."
              </p>
            </div>
          </div>
        )}

        {/* Rejection Alert Banner with Resubmit Action */}
        {isPaymentRejected && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-rose-900">Payment Proof Rejected / New Screenshot Required</p>
                <p className="text-rose-700 font-medium">{order.rejectionReason || 'Please upload a clear screenshot of your completed UPI payment receipt.'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowResubmitModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md transition inline-block"
            >
              Upload New Payment Screenshot / UTR
            </button>
          </div>
        )}

        {/* Order Items Gallery */}
        <div className="space-y-3">
          {(order.items || []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-b-0">
              <img
                src={item.images?.[0] || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=300'}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.name}</h4>
                <p className="text-xs text-slate-500 font-medium">Quantity: {item.quantity} × ₹{item.offerPrice || item.price}</p>
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                ₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={generatePDFInvoice}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition flex items-center gap-2"
          >
            <FileText size={15} /> Download Tax Invoice PDF
          </button>

          <Link
            href={`/track-order/${order.id}`}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition shadow-md flex items-center gap-1.5"
          >
            <span>View Live Order Status</span>
            <ChevronRight size={16} />
          </Link>
        </div>

      </div>

      {/* RESUBMIT PAYMENT PROOF MODAL */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowResubmitModal(false)} />

          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-sm text-slate-900">Resubmit Payment Proof for Order #{order.id}</h3>
              <button onClick={() => setShowResubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResubmitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">12-Digit UPI Transaction ID / UTR *</label>
                <input
                  type="text"
                  required
                  value={newTransactionId}
                  onChange={(e) => setNewTransactionId(e.target.value)}
                  placeholder="e.g. 421589012345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Payment Screenshot *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50">
                  {newScreenshot ? (
                    <img src={newScreenshot} alt="Receipt" className="w-28 h-36 object-cover rounded-xl mx-auto border" />
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-emerald-600 mb-1" />
                      <input type="file" required accept="image/*" onChange={handleScreenshotUpload} className="hidden" id="resubmit-file" />
                      <label htmlFor="resubmit-file" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer inline-block">
                        Choose Image File
                      </label>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newTransactionId.trim() || !newScreenshot}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Submitting New Proof...' : 'Resubmit Payment Proof'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
