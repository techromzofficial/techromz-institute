import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DetailPage } from "@/components/admin/common/DetailPage";
import { suppliers } from "@/mocks/admin/fixtures";

describe("DetailPage actions", () => {
  it("supports distinct actions that share the same destination", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sharedHref = "/admin/marketplace/returns?orderId=order-uuid-001";

    render(
      <DetailPage
        title="Order"
        description="Order detail"
        reference="ORD-2026-501"
        id="order-uuid-001"
        status="Processing"
        backHref="/admin/marketplace/orders"
        tabs={["Overview"]}
        sections={[{ title: "Order information", items: ["Customer"] }]}
        links={[
          { label: "View return requests", href: sharedHref },
          { label: "Start return review", href: sharedHref },
        ]}
        capabilities={suppliers[0].capabilities}
      />,
    );

    expect(screen.getByRole("link", { name: "View return requests" })).toHaveAttribute("href", sharedHref);
    expect(screen.getByRole("link", { name: "Start return review" })).toHaveAttribute("href", sharedHref);
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining("same key"));
    consoleError.mockRestore();
  });
});
