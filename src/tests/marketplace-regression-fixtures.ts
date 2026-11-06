export const marketplaceOrderDetail = {
  order: {
    id: 21, uuid: "order-uuid", order_reference: "ORD-2026-009021",
    customer: { id: 7, name: "Elena Rodriguez", email: "elena.rodriguez@example.com" },
    supplier: { id: 4, company_name: "Luxe Distribution", email: "seller@example.test", phone: "+94 11 555 0101", status: "active", verification_status: "verified" },
    amounts: { total: "14500.00", subtotal: "13000.00", tax: "1000.00", shipping: "500.00", discount: "0.00", platform_fee: "1450.00", currency: "LKR" },
    status: "processing", payment_status: "paid", fulfillment_status: "awaiting_supplier", approval_status: "approved",
    payment_method: "card", payment_terms: "Prepaid", shipping_terms: "Door delivery", delivery_terms: "DAP", order_source: "web_storefront",
    confirmed_at: "2026-09-09T10:00:00Z", expected_delivery_date: "2026-09-12", created_at: "2026-09-09T09:00:00Z", updated_at: "2026-09-09T10:00:00Z",
  },
  items: [{ id: 1, product_id: 5, product_name: "Radiance Vitamin C Serum", quantity: 1, unit_price: "13000.00", amount: "13000.00" }],
  shipments: [{ id: 91, uuid: "shipment-uuid", shipment_number: "SHP-90210", carrier: "Swift Logistics", tracking_number: "TRK-90210", shipping_method: "Express", estimated_delivery_date: "2026-09-12", status: "pending" }],
  status_history: [{ status: "processing", created_at: "2026-09-09T10:00:00Z" }],
  capabilities: { read: true, update_status: false, hold_order: false, cancel_order: false, refund_review: false, return_review: false, escalate_order: false, contact_customer: false, contact_supplier: false },
};

export const marketplaceOrders = {
  summary: { total_orders: 3, status_counts: { pending: 1, completed: 1, cancelled: 1 }, payment_status_counts: { paid: 2 }, fulfillment_status_counts: { processing: 1 }, currency_totals: [{ currency: "LKR", orders_count: 3, total_amount: "3650000.00" }] },
  orders: [marketplaceOrderDetail.order].map((order) => ({ ...order, items_count: 1, supplier: order.supplier && { id: order.supplier.id, company_name: order.supplier.company_name } })),
  filters: { statuses: ["pending", "completed", "cancelled"], observed_payment_statuses: ["paid"], observed_fulfillment_statuses: ["awaiting_supplier"] },
  pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1, from: 1, to: 1 },
  capabilities: { read: true, create_order: false, assign_orders: false, update_status: false, hold_order: false, cancel_order: false, refund_review: false, return_review: false, escalate_order: false, contact_customer: false, contact_supplier: false, export: false },
};

export const marketplaceReturnDetail = {
  return_case: {
    id: 45091, uuid: "return-uuid", type: "return", reason_code: "damaged", subject: "Damaged serum return", description: "Seal arrived broken and the product leaked into the outer packaging.", status: "pending", requested_at: "2026-09-09T12:00:00Z", resolved_at: null, created_at: "2026-09-09T12:00:00Z", updated_at: "2026-09-09T12:00:00Z",
    order: { id: 21, uuid: "order-uuid", order_number: "ORD-2026-009021", status: "processing", payment_status: "paid", fulfillment_status: "awaiting_supplier", currency: "LKR", subtotal: "13000.00", tax: "1000.00", shipping: "500.00", discount: "0.00", total: "14500.00" },
    supplier: { id: 4, company_name: "Luxe Distribution", status: "active", verification_status: "verified" },
  },
  domain_boundaries: { marketplace: "Commercial case ownership", logistics: "Physical reverse logistics", finance: "Refund execution" },
  capabilities: { read: true, edit_case: false, approve_case: false, reject_case: false, resolve_case: false, cancel_case: false, create_reverse_shipment: false, issue_refund: false },
};

export const marketplaceReturns = {
  summary: { total_cases: 1, open_cases: 1, return_cases: 1, dispute_cases: 0, resolved_cases: 0, status_counts: { pending: 1 }, type_counts: { return: 1 } },
  returns: [marketplaceReturnDetail.return_case], filters: { types: ["return"], statuses: ["pending"] },
  pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1, from: 1, to: 1 },
  capabilities: { ...marketplaceReturnDetail.capabilities, create_case: false, export: false },
};
