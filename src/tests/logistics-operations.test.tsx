import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LogisticsShipmentsPage from "@/app/admin/logistics/shipments/page";
import ShipmentDetailPage from "@/app/admin/logistics/shipments/[shipmentId]/page";
import {
  fetchShipmentDetail,
  fetchShipmentOperations,
} from "@/services/api/logisticsService";

const logisticsApi = vi.hoisted(() => ({ getShipments: vi.fn(), getShipment: vi.fn() }));

vi.mock("@/lib/api/logistics", () => ({ logisticsApi }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ shipmentId: "SHP-90210" }),
}));

describe("Logistics shipment operations", () => {
  const shipment = {
    id: 91, uuid: "shipment-uuid", shipment_number: "SHP-90210",
    order: { id: 21, order_number: "ORD-2026-009021" }, carrier: "Swift Logistics",
    tracking_number: "TRK-90210", shipping_method: "Express", origin_port: "Colombo",
    destination_port: "Kandy", estimated_ship_date: "2026-09-10", estimated_delivery_date: "2026-09-12",
    shipped_at: null, delivered_at: null, status: "pending",
  };

  beforeEach(() => {
    logisticsApi.getShipments.mockResolvedValue({ data: [shipment], summary: { total: 1, pending: 1, delivered_today: 0 }, status_counts: { pending: 1 }, filters: { statuses: ["pending"] }, capabilities: { read: true, manage: false, import_updates: false, export_manifest: false, priority_queue: false, report_issue: false, carrier_portal: false }, current_page: 1, per_page: 10, total: 1, last_page: 1 });
    logisticsApi.getShipment.mockResolvedValue({ shipment, capabilities: { read: true, manage: false, confirm_pickup: false, change_carrier: false, mark_exception: false, cancel: false, carrier_portal: false } });
  });

  it("filters the quick queue to priority shipments", async () => {
    const result = await fetchShipmentOperations({ filterKey: "priority" });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((shipment) => shipment.isPriority)).toBe(true);
  });

  it("returns a known shipment and rejects an unknown shipment", async () => {
    await expect(fetchShipmentDetail("SHP-90210")).resolves.toMatchObject({
      shipment: { publicReference: "SHP-90210" },
    });
    await expect(fetchShipmentDetail("SHP-UNKNOWN")).rejects.toThrow(
      "Shipment not found",
    );
  });

  it("renders the shipment workspace and its rows", async () => {
    render(<LogisticsShipmentsPage />);

    expect(
      screen.getByRole("heading", { name: "Shipment Operations" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText("SHP-90210")[0]).toBeInTheDocument();
    });
    expect(
      screen.getByText("Total Shipments"),
    ).toBeInTheDocument();
  });

  it("renders a valid shipment detail route", async () => {
    render(<ShipmentDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Shipment Information")).toBeInTheDocument();
    });
    expect(screen.getAllByText("SHP-90210")[0]).toBeInTheDocument();
    expect(screen.getByText("Read-only Logistics Record")).toBeInTheDocument();
  });
});
