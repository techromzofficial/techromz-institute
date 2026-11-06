"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  RefreshCw,
  Scale,
  Search,
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
  type FinanceSettlementRow,
  type FinanceSettlementSummary,
  type FinanceSettlementCapabilities,
  type FinanceSettlementImportPayload,
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

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
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

function SettlementStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (normalized === "finalized") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Finalized
      </span>
    );
  }

  if (normalized === "imported") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
        <WalletCards size={11} />
        Imported
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
      {titleCase(status)}
    </span>
  );
}

function ReconciliationBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (normalized === "matched") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Matched
      </span>
    );
  }

  if (normalized === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Scale size={11} />
        Processing
      </span>
    );
  }

  if (normalized === "discrepancy") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <AlertTriangle size={11} />
        Discrepancy
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
      {titleCase(status)}
    </span>
  );
}

export default function FinanceSettlementsPage() {
  const router = useRouter();

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

  const [rows, setRows] = useState<
    FinanceSettlementRow[]
  >([]);

  const [summary, setSummary] =
    useState<FinanceSettlementSummary | null>(
      null,
    );

  const [providers, setProviders] = useState<
    string[]
  >([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [
    reconciliationStatus,
    setReconciliationStatus,
  ] = useState("");

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
  const [capabilities, setCapabilities] = useState<FinanceSettlementCapabilities | null>(null);
  const [importPayload, setImportPayload] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchSettlements =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await financeApi.getSettlements({
            search:
              search.trim() || undefined,
            status:
              status || undefined,
            reconciliation_status:
              reconciliationStatus ||
              undefined,
            provider:
              provider || undefined,
            page,
            per_page: 20,
          });

        setRows(response.data);
        setSummary(response.summary);
        setCapabilities(response.capabilities);
        setProviders(
          response.filters.providers,
        );
        setLastPage(
          response.last_page,
        );
        setTotal(response.total);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load settlements:",
          requestError,
        );

        setRows([]);
        setSummary(null);
        setCapabilities(null);

        setError(
          requestError.message ||
            "Failed to load settlements.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      page,
      provider,
      reconciliationStatus,
      search,
      status,
    ]);

  useEffect(() => {
    void fetchSettlements();
  }, [fetchSettlements]);

  const importSettlement = async () => {
    setImporting(true);
    setError(null);
    try {
      const payload = JSON.parse(importPayload) as FinanceSettlementImportPayload;
      await financeApi.importSettlement(payload);
      setImportPayload("");
      await fetchSettlements();
    } catch (reason) {
      setError((reason as Error).message || "Settlement import failed.");
    } finally {
      setImporting(false);
    }
  };

  const settlementVolumeChart = useMemo(() => {
    if (!summary?.amounts_by_currency) return [];
    return summary.amounts_by_currency.map((c) => ({
      currency: c.currency,
      Gross: Number(c.gross_amount) || 0,
      Fees: Number(c.fee_amount) || 0,
      Refunds: Number(c.refund_amount) || 0,
      Net: Number(c.net_amount) || 0,
    }));
  }, [summary]);

  const statusChartData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Finalized", value: summary.finalized || 0, color: "#10b981" },
      { name: "Discrepant", value: summary.discrepancies || 0, color: "#ef4444" },
      { name: "Open", value: summary.status_counts?.processing || 0, color: "#f59e0b" },
      { name: "Total", value: summary.total || 0, color: "#6366f1" },
    ];
  }, [summary]);

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

  const finalizedCount =
    summary?.finalized ?? 0;

  const matchedCount =
    summary?.matched ?? 0;

  const discrepancyCount =
    summary?.discrepancies ?? 0;

  const totalCount =
    summary?.total ?? total;

  const statusOptions = useMemo(
    () => [
      "",
      ...Object.keys(
        summary?.status_counts ?? {},
      ),
    ],
    [summary],
  );

  const reconciliationOptions =
    useMemo(
      () => [
        "",
        ...Object.keys(
          summary?.reconciliation_counts ??
            {},
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
              view settlement administration
              for the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen w-full bg-[#faf8f8] text-gray-900">
        <main className="px-6 py-4 pb-12">
          <header className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="mb-1 text-[11px] font-medium text-gray-500">
                Finance / Settlements
              </div>

              <h1 className="text-2xl font-bold leading-tight text-gray-900">
                Settlements &amp;
                Reconciliation
              </h1>

              <p className="mt-1 max-w-4xl text-xs text-gray-500">
                Review authoritative payment
                settlement batches, financial
                totals and reconciliation
                status. Payout scheduling and
                approval workflows are not
                available in the current
                Finance domain.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchSettlements()
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

          {capabilities?.import && (
            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900">Import provider settlement evidence</h2>
              <p className="mt-1 text-xs text-gray-500">Paste the canonical structured settlement payload. Tenant context is resolved by the server; do not include a tenant ID.</p>
              <textarea
                value={importPayload}
                onChange={(event) => setImportPayload(event.target.value)}
                placeholder='{"provider_config_id":1,"provider_settlement_reference":"...","period_start":"2026-09-01","period_end":"2026-09-01","gross_amount":"0.00","fee_amount":"0.00","refund_amount":"0.00","net_amount":"0.00","currency":"USD","lines":[]}'
                className="mt-3 min-h-28 w-full rounded-md border border-gray-200 p-3 font-mono text-xs outline-none focus:border-gray-400"
              />
              <button type="button" onClick={() => void importSettlement()} disabled={importing || !importPayload.trim()} className="mt-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                {importing ? "Importing..." : "Import and reconcile evidence"}
              </button>
            </section>
          )}

          <div className="mt-4">
            <DashboardGrid>
              <KpiCard
                title="Settlements"
                value={String(totalCount)}
                icon={WalletCards}
              />

              <KpiCard
                title="Finalized"
                value={String(
                  finalizedCount,
                )}
                icon={CheckCircle2}
              />

              <KpiCard
                title="Matched"
                value={String(
                  matchedCount,
                )}
                icon={Scale}
              />

              <KpiCard
                title="Discrepancies"
                value={String(
                  discrepancyCount,
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
                    Settlement Totals by
                    Currency
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Currency totals remain
                    separated. Values are never
                    aggregated across different
                    currencies.
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
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {currency.currency}
                          </span>

                          <span className="text-[10px] font-semibold text-gray-500">
                            {
                              currency.settlement_count
                            }{" "}
                            settlement
                            {currency.settlement_count ===
                            1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <MoneyItem
                            label="Gross"
                            value={formatMoney(
                              currency.gross_amount,
                              currency.currency,
                            )}
                          />

                          <MoneyItem
                            label="Fees"
                            value={formatMoney(
                              currency.fee_amount,
                              currency.currency,
                            )}
                          />

                          <MoneyItem
                            label="Refunds"
                            value={formatMoney(
                              currency.refund_amount,
                              currency.currency,
                            )}
                          />

                          <MoneyItem
                            label="Net"
                            value={formatMoney(
                              currency.net_amount,
                              currency.currency,
                            )}
                          />
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
                <h2 className="text-sm font-bold text-gray-900">Settlement Volume (Gross, Fees, Refunds, Net)</h2>
                <p className="text-[11px] text-gray-500">Live breakdown of settled bank batches by currency</p>
              </div>
              <div className="h-60 w-full">
                {settlementVolumeChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={settlementVolumeChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="currency" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Gross" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Fees" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Refunds" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Net" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No settlement volume evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Settlement Status Distribution</h2>
                <p className="text-[11px] text-gray-500">Finalized, Open, and Discrepant batch states</p>
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
                    No settlement status evidence available
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
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
                    placeholder="Search settlement reference or provider"
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
                    All settlement statuses
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
                  value={
                    reconciliationStatus
                  }
                  onChange={(event) => {
                    setReconciliationStatus(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-400"
                >
                  <option value="">
                    All reconciliation
                  </option>

                  {reconciliationOptions
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
                  Settlements unavailable
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
                      Settlement
                    </TableHead>
                    <TableHead>
                      Provider
                    </TableHead>
                    <TableHead>
                      Period
                    </TableHead>
                    <TableHead align="right">
                      Gross
                    </TableHead>
                    <TableHead align="right">
                      Fees
                    </TableHead>
                    <TableHead align="right">
                      Refunds
                    </TableHead>
                    <TableHead align="right">
                      Net
                    </TableHead>
                    <TableHead>
                      Status
                    </TableHead>
                    <TableHead>
                      Reconciliation
                    </TableHead>
                    <TableHead align="right">
                      Lines
                    </TableHead>
                    <TableHead align="right">
                      Issues
                    </TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading &&
                    rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={11}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          Loading settlements...
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    !error &&
                    rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={11}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No settlement records
                          found for the current
                          tenant and filters.
                        </td>
                      </tr>
                    )}

                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() =>
                        router.push(
                          `/admin/finance/settlements-payouts/${row.id}`,
                        )
                      }
                      className="cursor-pointer transition hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          {row.provider_settlement_reference ??
                            `Settlement #${row.id}`}
                        </div>

                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {row.uuid}
                        </div>
                      </TableCell>

                      <TableCell>
                        {row.provider_identifier ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        <div>
                          {formatDate(
                            row.period_start,
                          )}
                        </div>

                        <div className="mt-0.5 text-[10px] text-gray-400">
                          to{" "}
                          {formatDate(
                            row.period_end,
                          )}
                        </div>
                      </TableCell>

                      <TableCell align="right">
                        {formatMoney(
                          row.gross_amount,
                          row.currency,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {formatMoney(
                          row.fee_amount,
                          row.currency,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {formatMoney(
                          row.refund_amount,
                          row.currency,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <span className="font-semibold">
                          {formatMoney(
                            row.net_amount,
                            row.currency,
                          )}
                        </span>
                      </TableCell>

                      <TableCell>
                        <SettlementStatusBadge
                          status={row.status}
                        />
                      </TableCell>

                      <TableCell>
                        <ReconciliationBadge
                          status={
                            row.reconciliation_status
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        {row.line_count}
                      </TableCell>

                      <TableCell align="right">
                        <span
                          className={
                            row.discrepancy_count >
                            0
                              ? "font-bold text-rose-700"
                              : "font-semibold text-gray-700"
                          }
                        >
                          {
                            row.discrepancy_count
                          }
                        </span>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-gray-500">
                {total === 0
                  ? "No settlements"
                  : `${total} settlement${
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

          <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Banknote
                size={18}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Current Settlement
                  Capabilities
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  This Admin screen is
                  intentionally read-only.
                  Settlement import and
                  finalization exist in the
                  payment domain, but no Admin
                  operation is exposed here
                  yet. Payout scheduling,
                  release and approval
                  workflows are not represented
                  as available capabilities.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PermissionGuard>
  );
}

function MoneyItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 text-xs font-semibold text-gray-800">
        {value}
      </div>
    </div>
  );
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
