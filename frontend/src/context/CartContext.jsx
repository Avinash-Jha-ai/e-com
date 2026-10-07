import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart.api';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { formatErrorMessage } from '../utils/errorHelpers';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useUI();
  const queryClient = useQueryClient();

  // Fetch cart
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const res = await cartApi.getCart();
        return res?.cart || null;
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const cart = cartData || { items: [], totalPrice: 0 };

  const cartCount = useMemo(() => {
    if (!cart?.items || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  // Add mutation
  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.addToCart({ productId, quantity }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      addToast({ type: 'success', message: 'Added to your bag' });
    },
    onError: (error) => {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    },
  });

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.updateQuantity({ productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (productId) => cartApi.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      addToast({ type: 'success', message: 'Removed from bag' });
    },
    onError: (error) => {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    },
  });

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      addToast({ type: 'error', message: 'Please sign in to add items to your bag.' });
      return false;
    }
    return addMutation.mutateAsync({ productId, quantity });
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    return updateMutation.mutateAsync({ productId, quantity });
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    return removeMutation.mutateAsync(productId);
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    return clearMutation.mutateAsync();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        totalPrice: cart.totalPrice || 0,
        isLoading: isLoading && isAuthenticated,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
