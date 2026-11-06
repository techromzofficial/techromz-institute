/**
 * Query State Helper for Analytics Reports (Screen 19).
 */
export const DEFAULT_REPORT_QUERY_PARAMS = {
  period: "last-30-days",
  dateFrom: "",
  dateTo: "",
  comparison: "previous-30-days",
  comparisonDateFrom: "",
  comparisonDateTo: "",
  currency: "LKR",
  orderStatus: "all",
  paymentStatus: "all",
  fulfilmentStatus: "all",
  deliveryStatus: "all",
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
  riskLevel: "all",
  slaStatus: "all",
  assignedOfficer: "all",
  sort: "orderDate",
  direction: "desc",
  page: "1",
  rowsPerPage: "25",
  savedView: "",
  quickFilter: "",
  source: "",
  returnTo: "",
};

export function parseReportQueryParams(searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams || "");
  const result = { ...DEFAULT_REPORT_QUERY_PARAMS };

  for (const key of Object.keys(DEFAULT_REPORT_QUERY_PARAMS)) {
    const value = params.get(key);
    if (value === null || value === undefined || value === "") continue;

    if (key === "page" || key === "rowsPerPage") {
      const number = Number.parseInt(value, 10);
      result[key] = number > 0 ? String(number) : DEFAULT_REPORT_QUERY_PARAMS[key];
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function buildReportQueryString(query) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (
      value !== undefined
      && value !== null
      && value !== ""
      && value !== DEFAULT_REPORT_QUERY_PARAMS[key]
    ) {
      params.set(key, String(value));
    }
  }

  return params.toString();
}
