import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Heart, ShoppingBag, User, X, LogOut, ArrowRight } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { isMobileNavOpen, closeMobileNav, toggleCart } = useUI();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Shop', icon: Compass, path: '/shop' },
    { label: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlistCount },
    { label: 'Bag', icon: ShoppingBag, action: toggleCart, badge: cartCount },
    {
      label: 'Account',
      icon: User,
      path: isAuthenticated ? '/account' : '/login',
    },
  ];

  const categories = [
    { title: 'New Arrivals', href: '/shop?collection=new' },
    { title: 'Banarasi Silk Sarees', href: '/shop?fabric=silk' },
    { title: 'Festive Drape Edit', href: '/shop?collection=festive' },
    { title: 'Royal Wedding Edit', href: '/shop?collection=wedding' },
    { title: 'Everyday Chiffon & Georgette', href: '/shop?collection=everyday' },
    { title: 'Organza & Handloom', href: '/shop?fabric=organza' },
  ];

  return (
    <>
      {/* 1. Mobile Bottom Floating Bar (Mobile only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-sand/40 px-3 py-2 flex items-center justify-around shadow-card">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? location.pathname === item.path : false;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="relative flex flex-col items-center justify-center p-1.5 text-charcoal/70 hover:text-wine focus:outline-none transition-colors"
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-wine text-ivory text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center p-1.5 transition-colors ${
                isActive ? 'text-wine font-semibold' : 'text-charcoal/70 hover:text-wine'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 2. Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileNav}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-ivory z-50 shadow-modal flex flex-col border-r border-sand/40 overflow-y-auto"
            >
              <div className="p-6 border-b border-sand/40 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl tracking-wide-luxury text-burgundy">
                    V A N Y A
                  </h2>
                  <p className="text-[9px] uppercase tracking-luxury text-taupe">
                    Modern Indian Fashion
                  </p>
                </div>
                <button
                  onClick={closeMobileNav}
                  className="p-2 text-charcoal hover:text-wine transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-6 space-y-6 flex-1">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-luxury text-taupe font-semibold">
                    Curated Collections
                  </p>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.title}
                        to={cat.href}
                        onClick={closeMobileNav}
                        className="flex items-center justify-between py-2 text-sm text-charcoal hover:text-wine transition-colors font-medium border-b border-sand/20"
                      >
                        <span>{cat.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-taupe" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account status */}
                <div className="pt-4 border-t border-sand/40 space-y-3">
                  <p className="text-[10px] uppercase tracking-luxury text-taupe font-semibold">
                    Your Profile
                  </p>
                  {isAuthenticated ? (
                    <div className="space-y-2 text-sm">
                      <div className="py-1">
                        <p className="font-medium text-charcoal">{user?.name}</p>
                        <p className="text-xs text-taupe">{user?.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={closeMobileNav}
                        className="block py-1.5 text-charcoal hover:text-wine"
                      >
                        Account Dashboard
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={closeMobileNav}
                        className="block py-1.5 text-charcoal hover:text-wine"
                      >
                        Order History
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          closeMobileNav();
                        }}
                        className="flex items-center space-x-2 text-wine pt-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <Link
                        to="/login"
                        onClick={closeMobileNav}
                        className="block w-full text-center py-2.5 bg-wine text-ivory text-xs uppercase tracking-luxury font-medium rounded-brand"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeMobileNav}
                        className="block w-full text-center py-2.5 border border-wine text-wine text-xs uppercase tracking-luxury font-medium rounded-brand"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer notice */}
              <div className="p-6 bg-cream/40 border-t border-sand/40 text-[11px] text-taupe text-center">
                <p>Authentic Indian Sarees • Worldwide Delivery</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
