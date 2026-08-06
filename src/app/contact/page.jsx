'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ContactPage() {
  const { settings } = useStore();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Bulk DTF Printing Inquiries
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900">Contact HC DTF STORE</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Have questions about custom 1 Meter gang roll printing, Maggam blouse cutouts, or bulk dealership rates? Contact our Hyderabad production team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Customer Helpline</h4>
              <p className="text-xs text-slate-600">{settings.phone}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Mail size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Factory Email</h4>
              <p className="text-xs text-slate-600">{settings.email}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Factory Address</h4>
              <p className="text-xs text-slate-600">{settings.address}</p>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Send Us a Direct Inquiry</h3>

            {submitted ? (
              <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-bold space-y-2 text-center">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <p className="text-base font-extrabold">Inquiry Sent Successfully!</p>
                <p className="text-slate-600">Our DTF printing specialist will contact you on WhatsApp / Phone within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input type="text" required placeholder="Suresh Rao" className="w-full bg-slate-50 border rounded-xl p-3" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                    <input type="tel" required placeholder="+91 98765 43210" className="w-full bg-slate-50 border rounded-xl p-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input type="email" required placeholder="suresh@textiles.com" className="w-full bg-slate-50 border rounded-xl p-3" />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message / Custom Gang Sheet Details *</label>
                  <textarea rows={4} required placeholder="Describe your gang sheet sizes (22x39 or 12x39) or blouse design requirement..." className="w-full bg-slate-50 border rounded-xl p-3"></textarea>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <span>Submit Inquiry</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
