import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/admin/layout/Sidebar";
import { ADMIN_NAVIGATION } from "@/constants/adminNavigation";
const permissions = vi.hoisted(() => ({ support: true }));
beforeEach(() => { permissions.support = true; });

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/customer-support/cases/case-001",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Administrator", role: "super_admin" },
    logout: vi.fn(),
  }),
}));

vi.mock("@/contexts/AdminContext", () => ({
  useAdminContext: () => ({ hasPermission: (permission: string) => permission !== 'support.case.view' || permissions.support }),
}));

describe("Customer Support sidebar navigation", () => {
  it('hides the entire support submenu without support view permission', () => {
    permissions.support = false;
    render(<Sidebar open onClose={vi.fn()} />);
    expect(screen.queryByText('Customer Support')).not.toBeInTheDocument();
  });
  it("keeps the reference order and only links implemented routes", () => {
    const customerSupport = ADMIN_NAVIGATION.find((item) => item.id === "customer-support");

    expect(customerSupport?.children?.map((item) => item.label)).toEqual([
      "Command Center",
      "Cases",
      "Conversations",
      "Complaints",
      "Returns & Refunds",
      "Order & Delivery",
      "Product & Supplier",
      "SLA & Routing",
      "Knowledge",
      "Satisfaction & QA",
      "Teams & Performance",
      "Reports & Audit",
    ]);
    expect(customerSupport?.children?.filter((item) => item.href).map((item) => item.href)).toEqual([
      "/admin/customer-support/support-operations",
      "/admin/customer-support/cases",
      "/admin/customer-support/conversations",
      "/admin/customer-support/complaints",
      "/admin/customer-support/returns-refunds",
      "/admin/customer-support/order-delivery",
      "/admin/customer-support/product-supplier",
      "/admin/customer-support/sla-routing",
      "/admin/customer-support/knowledge",
      "/admin/customer-support/satisfaction-qa",
      "/admin/customer-support/teams-performance",
      "/admin/customer-support/reports-audit",
    ]);
  });

  it("auto-expands for a deep link, marks Cases active, and toggles accessibly", () => {
    render(<Sidebar open onClose={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Customer Support" })).toHaveAttribute(
      "href",
      "/admin/customer-support/support-operations",
    );
    const toggle = screen.getByRole("button", { name: "Collapse Customer Support submenu" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Cases" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Reports & Audit" })).toHaveAttribute(
      "href",
      "/admin/customer-support/reports-audit",
    );

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Command Center")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Command Center" })).toHaveAttribute(
      "href",
      "/admin/customer-support/support-operations",
    );
  });
});
