import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminContextError, AdminContextProvider, useAdminContext } from "@/contexts/AdminContext";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/api", () => ({ api: { get } }));

const trustedContext = {
  data: {
    ecosystem: { id: "eco-1", code: "retail", name: "Retail" },
    tenant: { id: "tenant-1", slug: "store", name: "Store" },
    business_unit: null,
    channel: { id: "channel-1", code: "web", name: "Web", type: "web" },
    sector_pack: { id: "beauty", version: "1.0.0", name: "Beauty", capabilities: [] },
    permissions: ["catalogue.products.approve"],
    correlation_id: "request-1",
  },
};

function ContextSummary() {
  const context = useAdminContext();
  return <span>{context.tenant.name} / {context.channel?.name}</span>;
}

describe("Admin foundation", () => {
  beforeEach(() => get.mockReset());

  it("loads the trusted Admin context", async () => {
    get.mockResolvedValue(trustedContext);
    render(<AdminContextProvider><ContextSummary /></AdminContextProvider>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("Store / Web")).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/internal/tenant-context");
  });

  it("surfaces context loading failures", async () => {
    render(<AdminContextError referenceId="ref-123" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load administrator context");
    expect(screen.getByRole("alert")).toHaveTextContent("Reference: ref-123");
  });

  it("renders allowed and hides denied permission content", async () => {
    get.mockResolvedValue(trustedContext);
    render(<AdminContextProvider>
      <PermissionGuard permission="catalogue.products.approve"><button>Approve</button></PermissionGuard>
      <PermissionGuard permission="catalogue.products.delete"><button>Delete</button></PermissionGuard>
    </AdminContextProvider>);
    expect(await screen.findByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("can disable a denied action", async () => {
    get.mockResolvedValue(trustedContext);
    render(<AdminContextProvider><PermissionGuard permission="missing" mode="disable"><button>Restricted</button></PermissionGuard></AdminContextProvider>);
    expect(await screen.findByRole("button", { name: "Restricted" })).toBeDisabled();
  });
});
