import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { formatErrorMessage } from '../utils/errorHelpers';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useUI();
  const queryClient = useQueryClient();

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      try {
        const res = await wishlistApi.getWishlist();
        return res?.wishlist || null;
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const wishlist = wishlistData || { products: [] };

  // Set of product IDs in wishlist for O(1) lookup
  const wishlistProductIds = useMemo(() => {
    if (!wishlist?.products || !Array.isArray(wishlist.products)) return new Set();
    return new Set(
      wishlist.products.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean)
    );
  }, [wishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistProductIds.has(productId);
  };

  const addMutation = useMutation({
    mutationFn: (productId) => wishlistApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      addToast({ type: 'success', message: 'Saved to your wishlist' });
    },
    onError: (error) => {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      addToast({ type: 'success', message: 'Removed from your wishlist' });
    },
    onError: (error) => {
      addToast({ type: 'error', message: formatErrorMessage(error) });
    },
  });

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      addToast({ type: 'error', message: 'Please sign in to save items to your wishlist.' });
      return;
    }
    if (isInWishlist(productId)) {
      return removeMutation.mutateAsync(productId);
    } else {
      return addMutation.mutateAsync(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlistProductIds.size,
        isInWishlist,
        toggleWishlist,
        isLoading: isLoading && isAuthenticated,
        isMutating: addMutation.isPending || removeMutation.isPending,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
