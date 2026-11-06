import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogisticsStatusCharts, statusData } from "@/features/admin/logistics/components/LogisticsStatusCharts";

describe("LogisticsStatusCharts", () => {
  it("renders real numeric status data in explicitly sized chart parents", () => {
    render(<LogisticsStatusCharts data={statusData({ pending: 4, delivered: 3 })} noun="Shipments" distributionTitle="Shipment Status Distribution" summaryTitle="Operational Status Summary" />);
    expect(screen.getByTestId("Shipments-status-donut")).toHaveClass("h-[300px]");
    expect(screen.getByTestId("Shipments-status-bars")).toHaveClass("h-[300px]");
    expect(screen.getByLabelText("7 Shipments")).not.toHaveClass("relative");
  });

  it("does not invent fallback values for an empty aggregation", () => {
    render(<LogisticsStatusCharts data={[]} noun="Returns" distributionTitle="Return Status Distribution" summaryTitle="Reverse Logistics Status Summary" />);
    expect(screen.getByText(/no returns analytics available/i)).toBeInTheDocument();
    expect(screen.getByText(/no operational status data available/i)).toBeInTheDocument();
  });
});
