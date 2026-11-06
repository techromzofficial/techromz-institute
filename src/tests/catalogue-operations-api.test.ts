import { beforeEach, describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/api", () => ({ api: calls, withQuery: (path: string) => path }));

import { inventoryApi, mediaApi } from "@/features/admin/catalogue/api/operationsApi";

const batch = { data: { id: 2, lot_number: "123", status: "active", stock: {}, locations: [], movements: [] } };

describe("Catalogue operations API", () => {
  beforeEach(() => calls.get.mockReset());

  it("uses explicit batch ID and lot-number routes", async () => {
    calls.get.mockResolvedValue(batch);
    await inventoryApi.batch("123");
    await inventoryApi.batchByLot("123");
    expect(calls.get).toHaveBeenNthCalledWith(1, "/admin/catalogue/inventory/batches/123");
    expect(calls.get).toHaveBeenNthCalledWith(2, "/admin/catalogue/inventory/batches/by-lot/123");
  });

  it("preserves existing nonnumeric lot-number links", async () => {
    calls.get.mockResolvedValue(batch);
    await inventoryApi.batch("LOT-123");
    expect(calls.get).toHaveBeenCalledWith("/admin/catalogue/inventory/batches/by-lot/LOT-123");
  });

  it("preserves public and protected media delivery metadata", async () => {
    calls.get.mockResolvedValue({ data: [
      { id: "public", upload_id: 1, entity_type: "product", role: "gallery", name: "public.png", access: "public", url: "/storage/public.png" },
      { id: "private", upload_id: 2, entity_type: "product", role: "gallery", name: "private.png", access: "protected", url: null, protected_url: "/admin/catalogue/media/uploads/2/content" },
    ], capabilities: { upload_and_attach_product: false } });
    const result = await mediaApi.list();
    expect(result.data[0]).toMatchObject({ access: "public", url: "/storage/public.png", protectedUrl: null });
    expect(result.data[1]).toMatchObject({ access: "protected", url: null, protectedUrl: "/admin/catalogue/media/uploads/2/content" });
    expect(result.capabilities.uploadAndAttachProduct).toBe(false);
  });
});
