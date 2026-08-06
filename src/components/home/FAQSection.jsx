'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const FAQS = [
  {
    q: 'What standard heat press temperature and timing should I use for HC DTF Sheets?',
    a: 'For optimal transfers on Cotton, Poly-Cotton, and Velvet, set your heat press machine to 160°C (320°F) with medium-to-high pressure for 15 seconds. Let it cool for 10 seconds before peeling (Cold Peel) or peel warm depending on film specifications.'
  },
  {
    q: 'What is the exact sheet size of 1 Meter DTF Print Sheets?',
    a: 'We offer two standard roll/sheet sizes: 22 inches × 39 inches (22×39 1 Meter) for maximum gang sheet utility, and 12 inches × 39 inches (12×39 1 Meter) for sleeve, neck, and compact gang logos.'
  },
  {
    q: 'How durable are HC DTF transfers on clothes after washing?',
    a: 'All our DTF prints use premium TPU powder and Japanese ink formulation tested for over 50+ domestic wash cycles without cracking, color fading, or edge lifting.'
  },
  {
    q: 'Do you provide GST tax invoices for bulk business purchases?',
    a: 'Yes! Every order includes a standard 18% GST tax invoice with tax breakups. You can enter your GSTIN during checkout to claim input tax credits.'
  },
  {
    q: 'What payment options are available for checkout?',
    a: 'We accept Razorpay online payments, UPI (Google Pay, PhonePe, Paytm QR code), NetBanking, Credit/Debit cards, and Cash on Delivery (COD).'
  }
];

export default function FAQSection() {
  const { t } = useStore();
  const [openIndex, setOpenIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* FAQ Accordion Section */}
        <div>
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <HelpCircle size={14} /> Technical Assistance
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">{t('faq')}</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-100/80 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-200 ${openIndex === idx ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {openIndex === idx && (
                  <div className="p-4 sm:p-5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Luxury Newsletter Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-2xl relative overflow-hidden border border-emerald-800/40">
          <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Mail size={24} />
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white">{t('newsletterTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-300">{t('newsletterSub')}</p>

            {isSubscribed ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                <span>Thank you for subscribing! Check your inbox for your 10% discount code.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-slate-900/90 text-white text-xs px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <span>{t('subscribe')}</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
