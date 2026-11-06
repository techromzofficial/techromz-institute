import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchViolations: vi.fn(),
  fetchViolation: vi.fn(),
  transitionViolation: vi.fn(),
  appealViolation: vi.fn(),
  emergencyPauseViolation: vi.fn(),
  push: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
  useParams: () => ({ violationId: "violation-12" }),
}));

vi.mock("@/lib/api/marketplace", () => ({
  fetchMarketplacePolicyViolations: mocks.fetchViolations,
  fetchMarketplacePolicyViolation: mocks.fetchViolation,
  transitionMarketplacePolicyViolation: mocks.transitionViolation,
  appealMarketplacePolicyViolation: mocks.appealViolation,
  emergencyPauseMarketplacePolicyViolation: mocks.emergencyPauseViolation,
}));

import MarketplacePolicyViolationDetailPage from "@/app/admin/marketplace/policy-violations/[violationId]/page";
import MarketplacePolicyViolationsPage from "@/app/admin/marketplace/policy-violations/page";

const violation = {
  id: 12,
  uuid: "violation-12",
  policy_code: "CATALOGUE-001",
  title: "Restricted product claim",
  description: "A real governance case description.",
  severity: "critical",
  status: "open",
  detected_at: "2026-09-10T10:00:00Z",
  resolved_at: null,
  created_at: "2026-09-10T10:01:00Z",
  updated_at: "2026-09-10T11:00:00Z",
  supplier: { id: 7, company_name: "Real Supplier", status: "active", verification_status: "verified" },
  product: { id: 8, name: "Real Product", sku: "REAL-8", status: "active" },
  channel: { id: 9, code: "WEB", name: "Web Store", type: "storefront", status: "active" },
};

const listResponse = {
  summary: {
    total_violations: 1,
    open_violations: 1,
    under_review_violations: 0,
    resolved_violations: 0,
    critical_violations: 1,
    status_counts: { open: 1 },
    severity_counts: { critical: 1 },
  },
  violations: [violation],
  filters: { statuses: ["open", "under_review", "resolved", "dismissed"], severities: ["low", "medium", "high", "critical"] },
  pagination: { current_page: 2, per_page: 20, total: 21, last_page: 2, from: 21, to: 21 },
  capabilities: { read: true, create_violation: false, edit_violation: false, assign_violation: false, review_violation: true, resolve_violation: true, dismiss_violation: true, suspend_supplier: false, disable_product: false, export: false },
};

const detailResponse = {
  violation,
  capabilities: { read: true, review: true, resolve: true, dismiss: true, suspend_supplier: false, disable_product: false, export: false },
};

describe("Marketplace Policy Violations", () => {
  beforeEach(() => {
    mocks.fetchViolations.mockReset();
    mocks.fetchViolation.mockReset();
    mocks.transitionViolation.mockReset();
    mocks.push.mockReset();
    mocks.query = "";
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("uses the typed list client and renders real summaries, zeroes, projections, and detail navigation", async () => {
    mocks.fetchViolations.mockResolvedValue(listResponse);
    render(<MarketplacePolicyViolationsPage />);

    expect(screen.getByText("Loading Marketplace policy violations…")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Restricted product claim" })).toHaveAttribute(
      "href",
      "/admin/marketplace/policy-violations/violation-12",
    );
    expect(mocks.fetchViolations).toHaveBeenCalledWith(
      { q: undefined, status: undefined, severity: undefined, page: 1, per_page: 20 },
      expect.any(AbortSignal),
    );
    expect(screen.getByText("Under Review", { selector: "p" }).parentElement).toHaveTextContent("0");
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getByText("Real Product")).toBeInTheDocument();
    expect(screen.getByText("Web Store")).toBeInTheDocument();
    expect(screen.queryByText(/Create Violation|Export|Enforce|Appeal|Reopen/)).toBeNull();
  });

  it("maps search, filters, and pagination to the authoritative client", async () => {
    mocks.query = "search=claim&status=open&severity=critical&page=2";
    mocks.fetchViolations.mockResolvedValue(listResponse);
    render(<MarketplacePolicyViolationsPage />);

    await waitFor(() => expect(mocks.fetchViolations).toHaveBeenCalledWith(
      { q: "claim", status: "open", severity: "critical", page: 2, per_page: 20 },
      expect.any(AbortSignal),
    ));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("preserves list errors and explicit retry", async () => {
    mocks.fetchViolations.mockRejectedValueOnce(new Error("Policy API unavailable"));
    mocks.fetchViolations.mockResolvedValueOnce(listResponse);
    render(<MarketplacePolicyViolationsPage />);

    expect(await screen.findByText("Policy API unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Restricted product claim")).toBeInTheDocument();
    expect(mocks.fetchViolations).toHaveBeenCalledTimes(2);
  });

  it("renders authoritative detail and gates exact transitions by detail capabilities", async () => {
    mocks.fetchViolation.mockResolvedValue(detailResponse);
    mocks.transitionViolation.mockResolvedValue({ message: "ok", violation });
    render(<MarketplacePolicyViolationDetailPage />);

    expect(await screen.findByText("A real governance case description.")).toBeInTheDocument();
    expect(screen.getByText("CATALOGUE-001")).toBeInTheDocument();
    expect(screen.getByText("Real Supplier")).toBeInTheDocument();
    expect(screen.getByText("Real Product")).toBeInTheDocument();
    expect(screen.getByText("Web Store")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    await waitFor(() => expect(mocks.transitionViolation).toHaveBeenCalledWith("violation-12", "review"));
    expect(window.confirm).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.fetchViolation).toHaveBeenCalledTimes(2));
  });

  it.each(["resolve", "dismiss"] as const)("confirms and sends the exact %s transition once", async (action) => {
    mocks.fetchViolation.mockResolvedValue(detailResponse);
    mocks.transitionViolation.mockRejectedValue(new Error("Transition rejected"));
    render(<MarketplacePolicyViolationDetailPage />);

    fireEvent.click(await screen.findByRole("button", { name: new RegExp(`^${action}$`, "i") }));
    await waitFor(() => expect(mocks.transitionViolation).toHaveBeenCalledWith("violation-12", action));
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Transition rejected")).toBeInTheDocument();
    expect(mocks.transitionViolation).toHaveBeenCalledTimes(1);
  });

  it.each(["resolved", "dismissed"])("shows honest null projections and no actions for a %s case", async (status) => {
    mocks.fetchViolation.mockResolvedValue({
      violation: { ...violation, status, description: null, resolved_at: null, supplier: null, product: null, channel: null },
      capabilities: { ...detailResponse.capabilities, review: false, resolve: false, dismiss: false },
    });
    render(<MarketplacePolicyViolationDetailPage />);

    expect(await screen.findByText("No description recorded.")).toBeInTheDocument();
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("No workflow actions are available.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Review|Resolve|Dismiss/ })).toBeNull();
    expect(mocks.transitionViolation).not.toHaveBeenCalled();
  });

  it("submits seller appeal and applies emergency pause when permitted", async () => {
    const violationWithActions = {
      ...violation,
      seller_appeal_text: "Original supplier appeal",
      seller_appeal_at: "2026-09-11T10:00:00Z",
      appeal_status: "pending",
      action_taken: "listing_paused",
    };
    mocks.fetchViolation.mockResolvedValue({
      violation: violationWithActions,
      capabilities: {
        ...detailResponse.capabilities,
        appeal: true,
        emergency_pause: true,
      },
    });
    mocks.appealViolation.mockResolvedValue({
      message: "Seller appeal submitted successfully.",
      violation: {
        ...violationWithActions,
        seller_appeal_text: "New appeal explanation",
      },
    });

    render(<MarketplacePolicyViolationDetailPage />);

    expect(await screen.findByText("Original supplier appeal")).toBeInTheDocument();
    expect(screen.getByText(/Sanction Action Applied: Listing Paused/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Record seller's justification, licensing documentation, or appeal notes...");
    fireEvent.change(textarea, { target: { value: "New appeal explanation" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit Appeal" }));

    await waitFor(() => {
      expect(mocks.appealViolation).toHaveBeenCalledWith("violation-12", "New appeal explanation");
    });
  });
});
