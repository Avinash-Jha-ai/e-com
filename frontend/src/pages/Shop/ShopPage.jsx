import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi } from '../../api/product.api';
import ProductGrid from '../../components/product/ProductGrid';
import Button from '../../components/ui/Button';

const priceRanges = {
  'under-2500': { maxPrice: 2499.99 },
  '2500-5000': { minPrice: 2500, maxPrice: 5000 },
  '5000-10000': { minPrice: 5000, maxPrice: 10000 },
  'above-10000': { minPrice: 10000.01 },
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';
  const collectionParam = searchParams.get('collection') || '';
  const fabricParam = searchParams.get('fabric') || '';

  // Local filter states
  const [selectedOccasion, setSelectedOccasion] = useState(collectionParam);
  const [selectedFabric, setSelectedFabric] = useState(fabricParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedOccasion(collectionParam);
    setSelectedFabric(fabricParam);
  }, [collectionParam, fabricParam]);

  const priceFilter = priceRanges[selectedPriceRange] || {};

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'shop', page, searchQuery, selectedOccasion, selectedFabric, selectedPriceRange, inStockOnly, sortBy],
    queryFn: () => productApi.getProducts({
      page,
      limit: 12,
      search: searchQuery || undefined,
      occasion: selectedOccasion || undefined,
      fabric: selectedFabric || undefined,
      minPrice: priceFilter.minPrice,
      maxPrice: priceFilter.maxPrice,
      inStock: inStockOnly || undefined,
      sort: sortBy === 'price-low' ? 'price-asc' : sortBy === 'price-high' ? 'price-desc' : undefined,
    }),
    keepPreviousData: true,
  });

  const rawProducts = data?.products || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalProducts: rawProducts.length };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSelectedOccasion('');
    setSelectedFabric('');
    setSelectedPriceRange('');
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    !!selectedOccasion || !!selectedFabric || !!selectedPriceRange || inStockOnly || !!searchQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
      {/* 1. Shop Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
          The Saree Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-light">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Handloom Sarees'}
        </h1>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Heirloom craft, rich weaves, and contemporary drapes tailored for modern elegance.
        </p>
      </div>

      {/* 2. Controls Bar: Filters Toggle, Item Count, Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-sand/40 mb-8 text-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-cream rounded-brand text-charcoal hover:text-wine font-medium border border-sand/40"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <span className="text-taupe uppercase tracking-luxury font-medium text-[11px]">
            {pagination.totalProducts} Sarees Found
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-taupe uppercase tracking-luxury text-[11px] hidden sm:inline">
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-cream/70 border border-sand/60 rounded-brand px-3.5 py-1.5 pr-8 text-xs font-medium text-charcoal outline-none focus:border-wine cursor-pointer"
            >
              <option value="newest">Newest Drops</option>
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-taupe absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Main Grid Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-28 bg-cream/20 p-5 rounded-brand border border-sand/30">
          <div className="flex justify-between items-center pb-2 border-b border-sand/30">
            <span className="text-xs uppercase tracking-luxury font-semibold text-charcoal">
              Refine By
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-wine hover:underline uppercase tracking-luxury font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Occasion / Collection Filter */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] uppercase tracking-luxury font-semibold text-charcoal-muted">
              Occasion
            </h4>
            <div className="space-y-1.5 text-xs text-charcoal">
              {[
                { id: '', label: 'All Occasions' },
                { id: 'festive', label: 'Festive Celebrations' },
                { id: 'wedding', label: 'Bridal & Wedding' },
                { id: 'everyday', label: 'Everyday Light Drapes' },
                { id: 'statement', label: 'Statement Cocktail' },
              ].map((occ) => (
                <label key={occ.id} className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="occasion"
                    checked={selectedOccasion === occ.id}
                    onChange={() => setSelectedOccasion(occ.id)}
                    className="accent-wine text-wine w-3.5 h-3.5"
                  />
                  <span className={selectedOccasion === occ.id ? 'font-medium text-wine' : 'text-charcoal-muted'}>
                    {occ.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Fabric Filter */}
          <div className="space-y-2.5 pt-4 border-t border-sand/30">
            <h4 className="text-[11px] uppercase tracking-luxury font-semibold text-charcoal-muted">
              Fabric
            </h4>
            <div className="space-y-1.5 text-xs text-charcoal">
              {[
                { id: '', label: 'All Fabrics' },
                { id: 'silk', label: 'Pure Banarasi Silk' },
                { id: 'organza', label: 'Tissue & Organza' },
                { id: 'chiffon', label: 'Pure Chiffon' },
                { id: 'georgette', label: 'Embroidered Georgette' },
                { id: 'linen', label: 'Handloom Linen' },
              ].map((fab) => (
                <label key={fab.id} className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="fabric"
                    checked={selectedFabric === fab.id}
                    onChange={() => setSelectedFabric(fab.id)}
                    className="accent-wine text-wine w-3.5 h-3.5"
                  />
                  <span className={selectedFabric === fab.id ? 'font-medium text-wine' : 'text-charcoal-muted'}>
                    {fab.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5 pt-4 border-t border-sand/30">
            <h4 className="text-[11px] uppercase tracking-luxury font-semibold text-charcoal-muted">
              Price Range
            </h4>
            <div className="space-y-1.5 text-xs text-charcoal">
              {[
                { id: '', label: 'All Prices' },
                { id: 'under-2500', label: 'Under ₹2,500' },
                { id: '2500-5000', label: '₹2,500 – ₹5,000' },
                { id: '5000-10000', label: '₹5,000 – ₹10,000' },
                { id: 'above-10000', label: 'Above ₹10,000' },
              ].map((p) => (
                <label key={p.id} className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === p.id}
                    onChange={() => setSelectedPriceRange(p.id)}
                    className="accent-wine text-wine w-3.5 h-3.5"
                  />
                  <span className={selectedPriceRange === p.id ? 'font-medium text-wine' : 'text-charcoal-muted'}>
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="pt-4 border-t border-sand/30">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-wine rounded w-3.5 h-3.5"
              />
              <span className="text-xs font-medium text-charcoal">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-9">
          <ProductGrid
            products={rawProducts}
            isLoading={isLoading}
            onResetFilters={clearAllFilters}
            gridClassName="grid-cols-2 xl:grid-cols-3"
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 mt-16 pt-8 border-t border-sand/40">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 text-charcoal hover:text-wine disabled:opacity-30 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-brand text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-wine text-ivory'
                        : 'text-charcoal hover:bg-cream'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="p-2 text-charcoal hover:text-wine disabled:opacity-30 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 4. Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-ivory z-50 p-6 flex flex-col shadow-modal overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand/40 mb-6">
                <h3 className="font-serif text-xl text-charcoal">Filter Sarees</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-taupe hover:text-wine"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile filter controls */}
              <div className="space-y-6 flex-1">
                {/* Occasion */}
                <div>
                  <h4 className="text-xs uppercase tracking-luxury font-semibold mb-2 text-charcoal-muted">
                    Occasion
                  </h4>
                  <div className="space-y-2 text-xs">
                    {['', 'festive', 'wedding', 'everyday', 'statement'].map((occ) => (
                      <label key={occ} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="mobile-occasion"
                          checked={selectedOccasion === occ}
                          onChange={() => setSelectedOccasion(occ)}
                          className="accent-wine"
                        />
                        <span className="capitalize">{occ || 'All Occasions'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-luxury font-semibold mb-2 text-charcoal-muted">
                    Fabric
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { id: '', label: 'All Fabrics' },
                      { id: 'silk', label: 'Pure Banarasi Silk' },
                      { id: 'organza', label: 'Tissue & Organza' },
                      { id: 'chiffon', label: 'Pure Chiffon' },
                      { id: 'georgette', label: 'Embroidered Georgette' },
                      { id: 'linen', label: 'Handloom Linen' },
                    ].map((fabric) => (
                      <label key={fabric.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="mobile-fabric"
                          checked={selectedFabric === fabric.id}
                          onChange={() => setSelectedFabric(fabric.id)}
                          className="accent-wine"
                        />
                        <span>{fabric.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-xs uppercase tracking-luxury font-semibold mb-2 text-charcoal-muted">
                    Price Range
                  </h4>
                  <div className="space-y-2 text-xs">
                    {['', 'under-2500', '2500-5000', '5000-10000', 'above-10000'].map((p) => (
                      <label key={p} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="mobile-price"
                          checked={selectedPriceRange === p}
                          onChange={() => setSelectedPriceRange(p)}
                          className="accent-wine"
                        />
                        <span>{p ? p.replace('-', ' to ') : 'All Prices'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-xs font-medium text-charcoal">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) => setInStockOnly(event.target.checked)}
                    className="accent-wine rounded"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              <div className="pt-6 border-t border-sand/40 flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    clearAllFilters();
                    setIsMobileFilterOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
