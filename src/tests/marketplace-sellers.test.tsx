import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetchSellers: vi.fn(), fetchSeller: vi.fn(), fetchSellerPerf: vi.fn(), push: vi.fn(), query: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
  useParams: () => ({ sellerId: "7" }),
}));
vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceSellers: mocks.fetchSellers,
  fetchMarketplaceSeller: mocks.fetchSeller,
  fetchMarketplaceSellerPerformance: mocks.fetchSellerPerf,
}));

import MarketplaceSellerDetailPage from "@/app/admin/marketplace/sellers/[sellerId]/page";
import MarketplaceSellersPage from "@/app/admin/marketplace/sellers/page";

const seller = {
  id: 7, company_name: "Real Supplier", slug: "real-supplier", email: "seller@example.test",
  phone: "+94110000000", website: "https://example.test", business_type: "manufacturer",
  country: "Sri Lanka", city: "Colombo", address: "1 Main Street", verification_status: "verified" as const,
  status: "active", is_featured: true, rating: "4.50", reviews_count: 8, products_count: 3,
  orders_count: 2, certificates_count: 1, created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-10T10:00:00Z",
};
const capabilities = { read: true, create_seller: false as const, edit_seller: false as const, verify_seller: false as const, suspend_seller: false as const, feature_seller: false as const, export: false as const };
const listResponse = {
  summary: { total_sellers: 1, active_sellers: 1, featured_sellers: 0, status_counts: { active: 1 }, verification_counts: { verified: 0 } },
  sellers: [seller], filters: { observed_statuses: ["active", "paused_custom"], observed_verification_statuses: ["pending", "verified", "rejected"] },
  pagination: { current_page: 2, per_page: 20, total: 21, last_page: 2, from: 21, to: 21 }, capabilities,
};
const detailResponse = {
  seller,
  recent_products: [{ id: 3, name: "Real Product", sku: "REAL-3", status: "active", price: "99.00", currency_id: 5, created_at: "2026-09-09T10:00:00Z" }],
  recent_orders: [{ id: 4, uuid: "order-4", order_number: "ORD-4", status: "placed", payment_status: "paid", fulfillment_status: "pending", currency: "USD", total: "125.00", created_at: "2026-09-10T10:00:00Z" }],
  capabilities: { ...capabilities, create_listing: false as const },
};

describe("Marketplace Sellers", () => {
  beforeEach(() => { mocks.fetchSellers.mockReset(); mocks.fetchSeller.mockReset(); mocks.fetchSellerPerf.mockReset(); mocks.fetchSellerPerf.mockResolvedValue(null); mocks.push.mockReset(); mocks.query = ""; });
  afterEach(() => cleanup());

  it("uses the typed list client and preserves summaries, verified zero, observed data, and navigation", async () => {
    mocks.fetchSellers.mockResolvedValue(listResponse);
    render(<MarketplaceSellersPage />);
    expect(screen.getByText("Loading Marketplace sellers…")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Real Supplier" })).toHaveAttribute("href", "/admin/marketplace/sellers/7");
    expect(mocks.fetchSellers).toHaveBeenCalledWith({ q: undefined, status: undefined, verification_status: undefined, page: 1, per_page: 20 }, expect.any(AbortSignal));
    expect(screen.getByText("Verified Sellers").parentElement).toHaveTextContent("0");
    expect(screen.getByText("Featured Sellers").parentElement).toHaveTextContent("0");
    expect(screen.getByRole("option", { name: "Paused Custom" })).toBeInTheDocument();
    expect(screen.queryByText(/Add Seller|Export Sellers/)).toBeNull();
  });

  it("maps search, observed status, verification, pagination, and refresh", async () => {
    mocks.query = "search=real&status=paused_custom&verification_status=verified&page=2";
    mocks.fetchSellers.mockResolvedValue(listResponse);
    render(<MarketplaceSellersPage />);
    await waitFor(() => expect(mocks.fetchSellers).toHaveBeenCalledWith({ q: "real", status: "paused_custom", verification_status: "verified", page: 2, per_page: 20 }, expect.any(AbortSignal)));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(mocks.fetchSellers).toHaveBeenCalledTimes(2));
  });

  it("cancels list GET and preserves error, retry, and empty states", async () => {
    mocks.fetchSellers.mockReturnValueOnce(new Promise(() => undefined));
    const first = render(<MarketplaceSellersPage />);
    const signal = mocks.fetchSellers.mock.calls[0][1] as AbortSignal;
    first.unmount();
    expect(signal.aborted).toBe(true);
    mocks.fetchSellers.mockRejectedValueOnce(new Error("Seller API unavailable"));
    mocks.fetchSellers.mockResolvedValueOnce({ ...listResponse, sellers: [] });
    render(<MarketplaceSellersPage />);
    expect(await screen.findByText("Seller API unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("No sellers match the current filters.")).toBeInTheDocument();
  });

  it("renders the authoritative profile, real counts, products, orders, and currencies", async () => {
    mocks.fetchSeller.mockResolvedValue(detailResponse);
    render(<MarketplaceSellerDetailPage />);
    expect(await screen.findByText("seller@example.test")).toBeInTheDocument();
    expect(screen.getByText("+94110000000")).toBeInTheDocument();
    expect(screen.getByText("real-supplier")).toBeInTheDocument();
    expect(screen.getByText("https://example.test")).toBeInTheDocument();
    expect(screen.getAllByText("Colombo, Sri Lanka").length).toBeGreaterThan(0);
    expect(screen.getByText("4.50 (8)")).toBeInTheDocument();
    expect(screen.getByText("Real Product")).toBeInTheDocument();
    expect(screen.getByText("99.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ORD-4" })).toHaveAttribute("href", "/admin/marketplace/orders/order-4");
    expect(screen.getByText("USD 125.00")).toBeInTheDocument();
    expect(screen.queryByText(/Edit Seller|Suspend Seller|Verify Seller|Reject Seller|Create Listing/)).toBeNull();
  });

  it("renders honest null and empty detail states without invented currency", async () => {
    mocks.fetchSeller.mockResolvedValue({
      ...detailResponse,
      seller: { ...seller, email: null, phone: null, address: null, rating: null, is_featured: false },
      recent_products: [{ ...detailResponse.recent_products[0], price: null, currency_id: null }],
      recent_orders: [{ ...detailResponse.recent_orders[0], currency: null, total: "125.00" }],
    });
    render(<MarketplaceSellerDetailPage />);
    expect(await screen.findByText("Real Product")).toBeInTheDocument();
    expect(screen.getByText("125.00")).toBeInTheDocument();
    expect(screen.queryByText("USD 125.00")).toBeNull();
    expect(screen.queryByText("Marketplace Editing")).toBeNull();
  });
});
