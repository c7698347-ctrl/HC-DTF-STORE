'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, Flame, Check } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HeatPressSection() {
  const { machineConfig = {}, machines = [] } = useStore();

  // 1. Strict Hide Check: If machine section is disabled in admin, return null immediately (0 space, completely removed from DOM)
  if (machineConfig.enabled === false) return null;

  // 2. Filter visible machines dynamically from centralized machines state
  const visibleMachines = (machines || []).filter((m) => m.visible !== false);
  if (visibleMachines.length === 0) return null;

  const getWhatsAppBuyUrl = (modelName) => {
    const text = `Hello HC DTF STORE 👋\n\nI want to purchase a Commercial Heat Press Machine.\n\nModel:\n${modelName}\n\nPlease provide complete details.`;
    return `https://wa.me/917207528651?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 space-y-10 relative overflow-hidden">
        
        {/* Subtle Heat Glow Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header (Dynamic from machineConfig) */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-800/80 inline-flex items-center gap-1.5">
              <Flame size={14} className="text-emerald-400" /> Commercial Garment Machinery
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {machineConfig.sectionTitle || '🔥 JUKE HEAT PRESS MACHINES'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {machineConfig.sectionSubtitle || 'Professional Heavy Duty Heat Press Machines for Commercial DTF Printing'}
            </p>
          </div>

          <Link
            href="/shop?cat=HEAT+PRESS+MACHINES"
            className="text-xs sm:text-sm font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 transition"
          >
            <span>View All Machinery</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Product Cards Grid (Dynamic from machines array) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {visibleMachines.map((m) => {
            const waUrl = getWhatsAppBuyUrl(m.name);
            const stockStatus = m.stock > 10 
              ? `${m.stock} Available` 
              : m.stock > 0 
              ? `Only ${m.stock} Left` 
              : 'Out of Stock';

            return (
              <div
                key={m.id}
                className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 hover:border-emerald-500/50 shadow-2xl transition duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
              >
                
                {/* Top Image Preview */}
                <div className="relative aspect-[16/10] bg-white rounded-2xl overflow-hidden border border-slate-700/60 p-4 flex items-center justify-center shadow-inner">
                  <img
                    src={m.image || '/images/juke_heat_press_16x24.png'}
                    alt={m.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Brand Tag */}
                  <span className="absolute top-3 left-3 bg-black/90 text-white text-[10px] font-black px-3 py-1 rounded-xl border border-slate-700 uppercase tracking-widest">
                    JUKE Commercial
                  </span>

                  {/* Stock Badge */}
                  <span className={`absolute top-3 right-3 text-[10px] font-black px-3 py-1 rounded-xl shadow-md ${
                    m.stock > 0 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md'
                  }`}>
                    {stockStatus}
                  </span>
                </div>

                {/* Machine Details & Features */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition">
                      {m.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* Specifications Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Size: {m.size}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Voltage: {m.voltage || '220V 50Hz'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Teflon Coated Platen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{m.warranty || '1 Year Tech Warranty'}</span>
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-black text-white">₹{m.price?.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Commercial Net Price</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 hover:scale-[1.02] transition duration-200"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>{m.buttonText || 'Buy Now'}</span>
                  </a>

                  <Link
                    href={`/product/${m.slug || m.id}`}
                    className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye size={15} />
                    <span>View Details</span>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
