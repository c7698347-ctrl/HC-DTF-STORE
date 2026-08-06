'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  RotateCcw, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  Instagram,
  Facebook,
  Youtube,
  CreditCard,
  Lock
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const { settings, t } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-emerald-950">
      
      {/* Value Proposition Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-900/40">
          
          <div className="flex items-center gap-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express Shipping</h4>
              <p className="text-xs text-slate-400">Same-day dispatch across India</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">HD Color Guarantee</h4>
              <p className="text-xs text-slate-400">2400 DPI & 50+ Wash Cycles</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Printing</h4>
              <p className="text-xs text-slate-400">1 Meter 22×39 & 12×39 ready</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Quality Assurance</h4>
              <p className="text-xs text-slate-400">Replacement for damaged rolls</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-white font-black text-lg">
              HC
            </div>
            <span className="font-black text-2xl text-white tracking-tight">
              HC DTF <span className="text-emerald-400">STORE</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            India's premier manufacturer and supplier of ultra-high definition Direct-To-Film (DTF) transfer sheets, 3D gold zari blouse necklines, saree border rolls, and ready-to-press garment patches.
          </p>

          <div className="pt-2 flex items-center gap-3 text-xs text-emerald-300 font-medium">
            <span>GSTIN: {settings.gstNumber}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Lock size={12} className="text-emerald-400" />
              100% Encrypted SSL
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-600 transition">
              <Instagram size={16} />
            </a>
            <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-600 transition">
              <Facebook size={16} />
            </a>
            <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-600 transition">
              <Youtube size={16} />
            </a>
            <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition">
              <MessageSquare size={16} />
            </a>
          </div>
        </div>

        {/* Quick Collections Links */}
        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">DTF Categories</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/shop?cat=DTF+Sheets" className="hover:text-emerald-400 transition">1 Meter Sheets (22×39)</Link></li>
            <li><Link href="/shop?cat=DTF+Sheets" className="hover:text-emerald-400 transition">1 Meter Sheets (12×39)</Link></li>
            <li><Link href="/shop?cat=Blouse+Designs" className="hover:text-emerald-400 transition">Maggam Blouse Necklines</Link></li>
            <li><Link href="/shop?cat=Saree+Borders" className="hover:text-emerald-400 transition">Gold Zari Saree Borders</Link></li>
            <li><Link href="/shop?cat=DTF+Patches" className="hover:text-emerald-400 transition">DTF Chest & Back Patches</Link></li>
            <li><Link href="/shop?cat=Festival+Collection" className="hover:text-emerald-400 transition">Festive Gold Foil Collection</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Customer Help</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/track-order" className="hover:text-emerald-400 transition">Track Your Order</Link></li>
            <li><Link href="/account" className="hover:text-emerald-400 transition">My Account & Invoices</Link></li>
            <li><Link href="/faq" className="hover:text-emerald-400 transition">DTF Pressing Instructions</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-emerald-400 transition">Shipping & Delivery Rates</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-400 transition">Contact Bulk Printing Team</Link></li>
          </ul>
        </div>

        {/* Store Contact & Address */}
        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
          <div className="space-y-2.5 text-slate-400">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-emerald-400 shrink-0" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={16} className="text-emerald-400 shrink-0" />
              <span>{settings.email}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} HC DTF STORE. All Rights Reserved. Designed with Direct-To-Film Precision.</p>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-medium">Accepted Payments:</span>
          <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800 font-bold text-[11px]">Razorpay</span>
          <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800 font-bold text-[11px]">UPI</span>
          <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800 font-bold text-[11px]">COD</span>
        </div>
      </div>

      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20HC%20DTF%20STORE,%20I%20want%20to%20inquire%20about%20DTF%20Print%20Sheets.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-500 hover:scale-110 transition-transform duration-300 border-2 border-white/20"
        title="Chat on WhatsApp"
      >
        <MessageSquare size={26} />
      </a>

    </footer>
  );
}
