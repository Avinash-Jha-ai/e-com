import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openSearch, toggleCart, openMobileNav } = useUI();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftNavLinks = [
    { name: 'New Arrivals', href: '/shop?collection=new' },
    { name: 'Sarees', href: '/shop' },
    { name: 'Festive Edit', href: '/shop?collection=festive' },
  ];

  const rightNavLinks = [
    { name: 'Wedding Edit', href: '/shop?collection=wedding' },
    { name: 'Everyday', href: '/shop?collection=everyday' },
  ];

  const headerBgClass = isScrolled ? 'shadow-subtle' : '';

  const avatarInitials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isScrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        }`}
      >
        <AnnouncementBar />
      </div>

      <div
        className={`bg-ivory border-b border-sand/40 text-charcoal transition-all duration-300 ${headerBgClass} px-4 sm:px-6 lg:px-8 xl:px-12`}
      >
        <div
          className={`max-w-7xl mx-auto grid grid-cols-12 items-center transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20 sm:h-22'
          }`}
        >
          {/* ───────────────────────────────────────────────────────────── */}
          {/* LEFT ZONE: Mobile Menu (mobile) & Left Navigation Links (desktop) */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="col-span-3 lg:col-span-4 flex items-center">
            {/* Mobile menu hamburger */}
            <button
              onClick={openMobileNav}
              className="lg:hidden p-2 -ml-2 text-charcoal hover:text-wine transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Desktop Left Nav */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-[11px] uppercase tracking-[0.2em] font-medium">
              {leftNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative group text-charcoal/80 hover:text-wine transition-colors py-1.5 whitespace-nowrap"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-wine group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* CENTER ZONE: Brand Wordmark (Always dead-center & spacious)     */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="col-span-6 lg:col-span-4 flex flex-col items-center justify-center text-center px-2">
            <Link to="/" className="group inline-flex flex-col items-center focus:outline-none">
              <motion.h1
                animate={{ scale: isScrolled ? 0.94 : 1 }}
                transition={{ duration: 0.2 }}
                className="font-serif text-2xl sm:text-3xl lg:text-[32px] tracking-[0.32em] text-burgundy group-hover:text-wine transition-colors font-light leading-tight pl-[0.32em]"
              >
                V A N Y A
              </motion.h1>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.42em] text-taupe font-medium mt-0.5 pl-[0.42em]">
                Modern Heritage
              </span>
            </Link>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* RIGHT ZONE: Right Nav Links + Utilities (Balanced & Spaced)    */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="col-span-3 lg:col-span-4 flex items-center justify-end gap-2 sm:gap-3 xl:gap-5">
            {/* Desktop Right Nav Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[11px] uppercase tracking-[0.2em] font-medium">
              {rightNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative group text-charcoal/80 hover:text-wine transition-colors py-1.5 whitespace-nowrap"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-wine group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Subtle Vertical Divider between Links & Action Icons */}
            <div className="hidden lg:block h-4 w-px bg-sand/60" />

            {/* Search trigger */}
            <button
              onClick={openSearch}
              className="p-2 text-charcoal/80 hover:text-wine transition-colors"
              aria-label="Search collection"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Account Link / Customer Avatar */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="hidden sm:inline-flex items-center justify-center text-charcoal/80 hover:text-wine transition-colors"
              aria-label="Your Account"
              title="Account"
            >
              {isAuthenticated ? (
                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-sand/60 bg-cream text-[10px] font-semibold tracking-subtle text-wine">
                  {user?.avatar && (
                    <img
                      src={user.avatar}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.remove();
                      }}
                    />
                  )}
                  <span aria-hidden="true">{avatarInitials}</span>
                </span>
              ) : (
                <span className="p-2">
                  <User className="h-4 w-4 stroke-[1.75]" />
                </span>
              )}
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-charcoal/80 hover:text-wine transition-colors"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bag Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-charcoal/80 hover:text-wine transition-colors"
              aria-label="Shopping Bag"
              title="Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-wine text-ivory text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
