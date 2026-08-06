'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ExternalLink, 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  ShieldCheck,
  Clock3
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { TRACKING_STAGES } from '@/lib/store';
import jsPDF from 'jspdf';

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, settings } = useStore();

  const orderId = params.id;
  const order = orders.find((o) => o.id.toUpperCase() === orderId?.toUpperCase());

  if (!order) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
          <Package size={40} className="mx-auto text-slate-400" />
          <h2 className="text-2xl font-black text-slate-900">Order #{orderId} Not Found</h2>
          <p className="text-xs text-slate-500">Please check your Order ID or contact support.</p>
          <button
            onClick={() => router.push('/track-order')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition"
          >
            Back to Order Search
          </button>
        </div>
      </div>
    );
  }

  const hasCourierAssigned = Boolean(order.courierName || order.trackingNumber);
  const hasTrackingUrl = Boolean(order.courierWebsite);

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

    let y = 78;
    doc.text('Line Items:', 14, y);
    y += 8;

    order.items.forEach((item, index) => {
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

  const timelineList = order.timeline?.length > 0 ? order.timeline : TRACKING_STAGES.map((st, idx) => ({
    stageId: st.id,
    label: st.label,
    timestamp: idx <= (order.currentStageIndex || 0) ? new Date().toLocaleString() : 'Pending',
    status: st.desc,
    completed: idx <= (order.currentStageIndex || 0)
  }));

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

        {/* Prominent Delivery Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Official Live Shipment Tracker
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">Order #{order.id}</h1>
              <p className="text-xs text-slate-300 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Estimated Delivery Date</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {order.expectedDeliveryDate || '3-4 Days'}
              </span>
              {order.deliveryTimeSlot && (
                <span className="text-[11px] text-emerald-200 font-bold block">Slot: {order.deliveryTimeSlot}</span>
              )}
            </div>
          </div>

          {order.isDelayed && (
            <div className="p-4 bg-rose-950/90 border border-rose-700 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-3">
              <AlertTriangle size={20} className="text-rose-400 shrink-0" />
              <div>
                <span className="text-rose-100 font-black block">Delayed by {order.delayDays || 1} Day(s)</span>
                <span className="text-rose-300">{order.delayReason || 'Transit route weather checkpost bottleneck'}</span>
              </div>
            </div>
          )}
        </div>

        {/* HORIZONTAL 9-STAGE PROGRESS TRACKER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Package size={18} className="text-emerald-600" />
            9-Stage Production & Factory Dispatch Progress
          </h2>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[900px] flex items-center justify-between relative px-4">
              
              {/* Background Connecting Line */}
              <div className="absolute left-8 right-8 top-5 h-1 bg-slate-200 -z-0" />

              {/* Progress Line Filler */}
              <div 
                className="absolute left-8 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                style={{
                  width: `${((order.currentStageIndex || 0) / (TRACKING_STAGES.length - 1)) * 94}%`
                }}
              />

              {/* 9 Stages Dots */}
              {TRACKING_STAGES.map((st, idx) => {
                const isCompleted = idx <= (order.currentStageIndex || 0);
                const isCurrent = idx === (order.currentStageIndex || 0);

                return (
                  <div key={st.id} className="relative z-10 flex flex-col items-center text-center max-w-[95px]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs transition ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                    </div>

                    <p className={`text-[11px] font-extrabold mt-3 leading-tight ${
                      isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </p>

                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {timelineList[idx]?.timestamp !== 'Pending' ? timelineList[idx]?.timestamp : ''}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* COURIER DISPATCH CARD */}
        {!hasCourierAssigned ? (
          /* Case 1: Admin has NOT assigned courier yet */
          <div className="bg-amber-50/80 border border-amber-200 p-6 sm:p-8 rounded-3xl text-xs text-amber-900 flex items-center gap-4 shadow-sm">
            <Clock3 size={24} className="text-amber-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm mb-1">Dispatch Preparation in Progress</h3>
              <p className="font-medium leading-relaxed">
                Your order is currently being prepared for dispatch. Courier details will appear once your order has been shipped.
              </p>
            </div>
          </div>
        ) : (
          /* Case 2: Admin HAS assigned courier details */
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck size={18} className="text-emerald-600" />
              Logistics & Courier Partner Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Courier Partner</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{order.courierName}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">AWB Tracking Number</span>
                <span className="font-mono font-black text-emerald-700 text-sm mt-0.5 block">
                  {order.trackingNumber || 'Pending'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Shipping Date</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                  {order.shippingDate || 'Pending'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Delivery Date</span>
                <span className="font-extrabold text-emerald-700 text-sm mt-0.5 block">
                  {order.expectedDeliveryDate || 'Pending'}
                </span>
              </div>
            </div>

            {/* Track Shipment External Button (Visible ONLY if tracking URL exists) */}
            {hasTrackingUrl && (
              <div className="pt-2">
                <a
                  href={order.courierWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition shadow-md"
                >
                  <span>Track Shipment ({order.courierName})</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Chronological Activity Feed */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Detailed Activity Timeline Log
          </h3>

          <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-2">
            {timelineList.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                  item.completed ? 'bg-emerald-600' : 'bg-slate-300'
                }`} />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{item.label}</span>
                    {item.timestamp !== 'Pending' && (
                      <span className="text-[11px] font-bold text-slate-400">({item.timestamp})</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{item.status}</p>
                  {item.notes && (
                    <p className="text-[11px] text-slate-400 italic">Note: {item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
