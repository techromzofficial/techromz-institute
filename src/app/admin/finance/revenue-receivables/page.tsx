"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  FileText,
  X,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  financeApi,
  type FinanceRevenueReceivablePaymentStatus,
  type FinanceRevenueReceivablesResponse,
} from "@/lib/api/finance";

function money(
  amount: string | number,
  currency: string | null | undefined,
): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `${currency ?? ""} ${amount}`.trim();
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export default function RevenueReceivablesPage() {
  const [response, setResponse] =
    useState<FinanceRevenueReceivablesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    FinanceRevenueReceivablePaymentStatus | ""
  >("");
  const [currency, setCurrency] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReceivable, setSelectedReceivable] = useState<any | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getRevenueReceivables({
        search: search.trim() || undefined,
        payment_status: paymentStatus || undefined,
        currency: currency.trim() ? currency.trim().toUpperCase() : undefined,
        page,
        per_page: 20,
      });
      setResponse(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load revenue and receivables.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, paymentStatus, currency, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const currencyOptions = useMemo(() => {
    if (!response) return [];
    return Array.from(
      new Set(
        response.summary.revenue_by_currency
          .map((item) => item.currency)
          .filter(Boolean),
      ),
    );
  }, [response]);

  const chartData = useMemo(() => {
    if (!response?.summary.revenue_by_currency) return [];
    return response.summary.revenue_by_currency.map((item) => ({
      currency: item.currency,
      Invoiced: Number(item.invoiced_amount) || 0,
      Collected: Number(item.collected_amount) || 0,
      Outstanding: Number(item.outstanding_amount) || 0,
    }));
  }, [response]);

  const resetFilters = () => {
    setSearch("");
    setPaymentStatus("");
    setCurrency("");
    setPage(1);
  };

  if (loading && response === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading tenant revenue & receivables ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Revenue & Receivables
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Tenant-isolated invoice collection, overdue accounts, and outstanding balance tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {response && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Open Receivables
              </span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">
              {response.summary.receivables}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Active invoice collection pool
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Unpaid Invoices
              </span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-600">
              {response.summary.unpaid}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>0% payment collected</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Partially Paid
              </span>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-indigo-600">
              {response.summary.partially_paid}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>Partial installments recorded</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Currencies Active
              </span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-700">
              {response.summary.revenue_by_currency.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Strict zero cross-currency mix
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Revenue Collection vs Outstanding
              </h3>
              <p className="text-xs text-slate-500">
                Invoiced, Collected, and Balance Due separated by currency
              </p>
            </div>
          </div>
          <div className="mt-4 h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="currency" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                            <p className="font-semibold text-slate-900">{label}</p>
                            {payload.map((entry: any) => (
                              <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
                                {entry.name}: {money(entry.value, String(label ?? ""))}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Invoiced" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No revenue evidence available for selected period
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Currency Segregated Totals
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Multi-tenant isolated currency balances
          </p>
          <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
            {response?.summary.revenue_by_currency && response.summary.revenue_by_currency.length > 0 ? (
              response.summary.revenue_by_currency.map((item) => {
                const total = Number(item.invoiced_amount) || 0;
                const collected = Number(item.collected_amount) || 0;
                const pct =
                  total > 0
                    ? Math.min(100, Math.round((collected / total) * 100))
                    : 0;
                return (
                  <div key={item.currency} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-900">{item.currency}</span>
                      <span className="text-emerald-600">{pct}% Collected</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>Due: {money(item.outstanding_amount, item.currency)}</span>
                      <span>Total: {money(item.invoiced_amount, item.currency)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No currency data</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search invoice number, customer, or order reference..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value as FinanceRevenueReceivablePaymentStatus | "");
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Payment States</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
            </select>

            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Currencies</option>
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || paymentStatus || currency) && (
              <button
                onClick={resetFilters}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Receivables Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Invoice / Date</th>
                <th className="px-5 py-3.5">Order Reference</th>
                <th className="px-5 py-3.5">Supplier / Party</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5 text-right">Invoiced Amount</th>
                <th className="px-5 py-3.5 text-right">Amount Paid</th>
                <th className="px-5 py-3.5 text-right">Balance Due</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {response?.data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="font-semibold text-slate-900">{row.invoice_number}</div>
                    <div className="text-xs text-slate-500">{row.invoice_date ?? "—"}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-indigo-600">
                    {row.order?.order_number ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {row.supplier?.name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.payment_status === "partially_paid"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {row.payment_status === "partially_paid" ? "Partially Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                    {row.due_date ?? "Not recorded"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-slate-700">
                    {money(row.total_amount, row.currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-emerald-600">
                    {money(row.amount_paid, row.currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900">
                    {money(row.balance_due, row.currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-center">
                    <button
                      onClick={() => setSelectedReceivable(row)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Inspect
                      <ArrowUpRight className="h-3 w-3 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}

              {response?.data.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    No open receivables found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {response && response.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
            <span className="text-slate-500">
              Page {response.current_page} of {response.last_page} ({response.total} total items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={response.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={response.current_page >= response.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer: Detailed Inspection */}
      {selectedReceivable && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-lg bg-white p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Receivable Details
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedReceivable.invoice_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReceivable(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Balance Breakdown
                </span>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Total Invoiced</span>
                    <p className="text-base font-bold text-slate-900">
                      {money(selectedReceivable.total_amount, selectedReceivable.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Collected Amount</span>
                    <p className="text-base font-bold text-emerald-600">
                      {money(selectedReceivable.amount_paid, selectedReceivable.currency)}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200 pt-3">
                    <span className="text-xs text-slate-500">Outstanding Balance Due</span>
                    <p className="text-xl font-extrabold text-amber-600">
                      {money(selectedReceivable.balance_due, selectedReceivable.currency)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Transaction Metadata
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-100 p-3">
                    <span className="text-slate-500">Order Reference:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedReceivable.order?.order_number ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-3">
                    <span className="text-slate-500">Party / Supplier:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedReceivable.supplier?.name ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-3">
                    <span className="text-slate-500">Invoice Date:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedReceivable.invoice_date ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-3">
                    <span className="text-slate-500">Due Date:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedReceivable.due_date ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <p className="font-semibold">Receivable Read-Only View</p>
                    <p className="mt-1">
                      Outstanding balances shown here are derived from the Finance backend and cannot be edited from this screen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-4">
              <button
                onClick={() => setSelectedReceivable(null)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}