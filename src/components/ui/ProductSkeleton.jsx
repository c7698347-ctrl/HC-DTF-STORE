'use client';

import React from 'react';

export default function ProductSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-pulse"
        >
          {/* Image Aspect Ratio Skeleton */}
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
          </div>

          {/* Category Tag & Rating Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded-lg w-20" />
            <div className="h-4 bg-slate-200 rounded-lg w-12" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
          </div>

          {/* Price & Button Skeleton */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-6 bg-slate-200 rounded-lg w-16" />
              <div className="h-3 bg-slate-200 rounded-lg w-24" />
            </div>
            <div className="h-10 bg-slate-200 rounded-2xl w-20" />
          </div>
        </div>
      ))}
    </>
  );
}
