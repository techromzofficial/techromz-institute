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
  Clock3,
  CreditCard,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
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
import {
  DashboardGrid,
  KpiCard,
} from "@/components/admin/shared/KpiCard";
import { useAdminContext } from "@/contexts/AdminContext";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions/financePermissions";
import {
  financeApi,
  type FinancePaymentOperation,
  type FinancePaymentRow,
  type FinancePaymentStatus,
  type FinancePaymentsResponse,
} from "@/lib/api/finance";

type PaymentTab =
  | "all"
  | FinancePaymentStatus;

const STATUS_TABS: Array<{
  id: PaymentTab;
  label: string;
}> = [
  { id: "all", label: "All Payments" },
  { id: "created", label: "Created" },
  { id: "pending", label: "Pending" },
  {
    id: "requires_action",
    label: "Requires Action",
  },
  { id: "authorized", label: "Authorized" },
  { id: "captured", label: "Captured" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
  {
    id: "partially_refunded",
    label: "Partially Refunded",
  },
  { id: "refunded", label: "Refunded" },
];

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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
  amount: string,
  currency: string | null,
): string {
  const numeric = Number(amount);

  if (!Number.isFinite(numeric)) {
    return `${currency ?? ""} ${amount}`.trim();
  }

  if (!currency) {
    return numeric.toLocaleString();
  }

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      },
    ).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

function PaymentStatusBadge({
  status,
}: {
  status: FinancePaymentStatus;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold";

  if (status === "captured") {
    return (
      <span
        className={`${base} border-green-200 bg-green-50 text-green-700`}
      >
        <CheckCircle2 size={11} />
        Captured
      </span>
    );
  }

  if (
    status === "failed" ||
    status === "cancelled"
  ) {
    return (
      <span
        className={`${base} border-rose-200 bg-rose-50 text-rose-700`}
      >
        <AlertTriangle size={11} />
        {status === "failed"
          ? "Failed"
          : "Cancelled"}
      </span>
    );
  }

  if (
    status === "refunded" ||
    status === "partially_refunded"
  ) {
    return (
      <span
        className={`${base} border-blue-200 bg-blue-50 text-blue-700`}
      >
        <RotateCcw size={11} />
        {status === "refunded"
          ? "Refunded"
          : "Partially Refunded"}
      </span>
    );
  }

  if (
    status === "pending" ||
    status === "requires_action" ||
    status === "authorized"
  ) {
    return (
      <span
        className={`${base} border-amber-200 bg-amber-50 text-amber-700`}
      >
        <Clock3 size={11} />
        {status
          .replaceAll("_", " ")
          .replace(/\b\w/g, (value) =>
            value.toUpperCase(),
          )}
      </span>
    );
  }

  return (
    <span
      className={`${base} border-gray-200 bg-gray-50 text-gray-600`}
    >
      {status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (value) =>
          value.toUpperCase(),
        )}
    </span>
  );
}

export default function FinancePaymentsPage() {
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

  const [activeTab, setActiveTab] =
    useState<PaymentTab>("all");

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [provider, setProvider] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [response, setResponse] =
    useState<FinancePaymentsResponse | null>(
      null,
    );

  const [operations, setOperations] = useState<FinancePaymentOperation[]>([]);

  const fetchPayments =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [paymentResult, operationResult] = await Promise.allSettled([
          financeApi.getPayments({
            search:
              search || undefined,

            status:
              activeTab === "all"
                ? undefined
                : activeTab,

            provider:
              provider || undefined,

            page,
            per_page: 15,
          }),
          financeApi.getPaymentOperations({ per_page: 20 }),
        ]);

        if (paymentResult.status === "rejected") {
          throw paymentResult.reason;
        }

        setResponse(paymentResult.value);

        if (operationResult.status === "fulfilled") {
          setOperations(operationResult.value.data);
        } else {
          console.warn(
            "Administrative payment operation evidence is unavailable:",
            operationResult.reason,
          );
          setOperations([]);
        }
      } catch (reason) {
        const requestError =
          reason as Error & {
            referenceId?: string | null;
          };

        console.error(
          "Failed to load Finance payments:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load payment records.",
        );
        setOperations([]);
      } finally {
        setLoading(false);
      }
    }, [
      activeTab,
      canView,
      page,
      provider,
      search,
    ]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const payments =
    response?.data ?? [];

  const summary =
    response?.summary ?? {
      total: 0,
      created: 0,
      pending: 0,
      requires_action: 0,
      authorized: 0,
      captured: 0,
      failed: 0,
      cancelled: 0,
      partially_refunded: 0,
      refunded: 0,
      amounts_by_currency: [],
    };

  const providers =
    response?.filters.providers ?? [];

  const meta = {
    current_page:
      response?.current_page ?? 1,
    per_page:
      response?.per_page ?? 15,
    total:
      response?.total ?? 0,
    last_page:
      response?.last_page ?? 1,
  };

  const statusChartData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Captured", value: summary.captured || 0, color: "#10b981" },
      { name: "Pending", value: summary.pending || 0, color: "#f59e0b" },
      { name: "Authorized", value: summary.authorized || 0, color: "#3b82f6" },
      { name: "Failed", value: summary.failed || 0, color: "#ef4444" },
      { name: "Cancelled", value: summary.cancelled || 0, color: "#64748b" },
      { name: "Refunded", value: (summary.refunded || 0) + (summary.partially_refunded || 0), color: "#8b5cf6" },
    ];
  }, [summary]);

  const providerChartData = useMemo(() => {
    const map: Record<string, { provider: string; count: number; totalAmount: number }> = {};
    payments.forEach((p) => {
      const name = p.provider?.identifier || p.payment_method?.name || "Standard";
      if (!map[name]) {
        map[name] = { provider: name, count: 0, totalAmount: 0 };
      }
      map[name].count += 1;
      map[name].totalAmount += Number(p.amount) || 0;
    });
    return Object.values(map);
  }, [payments]);

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

  const statusCounts = useMemo(
    () => ({
      all: summary.total,
      created: summary.created,
      pending: summary.pending,
      requires_action:
        summary.requires_action,
      authorized: summary.authorized,
      captured: summary.captured,
      failed: summary.failed,
      cancelled: summary.cancelled,
      partially_refunded:
        summary.partially_refunded,
      refunded: summary.refunded,
    }),
    [summary],
  );

  const handleSearchSubmit = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setProvider("");
    setActiveTab("all");
    setPage(1);
  };

  const handleFailedReview = () => {
    setActiveTab("failed");
    setPage(1);
  };

  const selectPayment = (
    payment: FinancePaymentRow,
  ) => {
    window.location.href =
      `/admin/finance/payments/${payment.id}`;
  };

  return (
    <PermissionGuard
      permission={FINANCE_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">
              Finance access required
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to
              view Finance payment records for
              the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen w-full bg-[#faf8f8] text-gray-900">
        <main className="min-w-0 flex-grow px-6 py-4 pb-12">
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
                Finance / Payments &amp;
                Transactions
              </div>

              <h1 className="text-2xl font-bold leading-tight text-gray-900">
                Payments &amp; Transaction
                Management
              </h1>

              <p className="mt-1 max-w-4xl text-xs text-gray-500">
                Monitor tenant-scoped payments,
                payment lifecycle status,
                providers, fees and transaction
                references.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFailedReview}
                className="flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <ShieldAlert size={13} />
                Review Failed Payments
              </button>

              <button
                type="button"
                onClick={() =>
                  void fetchPayments()
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
            </div>
          </header>

          <ContextScopeBar
            items={contextItems}
          />

          <div className="mt-4">
            <DashboardGrid>
              <KpiCard
                title="Total Payments"
                value={summary.total}
                icon={WalletCards}
              />

              <KpiCard
                title="Captured"
                value={summary.captured}
                icon={CheckCircle2}
              />

              <KpiCard
                title="Pending"
                value={
                  summary.pending +
                  summary.requires_action +
                  summary.authorized
                }
                icon={Clock3}
              />

              <KpiCard
                title="Failed"
                value={summary.failed}
                icon={ShieldAlert}
              />

              <KpiCard
                title="Refunded"
                value={
                  summary.refunded +
                  summary.partially_refunded
                }
                icon={RotateCcw}
              />
            </DashboardGrid>
          </div>

          {summary.amounts_by_currency.length >
            0 && (
            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-gray-900">
                  Payment Value by Currency
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  Currency totals are kept
                  separate and are never
                  combined across currencies.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summary.amounts_by_currency.map(
                  (item) => (
                    <div
                      key={item.currency}
                      className="rounded-md border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        {item.currency}
                      </div>

                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {formatMoney(
                          item.amount,
                          item.currency,
                        )}
                      </div>

                      <div className="mt-1 text-[11px] text-gray-500">
                        {item.payment_count} payments
                        · Fees{" "}
                        {formatMoney(
                          item.fees,
                          item.currency,
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
                <h2 className="text-sm font-bold text-gray-900">Payment Methods &amp; Provider Breakdown</h2>
                <p className="text-[11px] text-gray-500">Live payment counts and transaction values by provider</p>
              </div>
              <div className="h-60 w-full">
                {providerChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={providerChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="provider" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Payment Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalAmount" name="Total Volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No payment provider evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Payment Status Lifecycle</h2>
                <p className="text-[11px] text-gray-500">Distribution of active payment states</p>
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
                    No payment status evidence available
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Administrative Operation Evidence</h2>
              <p className="mt-0.5 text-[11px] text-gray-500">Recent capture and cancellation claims. An unknown outcome is unresolved provider evidence, not a success or failure.</p>
            </div>
            {loading && operations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">Loading operation evidence...</div>
            ) : operations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No administrative payment operations are recorded for this tenant.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase text-gray-500"><tr><th className="px-4 py-2.5">Payment</th><th className="px-4 py-2.5">Operation</th><th className="px-4 py-2.5">State</th><th className="px-4 py-2.5">Actor</th><th className="px-4 py-2.5">Requested</th><th className="px-4 py-2.5">Provider evidence</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {operations.map((operation) => (
                      <tr key={operation.id} className={operation.status === "outcome_unknown" ? "bg-amber-50" : ""}>
                        <td className="px-4 py-3"><Link className="font-bold text-[#7a0023] hover:underline" href={`/admin/finance/payments/${operation.payment_id}`}>{operation.payment_number ?? `Payment #${operation.payment_id}`}</Link></td>
                        <td className="px-4 py-3 font-semibold">{operation.operation === "capture" ? "Capture" : "Cancel"}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${operation.status === "outcome_unknown" ? "bg-amber-200 text-amber-900" : operation.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{operation.status === "outcome_unknown" ? "Reconciliation required" : operation.status.replaceAll("_", " ")}</span></td>
                        <td className="px-4 py-3">{operation.actor?.name ?? operation.actor?.email ?? "Unavailable"}</td>
                        <td className="px-4 py-3">{formatDate(operation.created_at)}</td>
                        <td className="px-4 py-3"><div>{operation.provider_identifier}</div><div className="mt-0.5 max-w-[220px] truncate text-[10px] text-gray-500">{operation.provider_result_reference ?? "No confirmed result reference"}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto border-b border-gray-200 px-2">
              <nav
                className="flex min-w-max items-center gap-1"
                aria-label="Payment status tabs"
              >
                {STATUS_TABS.map((tab) => {
                  const active =
                    activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setPage(1);
                      }}
                      className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? "border-[#7a0023] bg-rose-50/50 font-bold text-[#7a0023]"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}

                      <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">
                        {
                          statusCounts[
                            tab.id
                          ]
                        }
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Search Payments
                </label>

                <div className="flex gap-2">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        handleSearchSubmit();
                      }
                    }}
                    placeholder="Payment number, order number or provider reference..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] focus:border-[#7a0023] focus:outline-none focus:ring-1 focus:ring-[#7a0023]"
                  />

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="rounded-md bg-[#7a0023] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#65001d]"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="min-w-[220px]">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Provider
                </label>

                <select
                  value={provider}
                  onChange={(event) => {
                    setProvider(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] text-gray-700 focus:border-[#7a0023] focus:outline-none focus:ring-1 focus:ring-[#7a0023]"
                >
                  <option value="">
                    All Providers
                  </option>

                  {providers.map(
                    (providerName) => (
                      <option
                        key={providerName}
                        value={providerName}
                      >
                        {providerName}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>

            {error && (
              <div
                className="m-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2.5">
                      Payment
                    </th>

                    <th className="px-4 py-2.5">
                      Order / Customer
                    </th>

                    <th className="px-4 py-2.5">
                      Amount
                    </th>

                    <th className="px-4 py-2.5">
                      Fee
                    </th>

                    <th className="px-4 py-2.5">
                      Method
                    </th>

                    <th className="px-4 py-2.5">
                      Provider
                    </th>

                    <th className="px-4 py-2.5">
                      Status
                    </th>

                    <th className="px-4 py-2.5">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading &&
                    payments.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          Loading payment
                          records...
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    payments.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center"
                        >
                          <CreditCard
                            size={28}
                            className="mx-auto mb-2 text-gray-300"
                          />

                          <div className="font-semibold text-gray-700">
                            No payments found
                          </div>

                          <div className="mt-1 text-[11px] text-gray-500">
                            No payment records
                            match the current
                            tenant and filters.
                          </div>
                        </td>
                      </tr>
                    )}

                  {payments.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        onClick={() =>
                          selectPayment(
                            payment,
                          )
                        }
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="font-bold text-gray-900">
                            {
                              payment.payment_number
                            }
                          </div>

                          <div className="mt-0.5 text-[10px] text-gray-500">
                            Invoice{" "}
                            {payment.invoice_id ??
                              "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-gray-800">
                            {payment.order
                              ?.order_number ??
                              "—"}
                          </div>

                          <div className="mt-0.5 text-[10px] text-gray-500">
                            {payment.customer
                              ?.name ??
                              payment.customer
                                ?.email ??
                              "No customer data"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top font-semibold text-gray-900">
                          {formatMoney(
                            payment.amount,
                            payment.currency,
                          )}
                        </td>

                        <td className="px-4 py-3 align-top text-gray-600">
                          {formatMoney(
                            payment.fee_amount,
                            payment.currency,
                          )}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-gray-700">
                            {payment
                              .payment_method
                              ?.name ?? "—"}
                          </div>

                          <div className="mt-0.5 text-[10px] text-gray-500">
                            {payment
                              .payment_method
                              ?.method_type ??
                              "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-gray-700">
                            {payment.provider
                              .identifier ??
                              "—"}
                          </div>

                          <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-gray-500">
                            {payment.provider
                              .reference ??
                              "No reference"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <PaymentStatusBadge
                            status={
                              payment.status
                            }
                          />

                          {payment.payment_status &&
                            payment.payment_status !==
                              payment.status && (
                              <div className="mt-1 text-[9px] text-gray-400">
                                Secondary:{" "}
                                {
                                  payment.payment_status
                                }
                              </div>
                            )}
                        </td>

                        <td className="px-4 py-3 align-top text-[11px] text-gray-600">
                          {formatDate(
                            payment.created_at,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-gray-500">
                Showing page{" "}
                {meta.current_page} of{" "}
                {meta.last_page} ·{" "}
                {meta.total} total payments
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    loading ||
                    meta.current_page <= 1
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                    )
                  }
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    loading ||
                    meta.current_page >=
                      meta.last_page
                  }
                  onClick={() =>
                    setPage((current) =>
                      current + 1,
                    )
                  }
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PermissionGuard>
  );
}
