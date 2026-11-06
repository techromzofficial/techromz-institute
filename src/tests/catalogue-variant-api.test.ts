import { beforeEach, describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/lib/api", () => ({ api: calls }));
import { variantApi } from "@/features/admin/catalogue/api/variantApi";

const raw = { id: 3, name: "Red", status: "active", is_active: true, attribute_values: [], product: { id: 1, name: "Dress", approval_status: "pending", updated_at: "v2" } };

describe("CAT-09 Variant API adapter", () => {
  beforeEach(() => { calls.get.mockReset(); calls.post.mockReset(); calls.put.mockReset(); });

  it("uses the Admin Product Variant endpoints and sends expected Product versions", async () => {
    calls.post.mockResolvedValue({ data: raw });
    calls.put.mockResolvedValue({ data: raw });
    const input = { sku: "RED", name: "Red", variantName: null, description: null, barcode: null, status: "active", attributeValues: [{ attributeId: "4", value: false }], expectedProductUpdatedAt: "v1" };
    await variantApi.create("1", input);
    await variantApi.update("1", "3", input);
    await variantApi.setStatus("1", "3", "inactive", "v2");
    expect(calls.post).toHaveBeenNthCalledWith(1, "/admin/catalogue/products/1/variants", expect.objectContaining({ expected_product_updated_at: "v1", attribute_values: [{ attribute_id: 4, value: false }] }));
    expect(calls.put).toHaveBeenCalledWith("/admin/catalogue/products/1/variants/3", expect.objectContaining({ expected_product_updated_at: "v1" }));
    expect(calls.post).toHaveBeenNthCalledWith(2, "/admin/catalogue/products/1/variants/3/deactivate", { expected_product_updated_at: "v2" });
  });
});
