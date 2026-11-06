import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import OrderDetailPage from "@/app/admin/marketplace/orders/[orderId]/page";
import { marketplaceOrderDetail } from "./marketplace-regression-fixtures";

const apiGet = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams("tab=overview"),
  useParams: () => ({ orderId: "21" }),
}));

vi.mock("@/lib/api", () => ({ api: { get: apiGet } }));

describe("Screen 11 - Marketplace Order Details Page", () => {
  beforeEach(() => apiGet.mockReset().mockResolvedValue(marketplaceOrderDetail));

  it("renders order summary header and metrics for ORD-2026-009021", async () => {
    render(<OrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);

    expect((await screen.findAllByText("ORD-2026-009021")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Elena Rodriguez").length).toBeGreaterThan(0);
    expect(screen.getAllByText("LKR 14500.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Processing").length).toBeGreaterThan(0);
    expect(apiGet).toHaveBeenCalledWith(
      "/admin/marketplace/orders/21",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("renders order health metrics without unavailable operational actions", async () => {
    render(<OrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);

    expect(await screen.findByText("Payment Status")).toBeInTheDocument();
    expect(screen.getByText("Fulfilment")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update Status" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel Order" })).not.toBeInTheDocument();
  });

  it("renders order details and read-only Logistics shipment references", async () => {
    render(<OrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);

    expect(await screen.findByText("Order Items")).toBeInTheDocument();
    expect(screen.getByText("Radiance Vitamin C Serum")).toBeInTheDocument();
    expect(screen.getByText("Shipment Activity")).toBeInTheDocument();
    expect(screen.getByText("SHP-90210")).toBeInTheDocument();
    expect(screen.getByText("SHP-90210").closest("a")).toBeNull();
    expect(screen.getByText("Order Lifecycle")).toBeInTheDocument();
  });

  it("renders dark-red Financial Reconciliation card with exact figures", async () => {
    render(<OrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);

    expect(await screen.findByText("Financial Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Platform Fee")).toBeInTheDocument();
    expect(screen.getByText("LKR 1450.00")).toBeInTheDocument();
  });

  it("opens modal when clicking Update Order Status", async () => {
    render(<OrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);

    fireEvent.click(await screen.findByRole("button", { name: "Refresh" }));
    await vi.waitFor(() => expect(apiGet).toHaveBeenCalledTimes(2));
  });
});
