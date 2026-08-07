'use client';

import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check session storage guard
    const hasSeenSplash = typeof window !== 'undefined' && sessionStorage.getItem('hc_dtf_splash_shown');
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1400);

    const endTimer = setTimeout(() => {
      setIsVisible(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hc_dtf_splash_shown', 'true');
      }
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div 
      suppressHydrationWarning
      className={`fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-white uppercase font-sans">
          HC DTF STORE
        </h1>
        <div className="w-16 h-0.5 bg-emerald-500 mx-auto rounded-full" />
        <p className="text-xs sm:text-sm font-medium tracking-widest text-slate-400 uppercase">
          Premium DTF Printing
        </p>
      </div>
    </div>
  );
}
