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
  Lock,
  RefreshCw,
  ShoppingBag,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useStore } from '@/context/StoreContext';

const TIMELINE_STAGES = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'payment_verified', label: 'Payment Verified' },
  { id: 'printing', label: 'Printing' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' }
];

export default function OrderCard({ order }) {
  const { settings, addToCart, setIsCartOpen } = useStore();

  const generatePDFInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL ORDER INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${order.id}`, 14, 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 36);

    doc.text(`Customer Name: ${order.customerName}`, 14, 46);
    doc.text(`Email / Phone: ${order.email || order.customerEmail || ''} | ${order.phone || order.customerPhone || ''}`, 14, 52);
    doc.text(`Payment Status: ${order.status}`, 14, 58);

    let y = 70;
    doc.text('Line Items:', 14, y);
    y += 8;

    (order.items || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${order.subtotal}`, 14, y);
    y += 6;
    doc.text(`State Shipping Charge: Rs.${order.shippingFee || order.shipping || 0}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Total Paid Amount: Rs.${order.total}`, 14, y);

    doc.save(`Invoice_${order.id}.pdf`);
  };

  const handleBuyAgain = () => {
    (order.items || []).forEach((item) => {
      addToCart(item, item.quantity || 1);
    });
    setIsCartOpen(true);
  };

  // Determine current timeline progress index
  const getStageIndex = (statusStr = '') => {
    const s = statusStr.toLowerCase();
    if (s.includes('delivered')) return 6;
    if (s.includes('out for delivery')) return 5;
    if (s.includes('shipped')) return 4;
    if (s.includes('packed') || s.includes('packing')) return 3;
    if (s.includes('printing')) return 2;
    if (s.includes('verified') || s.includes('paid')) return 1;
    return 0; // Placed
  };

  const currentStageIdx = getStageIndex(order.status);

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
          {order.razorpayPaymentId && (
            <p className="text-[11px] text-slate-500 font-medium">
              Razorpay Payment ID: <strong className="text-emerald-700 font-mono font-bold">{order.razorpayPaymentId}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{order.status || 'Payment Verified'}</span>
          </span>

          <span className="font-black text-slate-900 text-sm sm:text-base">
            ₹{order.total?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Amazon-Style Order Timeline Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Order Progress Timeline</h4>
          <div className="grid grid-cols-7 gap-1 relative">
            {TIMELINE_STAGES.map((stage, idx) => {
              const isPassed = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage.id} className="flex flex-col items-center text-center space-y-1 relative">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition ${
                      isPassed
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
                  >
                    {isPassed ? <Check size={12} /> : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold leading-tight ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items List */}
        <div className="space-y-3">
          {(order.items || []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-b-0">
              <img
                src={item.images?.[0] || '/images/juke_heat_press_16x24.png'}
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

        {/* Action CTAs: Download Invoice, Buy Again, View Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={generatePDFInvoice}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition flex items-center gap-2"
            >
              <FileText size={15} /> Invoice PDF
            </button>

            <button
              onClick={handleBuyAgain}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition flex items-center gap-2 shadow-md"
            >
              <RefreshCw size={14} /> Buy Again
            </button>
          </div>

          <Link
            href={`/track-order/${order.id}`}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition shadow-md flex items-center gap-1.5"
          >
            <span>Track Order</span>
            <ChevronRight size={16} />
          </Link>
        </div>

      </div>

    </div>
  );
}
