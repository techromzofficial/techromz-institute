import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import OrderManagementPage from "@/app/admin/marketplace/orders/page";
import OrderDetailPage from "@/app/admin/marketplace/orders/[orderId]/page";
import { marketplaceOrderDetail, marketplaceOrders } from "./marketplace-regression-fixtures";

const apiGet = vi.hoisted(() => vi.fn());

// Mock Next.js router & search params
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ orderId: "21" }),
  notFound: () => {
    throw new Error("404 Not Found");
  },
}));

vi.mock("@/lib/api", () => ({
  api: { get: apiGet },
  withQuery: (path: string, params: Record<string, unknown>) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)])).toString();
    return query ? `${path}?${query}` : path;
  },
}));

describe("Screen 10 — Marketplace Order Management", () => {
  beforeEach(() => {
    apiGet.mockReset().mockImplementation((path: string) => {
      if (path.startsWith("/admin/marketplace/orders/")) return Promise.resolve(marketplaceOrderDetail);
      if (path.startsWith("/admin/marketplace/orders")) return Promise.resolve(marketplaceOrders);
      return Promise.reject(new Error(`Unexpected API path: ${path}`));
    });
  });

  it("renders the read-only Order Management header without unsupported actions", async () => {
    render(<OrderManagementPage />);

    expect(await screen.findByText("Order Management")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Monitor tenant-scoped customer orders/i
      )
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /Assign Orders/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Export Orders/i })).toBeNull();
  });

  it("renders authoritative order summary cards", async () => {
    render(<OrderManagementPage />);

    expect(await screen.findByText("Total Orders")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cancelled").length).toBeGreaterThan(0);
  });

  it("renders order table sample rows", async () => {
    render(<OrderManagementPage />);

    await waitFor(() => {
      expect(screen.getAllByText("ORD-2026-009021")[0]).toBeInTheDocument();
      expect(screen.getByText("Elena Rodriguez")).toBeInTheDocument();
    });
  });

  it("renders persisted currency totals without advertising unsupported operations", async () => {
    render(<OrderManagementPage />);

    expect(await screen.findByText("LKR Order Value")).toBeInTheDocument();
    expect(screen.getByText("LKR 3650000.00")).toBeInTheDocument();
    expect(screen.queryByText("Marketplace Order Operations")).toBeNull();
  });

  it("renders order detail page for valid ID and handles invalid ID", async () => {
    render(<OrderDetailPage params={Promise.resolve({ orderId: "ignored" })} />);
    expect(
      await screen.findByRole("heading", { name: "ORD-2026-009021" }),
    ).toBeInTheDocument();
  });
});
