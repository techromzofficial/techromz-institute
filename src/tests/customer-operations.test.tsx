import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const customerApi = vi.hoisted(() => ({
  getAddresses: vi.fn(), createAddress: vi.fn(), updateAddress: vi.fn(), deleteAddress: vi.fn(), setDefaultAddress: vi.fn(),
  getPreferences: vi.fn(), updatePreferences: vi.fn(), getTags: vi.fn(), addTag: vi.fn(), removeTag: vi.fn(),
  getConsents: vi.fn(), createConsent: vi.fn(), withdrawConsent: vi.fn(),
  getPrivacyRequests: vi.fn(), createPrivacyRequest: vi.fn(), updatePrivacyRequest: vi.fn(),
  getOrders: vi.fn(), getActivity: vi.fn(), getAudit: vi.fn(),
}));
vi.mock("@/lib/api/customers", () => ({ customerApi }));

import { CustomerCanonicalPanel } from "@/components/admin/customers/detail/CustomerCanonicalPanel";

const customerUuid = "11111111-1111-4111-8111-111111111111";
const addressUuid = "22222222-2222-4222-8222-222222222222";
const emptyMeta = { current_page: 1, per_page: 25, total: 0, last_page: 1 };
const address = { uuid: addressUuid, label: "Home", address_role: "both", contact_name: "Amaya", company_name: null, phone: null, address_line_1: "10 Main Street", address_line_2: null, city: "Colombo", state: null, postal_code: "00100", country: "LK", is_default_shipping: false, is_default_billing: false, status: "active", created_at: null, updated_at: null };

describe("Customer 360 operational panels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    customerApi.getAddresses.mockResolvedValue({ data: [address], meta: emptyMeta });
    customerApi.getPreferences.mockResolvedValue({ data: { preferred_language: "en", preferred_currency: "LKR", preferred_contact_channels: ["email"], notification_channels: ["email"], shopping_preferences: {}, consent_authority: "consent_records" } });
    customerApi.getTags.mockResolvedValue({ data: [{ uuid: "tag-uuid", name: "Priority", created_at: null }], meta: emptyMeta });
    customerApi.getConsents.mockResolvedValue({ data: [{ uuid: "consent-uuid", purpose: "marketing", status: "granted", captured_at: null, withdrawn_at: null, created_at: null }], meta: emptyMeta });
    customerApi.getPrivacyRequests.mockResolvedValue({ data: [{ uuid: "privacy-uuid", request_type: "access", status: "pending", reason: "Customer request", decision_reason: null, version: 3, created_at: null, updated_at: null }], meta: emptyMeta });
    for (const method of ["createAddress", "updateAddress", "deleteAddress", "setDefaultAddress", "updatePreferences", "addTag", "removeTag", "createConsent", "withdrawConsent", "createPrivacyRequest", "updatePrivacyRequest"] as const) customerApi[method].mockResolvedValue({ data: {} });
  });

  it("creates, edits, and sets defaults through the address API then reloads", async () => {
    render(<CustomerCanonicalPanel customerUuid={customerUuid} section="addresses-contacts" permissions={["customers.addresses.manage"]} />);
    await screen.findByText("Home");
    fireEvent.change(screen.getByLabelText("Address line 1"), { target: { value: "20 New Street" } });
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "lk" } });
    fireEvent.click(screen.getByRole("button", { name: "Add address" }));
    await waitFor(() => expect(customerApi.createAddress).toHaveBeenCalledWith(customerUuid, expect.objectContaining({ address_line_1: "20 New Street", country: "LK" })));
    fireEvent.click(screen.getByLabelText("Edit Home"));
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Kandy" } });
    fireEvent.click(screen.getByRole("button", { name: "Save address" }));
    await waitFor(() => expect(customerApi.updateAddress).toHaveBeenCalledWith(customerUuid, addressUuid, expect.objectContaining({ city: "Kandy" })));
    fireEvent.click(screen.getByRole("button", { name: "Set shipping default" }));
    await waitFor(() => expect(customerApi.setDefaultAddress).toHaveBeenCalledWith(customerUuid, addressUuid, "shipping"));
    expect(customerApi.getAddresses.mock.calls.length).toBeGreaterThan(3);
  });

  it("requires identified confirmation before deleting and reloads only after confirmation", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<CustomerCanonicalPanel customerUuid={customerUuid} section="addresses-contacts" permissions={["customers.addresses.manage"]} />);
    await screen.findByText("Home");
    fireEvent.click(screen.getByLabelText("Delete Home"));
    expect(customerApi.deleteAddress).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining("Home"));
    fireEvent.click(screen.getByLabelText("Delete Home"));
    await waitFor(() => expect(customerApi.deleteAddress).toHaveBeenCalledWith(customerUuid, addressUuid));
    expect(customerApi.getAddresses).toHaveBeenCalledTimes(2);
  });

  it("updates preferences and adds/removes tags", async () => {
    render(<CustomerCanonicalPanel customerUuid={customerUuid} section="preferences-tags" permissions={["customers.update"]} />);
    await screen.findByDisplayValue("en");
    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "si" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(() => expect(customerApi.updatePreferences).toHaveBeenCalledWith(customerUuid, expect.objectContaining({ preferred_language: "si" })));
    fireEvent.change(screen.getByLabelText("New tag"), { target: { value: "VIP" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(customerApi.addTag).toHaveBeenCalledWith(customerUuid, "VIP"));
    fireEvent.click(screen.getByLabelText("Remove Priority"));
    await waitFor(() => expect(customerApi.removeTag).toHaveBeenCalledWith(customerUuid, "tag-uuid"));
  });

  it("captures and confirms withdrawal of consent", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<CustomerCanonicalPanel customerUuid={customerUuid} section="consent-privacy" permissions={["customers.update"]} />);
    await screen.findByText("marketing");
    fireEvent.change(screen.getByLabelText("Policy version UUID"), { target: { value: "33333333-3333-4333-8333-333333333333" } });
    fireEvent.click(screen.getByRole("button", { name: "Record consent" }));
    await waitFor(() => expect(customerApi.createConsent).toHaveBeenCalledWith(customerUuid, expect.objectContaining({ purpose: "marketing", source: "admin_api" })));
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    await waitFor(() => expect(customerApi.withdrawConsent).toHaveBeenCalledWith(customerUuid, "consent-uuid", expect.any(String)));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("consent-uuid"));
  });

  it("creates privacy requests and confirms an exact backend-supported transition", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<CustomerCanonicalPanel customerUuid={customerUuid} section="consent-privacy" permissions={["customers.privacy.manage"]} />);
    await screen.findByText(/Customer request/);
    fireEvent.change(screen.getByLabelText("Privacy request reason"), { target: { value: "Provide stored data" } });
    fireEvent.click(screen.getByRole("button", { name: "Create privacy request" }));
    await waitFor(() => expect(customerApi.createPrivacyRequest).toHaveBeenCalledWith(customerUuid, { request_type: "access", reason: "Provide stored data" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply transition" }));
    await waitFor(() => expect(customerApi.updatePrivacyRequest).toHaveBeenCalledWith(customerUuid, "privacy-uuid", { status: "in_review", expected_version: 3 }));
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/privacy-uuid.*pending.*in_review/));
    expect(customerApi.getPrivacyRequests.mock.calls.length).toBeGreaterThan(2);
  });

  it("does not expose mutation controls without matching permissions", async () => {
    render(<CustomerCanonicalPanel customerUuid={customerUuid} section="addresses-contacts" />);
    await screen.findByText("Home");
    expect(screen.queryByRole("button", { name: "Add address" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Delete Home")).not.toBeInTheDocument();
  });
});
