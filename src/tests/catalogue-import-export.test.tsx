import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CatalogueImportExportPage from "@/app/admin/catalogue/import-export/page";
import { AdminContextProvider } from "@/contexts/AdminContext";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  download: vi.fn(),
  uploadDocument: vi.fn(),
  replace: vi.fn(),
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/catalogue/import-export",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

vi.mock("@/lib/api", () => ({
  api: { get: mocks.get, post: mocks.post, download: mocks.download },
  uploadApi: { uploadDocument: mocks.uploadDocument },
  withQuery: (path: string, params: Record<string, unknown>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && query.set(key, String(value)));
    return `${path}${query.size ? `?${query}` : ""}`;
  },
}));

const adminContext = (permissions = ["catalogue.import", "catalogue.export"]) => ({
  data: {
    ecosystem: { id: "e", name: "Retail" },
    tenant: { id: "t", name: "Tenant" },
    business_unit: null,
    channel: null,
    sector_pack: null,
    permissions,
    correlation_id: "ctx",
  },
});
const counts = { total_rows: 2, valid_rows: 1, invalid_rows: 1, create_rows: 0, update_rows: 1, unchanged_rows: 0, applied_rows: 0, failed_rows: 0 };
const job = { id: 7, uuid: "job", status: "invalid", checksum: "a".repeat(64), counts, summary: null, file: { id: 3, name: "products.csv" }, created_by: { id: 1, name: "Admin" }, created_at: "2026-08-15T00:00:00Z", completed_at: null, capabilities: { apply: false } };

function renderPage() {
  return render(<AdminContextProvider><CatalogueImportExportPage /></AdminContextProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = "";
  mocks.get.mockImplementation((url: string) => url === "/internal/tenant-context" ? Promise.resolve(adminContext()) : Promise.resolve({ data: [], current_page: 1, last_page: 1, total: 0 }));
});

describe("CAT-08 Catalogue import/export", () => {
  it("keeps export usable without making import requests for an export-only actor", async () => {
    mocks.get.mockImplementation((url: string) => url === "/internal/tenant-context"
      ? Promise.resolve(adminContext(["catalogue.export"]))
      : Promise.reject(new Error(`Unexpected request: ${url}`)));
    mocks.download.mockResolvedValue(new Blob(["csv"]));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    renderPage();

    const exportButton = await screen.findByRole("button", { name: "Download Product CSV" });
    expect(screen.queryByLabelText("Product CSV")).not.toBeInTheDocument();
    expect(mocks.get.mock.calls.every(([url]) => !String(url).startsWith("/admin/catalogue/imports"))).toBe(true);
    fireEvent.click(exportButton);
    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith("/admin/catalogue/exports/products"));
  });

  it("loads URL-selected import detail and maps history/error pagination independently", async () => {
    mocks.search = "page=2&import=7&errors_page=2";
    const selected = { ...job, status: "ready", capabilities: { apply: true }, errors: [{ id: 9, row_number: 3, error_field: "sku", error_code: "invalid_sku", error_message: "Invalid SKU." }], errors_page: 2, errors_last_page: 3 };
    mocks.get.mockImplementation((url: string) => {
      if (url === "/internal/tenant-context") return Promise.resolve(adminContext(["catalogue.import"]));
      if (url === "/admin/catalogue/imports?page=2") return Promise.resolve({ data: [job], current_page: 2, last_page: 3, total: 3, analytics: { status_distribution: [{ status: "invalid", count: 1 }], trend: [{ date: "2026-09-10", jobs: 1, records: 2, applied: 0, rejected: 1 }] } });
      if (url === "/admin/catalogue/imports/7?page=2") return Promise.resolve({ data: selected });
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    renderPage();

    expect(await screen.findByText("invalid_sku")).toBeInTheDocument();
    expect(screen.getByTestId("import-operations-trend")).toBeInTheDocument();
    expect(screen.getByTestId("import-status-distribution")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply Validated Updates" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open import" })).toHaveAttribute("href", expect.stringContaining("import=7"));
    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledWith("/admin/catalogue/imports?page=2");
      expect(mocks.get).toHaveBeenCalledWith("/admin/catalogue/imports/7?page=2");
    });
    const previousLinks = screen.getAllByRole("link", { name: "Previous" });
    const nextLinks = screen.getAllByRole("link", { name: "Next" });
    expect(previousLinks.some((link) => link.getAttribute("href")?.includes("page=1"))).toBe(true);
    expect(nextLinks.some((link) => link.getAttribute("href")?.includes("page=3"))).toBe(true);
    expect(previousLinks.some((link) => link.getAttribute("href")?.includes("errors_page=1"))).toBe(true);
    expect(nextLinks.some((link) => link.getAttribute("href")?.includes("errors_page=3"))).toBe(true);
  });

  it("uses the Upload API, dry-runs with upload_id only, and renders row errors", async () => {
    mocks.uploadDocument.mockResolvedValue({ id: 3 });
    mocks.post.mockResolvedValue({ data: job });
    mocks.get.mockImplementation((url: string) => {
      if (url === "/internal/tenant-context") return Promise.resolve(adminContext());
      if (url === "/admin/catalogue/imports/7?page=1") return Promise.resolve({ data: { ...job, errors: [{ id: 9, row_number: 3, error_field: "sku", error_code: "create_ownership_unsupported", error_message: "Create is unsupported." }], errors_page: 1, errors_last_page: 1 } });
      return Promise.resolve({ data: [], current_page: 1, last_page: 1, total: 0 });
    });
    renderPage();
    const file = new File(["sku,name\nNEW,New"], "products.csv", { type: "text/csv" });
    fireEvent.change(await screen.findByLabelText("Product CSV"), { target: { files: [file] } });
    const validateButton = screen.getByRole("button", { name: "Upload and Validate" });
    await waitFor(() => expect(validateButton).toBeEnabled());
    fireEvent.submit(validateButton.closest("form")!);

    await waitFor(() => expect(mocks.uploadDocument).toHaveBeenCalledWith(file, "catalogue_import"));
    expect(mocks.post).toHaveBeenCalledWith("/admin/catalogue/imports/products", { upload_id: 3 });
    expect(mocks.post.mock.calls[0][1]).not.toHaveProperty("file_path");
    expect(await screen.findByText("create_ownership_unsupported")).toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledWith("/admin/catalogue/import-export?import=7");
    expect(screen.queryByRole("button", { name: "Apply Validated Updates" })).not.toBeInTheDocument();
  });

  it("applies explicitly, refreshes selected detail/history, and uses authenticated downloads", async () => {
    const ready = { ...job, status: "ready", counts: { ...counts, invalid_rows: 0 }, capabilities: { apply: true } };
    mocks.uploadDocument.mockResolvedValue({ id: 3 });
    mocks.post.mockImplementation((url: string) => Promise.resolve({ data: url.endsWith("/apply") ? { ...ready, status: "completed" } : ready }));
    mocks.get.mockImplementation((url: string) => {
      if (url === "/internal/tenant-context") return Promise.resolve(adminContext());
      if (url === "/admin/catalogue/imports/7?page=1") return Promise.resolve({ data: { ...ready, errors: [], errors_page: 1, errors_last_page: 1 } });
      return Promise.resolve({ data: [], current_page: 1, last_page: 1, total: 0 });
    });
    mocks.download.mockResolvedValue(new Blob(["csv"]));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    renderPage();

    fireEvent.change(await screen.findByLabelText("Product CSV"), { target: { files: [new File(["sku"], "products.csv", { type: "text/csv" })] } });
    const validateButton = screen.getByRole("button", { name: "Upload and Validate" });
    await waitFor(() => expect(validateButton).toBeEnabled());
    fireEvent.submit(validateButton.closest("form")!);
    fireEvent.click(await screen.findByRole("button", { name: "Apply Validated Updates" }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith("/admin/catalogue/imports/7/apply", { expected_checksum: ready.checksum }));
    expect(mocks.get.mock.calls.filter(([url]) => url === "/admin/catalogue/imports/7?page=1").length).toBeGreaterThanOrEqual(2);
    expect(mocks.replace).toHaveBeenLastCalledWith("/admin/catalogue/import-export?import=7");

    fireEvent.click(screen.getByRole("button", { name: "Download CSV Template" }));
    fireEvent.click(screen.getByRole("button", { name: "Download Product CSV" }));
    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith("/admin/catalogue/imports/products/template"));
    expect(mocks.download).toHaveBeenCalledWith("/admin/catalogue/exports/products");
  });
});
