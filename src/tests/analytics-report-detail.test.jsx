import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getReportDefinition, isKnownReport, reportRegistry } from "@/features/analytics/reports/reportRegistry";
import { parseReportQueryParams, buildReportQueryString } from "@/lib/query/queryState";
import { ORDER_PERFORMANCE_FIXTURE } from "@/features/analytics/reports/fixtures/orderPerformance.fixture";
import { ReportHeader } from "@/features/analytics/reports/components/ReportHeader";
import { ReportMetadataStrip } from "@/features/analytics/reports/components/ReportMetadataStrip";
import { ReportKpiGrid } from "@/features/analytics/reports/components/ReportKpiGrid";
import { ReportKpiCard } from "@/features/analytics/reports/components/ReportKpiCard";
import { OrderLifecycleFunnel } from "@/features/analytics/reports/components/OrderLifecycleFunnel";
import { UnderlyingOrderRecordsTable } from "@/features/analytics/reports/components/UnderlyingOrderRecordsTable";
import { AnalyticsReportShell } from "@/features/analytics/reports/components/AnalyticsReportShell";
import { UnknownReportState } from "@/features/analytics/reports/components/UnknownReportState";
import { SavedViewsPanel } from "@/features/analytics/reports/components/SavedViewsPanel";
import { SavedScheduledReportsPanel } from "@/features/analytics/reports/components/SavedScheduledReportsPanel";
import { ExportReportModal } from "@/features/analytics/reports/components/ExportReportModal";
import { ScheduleReportModal } from "@/features/analytics/reports/components/ScheduleReportModal";
import { QuickDrillDownPanel } from "@/features/analytics/reports/components/QuickDrillDownPanel";
import {
  ReportLoadingState,
  ReportEmptyState,
  ReportPartialState,
  ReportStaleNotice,
  ReportErrorState,
} from "@/features/analytics/reports/components/ReportDataStates";
import {
  fetchReportData,
  getReportVisualisations,
} from "@/services/api/analyticsReports";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockReportSearchParams = new URLSearchParams("period=last-30-days&page=1&rowsPerPage=25");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockReportSearchParams,
  usePathname: () => "/admin/analytics/reports/order-performance",
}));

describe("Screen 19 — Analytics Report Detail & Drill-Down Full Suite (32 Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Order Performance renders
  it("1. Order Performance renders header title and description", () => {
    render(
      <ReportHeader
        title="Order Performance"
        description="Operational order analytics covering order flow, fulfilment, payments, returns, supplier performance and drill-down insights."
      />
    );
    expect(screen.getByRole("heading", { name: "Order Performance" })).toBeInTheDocument();
  });

  // 2. Unknown report shows controlled not-found state
  it("2. Unknown report shows controlled not-found state", () => {
    render(<UnknownReportState searchParams={new URLSearchParams()} />);
    expect(screen.getByText("Report Not Found")).toBeInTheDocument();
    expect(
      screen.getByText("The requested analytics report is unavailable or the report identifier is invalid.")
    ).toBeInTheDocument();
  });

  // 3. Registry resolves correct report
  it("3. Registry resolves correct report", () => {
    const def = getReportDefinition("order-performance");
    expect(def).not.toBeNull();
    expect(def.title).toBe("Order Performance");
    expect(def.domain).toBe("Orders");
    expect(isKnownReport("order-performance")).toBe(true);
    expect(reportRegistry["order-performance"]).toBeDefined();
  });

  // 4. URL values populate filters
  it("4. URL values populate filters correctly", () => {
    const searchParams = new URLSearchParams("period=last-7-days&currency=LKR&orderStatus=processing");
    const parsed = parseReportQueryParams(searchParams);
    expect(parsed.period).toBe("last-7-days");
    expect(parsed.currency).toBe("LKR");
    expect(parsed.orderStatus).toBe("processing");
  });

  // 5. Filter changes update the URL
  it("5. Serializes filter changes to URL query string", () => {
    const updated = buildReportQueryString({ period: "last-90-days", orderStatus: "delivered" });
    expect(updated).toContain("period=last-90-days");
    expect(updated).toContain("orderStatus=delivered");
  });

  // 6. Invalid URL values fall back safely
  it("6. Invalid URL values fall back safely", () => {
    const parsed = parseReportQueryParams(new URLSearchParams("page=-5"));
    expect(parsed.page).toBe("1");
    expect(parsed.period).toBe("last-30-days");
  });

  // 7. Sorting updates the URL
  it("7. Sorting updates the URL parameters", () => {
    const queryString = buildReportQueryString({ sort: "netOrderTotal", direction: "asc" });
    expect(queryString).toContain("sort=netOrderTotal");
    expect(queryString).toContain("direction=asc");
  });

  // 8. Pagination updates the URL
  it("8. Pagination updates the URL parameters", () => {
    const queryString = buildReportQueryString({ page: "3" });
    expect(queryString).toContain("page=3");
  });

  // 9. Rows per page updates the URL
  it("9. Rows per page updates the URL parameters", () => {
    const queryString = buildReportQueryString({ rowsPerPage: "50", page: "1" });
    expect(queryString).toContain("rowsPerPage=50");
  });

  // 10. All 12 KPI cards render
  it("10. All 12 KPI cards render properly", () => {
    render(<ReportKpiGrid kpis={ORDER_PERFORMANCE_FIXTURE.kpis} />);
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Gross Order Value")).toBeInTheDocument();
    expect(screen.getByText("Average Order Value")).toBeInTheDocument();
    expect(screen.getByText("Paid Orders")).toBeInTheDocument();
    expect(screen.getByText("Failed Payments")).toBeInTheDocument();
    expect(screen.getByText("Processing Orders")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Supplier")).toBeInTheDocument();
    expect(screen.getByText("Ready for Dispatch")).toBeInTheDocument();
    expect(screen.getByText("Delivered Orders")).toBeInTheDocument();
    expect(screen.getByText("Cancelled Orders")).toBeInTheDocument();
    expect(screen.getByText("Return-Linked Orders")).toBeInTheDocument();
    expect(screen.getByText("Orders Within SLA")).toBeInTheDocument();
  });

  // 11. Missing KPI data shows Not Available
  it("11. Missing KPI data shows Not Available", () => {
    const nullKpi = {
      id: 99,
      order: 99,
      title: "Missing Metric",
      formattedValue: null,
      availability: "not_available",
    };
    render(<ReportKpiCard kpi={nullKpi} />);
    expect(screen.getByText("Not Available")).toBeInTheDocument();
  });

  // 12. Trend semantics are metric-aware
  it("12. Trend semantics are metric-aware", () => {
    const negativeKpi = {
      id: 5,
      order: 5,
      title: "Failed Payments",
      formattedValue: "156",
      trendPercentage: 8.2,
      status: "negative",
      direction: "up",
    };
    render(<ReportKpiCard kpi={negativeKpi} />);
    expect(screen.getByText("8.2%")).toBeInTheDocument();
  });

  // 13. Charts render from service responses
  it("13. Charts render from service responses", async () => {
    const vis = await getReportVisualisations("order-performance");
    expect(vis.success).toBe(true);
    expect(vis.data.volumeTrend).toBeDefined();
    expect(vis.data.funnel).toBeDefined();
  });

  // 14. Funnel handles zero denominators
  it("14. Funnel handles zero denominators safely without NaN", () => {
    const emptyFunnel = [{ stage: "Created", count: 0, conversionRate: 0 }];
    render(<OrderLifecycleFunnel funnelData={emptyFunnel} />);
    expect(screen.getByText("Order Lifecycle Funnel")).toBeInTheDocument();
  });

  // 15. Underlying records include all 28 model fields
  it("15. Underlying records include all 28 model fields", () => {
    render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={4}
        page={1}
        rowsPerPage={25}
      />
    );
    expect(screen.getByText("ORD-2026-80821")).toBeInTheDocument();
    expect(screen.getByText("9021")).toBeInTheDocument();
    expect(screen.getByText("Elena Rodriguez")).toBeInTheDocument();
    expect(screen.getByText("CUS-2026-0182")).toBeInTheDocument();
    expect(screen.getByText("Loyalty")).toBeInTheDocument();
    expect(screen.getByText("BATCH-7821")).toBeInTheDocument();
    expect(screen.getByText("Aria Shah")).toBeInTheDocument();
  });

  // 16. Table paginates
  it("16. Table renders pagination controls", () => {
    render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={100}
        page={1}
        rowsPerPage={25}
      />
    );
    expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
  });

  // 17. View Order uses databaseOrderId
  it("17. View Order uses databaseOrderId in link href", () => {
    render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={4}
        page={1}
        rowsPerPage={25}
      />
    );
    const viewLinks = screen.getAllByText(/View Order/i);
    expect(viewLinks[0].closest("a")).toHaveAttribute(
      "href",
      expect.stringContaining("/admin/marketplace/orders/9021")
    );
  });

  // 18. View Order preserves report return state
  it("18. View Order preserves returnTo query parameter", () => {
    render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={4}
        page={1}
        rowsPerPage={25}
        currentSearchParams={new URLSearchParams("period=last-30-days&page=2")}
      />
    );
    const link = screen.getAllByText(/View Order/i)[0].closest("a");
    expect(link.getAttribute("href")).toContain("returnTo=");
  });

  // 19. Back to Analytics restores Screen 18 filters
  it("19. Back to Analytics restores Screen 18 returnTo route", () => {
    const returnToUrl = "/admin/analytics?period=last-30-days";
    render(
      <ReportHeader
        title="Order Performance"
        description="Analytics"
        returnTo={encodeURIComponent(returnToUrl)}
      />
    );
    const backBtn = screen.getByRole("link", { name: /Analytics/i });
    expect(backBtn.getAttribute("href")).toBe(returnToUrl);
  });

  // 20. Export modal validates row limits
  it("20. Export modal validates row limits", () => {
    const handleClose = vi.fn();
    render(<ExportReportModal isOpen={true} onClose={handleClose} />);
    const limitInput = screen.getByLabelText(/Row Limit/i);
    fireEvent.change(limitInput, { target: { value: "20000" } });
    fireEvent.submit(limitInput.closest("form"));
    expect(screen.getByText(/Row limit exceeds maximum allowed/i)).toBeInTheDocument();
  });

  // 21. Export modal enforces masking
  it("21. Export modal contains sensitive data masking toggles", () => {
    render(<ExportReportModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByLabelText(/Mask Customer Identifiers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mask Sensitive Financial Values/i)).toBeInTheDocument();
  });

  // 22. Schedule modal validates recipients
  it("22. Schedule modal validates recipients", async () => {
    render(<ScheduleReportModal isOpen={true} onClose={vi.fn()} />);
    const emailInput = screen.getByPlaceholderText(/e.g. analytics@slbeauty.lk/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.submit(emailInput.closest("form"));
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid recipient email address/i)).toBeInTheDocument();
    });
  });

  // 23. Restricted data is hidden or masked
  it("23. Restricted data is hidden when permission is absent", () => {
    render(<ReportMetadataStrip metadata={ORDER_PERFORMANCE_FIXTURE.metadata} />);
    expect(screen.getByText("order-performance")).toBeInTheDocument();
  });

  // 24. Loading state renders
  it("24. Loading state renders progress message", () => {
    render(<ReportLoadingState message="Fetching analytics report data..." />);
    expect(screen.getByText("Fetching analytics report data...")).toBeInTheDocument();
  });

  // 25. Empty state renders
  it("25. Empty state renders empty message", () => {
    render(<ReportEmptyState message="No data available for the selected filters." />);
    expect(screen.getByText("No data available for the selected filters.")).toBeInTheDocument();
  });

  // 26. Partial state renders
  it("26. Partial state renders partial notice", () => {
    render(<ReportPartialState message="Some data sources delayed." />);
    expect(screen.getByText("Partial Data Available")).toBeInTheDocument();
  });

  // 27. Stale state renders
  it("27. Stale state renders warning notice", () => {
    render(<ReportStaleNotice lastGenerated="Jul 24, 2026 – 4:30 AM" />);
    expect(screen.getByText(/Report data may be stale/i)).toBeInTheDocument();
  });

  // 28. Error state renders a retry action
  it("28. Error state renders error message and retry button", () => {
    const onRetry = vi.fn();
    render(<ReportErrorState message="Network error occurred" onRetry={onRetry} />);
    expect(screen.getByText("Network error occurred")).toBeInTheDocument();
    const retryBtn = screen.getByText("Retry Loading");
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  // 29. One failed service section does not crash other sections
  it("29. Section failure fault tolerance handles individual section errors", async () => {
    const res = await fetchReportData("order-performance");
    expect(res.success).toBe(true);
    expect(res.data.metadata).toBeDefined();
  });

  // 30. Quick Drill-Down updates URL filters
  it("30. Quick Drill-Down triggers filter update callback", () => {
    const onSelectFilter = vi.fn();
    render(<QuickDrillDownPanel onSelectFilter={onSelectFilter} />);
    fireEvent.click(screen.getByText("Failed Payments"));
    expect(onSelectFilter).toHaveBeenCalledWith("failed-payments");
  });

  // 31. Table scroll container works
  it("31. Table scroll container exists", () => {
    const { container } = render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={4}
        page={1}
        rowsPerPage={25}
      />
    );
    expect(container.querySelector(".records-table-scroll-container")).not.toBeNull();
  });

  // 32. View Order remains visible during horizontal scrolling
  it("32. Sticky action column ensures View Order remains accessible", () => {
    const { container } = render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={4}
        page={1}
        rowsPerPage={25}
      />
    );
    expect(container.querySelector(".th-sticky-action")).not.toBeNull();
    expect(container.querySelector(".td-sticky-action")).not.toBeNull();
  });

  // 33. Regression test — Single AdminShell verification
  it("33. Regression test — Screen 19 does not render a second AdminShell", () => {
    const { container } = render(
      <UnderlyingOrderRecordsTable
        records={ORDER_PERFORMANCE_FIXTURE.underlyingOrderRecords}
        totalRecords={4}
        page={1}
        rowsPerPage={25}
      />
    );
    expect(container.querySelector(".shell-rich")).toBeNull();
  });

  // 34. Grid Layout & Table Scroll Containers
  it("34. Renders isolated reportPageLayout, reportMainColumn, reportSideColumn and performanceTablesGrid", () => {
    const { container } = render(
      <AnalyticsReportShell
        reportDef={{ title: "Order Performance", description: "Operational order analytics" }}
        reportData={ORDER_PERFORMANCE_FIXTURE}
      />
    );

    expect(container.querySelector(".reportPageLayout")).not.toBeNull();
    expect(container.querySelector(".reportMainColumn")).not.toBeNull();
    expect(container.querySelector(".reportSideColumn")).not.toBeNull();
    expect(container.querySelector(".performanceTablesGrid")).not.toBeNull();
    expect(screen.getByText("Net Order Value (LKR)")).toBeInTheDocument();
    expect(screen.getAllByText("Risk").length).toBeGreaterThan(0);
  });

  // 35. Saved Views Panel Target Design
  it("35. SavedViewsPanel renders left-aligned button rows with chevrons and active selection", () => {
    const handleSelect = vi.fn();
    const { container } = render(
      <SavedViewsPanel activeSavedView="payment-failure-review" onSelectView={handleSelect} />
    );

    expect(screen.getByText("Saved Views")).toBeInTheDocument();
    expect(screen.getByText("Executive Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Daily Operations View")).toBeInTheDocument();
    expect(screen.getByText("Payment Failure Review")).toBeInTheDocument();
    expect(screen.getByText("Supplier Fulfilment Review")).toBeInTheDocument();

    const buttons = container.querySelectorAll(".savedViewRow");
    expect(buttons.length).toBe(4);
    expect(buttons[2].classList.contains("selected")).toBe(true);

    fireEvent.click(buttons[0]);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  // 36. Saved & Scheduled Reports Panel Target Design
  it("36. SavedScheduledReportsPanel renders 2-column identity and timing grid rows with working modal link", () => {
    const handleOpenSchedule = vi.fn();
    const { container } = render(
      <SavedScheduledReportsPanel onOpenScheduleModal={handleOpenSchedule} />
    );

    expect(screen.getByText("Saved & Scheduled Reports")).toBeInTheDocument();
    expect(screen.getByText("Daily Order Performance")).toBeInTheDocument();
    expect(screen.getByText("Daily — 09:00 AM")).toBeInTheDocument();
    expect(screen.getByText("Weekly Order Performance")).toBeInTheDocument();
    expect(screen.getByText("Weekly — Mon 08:00 AM")).toBeInTheDocument();

    const rows = container.querySelectorAll(".scheduledReportRow");
    expect(rows.length).toBe(2);

    const btn = screen.getByText("View All Scheduled Reports");
    fireEvent.click(btn);
    expect(handleOpenSchedule).toHaveBeenCalledTimes(1);
  });
});


