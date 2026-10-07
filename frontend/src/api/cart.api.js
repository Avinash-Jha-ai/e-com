import api from './client';

export const cartApi = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },

  addToCart: async ({ productId, quantity = 1 }) => {
    const res = await api.post(`/cart/add/${productId}`, { quantity });
    return res.data;
  },

  updateQuantity: async ({ productId, quantity }) => {
    const res = await api.patch(`/cart/update/${productId}`, { quantity });
    return res.data;
  },

  removeFromCart: async (productId) => {
    const res = await api.delete(`/cart/remove/${productId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart/clear');
    return res.data;
  },
};
