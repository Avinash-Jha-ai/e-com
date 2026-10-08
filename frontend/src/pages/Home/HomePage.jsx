import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Award,
  Star,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/product.api';
import { heroApi } from '../../api/hero.api';
import ProductGrid from '../../components/product/ProductGrid';
import Button from '../../components/ui/Button';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';

// Default fallback editorial slides if backend has none yet
const DEFAULT_HERO_SLIDES = [
  {
    _id: 'default-1',
    badge: 'Vanya / Modern Heritage',
    title: 'Tradition, woven for today.',
    subtitle:
      'Discover heirloom handloom sarees made for the moments that matter — timeless Indian craftsmanship, reimagined for the way you live now.',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Explore the collection',
    ctaLink: '/shop',
    layout: 'overlay',
  },
  {
    _id: 'default-2',
    badge: 'Woven by hand / Made to be remembered',
    title: 'An heirloom in the making.',
    subtitle:
      'Meet the artistry of Banarasi silk: luminous zari, considered details, and a story you will carry long after the celebration.',
    image:
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Discover Banarasi',
    ctaLink: '/shop?collection=festive',
    layout: 'overlay',
  },
];

export default function HomePage() {
  // Query 1: Hero slides and featured hero products from backend
  const { data: heroData } = useQuery({
    queryKey: ['hero-slides'],
    queryFn: () => heroApi.getHeroSlides(),
  });

  // Query 2: Catalog products from backend
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 12 }),
  });

  // Combine backend slides or hero products
  const backendSlides = (heroData?.slides || []).filter((s) => s.isActive !== false);

  // If backend has hero products without dedicated slides, create slide entries for them
  const heroProductSlides = (heroData?.heroProducts || []).map((hp) => ({
    _id: `prod-${hp._id}`,
    badge: 'Featured Drape Selection',
    title: hp.heroTagline || hp.title,
    subtitle: hp.heroSubtitle || hp.shortDescription,
    image: getProductFrontImage(hp.images),
    product: hp,
    ctaText: 'Discover Drape',
    ctaLink: `/product/${hp._id}`,
  }));

  const combinedSlides =
    backendSlides.length > 0
      ? backendSlides
      : heroProductSlides.length > 0
      ? heroProductSlides
      : DEFAULT_HERO_SLIDES;

  // Active Hero Slide Index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = combinedSlides.length;

  // Auto-advance hero slides every 5.5 seconds (paused on hover)
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slideCount);
    }, 5500);
    return () => clearInterval(interval);
  }, [slideCount, isPaused]);

  const activeSlide = combinedSlides[currentSlideIndex] || combinedSlides[0];
  const isSplitLayout = activeSlide.layout === 'split';

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slideCount);
  };

  // Product tab filter on homepage
  const [activeCatalogTab, setActiveCatalogTab] = useState('all');
  const allProducts = productsData?.products || [];

  const displayedProducts = allProducts.filter((p) => {
    if (activeCatalogTab === 'all') return true;
    if (activeCatalogTab === 'festive')
      return p.category === 'festive' || p.tags?.includes('festive');
    if (activeCatalogTab === 'wedding')
      return p.category === 'wedding' || p.tags?.includes('wedding');
    if (activeCatalogTab === 'everyday')
      return p.category === 'everyday' || p.tags?.includes('everyday');
    if (activeCatalogTab === 'silk')
      return p.category === 'silk' || p.tags?.includes('silk');
    return true;
  });

  const categoryTiles = [
    {
      id: 'everyday',
      title: 'Everyday',
      subtitle: 'Lightweight everyday drapes & pastels',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      href: '/shop?collection=everyday',
    },
    {
      id: 'festive',
      title: 'Festive',
      subtitle: 'Vibrant silks with zari embroidery',
      image:
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
      href: '/shop?collection=festive',
    },
    {
      id: 'wedding',
      title: 'Wedding',
      subtitle: 'Regal bridal trousseau & heritage brocades',
      image:
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
      href: '/shop?collection=wedding',
    },
    {
      id: 'statement',
      title: 'Statement',
      subtitle: 'Bold contemporary organza & minimal silhouettes',
      image:
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85',
      href: '/shop?collection=statement',
    },
  ];

  const slideCopy = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSlide._id || currentSlideIndex}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl space-y-4 sm:space-y-5"
      >
        <div
          className={`inline-flex items-center space-x-2 text-[10px] sm:text-[11px] uppercase tracking-wide-luxury font-semibold px-3 py-1 rounded-full border ${
            isSplitLayout
              ? 'text-wine bg-wine/5 border-gold/40'
              : 'text-gold bg-charcoal/50 backdrop-blur-md border-gold/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>{activeSlide.badge || 'Vanya / Modern Heritage'}</span>
        </div>

        {activeSlide.title && (
          <h1
            className={`font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.02] ${
              isSplitLayout ? 'text-burgundy' : 'text-cream drop-shadow-sm'
            }`}
          >
            {activeSlide.title}
          </h1>
        )}

        {activeSlide.subtitle && (
          <p
            className={`text-xs sm:text-base max-w-xl leading-relaxed font-light pt-1 ${
              isSplitLayout ? 'text-charcoal-muted' : 'text-ivory/90'
            }`}
          >
            {activeSlide.subtitle}
          </p>
        )}

        {activeSlide.product && (
          <div
            className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-brand text-xs ${
              isSplitLayout
                ? 'bg-cream border border-sand/50 text-charcoal'
                : 'bg-white/10 backdrop-blur-md border border-white/20 text-cream'
            }`}
          >
            <span className="font-medium truncate max-w-[200px]">
              {activeSlide.product.title}
            </span>
            <span className="text-gold font-semibold">
              {formatPrice(activeSlide.product.price)}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-3">
          <Link to={activeSlide.ctaLink || '/shop'}>
            <Button
              variant="primary"
              size="lg"
              className="bg-wine hover:bg-burgundy text-ivory shadow-lg flex items-center gap-2"
            >
              <span>{activeSlide.ctaText || 'Discover Drape'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/shop">
            <Button
              variant="outline"
              size="lg"
              className={
                isSplitLayout
                  ? 'border-sand text-charcoal hover:bg-cream'
                  : 'border-ivory/60 text-ivory hover:bg-ivory hover:text-charcoal backdrop-blur-xs'
              }
            >
              View All Sarees
            </Button>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-20 sm:space-y-32">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. DYNAMIC HERO SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative w-full overflow-hidden select-none group ${
          isSplitLayout
            ? 'min-h-[680px] bg-ivory lg:h-[760px]'
            : 'h-[78svh] min-h-[560px] max-h-[820px] bg-charcoal sm:h-[88svh]'
        }`}
      >
        {isSplitLayout ? (
          <div className="grid min-h-[680px] grid-cols-1 lg:h-full lg:grid-cols-2">
            <div className="order-2 flex items-center bg-ivory px-8 py-10 sm:px-14 lg:order-1 lg:px-16">
              {slideCopy}
            </div>
            <div className="relative order-1 min-h-[42vh] overflow-hidden bg-cream sm:min-h-[480px] lg:order-2 lg:min-h-full">
              {activeSlide.image && (
                <motion.img
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: 'easeOut' }}
                  src={activeSlide.image}
                  alt={activeSlide.title || ''}
                  className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide._id || currentSlideIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                {activeSlide.image && (
                  <motion.img
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6, ease: 'easeOut' }}
                    src={activeSlide.image}
                    alt={activeSlide.title || ''}
                    className="w-full h-full object-cover object-[center_25%] brightness-[0.78]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-charcoal/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/25 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[8%] top-1/2 hidden h-[28rem] w-[28rem] -translate-y-1/2 items-center justify-center rounded-full border border-gold/25 text-[22rem] font-serif font-light leading-none text-ivory/[0.07] lg:flex"
            >
              V
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-4 border border-ivory/15 sm:inset-6 lg:inset-8"
            />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-8 pb-16 text-ivory sm:justify-center sm:px-16 sm:pb-0">
              {slideCopy}
            </div>
          </>
        )}

        {/* Navigation Controls: Prev / Next */}
        {slideCount > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-charcoal/40 hover:bg-wine text-ivory/80 hover:text-ivory backdrop-blur-md border border-ivory/15 transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              aria-label="Next Slide"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-charcoal/40 hover:bg-wine text-ivory/80 hover:text-ivory backdrop-blur-md border border-ivory/15 transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-6 right-6 sm:right-12 flex items-center space-x-2 z-20 bg-charcoal/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-ivory/15">
              {combinedSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentSlideIndex
                      ? 'w-6 h-1.5 bg-gold'
                      : 'w-1.5 h-1.5 bg-ivory/40 hover:bg-ivory/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SUBTLE EDITORIAL MARQUEE                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-cream py-4 overflow-hidden border-y border-sand/40">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex items-center space-x-12 text-[11px] uppercase tracking-wide-luxury text-charcoal-muted font-medium mx-6">
            <span>DIRECT FROM ARTISAN WEAVERS</span>
            <span className="text-wine">❖</span>
            <span>100% CERTIFIED PURE HANDLOOM</span>
            <span className="text-wine">❖</span>
            <span>EXCLUSIVE SINGLE-ATELIER COLLECTION</span>
            <span className="text-wine">❖</span>
            <span>MADE TO BE REMEMBERED</span>
            <span className="text-wine">❖</span>
            <span>COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING</span>
            <span className="text-wine">❖</span>
          </div>
          <div className="flex items-center space-x-12 text-[11px] uppercase tracking-wide-luxury text-charcoal-muted font-medium mx-6">
            <span>DIRECT FROM ARTISAN WEAVERS</span>
            <span className="text-wine">❖</span>
            <span>100% CERTIFIED PURE HANDLOOM</span>
            <span className="text-wine">❖</span>
            <span>EXCLUSIVE SINGLE-ATELIER COLLECTION</span>
            <span className="text-wine">❖</span>
            <span>MADE TO BE REMEMBERED</span>
            <span className="text-wine">❖</span>
            <span>COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING</span>
            <span className="text-wine">❖</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CATEGORY TILES: FIND YOUR DRAPE                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-[10px] uppercase tracking-wide-luxury text-taupe font-semibold">
            Curated Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-light">
            Find Your Drape
          </h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            From breezy everyday silhouettes to opulent bridal brocades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryTiles.map((tile) => (
            <Link
              key={tile.id}
              to={tile.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-brand border border-sand/30 block bg-cream shadow-xs hover:shadow-md transition-shadow"
            >
              <img
                src={tile.image}
                alt={tile.title}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent group-hover:from-charcoal/90 transition-colors duration-500" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-ivory">
                <div className="transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2">
                  <h3 className="font-serif text-2xl text-cream font-normal mb-1">
                    {tile.title}
                  </h3>
                  <p className="text-[11px] text-ivory/80 line-clamp-1">
                    {tile.subtitle}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-luxury text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-2">
                  <span>Explore Edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. PRODUCT DISCOVERY: THE LATEST DROP (WITH FILTER TABS)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-sand/40 pb-6 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
              Atelier Curations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
              The Latest Drop
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              Fresh drapes. Handcrafted in limited heirloom batches.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-cream/40 p-1 rounded-full border border-sand/40">
            {[
              { id: 'all', label: 'All Sarees' },
              { id: 'festive', label: 'Festive' },
              { id: 'wedding', label: 'Wedding' },
              { id: 'everyday', label: 'Everyday' },
              { id: 'silk', label: 'Pure Silk' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCatalogTab(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  activeCatalogTab === tab.id
                    ? 'bg-wine text-ivory shadow-xs font-semibold'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid products={displayedProducts} isLoading={isProductsLoading} />

        <div className="mt-12 text-center">
          <Link to="/shop">
            <Button variant="outline" size="lg" className="border-sand text-charcoal hover:bg-wine hover:text-ivory hover:border-wine">
              <span>View Full Handloom Collection</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. ASYMMETRICAL EDITORIAL: THE FESTIVE EDIT                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-cream/40 py-20 border-y border-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden rounded-brand border border-sand/40 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=85"
              alt="Festive Saree Story"
              loading="lazy"
              className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-700"
            />
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
              Campaign Spotlight
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-charcoal font-light leading-tight">
              The Festive Heritage Edit
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Silhouettes designed for celebrations that deserve to be remembered. Each drape balances intricate gold zari borders with feather-light silk fabrics, allowing you to move through every festivity with effortless grace.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link to="/shop?collection=festive">
                <Button variant="primary" size="md">
                  Shop Festive Drapes
                </Button>
              </Link>
              <Link to="/shop?fabric=silk">
                <Button variant="outline" size="md">
                  Explore Silks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. BRAND ASSURANCE PILLARS                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-t border-sand/40">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-cream rounded-brand text-wine border border-sand/40 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-charcoal font-normal">Authentic Handloom</h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                100% certified silk mark and GI-tagged weaves directly from master artisans.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-cream rounded-brand text-wine border border-sand/40 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-charcoal font-normal">Express Delivery</h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Complimentary insured delivery with real-time tracking from dispatch to doorstep.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-cream rounded-brand text-wine border border-sand/40 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-charcoal font-normal">Direct From Our Atelier</h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Zero intermediaries. Strict quality inspection directly by the atelier.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-cream rounded-brand text-wine border border-sand/40 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-charcoal font-normal">Bespoke Drape Care</h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Complimentary fall and pico edging on every celebratory drape.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
