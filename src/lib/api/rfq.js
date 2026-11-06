import { api, withQuery } from './client';

export const rfqApi = {
  list: (params = {}) => api.get(withQuery('/rfqs', params)),
  get: (id) => api.get(`/rfqs/${id}`),
  submit: (payload) => api.post('/rfqs', payload),
  update: (id, payload) => api.put(`/rfqs/${id}`, payload),
  delete: (id) => api.delete(`/rfqs/${id}`),
  supplierList: (params = {}) => api.get(withQuery('/supplier/rfqs', params)),
  supplierGet: (id) => api.get(`/supplier/rfqs/${id}`),
};

export const quotationsApi = {
  create: (rfqId, payload) => api.post(`/rfqs/${rfqId}/quotations`, payload),
  listByRfq: (rfqId, params = {}) =>
    api.get(withQuery(`/rfqs/${rfqId}/quotations`, params)),
  supplierList: (params = {}) => api.get(withQuery('/supplier/quotations', params)),
  get: (id) => api.get(`/quotations/${id}`),
  update: (id, payload) => api.put(`/quotations/${id}`, payload),
  accept: (id) => api.post(`/quotations/${id}/accept`),
  reject: (id) => api.post(`/quotations/${id}/reject`),
};
