import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';
import Button from '../../components/ui/Button';

export default function WishlistPage() {
  const { wishlist, wishlistCount, toggleWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  const products = (wishlist?.products || []).filter(
    (item) => item && typeof item === 'object' && item._id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-10">
      {/* Editorial Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
          Curated Favourites
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-light">
          Your Saved Edit
        </h1>
        <p className="text-xs text-charcoal-muted">
          {wishlistCount} {wishlistCount === 1 ? 'drape' : 'drapes'} saved in your private collection
        </p>
      </div>

      {/* Grid or Empty State */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const frontImage = getProductFrontImage(product.images);
            return (
              <div
                key={product._id}
                className="group relative flex flex-col bg-cream/20 rounded-brand overflow-hidden border border-sand/30"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] bg-cream overflow-hidden">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={frontImage}
                      alt={product.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-ivory/90 text-wine hover:text-charcoal transition-colors shadow-sm"
                    aria-label="Remove from saved edit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    <Link
                      to={`/product/${product._id}`}
                      className="font-medium text-xs text-charcoal hover:text-wine transition-colors line-clamp-1"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs font-semibold text-wine mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-1.5"
                    onClick={() => addToCart(product._id, 1)}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move To Bag</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-cream/30 rounded-brand border border-sand/30 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-taupe mb-4">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-2xl text-charcoal mb-1 font-normal">
            Nothing saved yet
          </h3>
          <p className="text-xs text-taupe max-w-xs mb-8 leading-relaxed">
            Tap the heart icon on any saree to curate your personal edit for weddings, festive occasions, and gifting.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="md">
              Explore Sarees
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
