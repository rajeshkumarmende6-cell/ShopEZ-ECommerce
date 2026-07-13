import React from 'react';

// Product Grid Card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-4 animate-pulse">
      {/* Image box */}
      <div className="bg-slate-700/60 rounded-xl aspect-square w-full"></div>
      
      <div className="space-y-3">
        {/* Brand */}
        <div className="h-3 bg-slate-700/60 rounded w-1/4"></div>
        {/* Name */}
        <div className="h-5 bg-slate-700/60 rounded w-3/4"></div>
        
        {/* Ratings */}
        <div className="flex items-center space-x-1 pt-1">
          <div className="h-4 bg-slate-700/60 rounded w-20"></div>
        </div>

        {/* Pricing & Button row */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-slate-700/60 rounded w-1/3"></div>
          <div className="h-9 bg-slate-700/60 rounded w-10"></div>
        </div>
      </div>
    </div>
  );
}

// Category Badge skeleton
export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2.5 animate-pulse">
      {/* Category Circle */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 border border-slate-700/50 rounded-full"></div>
      {/* Name */}
      <div className="h-4 bg-slate-800 rounded w-16"></div>
    </div>
  );
}

// Product Details page skeleton
export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
      {/* Image Gallery Column */}
      <div className="space-y-4">
        <div className="bg-slate-800 aspect-square w-full rounded-2xl border border-slate-700/50"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 aspect-square rounded-xl border border-slate-700/50"></div>
          ))}
        </div>
      </div>

      {/* Info Column */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
          <div className="h-10 bg-slate-800 rounded w-3/4"></div>
          <div className="h-6 bg-slate-800 rounded w-1/4"></div>
        </div>

        <div className="h-32 bg-slate-800 rounded-xl border border-slate-700/50"></div>

        <div className="flex items-center gap-4">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        </div>

        <div className="h-12 bg-slate-800 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
