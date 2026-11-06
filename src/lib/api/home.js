import { api } from './client';
import { productsApi } from './products';

const emptyHomeSections = {
  banners: [],
  featured_products: [],
  recommendations: [],
  trending_products: [],
  verified_suppliers: [],
  trending_keywords: [],
};

export const homeApi = {
  sections: () => api.get('/home/sections'),
  recommendations: () => api.get('/home/recommendations'),
  featuredProducts: () => api.get('/home/featured-products'),
  verifiedSuppliers: () => api.get('/home/verified-suppliers'),
  trendingProducts: () => productsApi.trending(),
};

export async function getHomeSections() {
  try {
    const data = await homeApi.sections();
    return {
      ...emptyHomeSections,
      banners: data.banners || [],
      featured_products: data.featured_products || [],
      recommendations: data.recommendations || [],
      trending_products: data.trending_products || [],
      verified_suppliers: data.verified_suppliers || [],
      trending_keywords: data.trending_keywords || [],
    };
  } catch {
    return emptyHomeSections;
  }
}
