import api from './client';

export const wishlistApi = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },

  addToWishlist: async (productId) => {
    const res = await api.post(`/wishlist/add/product/${productId}`);
    return res.data;
  },

  removeFromWishlist: async (productId) => {
    const res = await api.delete(`/wishlist/delete/product/${productId}`);
    return res.data;
  },
};
