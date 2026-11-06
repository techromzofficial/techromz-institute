import { api, withQuery } from './client';

export const suppliersApi = {
  list: (params = {}) => api.get(withQuery('/suppliers', params)),
  get: (id) => api.get(`/suppliers/${id}`),
  products: (id, params = {}) =>
    api.get(withQuery(`/suppliers/${id}/products`, params)),
};

export const supplierProductsApi = {
  list: (params = {}) => api.get(withQuery('/supplier/products', params)),
  create: (payload) => api.post('/supplier/products', payload),
  get: (id) => api.get(`/supplier/products/${id}`),
  update: (id, payload) => api.put(`/supplier/products/${id}`, payload),
  delete: (id) => api.delete(`/supplier/products/${id}`),
};

export const supplierProfileApi = {
  publicProfile: (id) => api.get(`/suppliers/${id}/company-profile`),
  getCompanyProfile: () => api.get('/supplier/company-profile'),
  updateCompanyProfile: (payload) => api.put('/supplier/company-profile', payload),
  listCertificates: () => api.get('/supplier/certificates'),
  createCertificate: (payload) => api.post('/supplier/certificates', payload),
  deleteCertificate: (id) => api.delete(`/supplier/certificates/${id}`),
  listVideos: () => api.get('/supplier/videos'),
  createVideo: (payload) => api.post('/supplier/videos', payload),
  deleteVideo: (id) => api.delete(`/supplier/videos/${id}`),
  listStrengths: () => api.get('/supplier/strengths'),
  createStrength: (payload) => api.post('/supplier/strengths', payload),
  updateStrength: (id, payload) => api.put(`/supplier/strengths/${id}`, payload),
  deleteStrength: (id) => api.delete(`/supplier/strengths/${id}`),
  getProductionCapacity: () => api.get('/supplier/production-capacity'),
  updateProductionCapacity: (payload) =>
    api.put('/supplier/production-capacity', payload),
};
