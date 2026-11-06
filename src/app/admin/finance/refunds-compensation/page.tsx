"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Search,
  WalletCards,
  XCircle,
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
import {
  DashboardGrid,
  KpiCard,
} from "@/components/admin/shared/KpiCard";
import { useAdminContext } from "@/contexts/AdminContext";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions/financePermissions";
import {
  financeApi,
  type FinanceRefundCapabilities,
  type FinanceRefundDetail,
  type FinanceRefundRow,
  type FinanceRefundSummary,
} from "@/lib/api/finance";

function formatMoney(
  amount: string | null,
  currency: string | null,
): string {
  if (amount === null) {
    return "—";
  }

  const numeric = Number(amount);

  if (!Number.isFinite(numeric)) {
    return `${currency ?? ""} ${amount}`.trim();
  }

  if (!currency) {
    return numeric.toLocaleString();
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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

const newRefundKey = () => `admin-refund-${crypto.randomUUID()}`;

function RefundStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (normalized === "refunded") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Refunded
      </span>
    );
  }

  if (normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <RotateCcw size={11} />
        Pending
      </span>
    );
  }

  if (normalized === "outcome_unknown") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
        <AlertTriangle size={11} />
        Reconciliation required
      </span>
    );
  }

  if (normalized === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <AlertTriangle size={11} />
        Failed
      </span>
    );
  }

  if (normalized === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
        <XCircle size={11} />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
      {titleCase(status)}
    </span>
  );
}

export default function FinanceRefundsPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    FINANCE_PERMISSIONS.view,
  );

  const canManageRefunds = hasPermission(FINANCE_PERMISSIONS.refundsManage);

  const [rows, setRows] = useState<
    FinanceRefundRow[]
  >([]);

  const [summary, setSummary] =
    useState<FinanceRefundSummary | null>(
      null,
    );

  const [providers, setProviders] =
    useState<string[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [provider, setProvider] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [capabilities, setCapabilities] = useState<FinanceRefundCapabilities | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<FinanceRefundDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundCurrency, setRefundCurrency] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundKey, setRefundKey] = useState(newRefundKey);

  const fetchRefunds =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await financeApi.getRefunds({
            search:
              search.trim() || undefined,
            status:
              status || undefined,
            provider:
              provider || undefined,
            page,
            per_page: 20,
          });

        setRows(response.data);
        setSummary(response.summary);
        setProviders(
          response.filters.providers,
        );
        setLastPage(
          response.last_page,
        );
        setTotal(response.total);
        setCapabilities(response.capabilities);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load refunds:",
          requestError,
        );

        setRows([]);
        setSummary(null);
        setCapabilities(null);

        setError(
          requestError.message ||
            "Failed to load refunds.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      page,
      provider,
      search,
      status,
    ]);

  useEffect(() => {
    void fetchRefunds();
  }, [fetchRefunds]);

  const refundVolumeChart = useMemo(() => {
    if (!summary?.amounts_by_currency) return [];
    return summary.amounts_by_currency.map((c) => ({
      currency: c.currency,
      Amount: Number(c.amount) || 0,
      Count: c.refund_count || 0,
    }));
  }, [summary]);

  const statusChartData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Succeeded", value: summary.refunded || 0, color: "#10b981" },
      { name: "Pending", value: summary.pending || 0, color: "#f59e0b" },
      { name: "Failed", value: summary.failed || 0, color: "#ef4444" },
      { name: "Unknown Outcome", value: summary.status_counts?.outcome_unknown || 0, color: "#64748b" },
    ];
  }, [summary]);

  const openRefund = async (id: number) => {
    setDetailLoading(true);
    setActionError(null);
    try {
      const response = await financeApi.getRefund(id);
      setSelectedRefund(response.data);
    } catch (reason) {
      setActionError((reason as Error).message || "Failed to load refund evidence.");
    } finally {
      setDetailLoading(false);
    }
  };

  const submitRefund = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const response = await financeApi.requestRefund({
        payment_reference: paymentReference.trim(),
        amount: refundAmount.trim(),
        currency: refundCurrency.trim().toUpperCase(),
        idempotency_key: refundKey,
        reason: refundReason.trim() || undefined,
      });
      setSelectedRefund(response.data);
      setActionMessage(response.message || "Refund request processed through the configured provider.");
      setPaymentReference("");
      setRefundAmount("");
      setRefundCurrency("");
      setRefundReason("");
      setRefundKey(newRefundKey());
      await fetchRefunds();
    } catch (reason) {
      setActionError((reason as Error).message || "Refund request could not be processed.");
    } finally {
      setSubmitting(false);
    }
  };

  const contextItems = [
    {
      label: "Tenant",
      value: tenant.name,
    },
    {
      label: "Ecosystem",
      value: ecosystem.name,
    },
    {
      label: "Business Unit",
      value:
        businessUnit?.name ??
        "All permitted units",
    },
    {
      label: "Channel",
      value:
        channel?.name ??
        "All permitted channels",
    },
    {
      label: "Sector Pack",
      value:
        sectorPack?.name ??
        "Not assigned",
    },
  ];

  const statusOptions = useMemo(
    () => [
      "",
      ...Object.keys(
        summary?.status_counts ?? {},
      ),
    ],
    [summary],
  );

  return (
    <PermissionGuard
      permission={
        FINANCE_PERMISSIONS.view
      }
      fallback={
        <div className="p-6" role="alert">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">
              Finance access required
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to
              view refund administration for
              the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen w-full bg-[#faf8f8] text-gray-900">
        <main className="px-6 py-4 pb-12">
          <header className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
                <Link
                href="/admin/finance"
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                <ArrowLeft size={14} />
                Back to Finance
                </Link>
              <div className="mb-1 text-[11px] font-medium text-gray-500">
                Finance / Refunds
              </div>

              <h1 className="text-2xl font-bold leading-tight text-gray-900">
                Refunds &amp; Refund
                Operations
              </h1>

              <p className="mt-1 max-w-4xl text-xs text-gray-500">
                Review tenant-scoped payment
                refunds and provider evidence.
                Compensation is not available
                because the current Finance
                domain has no authoritative
                compensation workflow.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchRefunds()
              }
              disabled={loading}
              className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
          />

          {canManageRefunds && capabilities?.request_refund && (
            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900">Request provider refund</h2>
              <p className="mt-1 text-xs text-gray-500">This executes directly through the canonical refund provider path. Only captured payments are eligible; the same request key is retained after an error to prevent duplicate effects.</p>
              <form onSubmit={submitRefund} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input required value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="Payment number or UUID" className="h-9 rounded border border-gray-300 px-3 text-xs" />
                <input required inputMode="decimal" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} placeholder="Amount" className="h-9 rounded border border-gray-300 px-3 text-xs" />
                <input required maxLength={3} value={refundCurrency} onChange={(event) => setRefundCurrency(event.target.value)} placeholder="Currency (USD)" className="h-9 rounded border border-gray-300 px-3 text-xs uppercase" />
                <input value={refundReason} onChange={(event) => setRefundReason(event.target.value)} placeholder="Reason (optional)" className="h-9 rounded border border-gray-300 px-3 text-xs" />
                <button disabled={submitting} type="submit" className="h-9 rounded bg-[#7a0023] px-4 text-xs font-bold text-white disabled:opacity-50">{submitting ? "Processing..." : "Request refund"}</button>
              </form>
              {actionError && <div role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{actionError}</div>}
              {actionMessage && <div role="status" className="mt-3 rounded border border-green-200 bg-green-50 p-3 text-xs text-green-700">{actionMessage}</div>}
            </section>
          )}

          <div className="mt-4">
            <DashboardGrid>
              <KpiCard
                title="Refunds"
                value={String(
                  summary?.total ?? total,
                )}
                icon={RotateCcw}
              />

              <KpiCard
                title="Refunded"
                value={String(
                  summary?.refunded ?? 0,
                )}
                icon={CheckCircle2}
              />

              <KpiCard
                title="Pending"
                value={String(
                  summary?.pending ?? 0,
                )}
                icon={WalletCards}
              />

              <KpiCard
                title="Failed"
                value={String(
                  summary?.failed ?? 0,
                )}
                icon={AlertTriangle}
              />
            </DashboardGrid>
          </div>

          {summary &&
            summary.amounts_by_currency
              .length > 0 && (
              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <h2 className="text-sm font-bold text-gray-900">
                    Refund Amounts by Currency
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Refund totals remain
                    separated by currency.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {summary.amounts_by_currency.map(
                    (currency) => (
                      <div
                        key={
                          currency.currency
                        }
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {currency.currency}
                          </span>

                          <span className="text-[10px] font-semibold text-gray-500">
                            {
                              currency.refund_count
                            }{" "}
                            refund
                            {currency.refund_count ===
                            1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        <div className="mt-3 text-lg font-bold text-gray-900">
                          {formatMoney(
                            currency.amount,
                            currency.currency,
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

          {/* Visual Recharts Analytics Section */}
          <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Refund Volume by Currency</h2>
                <p className="text-[11px] text-gray-500">Live DB refund values and record counts by currency</p>
              </div>
              <div className="h-60 w-full">
                {refundVolumeChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={refundVolumeChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="currency" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Count" name="Refund Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Amount" name="Total Refund Value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No refund evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Refund Status Distribution</h2>
                <p className="text-[11px] text-gray-500">Succeeded, Pending, Failed, and Unknown Outcome states</p>
              </div>
              <div className="h-60 w-full">
                {statusChartData.some((s) => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData.filter((s) => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusChartData.filter((s) => s.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No refund status evidence available
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative xl:col-span-2">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(
                        event.target.value,
                      );
                      setPage(1);
                    }}
                    placeholder="Search refund, payment, order or provider reference"
                    className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-gray-400"
                  />
                </div>

                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-400"
                >
                  <option value="">
                    All refund statuses
                  </option>

                  {statusOptions
                    .filter(Boolean)
                    .map((value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {titleCase(value)}
                      </option>
                    ))}
                </select>

                <select
                  value={provider}
                  onChange={(event) => {
                    setProvider(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-400"
                >
                  <option value="">
                    All providers
                  </option>

                  {providers.map(
                    (value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {error && (
              <div
                className="m-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                role="alert"
              >
                <div className="font-bold">
                  Refunds unavailable
                </div>

                <div className="mt-1 text-xs">
                  {error}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHead>
                      Refund
                    </TableHead>
                    <TableHead>
                      Payment / Order
                    </TableHead>
                    <TableHead>
                      Customer
                    </TableHead>
                    <TableHead align="right">
                      Amount
                    </TableHead>
                    <TableHead>
                      Status
                    </TableHead>
                    <TableHead>
                      Provider
                    </TableHead>
                    <TableHead>
                      Reason
                    </TableHead>
                    <TableHead>
                      Processed
                    </TableHead>
                    <TableHead align="right">
                      History
                    </TableHead>
                    <TableHead align="right">Evidence</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading &&
                    rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          Loading refunds...
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    !error &&
                    rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No refund records found
                          for the current tenant
                          and filters.
                        </td>
                      </tr>
                    )}

                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          {row.refund_number ??
                            `Refund #${row.id}`}
                        </div>

                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {row.uuid}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          {row.payment
                            ?.payment_number ??
                            "—"}
                        </div>

                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {row.order
                            ?.order_number ??
                            "No linked order"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold">
                          {row.order
                            ?.customer?.name ??
                            "—"}
                        </div>

                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {row.order
                            ?.customer?.email ??
                            ""}
                        </div>
                      </TableCell>

                      <TableCell align="right">
                        <span className="font-semibold">
                          {formatMoney(
                            row.amount,
                            row.currency,
                          )}
                        </span>
                      </TableCell>

                      <TableCell>
                        <RefundStatusBadge
                          status={row.status}
                        />
                      </TableCell>

                      <TableCell>
                        <div>
                          {row.provider_identifier ??
                            "—"}
                        </div>

                        <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-gray-400">
                          {row.provider_refund_reference ??
                            "No provider reference"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-[220px] whitespace-normal">
                          {row.reason ??
                            "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        {formatDateTime(
                          row.processed_at,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {row.history_count}
                      </TableCell>
                      <TableCell align="right"><button type="button" onClick={() => void openRefund(row.id)} className="font-bold text-[#7a0023] hover:underline">View</button></TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-gray-500">
                {total === 0
                  ? "No refunds"
                  : `${total} refund${
                      total === 1
                        ? ""
                        : "s"
                    }`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                    )
                  }
                  className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-[11px] font-semibold text-gray-600">
                  Page {page} of{" "}
                  {Math.max(
                    lastPage,
                    1,
                  )}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= lastPage ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        lastPage,
                        current + 1,
                      ),
                    )
                  }
                  className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {(detailLoading || selectedRefund) && (
            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-gray-900">Refund evidence</h2><p className="mt-1 text-xs text-gray-500">Tenant-scoped request, provider, payment, customer and immutable history evidence.</p></div>{selectedRefund && <button type="button" onClick={() => setSelectedRefund(null)} className="text-xs font-semibold text-gray-500">Close</button>}</div>
              {detailLoading ? <div className="py-8 text-center text-xs text-gray-500">Loading refund evidence...</div> : selectedRefund && <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Evidence label="Refund" value={selectedRefund.refund_number ?? selectedRefund.uuid} />
                  <Evidence label="Status" value={titleCase(selectedRefund.status)} />
                  <Evidence label="Amount" value={formatMoney(selectedRefund.amount, selectedRefund.currency)} />
                  <Evidence label="Requested" value={formatDateTime(selectedRefund.created_at)} />
                  <Evidence label="Payment" value={selectedRefund.payment?.payment_number ?? "—"} />
                  <Evidence label="Order" value={selectedRefund.order?.order_number ?? "—"} />
                  <Evidence label="Customer" value={selectedRefund.order?.customer?.name ?? selectedRefund.order?.customer?.email ?? "—"} />
                  <Evidence label="Provider reference" value={selectedRefund.provider_refund_reference ?? "Not supplied"} />
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4"><h3 className="text-xs font-bold text-gray-900">Status history</h3>{selectedRefund.history.length === 0 ? <p className="mt-3 text-xs text-gray-500">No status history is recorded.</p> : <div className="mt-3 space-y-2">{selectedRefund.history.map((entry) => <div key={entry.id} className="rounded border border-gray-200 bg-gray-50 p-3 text-xs"><div className="font-semibold text-gray-900">{titleCase(entry.previous_status)} → {titleCase(entry.new_status)}</div><div className="mt-1 text-gray-500">{formatDateTime(entry.occurred_at)} · {entry.actor?.name ?? entry.actor?.email ?? "System/provider"}</div>{entry.provider_reference && <div className="mt-1 text-gray-500">Provider reference: {entry.provider_reference}</div>}</div>)}</div>}</div>
              </>}
            </section>
          )}

          <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <RotateCcw
                size={18}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Refund Controls
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Authorized refund requests execute through the canonical provider-backed workflow. Cancellation, retry, approval, rejection and compensation are not shown because those lifecycle operations do not exist in the production domain.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PermissionGuard>
  );
}

function Evidence({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</div><div className="mt-1 break-words text-xs font-semibold text-gray-800">{value}</div></div>;
}

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-gray-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-xs text-gray-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
