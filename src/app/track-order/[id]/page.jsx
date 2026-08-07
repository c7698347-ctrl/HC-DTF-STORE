'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  ShieldCheck,
  Clock3,
  Check,
  RefreshCw,
  Building,
  Sparkles
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import jsPDF from 'jspdf';

const AMAZON_TRACKING_STAGES = [
  { id: 'ordered', label: 'Ordered', desc: 'Order placed & submitted' },
  { id: 'payment_confirmed', label: 'Payment Confirmed', desc: 'Verified via Razorpay' },
  { id: 'printing_started', label: 'Printing Started', desc: '2400 DPI Printing queued' },
  { id: 'printing_completed', label: 'Printing Completed', desc: 'Printing finished' },
  { id: 'quality_check', label: 'Quality Check', desc: 'Inspected before packing' },
  { id: 'packed', label: 'Packed', desc: 'Safely packed in roll cylinder' },
  { id: 'shipped', label: 'Shipped', desc: 'Handed to courier partner' },
  { id: 'courier_hub', label: 'Arrived at Hub', desc: 'In transit at destination hub' },
  { id: 'out_for_delivery', label: 'Out For Delivery', desc: 'With local courier agent' },
  { id: 'delivered', label: 'Delivered', desc: 'Handed over to customer' }
];

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders = [], settings = {} } = useStore();

  const orderId = params.id;
  const order = orders.find((o) => String(o.id).toUpperCase() === String(orderId)?.toUpperCase());

  if (!order) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
          <Package size={40} className="mx-auto text-slate-400" />
          <h2 className="text-2xl font-black text-slate-900">Order #{orderId} Not Found</h2>
          <p className="text-xs text-slate-500">Please check your Order ID or contact support.</p>
          <button
            onClick={() => router.push('/account?tab=orders')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const generatePDFInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - OFFICIAL TAX INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${order.id}`, 14, 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 36);

    doc.text(`Customer Name: ${order.customerName}`, 14, 46);
    doc.text(`Email / Phone: ${order.email || order.customerEmail || ''} | ${order.phone || order.customerPhone || ''}`, 14, 52);

    let y = 66;
    doc.text('Line Items:', 14, y);
    y += 8;

    (order.items || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = Rs.${(item.offerPrice || item.price) * item.quantity}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.text(`Subtotal: Rs.${order.subtotal}`, 14, y);
    y += 6;
    doc.text(`State Delivery Charge: Rs.${order.shippingFee || order.shipping || 0}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total Paid: Rs.${order.total}`, 14, y);

    doc.save(`Invoice_${order.id}.pdf`);
  };

  // Determine current stage index
  const getStageIdx = (statusStr = '') => {
    const s = statusStr.toLowerCase();
    if (s.includes('delivered')) return 9;
    if (s.includes('out for delivery')) return 8;
    if (s.includes('hub') || s.includes('arrived')) return 7;
    if (s.includes('shipped')) return 6;
    if (s.includes('packed') || s.includes('packing')) return 5;
    if (s.includes('quality')) return 4;
    if (s.includes('printing completed')) return 3;
    if (s.includes('printing')) return 2;
    if (s.includes('verified') || s.includes('paid')) return 1;
    return 0; // Ordered
  };

  const currentIdx = getStageIdx(order.status);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft size={16} /> Back to My Orders
          </button>

          <button
            onClick={generatePDFInvoice}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition"
          >
            <FileText size={16} /> Download Tax Invoice PDF
          </button>
        </div>

        {/* Delivery Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Official Amazon-Style Live Tracker
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">Order #{order.id}</h1>
              <p className="text-xs text-slate-300 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Estimated Delivery</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {order.expectedDeliveryDate || '3-4 Business Days'}
              </span>
            </div>
          </div>
        </div>

        {/* AMAZON 10-STAGE HORIZONTAL TIMELINE */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Package size={18} className="text-emerald-600" />
            10-Stage Order & Shipment Progress
          </h2>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px] flex items-center justify-between relative px-4">
              
              {/* Line Filler */}
              <div 
                className="absolute left-8 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                style={{
                  width: `${(currentIdx / (AMAZON_TRACKING_STAGES.length - 1)) * 94}%`
                }}
              />

              {/* 10 Stages */}
              {AMAZON_TRACKING_STAGES.map((st, idx) => {
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={st.id} className="relative z-10 flex flex-col items-center text-center max-w-[90px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[11px] transition ${
                      isPassed 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    } ${isCurrent ? 'scale-110 ring-4 ring-emerald-300' : ''}`}>
                      {isPassed ? <Check size={14} /> : idx + 1}
                    </div>

                    <p className={`text-[10px] font-extrabold mt-2 leading-tight ${
                      isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* LOGISTICS & COURIER PARTNER INFO */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck size={18} className="text-emerald-600" />
            Courier & Shipping Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Courier Partner</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{order.courierPartner || 'Delhivery / DTDC'}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">AWB Tracking Number</span>
              <span className="font-mono font-black text-emerald-700 text-sm mt-0.5 block">
                {order.trackingNumber || 'Assigned upon dispatch'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Name</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                {order.customerName}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                {order.phone || order.customerPhone}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER ITEMS GALLERY */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Order Line Items</h3>
          <div className="space-y-3">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-b-0">
                <img
                  src={item.images?.[0] || item.image || '/images/juke_heat_press_16x24.png'}
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
        </div>

      </div>
    </div>
  );
}
