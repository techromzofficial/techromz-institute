/**
 * Analytics & Business Intelligence Dashboard API Service Layer
 * Supports AbortSignal, Promise.allSettled error tolerance, and explicit data states.
 */

import { MOCK_ANALYTICS_DATA } from "@/data/analyticsDashboard.mock";

/**
 * Normalizes filter parameters and applies mock filtering where relevant.
 */
function applyFilterSimulations(data, params = {}) {
  // Return deep clone of mock data
  return JSON.parse(JSON.stringify(data));
}

export async function getAnalyticsDashboard(params = {}, options = {}) {
  try {
    if (options.signal?.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, options.delay || 50));

    const data = applyFilterSimulations(MOCK_ANALYTICS_DATA, params);

    return {
      status: "success",
      data,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    return {
      status: "error",
      error: error.message || "Failed to fetch analytics dashboard data",
      data: null,
    };
  }
}

export async function getAnalyticsKpis(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.kpis || null,
    error: result.error,
  };
}

export async function getRevenueOrderTrend(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.trendChart || null,
    error: result.error,
  };
}

export async function getMarketplaceFunnel(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.funnel || null,
    error: result.error,
  };
}

export async function getSalesByCategory(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.categorySales || null,
    error: result.error,
  };
}

export async function getProductPerformance(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.productPerformance || null,
    error: result.error,
  };
}

export async function getSupplierPerformance(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.supplierPerformance || null,
    error: result.error,
  };
}

export async function getOperationalSummaries(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.operationalSummaries || null,
    error: result.error,
  };
}

export async function getExecutiveHealth(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.executiveHealth || null,
    error: result.error,
  };
}

export async function getPriorityInsights(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.priorityInsights || null,
    error: result.error,
  };
}

export async function getQuickReports(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.quickReports || null,
    error: result.error,
  };
}

export async function getDataQualityStatus(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.dataQuality || null,
    error: result.error,
  };
}

export async function getSavedReports(params = {}, options = {}) {
  const result = await getAnalyticsDashboard(params, options);
  return {
    status: result.status,
    data: result.data?.savedScheduledReports || null,
    error: result.error,
  };
}

