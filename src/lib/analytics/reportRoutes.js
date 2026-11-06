/**
 * Screen 19 Report Route Helper
 * Centralizes Screen 19 report URL generation for Screen 18 KPI cards, charts,
 * tables, summary modules, and side-panel shortcuts.
 */

export const SCREEN_19_BASE_ROUTE = "/admin/analytics/reports";

/**
 * Builds a valid Screen 19 report URL while preserving active analytics search parameters.
 *
 * @param {Object} options
 * @param {string} [options.reportId] - Target report ID (e.g., 'order-performance', 'revenue-analysis')
 * @param {URLSearchParams|Object} [options.currentSearchParams] - Active URL search params
 * @param {Object} [options.additionalParams] - Report-specific override or contextual params
 * @returns {string} Fully formatted Screen 19 report URL string
 */
export function buildAnalyticsReportUrl({
  reportId,
  currentSearchParams,
  additionalParams = {},
}) {
  const params = new URLSearchParams();

  // 1. Copy current active filters if provided
  if (currentSearchParams) {
    const searchEntries =
      currentSearchParams instanceof URLSearchParams
        ? Array.from(currentSearchParams.entries())
        : Object.entries(currentSearchParams);

    for (const [key, value] of searchEntries) {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params.set(key, value);
      }
    }
  }

  // 2. Set source tag
  if (reportId) {
    params.set("source", "analytics-dashboard");
  }

  // 3. Apply additional parameters
  for (const [key, value] of Object.entries(additionalParams)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }

  const base = reportId ? `${SCREEN_19_BASE_ROUTE}/${encodeURIComponent(reportId)}` : SCREEN_19_BASE_ROUTE;
  const queryString = params.toString();

  return queryString ? `${base}?${queryString}` : base;
}

/**
 * Map KPI IDs to Screen 19 Report IDs
 */
export const KPI_REPORT_MAP = {
  1: "order-performance",
  2: "revenue-analysis",
  3: "order-performance",
  4: "order-performance",
  5: "order-performance",
  6: "order-performance",
  7: "customer-performance",
  8: "customer-performance",
  9: "supplier-performance",
  10: "supplier-performance",
  11: "logistics-performance",
  12: "returns-analysis",
  13: "customer-support-performance",
  14: "compliance-risk",
};

