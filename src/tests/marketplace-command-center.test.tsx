import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchCommandCenter = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceCommandCenter: fetchCommandCenter,
}));

import MarketplaceCommandCenterPage from "@/app/admin/marketplace/page";

const response = {
  summary: {
    orders: { total: 12 },
    suppliers: { total: 4 },
    products: { total: 28 },
    listings: { total: 9, published: 6 },
    channels: { total: 3, active: 2 },
    promotions: { active: 1 },
    policy_violations: { open: 0 },
    returns_disputes: { open: 2 },
  },
  order_status_counts: { pending: 0, confirmed: 3, completed: 9 },
  currency_totals: [
    { currency: "LKR", orders_count: 8, total_amount: "125000.00" },
    { currency: "USD", orders_count: 4, total_amount: "540.00" },
  ],
  recent_orders: [
    {
      id: 41,
      uuid: "d8bd05dd-319d-45e9-b45f-456956753f43",
      order_reference: "ORD-MP-0041",
      supplier: { id: 7, company_name: "Real Supplier" },
      total_amount: "540.00",
      currency: "USD",
      status: "confirmed",
      payment_status: "paid",
      fulfillment_status: "processing",
      approval_status: "approved",
      order_source: "marketplace",
      created_at: "2026-09-12T10:00:00Z",
    },
  ],
  domains: {
    listings: { available: true },
    channels: { available: true },
    promotions: { available: true },
    policy_violations: { available: true },
    returns_disputes: { available: true },
    sellers: { available: true },
    orders: { available: true },
    settings: { available: true },
  },
  navigation: [
    { code: "MP01", label: "Marketplace Overview", href: "/admin/marketplace" },
    { code: "MP02", label: "Order Management", href: "/admin/marketplace/orders" },
  ],
  capabilities: {
    read: true,
    manage: false,
    create_order: false,
    assign_orders: false,
    update_order_status: false,
    cancel_order: false,
    export: false,
  },
};

describe("Marketplace Command Center", () => {
  beforeEach(() => fetchCommandCenter.mockReset());
  afterEach(cleanup);

  it("renders only real metrics, separated currencies, recent orders, and domain availability", async () => {
    fetchCommandCenter.mockResolvedValue(response);
    render(<MarketplaceCommandCenterPage />);

    expect(await screen.findByText("ORD-MP-0041")).toBeInTheDocument();
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getByText("LKR 125000.00")).toBeInTheDocument();
    expect(screen.getAllByText("USD 540.00")).toHaveLength(2);
    expect(screen.getByText("Total Listings")).toBeInTheDocument();
    expect(screen.getByText("6 published")).toBeInTheDocument();
    expect(screen.getByTestId("marketplace-order-status-distribution")).toBeInTheDocument();
    expect(screen.getByText("Open Policy Violations")).toBeInTheDocument();
    expect(screen.getAllByText("Available")).toHaveLength(8);
    expect(screen.getByRole("link", { name: "Marketplace Overview" })).toHaveAttribute("href", "/admin/marketplace");
    expect(screen.queryByText(/GMV|AOV|commission|conversion rate|top sellers|health score/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /manage|export|create order|assign|cancel/i })).toBeNull();
  });

  it("preserves authoritative zero lifecycle counts", async () => {
    fetchCommandCenter.mockResolvedValue(response);
    render(<MarketplaceCommandCenterPage />);

    const pendingLink = (await screen.findByText("Pending")).closest("a");
    expect(pendingLink).toHaveTextContent("0");
    expect(pendingLink).toHaveAttribute("href", "/admin/marketplace/orders?status=pending");
    expect(screen.getByText("Open Policy Violations").parentElement).toHaveTextContent("0");
  });

  it("shows honest loading and error states and retries", async () => {
    fetchCommandCenter.mockImplementationOnce(() => new Promise(() => {}));
    const { unmount } = render(<MarketplaceCommandCenterPage />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Marketplace Command Center");
    unmount();

    fetchCommandCenter.mockRejectedValueOnce(new Error("API unavailable"));
    fetchCommandCenter.mockResolvedValueOnce(response);
    render(<MarketplaceCommandCenterPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("API unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getByText("ORD-MP-0041")).toBeInTheDocument());
    expect(fetchCommandCenter).toHaveBeenCalledTimes(3);
  });
});
