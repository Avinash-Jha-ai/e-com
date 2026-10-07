import api from './client';

export const paymentApi = {
  createPayment: async (orderId) => {
    const res = await api.post('/payment/create', { orderId });
    return res.data;
  },

  verifyPayment: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const res = await api.post('/payment/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return res.data;
  },
};
