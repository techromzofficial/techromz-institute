"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

import {
  parseAnalyticsFilters,
  buildAnalyticsFilterQuery,
  DEFAULT_ANALYTICS_FILTERS,
} from "@/lib/analytics/analyticsFilterUtils";
import { getAnalyticsDashboard } from "@/services/api/analyticsDashboard";
import { DEFAULT_USER_PERMISSIONS } from "@/lib/analytics/analyticsPermissions";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsPeriodTabs } from "./AnalyticsPeriodTabs";
import { AnalyticsKpiGrid } from "./AnalyticsKpiGrid";
import { RevenueOrderTrendChart } from "./RevenueOrderTrendChart";
import { MarketplaceFunnel } from "./MarketplaceFunnel";
import { SalesByCategoryChart } from "./SalesByCategoryChart";
import { ProductPerformanceTable } from "./ProductPerformanceTable";
import { SupplierPerformanceTable } from "./SupplierPerformanceTable";

import { InventoryHealthSummary } from "./InventoryHealthSummary";
import { LogisticsPerformanceSummary } from "./LogisticsPerformanceSummary";
import { ReturnsRefundsSummary } from "./ReturnsRefundsSummary";
import { SupportPerformanceSummary } from "./SupportPerformanceSummary";
import { CustomerAnalyticsSummary } from "./CustomerAnalyticsSummary";
import { ComplianceSafetySummary } from "./ComplianceSafetySummary";

import { ExecutiveHealthPanel } from "./ExecutiveHealthPanel";
import { PriorityInsightsPanel } from "./PriorityInsightsPanel";
import { QuickReportsPanel } from "./QuickReportsPanel";
import { DataQualityPanel } from "./DataQualityPanel";
import { SavedScheduledReportsPanel } from "./SavedScheduledReportsPanel";
import { DataFreshnessNotice } from "./DataFreshnessNotice";
import { AnalyticsErrorState } from "./AnalyticsErrorState";

export function AnalyticsDashboard({ userPermissions = DEFAULT_USER_PERMISSIONS }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeFilters, setActiveFilters] = useState(() => parseAnalyticsFilters(searchParams));
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Sync state when URL query params change (e.g. browser back/forward)
  useEffect(() => {
    const parsed = parseAnalyticsFilters(searchParams);
    setActiveFilters(parsed);
  }, [searchParams]);

  // Load dashboard data whenever activeFilters change
  const fetchDashboardData = useCallback(async (filters, signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getAnalyticsDashboard(filters, { signal });
      if (res.status === "error") {
        setError(res.error || "Failed to load dashboard data.");
      } else {
        setDashboardData(res.data);
        setLastUpdated(res.lastUpdated ? new Date(res.lastUpdated).toLocaleTimeString() : null);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Network or server error while fetching analytics.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(activeFilters, controller.signal);
    return () => controller.abort();
  }, [activeFilters, fetchDashboardData]);

  // Helper to update URL search parameters
  const updateUrlFilters = (newFilters) => {
    const query = buildAnalyticsFilterQuery(newFilters);
    const newUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const handleApplyFilters = (updatedFilters) => {
    setActiveFilters(updatedFilters);
    updateUrlFilters(updatedFilters);
    toast.success("Analytics filters applied");
  };

  const handleClearAll = () => {
    setActiveFilters(DEFAULT_ANALYTICS_FILTERS);
    updateUrlFilters(DEFAULT_ANALYTICS_FILTERS);
    toast.success("Filters reset to default");
  };

  const handleSelectPeriodTab = (periodId) => {
    const updated = {
      ...activeFilters,
      reportingPeriod: periodId,
    };
    setActiveFilters(updated);
    updateUrlFilters(updated);
  };

  const handleReviewExecutiveInsights = () => {
    const element = document.getElementById("executive-health-panel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    toast("Executive Insights Panel focused", { icon: "\u{1F4CA}" });
  };

  const handleExportDashboard = () => {
    toast.success("Exporting Analytics Dashboard report...");
  };

  const handleScheduleReport = () => {
    toast.success("Opening Schedule Report modal...");
  };

  const handleComparePeriods = () => {
    toast("Comparison mode enabled", { icon: "\u{1F4C8}" });
  };

  const handleSaveView = () => {
    toast.success("Current filter view saved successfully");
  };

  return (
    <div className="analytics-dashboard-stack">
      {/* Top Header */}
      <AnalyticsHeader
        searchParams={searchParams}
        onReviewExecutiveInsights={handleReviewExecutiveInsights}
        onExportDashboard={handleExportDashboard}
        onScheduleReport={handleScheduleReport}
        onComparePeriods={handleComparePeriods}
      />

      {/* Multi-Row Filter Bar */}
      <AnalyticsFilters
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onClearAll={handleClearAll}
        onSaveView={handleSaveView}
        onExportDashboard={handleExportDashboard}
      />

      {/* Quick Period Tabs */}
      <AnalyticsPeriodTabs
        activePeriod={activeFilters.reportingPeriod}
        onSelectPeriod={handleSelectPeriodTab}
      />

      {/* Data Freshness Notice */}
      <DataFreshnessNotice
        lastUpdated={lastUpdated}
        onRefresh={() => fetchDashboardData(activeFilters)}
      />

      {/* Main Grid: Left Primary Content (2.2fr) vs Right Operations Panel (0.8fr) */}
      <div className="analytics-main-layout-grid">
        {/* Left Column: KPIs, Charts, Tables, Summaries */}
        <div className="analytics-primary-column">
          {/* 14 KPI Cards */}
          <AnalyticsKpiGrid
            kpis={dashboardData?.kpis}
            searchParams={searchParams}
            userPermissions={userPermissions}
            isLoading={isLoading}
            error={error}
            onRetry={() => fetchDashboardData(activeFilters)}
          />

          {/* Charts Row */}
          <div className="analytics-charts-grid">
            <RevenueOrderTrendChart
              data={dashboardData?.trendChart}
              searchParams={searchParams}
              isLoading={isLoading}
              error={error}
            />
            <MarketplaceFunnel
              funnelData={dashboardData?.funnel}
              searchParams={searchParams}
            />
            <SalesByCategoryChart
              categoryData={dashboardData?.categorySales}
              searchParams={searchParams}
            />
          </div>

          {/* Performance Tables */}
          <div className="analytics-tables-stack">
            <ProductPerformanceTable
              products={dashboardData?.productPerformance}
              searchParams={searchParams}
              isLoading={isLoading}
              error={error}
            />
            <SupplierPerformanceTable
              suppliers={dashboardData?.supplierPerformance}
              searchParams={searchParams}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Operational Summaries Grid */}
          <div className="analytics-summaries-grid">
            <InventoryHealthSummary
              data={dashboardData?.operationalSummaries?.inventoryHealth}
              searchParams={searchParams}
            />
            <LogisticsPerformanceSummary
              data={dashboardData?.operationalSummaries?.logisticsPerformance}
              searchParams={searchParams}
            />
            <ReturnsRefundsSummary
              data={dashboardData?.operationalSummaries?.returnsRefunds}
              searchParams={searchParams}
            />
            <SupportPerformanceSummary
              data={dashboardData?.operationalSummaries?.supportPerformance}
              searchParams={searchParams}
            />
            <CustomerAnalyticsSummary
              data={dashboardData?.operationalSummaries?.customerAnalytics}
              searchParams={searchParams}
            />
            <ComplianceSafetySummary
              data={dashboardData?.operationalSummaries?.complianceSafety}
              searchParams={searchParams}
            />
          </div>
        </div>

        {/* Right Operations Panel */}
        <div className="analytics-right-operations-panel">
          <div id="executive-health-panel">
            <ExecutiveHealthPanel healthData={dashboardData?.executiveHealth} />
          </div>

          <PriorityInsightsPanel
            insights={dashboardData?.priorityInsights}
            searchParams={searchParams}
          />

          <QuickReportsPanel
            quickReports={dashboardData?.quickReports}
            searchParams={searchParams}
          />

          <DataQualityPanel
            dataQuality={dashboardData?.dataQuality}
            searchParams={searchParams}
          />

          <SavedScheduledReportsPanel
            scheduledReports={dashboardData?.savedScheduledReports}
            searchParams={searchParams}
            onScheduleNewReport={handleScheduleReport}
          />
        </div>
      </div>
    </div>
  );
}
