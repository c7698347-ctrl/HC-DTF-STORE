'use client';

import React from 'react';
import { Truck, Shield, Clock, ShieldCheck } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="bg-slate-950 text-white py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Factory Trust Guarantee
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Why Choose HC DTF STORE</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Truck size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white">Fast Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Fast & Secure Delivery Across India</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Shield size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white">2400 DPI Premium Print</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">2400 DPI • 25+ Wash Durability</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Clock size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white">Ready-To-Print DTF Transfers</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Available in 1 Meter, 22×39 & 12×39 Sizes</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white">Premium Quality Checked</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Every Order Is Quality Inspected Before Dispatch</p>
          </div>

        </div>

      </div>
    </section>
  );
}
