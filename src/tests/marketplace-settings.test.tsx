import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetchSettings: vi.fn(), updateSettings: vi.fn() }));
vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplaceSettings: mocks.fetchSettings,
  updateMarketplaceSettings: mocks.updateSettings,
}));

import MarketplaceSettingsPage from "@/app/admin/marketplace/settings/page";

const existing = {
  settings: { return_window_days: 30, version: 4, created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-10T10:00:00Z" },
  capabilities: { can_update: true },
};

describe("Marketplace Settings", () => {
  beforeEach(() => { mocks.fetchSettings.mockReset(); mocks.updateSettings.mockReset(); });
  afterEach(() => cleanup());

  it("uses the authoritative read client with cancellation and renders existing settings", async () => {
    mocks.fetchSettings.mockResolvedValue(existing);
    const view = render(<MarketplaceSettingsPage />);
    expect(screen.getByText("Loading Marketplace settings…")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    const signal = mocks.fetchSettings.mock.calls[0][0] as AbortSignal;
    expect(signal.aborted).toBe(false);
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("preserves read errors, retry, and refresh", async () => {
    mocks.fetchSettings.mockRejectedValueOnce(new Error("Settings unavailable"));
    mocks.fetchSettings.mockResolvedValue(existing);
    render(<MarketplaceSettingsPage />);
    expect(await screen.findByText("Settings unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByDisplayValue("30")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(mocks.fetchSettings).toHaveBeenCalledTimes(3));
  });

  it("supports first configuration with certified version zero and exact payload", async () => {
    mocks.fetchSettings.mockResolvedValue({ settings: null, capabilities: { can_update: true } });
    mocks.updateSettings.mockResolvedValue({ ...existing, settings: { ...existing.settings, version: 1, return_window_days: 14 } });
    render(<MarketplaceSettingsPage />);
    expect(await screen.findByText("Marketplace settings have not yet been configured.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Return Window (Days)"), { target: { value: "14" } });
    fireEvent.change(screen.getByLabelText("Change Reason"), { target: { value: "Initial return policy" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }));
    await waitFor(() => expect(mocks.updateSettings).toHaveBeenCalledWith({ return_window_days: 14, version: 0, reason: "Initial return policy" }));
    expect(screen.getByText("Marketplace settings saved.")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByLabelText("Change Reason")).toHaveValue("");
  });

  it("sends the unchanged authoritative version and waits for the response version", async () => {
    let resolveUpdate!: (value: typeof existing) => void;
    mocks.fetchSettings.mockResolvedValue(existing);
    mocks.updateSettings.mockReturnValue(new Promise((resolve) => { resolveUpdate = resolve; }));
    render(<MarketplaceSettingsPage />);
    await screen.findByDisplayValue("30");
    fireEvent.change(screen.getByLabelText("Return Window (Days)"), { target: { value: "45" } });
    fireEvent.change(screen.getByLabelText("Change Reason"), { target: { value: "Customer policy review" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }));
    expect(mocks.updateSettings).toHaveBeenCalledWith({ return_window_days: 45, version: 4, reason: "Customer policy review" });
    expect(screen.getByText("4")).toBeInTheDocument();
    resolveUpdate({ ...existing, settings: { ...existing.settings, return_window_days: 45, version: 5 } });
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it.each([
    ["0", "Valid reason", "Return Window must be a whole number between 1 and 365 days."],
    ["366", "Valid reason", "Return Window must be a whole number between 1 and 365 days."],
    ["2.5", "Valid reason", "Return Window must be a whole number between 1 and 365 days."],
    ["30", "bad", "Change Reason must be between 5 and 2000 characters."],
  ])("validates days %s and reason", async (days, reason, expected) => {
    mocks.fetchSettings.mockResolvedValue(existing);
    render(<MarketplaceSettingsPage />);
    await screen.findByDisplayValue("30");
    fireEvent.change(screen.getByLabelText("Return Window (Days)"), { target: { value: days } });
    fireEvent.change(screen.getByLabelText("Change Reason"), { target: { value: reason } });
    fireEvent.submit(screen.getByRole("button", { name: "Save Settings" }).closest("form")!);
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(mocks.updateSettings).not.toHaveBeenCalled();
  });

  it("remains readable and cannot mutate when can_update is false", async () => {
    mocks.fetchSettings.mockResolvedValue({ ...existing, capabilities: { can_update: false } });
    render(<MarketplaceSettingsPage />);
    expect(await screen.findByDisplayValue("30")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save Settings" })).toBeNull();
    expect(mocks.updateSettings).not.toHaveBeenCalled();
  });

  it("handles a 409 by refetching without retrying the mutation", async () => {
    mocks.fetchSettings.mockResolvedValueOnce(existing).mockResolvedValueOnce({ ...existing, settings: { ...existing.settings, version: 5, return_window_days: 60 } });
    mocks.updateSettings.mockRejectedValue(Object.assign(new Error("Conflict"), { status: 409 }));
    render(<MarketplaceSettingsPage />);
    await screen.findByDisplayValue("30");
    fireEvent.change(screen.getByLabelText("Change Reason"), { target: { value: "Concurrent policy update" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }));
    expect(await screen.findByText(/changed elsewhere/)).toBeInTheDocument();
    expect(await screen.findByDisplayValue("60")).toBeInTheDocument();
    expect(mocks.fetchSettings).toHaveBeenCalledTimes(2);
    expect(mocks.updateSettings).toHaveBeenCalledTimes(1);
  });

  it("contains only the certified setting and no unsupported lifecycle controls", async () => {
    mocks.fetchSettings.mockResolvedValue(existing);
    render(<MarketplaceSettingsPage />);
    await screen.findByDisplayValue("30");
    expect(screen.queryByText(/commission|Save Draft|Publish Settings|Settings History|tenant_id/i)).toBeNull();
    expect(screen.getByText(/Logistics owns physical return movement/)).toBeInTheDocument();
  });
});
