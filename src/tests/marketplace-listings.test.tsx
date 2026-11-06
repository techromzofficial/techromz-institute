import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchListings: vi.fn(),
  fetchListing: vi.fn(),
  createListing: vi.fn(),
  updateListing: vi.fn(),
  transitionListing: vi.fn(),
  push: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
  useParams: () => ({ listingId: "31" }),
}));

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceListings: mocks.fetchListings,
  fetchMarketplaceListing: mocks.fetchListing,
  createMarketplaceListing: mocks.createListing,
  updateMarketplaceListing: mocks.updateListing,
  transitionMarketplaceListing: mocks.transitionListing,
}));

import MarketplaceListingDetailPage from "@/app/admin/marketplace/listings/[listingId]/page";
import MarketplaceListingsPage from "@/app/admin/marketplace/listings/page";

const capabilities = {
  read: true,
  create_listing: true,
  edit_listing: true,
  submit_listing: true,
  approve_listing: false,
  request_changes: false,
  reject_listing: false,
  publish_listing: true,
  pause_listing: false,
  unpublish_listing: false,
  suspend_listing: false,
  reinstate_listing: false,
  archive_listing: true,
  change_price_override: true,
  export: false,
};

const listing = {
  id: 31,
  uuid: "listing-31",
  status: "approved",
  override_price: null,
  published_at: null,
  paused_at: null,
  archived_at: null,
  created_at: "2026-09-12T10:00:00Z",
  product: {
    id: 8,
    name: "Real Catalogue Product",
    sku: "REAL-8",
    status: "active",
    price: "125.00",
    supplier: {
      id: 4,
      company_name: "Real Supplier",
      status: "active",
      verification_status: "verified",
    },
  },
  channel: {
    id: 5,
    uuid: "channel-5",
    code: "WEB",
    name: "Web Store",
    type: "storefront",
    status: "active",
  },
};

const listResponse = {
  summary: {
    total_listings: 1,
    published_listings: 0,
    draft_listings: 0,
    paused_listings: 0,
    archived_listings: 0,
    status_counts: { approved: 1 },
    channel_counts: { "5": 1 },
  },
  listings: [listing],
  filters: {
    statuses: ["draft", "approved", "published"],
    observed_channel_ids: [5, 9],
  },
  pagination: {
    current_page: 2,
    per_page: 20,
    total: 21,
    last_page: 2,
    from: 21,
    to: 21,
  },
  options: {
    products: [{ id: 8, name: "Real Catalogue Product", sku: "REAL-8" }],
    channels: [listing.channel],
  },
  capabilities,
};

const detailResponse = {
  listing: {
    ...listing,
    version: 7,
    eligibility_status: "blocked",
    eligibility_blockers: ["Catalogue image is required."],
    eligibility_evaluated_at: "2026-09-12T10:30:00Z",
    updated_at: "2026-09-12T11:00:00Z",
  },
  product: {
    ...listing.product,
    currency_id: null,
    supplier: {
      ...listing.product.supplier,
      email: null,
      phone: null,
    },
  },
  channel: listing.channel,
  capabilities,
};

describe("Marketplace Listings screens", () => {
  beforeEach(() => {
    mocks.fetchListings.mockReset();
    mocks.fetchListing.mockReset();
    mocks.createListing.mockReset();
    mocks.updateListing.mockReset();
    mocks.transitionListing.mockReset();
    mocks.push.mockReset();
    mocks.query = "";
  });

  afterEach(cleanup);

  it("uses the typed list client and renders real metrics, rows, zeroes, and authoritative filters", async () => {
    mocks.fetchListings.mockResolvedValue(listResponse);
    render(<MarketplaceListingsPage />);

    expect(await screen.findByText("Real Catalogue Product")).toBeInTheDocument();
    expect(mocks.fetchListings).toHaveBeenCalledWith(
      { q: undefined, status: undefined, channel_id: undefined, page: 1, per_page: 20 },
      expect.any(AbortSignal),
    );
    expect(screen.getByText("Published", { selector: "p" }).parentElement).toHaveTextContent("0");
    expect(screen.getByRole("option", { name: "Channel #9" })).toBeInTheDocument();
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Create Listing" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
  });

  it("maps search, status, channel, and pagination through the typed client", async () => {
    mocks.query = "search=shoe&status=approved&channel_id=5&page=2";
    mocks.fetchListings.mockResolvedValue(listResponse);
    render(<MarketplaceListingsPage />);

    await waitFor(() => expect(mocks.fetchListings).toHaveBeenCalledWith(
      { q: "shoe", status: "approved", channel_id: 5, page: 2, per_page: 20 },
      expect.any(AbortSignal),
    ));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("preserves list loading, error, and retry behavior", async () => {
    mocks.fetchListings.mockRejectedValueOnce(new Error("Listings unavailable"));
    mocks.fetchListings.mockResolvedValueOnce(listResponse);
    render(<MarketplaceListingsPage />);

    expect(screen.getByText("Loading Marketplace listings…")).toBeInTheDocument();
    expect(await screen.findByText("Listings unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Real Catalogue Product")).toBeInTheDocument();
  });

  it("creates a draft using only authoritative options and certified fields", async () => {
    mocks.fetchListings.mockResolvedValue(listResponse);
    mocks.createListing.mockResolvedValue({
      listing: { id: 44, uuid: "listing-44", status: "draft", version: 1 },
    });
    render(<MarketplaceListingsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Create Listing" }));
    fireEvent.change(screen.getByLabelText("Product"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Channel"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Marketplace override price"), {
      target: { value: "99.50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Draft Listing" }));

    await waitFor(() => expect(mocks.createListing).toHaveBeenCalledWith({
      product_id: 8,
      channel_id: 5,
      override_price: "99.50",
    }));
    expect(mocks.transitionListing).not.toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith("/admin/marketplace/listings/listing-44");
  });

  it("hides create when capability is false and shows server create errors", async () => {
    mocks.fetchListings.mockResolvedValueOnce({
      ...listResponse,
      capabilities: { ...capabilities, create_listing: false },
      options: null,
    });
    const rendered = render(<MarketplaceListingsPage />);
    expect(await screen.findByText("Real Catalogue Product")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Listing" })).toBeNull();
    rendered.unmount();

    mocks.fetchListings.mockResolvedValue(listResponse);
    mocks.createListing.mockRejectedValue(new Error("Duplicate Listing"));
    render(<MarketplaceListingsPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Create Listing" }));
    fireEvent.change(screen.getByLabelText("Product"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Channel"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Draft Listing" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Duplicate Listing");
  });

  it("uses the typed detail client and renders truthful projections and null values", async () => {
    mocks.fetchListing.mockResolvedValue(detailResponse);
    render(<MarketplaceListingDetailPage />);

    expect(await screen.findByRole("heading", { name: "Real Catalogue Product" })).toBeInTheDocument();
    expect(mocks.fetchListing).toHaveBeenCalledWith("31", expect.any(AbortSignal));
    expect(screen.getAllByText("Web Store").length).toBeGreaterThan(0);
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText("Catalogue image is required.")).toBeInTheDocument();
    expect(screen.queryByText(/conversion|performance|force publish/i)).toBeNull();
  });

  it("updates nullable override price with the authoritative version and refetches", async () => {
    mocks.fetchListing.mockResolvedValue(detailResponse);
    mocks.updateListing.mockResolvedValue({
      listing: { id: 31, uuid: "listing-31", status: "approved", version: 8 },
    });
    render(<MarketplaceListingDetailPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit Listing" }));
    fireEvent.change(screen.getByLabelText("Marketplace override price"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Listing" }));

    await waitFor(() => expect(mocks.updateListing).toHaveBeenCalledWith("31", {
      expected_version: 7,
      override_price: null,
    }));
    await waitFor(() => expect(mocks.fetchListing.mock.calls.length).toBeGreaterThan(1));
  });

  it("handles stale updates without retrying the mutation", async () => {
    const conflict = Object.assign(new Error("Conflict"), { status: 409 });
    mocks.fetchListing.mockResolvedValue(detailResponse);
    mocks.updateListing.mockRejectedValue(conflict);
    render(<MarketplaceListingDetailPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit Listing" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Listing" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("changed after you loaded it");
    expect(mocks.updateListing).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Refresh Listing" })).toBeInTheDocument();
  });

  it("maps visible workflow capabilities to exact actions and versions", async () => {
    mocks.fetchListing.mockResolvedValue({
      ...detailResponse,
      capabilities: {
        ...capabilities,
        edit_listing: false,
        submit_listing: false,
        publish_listing: true,
        archive_listing: false,
      },
    });
    mocks.transitionListing.mockResolvedValue({
      listing: { id: 31, uuid: "listing-31", status: "published", version: 8 },
    });
    render(<MarketplaceListingDetailPage />);

    expect(await screen.findByRole("button", { name: "Publish" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit for Review" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(mocks.transitionListing).toHaveBeenCalledWith("31", {
      action: "publish",
      expected_version: 7,
    }));
    await waitFor(() => expect(mocks.fetchListing.mock.calls.length).toBeGreaterThan(1));
  });

  it("shows authoritative publish eligibility failures and refreshes detail", async () => {
    mocks.fetchListing.mockResolvedValue(detailResponse);
    mocks.transitionListing.mockRejectedValue(
      new Error("Catalogue eligibility blocks publication."),
    );
    render(<MarketplaceListingDetailPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Publish" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Catalogue eligibility blocks publication.",
    );
    expect(mocks.transitionListing).toHaveBeenCalledWith("31", {
      action: "publish",
      expected_version: 7,
    });
    await waitFor(() => expect(mocks.fetchListing.mock.calls.length).toBeGreaterThan(1));
    expect(screen.queryByRole("button", { name: /Publish Anyway|Delete|Restore/i })).toBeNull();
  });
});
