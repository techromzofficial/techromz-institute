/**
 * Dynamic Analytics Report Registry
 * Screen 19 resolves report definitions through this central registry.
 */

export const REPORT_REGISTRY = {
  "order-performance": {
    id: "order-performance",
    title: "Order Performance",
    description:
      "Operational order analytics covering order flow, fulfilment, payments, returns, supplier performance and drill-down insights.",
    domain: "Orders",
    permission: "analytics.orders.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "orderPerformance",
  },
  "revenue-analysis": {
    id: "revenue-analysis",
    title: "Revenue Analysis",
    description: "Detailed financial breakdown of gross sales, net platform revenue, commission margins and discounts.",
    domain: "Finance",
    permission: "analytics.finance.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "revenueAnalysis",
  },
  "product-performance": {
    id: "product-performance",
    title: "Product Performance",
    description: "Catalogue metrics, units sold, conversion rates, customer ratings and product return rates.",
    domain: "Catalogue",
    permission: "analytics.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "productPerformance",
  },
  "supplier-performance": {
    id: "supplier-performance",
    title: "Supplier Performance",
    description: "Supplier order volume, fulfilment rates, dispatch SLA compliance, cancellations and dispute rates.",
    domain: "Suppliers",
    permission: "analytics.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "supplierPerformance",
  },
  "inventory-risk": {
    id: "inventory-risk",
    title: "Inventory Risk",
    description: "Stock levels, valuation, quarantined batches, damaged units, expiry exposure and stockout alerts.",
    domain: "Inventory",
    permission: "analytics.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "inventoryRisk",
  },
  "logistics-performance": {
    id: "logistics-performance",
    title: "Logistics Performance",
    description: "Carrier SLA delivery, pickup performance, exceptions, failed delivery attempts and COD remittance status.",
    domain: "Logistics",
    permission: "analytics.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "logisticsPerformance",
  },
  "returns-analysis": {
    id: "returns-analysis",
    title: "Returns Analysis",
    description: "Customer return reasons, approval breakdown, refund resolution time and supplier liability recoveries.",
    domain: "Returns",
    permission: "analytics.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "returnsAnalysis",
  },
  "customer-support-performance": {
    id: "customer-support-performance",
    title: "Customer Support Performance",
    description: "Support ticket volume, SLA response compliance, resolution times, CSAT scores and safety complaints.",
    domain: "Support",
    permission: "analytics.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "customerSupportPerformance",
  },
  "customer-performance": {
    id: "customer-performance",
    title: "Customer Analytics",
    description: "Customer cohort analysis, acquisition rates, repeat purchase rates and VIP customer segment behavior.",
    domain: "Customers",
    permission: "analytics.customer.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "customerPerformance",
  },
  "compliance-risk": {
    id: "compliance-risk",
    title: "Compliance Risk",
    description: "Verification status, brand authorizations, active product recalls, batch holds and safety audits.",
    domain: "Compliance",
    permission: "analytics.compliance.view",
    defaultCurrency: "LKR",
    defaultPeriod: "last-30-days",
    serviceKey: "complianceRisk",
  },
};

const REPORT_ALIASES = {
  "active-customers-report": "customer-performance",
  "aov-trends-report": "order-performance",
  "carrier-detail-report": "logistics-performance",
  "compliance-safety-report": "compliance-risk",
  "conversion-funnel-analysis": "order-performance",
  "custom-builder": "order-performance",
  "customer-analytics-report": "customer-performance",
  "daily-operations-report": "order-performance",
  "data-quality-report": "compliance-risk",
  "expiry-risk-report": "inventory-risk",
  "failed-payments-audit": "order-performance",
  "gmv-analysis": "revenue-analysis",
  "high-risk-events-log": "compliance-risk",
  "inventory-health-report": "inventory-risk",
  "logistics-exceptions-report": "logistics-performance",
  "logistics-ontime-delivery": "logistics-performance",
  "logistics-performance-report": "logistics-performance",
  "monthly-supplier-performance": "supplier-performance",
  "net-revenue-analysis": "revenue-analysis",
  "orders-volume-report": "order-performance",
  "paid-orders-report": "order-performance",
  "priority-insights-list": "compliance-risk",
  "product-detail-analytics": "product-performance",
  "product-performance-report": "product-performance",
  "recall-analysis-report": "compliance-risk",
  "repeat-purchase-rate": "customer-performance",
  "returns-analysis-report": "returns-analysis",
  "returns-disputes-summary": "returns-analysis",
  "safety-cases-report": "compliance-risk",
  "safety-report": "compliance-risk",
  "sales-by-category-report": "product-performance",
  "scheduled-reports-list": "order-performance",
  "stockout-report": "inventory-risk",
  "supplier-detail-analytics": "supplier-performance",
  "supplier-directory-analytics": "supplier-performance",
  "supplier-fulfilment-sla": "supplier-performance",
  "supplier-performance-report": "supplier-performance",
  "support-sla-compliance": "customer-support-performance",
  "support-sla-report": "customer-support-performance",
  "weekly-executive-summary": "order-performance",
};

for (const [alias, baseId] of Object.entries(REPORT_ALIASES)) {
  const base = REPORT_REGISTRY[baseId];
  REPORT_REGISTRY[alias] = {
    ...base,
    id: alias,
    title: alias
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  };
}

export const reportRegistry = REPORT_REGISTRY;

/**
 * Resolves a report definition by ID.
 * @param {string} reportId
 * @returns {Object|null}
 */
export function getReportDefinition(reportId) {
  if (!reportId) return null;
  return REPORT_REGISTRY[reportId] ?? null;
}

/**
 * Checks if a report ID is registered.
 * @param {string} reportId
 * @returns {boolean}
 */
export function isKnownReport(reportId) {
  return Boolean(getReportDefinition(reportId));
}

