import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogisticsCommandCenterCharts } from "@/features/admin/logistics/components/LogisticsCommandCenterCharts";

describe("LogisticsCommandCenterCharts", () => {
  it("mounts all LG01 chart families with real mapped series", () => {
    render(<LogisticsCommandCenterCharts analytics={{ shipment_trend: [{ date: "2026-09-14", label: "Sep 14", created: 3, delivered: 2 }], shipment_status_distribution: [{ status: "in_transit", count: 3 }, { status: "delivered", count: 2 }] }} />);
    expect(screen.getByTestId("shipment-trend-chart")).toHaveClass("h-[280px]");
    expect(screen.getByTestId("shipment-status-donut")).toHaveClass("h-[280px]");
    expect(screen.getByTestId("operational-status-chart")).toHaveClass("h-[280px]");
    expect(screen.getByLabelText("5 Shipments")).not.toHaveClass("relative");
  });

  it("shows honest empty states instead of fake fallback series", () => {
    render(<LogisticsCommandCenterCharts analytics={{ shipment_trend: [], shipment_status_distribution: [] }} />);
    expect(screen.getByText(/no shipment trend data/i)).toBeInTheDocument();
    expect(screen.getByText(/no shipment status data/i)).toBeInTheDocument();
    expect(screen.getByText(/no operational status data/i)).toBeInTheDocument();
  });
});
