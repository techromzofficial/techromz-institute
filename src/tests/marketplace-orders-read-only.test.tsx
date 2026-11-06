import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchOrders: vi.fn(),
  fetchOrder: vi.fn(),
  cancelOrder: vi.fn(),
  push: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
  useParams: () => ({ orderId: "21" }),
}));

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceOrders: mocks.fetchOrders,
  fetchMarketplaceOrder: mocks.fetchOrder,
  cancelMarketplaceOrder: mocks.cancelOrder,
  getMarketplaceOrdersExportUrl: vi.fn(() => "/api/admin/marketplace/orders/export"),
}));

import MarketplaceOrderDetailPage from "@/app/admin/marketplace/orders/[orderId]/page";
import MarketplaceOrdersPage from "@/app/admin/marketplace/orders/page";

const listResponse = {
  summary: {
    total_orders: 2,
    status_counts: { pending: 0, completed: 2 },
    payment_status_counts: { paid: 2 },
    fulfillment_status_counts: { shipped: 2 },
    currency_totals: [
      { currency: "LKR", orders_count: 1, total_amount: "1000.00" },
      { currency: "USD", orders_count: 1, total_amount: "25.00" },
    ],
  },
  orders: [{
    id: 21,
    uuid: "order-uuid",
    order_reference: "ORD-MP-21",
    customer: { id: 3, name: "Real Customer", email: "customer@example.test" },
    supplier: { id: 4, company_name: "Real Supplier" },
    items_count: 1,
    amounts: { total: "25.00", subtotal: null, tax: null, shipping: null,
      discount: null, platform_fee: null, currency: "USD" },
    status: "completed",
    payment_status: "paid",
    fulfillment_status: "shipped",
    approval_status: "approved",
    payment_method: null,
    order_source: "marketplace",
    delivery_terms: null,
    expected_delivery_date: null,
    confirmed_at: null,
    created_at: "2026-09-12T10:00:00Z",
    updated_at: "2026-09-12T10:00:00Z",
  }],
  filters: {
    statuses: ["pending", "completed"],
    observed_payment_statuses: ["paid"],
    observed_fulfillment_statuses: ["shipped"],
  },
  pagination: { current_page: 2, per_page: 20, total: 21, last_page: 2, from: 21, to: 21 },
  capabilities: { read: true, create_order: false, assign_orders: false, update_status: false,
    hold_order: false, cancel_order: false, refund_review: false, return_review: false,
    escalate_order: false, contact_customer: false, contact_supplier: false, export: false },
};

const detailResponse = {
  order: {
    ...listResponse.orders[0],
    supplier: null,
    payment_terms: null,
    shipping_terms: null,
  },
  items: [{ id: 1, product_id: null, product_name: "Real Product", quantity: "2.00",
    unit_price: null, amount: "25.00" }],
  shipments: [{ id: 8, uuid: "shipment-uuid", shipment_number: "SHP-PUBLIC-008",
    carrier: null, tracking_number: null, shipping_method: null,
    estimated_delivery_date: null, status: "pending" }],
  status_history: [{ status: "completed", created_at: "2026-09-12T11:00:00Z" }],
  capabilities: listResponse.capabilities,
};

describe("Marketplace Orders read-only screens", () => {
  beforeEach(() => {
    mocks.fetchOrders.mockReset();
    mocks.fetchOrder.mockReset();
    mocks.push.mockReset();
    mocks.query = "";
  });
  afterEach(cleanup);

  it("uses the authoritative client and renders real list data without mutation actions", async () => {
    mocks.fetchOrders.mockResolvedValue(listResponse);
    render(<MarketplaceOrdersPage />);

    expect(await screen.findByText("ORD-MP-21")).toBeInTheDocument();
    expect(mocks.fetchOrders).toHaveBeenCalledWith(expect.objectContaining({ page: 1, per_page: 20 }), expect.any(AbortSignal));
    expect(screen.getByText("Real Customer")).toBeInTheDocument();
    expect(screen.getByText("LKR 1000.00")).toBeInTheDocument();
    expect(screen.getAllByText("USD 25.00").length).toBeGreaterThan(0);
    expect(screen.getByText("Showing 21–21 of 21")).toBeInTheDocument();
    expect(screen.getByText("Pending", { selector: "p" }).parentElement).toHaveTextContent("0");
    expect(screen.queryByRole("button", { name: /Create Order|Assign|Export|Cancel|Update Status/i })).toBeNull();
  });

  it("maps URL filters and pagination through the typed client", async () => {
    mocks.query = "search=needle&status=completed&payment_status=paid&fulfillment_status=shipped&page=2";
    mocks.fetchOrders.mockResolvedValue(listResponse);
    render(<MarketplaceOrdersPage />);

    await waitFor(() => expect(mocks.fetchOrders).toHaveBeenCalledWith({
      q: "needle", status: "completed", payment_status: "paid",
      fulfillment_status: "shipped", page: 2, per_page: 20,
    }, expect.any(AbortSignal)));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("renders authoritative detail, honest nulls, and read-only shipment history", async () => {
    mocks.fetchOrder.mockResolvedValue(detailResponse);
    render(<MarketplaceOrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);

    expect(await screen.findByRole("heading", { name: "ORD-MP-21" })).toBeInTheDocument();
    expect(mocks.fetchOrder).toHaveBeenCalledWith("21", expect.any(AbortSignal));
    expect(screen.getByText("Real Product")).toBeInTheDocument();
    expect(screen.getByText("SHP-PUBLIC-008")).toBeInTheDocument();
    expect(screen.getByText("SHP-PUBLIC-008").closest("a")).toBeNull();
    expect(screen.getByText(/No carrier/)).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Completed", { selector: "span" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Update Status|Cancel Order|Hold|Refund/i })).toBeNull();
  });

  it("preserves list and detail loading, error, and retry behavior", async () => {
    mocks.fetchOrders.mockRejectedValueOnce(new Error("List unavailable")).mockResolvedValueOnce(listResponse);
    render(<MarketplaceOrdersPage />);
    expect(screen.getByText("Loading Marketplace orders…")).toBeInTheDocument();
    expect(await screen.findByText("List unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("ORD-MP-21")).toBeInTheDocument();
    cleanup();

    mocks.fetchOrder.mockRejectedValueOnce(new Error("Detail unavailable")).mockResolvedValueOnce(detailResponse);
    render(<MarketplaceOrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);
    expect(screen.getByText("Loading Marketplace order…")).toBeInTheDocument();
    expect(await screen.findByText("Detail unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "ORD-MP-21" })).toBeInTheDocument();
  });

  it("renders cancel order button when capability is true and executes cancellation", async () => {
    const cancellableDetail = {
      ...detailResponse,
      order: {
        ...detailResponse.order,
        status: "pending",
        sla_status: "breached",
      },
      items: [
        {
          id: 1,
          product_id: 10,
          product_name: "Ayurvedic Toner",
          sku: "SKU-TONER-1",
          variant_label: "200ml",
          policy_snapshot_id: "POL-2026",
          quantity: "2.00",
          unit_price: "1500.00",
          amount: "3000.00",
        },
      ],
      capabilities: {
        ...detailResponse.capabilities,
        cancel_order: true,
      },
    };

    mocks.fetchOrder.mockResolvedValue(cancellableDetail);
    mocks.cancelOrder.mockResolvedValue({
      message: "Order cancelled successfully.",
      order: {
        id: 21,
        uuid: "order-uuid",
        order_reference: "ORD-MP-21",
        status: "cancelled",
        payment_status: "cancelled",
        fulfillment_status: "cancelled",
      },
    });

    render(<MarketplaceOrderDetailPage params={Promise.resolve({ orderId: "21" })} />);

    expect(await screen.findByRole("heading", { name: "ORD-MP-21" })).toBeInTheDocument();
    expect(screen.getByText("SLA Breached")).toBeInTheDocument();
    expect(screen.getByText("SKU: SKU-TONER-1")).toBeInTheDocument();
    expect(screen.getByText("Policy: POL-2026")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /Cancel Order/i });
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(cancelBtn);
    expect(screen.getByText(/Are you sure you want to cancel order/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Enter the authoritative reason/i);
    fireEvent.change(textarea, { target: { value: "Customer requested cancellation before dispatch." } });

    const confirmBtn = screen.getByRole("button", { name: /Confirm Cancellation/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mocks.cancelOrder).toHaveBeenCalledWith(21, {
        reason: "Customer requested cancellation before dispatch.",
      });
    });

    expect(await screen.findByText("Order has been cancelled successfully.")).toBeInTheDocument();
  });
});
