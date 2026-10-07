import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProductImages } from '../../utils/formatters';

export default function ProductGallery({ images = [], title = 'Saree' }) {
  const allImages = getAllProductImages(images);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const activeImage = allImages[selectedIndex] || allImages[0];

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 sm:gap-6">
      {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
      {allImages.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[680px] no-scrollbar shrink-0 py-1">
          {allImages.map((imgUrl, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative w-16 sm:w-20 aspect-[4/5] bg-cream rounded-brand overflow-hidden border-2 transition-all shrink-0 focus:outline-none ${
                  isSelected
                    ? 'border-wine shadow-subtle'
                    : 'border-sand/40 opacity-70 hover:opacity-100 hover:border-sand'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1 relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-cream rounded-brand overflow-hidden border border-sand/30">
        <div
          className="w-full h-full cursor-zoom-in relative overflow-hidden"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              src={activeImage}
              alt={title}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full h-full object-cover object-top transition-transform duration-200 ${
                isZoomed ? 'scale-150 origin-[var(--zoom-x)_var(--zoom-y)]' : 'scale-100'
              }`}
              style={{
                '--zoom-x': `${zoomPos.x}%`,
                '--zoom-y': `${zoomPos.y}%`,
              }}
            />
          </AnimatePresence>

          {/* Pure Handloom watermark/badge */}
          <div className="absolute bottom-4 left-4 pointer-events-none bg-ivory/85 backdrop-blur-md px-3 py-1 rounded-brand border border-sand/40">
            <span className="text-[10px] uppercase tracking-luxury text-charcoal font-semibold">
              Handcrafted in India
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
