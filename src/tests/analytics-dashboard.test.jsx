import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { AdminShell } from "@/components/admin/layout/AdminShell";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import AnalyticsPage from "@/app/admin/analytics/page";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { calculateConversionRate, getTrendSemanticStatus } from "@/lib/analytics/analyticsCalculations";
import { parseAnalyticsFilters } from "@/lib/analytics/analyticsFilterUtils";
import { formatCurrency, formatCount } from "@/lib/analytics/analyticsFormatters";
import { ANALYTICS_PERMISSIONS } from "@/lib/analytics/analyticsPermissions";

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams("reportingPeriod=last-30-days&region=western");

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/analytics",
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      name: "Administrator",
      email: "admin@example.test",
      role: "super_admin",
    },
    logout: vi.fn(),
  }),
}));

vi.mock("@/contexts/AdminContext", () => ({
  useAdminContext: () => ({
    ecosystem: {
      id: "ecosystem-test",
      name: "Beauty Marketplace",
    },
    tenant: {
      id: "tenant-test",
      name: "Test Tenant",
      slug: "test-tenant",
    },
    businessUnit: null,
    channel: null,
    sectorPack: null,
    permissions: [
      "catalogue.view",
      "products.view",
      "catalogue.quality.view",
      "suppliers.view",
      "suppliers.verify",
    ],
    correlationId: null,
    hasPermission: () => true,
  }),
}));

// Mock recharts to avoid DOM size measurement issues in jsdom environment
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container">{children}</div>,
  ComposedChart: ({ children }) => <div className="recharts-composed-chart">{children}</div>,
  Bar: () => <div className="recharts-bar" />,
  Line: () => <div className="recharts-line" />,
  XAxis: () => <div className="recharts-xaxis" />,
  YAxis: () => <div className="recharts-yaxis" />,
  Tooltip: () => <div className="recharts-tooltip" />,
  CartesianGrid: () => <div className="recharts-grid" />,
  Legend: () => <div className="recharts-legend" />,
  PieChart: ({ children }) => <div className="recharts-pie-chart">{children}</div>,
  Pie: ({ children }) => <div className="recharts-pie">{children}</div>,
  Cell: () => <div className="recharts-cell" />,
}));

describe("Screen 18 — Analytics & Business Intelligence Dashboard Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Renders /admin/analytics inside existing Admin Shell with Analytics sidebar item active", () => {
    render(
      <AdminShell>
        <AnalyticsPage />
      </AdminShell>
    );

    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    const analyticsNavLink = screen.getByRole("link", { name: "Analytics" });
    expect(analyticsNavLink).toBeInTheDocument();
    expect(analyticsNavLink).toHaveClass("active");
    expect(screen.getByText("Analytics & Business Intelligence")).toBeInTheDocument();
  });

  it("2. Renders all 14 required KPI cards", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText("Gross Merchandise Value")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Net Platform Revenue")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Total Orders")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Average Order Value")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Paid Orders")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Failed Payments")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Active Customers")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Repeat Purchase Rate")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Active Suppliers")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Supplier Fulfilment Rate")[0]).toBeInTheDocument();
      expect(screen.getAllByText("On-Time Delivery")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Return Rate")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Support Cases Within SLA")[0]).toBeInTheDocument();
      expect(screen.getAllByText("High-Risk Operational Events")[0]).toBeInTheDocument();
    });
  });

  it("3. Parses filter state from URLSearchParams and updates search string on filter submit", async () => {
    render(<AnalyticsDashboard />);

    const applyBtn = screen.getByRole("button", { name: "Apply Filters" });
    expect(applyBtn).toBeInTheDocument();

    fireEvent.click(applyBtn);

    expect(mockReplace).toHaveBeenCalled();
  });

  it("4. Resets filters to documented defaults on Clear All", async () => {
    render(<AnalyticsDashboard />);

    const clearBtn = screen.getByRole("button", { name: "Clear All" });
    fireEvent.click(clearBtn);

    expect(mockReplace).toHaveBeenCalledWith("/admin/analytics", { scroll: false });
  });

  it("5. KPI links navigate to Screen 19 report route preserving search parameters", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const gmvLink = screen.getByTitle(/Gross Merchandise Value/i);
      expect(gmvLink).toBeInTheDocument();
      expect(gmvLink.getAttribute("href")).toContain("/admin/analytics/reports/gmv-analysis?");
      expect(gmvLink.getAttribute("href")).toContain("reportingPeriod=last-30-days");
    });
  });

  it("6. Renders aggregate rows in Product and Supplier performance tables", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Product & Category Performance")).toBeInTheDocument();
      expect(screen.getByText("Radiance Vitamin C Serum - 30ml")).toBeInTheDocument();
      expect(screen.getAllByText("Supplier Performance")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Luxe Distribution Pvt Ltd")[0]).toBeInTheDocument();
    });
  });

  it("7. Handles permission-restricted users without revealing sensitive values", async () => {
    const restrictedPermissions = [ANALYTICS_PERMISSIONS.VIEW_ANALYTICS]; // No finance, customer, or compliance

    render(<AnalyticsDashboard userPermissions={restrictedPermissions} />);

    await waitFor(() => {
      const restrictedBadges = screen.getAllByText("Restricted");
      expect(restrictedBadges.length).toBeGreaterThan(0);
    });
  });

  it("8. Funnel calculations handle zero denominators safely without NaN", () => {
    expect(calculateConversionRate(100, 0)).toBe(0);
    expect(calculateConversionRate(0, 500)).toBe(0);
    expect(calculateConversionRate(null, undefined)).toBe(0);
  });

  it("9. Evaluates inverse trend semantics correctly", () => {
    // Increase in failed payments (inverse) is negative
    expect(getTrendSemanticStatus("failed-payments", 8.2)).toBe("negative");

    // Decrease in return rate (inverse) is positive
    expect(getTrendSemanticStatus("return-rate", -0.6)).toBe("positive");

    // Increase in GMV (standard) is positive
    expect(getTrendSemanticStatus("gmv", 12.4)).toBe("positive");
  });

  it("10. Formats currency, counts and percentages correctly", () => {
    expect(formatCurrency(84200000)).toBe("LKR 84.2M");
    expect(formatCurrency(6744)).toBe("LKR 6,744");
    expect(formatCurrency(null)).toBe("Not Available");
    expect(formatCount(12486)).toBe("12,486");
  });

  it("11. Screen 19 URL builder handles custom report parameters cleanly", () => {
    const url = buildAnalyticsReportUrl({
      reportId: "supplier-detail",
      currentSearchParams: new URLSearchParams("reportingPeriod=last-30-days"),
      additionalParams: { supplierId: "SUP-0045" },
    });

    expect(url).toContain("/admin/analytics/reports");
    expect(url).toContain("/admin/analytics/reports/supplier-detail");
    expect(url).toContain("reportingPeriod=last-30-days");
    expect(url).toContain("supplierId=SUP-0045");
  });
});
