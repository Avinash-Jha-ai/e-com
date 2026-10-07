import React from 'react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';

export default function ProductGrid({
  products = [],
  isLoading = false,
  emptyTitle = 'No sarees found',
  emptyDescription = 'We couldn’t find any drapes matching your current filter selections.',
  onResetFilters,
  gridClassName = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}) {
  if (isLoading) {
    return <ProductSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-cream/30 rounded-brand border border-sand/30 p-8">
        <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-taupe mb-4">
          <Sparkles className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="font-serif text-2xl text-charcoal mb-1.5 font-normal">
          {emptyTitle}
        </h3>
        <p className="text-xs text-taupe max-w-sm mb-6 leading-relaxed">
          {emptyDescription}
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${gridClassName} gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12`}>
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
}
