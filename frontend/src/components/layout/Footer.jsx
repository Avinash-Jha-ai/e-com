import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Sparkles, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/90 border-t border-sand/20">
      {/* 1. Value / Trust Props Banner */}
      <div className="border-b border-sand/15 py-10 px-4 sm:px-8 lg:px-12 bg-charcoal-light/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start space-x-3.5">
            <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-cream">
                100% Authentic Handloom
              </h4>
              <p className="text-[11px] text-taupe-light mt-1">
                Directly sourced from master weavers across India
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <Truck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-cream">
                Complimentary Shipping
              </h4>
              <p className="text-[11px] text-taupe-light mt-1">
                On all domestic orders above ₹1,999
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <RotateCcw className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-cream">
                Effortless 7-Day Returns
              </h4>
              <p className="text-[11px] text-taupe-light mt-1">
                Hassle-free pickups & instant boutique credit
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-cream">
                Secured Checkout
              </h4>
              <p className="text-[11px] text-taupe-light mt-1">
                Encrypted Razorpay payments & Cash on Delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Multi-column Footer */}
      <div className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand & Newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <Link to="/" className="inline-block">
            <h3 className="font-serif text-3xl tracking-wide-luxury text-cream font-light">
              V A N Y A
            </h3>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-sand-light font-medium">
              Contemporary Indian Fashion
            </span>
          </Link>
          <p className="text-xs text-taupe-light leading-relaxed max-w-sm">
            Sarees designed for the way you live, celebrate, and remember. Weaving the rich heritage of Banaras, Kanchipuram, and Chanderi into silhouettes created for the modern muse.
          </p>

          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-luxury text-cream font-medium mb-2.5">
              Receive The Private Edit
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for joining our private newsletter edit.');
              }}
              className="flex max-w-sm border-b border-sand/40 pb-1"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full bg-transparent text-xs text-cream placeholder-taupe px-0 py-2 outline-none"
              />
              <button
                type="submit"
                className="text-gold hover:text-ivory p-2 transition-colors"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Shop Column */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-cream font-semibold">
            The Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-taupe-light">
            <li>
              <Link to="/shop?collection=new" className="hover:text-cream transition-colors">
                New Drops
              </Link>
            </li>
            <li>
              <Link to="/shop?collection=festive" className="hover:text-cream transition-colors">
                Festive Edit
              </Link>
            </li>
            <li>
              <Link to="/shop?collection=wedding" className="hover:text-cream transition-colors">
                Wedding Troussau
              </Link>
            </li>
            <li>
              <Link to="/shop?collection=everyday" className="hover:text-cream transition-colors">
                Everyday Elegance
              </Link>
            </li>
            <li>
              <Link to="/shop?fabric=silk" className="hover:text-cream transition-colors">
                Banarasi Pure Silks
              </Link>
            </li>
            <li>
              <Link to="/shop?fabric=organza" className="hover:text-cream transition-colors">
                Organza & Chiffon
              </Link>
            </li>
          </ul>
        </div>

        {/* Help Column */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-cream font-semibold">
            Boutique Care
          </h4>
          <ul className="space-y-2.5 text-xs text-taupe-light">
            <li>
              <Link to="/account/orders" className="hover:text-cream transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <span className="hover:text-cream transition-colors cursor-pointer">
                Shipping & Delivery
              </span>
            </li>
            <li>
              <span className="hover:text-cream transition-colors cursor-pointer">
                Returns & Exchanges
              </span>
            </li>
            <li>
              <span className="hover:text-cream transition-colors cursor-pointer">
                Saree Draping & Care Guide
              </span>
            </li>
            <li>
              <span className="hover:text-cream transition-colors cursor-pointer">
                Authenticity & Loom Certificate
              </span>
            </li>
          </ul>
        </div>

        {/* Portals & Accounts */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-cream font-semibold">
            Your Account
          </h4>
          <ul className="space-y-2.5 text-xs text-taupe-light">
            <li>
              <Link to="/account" className="hover:text-cream transition-colors">
                Customer Dashboard
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-cream transition-colors">
                Your Saved Edit
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-cream transition-colors">
                Shopping Bag
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright */}
      <div className="border-t border-sand/15 py-8 px-4 sm:px-8 lg:px-12 text-[11px] text-taupe">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VANYA INDIA. All rights reserved. Handcrafted with pride.</p>
          <div className="flex space-x-6">
            <span className="hover:text-cream cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-cream cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-cream cursor-pointer transition-colors">GST & Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
