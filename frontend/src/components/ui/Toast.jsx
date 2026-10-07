import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

export default function Toast() {
  const { toasts, removeToast } = useUI();

  return (
    <div
      aria-live="polite"
      className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-charcoal text-ivory px-4 py-3.5 rounded-brand shadow-modal flex items-center justify-between border border-sand/20 space-x-3"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              {toast.type === 'success' && (
                <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
              )}
              {toast.type === 'error' && (
                <span className="w-5 h-5 rounded-full bg-wine text-ivory flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                </span>
              )}
              {toast.type === 'info' && (
                <span className="w-5 h-5 rounded-full bg-sand/30 text-ivory flex items-center justify-center shrink-0">
                  <Info className="w-3 h-3 stroke-[2.5]" />
                </span>
              )}
              <p className="text-xs font-medium text-cream truncate">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-sand/60 hover:text-ivory transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
