import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ADMIN_NAVIGATION } from "@/constants/adminNavigation";
import { CUSTOMER_DETAIL_TABS } from "@/components/admin/customers/detail/CustomerDetailTabs";

describe("Customer cross-module ownership", () => {
  it("keeps only supported Customer module navigation", () => {
    const customers = ADMIN_NAVIGATION.find((item) => item.id === "customers");
    expect(customers?.children?.map((item) => item.href)).toEqual([
      "/admin/customers",
      "/admin/customers/directory",
      "/admin/customers/new",
    ]);
  });

  it("removes foreign and unsupported Customer navigation", () => {
    const serialized = JSON.stringify(ADMIN_NAVIGATION.find((item) => item.id === "customers"));
    for (const fragment of ["segments", "verification", "loyalty", "risk", "returns", "support", "addresses-contacts", "import-export-audit", "/orders"]) {
      expect(serialized).not.toContain(fragment);
    }
  });

  it("retains only canonical Customer detail concepts", () => {
    expect(CUSTOMER_DETAIL_TABS.map((tab) => tab.id)).toEqual([
      "overview",
      "addresses-contacts",
      "preferences-tags",
      "consent-privacy",
      "orders",
      "activity",
      "audit-history",
    ]);
  });

  it("contains no placeholder, dashboard, 360, aggregate, PUT, or foreign-domain Customer API", () => {
    const sourcePath = `${process.cwd()}/src/lib/api/customers.ts`;
    const source = readFileSync(sourcePath, "utf8");

    expect(source).not.toContain("unsupported-customer-visualization");
    expect(source).not.toMatch(/customers\/(dashboard|verification|loyalty|risk-restrictions|returns-refunds-disputes|support-communications|addresses-contacts|import-export-audit|segments)/);
    expect(source).not.toContain("customers/consent-privacy");
    expect(source).not.toContain("api.put(");
    expect(source).not.toMatch(/databaseId|buyer_id|tenant_id|customer_profile_id/);
  });
});
