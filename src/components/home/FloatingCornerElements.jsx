'use client';

import React from 'react';
import { Sparkles, Heart, Star, Flame, Layers } from 'lucide-react';

export default function FloatingCornerElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none">
      
      {/* Top Left Corner Floating Sparkle */}
      <div className="absolute top-24 left-6 text-emerald-500/25 animate-bounce duration-[4000ms]">
        <Sparkles size={22} />
      </div>

      {/* Top Right Corner Floating Star */}
      <div className="absolute top-28 right-8 text-amber-500/20 animate-pulse duration-[3000ms]">
        <Star size={20} className="fill-current" />
      </div>

      {/* Bottom Left Corner Floating Heart */}
      <div className="absolute bottom-32 left-8 text-rose-500/20 animate-bounce duration-[5000ms]">
        <Heart size={20} className="fill-current" />
      </div>

      {/* Bottom Right Corner Floating Flame */}
      <div className="absolute bottom-36 right-10 text-emerald-600/20 animate-pulse duration-[4500ms]">
        <Layers size={22} />
      </div>

    </div>
  );
}
