import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InvoicesPage from "@/app/admin/finance/invoices-notes/page";
import CommissionsPage from "@/app/admin/finance/commissions-fees/page";
import PayablesPage from "@/app/admin/finance/supplier-payables/page";
import TaxCurrencyPage from "@/app/admin/finance/tax-currency-configuration/page";

const financeApi = vi.hoisted(() => ({
  getInvoices: vi.fn(), getCommissions: vi.fn(), getSupplierPayables: vi.fn(),
  getTaxCurrencyConfiguration: vi.fn(),
}));
vi.mock("@/lib/api/finance", () => ({ financeApi }));
vi.mock("@/contexts/AdminContext", () => ({
  useAdminContext: () => ({
    tenant: { id: "1", name: "Tenant A" }, ecosystem: { name: "Ecosystem" }, channel: null,
    hasPermission: () => true,
  }),
}));
vi.mock("@/components/admin/common/PermissionGuard", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/admin/shared/ContextScopeBar", () => ({ ContextScopeBar: () => null }));
vi.mock("@/components/admin/shared/KpiCard", () => ({
  DashboardGrid: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  KpiCard: ({ title, value }: { title: string; value: string | number }) => <div>{title}: {value}</div>,
}));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() }, Toaster: () => null }));
vi.mock("recharts", () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Leaf = () => null;
  return {
    ResponsiveContainer: Container, AreaChart: Container, BarChart: Container, PieChart: Container,
    Area: Leaf, Bar: Leaf, CartesianGrid: Leaf, Cell: Leaf, Legend: Leaf,
    Pie: Container, Tooltip: Leaf, XAxis: Leaf, YAxis: Leaf,
  };
});

const invoice = (page: number) => ({
  id: page, uuid: `invoice-${page}`, invoice_number: `INV-PAGE-${page}`,
  invoice_date: null, due_date: null, subtotal: "10.00", tax_amount: "0.00",
  shipping_amount: "0.00", discount_amount: "0.00", total_amount: "10.00",
  amount_paid: "0.00", balance_due: "10.00", currency: "USD", status: "draft",
  payment_status: "unpaid", sent_at: null, paid_at: null, item_count: 0,
  history_count: 0, order: null, supplier: null, capabilities: {},
  created_at: null, updated_at: null,
});
const commission = (page: number) => ({
  id: page, uuid: `commission-${page}`, calculation_type: "percentage", base_amount: "10.00",
  percentage_rate: "5.0000", fixed_amount: null, commission_amount: "0.50",
  currency: "USD", status: "calculated", status_reason: null, calculated_at: null,
  reviewed_at: null, approved_at: null, settled_at: null, history_count: 0,
  order: null, supplier: null, product: null, category: null, rule: null,
  capabilities: {}, created_at: null, updated_at: null,
});
const payable = (page: number) => ({
  id: page, uuid: `payable-${page}`, payable_number: `PAYABLE-PAGE-${page}`,
  supplier: null, invoice: null, order: null, source_type: "invoice", source_id: page,
  original_amount: "10.00", outstanding_amount: "10.00", currency: "USD",
  due_date: null, status: "open", hold_reason: null, scheduled_for: null,
  created_at: null, updated_at: null,
});

beforeEach(() => {
  vi.clearAllMocks();
  financeApi.getInvoices.mockImplementation(async ({ page = 1 }) => ({
    data: [invoice(page)], summary: { total: 2, draft: 2, issued: 0, cancelled: 0,
      unpaid: 2, partially_paid: 0, paid: 0, amounts_by_currency: [] },
    capabilities: { read: true, manage: false, create_from_order: false },
    current_page: page, per_page: 50, total: 51, last_page: 2,
  }));
  financeApi.getCommissions.mockImplementation(async ({ page = 1 }) => ({
    data: [commission(page)], summary: { total: 2, calculated: 2, pending_review: 0,
      approved: 0, settled: 0, cancelled: 0, amounts_by_currency: [] },
    capabilities: { read: true, manage: false },
    current_page: page, per_page: 50, total: 51, last_page: 2,
  }));
  financeApi.getSupplierPayables.mockImplementation(async ({ page = 1 }) => ({
    data: [payable(page)], summary: { total: 2, open: 2, on_hold: 0,
      scheduled: 0, amounts_by_currency: [] },
    capabilities: { read: true, materialize: false },
    current_page: page, per_page: 20, total: 21, last_page: 2,
  }));
  financeApi.getTaxCurrencyConfiguration.mockResolvedValue({
    data: {
      currencies: [
        { id: 1, uuid: "usd", code: "USD", name: "US Dollar", symbol: "$", decimal_places: 2, status: "active", is_default: true },
        { id: 2, uuid: "eur", code: "EUR", name: "Euro", symbol: "€", decimal_places: 2, status: "inactive", is_default: false },
      ],
      exchange_rates: [], tax_rules: [], payment_providers: [],
      tenant_currencies: [{ id: 2, uuid: "configured-eur", currency_code: "EUR", is_enabled: false, is_base: false, updated_at: null }],
    },
    summary: { currency_count: 2, active_currency_count: 1, exchange_rate_count: 0,
      tax_rule_count: 0, active_tax_rule_count: 0, payment_provider_count: 0, tenant_supported_currencies: [] },
    capabilities: { read: true, manage_tenant_currencies: true, manage_currency_reference: false,
      manage_exchange_rates: false, manage_tax_rules: false, manage_provider_currencies: false },
  });
});

async function exercisePages(label: string, apiMethod: typeof financeApi.getInvoices) {
  expect(await screen.findByText(label.replace("-2", "-1"))).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(await screen.findByText(label)).toBeInTheDocument();
  expect(apiMethod).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  fireEvent.click(screen.getByRole("button", { name: "Previous" }));
  expect(await screen.findByText(label.replace("-2", "-1"))).toBeInTheDocument();
  expect(apiMethod).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
}

describe("Finance pagination and currency contract", () => {
  it("reaches later invoice records and resets to page one for a new search", async () => {
    render(<InvoicesPage />);
    await exercisePages("INV-PAGE-2", financeApi.getInvoices);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("INV-PAGE-2");
    expect(screen.getByRole("button", { name: "Download PDF for invoice INV-PAGE-2" })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Search invoice number/), { target: { value: "new invoice" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(financeApi.getInvoices).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "new invoice" })));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("INV-PAGE-2");
    fireEvent.click(screen.getByRole("button", { name: "Issued" }));
    await waitFor(() => expect(financeApi.getInvoices).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, status: "issued" })));
  });

  it("reaches later commission records and resets to page one for a new search", async () => {
    render(<CommissionsPage />);
    await exercisePages("commission-2", financeApi.getCommissions);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("commission-2");
    expect(screen.getByRole("button", { name: "Download PDF for commission record 2" })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Search order, supplier/), { target: { value: "new commission" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(financeApi.getCommissions).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "new commission" })));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("commission-2");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "approved" } });
    await waitFor(() => expect(financeApi.getCommissions).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, status: "approved" })));
  });

  it("reaches later payable records, returns, and resets when status changes", async () => {
    render(<PayablesPage />);
    await exercisePages("PAYABLE-PAGE-2", financeApi.getSupplierPayables);
    expect(financeApi.getSupplierPayables).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, per_page: 20 }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("PAYABLE-PAGE-2");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "scheduled" } });
    await waitFor(() => expect(financeApi.getSupplierPayables).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, status: "scheduled" })));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("PAYABLE-PAGE-2");
    fireEvent.change(screen.getByPlaceholderText(/Search payable/), { target: { value: "new payable" } });
    await waitFor(() => expect(financeApi.getSupplierPayables).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "new payable" })));
  });

  it("offers only active backend reference currencies while retaining configured inactive evidence", async () => {
    render(<TaxCurrencyPage />);
    await waitFor(() => expect(financeApi.getTaxCurrencyConfiguration).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /\+ Add Currency/ }));
    const picker = screen.getAllByRole("combobox").find((select) => within(select).queryByRole("option", { name: /USD.*US Dollar/ }))!;
    expect(within(picker).getByRole("option", { name: /USD.*US Dollar/ })).toBeInTheDocument();
    expect(within(picker).queryByRole("option", { name: /EUR|Euro/ })).not.toBeInTheDocument();
    expect(within(picker).queryByRole("option", { name: /JPY/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Euro").length).toBeGreaterThan(0);
  });
});
