import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getPriceDetails, getProductFrontImage, getAllProductImages } from '../../utils/formatters';
import Badge from '../ui/Badge';

export default function ProductCard({ product, index = 0 }) {
  const { isInWishlist, toggleWishlist, isMutating } = useWishlist();
  const { addToCart, isAdding } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const productId = product._id;
  const isSaved = isInWishlist(productId);
  const images = getAllProductImages(product.images, index);
  const frontImage = getProductFrontImage(product.images, index);
  const secondaryImage = images.length > 1 ? images[1] : frontImage;

  const { price, originalPrice, discountPercent } = getPriceDetails(product.price);
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdded) return;

    try {
      await addToCart(productId, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      // error handled by cart context toast
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container (4:5 Ratio, Minimal Radius) */}
      <div className="relative aspect-[4/5] bg-cream overflow-hidden rounded-brand border border-sand/30">
        <Link to={`/product/${productId}`} className="block w-full h-full">
          {/* Primary image */}
          <img
            src={frontImage}
            alt={product.title}
            loading="lazy"
            className={`w-full h-full object-cover object-top transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isHovered && secondaryImage !== frontImage ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-105'
            }`}
          />

          {/* Secondary hover image if available */}
          {secondaryImage !== frontImage && (
            <img
              src={secondaryImage}
              alt={`${product.title} alternate view`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0'
              }`}
            />
          )}
        </Link>

        {/* Top-Left Tag / Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {isOutOfStock ? (
            <Badge variant="neutral" className="bg-charcoal text-ivory">
              Sold Out
            </Badge>
          ) : product.isHero ? (
            <Badge variant="gold" className="bg-gold text-charcoal font-semibold shadow-xs">
              ★ Hero Feature
            </Badge>
          ) : product.discountPrice > 0 && product.discountPrice < product.price ? (
            <Badge variant="rose">
              Save {formatPrice(product.price - product.discountPrice)}
            </Badge>
          ) : index % 3 === 0 ? (
            <Badge variant="wine">New Drop</Badge>
          ) : null}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isMutating}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-ivory/80 backdrop-blur-md text-charcoal hover:text-wine transition-all duration-300 shadow-sm opacity-90 group-hover:opacity-100 active:scale-90"
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-wine text-wine' : 'stroke-[1.75]'
            }`}
          />
        </button>

        {/* Desktop Bottom Slide-up Quick Add */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hidden sm:block">
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className={`w-full py-2.5 px-4 text-[11px] font-medium uppercase tracking-luxury flex items-center justify-center space-x-2 rounded-brand transition-all duration-300 shadow-subtle ${
                isAdded
                  ? 'bg-emerald-900 text-emerald-100'
                  : 'bg-wine text-ivory hover:bg-burgundy active:scale-[0.98]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added To Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. Product Details */}
      <div className="pt-3 pb-1 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-luxury text-taupe font-medium">
          Pure Handloom
        </span>
        <Link
          to={`/product/${productId}`}
          className="font-medium text-xs sm:text-sm text-charcoal hover:text-wine transition-colors line-clamp-1 mt-0.5"
        >
          {product.title}
        </Link>
        <p className="text-[11px] text-taupe line-clamp-1 mt-0.5">
          {product.shortDescription || 'Handwoven silk saree with rich zari border'}
        </p>

        {/* Price Row */}
        <div className="flex items-center space-x-2 mt-1.5">
          <span className="text-xs sm:text-sm font-semibold text-wine">
            {formatPrice(price)}
          </span>
          {originalPrice > price && (
            <span className="text-[11px] text-taupe line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          {discountPercent && (
            <span className="text-[10px] font-medium text-rose hidden xs:inline">
              ({discountPercent})
            </span>
          )}
        </div>

        {/* Mobile Quick Add Button */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className={`sm:hidden mt-2.5 w-full py-2 text-[10px] uppercase tracking-luxury font-semibold rounded-brand border transition-colors flex items-center justify-center space-x-1 ${
              isAdded
                ? 'bg-emerald-800 border-emerald-800 text-white'
                : 'border-wine text-wine bg-cream/30 hover:bg-wine hover:text-ivory'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>In Bag</span>
              </>
            ) : (
              <span>+ Add to Bag</span>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
