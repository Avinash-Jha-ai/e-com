import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';
import Button from '../ui/Button';

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUI();
  const { cart, cartCount, totalPrice, updateQuantity, removeFromCart, isLoading, isUpdating } = useCart();
  const navigate = useNavigate();

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  const items = cart?.items || [];
  const qualifiesForFreeShipping = totalPrice >= 1999;
  const freeShippingThresholdRemaining = 1999 - totalPrice;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50"
          />

          {/* Right-Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-ivory z-50 shadow-modal flex flex-col border-l border-sand/40"
          >
            {/* Header */}
            <div className="p-6 border-b border-sand/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-wine" />
                <span className="font-serif text-xl tracking-wide text-charcoal">
                  Your Bag ({cartCount})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-taupe hover:text-wine transition-colors rounded-full"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping Progress Meter */}
            {items.length > 0 && (
              <div className="bg-cream/70 px-6 py-3 border-b border-sand/30 text-xs">
                {qualifiesForFreeShipping ? (
                  <p className="text-emerald-800 font-medium flex items-center space-x-1.5">
                    <span>✨ You qualify for complimentary express shipping!</span>
                  </p>
                ) : (
                  <div>
                    <p className="text-charcoal-muted">
                      Add <strong className="text-wine">{formatPrice(freeShippingThresholdRemaining)}</strong> more to unlock complimentary shipping
                    </p>
                    <div className="w-full h-1 bg-sand/40 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-wine rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalPrice / 1999) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items Scroll List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 divide-y divide-sand/30">
              {items.length > 0 ? (
                items.map((item) => {
                  const product = item.product || {};
                  const productId = product._id || item.product;
                  const itemPrice = item.price || product.price || 0;
                  const itemTitle = product.title || 'Handcrafted Saree';
                  const imageUrl = getProductFrontImage(product.images);

                  return (
                    <div key={item._id || productId} className="pt-5 first:pt-0 flex space-x-4">
                      {/* Product Thumbnail */}
                      <Link
                        to={`/product/${productId}`}
                        onClick={closeCart}
                        className="w-20 h-26 bg-cream shrink-0 overflow-hidden rounded-brand border border-sand/40"
                      >
                        <img
                          src={imageUrl}
                          alt={itemTitle}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link
                              to={`/product/${productId}`}
                              onClick={closeCart}
                              className="font-medium text-xs text-charcoal hover:text-wine transition-colors line-clamp-2 pr-2"
                            >
                              {itemTitle}
                            </Link>
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="text-taupe hover:text-wine transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-wine mt-1">
                            {formatPrice(itemPrice)}
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-sand/60 rounded-brand bg-white">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(productId, item.quantity - 1);
                                } else {
                                  removeFromCart(productId);
                                }
                              }}
                              disabled={isUpdating}
                              className="p-1.5 text-taupe hover:text-wine disabled:opacity-30 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-medium text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(productId, item.quantity + 1)}
                              disabled={isUpdating}
                              className="p-1.5 text-taupe hover:text-wine disabled:opacity-30 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-medium text-charcoal">
                            {formatPrice(itemPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-taupe mb-4">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal mb-1">
                    Your bag is waiting
                  </h3>
                  <p className="text-xs text-taupe max-w-xs mb-6">
                    Discover sarees woven with timeless craftsmanship and modern silhouettes.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      closeCart();
                      navigate('/shop');
                    }}
                  >
                    Explore Sarees
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 bg-cream/30 border-t border-sand/40 space-y-4">
                <div className="space-y-1.5 text-xs text-charcoal">
                  <div className="flex justify-between">
                    <span className="text-taupe">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-taupe">Estimated Shipping</span>
                    <span className="font-medium text-emerald-800">
                      {qualifiesForFreeShipping ? 'FREE' : '₹150'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-sand/30">
                    <span>Total</span>
                    <span className="text-wine text-base font-serif">
                      {formatPrice(totalPrice + (qualifiesForFreeShipping ? 0 : 150))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="secondary" size="md" onClick={handleViewCart}>
                    View Bag
                  </Button>
                  <Button variant="primary" size="md" onClick={handleCheckout}>
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
