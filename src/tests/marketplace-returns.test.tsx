import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchReturns: vi.fn(),
  fetchReturn: vi.fn(),
  transitionReturn: vi.fn(),
  respondReturn: vi.fn(),
  push: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
  useParams: () => ({ returnId: "case-12" }),
}));

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceReturns: mocks.fetchReturns,
  fetchMarketplaceReturn: mocks.fetchReturn,
  transitionMarketplaceReturn: mocks.transitionReturn,
  respondMarketplaceReturn: mocks.respondReturn,
}));

import MarketplaceReturnDetailPage from "@/app/admin/marketplace/returns/[returnId]/page";
import MarketplaceReturnsPage from "@/app/admin/marketplace/returns/page";

const returnCase = {
  id: 12,
  uuid: "case-12",
  type: "return" as const,
  reason_code: "damaged_item",
  subject: "Damaged product",
  description: "The delivered item was damaged.",
  status: "open",
  requested_at: "2026-09-10T10:00:00Z",
  resolved_at: null,
  created_at: "2026-09-10T10:01:00Z",
  updated_at: "2026-09-10T11:00:00Z",
  order: { id: 4, uuid: "order-4", order_number: "ORD-4", status: "delivered", payment_status: "paid", fulfillment_status: "fulfilled", currency: "USD", subtotal: "90.00", tax: "5.00", shipping: "5.00", discount: "0.00", total: "100.00" },
  supplier: { id: 7, company_name: "Real Supplier", status: "active", verification_status: "verified" as const },
};

const capabilities = {
  read: true, create_case: false as const, edit_case: false as const,
  review_case: true, approve_case: true, reject_case: true, resolve_case: true, cancel_case: true,
  create_reverse_shipment: false as const, issue_refund: false as const, export: false as const,
};

const listResponse = {
  summary: { total_cases: 1, open_cases: 1, return_cases: 1, dispute_cases: 0, resolved_cases: 0, status_counts: { open: 1 }, type_counts: { return: 1 } },
  returns: [{ ...returnCase, order: { id: 4, order_number: "ORD-4", status: "delivered", payment_status: "paid", fulfillment_status: "fulfilled", total: "100.00" } }],
  filters: { types: ["return", "dispute"], statuses: ["open", "under_review", "approved", "rejected", "awaiting_return", "received", "resolved", "cancelled"] },
  pagination: { current_page: 2, per_page: 20, total: 21, last_page: 2, from: 21, to: 21 },
  capabilities,
};

const detailResponse = {
  return_case: returnCase,
  domain_boundaries: {
    marketplace: "Marketplace owns the commercial case.",
    logistics: "Logistics owns reverse shipment and receipt.",
    finance: "Finance owns refunds and settlement.",
  },
  capabilities,
};

describe("Marketplace Returns & Disputes", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => typeof value === "function" && value.mockReset());
    mocks.query = "";
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });
  afterEach(() => { vi.restoreAllMocks(); cleanup(); });

  it("uses the typed list client, preserves zeroes and projections, and links to detail", async () => {
    mocks.fetchReturns.mockResolvedValue(listResponse);
    render(<MarketplaceReturnsPage />);
    expect(screen.getByText("Loading Marketplace returns and disputes…")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Damaged product" })).toHaveAttribute("href", "/admin/marketplace/returns/case-12");
    expect(mocks.fetchReturns).toHaveBeenCalledWith({ q: undefined, type: undefined, status: undefined, page: 1, per_page: 20 }, expect.any(AbortSignal));
    expect(screen.getByText("Disputes", { selector: "p" }).parentElement).toHaveTextContent("0");
    expect(screen.getByText("ORD-4")).toBeInTheDocument();
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getByText("100.00")).toBeInTheDocument();
    expect(screen.queryByText(/LKR|Create Case|Export|Issue Refund|Create Reverse Shipment/)).toBeNull();
  });

  it("maps search, type, status, pagination, and refresh", async () => {
    mocks.query = "search=damaged&type=return&status=open&page=2";
    mocks.fetchReturns.mockResolvedValue(listResponse);
    render(<MarketplaceReturnsPage />);
    await waitFor(() => expect(mocks.fetchReturns).toHaveBeenCalledWith({ q: "damaged", type: "return", status: "open", page: 2, per_page: 20 }, expect.any(AbortSignal)));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(mocks.fetchReturns).toHaveBeenCalledTimes(2));
  });

  it("cancels the authoritative list GET when the page unmounts", () => {
    mocks.fetchReturns.mockReturnValue(new Promise(() => undefined));
    const view = render(<MarketplaceReturnsPage />);
    const signal = mocks.fetchReturns.mock.calls[0][1] as AbortSignal;

    expect(signal.aborted).toBe(false);
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("preserves list error, retry, and empty states", async () => {
    mocks.fetchReturns.mockRejectedValueOnce(new Error("Returns unavailable"));
    mocks.fetchReturns.mockResolvedValueOnce({ ...listResponse, returns: [], pagination: { ...listResponse.pagination, total: 0, from: null, to: null } });
    render(<MarketplaceReturnsPage />);
    expect(await screen.findByText("Returns unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("No returns or disputes")).toBeInTheDocument();
  });

  it("renders authoritative detail, actual currency, timestamps, and boundaries", async () => {
    mocks.fetchReturn.mockResolvedValue(detailResponse);
    render(<MarketplaceReturnDetailPage params={Promise.resolve({ returnId: "case-12" })} />);
    expect(await screen.findByText("The delivered item was damaged.")).toBeInTheDocument();
    expect(screen.getByText("Damaged Item")).toBeInTheDocument();
    expect(screen.getByText("USD 100.00")).toBeInTheDocument();
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getByText("Logistics owns reverse shipment and receipt.")).toBeInTheDocument();
    expect(screen.getByText("Finance owns refunds and settlement.")).toBeInTheDocument();
  });

  it.each(["review", "approve", "reject", "resolve", "cancel"] as const)("sends exact %s action and refetches detail", async (action) => {
    mocks.fetchReturn.mockResolvedValue(detailResponse);
    mocks.transitionReturn.mockResolvedValue({ return_case: returnCase, capabilities });
    render(<MarketplaceReturnDetailPage params={Promise.resolve({ returnId: "case-12" })} />);
    fireEvent.click(await screen.findByRole("button", { name: `${action[0].toUpperCase()}${action.slice(1)} Case` }));
    await waitFor(() => expect(mocks.transitionReturn).toHaveBeenCalledWith("case-12", action));
    expect(window.confirm).toHaveBeenCalledTimes(action === "review" ? 0 : 1);
    await waitFor(() => expect(mocks.fetchReturn).toHaveBeenCalledTimes(2));
  });

  it("gates actions solely by capabilities and shows honest nulls", async () => {
    mocks.fetchReturn.mockResolvedValue({
      ...detailResponse,
      return_case: { ...returnCase, resolved_at: null, order: { ...returnCase.order, currency: null }, supplier: null },
      capabilities: { ...capabilities, review_case: false, approve_case: false, reject_case: false, resolve_case: false, cancel_case: false },
    });
    render(<MarketplaceReturnDetailPage params={Promise.resolve({ returnId: "case-12" })} />);
    expect(await screen.findByText("No Marketplace workflow actions are available.")).toBeInTheDocument();
    expect(screen.getByText("100.00")).toBeInTheDocument();
    expect(screen.queryByText("USD 100.00")).toBeNull();
    expect(screen.queryByRole("button", { name: /Case$/ })).toBeNull();
  });

  it("shows mutation errors without retrying the mutation", async () => {
    mocks.fetchReturn.mockResolvedValue(detailResponse);
    mocks.transitionReturn.mockRejectedValue(new Error("Transition rejected"));
    render(<MarketplaceReturnDetailPage params={Promise.resolve({ returnId: "case-12" })} />);
    fireEvent.click(await screen.findByRole("button", { name: "Approve Case" }));
    expect(await screen.findByText("Transition rejected")).toBeInTheDocument();
    expect(mocks.transitionReturn).toHaveBeenCalledTimes(1);
  });

  it("renders RMA reference, return items, and submits seller dispute response", async () => {
    const returnWithRma = {
      ...returnCase,
      rma_reference: "RMA-20260917-ABC123",
      items: [
        {
          id: 1,
          uuid: "item-uuid-1",
          order_item_id: 101,
          requested_quantity: 2,
          received_quantity: 2,
          inspected_quantity: 2,
          reason: "Broken seal",
          order_item: { id: 101, product_name: "Silk Serum", sku: "SER-01", quantity: 2, unit_price: 45 },
        },
      ],
      seller_response_text: "Initial seller note",
      seller_response_at: "2026-09-11T12:00:00Z",
    };
    mocks.fetchReturn.mockResolvedValue({
      ...detailResponse,
      return_case: returnWithRma,
      capabilities: { ...capabilities, respond: true },
    });
    mocks.respondReturn.mockResolvedValue({
      return_case: { ...returnWithRma, seller_response_text: "Updated explanation" },
      message: "Seller response recorded successfully.",
      capabilities,
    });

    render(<MarketplaceReturnDetailPage params={Promise.resolve({ returnId: "case-12" })} />);

    expect(await screen.findByText("RMA-20260917-ABC123")).toBeInTheDocument();
    expect(screen.getByText("Silk Serum")).toBeInTheDocument();
    expect(screen.getByText("SKU: SER-01")).toBeInTheDocument();
    expect(screen.getByText("Initial seller note")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Record seller's explanation, evidence, or inspection notes...");
    fireEvent.change(textarea, { target: { value: "Updated explanation" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Seller Response" }));

    await waitFor(() => {
      expect(mocks.respondReturn).toHaveBeenCalledWith("case-12", "Updated explanation");
    });
  });
});
