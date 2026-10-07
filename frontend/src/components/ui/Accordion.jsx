import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function Accordion({ items = [], allowMultiple = false }) {
  const [openIndexes, setOpenIndexes] = useState([0]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className="divide-y divide-sand/50 border-t border-b border-sand/50">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div key={index} className="py-3.5">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between text-left group focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-xs uppercase tracking-luxury font-medium text-charcoal group-hover:text-wine transition-colors">
                {item.title}
              </span>
              <span className="text-taupe group-hover:text-wine transition-colors ml-4">
                {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pb-1 text-xs leading-relaxed text-charcoal-muted">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
