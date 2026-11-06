import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({ api }));

import { customerApi } from "@/lib/api/customers";

const uuid = "11111111-1111-4111-8111-111111111111";
const childUuid = "22222222-2222-4222-8222-222222222222";

const customer = {
  uuid,
  name: "Canonical Customer",
  email: "customer@example.test",
  phone: "+94770000000",
  company_name: "Canonical Co",
  country: "LK",
  lifecycle_state: "active",
  previous_lifecycle_state: null,
  lifecycle_version: 1,
  lifecycle_changed_at: null,
  membership: { status: "active", role: "buyer" },
  created_at: "2026-09-11T00:00:00Z",
  updated_at: "2026-09-11T00:00:00Z",
};

describe("canonical Customer API client", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the command center and directory without dashboard or 360 endpoints", async () => {
    api.get
      .mockResolvedValueOnce({ data: { total: 1, active: 1, suspended: 0, locked: 0, disabled: 0, anonymized: 0, recently_created: 1, recently_updated: 1, recent_period_days: 30, recent_since: "2026-08-12T00:00:00Z" } })
      .mockResolvedValueOnce({ data: [customer], meta: { current_page: 1, per_page: 25, total: 1, last_page: 1 } });

    const result = await customerApi.getCommandCenterDashboard();

    expect(api.get).toHaveBeenNthCalledWith(1, "/admin/customers/command-center");
    expect(api.get).toHaveBeenNthCalledWith(2, "/admin/customers", { params: expect.any(Object) });
    expect(result.customers[0].id).toBe(uuid);
    expect(result.customers[0]).not.toHaveProperty("databaseId");
  });

  it("uses UUID detail, POST create, and PATCH-only edit with canonical payloads", async () => {
    api.get.mockResolvedValue({ data: customer });
    api.post.mockResolvedValue({ data: customer });
    api.patch.mockResolvedValue({ data: customer });

    expect((await customerApi.getCustomerDetail(uuid)).profile.id).toBe(uuid);
    await customerApi.createCustomer({ name: customer.name, email: customer.email, companyName: customer.company_name, country: customer.country });
    await customerApi.updateCustomer(uuid, { companyName: "Updated", country: "AU", expectedUpdatedAt: customer.updated_at });

    expect(api.get).toHaveBeenCalledWith(`/admin/customers/${uuid}`);
    expect(api.post).toHaveBeenCalledWith("/admin/customers", expect.objectContaining({ company_name: "Canonical Co" }));
    expect(api.patch).toHaveBeenCalledWith(`/admin/customers/${uuid}`, { company_name: "Updated", country: "AU", expected_updated_at: customer.updated_at });
  });

  it("maps every supported Customer subresource to the certified UUID routes", async () => {
    api.get.mockResolvedValue({ data: [], meta: { current_page: 1, per_page: 25, total: 0, last_page: 1 } });
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });

    await customerApi.transitionLifecycle(uuid, { target_state: "suspended", reason: "Review", expected_version: 1 });
    await customerApi.getAddresses(uuid);
    await customerApi.createAddress(uuid, {});
    await customerApi.updateAddress(uuid, childUuid, {});
    await customerApi.deleteAddress(uuid, childUuid);
    await customerApi.setDefaultAddress(uuid, childUuid, "shipping");
    await customerApi.getPreferences(uuid);
    await customerApi.updatePreferences(uuid, { preferred_language: "en" });
    await customerApi.getTags(uuid);
    await customerApi.addTag(uuid, "Priority");
    await customerApi.removeTag(uuid, childUuid);
    await customerApi.getConsents(uuid);
    await customerApi.createConsent(uuid, {});
    await customerApi.withdrawConsent(uuid, childUuid, "Withdrawn by customer");
    await customerApi.getPrivacyRequests(uuid);
    await customerApi.createPrivacyRequest(uuid, {});
    await customerApi.updatePrivacyRequest(uuid, childUuid, {});
    await customerApi.getOrders(uuid);
    await customerApi.getActivity(uuid);
    await customerApi.getAudit(uuid);

    const calls = [...api.get.mock.calls, ...api.post.mock.calls, ...api.patch.mock.calls, ...api.delete.mock.calls]
      .map(([path]) => path as string);
    expect(calls).toContain(`/admin/customers/${uuid}/preferences`);
    expect(calls).toContain(`/admin/customers/${uuid}/tags/${childUuid}`);
    expect(calls).toContain(`/admin/customers/${uuid}/consents/${childUuid}/withdraw`);
    expect(calls).toContain(`/admin/customers/${uuid}/privacy-requests/${childUuid}`);
    expect(calls).toContain(`/admin/customers/${uuid}/orders`);
    expect(calls).toContain(`/admin/customers/${uuid}/activity`);
    expect(calls).toContain(`/admin/customers/${uuid}/audit`);
    expect(calls.every((path) => !path.includes("/dashboard") && !path.includes("/360") && !path.includes("/consent-privacy"))).toBe(true);
  });
});
