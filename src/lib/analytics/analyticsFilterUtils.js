/**
 * Filter constants and utilities for Analytics & Business Intelligence Dashboard
 */

export const DEFAULT_ANALYTICS_FILTERS = {
  reportingPeriod: "last-30-days",
  comparisonPeriod: "previous-30-days",
  businessDomain: "all",
  marketplaceChannel: "all",
  supplier: "all",
  brand: "all",
  productCategory: "all",
  product: "all",
  customerSegment: "all",
  region: "all",
  warehouse: "all",
  logisticsPartner: "all",
  paymentMethod: "all",
  currency: "LKR",
  riskLevel: "all",
  dateFrom: "",
  dateTo: "",
};

export const QUICK_PERIOD_TABS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last-7-days", label: "Last 7 Days" },
  { id: "last-30-days", label: "Last 30 Days" },
  { id: "last-90-days", label: "Last 90 Days" },
  { id: "this-month", label: "This Month" },
  { id: "previous-month", label: "Previous Month" },
  { id: "this-quarter", label: "This Quarter" },
  { id: "this-year", label: "This Year" },
  { id: "custom-range", label: "Custom Range" },
];

export const FILTER_OPTIONS = {
  reportingPeriod: [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last-7-days", label: "Last 7 Days" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "last-90-days", label: "Last 90 Days" },
    { value: "this-month", label: "This Month" },
    { value: "previous-month", label: "Previous Month" },
    { value: "this-quarter", label: "This Quarter" },
    { value: "this-year", label: "This Year" },
    { value: "custom-range", label: "Custom Range" },
  ],
  comparisonPeriod: [
    { value: "previous-30-days", label: "Previous 30 Days" },
    { value: "previous-period", label: "Previous Period" },
    { value: "previous-year", label: "Same Period Last Year" },
    { value: "none", label: "No Comparison" },
  ],
  businessDomain: [
    { value: "all", label: "All Domains" },
    { value: "retail-b2c", label: "Retail B2C" },
    { value: "wholesale-b2b", label: "Wholesale B2B" },
    { value: "marketplace", label: "Marketplace Platform" },
  ],
  marketplaceChannel: [
    { value: "all", label: "All Channels" },
    { value: "slbeauty-web", label: "SL Beauty Web App" },
    { value: "mobile-app", label: "SL Beauty Mobile App" },
    { value: "partner-store", label: "Partner Storefronts" },
  ],
  supplier: [
    { value: "all", label: "All Suppliers" },
    { value: "sup-0045", label: "Luxe Distribution Pvt Ltd" },
    { value: "sup-0012", label: "Pure Organic Co" },
    { value: "sup-0067", label: "Vogue Supply" },
    { value: "sup-0033", label: "Beauty Plus Ltd" },
    { value: "sup-0055", label: "Royal Fragrances" },
  ],
  brand: [
    { value: "all", label: "All Brands" },
    { value: "estee-lauder", label: "EstÃ©e Lauder" },
    { value: "vogue-beauty", label: "Vogue Beauty" },
    { value: "pure-organic", label: "Pure Organic" },
    { value: "beauty-plus", label: "Beauty Plus" },
    { value: "yardley", label: "Yardley" },
  ],
  productCategory: [
    { value: "all", label: "All Categories" },
    { value: "skincare", label: "Skincare" },
    { value: "makeup", label: "Makeup" },
    { value: "haircare", label: "Haircare" },
    { value: "fragrance", label: "Fragrance" },
    { value: "personal-care", label: "Personal Care" },
    { value: "wellness", label: "Wellness" },
  ],
  product: [
    { value: "all", label: "All Products" },
    { value: "421", label: "Radiance Vitamin C Serum" },
    { value: "436", label: "Matte Finish Lipstick" },
    { value: "398", label: "Hydrating Face Moisturizer" },
    { value: "512", label: "Argan Oil Shampoo" },
    { value: "678", label: "Lavender Eau de Parfum" },
  ],
  customerSegment: [
    { value: "all", label: "All Segments" },
    { value: "new", label: "New Customers" },
    { value: "active", label: "Active Customers" },
    { value: "loyalty", label: "Loyalty Members" },
    { value: "high-value", label: "High-Value (VIP)" },
    { value: "at-risk", label: "At-Risk Customers" },
  ],
  region: [
    { value: "all", label: "All Regions" },
    { value: "western", label: "Western Province" },
    { value: "central", label: "Central Province" },
    { value: "southern", label: "Southern Province" },
    { value: "northern", label: "Northern Province" },
  ],
  warehouse: [
    { value: "all", label: "All Warehouses" },
    { value: "wh-colombo-01", label: "Colombo Central Hub" },
    { value: "wh-kandy-02", label: "Kandy Regional Fulfillment" },
    { value: "wh-galle-03", label: "Galle Hub" },
  ],
  logisticsPartner: [
    { value: "all", label: "All Partners" },
    { value: "speedx", label: "SpeedX Logistics" },
    { value: "karyos", label: "Karyos Express" },
    { value: "quickpack", label: "QuickPack Courier" },
  ],
  paymentMethod: [
    { value: "all", label: "All Methods" },
    { value: "card", label: "Credit/Debit Card" },
    { value: "cod", label: "Cash on Delivery (COD)" },
    { value: "koko", label: "Koko BNPL" },
    { value: "bank-transfer", label: "Bank Transfer" },
  ],
  currency: [
    { value: "LKR", label: "LKR" },
    { value: "USD", label: "USD" },
  ],
  riskLevel: [
    { value: "all", label: "All Risk Levels" },
    { value: "low", label: "Low Risk" },
    { value: "medium", label: "Medium Risk" },
    { value: "high", label: "High Risk" },
    { value: "critical", label: "Critical Risk" },
  ],
};

/**
 * Parses search parameters from URL search string or URLSearchParams.
 */
export function parseAnalyticsFilters(searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams || "");

  const result = { ...DEFAULT_ANALYTICS_FILTERS };

  for (const key of Object.keys(DEFAULT_ANALYTICS_FILTERS)) {
    const val = params.get(key);
    if (val !== null && val !== undefined) {
      result[key] = val;
    }
  }

  return result;
}

/**
 * Formats filters back into a clean search query string.
 */
export function buildAnalyticsFilterQuery(filters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== DEFAULT_ANALYTICS_FILTERS[key]) {
      params.set(key, value);
    }
  }

  return params.toString();
}

