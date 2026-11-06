"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  FileClock,
  FileSpreadsheet,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions/financePermissions";
import {
  financeApi,
  type FinanceAuditRow,
  type FinanceReportPaymentCurrency,
  type FinanceReportReconciliationCurrency,
  type FinanceReportRefundCurrency,
  type FinanceReportSettlementCurrency,
  type FinanceReportsAuditResponse,
  type FinanceExportQuery,
} from "@/lib/api/finance";

function titleCase(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatMoney(
  amount: string | null | undefined,
  currency: string | null | undefined,
): string {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }

  const numeric =
    Number(amount);

  if (!Number.isFinite(numeric)) {
    return `${currency ?? ""} ${amount}`.trim();
  }

  if (!currency) {
    return numeric.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );
  }

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }
}

function KpiCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusTransition({
  previous,
  next,
}: {
  previous: string | null;
  next: string | null;
}) {
  if (!previous && !next) {
    return (
      <span className="text-gray-400">
        —
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-medium text-gray-600">
        {titleCase(previous)}
      </span>

      <span className="text-gray-400">
        →
      </span>

      <span className="rounded-md border border-gray-200 bg-white px-2 py-1 font-semibold text-gray-800">
        {titleCase(next)}
      </span>
    </div>
  );
}

export default function FinanceReportsAuditPage() {
  const [
    response,
    setResponse,
  ] =
    useState<FinanceReportsAuditResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const [exportType, setExportType] = useState<FinanceExportQuery["type"]>("payments");
  const [exportStatus, setExportStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [
    actionFilter,
    setActionFilter,
  ] = useState("");

  const [
    providerFilter,
    setProviderFilter,
  ] = useState("");

  const [
    dateFrom,
    setDateFrom,
  ] = useState("");

  const [
    dateTo,
    setDateTo,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    perPage,
  ] = useState(25);

  const loadData =
    useCallback(
      async (
        silent = false,
      ) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const result =
            await financeApi.getReportsAudit(
              {
                action:
                  actionFilter ||
                  undefined,

                provider:
                  providerFilter ||
                  undefined,

                date_from:
                  dateFrom ||
                  undefined,

                date_to:
                  dateTo ||
                  undefined,

                page,
                per_page: perPage,
              },
            );

          setResponse(result);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Finance reports and audit history.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        actionFilter,
        providerFilter,
        dateFrom,
        dateTo,
        page,
        perPage,
      ],
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary =
    response?.summary;

  const capabilities =
    response?.capabilities;

  const payments =
    response?.data.reports
      .payments_by_currency ?? [];

  const refunds =
    response?.data.reports
      .refunds_by_currency ?? [];

  const settlements =
    response?.data.reports
      .settlements_by_currency ?? [];

  const reconciliation =
    response?.data.reports
      .reconciliation_by_currency ?? [];

  const audits =
    response?.data.audit ?? [];

  const auditActionChart = useMemo(() => {
    const map: Record<string, { action: string; count: number }> = {};
    audits.forEach((a) => {
      const act = titleCase(a.action || "general_action");
      if (!map[act]) {
        map[act] = { action: act, count: 0 };
      }
      map[act].count += 1;
    });
    return Object.values(map);
  }, [audits]);

  const recordCountChart = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Payments", value: summary.payments || 0, color: "#6366f1" },
      { name: "Refunds", value: summary.refunds || 0, color: "#ec4899" },
      { name: "Settlements", value: summary.settlements || 0, color: "#10b981" },
      { name: "Unresolved Lines", value: summary.unresolved_reconciliation_lines || 0, color: "#f59e0b" },
      { name: "Audit Trail Events", value: summary.audit_events || 0, color: "#8b5cf6" },
    ];
  }, [summary]);

  const actions =
    response?.filters.actions ?? [];

  const providers =
    response?.filters.providers ?? [];

  const hasFilters =
    useMemo(
      () =>
        Boolean(
          actionFilter ||
            providerFilter ||
            dateFrom ||
            dateTo,
        ),
      [
        actionFilter,
        providerFilter,
        dateFrom,
        dateTo,
      ],
    );

  const clearFilters = () => {
    setActionFilter("");
    setProviderFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const downloadExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await financeApi.downloadFinanceExport({
        type: exportType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: exportStatus || undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finance-${exportType}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      await loadData(true);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Unable to export Finance data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <PermissionGuard
      permission={
        FINANCE_PERMISSIONS.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">
              Finance access required
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You do not have permission
              to view Finance reports or
              audit history.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6">
          <div>
            <Link
              href="/admin/finance"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Finance
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Finance</span>
                <span>/</span>
                <span>
                  Reports, Import,
                  Export & Audit
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                Finance Reports,
                Import, Export & Audit
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                Review tenant-scoped
                financial reporting,
                currency-separated
                monetary evidence and
                sanitized append-only
                payment audit history.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadData(true)
              }
              disabled={
                loading ||
                refreshing
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>

          <ContextScopeBar />

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

              <div>
                <h2 className="text-sm font-bold text-blue-900">
                  Tenant-scoped
                  reporting and audit
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Monetary totals are
                  intentionally separated
                  by currency. Audit
                  records expose only
                  sanitized evidence;
                  idempotency keys,
                  metadata, IP addresses,
                  user agents and raw
                  provider references are
                  not returned.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-red-800">
                    Unable to load
                    Finance reports
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadData()
                  }
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              label="Payments"
              value={
                summary?.payments ?? 0
              }
              description="Tenant payment records"
              icon={
                <WalletCards className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Refunds"
              value={
                summary?.refunds ?? 0
              }
              description="Tenant refund records"
              icon={
                <RotateCcw className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Settlements"
              value={
                summary?.settlements ??
                0
              }
              description="Tenant settlement records"
              icon={
                <Banknote className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Unresolved"
              value={
                summary
                  ?.unresolved_reconciliation_lines ??
                0
              }
              description="Reconciliation lines requiring attention"
              icon={
                <AlertTriangle className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Audit Events"
              value={
                summary?.audit_events ??
                0
              }
              description="Append-only payment audit evidence"
              icon={
                <FileClock className="h-5 w-5" />
              }
            />
          </div>

          {/* Visual Recharts Analytics Section */}
          <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 border-b pb-2">
                <h2 className="text-sm font-bold text-gray-900">Audit Action Activity Distribution</h2>
                <p className="text-[11px] text-gray-500">Recorded financial audit actions and mutation events</p>
              </div>
              <div className="h-60 w-full">
                {auditActionChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={auditActionChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="action" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Event Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No audit event evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-3 border-b pb-2">
                <h2 className="text-sm font-bold text-gray-900">Record Type Breakdown</h2>
                <p className="text-[11px] text-gray-500">Active finance records across system modules</p>
              </div>
              <div className="h-60 w-full">
                {recordCountChart.some((s) => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={recordCountChart.filter((s) => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {recordCountChart.filter((s) => s.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No record distribution available
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-bold text-gray-900">
                Reporting Capabilities
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Only backend-supported
                capabilities are shown.
                Unsupported import/export
                workflows are not
                simulated.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label: "Reports",
                  enabled:
                    capabilities?.reports ??
                    false,
                },
                {
                  label: "Audit history",
                  enabled:
                    capabilities?.audit_history ??
                    false,
                },
                {
                  label: "Import",
                  enabled:
                    capabilities?.import ??
                    false,
                },
                {
                  label: "Export",
                  enabled:
                    capabilities?.export ??
                    false,
                },
                {
                  label:
                    "Audit export",
                  enabled:
                    capabilities?.audit_export ??
                    false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="text-xs font-semibold text-gray-500">
                    {item.label}
                  </div>

                  <div className="mt-1 text-sm font-bold text-gray-900">
                    {item.enabled
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </div>
              ))}
            </div>

            {capabilities?.export && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-900">Download tenant Finance CSV</h3>
                <p className="mt-1 text-xs text-gray-500">The authenticated backend generates every export and records immutable request evidence.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <select value={exportType} onChange={(event) => setExportType(event.target.value as FinanceExportQuery["type"])} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <option value="payments">Payments</option>
                    <option value="refunds">Refunds</option>
                    <option value="supplier_payables">Supplier payables</option>
                    <option value="settlements">Settlements</option>
                    <option value="settlement_discrepancies">Settlement discrepancies</option>
                    <option value="audit_events">Audit events</option>
                  </select>
                  <input value={exportStatus} onChange={(event) => setExportStatus(event.target.value)} placeholder={exportType === "audit_events" ? "Optional action" : "Optional status"} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <button type="button" onClick={() => void downloadExport()} disabled={exporting} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {exporting ? "Exporting…" : "Download CSV"}
                  </button>
                </div>
                {exportError && <p role="alert" className="mt-3 text-sm text-rose-700">{exportError}</p>}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Payments by Currency
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Payment values are never
                combined across
                currencies.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Currency
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Payments
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Fees
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        Loading payment
                        reporting…
                      </td>
                    </tr>
                  ) : payments.length >
                    0 ? (
                    payments.map(
                      (
                        row: FinanceReportPaymentCurrency,
                      ) => (
                        <tr
                          key={
                            row.currency
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-bold text-gray-900">
                            {
                              row.currency
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {
                              row.payment_count
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                            {formatMoney(
                              row.amount,
                              row.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatMoney(
                              row.fees,
                              row.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No payment report
                        data is available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Refunds by Currency
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Refund values are
                summarized independently
                for each currency.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Currency
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Refunds
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {refunds.length >
                  0 ? (
                    refunds.map(
                      (
                        row: FinanceReportRefundCurrency,
                      ) => (
                        <tr
                          key={
                            row.currency
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-bold text-gray-900">
                            {
                              row.currency
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {
                              row.refund_count
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                            {formatMoney(
                              row.amount,
                              row.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No refund report
                        data is available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Settlements by
                Currency
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Currency
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Settlements
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Gross
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Fees
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Refunds
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Net
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {settlements.length >
                  0 ? (
                    settlements.map(
                      (
                        row: FinanceReportSettlementCurrency,
                      ) => (
                        <tr
                          key={
                            row.currency
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-bold text-gray-900">
                            {
                              row.currency
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {
                              row.settlement_count
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatMoney(
                              row.gross_amount,
                              row.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatMoney(
                              row.fee_amount,
                              row.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatMoney(
                              row.refund_amount,
                              row.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">
                            {formatMoney(
                              row.net_amount,
                              row.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No settlement
                        report data is
                        available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Unresolved
                Reconciliation by
                Currency
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Only unresolved
                settlement lines are
                included.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Currency
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Lines
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Expected
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Reported
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Difference
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {reconciliation.length >
                  0 ? (
                    reconciliation.map(
                      (
                        row: FinanceReportReconciliationCurrency,
                      ) => (
                        <tr
                          key={
                            row.currency
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-bold text-gray-900">
                            {
                              row.currency
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {
                              row.line_count
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatMoney(
                              row.expected_amount,
                              row.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-700">
                            {formatMoney(
                              row.reported_amount,
                              row.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">
                            {formatMoney(
                              row.reconciliation_difference,
                              row.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No unresolved
                        reconciliation
                        evidence is
                        available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-bold text-gray-900">
                Audit Filters
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Filter sanitized
                tenant-owned payment
                audit evidence.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Action
                </label>

                <select
                  value={
                    actionFilter
                  }
                  onChange={(event) => {
                    setActionFilter(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">
                    All actions
                  </option>

                  {actions.map(
                    (action) => (
                      <option
                        key={action}
                        value={action}
                      >
                        {titleCase(
                          action,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Provider
                </label>

                <select
                  value={
                    providerFilter
                  }
                  onChange={(event) => {
                    setProviderFilter(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">
                    All providers
                  </option>

                  {providers.map(
                    (provider) => (
                      <option
                        key={provider}
                        value={provider}
                      >
                        {provider}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  From
                </label>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  To
                </label>

                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(event) => {
                    setDateTo(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  disabled={!hasFilters}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <h2 className="font-bold text-gray-900">
                  Payment Audit
                  History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Append-only,
                  tenant-scoped,
                  sanitized audit
                  evidence.
                </p>
              </div>

              <FileSpreadsheet className="h-5 w-5 text-gray-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Event
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Transition
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Provider
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Related Evidence
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Occurred
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        Loading audit
                        history…
                      </td>
                    </tr>
                  ) : audits.length >
                    0 ? (
                    audits.map(
                      (
                        audit: FinanceAuditRow,
                      ) => (
                        <tr
                          key={
                            audit.uuid
                          }
                          className="align-top hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">
                              {titleCase(
                                audit.action,
                              )}
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              Actor{" "}
                              {audit.actor_id ??
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <StatusTransition
                              previous={
                                audit.previous_status
                              }
                              next={
                                audit.new_status
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                            {formatMoney(
                              audit.amount,
                              audit.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            <div>
                              {audit.provider_identifier ??
                                "—"}
                            </div>

                            <div className="mt-1 font-mono text-xs text-gray-500">
                              {audit.masked_provider_reference ??
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1 text-xs text-gray-600">
                              {audit.order_id && (
                                <div>
                                  Order #
                                  {
                                    audit.order_id
                                  }
                                </div>
                              )}

                              {audit.payment_id && (
                                <div>
                                  Payment #
                                  {
                                    audit.payment_id
                                  }
                                </div>
                              )}

                              {audit.payment_transaction_id && (
                                <div>
                                  Transaction #
                                  {
                                    audit.payment_transaction_id
                                  }
                                </div>
                              )}

                              {audit.payment_refund_id && (
                                <div>
                                  Refund #
                                  {
                                    audit.payment_refund_id
                                  }
                                </div>
                              )}

                              {audit.payment_settlement_id && (
                                <div>
                                  Settlement #
                                  {
                                    audit.payment_settlement_id
                                  }
                                </div>
                              )}

                              {audit.correlation_id && (
                                <div className="font-mono text-gray-500">
                                  Corr:{" "}
                                  {
                                    audit.correlation_id
                                  }
                                </div>
                              )}

                              {!audit.order_id &&
                                !audit.payment_id &&
                                !audit.payment_transaction_id &&
                                !audit.payment_refund_id &&
                                !audit.payment_settlement_id &&
                                !audit.correlation_id && (
                                  <span className="text-gray-400">
                                    —
                                  </span>
                                )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {formatDateTime(
                              audit.occurred_at,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No audit events
                        match the current
                        filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <div className="text-sm text-gray-500">
                Page{" "}
                <span className="font-semibold text-gray-900">
                  {response?.current_page ??
                    1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {response?.last_page ??
                    1}
                </span>
                {" · "}
                {response?.total ?? 0}{" "}
                audit events
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((value) =>
                      Math.max(
                        1,
                        value - 1,
                      ),
                    )
                  }
                  disabled={
                    loading ||
                    page <= 1
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage((value) =>
                      value + 1,
                    )
                  }
                  disabled={
                    loading ||
                    page >=
                      (response?.last_page ??
                        1)
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

              <div>
                <h2 className="font-bold text-amber-900">
                  Export boundaries
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  CSV exports contain allowlisted tenant Finance fields only. Import and accounting-adjustment controls remain unavailable because no governed backend workflow exists for them.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PermissionGuard>
  );
}
