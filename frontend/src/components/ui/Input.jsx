import React from 'react';

export default function Input({
  label,
  error,
  type = 'text',
  className = '',
  id,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] uppercase tracking-luxury text-charcoal-muted font-medium"
        >
          {label} {required && <span className="text-wine">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full bg-cream/40 border ${
            error ? 'border-wine focus:ring-wine' : 'border-sand/60 focus:border-wine focus:bg-white'
          } rounded-brand px-4 py-3 text-sm text-charcoal placeholder-taupe/60 transition-colors duration-200 outline-none focus:ring-1 focus:ring-wine/20 ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[12px] text-wine font-medium pt-0.5 tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}
