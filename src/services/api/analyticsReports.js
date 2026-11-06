/**
 * Analytics Reports API Service (Screen 19)
 * Provides normalized data fetching methods for dynamic report detail & drill-down workspace.
 */

import { ORDER_PERFORMANCE_FIXTURE } from "@/features/analytics/reports/fixtures/orderPerformance.fixture";

export async function fetchReportData(reportId, params = {}) {
  try {
    if (reportId === "order-performance") {
      return {
        success: true,
        data: ORDER_PERFORMANCE_FIXTURE,
      };
    }

    return {
      success: true,
      data: {
        ...ORDER_PERFORMANCE_FIXTURE,
        metadata: {
          ...ORDER_PERFORMANCE_FIXTURE.metadata,
          reportKey: reportId,
        },
      },
    };
  } catch (error) {
    console.error(`Error fetching analytics report data for ${reportId}:`, error);
    return {
      success: false,
      error: error.message || "Failed to load report data",
    };
  }
}

export async function fetchUnderlyingOrderRecords(reportId, params = {}) {
  try {
    const records = ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords;
    
    let filtered = [...records];
    if (params.paymentStatus && params.paymentStatus !== "all") {
      filtered = filtered.filter(
        (r) => r.paymentStatus.toLowerCase() === params.paymentStatus.toLowerCase()
      );
    }
    if (params.quickFilter === "failed-payments") {
      filtered = filtered.filter((r) => r.paymentStatus === "Failed");
    }

    const page = parseInt(params.page || "1", 10);
    const rowsPerPage = parseInt(params.rowsPerPage || "25", 10);

    return {
      success: true,
      data: {
        records: filtered,
        totalRecords: filtered.length,
        page,
        rowsPerPage,
        totalPages: Math.ceil(filtered.length / rowsPerPage) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching underlying order records:", error);
    return {
      success: false,
      error: error.message || "Failed to load underlying order records",
    };
  }
}

export async function getReportMetadata(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.metadata };
}

export async function getReportFilterOptions(reportId, params = {}, options = {}) {
  return { success: true, data: {} };
}

export async function getReportKpis(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.kpis || [] };
}

export async function getReportVisualisations(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return {
    success: res.success,
    data: {
      volumeTrend: res.data?.trendChart || res.data?.orderVolumeValueTrend || res.data?.volumeTrend || [],
      funnel: res.data?.lifecycleFunnel || res.data?.orderLifecycleFunnel || res.data?.funnel || [],
      salesByCategory: res.data?.salesByCategory || {},
      ordersByStatus: res.data?.ordersByStatus || [],
      ordersByChannel: res.data?.ordersByChannel || [],
      ordersByPaymentMethod: res.data?.ordersByPaymentMethod || [],
    },
  };
}

export async function getReportBreakdowns(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return {
    success: res.success,
    data: {
      productCategoryPerformance: res.data?.productCategoryPerformance,
      supplierFulfilmentPerformance: res.data?.supplierFulfilmentPerformance,
    },
  };
}

export async function getReportOperationalSummaries(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.operationalSummaries };
}

export async function getReportHealth(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.reportHealth };
}

export async function getReportInsights(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.priorityInsights };
}

export async function getReportAnomalies(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.anomaliesAlerts };
}

export async function getReportDataQuality(reportId, params = {}, options = {}) {
  const res = await fetchReportData(reportId, params);
  return { success: res.success, data: res.data?.dataQualityStatus };
}

export async function getSavedViews(reportId, options = {}) {
  const res = await fetchReportData(reportId);
  return { success: res.success, data: res.data?.savedViews || [] };
}

export async function getScheduledReports(reportId, options = {}) {
  const res = await fetchReportData(reportId);
  return { success: res.success, data: res.data?.savedScheduledReports || [] };
}

export async function getUnderlyingOrderRecords(reportId, params = {}, options = {}) {
  return fetchUnderlyingOrderRecords(reportId, params);
}

