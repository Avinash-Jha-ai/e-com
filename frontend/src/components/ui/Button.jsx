import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none uppercase tracking-luxury text-xs select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-wine text-ivory hover:bg-burgundy active:scale-[0.99] shadow-subtle',
    secondary:
      'border border-wine text-wine hover:bg-wine hover:text-ivory active:scale-[0.99]',
    dark:
      'bg-charcoal text-ivory hover:bg-charcoal-light active:scale-[0.99]',
    outline:
      'border border-sand hover:border-charcoal text-charcoal active:scale-[0.99]',
    ghost:
      'text-charcoal hover:text-wine p-0 tracking-normal capitalize font-normal',
    gold:
      'bg-gold text-charcoal hover:bg-gold-dark hover:text-ivory active:scale-[0.99]',
  };

  const sizes = {
    sm: 'h-9 px-4 text-[11px] rounded-brand',
    md: 'h-12 px-7 text-xs rounded-brand',
    lg: 'h-14 px-9 text-xs rounded-brand',
    full: 'w-full h-12 px-6 text-xs rounded-brand',
    icon: 'h-10 w-10 p-0 rounded-brand',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        variant !== 'ghost' ? sizes[size] || sizes.md : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
