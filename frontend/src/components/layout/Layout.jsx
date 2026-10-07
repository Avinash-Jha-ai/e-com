import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import SearchModal from '../navigation/SearchModal';
import CartDrawer from '../cart/CartDrawer';
import Toast from '../ui/Toast';
import Preloader from '../ui/Preloader';

export default function Layout() {
  const location = useLocation();

  // Scroll to top automatically on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-wine selection:text-ivory">
      {/* Editorial preloader on initial visit */}
      <Preloader />

      {/* Global Toast notifications */}
      <Toast />

      {/* Modals & Drawers */}
      <SearchModal />
      <CartDrawer />

      {/* Main Header */}
      <Header />

      {/* Page Body with subtle transition */}
      <main className="flex-1 pb-16 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation & menu */}
      <MobileNav />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
