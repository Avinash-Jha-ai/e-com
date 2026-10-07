import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-loaded storefront pages
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const ShopPage = lazy(() => import('./pages/Shop/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/Product/ProductDetailPage'));
const WishlistPage = lazy(() => import('./pages/Wishlist/WishlistPage'));
const CartPage = lazy(() => import('./pages/Cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/Checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccess/OrderSuccessPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const VerifyOtpPage = lazy(() => import('./pages/Auth/VerifyOtpPage'));

// Account pages
const AccountLayout = lazy(() => import('./pages/Account/AccountLayout'));
const AccountOverviewPage = lazy(() => import('./pages/Account/AccountOverviewPage'));
const OrdersPage = lazy(() => import('./pages/Account/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/Account/OrderDetailPage'));
const AddressesPage = lazy(() => import('./pages/Account/AddressesPage'));
const SecurityPage = lazy(() => import('./pages/Account/SecurityPage'));
const SellerPanelPage = lazy(() => import('./pages/Seller/SellerPanelPage'));

// 404 page
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

// Global route loading fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-6 h-6 border-2 border-wine border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-[10px] uppercase tracking-luxury text-taupe">Loading...</p>
    </div>
  );
}

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UIProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route
                      path="atelier-console"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'shopkeeper']}>
                          <SellerPanelPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* ──────────────────────────────── */}
                    {/* CUSTOMER STOREFRONT ROUTES       */}
                    {/* ──────────────────────────────── */}
                    <Route element={<Layout />}>
                      {/* Public */}
                      <Route index element={<HomePage />} />
                      <Route path="shop" element={<ShopPage />} />
                      <Route path="product/:id" element={<ProductDetailPage />} />
                      <Route path="search" element={<ShopPage />} />

                      {/* Auth */}
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="verify" element={<VerifyOtpPage />} />

                      {/* Protected: Customer */}
                      <Route
                        path="wishlist"
                        element={
                          <ProtectedRoute allowedRoles={['user']}>
                            <WishlistPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="cart"
                        element={
                          <ProtectedRoute allowedRoles={['user']}>
                            <CartPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="checkout"
                        element={
                          <ProtectedRoute allowedRoles={['user']}>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="order-success/:orderId"
                        element={
                          <ProtectedRoute allowedRoles={['user']}>
                            <OrderSuccessPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected: Account */}
                      <Route
                        path="account"
                        element={
                          <ProtectedRoute allowedRoles={['user']}>
                            <AccountLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AccountOverviewPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="addresses" element={<AddressesPage />} />
                        <Route path="security" element={<SecurityPage />} />
                      </Route>

                      {/* 404 Catch-all under Layout */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>

                  </Routes>
                </Suspense>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </UIProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
