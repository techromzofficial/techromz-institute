import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchChannels: vi.fn(),
  createChannel: vi.fn(),
  updateChannel: vi.fn(),
  changeStatus: vi.fn(),
  push: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceChannels: mocks.fetchChannels,
  createMarketplaceChannel: mocks.createChannel,
  updateMarketplaceChannel: mocks.updateChannel,
  changeMarketplaceChannelStatus: mocks.changeStatus,
}));

import MarketplaceChannelsPage from "@/app/admin/marketplace/channels/page";

const channel = {
  id: 5,
  uuid: "channel-5",
  code: "WEB",
  name: "Web Store",
  type: "storefront",
  status: "active",
  created_at: "2026-09-12T09:00:00Z",
  updated_at: "2026-09-12T10:00:00Z",
  marketplace: {
    listings_total: 3,
    published_listings: 0,
    promotions_total: 2,
    active_promotions: 1,
    orders_total: 7,
  },
};

const capabilities = {
  read: true,
  create_channel: true,
  edit_channel: true,
  delete_channel: false,
  change_status: true,
  edit_configuration: false,
  export: false,
};

const response = {
  summary: {
    total_channels: 1,
    active_channels: 1,
    inactive_channels: 0,
    published_listings: 0,
    active_promotions: 1,
  },
  channels: [channel],
  filters: {
    types: ["storefront", "marketplace"],
    statuses: ["active", "inactive"],
  },
  pagination: {
    current_page: 2,
    per_page: 20,
    total: 21,
    last_page: 2,
    from: 21,
    to: 21,
  },
  capabilities,
};

describe("Marketplace Channels", () => {
  beforeEach(() => {
    mocks.fetchChannels.mockReset();
    mocks.createChannel.mockReset();
    mocks.updateChannel.mockReset();
    mocks.changeStatus.mockReset();
    mocks.push.mockReset();
    mocks.query = "";
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("uses the typed client and renders real summaries, zeroes, metrics, and actions", async () => {
    mocks.fetchChannels.mockResolvedValue(response);
    render(<MarketplaceChannelsPage />);

    expect(await screen.findByText("Web Store")).toBeInTheDocument();
    expect(mocks.fetchChannels).toHaveBeenCalledWith(
      { q: undefined, type: undefined, status: undefined, page: 1, per_page: 20 },
      expect.any(AbortSignal),
    );
    expect(screen.getByText("Inactive", { selector: "p" }).parentElement).toHaveTextContent("0");
    expect(screen.getByText("Published Listings").parentElement).toHaveTextContent("0");
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Channel" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete|Export/i })).toBeNull();
    expect(screen.queryByText(/revenue|conversion|health score/i)).toBeNull();
  });

  it("maps search, type, status, and pagination", async () => {
    mocks.query = "search=web&type=storefront&status=active&page=2";
    mocks.fetchChannels.mockResolvedValue(response);
    render(<MarketplaceChannelsPage />);

    await waitFor(() => expect(mocks.fetchChannels).toHaveBeenCalledWith(
      { q: "web", type: "storefront", status: "active", page: 2, per_page: 20 },
      expect.any(AbortSignal),
    ));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("preserves loading, API error, and retry behavior", async () => {
    mocks.fetchChannels.mockRejectedValueOnce(new Error("Channels unavailable"));
    mocks.fetchChannels.mockResolvedValueOnce(response);
    render(<MarketplaceChannelsPage />);

    expect(screen.getByText("Loading Marketplace channels…")).toBeInTheDocument();
    expect(await screen.findByText("Channels unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Web Store")).toBeInTheDocument();
  });

  it("creates with only code, name, and type then refreshes", async () => {
    mocks.fetchChannels.mockResolvedValue(response);
    mocks.createChannel.mockResolvedValue({ channel });
    render(<MarketplaceChannelsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Create Channel" }));
    fireEvent.change(screen.getByLabelText("Code"), { target: { value: "mobile" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Mobile Store" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "app" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Create Channel" })[1]);

    await waitFor(() => expect(mocks.createChannel).toHaveBeenCalledWith({
      code: "mobile",
      name: "Mobile Store",
      type: "app",
    }));
    await waitFor(() => expect(mocks.fetchChannels.mock.calls.length).toBeGreaterThan(1));
  });

  it("shows authoritative create validation errors", async () => {
    mocks.fetchChannels.mockResolvedValue(response);
    mocks.createChannel.mockRejectedValue(new Error("The code has already been taken."));
    render(<MarketplaceChannelsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Create Channel" }));
    fireEvent.change(screen.getByLabelText("Code"), { target: { value: "WEB" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Duplicate" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "storefront" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Create Channel" })[1]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The code has already been taken.",
    );
  });

  it("edits only name and type, then performs confirmed status transitions", async () => {
    mocks.fetchChannels.mockResolvedValue(response);
    mocks.updateChannel.mockResolvedValue({ channel });
    mocks.changeStatus.mockResolvedValue({ channel: { ...channel, status: "inactive" } });
    render(<MarketplaceChannelsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Code")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated Store" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "partner" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Channel" }));

    await waitFor(() => expect(mocks.updateChannel).toHaveBeenCalledWith(5, {
      name: "Updated Store",
      type: "partner",
    }));
    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(window.confirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(mocks.changeStatus).toHaveBeenCalledWith(5, "inactive"));
  });

  it("gates mutations and displays a deactivation conflict without retrying", async () => {
    const conflict = Object.assign(
      new Error("Published Marketplace listings block deactivation."),
      { status: 409 },
    );
    mocks.fetchChannels.mockResolvedValue(response);
    mocks.changeStatus.mockRejectedValue(conflict);
    render(<MarketplaceChannelsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Deactivate" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Published Marketplace listings block deactivation.",
    );
    expect(mocks.changeStatus).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mocks.fetchChannels.mock.calls.length).toBeGreaterThan(1));
    cleanup();

    mocks.fetchChannels.mockResolvedValue({
      ...response,
      capabilities: {
        ...capabilities,
        create_channel: false,
        edit_channel: false,
        change_status: false,
      },
    });
    render(<MarketplaceChannelsPage />);
    expect(await screen.findByText("Web Store")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Create Channel|Edit|Activate|Deactivate/i })).toBeNull();
  });

  it("activates an inactive Channel without a deactivation confirmation", async () => {
    mocks.fetchChannels.mockResolvedValue({
      ...response,
      channels: [{ ...channel, status: "inactive" }],
    });
    mocks.changeStatus.mockResolvedValue({
      channel: { ...channel, status: "active" },
    });
    render(<MarketplaceChannelsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Activate" }));

    await waitFor(() => expect(mocks.changeStatus).toHaveBeenCalledWith(5, "active"));
    expect(window.confirm).not.toHaveBeenCalled();
  });
});
