/**
 * Compatibility barrel for the frontend API layer.
 *
 * New code should prefer focused imports from src/lib/api/*, for example:
 * - @/lib/api/client
 * - @/lib/api/home
 * - @/lib/api/products
 * - @/lib/api/suppliers
 * - @/lib/api/auth
 * - @/lib/api/rfq
 * - @/lib/api/dashboard
 *
 * Existing pages can continue importing from @/lib/api while the frontend is
 * migrated route by route.
 */

import {
  API_BASE,
  api,
  clearAuthToken,
  getAuthToken,
  request,
  saveAuthToken,
  uploadFormData,
  withQuery,
} from './api/client';
import { authApi } from './api/auth';
import { categoriesApi, productsApi, productTagsApi } from './api/products';
import {
  supplierProductsApi,
  supplierProfileApi,
  suppliersApi,
} from './api/suppliers';
import { quotationsApi, rfqApi } from './api/rfq';
import { ordersApi, supplierDashboardApi, userApi } from './api/dashboard';
import { getHomeSections, homeApi } from './api/home';
import {
  getSlBeautyBrand,
  getSlBeautyBrands,
  slBeautyPublicApi,
} from './api/slBeauty';

export {
  API_BASE,
  api,
  authApi,
  categoriesApi,
  clearAuthToken,
  getAuthToken,
  getHomeSections,
  getSlBeautyBrand,
  getSlBeautyBrands,
  homeApi,
  ordersApi,
  productTagsApi,
  productsApi,
  quotationsApi,
  request,
  rfqApi,
  saveAuthToken,
  slBeautyPublicApi,
  supplierDashboardApi,
  supplierProductsApi,
  supplierProfileApi,
  suppliersApi,
  uploadFormData,
  userApi,
  withQuery,
};

function slugifyProductName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cartItemPayload(productOrId, qty = 1) {
  const quantity = Number(qty) || 1;

  if (typeof productOrId === 'number') {
    return { product_id: productOrId, quantity };
  }

  if (typeof productOrId === 'string' && /^\d+$/.test(productOrId)) {
    return { product_id: Number(productOrId), quantity };
  }

  if (productOrId && typeof productOrId === 'object') {
    const numericId = Number(productOrId.id);
    if (Number.isInteger(numericId) && String(productOrId.id) === String(numericId)) {
      return { product_id: numericId, quantity };
    }

    return {
      product_slug: productOrId.product_slug
        || productOrId.backendSlug
        || slugifyProductName(productOrId.name || productOrId.label)
        || productOrId.slug,
      quantity,
    };
  }

  return { product_slug: String(productOrId || ''), quantity };
}

function numericProductId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function productDisplayName(product) {
  if (!product || typeof product !== 'object') return '';
  return String(product.name || product.label || '').trim();
}

function normalizedProductName(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

async function cartPayloadForProduct(productOrId, qty) {
  const payload = cartItemPayload(productOrId, qty);

  // API-backed cards already have a database ID, so avoid an unnecessary lookup.
  if (payload.product_id) return payload;

  // Some homepage and navigation cards are presentation data with display slugs.
  // Resolve them against the live catalogue before creating a cart item so a
  // display-only identifier cannot trigger Laravel's 422 product validation.
  const name = productDisplayName(productOrId);
  if (!name) return payload;

  const response = await api.get(withQuery('/products', { search: name }));
  const products = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.products)
      ? response.products
      : [];
  const matchedProduct = products.find((product) => (
    normalizedProductName(product.name) === normalizedProductName(name)
  ));
  const productId = numericProductId(matchedProduct?.id);

  if (!productId) {
    throw new Error('This product is not currently available in the catalogue.');
  }

  return { product_id: productId, quantity: payload.quantity };
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: async (productOrId, qty = 1) =>
    api.post('/cart/items', await cartPayloadForProduct(productOrId, qty)),
  update: (itemId, qty) => api.put(`/cart/items/${itemId}`, { quantity: qty }),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { product_id: productId }),
  remove: (wishlistId) => api.delete(`/wishlist/${wishlistId}`),
};

export const checkoutApi = {
  quote: (payload) => api.post('/checkout/quote', payload),
  confirm: (payload) => api.post('/checkout/confirm', payload),
  tracking: (reference) => api.get(`/orders/${reference}/tracking`),
  retryPayment: (reference) => api.post(`/orders/${reference}/retry-payment`, {}),
};

export const uploadApi = {
  uploadImage: (file, category) =>
    api.post('/uploads/image', uploadFormData(file, category)),
  uploadDocument: (file, category) =>
    api.post('/uploads/document', uploadFormData(file, category)),
  deleteUpload: (id) => api.delete(`/uploads/${id}`),
};

export const notificationsApi = {
  list: (params = {}) => api.get(withQuery('/notifications', params)),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const conversationsApi = {
  list: () => api.get('/conversations'),
  create: (payload) => api.post('/conversations', payload),
  get: (id) => api.get(`/conversations/${id}`),
};

export const messagesApi = {
  send: (conversationId, message) =>
    api.post('/messages', { conversation_id: conversationId, message }),
  markRead: (id) => api.put(`/messages/${id}/read`),
};
