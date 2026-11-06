import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ModuleDetailWorkspace } from "@/features/admin/ecosystem-modules/detail/ModuleDetailWorkspace";
import { requestProductionEnablement } from "@/services/api/ecosystemModuleDetail";

const replace = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace, prefetch: vi.fn() }),
  usePathname: () => "/admin/ecosystem-modules/ai-beauty-advisor",
  useSearchParams: () => currentSearchParams,
}));

describe("Screen 21 - Ecosystem Module Detail & Configuration", () => {
  it("renders separated public reference, database ID, module key and category for AI Beauty Advisor", async () => {
    currentSearchParams = new URLSearchParams();
    render(<ModuleDetailWorkspace moduleKey="ai-beauty-advisor" />);

    expect(await screen.findByRole("heading", { name: "AI Beauty Advisor" })).toBeInTheDocument();
    expect(screen.getByText("MOD-2036-00009")).toBeInTheDocument();
    expect(screen.getByText("ai-beauty-advisor")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("renders all 15 required tabs and all 15 overview metrics", async () => {
    currentSearchParams = new URLSearchParams();
    render(<ModuleDetailWorkspace moduleKey="ai-beauty-advisor" />);
    await screen.findByRole("heading", { name: "AI Beauty Advisor" });

    const tabNav = screen.getByRole("navigation", { name: "Module detail sections" });
    ["Module Overview", "Configuration", "Versions & Releases", "Environments", "Dependencies", "Integrations", "Feature Flags", "Country Availability", "Access & Roles", "Security", "Compliance & Privacy", "Health & Performance", "Adoption", "Alerts", "Audit History"].forEach((label) => {
      expect(within(tabNav).getByRole("button", { name: label })).toBeInTheDocument();
    });

    ["Module Health Score", "Release Readiness", "Configuration Completeness", "Monthly Conversations", "Pilot Accounts", "Blocking Issues"].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("84/100")).toBeInTheDocument();
  });

  it("renders the eight-stage lifecycle with Pilot as the current stage", async () => {
    currentSearchParams = new URLSearchParams();
    render(<ModuleDetailWorkspace moduleKey="ai-beauty-advisor" />);
    await screen.findByRole("heading", { name: "AI Beauty Advisor" });

    ["Planned", "Design", "Development", "Internal Testing", "Pilot", "Active", "Deprecated", "Retired"].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it("switches tab content and updates the URL when a tab is clicked", async () => {
    currentSearchParams = new URLSearchParams();
    render(<ModuleDetailWorkspace moduleKey="ai-beauty-advisor" />);
    await screen.findByRole("heading", { name: "AI Beauty Advisor" });

    fireEvent.click(screen.getByRole("button", { name: "Audit History" }));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("tab=audit-history"), expect.anything());
  });

  it("never renders secret values and offers Rotate Secret instead of Edit for secret parameters", async () => {
    currentSearchParams = new URLSearchParams();
    render(<ModuleDetailWorkspace moduleKey="ai-beauty-advisor" />);
    await screen.findByRole("heading", { name: "AI Beauty Advisor" });

    expect(screen.queryByText("sk-live")).not.toBeInTheDocument();
    const secretLabels = screen.getAllByText("Secret Reference");
    expect(secretLabels.length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Rotate Secret" }).length).toBeGreaterThan(0);
  });

  it("renders a controlled not-found state for an unknown module key", async () => {
    currentSearchParams = new URLSearchParams();
    render(<ModuleDetailWorkspace moduleKey="does-not-exist" />);

    expect(await screen.findByRole("heading", { name: "Module not found" })).toBeInTheDocument();
    expect(screen.getByText(/does-not-exist/i)).toBeInTheDocument();
  });

  it("renders the permission-denied state when state=unauthorized", async () => {
    currentSearchParams = new URLSearchParams("state=unauthorized");
    render(<ModuleDetailWorkspace moduleKey="ai-beauty-advisor" />);

    expect(await screen.findByRole("heading", { name: "Permission required" })).toBeInTheDocument();
  });

  it("blocks Request Production Enablement without required approvals and evidence", async () => {
    await expect(
      requestProductionEnablement("ai-beauty-advisor", {
        reason: "",
        evidenceLink: "",
        securityApproved: false,
        complianceApproved: false,
        pilotMetricsReviewed: false,
      }),
    ).rejects.toThrow(/still missing/i);
  });

  it("accepts Request Production Enablement once every requirement is satisfied, without flipping production on immediately", async () => {
    const entry = await requestProductionEnablement("ai-beauty-advisor", {
      reason: "Pilot cohort met the release bar across all markets.",
      evidenceLink: "https://internal.slbeauty/reports/ai-advisor-pilot",
      securityApproved: true,
      complianceApproved: true,
      pilotMetricsReviewed: true,
    });

    expect(entry.action).toBe("Production enablement requested");
    expect(entry.detail).toMatch(/not enabled by this request alone/i);
  });
});

