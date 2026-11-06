import { api } from "@/lib/api";

type QueryValue = string | number | undefined;
type Counts = Record<string, number>;
type Timestamp = string | null;

export type MarketplacePagination = {
  current_page: number; per_page: number; total: number; last_page: number;
  from: number | null; to: number | null;
};
export type MarketplacePageParams = { page?: number; per_page?: number };
export type MarketplaceOrderParams = MarketplacePageParams & { q?: string; status?: string;
  payment_status?: string; fulfillment_status?: string; supplier_id?: number };
export type MarketplaceSellerParams = MarketplacePageParams & { q?: string; status?: string;
  verification_status?: "all" | "pending" | "verified" | "rejected" };
export type MarketplaceListingParams = MarketplacePageParams & { q?: string; status?: string; channel_id?: number };
export type MarketplaceChannelParams = MarketplacePageParams & { q?: string; type?: string;
  status?: "all" | "active" | "inactive" };
export type MarketplacePromotionParams = MarketplacePageParams & { q?: string; status?: string;
  type?: "all" | "percentage" | "fixed_amount"; channel_id?: number };
export type MarketplacePolicyParams = MarketplacePageParams & { q?: string; status?: string; severity?: string;
  supplier_id?: number; product_id?: number; channel_id?: number };
export type MarketplaceReturnParams = MarketplacePageParams & { q?: string; type?: "all" | "return" | "dispute";
  status?: string; supplier_id?: number; order_id?: number };
export type MarketplaceSupplierProjection = {
  id: number; company_name: string; status?: string | null;
  verification_status?: "pending" | "verified" | "rejected" | null;
};
export type MarketplaceChannelProjection = {
  id: number; uuid?: string; code: string; name: string; type: string;
  status: "active" | "inactive";
};
export type MarketplaceCurrencyTotal = {
  currency: string; orders_count: number; total_amount: string;
};

export type MarketplaceCommandCenterResponse = {
  summary: {
    orders: { total: number }; suppliers: { total: number }; products: { total: number };
    listings: { total: number; published: number }; channels: { total: number; active: number };
    promotions: { active: number }; policy_violations: { open: number };
    returns_disputes: { open: number };
  };
  order_status_counts: Counts;
  currency_totals: MarketplaceCurrencyTotal[];
  recent_orders: Array<{
    id: number; uuid: string | null; order_reference: string;
    supplier: MarketplaceSupplierProjection | null; total_amount: string | null;
    currency: string | null; status: string; payment_status: string | null;
    fulfillment_status: string | null; approval_status: string | null;
    order_source: string | null; created_at: Timestamp;
  }>;
  domains: Record<"listings" | "channels" | "promotions" | "policy_violations" |
    "returns_disputes" | "sellers" | "orders" | "settings", { available: boolean }>;
  navigation: Array<{ code: string; label: string; href: string }>;
  capabilities: { read: boolean; manage: false; create_order: false; assign_orders: false;
    update_order_status: false; cancel_order: false; export: false };
};

export type MarketplaceOrderCapabilities = {
  read: boolean;
  create_order: boolean;
  assign_orders: boolean;
  update_status: boolean;
  hold_order: boolean;
  cancel_order: boolean;
  refund_review: boolean;
  return_review: boolean;
  escalate_order: boolean;
  contact_customer: boolean;
  contact_supplier: boolean;
  export: boolean;
};
export type MarketplaceOrderAmounts = {
  total: string | null; subtotal: string | null; tax: string | null;
  shipping: string | null; discount: string | null; platform_fee: string | null;
  currency: string | null;
};
export type MarketplaceOrder = {
  id: number; uuid: string | null; order_reference: string;
  customer: { id: number; name: string; email: string } | null;
  supplier: MarketplaceSupplierProjection | null; items_count: number;
  amounts: MarketplaceOrderAmounts; status: string; payment_status: string | null;
  fulfillment_status: string | null; approval_status: string | null;
  sla_status?: "breached" | "on_track";
  payment_method: string | null; order_source: string | null; delivery_terms: string | null;
  expected_delivery_date: Timestamp; confirmed_at: Timestamp; created_at: Timestamp; updated_at: Timestamp;
};
export type MarketplaceOrdersResponse = {
  summary: { total_orders: number; status_counts: Counts; payment_status_counts: Counts;
    fulfillment_status_counts: Counts; currency_totals: MarketplaceCurrencyTotal[] };
  orders: MarketplaceOrder[];
  filters: { statuses: string[]; observed_payment_statuses: string[]; observed_fulfillment_statuses: string[] };
  pagination: MarketplacePagination; capabilities: MarketplaceOrderCapabilities;
};
export type MarketplaceOrderDetailResponse = {
  order: Omit<MarketplaceOrder, "items_count"> & {
    supplier: (MarketplaceSupplierProjection & { email: string | null; phone: string | null }) | null;
    payment_terms: string | null; shipping_terms: string | null;
  };
  items: Array<{
    id: number;
    product_id: number | null;
    product_name: string;
    sku?: string | null;
    variant_label?: string | null;
    quantity: string;
    unit_price: string | null;
    tax_amount?: string | null;
    discount_amount?: string | null;
    amount: string | null;
    total_amount?: string | null;
    policy_snapshot_id?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
  shipments: Array<{ id: number; uuid: string; shipment_number: string; carrier: string | null;
    tracking_number: string | null; shipping_method: string | null; estimated_delivery_date: Timestamp; status: string }>;
  status_history: Array<{ status: string; created_at: Timestamp }>;
  capabilities: MarketplaceOrderCapabilities;
};

export type MarketplaceSeller = {
  id: number; company_name: string; slug: string | null; email: string | null; phone: string | null;
  website: string | null; business_type: string | null; country: string | null; city: string | null;
  verification_status: "pending" | "verified" | "rejected" | null; status: string | null;
  is_featured: boolean; rating: string | null; reviews_count: number; products_count: number;
  orders_count: number; certificates_count: number; created_at: Timestamp;
};
export type MarketplaceSellerCapabilities = { read: boolean; create_seller: false; edit_seller: false;
  verify_seller: false; suspend_seller: false; feature_seller: false; export: false };
export type MarketplaceSellersResponse = {
  summary: { total_sellers: number; active_sellers: number; featured_sellers: number;
    status_counts: Counts; verification_counts: Counts };
  sellers: MarketplaceSeller[];
  filters: { observed_statuses: string[]; observed_verification_statuses: string[] };
  pagination: MarketplacePagination; capabilities: MarketplaceSellerCapabilities;
};
export type MarketplaceSellerDetailResponse = {
  seller: MarketplaceSeller & { address: string | null; updated_at: Timestamp };
  recent_products: Array<{ id: number; name: string; sku: string | null; status: string;
    price: string | null; currency_id: number | null; created_at: Timestamp }>;
  recent_orders: Array<{ id: number; uuid: string | null; order_number: string; status: string;
    payment_status: string | null; fulfillment_status: string | null; currency: string | null;
    total: string | null; created_at: Timestamp }>;
  capabilities: MarketplaceSellerCapabilities & { create_listing: false };
};

export type MarketplaceListingCapabilities = { read: boolean; create_listing: boolean; edit_listing: boolean;
  submit_listing: boolean; approve_listing: boolean; request_changes: boolean; reject_listing: boolean;
  publish_listing: boolean; pause_listing: boolean; unpublish_listing: boolean; suspend_listing: boolean;
  reinstate_listing: boolean; archive_listing: boolean;
  change_price_override: boolean; export: false };
export type MarketplaceListing = {
  id: number; uuid: string; status: string; override_price: string | null; published_at: Timestamp;
  paused_at: Timestamp; archived_at: Timestamp; created_at: Timestamp;
  product: { id: number; name: string; sku: string | null; status: string; price: string | null;
    supplier: MarketplaceSupplierProjection | null } | null;
  channel: MarketplaceChannelProjection | null;
};
export type MarketplaceListingsResponse = {
  summary: { total_listings: number; published_listings: number; draft_listings: number;
    paused_listings: number; archived_listings: number; status_counts: Counts; channel_counts: Counts };
  listings: MarketplaceListing[]; filters: { statuses: string[]; observed_channel_ids: number[] };
  pagination: MarketplacePagination; options: { products: Array<{ id: number; name: string; sku: string | null }>;
    channels: MarketplaceChannelProjection[] } | null; capabilities: MarketplaceListingCapabilities;
};
export type MarketplaceListingDetailResponse = {
  listing: Omit<MarketplaceListing, "product" | "channel"> & { version: number;
    eligibility_status: string | null; eligibility_blockers: string[] | null;
    eligibility_evaluated_at: Timestamp; updated_at: Timestamp };
  product: (NonNullable<MarketplaceListing["product"]> & { currency_id: number | null;
    supplier: (MarketplaceSupplierProjection & { email: string | null; phone: string | null }) | null }) | null;
  channel: MarketplaceChannelProjection | null; capabilities: MarketplaceListingCapabilities;
};
export type MarketplaceListingMutationResponse = { listing: {
  id: number; uuid: string; product_id?: number; channel_id?: number; status: string; version: number;
  override_price?: string | null; eligibility_status?: string | null; eligibility_blockers?: string[];
  eligibility_evaluated_at?: Timestamp; published_at?: Timestamp; paused_at?: Timestamp;
  archived_at?: Timestamp; created_at?: Timestamp; updated_at?: Timestamp;
} };
export type MarketplaceListingCreatePayload = {
  product_id: number; channel_id: number; override_price?: string | number | null;
};
export type MarketplaceListingUpdatePayload = {
  expected_version: number; override_price: string | number | null;
};

export type MarketplaceChannel = MarketplaceChannelProjection & { created_at: Timestamp; updated_at: Timestamp;
  marketplace: { listings_total: number; published_listings: number; promotions_total: number;
    active_promotions: number; orders_total: number } };
export type MarketplaceChannelCapabilities = { read: boolean; create_channel: boolean; edit_channel: boolean;
  delete_channel: false; change_status: boolean; edit_configuration: false; export: false };
export type MarketplaceChannelsResponse = { summary: { total_channels: number; active_channels: number;
  inactive_channels: number; published_listings: number; active_promotions: number };
  channels: MarketplaceChannel[]; filters: { types: string[]; statuses: string[] };
  pagination: MarketplacePagination; capabilities: MarketplaceChannelCapabilities };
export type MarketplaceChannelDetailResponse = { channel: MarketplaceChannel; capabilities: MarketplaceChannelCapabilities };
export type MarketplaceChannelMutationResponse = { channel: MarketplaceChannelProjection & {
  created_at?: Timestamp; updated_at?: Timestamp;
} };

export type MarketplacePromotion = { id: number; uuid: string; channel_id?: number; name: string;
  code: string | null; type: "percentage" | "fixed_amount"; value: string | null; status: string;
  starts_at: Timestamp; ends_at: Timestamp; created_at: Timestamp; updated_at?: Timestamp;
  channel?: MarketplaceChannelProjection | null;
  usage_limit?: number | null; per_customer_limit?: number | null; usage_count?: number;
  budget_cap?: string | null; budget_used?: string | null; min_purchase_amount?: string | null;
  stacking_rule?: "exclusive" | "stackable" | string | null; applicable_scope?: string | null };
export type MarketplacePromotionCapabilities = { read: boolean; create_promotion: boolean; edit_promotion: boolean;
  schedule_promotion: boolean; activate_promotion: boolean; pause_promotion: boolean; complete_promotion: boolean;
  archive_promotion: boolean; apply_to_checkout: false; export: false };
export type MarketplacePromotionsResponse = { summary: { total_promotions: number; active_promotions: number;
  scheduled_promotions: number; draft_promotions: number; completed_promotions: number; status_counts: Counts;
  type_counts: Counts; channel_counts: Counts }; promotions: MarketplacePromotion[];
  filters: { statuses: string[]; types: string[]; observed_channel_ids: number[] };
  pagination: MarketplacePagination; options: { channels: MarketplaceChannelProjection[] } | null;
  capabilities: MarketplacePromotionCapabilities };
export type MarketplacePromotionDetailResponse = { promotion: MarketplacePromotion;
  channel: MarketplaceChannelProjection | null; capabilities: MarketplacePromotionCapabilities };
export type MarketplacePromotionMutationResponse = { promotion: MarketplacePromotion };

export type MarketplacePolicyViolation = { id: number; uuid: string; policy_code: string; title: string;
  description: string | null; severity: string; status: string;
  seller_appeal_text?: string | null;
  seller_appeal_at?: Timestamp;
  appeal_status?: string | null;
  action_taken?: string | null;
  detected_at: Timestamp; resolved_at: Timestamp;
  created_at: Timestamp; updated_at?: Timestamp; supplier: MarketplaceSupplierProjection | null;
  product: { id: number; name: string; sku: string | null; status: string } | null;
  channel: MarketplaceChannelProjection | null };
export type MarketplacePolicyCapabilities = { read: boolean; create_violation?: false; edit_violation?: false;
  assign_violation?: false; review_violation?: boolean; resolve_violation?: boolean; dismiss_violation?: boolean;
  review?: boolean; resolve?: boolean; dismiss?: boolean; appeal?: boolean; emergency_pause?: boolean;
  suspend_supplier: false; disable_product: false; export: false };
export type MarketplacePolicyViolationsResponse = { summary: { total_violations: number; open_violations: number;
  under_review_violations: number; resolved_violations: number; critical_violations: number;
  status_counts: Counts; severity_counts: Counts }; violations: MarketplacePolicyViolation[];
  filters: { statuses: string[]; severities: string[] }; pagination: MarketplacePagination;
  capabilities: MarketplacePolicyCapabilities };
export type MarketplacePolicyDetailResponse = { violation: MarketplacePolicyViolation; capabilities: MarketplacePolicyCapabilities };
export type MarketplacePolicyTransitionResponse = { message: string; violation: Pick<MarketplacePolicyViolation,
  "id" | "uuid" | "policy_code" | "severity" | "status" | "resolved_at"> };

export type MarketplaceReturnCase = { id: number; uuid: string; type: "return" | "dispute";
  reason_code: string | null; subject: string; description: string | null; status: string;
  rma_reference?: string | null;
  approved_refund_amount?: string | null;
  refund_idempotency_key?: string | null;
  seller_response_text?: string | null;
  seller_response_at?: Timestamp;
  requested_at: Timestamp; resolved_at: Timestamp; created_at: Timestamp; updated_at?: Timestamp;
  order: { id: number; order_number: string; status: string; payment_status: string | null;
    fulfillment_status: string | null; total: string | null } | null;
  supplier: MarketplaceSupplierProjection | null;
  items?: Array<{
    id: number;
    uuid: string;
    order_item_id: number;
    requested_quantity: number;
    received_quantity?: number | null;
    inspected_quantity?: number | null;
    reason?: string | null;
    order_item?: { id: number; product_name: string; sku?: string | null; quantity: string | number; unit_price: string | number } | null;
  }>;
};
export type MarketplaceReturnCapabilities = { read: boolean; create_case: false; edit_case: false;
  review_case: boolean; approve_case: boolean; reject_case: boolean; resolve_case: boolean; cancel_case: boolean;
  respond?: boolean; create_reverse_shipment: false; issue_refund: false; export: false };
export type MarketplaceReturnsResponse = { summary: { total_cases: number; open_cases: number; return_cases: number;
  dispute_cases: number; resolved_cases: number; status_counts: Counts; type_counts: Counts };
  returns: MarketplaceReturnCase[]; filters: { types: string[]; statuses: string[] };
  pagination: MarketplacePagination; capabilities: MarketplaceReturnCapabilities };
export type MarketplaceReturnDetailResponse = { return_case: Omit<MarketplaceReturnCase, "order"> & {
  order: (NonNullable<MarketplaceReturnCase["order"]> & { uuid: string | null; currency: string | null;
    subtotal: string | null; tax: string | null; shipping: string | null; discount: string | null }) | null };
  domain_boundaries: { marketplace: string; logistics: string; finance: string };
  capabilities: MarketplaceReturnCapabilities };
export type MarketplaceReturnTransitionResponse = { return_case: Pick<MarketplaceReturnCase,
  "id" | "uuid" | "type" | "status" | "resolved_at"> & {
    rma_reference?: string | null;
    approved_refund_amount?: string | null;
    updated_at: Timestamp;
  };
  capabilities: MarketplaceReturnCapabilities };

export type MarketplaceSettings = { return_window_days: number; version: number; created_at: Timestamp; updated_at: Timestamp };
export type MarketplaceSettingsResponse = { settings: MarketplaceSettings | null; capabilities: { can_update: boolean } };

function withQuery(path: string, params: Record<string, QueryValue> = {}): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const encoded = query.toString();
  return encoded ? `${path}?${encoded}` : path;
}
const encodeId = (value: string | number) => encodeURIComponent(String(value));

export const fetchMarketplaceCommandCenter = (signal?: AbortSignal) =>
  api.get("/admin/marketplace", { signal }) as Promise<MarketplaceCommandCenterResponse>;
export const fetchMarketplaceOrders = (params: MarketplaceOrderParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/orders", params), { signal }) as Promise<MarketplaceOrdersResponse>;
export const fetchMarketplaceOrder = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/orders/${encodeId(value)}`, { signal }) as Promise<MarketplaceOrderDetailResponse>;
export const cancelMarketplaceOrder = (
  value: string | number,
  payload: { reason: string; idempotency_key?: string }
) =>
  api.post(`/admin/marketplace/orders/${encodeId(value)}/cancel`, payload) as Promise<{
    message: string;
    order: {
      id: number;
      uuid: string;
      order_reference: string;
      status: string;
      payment_status: string;
      fulfillment_status: string;
    };
  }>;
export const getMarketplaceOrdersExportUrl = (params: MarketplaceOrderParams = {}) =>
  withQuery("/api/admin/marketplace/orders/export", params);
export const fetchMarketplaceSellers = (params: MarketplaceSellerParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/sellers", params), { signal }) as Promise<MarketplaceSellersResponse>;
export const fetchMarketplaceSeller = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/sellers/${encodeId(value)}`, { signal }) as Promise<MarketplaceSellerDetailResponse>;

export type MarketplaceSellerAction = "approve" | "reject" | "suspend" | "reactivate" | "offboard";
export type MarketplaceSellerTransitionPayload = {
  action: MarketplaceSellerAction;
  reason?: string;
  notes?: string;
  evidence?: string;
};
export const transitionMarketplaceSeller = (value: string | number, payload: MarketplaceSellerTransitionPayload) =>
  api.post(`/admin/marketplace/sellers/${encodeId(value)}/transition`, payload) as Promise<{ seller: MarketplaceSeller }>;

export type SellerPerformanceData = {
  seller_id: number;
  company_name: string;
  status: string;
  performance: {
    total_orders: number;
    fulfilled_orders: number;
    cancelled_orders: number;
    cancellation_rate: number;
    returns_count: number;
    return_rate: number;
    violations_count: number;
    open_violations_count: number;
    critical_violations_count: number;
    dispatch_delays_count: number;
    alerts: Array<{ type: string; severity: string; message: string }>;
  };
};

export const fetchMarketplaceSellerPerformance = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/sellers/${encodeId(value)}/performance`, { signal }) as Promise<SellerPerformanceData>;

export const fetchMarketplaceListings = (params: MarketplaceListingParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/listings", params), { signal }) as Promise<MarketplaceListingsResponse>;
export const fetchMarketplaceListing = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/listings/${encodeId(value)}`, { signal }) as Promise<MarketplaceListingDetailResponse>;
export const createMarketplaceListing = (payload: MarketplaceListingCreatePayload) =>
  api.post("/admin/marketplace/listings", payload) as Promise<MarketplaceListingMutationResponse>;
export const updateMarketplaceListing = (value: string | number, payload: MarketplaceListingUpdatePayload) =>
  api.patch(`/admin/marketplace/listings/${encodeId(value)}`, payload) as Promise<MarketplaceListingMutationResponse>;
export type MarketplaceListingAction = "submit" | "approve" | "request_changes" | "reject" | "publish" | "unpublish" | "suspend" | "reinstate" | "archive";
export type MarketplaceListingTransitionPayload = {
  action: MarketplaceListingAction; expected_version: number; reason?: string | null;
};
export const transitionMarketplaceListing = (value: string | number, payload: MarketplaceListingTransitionPayload) =>
  api.post(`/admin/marketplace/listings/${encodeId(value)}/transition`, payload) as Promise<MarketplaceListingMutationResponse>;

export type MarketplaceBulkListingsPayload = {
  listing_ids: Array<number | string>;
  action: "pause" | "archive";
  reason?: string;
};
export const bulkTransitionMarketplaceListings = (payload: MarketplaceBulkListingsPayload) =>
  api.post("/admin/marketplace/listings/bulk", payload) as Promise<{
    action: string;
    summary: { total: number; succeeded: number; failed: number };
    succeeded: Array<{ id: number; uuid: string; status: string; version: number }>;
    failed: Array<{ id: number | string; reason: string }>;
  }>;

export const fetchMarketplaceChannels = (params: MarketplaceChannelParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/channels", params), { signal }) as Promise<MarketplaceChannelsResponse>;
export const fetchMarketplaceChannel = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/channels/${encodeId(value)}`, { signal }) as Promise<MarketplaceChannelDetailResponse>;
export const createMarketplaceChannel = (payload: { code: string; name: string; type: string }) =>
  api.post("/admin/marketplace/channels", payload) as Promise<MarketplaceChannelMutationResponse>;
export const updateMarketplaceChannel = (value: string | number, payload: { name: string; type: string }) =>
  api.patch(`/admin/marketplace/channels/${encodeId(value)}`, payload) as Promise<MarketplaceChannelMutationResponse>;
export const changeMarketplaceChannelStatus = (value: string | number, status: "active" | "inactive") =>
  api.patch(`/admin/marketplace/channels/${encodeId(value)}/status`, { status }) as Promise<MarketplaceChannelMutationResponse>;

export type MarketplacePromotionWritePayload = { channel_id: number; name: string; code?: string | null;
  type: "percentage" | "fixed_amount"; value: string | number; starts_at?: string | null; ends_at?: string | null;
  usage_limit?: number | null; per_customer_limit?: number | null; budget_cap?: string | number | null;
  min_purchase_amount?: string | number | null; stacking_rule?: "exclusive" | "stackable" | string | null;
  applicable_scope?: string | null };
export const fetchMarketplacePromotions = (params: MarketplacePromotionParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/promotions", params), { signal }) as Promise<MarketplacePromotionsResponse>;
export const fetchMarketplacePromotion = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/promotions/${encodeId(value)}`, { signal }) as Promise<MarketplacePromotionDetailResponse>;
export const createMarketplacePromotion = (payload: MarketplacePromotionWritePayload) =>
  api.post("/admin/marketplace/promotions", payload) as Promise<MarketplacePromotionMutationResponse>;
export const updateMarketplacePromotion = (value: string | number, payload: Partial<MarketplacePromotionWritePayload>) =>
  api.patch(`/admin/marketplace/promotions/${encodeId(value)}`, payload) as Promise<MarketplacePromotionMutationResponse>;
export type MarketplacePromotionAction = "schedule" | "activate" | "resume" | "pause" | "complete" | "archive";
export const transitionMarketplacePromotion = (value: string | number, action: MarketplacePromotionAction) =>
  api.post(`/admin/marketplace/promotions/${encodeId(value)}/transition`, { action }) as Promise<MarketplacePromotionMutationResponse>;

export const fetchMarketplacePolicyViolations = (params: MarketplacePolicyParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/policy-violations", params), { signal }) as Promise<MarketplacePolicyViolationsResponse>;
export const fetchMarketplacePolicyViolation = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/policy-violations/${encodeId(value)}`, { signal }) as Promise<MarketplacePolicyDetailResponse>;
export const transitionMarketplacePolicyViolation = (value: string | number, action: "review" | "resolve" | "dismiss") =>
  api.post(`/admin/marketplace/policy-violations/${encodeId(value)}/transition`, { action }) as Promise<MarketplacePolicyTransitionResponse>;
export const appealMarketplacePolicyViolation = (value: string | number, appeal: string) =>
  api.post(`/admin/marketplace/policy-violations/${encodeId(value)}/appeal`, { appeal }) as Promise<{
    message: string;
    violation: Pick<MarketplacePolicyViolation, "id" | "uuid" | "seller_appeal_text" | "seller_appeal_at" | "appeal_status">;
  }>;
export const emergencyPauseMarketplacePolicyViolation = (value: string | number) =>
  api.post(`/admin/marketplace/policy-violations/${encodeId(value)}/emergency-pause`) as Promise<{
    message: string;
    violation: Pick<MarketplacePolicyViolation, "id" | "uuid" | "action_taken">;
  }>;

export const fetchMarketplaceReturns = (params: MarketplaceReturnParams = {}, signal?: AbortSignal) =>
  api.get(withQuery("/admin/marketplace/returns", params), { signal }) as Promise<MarketplaceReturnsResponse>;
export const fetchMarketplaceReturn = (value: string | number, signal?: AbortSignal) =>
  api.get(`/admin/marketplace/returns/${encodeId(value)}`, { signal }) as Promise<MarketplaceReturnDetailResponse>;
export const transitionMarketplaceReturn = (
  value: string | number,
  action: "review" | "approve" | "reject" | "resolve" | "cancel",
  payload?: { refund_amount?: number | string }
) =>
  api.post(
    `/admin/marketplace/returns/${encodeId(value)}/transition`,
    payload ? { action, ...payload } : { action }
  ) as Promise<MarketplaceReturnTransitionResponse>;
export const respondMarketplaceReturn = (
  value: string | number,
  response: string
) =>
  api.post(`/admin/marketplace/returns/${encodeId(value)}/respond`, { response }) as Promise<{
    return_case: Pick<MarketplaceReturnCase, "id" | "uuid" | "type" | "status" | "seller_response_text" | "seller_response_at"> & { updated_at: Timestamp };
    message: string;
    capabilities: MarketplaceReturnCapabilities;
  }>;

export const fetchMarketplaceSettings = (signal?: AbortSignal) =>
  api.get("/admin/marketplace/settings", { signal }) as Promise<MarketplaceSettingsResponse>;
export const updateMarketplaceSettings = (payload: { return_window_days: number; version: number; reason: string }) =>
  api.patch("/admin/marketplace/settings", payload) as Promise<MarketplaceSettingsResponse>;
