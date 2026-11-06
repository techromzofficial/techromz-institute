import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const financeRoot = resolve(process.cwd(), "src/app/admin/finance");
const read = (path: string) => readFileSync(resolve(financeRoot, path), "utf8");

describe("Finance production UI safety", () => {
  it("contains no junior fake chart or count fallbacks", () => {
    const payments = read("payments/page.tsx");
    expect(payments).not.toContain("captured: 4200");
    expect(payments).not.toContain("summary.captured || 14");
    expect(payments).not.toContain("Math.random");
  });

  it("shows only domain-backed payment and refund actions", () => {
    const paymentDetail = read("payments/[id]/page.tsx");
    const refunds = read("refunds-compensation/page.tsx");
    expect(paymentDetail).toContain("capabilities?.capture");
    expect(paymentDetail).toContain("capabilities?.void");
    expect(paymentDetail).not.toContain("Retry operation");
    expect(refunds).toContain("capabilities?.request_refund");
    expect(refunds).not.toMatch(/Approve refund|Reject refund|Retry refund/);
    expect(read("settlements-payouts/page.tsx")).toContain("intentionally read-only");
    expect(read("reconciliation-controls/page.tsx")).toContain("read-only");
    expect(read("reports-import-export-audit/page.tsx")).toContain("financeApi.downloadFinanceExport");
  });

  it("renders outcome-unknown evidence as reconciliation required without retry", () => {
    const payments = read("payments/page.tsx");
    const detail = read("payments/[id]/page.tsx");
    expect(payments).toContain("Reconciliation required");
    expect(detail).toContain("provider outcome is unknown");
    expect(detail).toContain("Do not retry this operation");
    expect(detail).not.toContain("mark successful");
    expect(detail).not.toContain("mark failed");
  });

  it("uses real Finance APIs for operations and refund requests", () => {
    expect(read("payments/page.tsx")).toContain("financeApi.getPaymentOperations");
    expect(read("payments/[id]/page.tsx")).toContain("financeApi.capturePayment");
    expect(read("payments/[id]/page.tsx")).toContain("financeApi.cancelPayment");
    expect(read("refunds-compensation/page.tsx")).toContain("financeApi.requestRefund");
    expect(read("refunds-compensation/page.tsx")).toContain("financeApi.getRefund");
  });

  it("uses the real supplier payable domain without settlement-line masquerading", () => {
    const list = read("supplier-payables/page.tsx");
    const detail = read("supplier-payables/[id]/page.tsx");
    expect(list).toContain("financeApi.getSupplierPayables");
    expect(list).toContain("financeApi.materializeSupplierPayable");
    expect(list).not.toContain("reconciliation_status");
    expect(list).not.toContain("PaymentSettlementLine");
    expect(detail).toContain("financeApi.holdSupplierPayable");
    expect(detail).toContain("financeApi.releaseSupplierPayable");
    expect(detail).toContain("financeApi.scheduleSupplierPayable");
    expect(detail).toContain("A schedule is not payment or payout confirmation");
    expect(list).toContain("No supplier payables found");
    expect(list).toContain("role=\"alert\"");
  });

  it("uses canonical settlement import and capability-gated finalization without payout controls", () => {
    const list = read("settlements-payouts/page.tsx");
    const detail = read("settlements-payouts/[id]/page.tsx");
    const reconciliation = read("reconciliation-controls/page.tsx");
    expect(list).toContain("capabilities?.import");
    expect(list).toContain("financeApi.importSettlement");
    expect(detail).toContain("capabilities?.finalize");
    expect(detail).toContain("financeApi.finalizeSettlement");
    expect(detail).toContain("does not execute a payout or transfer money");
    expect(detail).not.toMatch(/Approve payout|Release payout|Execute payout/);
    expect(reconciliation).toContain("reconciliation_reason");
    expect(reconciliation).toContain("read-only");
  });

  it("renders API errors and honest empty states", () => {
    for (const path of ["payments/page.tsx", "refunds-compensation/page.tsx", "settlements-payouts/page.tsx", "reconciliation-controls/page.tsx"]) {
      const source = read(path);
      expect(source).toContain("{error}");
      expect(source).toMatch(/No (payment|refund|settlement|reconciliation) records/);
    }
  });

  it("uses authenticated backend CSV export without client-generated report data", () => {
    const reports = read("reports-import-export-audit/page.tsx");
    expect(reports).toContain("financeApi.downloadFinanceExport");
    expect(reports).toContain("Exporting…");
    expect(reports).toContain("{exportError}");
    expect(reports).not.toContain("JSON.stringify(response");
    expect(reports).not.toMatch(/Create adjustment|Write off|Force match/);
  });

  it("implements governed tenant currency enablement workflow in FN13", () => {
    const taxCurrency = read("tax-currency-configuration/page.tsx");
    expect(taxCurrency).toContain("+ Add Currency");
    expect(taxCurrency).toContain("Add Currency");
    expect(taxCurrency).toContain("Add an existing supported currency to this tenant.");
    expect(taxCurrency).toContain("capabilities?.manage_tenant_currencies");
    expect(taxCurrency).toContain("financeApi.updateTenantCurrencyConfig");
    expect(taxCurrency).toContain("Make this the base/default currency");
    expect(taxCurrency).toContain("Provider Compatibility");
    expect(taxCurrency).toContain("Exchange Rate Evidence");
    expect(taxCurrency).not.toContain("INSERT INTO currencies");
  });
});
