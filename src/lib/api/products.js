import { api, withQuery } from './client';

export const productsApi = {
  list: (params = {}) => api.get(withQuery('/products', params)),
  get: (id) => api.get(`/products/${id}`),
  search: (q, params = {}) =>
    api.get(withQuery('/search/products', { ...params, q })),
  featured: () => api.get('/products/featured'),
  trending: () => api.get('/products/trending'),
  byCategory: (slug, params = {}) =>
    api.get(withQuery(`/categories/${slug}/products`, params)),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  get: (slug) => api.get(`/categories/${slug}`),
};

export const productTagsApi = {
  list: () => api.get('/product-tags'),
};
