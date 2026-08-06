'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const REVIEWS = [
  {
    id: 1,
    name: 'Suresh Rao',
    role: 'Boutique Owner, Hyderabad',
    rating: 5,
    text: 'HC DTF STORE provides the sharpest 1 Meter DTF sheets (22×39) in the market. The Maggam blouse prints have transformed my embroidery orders - zero peel failures!',
    date: '3 days ago'
  },
  {
    id: 2,
    name: 'Meenakshi Sundaram',
    role: 'Saree Manufacturer, Coimbatore',
    rating: 5,
    text: 'The 9-Meter Gold Zari border DTF rolls saved us weeks of manual zardozi labor. Same day dispatch and GST invoice provided immediately.',
    date: '1 week ago'
  },
  {
    id: 3,
    name: 'Vikram Rajput',
    role: 'Custom Apparel Brand Owner, Mumbai',
    rating: 5,
    text: 'Extremely fast delivery and ultra crisp 2400 DPI prints. The 3D gold foil and kids superhero sheets sold out in 48 hours in our retail outlet.',
    date: '2 weeks ago'
  }
];

export default function CustomerReviews() {
  const { t } = useStore();

  return (
    <section className="py-16 bg-slate-900 text-white border-y border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Verified Client Feedback
          </div>
          <h2 className="text-2xl sm:text-4xl font-black">{t('customerReviews')}</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Trusted by 5,000+ Textile Businesses, Garment Units & Designers across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div 
              key={r.id}
              className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 transition duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-current" />
                    ))}
                  </div>
                  <Quote size={24} className="text-emerald-500/40" />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{r.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1">
                    {r.name}
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-500">{r.role}</p>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
