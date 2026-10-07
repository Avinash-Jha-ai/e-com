import React from 'react';

export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col animate-pulse">
          {/* Image box skeleton */}
          <div className="aspect-[4/5] bg-cream rounded-brand" />
          
          {/* Text lines skeleton */}
          <div className="pt-3 space-y-2">
            <div className="w-16 h-2.5 bg-sand/40 rounded-brand" />
            <div className="w-3/4 h-3.5 bg-sand/50 rounded-brand" />
            <div className="w-1/2 h-3 bg-sand/30 rounded-brand" />
            <div className="w-20 h-4 bg-sand/50 rounded-brand pt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
