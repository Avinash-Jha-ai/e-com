import api from './client';

export const productApi = {
  // Storefront Queries
  getProducts: async ({
    page = 1,
    limit = 12,
    category,
    collection,
    occasion,
    fabric,
    minPrice,
    maxPrice,
    inStock,
    sort,
    search,
    isHero,
    isFeatured,
  } = {}) => {
    const res = await api.get('/products', {
      params: {
        page,
        limit,
        category,
        collection,
        occasion,
        fabric,
        minPrice,
        maxPrice,
        inStock,
        sort,
        search,
        isHero,
        isFeatured,
      },
    });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/product/${id}`);
    return res.data;
  },

  getSellerProducts: async ({ page = 1, limit = 50 } = {}) => {
    const res = await api.get('/seller/products', { params: { page, limit } });
    return res.data;
  },

  createProduct: async (productData, imageFiles) => {
    const formData = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    Array.from(imageFiles).forEach((file) => formData.append('images', file));

    const res = await api.post('/seller/createProduct', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteSellerProduct: async (id) => {
    const res = await api.delete(`/seller/delete/${id}`);
    return res.data;
  },

  searchProducts: async (search) => {
    const res = await api.get('/product/search', {
      params: { search },
    });
    return res.data;
  },
};
