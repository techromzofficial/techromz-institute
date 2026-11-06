/**
 * services.js — Centralized service functions that wrap the API layer.
 */

import { api, productsApi, ordersApi } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Types (JSDoc)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NavMenu
 * @property {string} label
 * @property {string} [href]
 * @property {{ heading: string, links: { label: string, href: string }[] }[]} [columns]
 */

/**
 * @typedef {Object} HomeSection
 * @property {string} id
 * @property {string} title
 * @property {'category_grid'|'trending'|'featured'} type
 * @property {Object[]} items
 */

// ─────────────────────────────────────────────────────────────────────────────
// Navbar menus
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/nav/menus — returns structured navbar menu data */
export async function getNavbarMenus() {
  try {
    const data = await api.get('/nav/menus');
    return data;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Home page
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/home/sections — returns all backend-driven homepage datasets */
export async function getHomeSections() {
  try {
    const data = await api.get('/home/sections');
    return {
      banners: data.banners || [],
      featured_products: data.featured_products || [],
      recommendations: data.recommendations || [],
      trending_products: data.trending_products || [],
      verified_suppliers: data.verified_suppliers || [],
      trending_keywords: data.trending_keywords || [],
    };
  } catch {
    return {
      banners: [],
      featured_products: [],
      recommendations: [],
      trending_products: [],
      verified_suppliers: [],
      trending_keywords: [],
    };
  }
}

/** GET /api/products/trending — returns trending product/category tiles */
export async function getTrendingProducts() {
  try {
    const data = await productsApi.trending();
    return data.data || data.products || [];
  } catch {
    return [];
  }
}

/** GET /api/home/recommendations — personalised "You May Like" items */
export async function getRecommendations() {
  try {
    return await api.get('/home/recommendations');
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Products & categories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/categories/{slug}/products
 * Returns paginated products for a category slug.
 * @param {string} slug
 * @param {Object} [params]
 */
export async function getCategoryProducts(slug, params = {}) {
  return productsApi.byCategory(slug, params);
}

/**
 * GET /api/products/{id}
 * Returns full product detail.
 * @param {string|number} id
 */
export async function getProductDetails(id) {
  return productsApi.get(id);
}

/**
 * GET /api/products?search=...&category=...&sort=...
 * Returns paginated filtered products.
 * @param {Object} params
 */
export async function searchProducts(params = {}) {
  return productsApi.list(params);
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/orders — creates an order from an accepted quotation. */
export async function createOrder(quotationId) {
  return await ordersApi.create(quotationId);
}

/**
 * GET /api/orders/{id}
 * Returns a single order by ID.
 * @param {string|number} id
 */
export async function getOrder(id) {
  return await ordersApi.get(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inquiries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/inquiries
 * Sends a buyer inquiry about one specific product to its supplier.
 * @param {Object} payload
 * @param {string|number} payload.product_id
 * @param {number|string} [payload.quantity]
 * @param {string} payload.unit
 * @param {string} payload.content
 * @param {string} payload.email
 * @param {File[]} [payload.attachments]
 */
export async function sendInquiry(payload) {
  const hasFiles = payload.attachments?.length > 0;

  if (hasFiles) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'attachments') {
        value.forEach((file) => formData.append('attachments[]', file));
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    return await api.post('/inquiries', formData);
  }

  return await api.post('/inquiries', payload);
}

