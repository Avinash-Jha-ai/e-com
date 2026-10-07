import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    neutral: 'bg-cream text-charcoal-muted border border-sand/40',
    wine: 'bg-wine text-ivory',
    rose: 'bg-rose/15 text-wine border border-rose/30',
    gold: 'bg-gold/15 text-gold-dark border border-gold/40',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    outline: 'border border-charcoal/20 text-charcoal',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-medium tracking-luxury rounded-brand ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
