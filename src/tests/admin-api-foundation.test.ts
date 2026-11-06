import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());

function response(status: number, body: object, requestId = "header-reference") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "X-Request-Id": requestId },
  });
}

describe("Admin API errors", () => {
  it.each([[401, "AUTH_REQUIRED"], [403, "FORBIDDEN"]])("normalizes %s", async (status, category) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(status as number, { message: "Denied" })));
    await expect(request("/admin/test")).rejects.toMatchObject({ status, category, referenceId: "header-reference" });
  });

  it("preserves validation errors and body reference IDs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(422, {
      message: "Invalid input",
      errors: { reason: ["A reason is required."] },
      reference_id: "body-reference",
    })));
    await expect(request("/admin/test")).rejects.toMatchObject({
      status: 422,
      category: "VALIDATION_ERROR",
      errors: { reason: ["A reason is required."] },
      referenceId: "body-reference",
    });
  });

  it("normalizes network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(request("/admin/test")).rejects.toEqual(expect.objectContaining({ category: "NETWORK_FAILURE" }));
  });
});
