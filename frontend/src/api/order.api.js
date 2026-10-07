import api from './client';

export const orderApi = {
  createOrder: async ({ addressId, paymentMethod = 'COD' }) => {
    const res = await api.post('/orders', { addressId, paymentMethod });
    return res.data;
  },

  // Customer orders
  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  getOrderTracking: async (orderId) => {
    const res = await api.get(`/orders/${orderId}/track`);
    return res.data;
  },

  cancelOrder: async (orderId) => {
    const res = await api.patch(`/orders/${orderId}/cancel`);
    return res.data;
  },
};
