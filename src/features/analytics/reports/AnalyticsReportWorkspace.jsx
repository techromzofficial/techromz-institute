"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReportDefinition, isKnownReport } from "./reportRegistry";
import { parseReportQueryParams, buildReportQueryString, DEFAULT_REPORT_QUERY_PARAMS } from "@/lib/query/queryState";
import { fetchReportData, fetchUnderlyingOrderRecords } from "@/services/api/analyticsReports";
import { AnalyticsReportShell } from "./components/AnalyticsReportShell";
import { UnknownReportState } from "./components/UnknownReportState";
import { ReportLoadingState, ReportErrorState } from "./components/ReportDataStates";

export function AnalyticsReportWorkspace({ reportId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [underlyingData, setUnderlyingData] = useState(null);

  // 1. Resolve Report Registry
  const isKnown = isKnownReport(reportId);
  const reportDef = getReportDefinition(reportId);

  // 2. Parse Query Params safely using string primitive memoization to prevent render loops
  const searchParamsString = searchParams ? searchParams.toString() : "";
  const queryParams = useMemo(
    () => parseReportQueryParams(searchParams),
    [searchParamsString]
  );

  // Helper to update URL params
  const updateUrlParams = useCallback(
    (newParams) => {
      const queryString = buildReportQueryString(newParams);
      const newUrl = `/admin/analytics/reports/${reportId}${queryString ? `?${queryString}` : ""}`;
      router.push(newUrl, { scroll: false });
    },
    [reportId, router]
  );

  // 3. Load Data with primitive dependency array to avoid infinite re-render loops
  const loadData = useCallback(async () => {
    if (!isKnown) return;
    setLoading(true);
    setError(null);

    try {
      const [resReport, resUnderlying] = await Promise.all([
        fetchReportData(reportId, queryParams),
        fetchUnderlyingOrderRecords(reportId, queryParams),
      ]);

      if (resReport.success) {
        setReportData(resReport.data);
      } else {
        setError(resReport.error || "Failed to load report summary data");
      }

      if (resUnderlying.success) {
        setUnderlyingData(resUnderlying.data);
      }
    } catch (err) {
      console.error("Error loading analytics report workspace:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [isKnown, reportId, searchParamsString]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleApplyFilters = (newFilters) => {
    updateUrlParams({
      ...queryParams,
      ...newFilters,
      page: "1", // reset page on filter change
    });
  };

  const handleResetFilters = () => {
    updateUrlParams({
      ...DEFAULT_REPORT_QUERY_PARAMS,
      returnTo: queryParams.returnTo || "",
    });
  };

  const handleSelectQuickFilter = (quickFilterKey) => {
    updateUrlParams({
      ...queryParams,
      quickFilter: quickFilterKey,
      page: "1",
    });
  };

  const handleSelectSavedView = (savedViewItem) => {
    const viewId = savedViewItem.id || savedViewItem.key || savedViewItem.name?.toLowerCase().replace(/\s+/g, "-");
    const filters = savedViewItem.filters || {};
    updateUrlParams({
      ...queryParams,
      ...filters,
      savedView: viewId,
      page: "1",
    });
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({
      ...queryParams,
      page: String(newPage),
    });
  };

  const handleRowsPerPageChange = (newRows) => {
    updateUrlParams({
      ...queryParams,
      rowsPerPage: String(newRows),
      page: "1",
    });
  };

  // 4. Render States
  if (!isKnown) {
    return <UnknownReportState searchParams={searchParams} />;
  }

  if (loading) {
    return <ReportLoadingState />;
  }

  if (error) {
    return <ReportErrorState message={error} onRetry={loadData} />;
  }

  return (
    <AnalyticsReportShell
      reportDef={reportDef}
      reportData={reportData}
      underlyingData={underlyingData}
      queryParams={queryParams}
      currentSearchParams={searchParams}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      onSelectQuickFilter={handleSelectQuickFilter}
      onSelectSavedView={handleSelectSavedView}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  );
}

