import { afterEach, describe, expect, it, vi } from "vitest";

describe("Admin live data source", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not replace a live API failure with mock records", async () => {
    const { listAdminData, useAdminMocks } = await import("@/services/api/adminDataSource");
    expect(useAdminMocks).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(listAdminData("products")).rejects.toMatchObject({ category: "NETWORK_FAILURE" });
  });
});
