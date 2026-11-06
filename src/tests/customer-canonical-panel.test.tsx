import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const customerApi = vi.hoisted(() => ({
  getAddresses: vi.fn(),
  getPreferences: vi.fn(),
  getTags: vi.fn(),
  getConsents: vi.fn(),
  getPrivacyRequests: vi.fn(),
  getOrders: vi.fn(),
  getActivity: vi.fn(),
  getAudit: vi.fn(),
  transitionLifecycle: vi.fn(),
}));

vi.mock("@/lib/api/customers", () => ({ customerApi }));

import { CustomerCanonicalPanel } from "@/components/admin/customers/detail/CustomerCanonicalPanel";
import { CustomerLifecycleControl } from "@/components/admin/customers/detail/CustomerLifecycleControl";

const uuid = "11111111-1111-4111-8111-111111111111";
const empty = { data: [], meta: { current_page: 1, per_page: 25, total: 0, last_page: 1 } };

describe("Customer canonical detail panels", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a loading state followed by an empty state", async () => {
    customerApi.getOrders.mockResolvedValue(empty);
    render(<CustomerCanonicalPanel customerUuid={uuid} section="orders" />);

    expect(screen.getByText("Loading Customer data…")).toBeInTheDocument();
    expect(await screen.findByText("No records in this Customer section")).toBeInTheDocument();
    expect(customerApi.getOrders).toHaveBeenCalledWith(uuid);
  });

  it("renders canonical order records without numeric ownership identity", async () => {
    customerApi.getOrders.mockResolvedValue({ ...empty, data: [{ uuid: "order-uuid", order_number: "ORDER-100", status: "confirmed", currency: "LKR", total: "125.00", item_count: 2, created_at: "2026-09-11T00:00:00Z" }] });
    render(<CustomerCanonicalPanel customerUuid={uuid} section="orders" />);

    expect(await screen.findByText("ORDER-100")).toBeInTheDocument();
    expect(screen.getByText("confirmed · LKR 125.00 · 2 item(s)")).toBeInTheDocument();
  });

  it("loads consent history and privacy requests from distinct authorities", async () => {
    customerApi.getConsents.mockResolvedValue({ ...empty, data: [{ uuid: "consent-uuid", purpose: "marketing", status: "granted", captured_at: "2026-09-11T00:00:00Z", created_at: "2026-09-11T00:00:00Z" }] });
    customerApi.getPrivacyRequests.mockResolvedValue({ ...empty, data: [{ uuid: "privacy-uuid", request_type: "access", status: "pending", reason: null, requested_at: "2026-09-11T00:00:00Z", created_at: "2026-09-11T00:00:00Z" }] });
    render(<CustomerCanonicalPanel customerUuid={uuid} section="consent-privacy" />);

    expect(await screen.findByText("marketing")).toBeInTheDocument();
    expect(screen.getByText("access")).toBeInTheDocument();
  });

  it("renders a non-enumerating error state", async () => {
    customerApi.getAudit.mockRejectedValue(new Error("404"));
    render(<CustomerCanonicalPanel customerUuid={uuid} section="audit-history" />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText(/not expanded into existence-revealing details/)).toBeInTheDocument();
  });

  it("submits lifecycle changes through the canonical command", async () => {
    customerApi.transitionLifecycle.mockResolvedValue({ data: {} });
    const onChanged = vi.fn().mockResolvedValue(undefined);
    render(<CustomerLifecycleControl customerUuid={uuid} currentState="active" lifecycleVersion={3} onChanged={onChanged} canManage />);

    fireEvent.change(screen.getByLabelText("New lifecycle state"), { target: { value: "suspended" } });
    fireEvent.change(screen.getByLabelText("Lifecycle reason"), { target: { value: "Manual review" } });
    fireEvent.click(screen.getByRole("button", { name: "Update lifecycle" }));

    await waitFor(() => expect(customerApi.transitionLifecycle).toHaveBeenCalledWith(uuid, { target_state: "suspended", reason: "Manual review", expected_version: 3 }));
    expect(await screen.findByText("Lifecycle updated.")).toBeInTheDocument();
  });
});
