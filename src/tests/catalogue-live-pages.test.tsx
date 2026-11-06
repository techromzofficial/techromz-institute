import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CataloguePage from "@/app/admin/catalogue/page";
import ProductsPage from "@/app/admin/catalogue/products/page";
import ProductDetailPage from "@/app/admin/catalogue/products/[productId]/page";
import { AdminContextProvider } from "@/contexts/AdminContext";

const { get, routeParams } = vi.hoisted(() => ({
  get: vi.fn(),
  routeParams: { productId: "1" },
}));

vi.mock("@/lib/api", () => ({
  api: { get },
  withQuery: (path: string, params: Record<string, unknown>) => {
    const q = new URLSearchParams();

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        q.set(k, String(v));
      }
    });

    return `${path}?${q}`;
  },
}));

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/catalogue/products",
  useParams: () => routeParams,
}));

const context = {
  data: {
    ecosystem: { id: "e", name: "Retail" },
    tenant: { id: "t", name: "Tenant" },
    business_unit: null,
    channel: null,
    sector_pack: null,
    permissions: ["catalogue.view", "products.view"],
    correlation_id: "ctx",
  },
};

const product = {
  id: 1,
  sku: "SKU-1",
  name: "Live Serum",
  status: "active",
  approval_status: "pending",
  category: {
    id: 2,
    name: "Skin",
  },
  supplier_summary: {
    id: 3,
    name: "Supplier",
  },
  publication_summary: {
    state: "unpublished",
  },
  completeness: {
    percentage: 80,
    missing_fields: ["image"],
  },
  updated_at: "2026-08-01T00:00:00Z",
};

const wrap = (node: React.ReactNode) =>
  render(<AdminContextProvider>{node}</AdminContextProvider>);

beforeEach(() => {
  get.mockReset();
  replace.mockReset();
  routeParams.productId = "1";
});

describe("CAT-03 live Catalogue pages", () => {
  it("renders live command-center values and unavailable readiness", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.resolve({
            data: {
              metrics: [
                {
                  id: "total",
                  label: "Products",
                  value: 12,
                  availability: "available",
                },
              ],
              readiness: [
                {
                  id: "ready",
                  label: "Ready",
                  value: null,
                  availability: "unavailable",
                },
              ],
              approval_queue: {
                total: 3,
              },
              inventory: {
                low_stock: 2,
              },
              recent_activity: [],
            },
          }),
    );

    wrap(<CataloguePage />);

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText(/not yet calculated/i)).toBeInTheDocument();
  });

  it("renders errors with reference IDs", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.reject(
            Object.assign(new Error("Unavailable"), {
              status: 500,
              referenceId: "req-500",
            }),
          ),
    );

    wrap(<CataloguePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unavailable");
    expect(screen.getByRole("note")).toHaveTextContent("req-500");
  });

  it("renders products, linked pagination, filters, and empty state", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.resolve({
            data: [product],
            current_page: 1,
            per_page: 1,
            total: 2,
          }),
    );

    wrap(<ProductsPage />);

    expect(await screen.findByText("Live Serum")).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Next",
      }),
    ).toHaveAttribute("href", expect.stringContaining("page=2"));

    fireEvent.change(screen.getByLabelText("Product status"), {
      target: {
        value: "active",
      },
    });

    expect(replace).toHaveBeenCalledWith(
      expect.stringContaining("status=active"),
    );
  });

  it("renders the product empty state", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.resolve({
            data: [],
            current_page: 1,
            per_page: 20,
            total: 0,
          }),
    );

    wrap(<ProductsPage />);

    expect(await screen.findByText("No products found")).toBeInTheDocument();
  });

  it("renders authoritative Supplier and Inventory summaries without Beauty-only UI", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.resolve({
            data: {
              ...product,
              variants: [],
              audit_history: {
                entity_id: 1,
              },
              inventory: {
                product_id: 1,
                status: "available",
                available_quantity: 4,
              },
              sector: null,
            },
          }),
    );

    wrap(<ProductDetailPage params={{ productId: "1" }} />);

    expect(
      await screen.findByText("3. Brand & Supplier"),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Supplier").length).toBeGreaterThan(0);

    expect(
      screen.getByText("6. Inventory Summary"),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("beauty-capabilities"),
    ).not.toBeInTheDocument();
  });

  it("loads the product identified by the dynamic route parameter", async () => {
    routeParams.productId = "route-product-17";
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.resolve({
            data: {
              ...product,
              id: 17,
              name: "Route-selected Product",
              variants: [],
              audit_history: { entity_id: 17 },
              sector: null,
            },
          }),
    );

    wrap(<ProductDetailPage />);

    expect(
      (await screen.findAllByText("Route-selected Product")).length,
    ).toBeGreaterThan(0);
    expect(get).toHaveBeenCalledWith("/admin/products/route-product-17");
  });

  it("does not fabricate Beauty-specific Product data from sector capabilities", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.resolve({
            data: {
              ...product,
              variants: [],
              audit_history: {
                entity_id: 1,
              },
              sector: {
                sector_pack_id: "beauty",
                capabilities: ["cosmetic_safety"],
              },
            },
          }),
    );

    wrap(<ProductDetailPage params={{ productId: "1" }} />);

    expect((await screen.findAllByText("Live Serum")).length).toBeGreaterThan(0);
    
    expect(
      screen.queryByTestId("beauty-capabilities"),
    ).not.toBeInTheDocument();
  });

  it("renders a controlled 404", async () => {
    get.mockImplementation((url: string) =>
      url === "/internal/tenant-context"
        ? Promise.resolve(context)
        : Promise.reject(
            Object.assign(new Error("Missing"), {
              status: 404,
            }),
          ),
    );

    wrap(<ProductDetailPage params={{ productId: "404" }} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Product not found",
    );
  });
});
