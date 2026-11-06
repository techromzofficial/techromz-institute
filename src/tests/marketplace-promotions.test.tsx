import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchPromotions: vi.fn(),
  fetchPromotion: vi.fn(),
  updatePromotion: vi.fn(),
  transitionPromotion: vi.fn(),
  createPromotion: vi.fn(),
  push: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
  useParams: () => ({ promotionId: "12" }),
}));

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplacePromotions: mocks.fetchPromotions,
  fetchMarketplacePromotion: mocks.fetchPromotion,
  createMarketplacePromotion: mocks.createPromotion,
  updateMarketplacePromotion: mocks.updatePromotion,
  transitionMarketplacePromotion: mocks.transitionPromotion,
}));

import MarketplacePromotionDetailPage from "@/app/admin/marketplace/promotions/[promotionId]/page";
import MarketplacePromotionsPage from "@/app/admin/marketplace/promotions/page";

const capabilities = {
  read: true,
  create_promotion: true,
  edit_promotion: true,
  schedule_promotion: true,
  activate_promotion: true,
  pause_promotion: false,
  complete_promotion: false,
  archive_promotion: true,
  apply_to_checkout: false,
  export: false,
};

const promotion = {
  id: 12,
  uuid: "promotion-12",
  channel_id: 5,
  name: "Real Promotion",
  code: null,
  type: "percentage" as const,
  value: "15.00",
  status: "draft",
  starts_at: "2026-09-13T09:00:00Z",
  ends_at: "2026-09-20T09:00:00Z",
  created_at: "2026-09-12T09:00:00Z",
  updated_at: "2026-09-12T10:00:00Z",
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
    total_promotions: 1,
    active_promotions: 0,
    scheduled_promotions: 0,
    draft_promotions: 1,
    completed_promotions: 0,
    status_counts: { draft: 1 },
    type_counts: { percentage: 1 },
    channel_counts: { "5": 1 },
  },
  promotions: [promotion],
  filters: {
    statuses: ["draft", "scheduled", "active", "paused", "completed", "archived"],
    types: ["percentage", "fixed_amount"],
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
    channels: [
      promotion.channel,
      {
        id: 9,
        uuid: "channel-9",
        code: "PARTNER",
        name: "Partner Outlet",
        type: "partner",
        status: "inactive",
      },
    ],
  },
  capabilities,
};

const detailResponse = {
  promotion,
  channel: promotion.channel,
  capabilities,
};

describe("Marketplace Promotions", () => {
  beforeEach(() => {
    mocks.fetchPromotions.mockReset();
    mocks.fetchPromotion.mockReset();
    mocks.updatePromotion.mockReset();
    mocks.transitionPromotion.mockReset();
    mocks.createPromotion.mockReset();
    mocks.push.mockReset();
    mocks.query = "";
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("uses the typed list client and renders real summaries, zeroes, rows, and safe Channel IDs", async () => {
    mocks.fetchPromotions.mockResolvedValue(listResponse);
    render(<MarketplacePromotionsPage />);

    expect(await screen.findByText("Real Promotion")).toBeInTheDocument();
    expect(mocks.fetchPromotions).toHaveBeenCalledWith(
      { q: undefined, status: undefined, type: undefined, channel_id: undefined, page: 1, per_page: 20 },
      expect.any(AbortSignal),
    );
    expect(screen.getByText("Active", { selector: "p" }).parentElement).toHaveTextContent("0");
    expect(screen.getByText("15.00%")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Channel #9" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Promotion" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(screen.queryByText(/ROI|redemption|conversion|revenue impact/i)).toBeNull();
  });

  it("maps search, status, type, Channel, and pagination", async () => {
    mocks.query = "search=real&status=draft&type=percentage&channel_id=5&page=2";
    mocks.fetchPromotions.mockResolvedValue(listResponse);
    render(<MarketplacePromotionsPage />);

    await waitFor(() => expect(mocks.fetchPromotions).toHaveBeenCalledWith(
      { q: "real", status: "draft", type: "percentage", channel_id: 5, page: 2, per_page: 20 },
      expect.any(AbortSignal),
    ));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("preserves loading, errors, and retry", async () => {
    mocks.fetchPromotions.mockRejectedValueOnce(new Error("Promotions unavailable"));
    mocks.fetchPromotions.mockResolvedValueOnce(listResponse);
    render(<MarketplacePromotionsPage />);

    expect(screen.getByText("Loading Marketplace promotions…")).toBeInTheDocument();
    expect(await screen.findByText("Promotions unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Real Promotion")).toBeInTheDocument();
  });

  it("creates from authoritative Channel options with the exact certified payload", async () => {
    mocks.fetchPromotions.mockResolvedValue(listResponse);
    mocks.createPromotion.mockResolvedValue({
      promotion: { ...promotion, id: 20, uuid: "promotion-20", status: "draft" },
    });
    render(<MarketplacePromotionsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Create Promotion" }));
    expect(screen.getByRole("option", {
      name: "Partner Outlet — PARTNER (Inactive)",
    })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Channel"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Partner Launch" } });
    fireEvent.change(screen.getByLabelText("Code"), { target: { value: "PARTNER15" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "fixed_amount" } });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "250" } });
    fireEvent.change(screen.getByLabelText("Starts at"), { target: { value: "2026-09-15T09:00" } });
    fireEvent.change(screen.getByLabelText("Ends at"), { target: { value: "2026-09-20T09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Draft Promotion" }));

    await waitFor(() => expect(mocks.createPromotion).toHaveBeenCalledWith({
      channel_id: 9,
      name: "Partner Launch",
      code: "PARTNER15",
      type: "fixed_amount",
      value: "250",
      starts_at: "2026-09-15T09:00",
      ends_at: "2026-09-20T09:00",
    }));
    expect(mocks.transitionPromotion).not.toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith("/admin/marketplace/promotions/promotion-20");
    expect(screen.queryByText(/LKR|USD|\$/)).toBeNull();
  });

  it("gates Create by capability and options availability", async () => {
    mocks.fetchPromotions.mockResolvedValueOnce({
      ...listResponse,
      capabilities: { ...capabilities, create_promotion: false },
    });
    const first = render(<MarketplacePromotionsPage />);
    expect(await screen.findByText("Real Promotion")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Promotion" })).toBeNull();
    first.unmount();

    mocks.fetchPromotions.mockResolvedValue({ ...listResponse, options: null });
    render(<MarketplacePromotionsPage />);
    expect(await screen.findByText("Real Promotion")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Promotion" })).toBeNull();
  });

  it("shows backend create errors without retrying or transitioning", async () => {
    mocks.fetchPromotions.mockResolvedValue(listResponse);
    mocks.createPromotion.mockRejectedValue(new Error("Percentage must not exceed 100."));
    render(<MarketplacePromotionsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Create Promotion" }));
    fireEvent.change(screen.getByLabelText("Channel"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Invalid" } });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "101" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Draft Promotion" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Percentage must not exceed 100.",
    );
    expect(mocks.createPromotion).toHaveBeenCalledTimes(1);
    expect(mocks.transitionPromotion).not.toHaveBeenCalled();
  });

  it("renders authoritative detail, Channel projection, dates, and honest nulls", async () => {
    mocks.fetchPromotion.mockResolvedValue(detailResponse);
    render(<MarketplacePromotionDetailPage />);

    expect(await screen.findByRole("heading", { name: "Real Promotion" })).toBeInTheDocument();
    expect(mocks.fetchPromotion).toHaveBeenCalledWith("12", expect.any(AbortSignal));
    expect(screen.getAllByText("Web Store").length).toBeGreaterThan(0);
    expect(screen.getAllByText("15.00%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.queryByText(/mutations.*unavailable/i)).toBeNull();
    expect(screen.queryByText(/configuration.*[{[]/i)).toBeNull();
  });

  it("edits through the certified payload only when capability permits and refetches", async () => {
    mocks.fetchPromotion.mockResolvedValue(detailResponse);
    mocks.updatePromotion.mockResolvedValue({ promotion });
    render(<MarketplacePromotionDetailPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit Promotion" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated Promotion" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Promotion" }));

    await waitFor(() => expect(mocks.updatePromotion).toHaveBeenCalledWith("12", {
      channel_id: 5,
      name: "Updated Promotion",
      code: null,
      type: "percentage",
      value: "15.00",
      starts_at: "2026-09-13T09:00",
      ends_at: "2026-09-20T09:00",
    }));
    await waitFor(() => expect(mocks.fetchPromotion.mock.calls.length).toBeGreaterThan(1));
  });

  it("maps only certified capability-gated workflow actions", async () => {
    mocks.fetchPromotion.mockResolvedValue({
      ...detailResponse,
      capabilities: {
        ...capabilities,
        pause_promotion: true,
        complete_promotion: true,
      },
    });
    mocks.transitionPromotion.mockResolvedValue({ promotion });
    render(<MarketplacePromotionDetailPage />);

    await screen.findByRole("button", { name: "Schedule" });
    for (const [label, action] of [
      ["Schedule", "schedule"],
      ["Activate", "activate"],
      ["Pause", "pause"],
      ["Complete", "complete"],
      ["Archive", "archive"],
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      await waitFor(() => expect(mocks.transitionPromotion).toHaveBeenCalledWith("12", action));
    }
    expect(window.confirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("button", { name: /Approve|Reject|Delete|Restore|Apply to Checkout/i })).toBeNull();
  });

  it("uses resume for paused promotions and displays backend workflow errors", async () => {
    mocks.fetchPromotion.mockResolvedValue({
      ...detailResponse,
      promotion: { ...promotion, status: "paused" },
      capabilities: {
        ...capabilities,
        edit_promotion: false,
        schedule_promotion: false,
        archive_promotion: false,
      },
    });
    mocks.transitionPromotion.mockRejectedValue(new Error("Channel must be active."));
    render(<MarketplacePromotionDetailPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Resume" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Channel must be active.");
    expect(mocks.transitionPromotion).toHaveBeenCalledWith("12", "resume");
    expect(screen.queryByRole("button", { name: "Edit Promotion" })).toBeNull();
  });
});
