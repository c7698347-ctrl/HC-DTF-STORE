'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  Calendar, 
  ExternalLink, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Clock3
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useStore } from '@/context/StoreContext';

export default function OrderCard({ order }) {
  const { settings } = useStore();

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
    doc.text('Items:', 14, y);
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

  const hasCourierAssigned = Boolean(order.courierName || order.trackingNumber);
  const hasTrackingUrl = Boolean(order.courierWebsite);

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
          <p className="text-[11px] text-slate-500 font-medium">Payment: <strong className="text-slate-700 font-bold">{order.paymentStatus}</strong></p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            order.status === 'Shipped' || order.status === 'Out For Delivery' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
            'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{order.status}</span>
          </span>

          <span className="font-black text-slate-900 text-sm sm:text-base">
            ₹{order.total?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Delay Warning Alert */}
        {order.isDelayed && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-1 flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-rose-900">Shipment Delayed by {order.delayDays || 1} Day(s)</p>
              <p className="text-rose-700 font-medium">{order.delayReason || 'Interstate highway transit bottleneck'}</p>
            </div>
          </div>
        )}

        {/* Order Items Gallery */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-2">
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

        {/* COURIER DISPATCH SECTION */}
        {!hasCourierAssigned ? (
          /* Case 1: Admin has NOT assigned courier yet */
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
            <Clock3 size={20} className="text-amber-600 shrink-0" />
            <p className="font-bold leading-relaxed">
              Your order is currently being prepared for dispatch. Courier details will appear once your order has been shipped.
            </p>
          </div>
        ) : (
          /* Case 2: Admin HAS assigned courier details */
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                <Truck size={16} className="text-emerald-600" />
                <span>Courier Partner: <span className="text-emerald-700">{order.courierName}</span></span>
              </div>

              {order.trackingNumber && (
                <div className="text-slate-600">
                  AWB: <span className="font-mono font-bold text-slate-900">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-medium">
              {order.shippingDate && (
                <div>Shipping Date: <strong className="text-slate-900">{order.shippingDate}</strong></div>
              )}
              {order.expectedDeliveryDate && (
                <div>Expected Delivery Date: <strong className="text-emerald-700">{order.expectedDeliveryDate}</strong></div>
              )}
              {order.deliveryTimeSlot && (
                <div>Time Slot: <strong className="text-slate-900">{order.deliveryTimeSlot}</strong></div>
              )}
              {order.dispatchNotes && (
                <div className="sm:col-span-2 text-slate-500 italic">Notes: "{order.dispatchNotes}"</div>
              )}
            </div>

            {/* Track Shipment External Button (Visible ONLY if tracking URL exists) */}
            {hasTrackingUrl && (
              <div className="pt-2">
                <a
                  href={order.courierWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <span>Track Shipment ({order.courierName})</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={generatePDFInvoice}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition flex items-center gap-2"
          >
            <FileText size={15} /> Download GST Invoice PDF
          </button>

          <Link
            href={`/track-order/${order.id}`}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition shadow-md flex items-center gap-1.5"
          >
            <span>View 9-Stage Progress</span>
            <ChevronRight size={16} />
          </Link>
        </div>

      </div>

    </div>
  );
}
