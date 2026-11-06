import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  adminRoute,
  parseFilters,
  statusTone,
  toOrderDetailViewModel,
} from "@/lib/admin";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { EnterpriseDataTable } from "@/components/admin/common/EnterpriseDataTable";
import { canApproveFullRefund } from "@/features/admin/returns/permissions";
import { returns, suppliers } from "@/mocks/admin/fixtures";
import { dashboardActions } from "@/mocks/admin/dashboard.mock";
import { VerificationStatsGrid } from "@/components/admin/verification/VerificationStatsGrid";

describe("admin foundations", () => {
  it("maps nested order DTO fields", () => {
    expect(
      toOrderDetailViewModel({
        id: "1",
        public_reference: "ORD-1",
        status: "Processing",
        payment: { status: "Paid" },
      }),
    ).toEqual({
      id: "1",
      publicReference: "ORD-1",
      orderStatus: "Processing",
      paymentStatus: "Paid",
      fulfilmentStatus: undefined,
      deliveryStatus: undefined,
      healthScore: undefined,
    });
  });

  it("keeps internal IDs in encoded routes", () => {
    expect(adminRoute.supplier("uuid / 1")).toBe(
      "/admin/verification-compliance/supplier-verification",
    );
  });

  it("parses non-empty filters", () => {
    expect(new URLSearchParams("status=pending&assigned=")).toBeTruthy();
    expect(parseFilters(new URLSearchParams("status=pending&assigned=")))
      .toEqual({ status: "pending" });
  });

  it("maps status tone", () => {
    expect(statusTone("Failed")).toBe("danger");
  });

  it("renders status text", () => {
    render(<StatusBadge status="Pending Review" />);
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
  });

  it("renders visible primary table action", () => {
    render(
      <EnterpriseDataTable
        rows={[{ id: "1", status: "Pending" }]}
        columns={[{ header: "Status", cell: (row) => row.status }]}
        actionLabel="Open Case"
        href={() => "/case/1"}
      />,
    );
    expect(screen.getByRole("link", { name: "Open Case" }))
      .toHaveAttribute("href", "/case/1");
  });

  it("blocks full refund while inspection is pending", () => {
    expect(canApproveFullRefund(returns[0])).toBe(false);
  });

  it("separates supplier route IDs from public references", () => {
    expect(suppliers[0].id).not.toBe(suppliers[0].publicReference);
    expect(adminRoute.supplier(suppliers[0].id))
      .not.toContain(suppliers[0].publicReference);
  });

  it("gives every migrated dashboard action a target route", () => {
    expect(dashboardActions.every((action) => action.href.startsWith("/admin/")))
      .toBe(true);
  });

  it("renders the integrated verification summary cards", async () => {
    render(<VerificationStatsGrid />);
    expect(await screen.findByText("New Apps")).toBeInTheDocument();
    expect(screen.getByText("High Risk")).toBeInTheDocument();
  });
});
