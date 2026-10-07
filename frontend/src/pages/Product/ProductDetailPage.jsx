import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, Star, ChevronRight, Plus, Minus } from 'lucide-react';
import { productApi } from '../../api/product.api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice, getPriceDetails } from '../../utils/formatters';
import ProductGallery from '../../components/product/ProductGallery';
import Accordion from '../../components/ui/Accordion';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProductCard from '../../components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isAdding } = useCart();
  const { isInWishlist, toggleWishlist, isMutating } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const isSaved = isInWishlist(id);

  // Fetch current product
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });

  // Fetch related products
  const { data: relatedData } = useQuery({
    queryKey: ['products', 'related'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 4 }),
  });

  const product = productData?.product;
  const relatedProducts = (relatedData?.products || []).filter((p) => p._id !== id).slice(0, 4);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 animate-pulse space-y-8">
        <div className="w-48 h-4 bg-sand/40 rounded-brand" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-cream rounded-brand" />
          <div className="lg:col-span-5 space-y-6">
            <div className="w-24 h-4 bg-sand/40 rounded-brand" />
            <div className="w-3/4 h-8 bg-sand/60 rounded-brand" />
            <div className="w-1/3 h-6 bg-sand/50 rounded-brand" />
            <div className="w-full h-24 bg-sand/30 rounded-brand" />
            <div className="w-full h-12 bg-sand/50 rounded-brand" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <h2 className="font-serif text-3xl text-charcoal mb-2">
          Saree Not Found
        </h2>
        <p className="text-xs text-taupe max-w-sm mb-6 leading-relaxed">
          The drape you are looking for may have been retired or is currently unavailable.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="md">
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  const { price, originalPrice, discountPercent } = getPriceDetails(product.price);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product._id, quantity);
    navigate('/checkout');
  };

  const accordionItems = [
    {
      title: 'About The Saree',
      content: (
        <p className="leading-relaxed">
          {product.description ||
            'Exquisitely hand-crafted by master artisans. Woven with rich zari border detailing and finished with delicate hand-knotted tassels along the pallu.'}
        </p>
      ),
    },
    {
      title: 'Fabric & Specifications',
      content: (
        <ul className="space-y-1.5 list-disc list-inside text-charcoal-muted">
          <li><strong>Length:</strong> 5.5 meters (standard luxury drape)</li>
          <li><strong>Blouse Piece:</strong> Included (0.8 meter matching unstitched fabric)</li>
          <li><strong>Weave Technique:</strong> Authentic artisanal handloom</li>
          <li><strong>Origin:</strong> Handcrafted in Varanasi / Kanchipuram, India</li>
        </ul>
      ),
    },
    {
      title: 'Garment Care',
      content: (
        <p className="leading-relaxed text-charcoal-muted">
          Dry clean only to maintain the lustre of the pure zari and delicate weave. Wrap in unbleached muslin cloth and store in a cool, dry place. Avoid direct perfume spray on metallic threads.
        </p>
      ),
    },
    {
      title: 'Shipping & Delivery',
      content: (
        <p className="leading-relaxed text-charcoal-muted">
          Complimentary express insured delivery across India. Hand-packaged in our signature luxury keepsake gift box. Dispatched within 24–48 hours.
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-luxury text-taupe">
        <Link to="/" className="hover:text-wine transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-wine transition-colors">
          Sarees
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-charcoal font-medium truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* 2. Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Gallery ~60% */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Product Details & Actions ~40% */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
                Pure Handloom Collection
              </span>
              <span className="text-sand">•</span>
              <div className="flex items-center text-gold text-xs">
                <Star className="w-3 h-3 fill-gold text-gold mr-1" />
                <span className="font-semibold text-charcoal">4.9</span>
                <span className="text-taupe ml-1 text-[11px]">(48 reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal font-normal mt-2 leading-tight">
              {product.title}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 mt-3">
              <span className="font-serif text-2xl sm:text-3xl text-wine font-semibold">
                {formatPrice(price)}
              </span>
              {originalPrice > price && (
                <span className="text-sm text-taupe line-through">
                  MRP {formatPrice(originalPrice)}
                </span>
              )}
              {discountPercent && (
                <Badge variant="rose">{discountPercent}</Badge>
              )}
            </div>
            <p className="text-[10px] text-taupe mt-0.5">
              Inclusive of all taxes • Free Shipping
            </p>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            {product.shortDescription ||
              'A magnificent drape created with pure yarn and intricate gold brocade border, tailored for memorable occasions.'}
          </p>

          {/* Stock availability */}
          <div className="flex items-center space-x-2">
            {isOutOfStock ? (
              <Badge variant="neutral" className="bg-charcoal text-ivory">
                Sold Out
              </Badge>
            ) : product.stock <= 3 ? (
              <Badge variant="warning">
                Only {product.stock} pieces remaining in atelier
              </Badge>
            ) : (
              <Badge variant="success">
                In Stock & Ready to Ship
              </Badge>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-[11px] uppercase tracking-luxury text-taupe font-medium">
                  Quantity:
                </span>
                <div className="inline-flex items-center border border-sand/60 rounded-brand bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-taupe hover:text-wine disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-medium text-charcoal">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 text-taupe hover:text-wine disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                isLoading={isAdding}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full"
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product._id)}
              disabled={isMutating}
              className="w-full py-2.5 flex items-center justify-center space-x-2 text-xs uppercase tracking-luxury text-charcoal hover:text-wine transition-colors border border-sand/40 rounded-brand"
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? 'fill-wine text-wine' : 'stroke-[1.5]'}`}
              />
              <span>{isSaved ? 'Saved to Your Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sand/40 text-center text-[10px] text-taupe">
            <div className="flex flex-col items-center space-y-1">
              <Truck className="w-4 h-4 text-charcoal" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RotateCcw className="w-4 h-4 text-charcoal" />
              <span>7-Day Returns</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-charcoal" />
              <span>Authentic Handloom</span>
            </div>
          </div>

          {/* Accordion Details */}
          <div className="pt-4">
            <Accordion items={accordionItems} />
          </div>
        </div>
      </div>

      {/* 3. Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-sand/40 space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase tracking-wide-luxury text-taupe font-semibold">
              Complete Your Troussau
            </span>
            <h2 className="font-serif text-3xl text-charcoal font-light">
              You May Also Admire
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p, idx) => (
              <ProductCard key={p._id} product={p} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
