import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EcosystemModulesDashboard } from "@/features/admin/ecosystem-modules/EcosystemModulesDashboard";
import {
  fetchEcosystemModuleByKey,
  fetchEcosystemModules,
} from "@/services/api/ecosystemModules";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/admin/ecosystem-modules",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => { throw new Error("404 Not Found"); },
}));

describe("Screen 20 - Ecosystem Modules Management", () => {
  it("keeps module identifiers distinct and resolves moduleKey routes", async () => {
    const result = await fetchEcosystemModules({ search: "B2C Marketplace" });
    const registeredModule = result.data[0];

    expect(registeredModule.publicReference).toBe("MOD-2036-00001");
    expect(registeredModule.databaseModuleId).toBe(1);
    expect(registeredModule.moduleKey).toBe("b2c-marketplace");
    expect(await fetchEcosystemModuleByKey(registeredModule.moduleKey)).toMatchObject({
      id: registeredModule.id,
      publicReference: registeredModule.publicReference,
    });
  });

  it("filters the registry through a named portfolio KPI", async () => {
    const result = await fetchEcosystemModules({ metric: "blocked" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].releaseStatus).toBe("Blocked");
  });

  it("renders the required dashboard controls and module navigation", async () => {
    render(<EcosystemModulesDashboard />);

    await waitFor(() => expect(screen.getByText("Total Registered Modules")).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: /Register Module/i })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Export Module Report/i })).toHaveLength(2);
    expect(screen.getByText("Module Portfolio Health Summary")).toBeInTheDocument();
    expect(screen.getByText("Module Registry")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open Module" })[0]).toHaveAttribute(
      "href",
      expect.stringContaining("/admin/ecosystem-modules/"),
    );
  });

  it("opens the controlled registration workflow without a production toggle", async () => {
    render(<EcosystemModulesDashboard />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Register Module/i })).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: /Register Module/i })[0]);
    expect(screen.getByRole("heading", { name: "Register module" })).toBeInTheDocument();
    expect(screen.getByText(/Production enablement requires a separate approved workflow/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Production Enabled/i)).not.toBeInTheDocument();
  });
});

