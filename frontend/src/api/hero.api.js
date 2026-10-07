import api from './client';

export const heroApi = {
  // Public storefront
  getHeroSlides: async () => {
    const res = await api.get('/hero');
    return res.data;
  },

  getManageHeroSlides: async () => {
    const res = await api.get('/hero/admin');
    return res.data;
  },

  createHeroSlide: async (slideData, imageFile) => {
    const formData = new FormData();
    Object.entries(slideData).forEach(([key, value]) => {
      if (value) formData.append(key, String(value));
    });
    if (imageFile) formData.append('heroImage', imageFile);

    const res = await api.post('/hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteHeroSlide: async (id) => {
    const res = await api.delete(`/hero/${id}`);
    return res.data;
  },
};
