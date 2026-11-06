"use client";

import React, { useState } from "react";
import { ReportHeader } from "./ReportHeader";
import { ReportMetadataStrip } from "./ReportMetadataStrip";
import { ReportFilters } from "./ReportFilters";
import { ReportKpiGrid } from "./ReportKpiGrid";
import { OrderVolumeValueTrend } from "./OrderVolumeValueTrend";
import { OrderLifecycleFunnel } from "./OrderLifecycleFunnel";
import { ReportSalesByCategory } from "./ReportSalesByCategory";
import { OrdersByStatus } from "./OrdersByStatus";
import { OrdersByChannel } from "./OrdersByChannel";
import { OrdersByPaymentMethod } from "./OrdersByPaymentMethod";
import { ProductCategoryPerformanceTable } from "./ProductCategoryPerformanceTable";
import { SupplierFulfilmentPerformanceTable } from "./SupplierFulfilmentPerformanceTable";
import { OperationalSummaryPanel } from "./OperationalSummaryPanel";
import { UnderlyingOrderRecordsTable } from "./UnderlyingOrderRecordsTable";
import { ReportHealthPanel } from "./ReportHealthPanel";
import { ReportPriorityInsights } from "./ReportPriorityInsights";
import { ReportAnomaliesPanel } from "./ReportAnomaliesPanel";
import { QuickDrillDownPanel } from "./QuickDrillDownPanel";
import { SavedViewsPanel } from "./SavedViewsPanel";
import { ReportActionsPanel } from "./ReportActionsPanel";
import { ReportDataQualityPanel } from "./ReportDataQualityPanel";
import { SavedScheduledReportsPanel } from "./SavedScheduledReportsPanel";
import { ExportReportModal } from "./ExportReportModal";
import { ScheduleReportModal } from "./ScheduleReportModal";

export function AnalyticsReportShell({
  reportDef,
  reportData,
  underlyingData,
  queryParams,
  currentSearchParams,
  onApplyFilters,
  onResetFilters,
  onSelectQuickFilter,
  onSelectSavedView,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const metadata = reportData?.metadata || {};
  const kpis = reportData?.kpis || [];
  const trendChart = reportData?.trendChart || [];
  const lifecycleFunnel = reportData?.lifecycleFunnel || [];
  const salesByCategory = reportData?.salesByCategory || {};
  const ordersByStatus = reportData?.ordersByStatus || [];
  const ordersByChannel = reportData?.ordersByChannel || [];
  const ordersByPaymentMethod = reportData?.ordersByPaymentMethod || [];
  const productCategoryPerformance = reportData?.productCategoryPerformance || [];
  const supplierFulfilmentPerformance = reportData?.supplierFulfilmentPerformance || [];
  const operationalSummaries = reportData?.operationalSummaries || {};
  const reportHealth = reportData?.reportHealth || {};
  const priorityInsights = reportData?.priorityInsights || [];
  const anomaliesAlerts = reportData?.anomaliesAlerts || [];
  const dataQuality = reportData?.dataQuality || {};
  const savedScheduledReports = reportData?.savedScheduledReports || [];

  const underlyingRecords = underlyingData?.records || reportData?.underlyingOrderRecords || [];
  const totalRecords = underlyingData?.totalRecords || underlyingRecords.length;

  return (
    <div className="analytics-report-stack">
      {/* 1. Header */}
      <ReportHeader
        title={reportDef?.title || "Order Performance"}
        description={reportDef?.description}
        returnTo={queryParams?.returnTo}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenScheduleModal={() => setScheduleModalOpen(true)}
      />

      {/* 2. Metadata Strip */}
      <ReportMetadataStrip metadata={metadata} />

      {/* 3. Filter Bar */}
      <ReportFilters
        queryParams={queryParams}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onOpenExportModal={() => setExportModalOpen(true)}
      />

      {/* 4. Main Page Layout (Strict 2-Column Grid) */}
      <div className="reportPageLayout report-main-layout-grid">
        {/* Main Report Column */}
        <main className="reportMainColumn report-primary-column">
          {/* 12 KPI Grid */}
          <ReportKpiGrid kpis={kpis} />

          {/* Visualization Row 1 */}
          <div className="report-visuals-grid row-1">
            <OrderVolumeValueTrend data={trendChart} />
            <OrderLifecycleFunnel funnelStages={lifecycleFunnel} />
            <ReportSalesByCategory categoryData={salesByCategory} />
          </div>

          {/* Visualization Row 2: Status, Channel, Payment */}
          <div className="report-visuals-grid row-2">
            <OrdersByStatus statusData={ordersByStatus} />
            <OrdersByChannel channelData={ordersByChannel} />
            <OrdersByPaymentMethod paymentData={ordersByPaymentMethod} />
          </div>

          {/* Aggregate Performance Tables Row (Side by side 2-column grid) */}
          <div className="performanceTablesGrid report-tables-grid">
            <ProductCategoryPerformanceTable data={productCategoryPerformance} />
            <SupplierFulfilmentPerformanceTable data={supplierFulfilmentPerformance} />
          </div>

          {/* Operational Summary Row (7 Panels) */}
          <OperationalSummaryPanel summaries={operationalSummaries} />

          {/* Underlying Order Records Table */}
          <UnderlyingOrderRecordsTable
            records={underlyingRecords}
            totalRecords={totalRecords}
            page={parseInt(queryParams?.page || "1", 10)}
            rowsPerPage={parseInt(queryParams?.rowsPerPage || "25", 10)}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            currentSearchParams={currentSearchParams}
          />
        </main>

        {/* Right Operations Column (Strict Grid Child) */}
        <aside className="reportSideColumn report-right-operations-panel">
          <ReportHealthPanel health={reportHealth} />
          <ReportPriorityInsights insights={priorityInsights} />
          <ReportAnomaliesPanel alerts={anomaliesAlerts} onSelectQuickFilter={onSelectQuickFilter} />
          <QuickDrillDownPanel onSelectQuickFilter={onSelectQuickFilter} />
          <SavedViewsPanel
            views={reportData?.savedViews}
            activeSavedView={queryParams?.savedView}
            onSelectView={onSelectSavedView || onSelectQuickFilter}
          />
          <ReportActionsPanel
            onOpenExportModal={() => setExportModalOpen(true)}
            onOpenScheduleModal={() => setScheduleModalOpen(true)}
          />
          <ReportDataQualityPanel dataQuality={dataQuality} />
          <SavedScheduledReportsPanel
            reports={savedScheduledReports}
            onOpenScheduleModal={() => setScheduleModalOpen(true)}
          />
        </aside>
      </div>

      {/* Export & Schedule Modals */}
      <ExportReportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <ScheduleReportModal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} />
    </div>
  );
}

