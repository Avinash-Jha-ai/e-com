import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';
import Button from '../../components/ui/Button';

export default function CartPage() {
  const { cart, cartCount, totalPrice, updateQuantity, removeFromCart, clearCart, isUpdating } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const qualifiesForFreeShipping = totalPrice >= 1999;
  const shippingFee = qualifiesForFreeShipping ? 0 : 150;
  const finalTotal = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-cream mx-auto flex items-center justify-center text-taupe mb-6">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-2">
          Your Bag is Waiting
        </h1>
        <p className="text-xs text-taupe max-w-sm mx-auto mb-8 leading-relaxed">
          You have no drapes in your bag. Explore our pure silk, organza, and festive edits.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="lg">
            Explore All Sarees
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-10">
      {/* Title */}
      <div className="border-b border-sand/40 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
            Review Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Shopping Bag ({cartCount})
          </h1>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-taupe hover:text-wine uppercase tracking-luxury font-medium transition-colors"
        >
          Clear Bag
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-sand/40 border-t border-b border-sand/40">
            {items.map((item) => {
              const product = item.product || {};
              const productId = product._id || item.product;
              const itemPrice = item.price || product.price || 0;
              const itemTitle = product.title || 'Handcrafted Saree';
              const imageUrl = getProductFrontImage(product.images);

              return (
                <div key={item._id || productId} className="py-6 flex flex-col sm:flex-row gap-6">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${productId}`}
                    className="w-24 sm:w-28 aspect-[4/5] bg-cream shrink-0 overflow-hidden rounded-brand border border-sand/30"
                  >
                    <img
                      src={imageUrl}
                      alt={itemTitle}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-4 sm:space-y-0">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${productId}`}
                          className="font-serif text-lg sm:text-xl text-charcoal hover:text-wine transition-colors"
                        >
                          {itemTitle}
                        </Link>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="text-taupe hover:text-wine p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-taupe mt-0.5">
                        Pure Handloom • Unstitched Blouse Piece Included
                      </p>
                      <p className="text-sm font-semibold text-wine mt-2">
                        {formatPrice(itemPrice)}
                      </p>
                    </div>

                    {/* Quantity & Subtotal */}
                    <div className="flex items-center justify-between pt-2">
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
                          className="p-2 text-taupe hover:text-wine disabled:opacity-30 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-medium text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          disabled={isUpdating}
                          className="p-2 text-taupe hover:text-wine disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-luxury text-taupe block">
                          Subtotal
                        </span>
                        <span className="text-sm font-semibold text-charcoal">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-taupe">
            <Link to="/shop" className="hover:text-wine underline uppercase tracking-luxury text-[11px]">
              ← Continue Curating Sarees
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-cream/40 p-6 sm:p-8 rounded-brand border border-sand/40 space-y-6 lg:sticky lg:top-28">
          <h3 className="font-serif text-2xl text-charcoal font-normal border-b border-sand/30 pb-4">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-charcoal">
            <div className="flex justify-between">
              <span className="text-taupe">Bag Subtotal</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-taupe">Insured Express Shipping</span>
              <span className="font-medium text-emerald-800">
                {qualifiesForFreeShipping ? 'FREE' : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-taupe">Luxury Keepsake Box</span>
              <span className="font-medium text-emerald-800">COMPLIMENTARY</span>
            </div>

            <div className="flex justify-between text-base font-semibold pt-4 border-t border-sand/40">
              <span className="font-serif text-lg">Estimated Total</span>
              <span className="text-wine font-serif text-xl">
                {formatPrice(finalTotal)}
              </span>
            </div>
            <p className="text-[10px] text-taupe text-right">
              Inclusive of all GST & taxes
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => navigate('/checkout')}
          >
            <span>Proceed To Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="space-y-2 pt-4 border-t border-sand/30 text-[11px] text-taupe">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-wine shrink-0" />
              <span>100% Encrypted & Authenticated Checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-wine shrink-0" />
              <span>Dispatched within 24–48 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
