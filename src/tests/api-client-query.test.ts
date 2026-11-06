import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("js-cookie", () => ({ default: { get: vi.fn(() => undefined), remove: vi.fn(), set: vi.fn() } }));

import { request, withQuery } from "@/lib/api/client";

describe("fetch API query serialization", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("serializes scalar, boolean, zero, and repeated array parameters into the actual URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await request("/admin/customers", {
      method: "GET",
      params: { search: "Amaya Perera", page: 0, active: false, tags: ["priority", "new"], ignored: undefined, empty: "" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/admin/customers?search=Amaya+Perera&page=0&active=false&tags=priority&tags=new"),
      expect.not.objectContaining({ params: expect.anything() }),
    );
  });

  it("does not add a question mark when all optional values are omitted", () => {
    expect(withQuery("/admin/customers", { search: "", page: null, sort: undefined })).toBe("/admin/customers");
  });
});
