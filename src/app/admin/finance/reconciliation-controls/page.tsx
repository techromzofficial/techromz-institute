"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileWarning,
  Printer,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  X,
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
  type FinanceReconciliationDetail,
  type FinanceReconciliationRow,
  type FinanceReconciliationSummary,
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

function formatDate(
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

  if (
    !Number.isFinite(numeric)
  ) {
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

function ReconciliationBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const normalized =
    String(status ?? "")
      .toLowerCase();

  if (normalized === "matched") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
        <CheckCircle2 size={11} />
        Matched
      </span>
    );
  }

  if (
    normalized === "processing"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Scale size={11} />
        Processing
      </span>
    );
  }

  if (
    normalized === "discrepancy"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <AlertTriangle size={11} />
        Discrepancy
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
      {titleCase(status)}
    </span>
  );
}

function LineStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  if (status === "matched") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 size={10} />
        Matched
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      <AlertTriangle size={10} />
      {titleCase(status)}
    </span>
  );
}

export default function FinanceReconciliationControlsPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView =
    hasPermission(
      FINANCE_PERMISSIONS.view,
    );

  const [rows, setRows] =
    useState<
      FinanceReconciliationRow[]
    >([]);

  const [summary, setSummary] =
    useState<
      FinanceReconciliationSummary | null
    >(null);

  const [providers, setProviders] =
    useState<string[]>([]);

  const [
    lineStatuses,
    setLineStatuses,
  ] =
    useState<string[]>([]);

  const [search, setSearch] =
    useState("");

  const [provider, setProvider] =
    useState("");

  const [
    reconciliationStatus,
    setReconciliationStatus,
  ] = useState("");

  const [
    lineStatus,
    setLineStatus,
  ] = useState("");

  const [currency, setCurrency] =
    useState("");

  const [
    unresolvedOnly,
    setUnresolvedOnly,
  ] = useState(false);

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(canView);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    selected,
    setSelected,
  ] =
    useState<
      FinanceReconciliationDetail | null
    >(null);

  const fetchReconciliation =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await financeApi.getReconciliations({
            search:
              search.trim() ||
              undefined,

            provider:
              provider ||
              undefined,

            reconciliation_status:
              reconciliationStatus ||
              undefined,

            line_status:
              lineStatus ||
              undefined,

            currency:
              currency.trim()
                ? currency
                    .trim()
                    .toUpperCase()
                : undefined,

            unresolved:
              unresolvedOnly
                ? true
                : undefined,

            page,
            per_page: 20,
          });

        setRows(
          response.data,
        );

        setSummary(
          response.summary,
        );

        setProviders(
          response.filters.providers,
        );

        setLineStatuses(
          response.filters
            .line_statuses,
        );

        setLastPage(
          response.last_page,
        );

        setTotal(
          response.total,
        );
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load reconciliation controls:",
          requestError,
        );

        setRows([]);
        setSummary(null);

        setError(
          requestError.message ||
            "Unable to load reconciliation evidence.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      currency,
      lineStatus,
      page,
      provider,
      reconciliationStatus,
      search,
      unresolvedOnly,
    ]);

  useEffect(() => {
    void fetchReconciliation();
  }, [fetchReconciliation]);

  const matchRatioChart = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Matched", value: summary.matched_settlements || 0, color: "#10b981" },
      { name: "Discrepancies", value: summary.discrepancy_settlements || 0, color: "#ef4444" },
      { name: "Unresolved Lines", value: summary.unresolved_lines || 0, color: "#f59e0b" },
    ];
  }, [summary]);

  const differenceVolumeChart = useMemo(() => {
    if (!summary?.differences_by_currency) return [];
    return summary.differences_by_currency.map((d) => ({
      currency: d.currency,
      Expected: Number(d.expected_amount) || 0,
      Reported: Number(d.reported_amount) || 0,
      Difference: Number(d.reconciliation_difference) || 0,
    }));
  }, [summary]);

  const openDetail =
    async (
      row: FinanceReconciliationRow,
    ) => {
      try {
        setDetailLoading(true);

        const response =
          await financeApi.getReconciliation(
            row.id,
          );

        setSelected(
          response.data,
        );
      } catch (reason) {
        console.error(
          "Failed to load reconciliation detail:",
          reason,
        );

        setError(
          "Unable to load reconciliation detail.",
        );
      } finally {
        setDetailLoading(false);
      }
    };

  const printReconciliation = () => {
    window.print();
  };

  const downloadReconciliationPdf = () => {
    if (!selected) {
      return;
    }

    const pdf = new jsPDF();
    let y = 22;

    const addLine = (
      label: string,
      value: string,
    ) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, 20, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(value, 65, y);
      y += 8;
    };

    pdf.setFontSize(18);
    pdf.text("Reconciliation Detail", 20, y);
    y += 9;
    pdf.setFontSize(10);
    pdf.setTextColor(90, 90, 90);
    pdf.text(
      selected.provider_settlement_reference ?? `Settlement #${selected.id}`,
      20,
      y,
    );
    y += 6;
    pdf.text(selected.uuid, 20, y);
    y += 12;
    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(11);

    [
      ["Provider", selected.provider_identifier ?? "—"],
      ["Currency", selected.currency ?? "—"],
      ["Status", titleCase(selected.status)],
      ["Reconciliation", titleCase(selected.reconciliation_status)],
      ["Period start", formatDate(selected.period_start)],
      ["Period end", formatDate(selected.period_end)],
      ["Gross", formatMoney(selected.gross_amount, selected.currency)],
      ["Fees", formatMoney(selected.fee_amount, selected.currency)],
      ["Refunds", formatMoney(selected.refund_amount, selected.currency)],
      ["Net", formatMoney(selected.net_amount, selected.currency)],
      ["Finalized", formatDate(selected.finalized_at)],
    ].forEach(([label, value]) => addLine(label, value));

    y += 5;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Reconciliation Lines", 20, y);
    y += 9;
    pdf.setFontSize(9);

    selected.lines.forEach((line) => {
      addLine(
        line.provider_line_reference ?? `Line #${line.id}`,
        `Expected: ${formatMoney(line.expected_amount, line.currency)}; Reported: ${formatMoney(line.reported_amount, line.currency)}; Difference: ${formatMoney(line.reconciliation_difference, line.currency)}; Status: ${titleCase(line.reconciliation_status)}; Reason: ${line.reconciliation_reason ?? "—"}`,
      );
    });

    pdf.save(
      `reconciliation-${selected.provider_settlement_reference ?? selected.id}.pdf`,
    );
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

  const reconciliationOptions =
    useMemo(
      () => [
        "",
        ...Object.keys(
          summary?.settlement_counts ??
            {},
        ),
      ],
      [summary],
    );

  const currencies =
    useMemo(
      () =>
        summary
          ?.differences_by_currency
          .map(
            (item) =>
              item.currency,
          ) ?? [],
      [summary],
    );

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
              to view reconciliation
              controls for the current
              tenant.
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
              href="/admin/finance" className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={12} />
              Back to Finance
            </Link>

            <div className="mb-1 text-[11px] font-medium text-gray-500">
              Finance / Reconciliation &amp; Controls
            </div>

            <h1 className="text-2xl font-bold leading-tight text-gray-900">
              Reconciliation &amp; Controls
            </h1>

              <p className="mt-1 max-w-4xl text-xs text-gray-500">
                Review settlement matching
                evidence, discrepancies and
                control exceptions using
                authoritative payment
                settlement records.
                Reconciliation values remain
                separated by currency.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchReconciliation()
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

          <div className="mt-4">
            <DashboardGrid>
              <KpiCard
                title="Settlements"
                value={String(
                  summary?.total_settlements ??
                    total,
                )}
                icon={Scale}
              />

              <KpiCard
                title="Matched"
                value={String(
                  summary?.matched_settlements ??
                    0,
                )}
                icon={CheckCircle2}
              />

              <KpiCard
                title="Discrepancies"
                value={String(
                  summary?.discrepancy_settlements ??
                    0,
                )}
                icon={
                  AlertTriangle
                }
              />

              <KpiCard
                title="Unresolved Lines"
                value={String(
                  summary?.unresolved_lines ??
                    0,
                )}
                icon={FileWarning}
              />
            </DashboardGrid>
          </div>

          {summary &&
            summary
              .differences_by_currency
              .length > 0 && (
              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <h2 className="text-sm font-bold text-gray-900">
                    Unresolved Difference
                    by Currency
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Expected, reported and
                    difference amounts are
                    shown independently for
                    each currency. No
                    cross-currency totals are
                    calculated.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {summary.differences_by_currency.map(
                    (item) => (
                      <div
                        key={
                          item.currency
                        }
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {
                              item.currency
                            }
                          </span>

                          <span className="text-[10px] font-semibold text-gray-500">
                            {
                              item.line_count
                            }{" "}
                            unresolved
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <MoneyItem
                            label="Expected"
                            value={formatMoney(
                              item.expected_amount,
                              item.currency,
                            )}
                          />

                          <MoneyItem
                            label="Reported"
                            value={formatMoney(
                              item.reported_amount,
                              item.currency,
                            )}
                          />

                          <MoneyItem
                            label="Difference"
                            value={formatMoney(
                              item.reconciliation_difference,
                              item.currency,
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
                <h2 className="text-sm font-bold text-gray-900">Reconciliation Expected vs Reported Variance</h2>
                <p className="text-[11px] text-gray-500">Live DB reconciliation differences separated by currency</p>
              </div>
              <div className="h-60 w-full">
                {differenceVolumeChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={differenceVolumeChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="currency" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Expected" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Reported" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Difference" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No reconciliation variance evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Reconciliation Ratio</h2>
                <p className="text-[11px] text-gray-500">Matched vs Discrepancies vs Unresolved lines</p>
              </div>
              <div className="h-60 w-full">
                {matchRatioChart.some((s) => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={matchRatioChart.filter((s) => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {matchRatioChart.filter((s) => s.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No reconciliation status evidence available
                  </div>
                )}
              </div>
            </div>
          </section>

          {summary && (
            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Reconciliation
                  Classification
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  Classification counts come
                  directly from settlement
                  reconciliation evidence.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(
                  summary.line_counts,
                ).map(
                  ([
                    statusValue,
                    count,
                  ]) => (
                    <button
                      key={
                        statusValue
                      }
                      type="button"
                      onClick={() => {
                        setLineStatus(
                          statusValue,
                        );
                        setPage(1);
                      }}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
                    >
                      <div className="text-xs font-semibold text-gray-800">
                        {titleCase(
                          statusValue,
                        )}
                      </div>

                      <div className="mt-0.5 text-lg font-bold text-gray-950">
                        {count}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </section>
          )}

          <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
                <div className="relative xl:col-span-2">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(
                      event,
                    ) => {
                      setSearch(
                        event.target
                          .value,
                      );
                      setPage(1);
                    }}
                    placeholder="Search settlement reference or provider"
                    className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-gray-400"
                  />
                </div>

                <select
                  value={provider}
                  onChange={(
                    event,
                  ) => {
                    setProvider(
                      event.target
                        .value,
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

                <select
                  value={
                    reconciliationStatus
                  }
                  onChange={(
                    event,
                  ) => {
                    setReconciliationStatus(
                      event.target
                        .value,
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
                    .map(
                      (value) => (
                        <option
                          key={value}
                          value={
                            value
                          }
                        >
                          {titleCase(
                            value,
                          )}
                        </option>
                      ),
                    )}
                </select>

                <select
                  value={
                    lineStatus
                  }
                  onChange={(
                    event,
                  ) => {
                    setLineStatus(
                      event.target
                        .value,
                    );
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-400"
                >
                  <option value="">
                    All line statuses
                  </option>

                  {lineStatuses.map(
                    (value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {titleCase(
                          value,
                        )}
                      </option>
                    ),
                  )}
                </select>

                <select
                  value={currency}
                  onChange={(
                    event,
                  ) => {
                    setCurrency(
                      event.target
                        .value,
                    );
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-400"
                >
                  <option value="">
                    All currencies
                  </option>

                  {currencies.map(
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

              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    unresolvedOnly
                  }
                  onChange={(
                    event,
                  ) => {
                    setUnresolvedOnly(
                      event.target
                        .checked,
                    );
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />

                Show unresolved settlements
                only
              </label>
            </div>

            {error && (
              <div
                className="m-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                role="alert"
              >
                <div className="font-bold">
                  Reconciliation unavailable
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

                    <TableHead>
                      Currency
                    </TableHead>

                    <TableHead align="right">
                      Gross
                    </TableHead>

                    <TableHead align="right">
                      Net
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
                    rows.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          Loading reconciliation evidence...
                        </td>
                      </tr>
                    )}

                  {!loading &&
                    !error &&
                    rows.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No reconciliation records found for the current tenant and filters.
                        </td>
                      </tr>
                    )}

                  {rows.map(
                    (row) => (
                      <tr
                        key={
                          row.id
                        }
                        onClick={() =>
                          void openDetail(
                            row,
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
                            {
                              row.uuid
                            }
                          </div>
                        </TableCell>

                        <TableCell>
                          {row.provider_identifier ??
                            "—"}
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            row.period_start,
                          )}{" "}
                          –{" "}
                          {formatDate(
                            row.period_end,
                          )}
                        </TableCell>

                        <TableCell>
                          {row.currency ??
                            "—"}
                        </TableCell>

                        <TableCell align="right">
                          {formatMoney(
                            row.gross_amount,
                            row.currency,
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatMoney(
                            row.net_amount,
                            row.currency,
                          )}
                        </TableCell>

                        <TableCell>
                          <ReconciliationBadge
                            status={
                              row.reconciliation_status
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          {
                            row.line_count
                          }
                        </TableCell>

                        <TableCell align="right">
                          <span
                            className={
                              row.discrepancy_count >
                              0
                                ? "font-bold text-rose-700"
                                : "text-gray-500"
                            }
                          >
                            {
                              row.discrepancy_count
                            }
                          </span>
                        </TableCell>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">
                {total} reconciliation
                settlement
                {total === 1
                  ? ""
                  : "s"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        Math.max(
                          1,
                          value - 1,
                        ),
                    )
                  }
                  className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-xs text-gray-500">
                  Page {page} of{" "}
                  {Math.max(
                    lastPage,
                    1,
                  )}
                </span>

                <button
                  type="button"
                  disabled={
                    page >=
                      lastPage ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        value + 1,
                    )
                  }
                  className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Governed Controls
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  This workspace is currently
                  read-only. Manual matching,
                  forced matching, write-offs,
                  settlement import and
                  finalization are not exposed
                  because no governed Admin
                  workflow exists for those
                  operations.
                </p>
              </div>
            </div>
          </section>
        </main>

        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
            <button
              type="button"
              aria-label="Close reconciliation detail"
              onClick={() =>
                setSelected(null)
              }
              className="absolute inset-0 cursor-default"
            />

            <aside className="relative z-10 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white p-5">
                <div>
                  <div className="text-[11px] font-medium text-gray-500">
                    Reconciliation Detail
                  </div>

                  <h2 className="mt-1 text-lg font-bold text-gray-950">
                    {selected.provider_settlement_reference ??
                      `Settlement #${selected.id}`}
                  </h2>

                  <div className="mt-2">
                    <ReconciliationBadge
                      status={
                        selected.reconciliation_status
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={printReconciliation}
                    title="Print reconciliation detail"
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Printer size={13} />
                    Print
                  </button>

                  <button
                    type="button"
                    onClick={downloadReconciliationPdf}
                    title="Download reconciliation detail PDF"
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Download size={13} />
                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelected(null)
                    }
                    aria-label="Close reconciliation detail"
                    className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <EvidenceCard
                    label="Provider"
                    value={
                      selected.provider_identifier ??
                      "—"
                    }
                  />

                  <EvidenceCard
                    label="Currency"
                    value={
                      selected.currency ??
                      "—"
                    }
                  />

                  <EvidenceCard
                    label="Gross"
                    value={formatMoney(
                      selected.gross_amount,
                      selected.currency,
                    )}
                  />

                  <EvidenceCard
                    label="Net"
                    value={formatMoney(
                      selected.net_amount,
                      selected.currency,
                    )}
                  />
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    Settlement Evidence
                  </h3>

                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <DetailLine
                      label="Reference"
                      value={
                        selected.provider_settlement_reference ??
                        "—"
                      }
                    />

                    <DetailLine
                      label="Status"
                      value={titleCase(
                        selected.status,
                      )}
                    />

                    <DetailLine
                      label="Period start"
                      value={formatDate(
                        selected.period_start,
                      )}
                    />

                    <DetailLine
                      label="Period end"
                      value={formatDate(
                        selected.period_end,
                      )}
                    />

                    <DetailLine
                      label="Fees"
                      value={formatMoney(
                        selected.fee_amount,
                        selected.currency,
                      )}
                    />

                    <DetailLine
                      label="Refunds"
                      value={formatMoney(
                        selected.refund_amount,
                        selected.currency,
                      )}
                    />

                    <DetailLine
                      label="Finalized"
                      value={formatDate(
                        selected.finalized_at,
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200">
                  <div className="border-b border-gray-100 p-4">
                    <h3 className="text-sm font-bold text-gray-900">
                      Reconciliation Lines
                    </h3>

                    <p className="mt-1 text-[11px] text-gray-500">
                      Only safe reconciliation
                      evidence is exposed here.
                      Related foreign-tenant
                      payment, refund, supplier
                      and customer records are
                      not serialized.
                    </p>
                  </div>

                  {selected.lines.length ===
                  0 ? (
                    <div className="p-5 text-sm text-gray-500">
                      No reconciliation lines
                      are available.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {selected.lines.map(
                        (line) => (
                          <div
                            key={
                              line.id
                            }
                            className="p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {line.provider_line_reference ??
                                    `Line #${line.id}`}
                                </div>

                                <div className="mt-1">
                                  <LineStatusBadge
                                    status={
                                      line.reconciliation_status
                                    }
                                  />
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                                  Difference
                                </div>

                                <div className="mt-1 text-sm font-bold text-gray-950">
                                  {formatMoney(
                                    line.reconciliation_difference,
                                    line.currency,
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                              <EvidenceCard
                                label="Expected"
                                value={formatMoney(
                                  line.expected_amount,
                                  line.currency,
                                )}
                              />

                              <EvidenceCard
                                label="Reported"
                                value={formatMoney(
                                  line.reported_amount,
                                  line.currency,
                                )}
                              />

                              <EvidenceCard
                                label="Currency"
                                value={
                                  line.currency ??
                                  "—"
                                }
                              />
                            </div>

                            {line.reconciliation_reason && (
                              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                                {
                                  line.reconciliation_reason
                                }
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-2">
                    <ShieldCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        Read-only control
                        workspace
                      </div>

                      <p className="mt-1 text-[11px] leading-5 text-gray-500">
                        No force-match,
                        write-off or manual
                        settlement mutation is
                        available
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/admin/finance/settlements-payouts/${selected.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  Open Settlement Evidence
                </Link>
              </div>
            </aside>
          </div>
        )}

        {detailLoading &&
          !selected && (
            <div className="fixed bottom-5 right-5 rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs shadow-lg">
              Loading reconciliation
              detail...
            </div>
          )}
      </div>
    </PermissionGuard>
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
      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500 ${
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

function MoneyItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 text-xs font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function EvidenceCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 break-words text-xs font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-gray-50 px-3 py-2">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="text-right font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}