import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product.api';
import { useUI } from '../../context/UIContext';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await productApi.searchProducts(query.trim());
        if (res && res.success && Array.isArray(res.products)) {
          setResults(res.products);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      closeSearch();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50"
          />

          {/* Search Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 bg-ivory border-b border-sand/60 z-50 shadow-modal max-h-[85vh] flex flex-col"
          >
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 pt-8 pb-6">
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-4">
                <span className="text-[10px] uppercase tracking-luxury text-taupe font-medium">
                  Search Catalog
                </span>
                <button
                  onClick={closeSearch}
                  className="p-1 text-charcoal-muted hover:text-wine transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input Form */}
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-taupe absolute left-0 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sarees, Banarasi silk, organza, festive drapes..."
                  className="w-full bg-transparent pl-8 pr-12 py-3 text-lg sm:text-xl font-serif text-charcoal placeholder-taupe/60 border-b border-sand/60 focus:border-wine outline-none transition-colors"
                />
                {loading && (
                  <Loader2 className="w-5 h-5 text-wine animate-spin absolute right-0" />
                )}
              </form>

              {/* Quick suggestions tags */}
              {!query && (
                <div className="pt-4 flex items-center space-x-2 flex-wrap text-xs text-taupe">
                  <span className="text-[11px] uppercase tracking-luxury">Trending:</span>
                  {['Banarasi Silk', 'Chiffon Drapes', 'Wedding Edit', 'Organza', 'Everyday Pastel'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-2.5 py-1 bg-cream hover:bg-sand/30 text-charcoal text-xs rounded-brand transition-colors my-1"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Grid */}
            {query.trim() && (
              <div className="overflow-y-auto max-w-4xl mx-auto w-full px-4 sm:px-8 pb-8 pt-2">
                {results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-taupe">
                      <span>Found {results.length} results</span>
                      <button
                        onClick={handleSubmit}
                        className="text-wine font-medium flex items-center space-x-1 hover:underline text-[11px] uppercase tracking-luxury"
                      >
                        <span>View all in shop</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {results.slice(0, 6).map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          onClick={closeSearch}
                          className="group flex space-x-3 p-2 bg-cream/30 hover:bg-cream/70 rounded-brand transition-colors border border-transparent hover:border-sand/40"
                        >
                          <div className="w-16 h-20 bg-cream shrink-0 overflow-hidden rounded-brand">
                            <img
                              src={getProductFrontImage(product.images)}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col justify-center overflow-hidden">
                            <h4 className="text-xs font-medium text-charcoal group-hover:text-wine transition-colors truncate">
                              {product.title}
                            </h4>
                            <p className="text-[11px] text-taupe truncate mt-0.5">
                              {product.shortDescription || 'Handcrafted luxury drape'}
                            </p>
                            <span className="text-xs font-semibold text-wine mt-1.5">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : !loading ? (
                  <div className="py-12 text-center text-taupe">
                    <p className="font-serif text-lg text-charcoal mb-1">
                      We couldn’t find that drape
                    </p>
                    <p className="text-xs">
                      Try searching with different keywords like “Silk”, “Festive”, or browse our full collection.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
