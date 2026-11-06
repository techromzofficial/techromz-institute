import { api, withQuery } from './client';

const BRAND_QUERY_KEYS = ['search', 'page', 'per_page'];

function brandQueryParams(params = {}) {
  return BRAND_QUERY_KEYS.reduce((safeParams, key) => {
    const value = params[key];

    if (value !== undefined && value !== null && value !== '') {
      safeParams[key] = value;
    }

    return safeParams;
  }, {});
}

function brandSlug(slug) {
  const value = String(slug || '').trim();

  if (!value) {
    throw new Error('Brand slug is required.');
  }

  return encodeURIComponent(value);
}

export const slBeautyPublicApi = {
  brands: (params = {}) =>
    api.get(withQuery('/sl-beauty/brands', brandQueryParams(params))),
  brand: (slug) => api.get(`/sl-beauty/brands/${brandSlug(slug)}`),
};

export function getSlBeautyBrands(params = {}) {
  return slBeautyPublicApi.brands(params);
}

export function getSlBeautyBrand(slug) {
  return slBeautyPublicApi.brand(slug);
}
