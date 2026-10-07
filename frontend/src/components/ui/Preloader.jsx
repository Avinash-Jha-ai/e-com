import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Short, elegant intro
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[999] bg-ivory flex flex-col items-center justify-center select-none"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-1"
            >
              <h1 className="font-serif text-3xl sm:text-4xl tracking-wide-luxury text-burgundy font-light">
                V A N Y A
              </h1>
              <p className="text-[10px] uppercase tracking-luxury text-taupe font-medium">
                Modern Indian Luxury
              </p>
            </motion.div>

            {/* Progress line */}
            <div className="w-36 sm:w-48 h-[1.5px] bg-sand/40 mx-auto overflow-hidden relative">
              <motion.div
                className="h-full bg-wine"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <p className="text-[10px] tracking-widest text-taupe/80 font-mono">
              {String(progress).padStart(2, '0')} — 100
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
