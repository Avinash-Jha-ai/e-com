import api from './client';

export const authApi = {
  // User Registration & Verification
  register: async (formData) => {
    const res = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  verifyOtp: async ({ email, otp }) => {
    const res = await api.post('/auth/register/verify', { email, otp });
    return res.data;
  },

  // User Login
  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  // Common Authenticated User endpoints
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  addAddress: async (addressData) => {
    const res = await api.post('/auth/address', addressData);
    return res.data;
  },

  deleteAddress: async (addressId) => {
    const res = await api.delete(`/auth/address/${addressId}`);
    return res.data;
  },

  getPasswordChangeOtp: async () => {
    const res = await api.get('/auth/change-password/otp');
    return res.data;
  },

  changePassword: async ({ otp, newPassword }) => {
    const res = await api.put('/auth/change-password', { otp, newPassword });
    return res.data;
  },
};
