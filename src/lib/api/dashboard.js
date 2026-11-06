import { api, withQuery } from './client';
import { rfqApi } from './rfq';

export const ordersApi = {
  list: (params = {}) => api.get(withQuery('/orders', params)),
  get: (id) => api.get(`/orders/${id}`),
  create: (quotationId) => api.post('/orders', { quotation_id: quotationId }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const userApi = {
  dashboard: () => api.get('/user/dashboard'),
  profile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePassword: (data) => api.put('/user/password', data),
  orders: (params = {}) => ordersApi.list(params),
  rfqs: (params = {}) => rfqApi.list(params),
  messages: () => api.get('/conversations'),
};

export const supplierDashboardApi = {
  overview: () => api.get('/user/dashboard'),
  rfqs: (params = {}) => rfqApi.supplierList(params),
  quotations: (params = {}) => api.get(withQuery('/supplier/quotations', params)),
  orders: (params = {}) => ordersApi.list(params),
  products: (params = {}) => api.get(withQuery('/supplier/products', params)),
};
