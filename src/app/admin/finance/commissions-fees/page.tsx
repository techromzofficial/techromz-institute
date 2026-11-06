"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Filter,
  Layers,
  PieChart as PieIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
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

import {
  financeApi,
  type FinanceCommissionDetail,
  type FinanceCommissionRow,
  type FinanceCommissionStatus,
  type FinanceCommissionsResponse,
} from "@/lib/api/finance";

const statusLabels: Record<
  FinanceCommissionStatus,
  string
> = {
  calculated: "Calculated",
  pending_review: "Pending Review",
  approved: "Approved",
  settled: "Settled",
  cancelled: "Cancelled",
};

function money(
  currency: string | null | undefined,
  amount: string | number | null | undefined,
): string {
  const value = Number(amount ?? 0);

  return `${currency ?? "—"} ${value.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function statusClass(
  status: FinanceCommissionStatus,
): string {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "settled":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "pending_review":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function CommissionFeesPage() {
  const [data, setData] =
    useState<FinanceCommissionsResponse | null>(
      null,
    );

  const [selected, setSelected] =
    useState<FinanceCommissionDetail | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<FinanceCommissionStatus | "">("");

  const [page, setPage] = useState(1);
  const [appliedSearch, setAppliedSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState("");

  const [showCancel, setShowCancel] =
    useState(false);

  const applySearch = () => {
    const nextSearch = search.trim();
    if (page === 1 && appliedSearch === nextSearch) {
      void loadList();
      return;
    }
    setPage(1);
    setAppliedSearch(nextSearch);
  };

  const loadList = async () => {
    try {
      setLoading(true);

      const response =
        await financeApi.getCommissions({
          search:
            appliedSearch || undefined,

          status:
            status || undefined,

          page,
          per_page: 50,
        });

      setData(response);

      if (
        selected &&
        !response.data.some(
          (record) =>
            record.id === selected.id,
        )
      ) {
        setSelected(null);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to load commission records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, appliedSearch]);

  const loadDetail = async (
    row: FinanceCommissionRow,
  ) => {
    try {
      setDetailLoading(true);

      const response =
        await financeApi.getCommission(
          row.id,
        );

      setSelected(response.data);
      setShowCancel(false);
      setCancelReason("");
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to load commission detail.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelected = async (
    id: number,
  ) => {
    const response =
      await financeApi.getCommission(id);

    setSelected(response.data);

    await loadList();
  };

  const runAction = async (
    action:
      | "submit"
      | "approve"
      | "settle"
      | "cancel",
  ) => {
    if (!selected) {
      return;
    }

    if (
      action === "cancel" &&
      cancelReason.trim() === ""
    ) {
      toast.error(
        "Cancellation reason is required.",
      );

      return;
    }

    try {
      setActionLoading(true);

      if (action === "submit") {
        await financeApi.submitCommissionForReview(
          selected.id,
          {
            reason:
              "Submitted from Finance Commission administration.",
          },
        );

        toast.success(
          "Commission submitted for review.",
        );
      }

      if (action === "approve") {
        await financeApi.approveCommission(
          selected.id,
          {
            reason:
              "Approved from Finance Commission administration.",
          },
        );

        toast.success(
          "Commission approved.",
        );
      }

      if (action === "settle") {
        await financeApi.settleCommission(
          selected.id,
          {
            reason:
              "Marked settled from Finance Commission administration.",
          },
        );

        toast.success(
          "Commission settled.",
        );
      }

      if (action === "cancel") {
        await financeApi.cancelCommission(
          selected.id,
          cancelReason.trim(),
        );

        toast.success(
          "Commission cancelled.",
        );

        setShowCancel(false);
        setCancelReason("");
      }

      await refreshSelected(
        selected.id,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Commission workflow action failed.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const downloadRecordPdf = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: FinanceCommissionRow,
  ) => {
    event.stopPropagation();

    const document = new jsPDF();
    const details = [
      ["Order", row.order?.order_number ?? "—"],
      ["Product", row.product?.name ?? "—"],
      ["Supplier", row.supplier?.name ?? "—"],
      ["Rule", row.rule?.name ?? "—"],
      [
        "Calculation",
        row.calculation_type === "percentage"
          ? `${row.percentage_rate ?? "0"}%`
          : money(row.currency, row.fixed_amount),
      ],
      ["Status", statusLabels[row.status]],
      ["Base amount", money(row.currency, row.base_amount)],
      ["Commission", money(row.currency, row.commission_amount)],
      ["Calculated at", row.calculated_at ?? "—"],
    ];

    document.setFontSize(18);
    document.text("Commission & Fee Record", 20, 24);
    document.setFontSize(10);
    document.setTextColor(90, 90, 90);
    document.text(`Record #${row.id}`, 20, 32);
    document.text(row.uuid, 20, 38);
    document.setTextColor(20, 20, 20);
    document.setFontSize(11);

    details.forEach(([label, value], index) => {
      const y = 56 + index * 10;
      document.setFont("helvetica", "bold");
      document.text(`${label}:`, 20, y);
      document.setFont("helvetica", "normal");
      document.text(String(value), 62, y);
    });

    document.setFontSize(9);
    document.setTextColor(110, 110, 110);
    document.text(
      "Generated from the tenant-scoped Finance Commissions & Fees records.",
      20,
      160,
    );
    document.save(`commission-record-${row.id}.pdf`);
    toast.success("Commission PDF downloaded.");
  };

  const currencyCards =
    useMemo(
      () =>
        data?.summary
          .amounts_by_currency ?? [],
      [data],
    );

  const totalCommissionText =
    currencyCards.length === 0
      ? "No commission amounts"
      : currencyCards
          .map((item) =>
            money(
              item.currency,
              item.commission_amount,
            ),
          )
          .join(" • ");

  const summaryCards = [
    {
      title: "Total Records",
      value: data?.summary.total ?? 0,
      icon: CircleDollarSign,
    },
    {
      title: "Calculated",
      value:
        data?.summary.calculated ?? 0,
      icon: Clock3,
    },
    {
      title: "Pending Review",
      value:
        data?.summary.pending_review ??
        0,
      icon: ShieldCheck,
    },
    {
      title: "Approved",
      value:
        data?.summary.approved ?? 0,
      icon: CheckCircle2,
    },
    {
      title: "Settled",
      value:
        data?.summary.settled ?? 0,
      icon: CheckCircle2,
    },
    {
      title: "Cancelled",
      value:
        data?.summary.cancelled ?? 0,
      icon: XCircle,
    },
  ];

  const chartData = useMemo(() => {
    const rows = data?.data ?? [];

    if (rows.length === 0) {
      return [];
    }
    const buckets: Record<string, { name: string; base: number; commission: number }> = {};
    rows.slice(0, 10).forEach((item, idx) => {
      const key = item.order?.order_number ? `Ord #${item.order.order_number.slice(-4)}` : `Item ${idx + 1}`;
      buckets[key] = {
        name: key,
        base: Number(item.base_amount) || 0,
        commission: Number(item.commission_amount) || 0,
      };
    });
    return Object.values(buckets);
  }, [data]);

  const statusDistribution = useMemo(() => {
    const summary = data?.summary;

    if (!summary) {
      return [];
    }

    return [
      { name: "Calculated", value: summary.calculated || 0, color: "#64748b" },
      { name: "Pending Review", value: summary.pending_review || 0, color: "#f59e0b" },
      { name: "Approved", value: summary.approved || 0, color: "#10b981" },
      { name: "Settled", value: summary.settled || 0, color: "#3b82f6" },
      { name: "Cancelled", value: summary.cancelled || 0, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [data]);

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-[1720px] px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link
                  href="/admin/finance"
                  className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Finance
                </Link>

                <h1 className="text-2xl font-semibold text-gray-950">
                  Commissions & Fees
                </h1>

                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                  Tenant-scoped commission
                  calculation evidence, rule
                  application and controlled
                  finance workflow.
                </p>
              </div>

              <div className="rounded-xl border bg-gray-50 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Commission amount by currency
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {totalCommissionText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto flex max-w-[1720px] flex-col gap-5 p-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {summaryCards.map(
              ({
                title,
                value,
                icon: Icon,
              }) => (
                <div
                  key={title}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {title}
                    </p>

                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>

                  <p className="mt-3 text-2xl font-semibold text-gray-950">
                    {value}
                  </p>
                </div>
              ),
            )}
          </section>

          {/* Visual Recharts Analytics Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-950">Commission vs. Base Revenue Volume</h3>
                  <p className="text-xs text-gray-500">Comparing calculated fee obligations against order value</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-medium text-gray-600"><span className="h-2.5 w-2.5 rounded-sm bg-slate-400"></span>Base</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#7a0023]"><span className="h-2.5 w-2.5 rounded-sm bg-[#7a0023]"></span>Commission</span>
                </div>
              </div>
              <div className="h-56 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="base" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="commission" fill="#7a0023" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No commission volume evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-950">Status Distribution</h3>
                <p className="text-xs text-gray-500">Breakdown of active commission pipeline</p>
              </div>
              <div className="h-56 w-full">
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No status distribution evidence available
                  </div>
                )}
              </div>
            </div>
          </div>

          {currencyCards.length > 0 && (
            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Currency Summary
              </h2>

              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {currencyCards.map(
                  (item) => (
                    <div
                      key={item.currency}
                      className="rounded-lg border bg-gray-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.currency}
                        </span>

                        <span className="text-xs text-gray-500">
                          {
                            item.commission_count
                          }{" "}
                          records
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Commission base
                          </span>

                          <span className="font-medium text-gray-900">
                            {money(
                              item.currency,
                              item.base_amount,
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Commission
                          </span>

                          <span className="font-semibold text-gray-950">
                            {money(
                              item.currency,
                              item.commission_amount,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          <section className="rounded-xl border bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b p-4">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      applySearch();
                    }
                  }}
                  placeholder="Search order, supplier, product or rule"
                  className="w-full rounded-lg border px-9 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value as FinanceCommissionStatus | "");
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">
                  All statuses
                </option>
                <option value="calculated">
                  Calculated
                </option>
                <option value="pending_review">
                  Pending Review
                </option>
                <option value="approved">
                  Approved
                </option>
                <option value="settled">
                  Settled
                </option>
                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <button
                type="button"
                onClick={applySearch}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Search
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">
                      Record
                    </th>
                    <th className="px-4 py-3">
                      Order
                    </th>
                    <th className="px-4 py-3">
                      Product
                    </th>
                    <th className="px-4 py-3">
                      Supplier
                    </th>
                    <th className="px-4 py-3">
                      Rule
                    </th>
                    <th className="px-4 py-3 text-right">
                      Base
                    </th>
                    <th className="px-4 py-3 text-right">
                      Commission
                    </th>
                    <th className="px-4 py-3">
                      Status
                    </th>
                    <th className="px-4 py-3">
                      History
                    </th>
                    <th className="px-4 py-3 text-right">
                      Download
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        Loading commission
                        records…
                      </td>
                    </tr>
                  ) : (
                    data?.data.map(
                      (row) => (
                        <tr
                          key={row.id}
                          onClick={() =>
                            void loadDetail(
                              row,
                            )
                          }
                          className={`cursor-pointer border-t hover:bg-gray-50 ${
                            selected?.id ===
                            row.id
                              ? "bg-gray-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              #{row.id}
                            </p>
                            <p className="max-w-[170px] truncate text-xs text-gray-400">
                              {row.uuid}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            {row.order
                              ?.order_number ??
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {row.product
                                ?.name ??
                                "—"}
                            </p>

                            <p className="text-xs text-gray-400">
                              {row.category
                                ?.name ??
                                ""}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            {row.supplier
                              ?.name ??
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {row.rule
                                ?.name ??
                                "—"}
                            </p>

                            <p className="text-xs text-gray-400">
                              {row.calculation_type ===
                              "percentage"
                                ? `${row.percentage_rate ?? "0"}%`
                                : money(
                                    row.currency,
                                    row.fixed_amount,
                                  )}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-right">
                            {money(
                              row.currency,
                              row.base_amount,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-gray-950">
                            {money(
                              row.currency,
                              row.commission_amount,
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                                row.status,
                              )}`}
                            >
                              {
                                statusLabels[
                                  row.status
                                ]
                              }
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {row.history_count ??
                              0}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              title="Download commission record PDF"
                              aria-label={`Download PDF for commission record ${row.id}`}
                              onClick={(event) =>
                                downloadRecordPdf(event, row)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ),
                    )
                  )}

                  {!loading &&
                    (data?.data.length ??
                      0) === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          No commission
                          records found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
            {data && data.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
                <span className="text-slate-500">Page {data.current_page} of {data.last_page} ({data.total} total items)</span>
                <div className="flex gap-2">
                  <button type="button" disabled={loading || data.current_page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40">Previous</button>
                  <button type="button" disabled={loading || data.current_page >= data.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-950">
                    Commission Evidence
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Calculation evidence is
                    immutable after creation.
                  </p>
                </div>
              </div>

              {detailLoading ? (
                <div className="mt-6 h-48 animate-pulse rounded-lg bg-gray-100" />
              ) : !selected ? (
                <div className="mt-6 rounded-lg border border-dashed p-10 text-center text-sm text-gray-500">
                  Select a commission
                  record to view its rule,
                  order item and workflow
                  evidence.
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <EvidenceCard
                      label="Commission Base"
                      value={money(
                        selected.currency,
                        selected.base_amount,
                      )}
                    />

                    <EvidenceCard
                      label="Commission Amount"
                      value={money(
                        selected.currency,
                        selected.commission_amount,
                      )}
                    />

                    <EvidenceCard
                      label="Calculation"
                      value={
                        selected.calculation_type ===
                        "percentage"
                          ? `${selected.percentage_rate ?? "0"}%`
                          : money(
                              selected.currency,
                              selected.fixed_amount,
                            )
                      }
                    />

                    <EvidenceCard
                      label="Status"
                      value={
                        statusLabels[
                          selected.status
                        ]
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailBlock
                      title="Order & Item"
                      rows={[
                        [
                          "Order",
                          selected.order
                            ?.order_number ??
                            "—",
                        ],
                        [
                          "Product",
                          selected.order_item
                            ?.product_name ??
                            selected.product
                              ?.name ??
                            "—",
                        ],
                        [
                          "SKU",
                          selected.order_item
                            ?.sku ??
                            selected.product
                              ?.sku ??
                            "—",
                        ],
                        [
                          "Item Amount",
                          money(
                            selected.order_item
                              ?.currency ??
                              selected.currency,
                            selected.order_item
                              ?.amount,
                          ),
                        ],
                      ]}
                    />

                    <DetailBlock
                      title="Rule Evidence"
                      rows={[
                        [
                          "Rule",
                          selected.rule
                            ?.name ??
                            "—",
                        ],
                        [
                          "Type",
                          selected
                            .calculation_type,
                        ],
                        [
                          "Rate",
                          selected
                            .calculation_type ===
                          "percentage"
                            ? `${selected.percentage_rate ?? "0"}%`
                            : "—",
                        ],
                        [
                          "Priority",
                          String(
                            selected.rule
                              ?.priority ??
                              0,
                          ),
                        ],
                      ]}
                    />

                    <DetailBlock
                      title="Ownership Evidence"
                      rows={[
                        [
                          "Supplier",
                          selected.supplier
                            ?.name ??
                            "—",
                        ],
                        [
                          "Category",
                          selected.category
                            ?.name ??
                            "—",
                        ],
                        [
                          "Buyer",
                          selected.buyer
                            ?.name ??
                            "—",
                        ],
                        [
                          "Currency",
                          selected.currency,
                        ],
                      ]}
                    />

                    <DetailBlock
                      title="Workflow Timestamps"
                      rows={[
                        [
                          "Calculated",
                          formatDate(
                            selected.calculated_at,
                          ),
                        ],
                        [
                          "Reviewed",
                          formatDate(
                            selected.reviewed_at,
                          ),
                        ],
                        [
                          "Approved",
                          formatDate(
                            selected.approved_at,
                          ),
                        ],
                        [
                          "Settled",
                          formatDate(
                            selected.settled_at,
                          ),
                        ],
                      ]}
                    />
                  </div>

                  {selected.status_reason && (
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Current Status Reason
                      </p>

                      <p className="mt-2 text-sm text-gray-800">
                        {
                          selected.status_reason
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-base font-semibold text-gray-950">
                  Commission Workflow
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Actions are enabled only
                  when permitted by the
                  backend.
                </p>

                {!selected ? (
                  <p className="mt-5 text-sm text-gray-500">
                    Select a commission
                    record.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {selected.capabilities
                      .submit_review && (
                      <WorkflowButton
                        label="Submit for Review"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          void runAction(
                            "submit",
                          )
                        }
                      />
                    )}

                    {selected.capabilities
                      .approve && (
                      <WorkflowButton
                        label="Approve Commission"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          void runAction(
                            "approve",
                          )
                        }
                      />
                    )}

                    {selected.capabilities
                      .settle && (
                      <WorkflowButton
                        label="Mark Settled"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          void runAction(
                            "settle",
                          )
                        }
                      />
                    )}

                    {selected.capabilities
                      .cancel && (
                      <>
                        {!showCancel ? (
                          <button
                            type="button"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              setShowCancel(
                                true,
                              )
                            }
                            className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel Commission
                          </button>
                        ) : (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <label className="text-xs font-medium text-red-800">
                              Cancellation
                              reason
                            </label>

                            <textarea
                              value={
                                cancelReason
                              }
                              onChange={(
                                event,
                              ) =>
                                setCancelReason(
                                  event.target
                                    .value,
                                )
                              }
                              rows={3}
                              className="mt-2 w-full rounded-md border border-red-200 bg-white p-2 text-sm outline-none"
                            />

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  void runAction(
                                    "cancel",
                                  )
                                }
                                className="rounded-md bg-red-700 px-3 py-2 text-xs font-medium text-white"
                              >
                                Confirm
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowCancel(
                                    false,
                                  );
                                  setCancelReason(
                                    "",
                                  );
                                }}
                                className="rounded-md border bg-white px-3 py-2 text-xs"
                              >
                                Back
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {!selected.capabilities
                      .submit_review &&
                      !selected.capabilities
                        .approve &&
                      !selected.capabilities
                        .settle &&
                      !selected.capabilities
                        .cancel && (
                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                          No workflow actions
                          are currently
                          available for this
                          record.
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-base font-semibold text-gray-950">
                  Workflow History
                </h2>

                {!selected ||
                selected.histories.length ===
                  0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    No history available.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {selected.histories.map(
                      (history) => (
                        <div
                          key={history.id}
                          className="border-l-2 border-gray-200 pl-3"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {
                              statusLabels[
                                history
                                  .new_status
                              ]
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {history
                              .previous_status
                              ? `${statusLabels[history.previous_status]} → `
                              : ""}
                            {
                              statusLabels[
                                history
                                  .new_status
                              ]
                            }
                          </p>

                          {history.reason && (
                            <p className="mt-2 text-xs text-gray-600">
                              {
                                history.reason
                              }
                            </p>
                          )}

                          <p className="mt-2 text-[11px] text-gray-400">
                            {history.actor
                              ?.name ??
                              "System"}
                            {" • "}
                            {formatDate(
                              history.occurred_at,
                            )}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-900">
                  Unsupported Operations
                </h2>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Adjustments,
                  reversals, waivers,
                  disputes and commission
                  exports are not exposed
                  because those financial
                  evidence domains are not
                  implemented yet.
                </p>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </>
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
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-gray-950">
        {value}
      </p>
    </div>
  );
}

function DetailBlock({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 text-xs"
          >
            <span className="text-gray-500">
              {label}
            </span>

            <span className="text-right font-medium text-gray-900">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
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

  return date.toLocaleString();
}