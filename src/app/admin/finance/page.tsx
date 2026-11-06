"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
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
  type FinanceCommandCenterResponse,
} from "@/lib/api/finance";

function money(
  amount: string,
  currency: string,
): string {
  const numeric =
    Number(amount);

  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return `${currency} ${amount}`;
  }

  return `${currency} ${new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(numeric)}`;
}

export default function FinanceCommandCenterPage() {
  const [
    response,
    setResponse,
  ] =
    useState<FinanceCommandCenterResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let active =
      true;

    const load =
      async (): Promise<void> => {
        try {
          setLoading(true);
          setError(null);

          const data =
            await financeApi.getCommandCenter();

          if (active) {
            setResponse(
              data,
            );
          }
        } catch (cause) {
          if (!active) {
            return;
          }

          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load Finance Command Center.",
          );
        } finally {
          if (active) {
            setLoading(
              false,
            );
          }
        }
      };

    void load();

    return () => {
      active =
        false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!response?.money?.payments_by_currency) return [];
    const mon = response.money;
    return mon.payments_by_currency.map((p) => {
      const rec = mon.receivables_by_currency.find((r) => r.currency === p.currency);
      const set = mon.settlements_by_currency.find((s) => s.currency === p.currency);
      return {
        currency: p.currency,
        Payments: Number(p.amount) || 0,
        Receivables: Number(rec?.invoice_amount) || 0,
        Settlements: Number(set?.gross_amount) || 0,
      };
    });
  }, [response]);

  const statusDistribution = useMemo(() => {
    if (!response?.summary) return [];
    const sum = response.summary;
    return [
      { name: "Payments Total", value: sum.payments.total || 0, color: "#6366f1" },
      { name: "Pending Payments", value: sum.payments.pending || 0, color: "#f59e0b" },
      { name: "Failed Payments", value: sum.payments.failed || 0, color: "#ef4444" },
      { name: "Open Receivables", value: sum.receivables.open || 0, color: "#3b82f6" },
      { name: "Refunds Total", value: sum.refunds.total || 0, color: "#ec4899" },
      { name: "Settlements Total", value: sum.settlements.total || 0, color: "#10b981" },
      { name: "Reconciled Issues", value: sum.reconciliation.unresolved || 0, color: "#8b5cf6" },
    ];
  }, [response]);

  if (loading) {
    return (
      <main className="space-y-6">
        <section className="rounded-xl border bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Finance
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Finance Command Center
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Loading tenant-scoped finance evidence…
          </p>
        </section>
      </main>
    );
  }

  if (
    error ||
    !response
  ) {
    return (
      <main className="space-y-6">
        <section className="rounded-xl border bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Finance
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Finance Command Center
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error ??
              "Finance data is unavailable."}
          </p>
        </section>
      </main>
    );
  }

  const { summary, money: monetary, navigation } = response;

  return (
    <main className="space-y-6">
      <section className="rounded-xl border bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Finance
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Finance Command Center
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Tenant-scoped overview of payments,
              receivables, refunds, settlements,
              commissions and reconciliation evidence.
              Monetary values are always separated by
              currency.
            </p>
          </div>

          <div className="rounded-lg border bg-slate-50 px-4 py-3 text-sm">
            <div className="font-medium text-slate-900">
              Command Center mode
            </div>

            <div className="mt-1 text-slate-500">
              Read-only summary. Financial mutations
              remain inside their dedicated modules.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">
            Payments
          </div>

          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {summary.payments.total}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {summary.payments.pending} pending ·{" "}
            {summary.payments.failed} failed
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">
            Open receivables
          </div>

          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {summary.receivables.open}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">
            Refunds
          </div>

          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {summary.refunds.total}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">
            Settlements
          </div>

          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {summary.settlements.total}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">
            Commissions
          </div>

          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {summary.commissions.total}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {summary.commissions.pending_review} pending review
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">
            Reconciliation issues
          </div>

          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {summary.reconciliation.unresolved}
          </div>
        </article>
      </section>

      {/* Visual Recharts Analytics Section */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Financial Volume by Currency</h2>
              <p className="text-xs text-slate-500">Live DB breakdown of payments, receivables, and settlements</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="currency" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      money(String(val ?? 0), "USD"),
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="Payments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Receivables" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Settlements" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No finance evidence available for selected period
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="mb-4 border-b pb-4">
            <h2 className="text-base font-semibold text-slate-900">Operational Distribution</h2>
            <p className="text-xs text-slate-500">Active transaction lifecycle volume</p>
          </div>
          <div className="h-64 w-full">
            {statusDistribution.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution.filter((s) => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.filter((s) => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No operational evidence available
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Finance modules
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Open the implemented Finance operational
            screens.
          </p>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {navigation.map(
            (item) => (
              <Link
                key={
                  item.code
                }
                href={
                  item.href
                }
                className="rounded-xl border p-4 transition hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-900">
                  {item.label}
                </div>

                <div className="mt-3 text-sm text-slate-500">
                  Open module →
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <CurrencyTable
          title="Payments by currency"
          headers={[
            "Payments",
            "Amount",
            "Fees",
          ]}
          rows={monetary.payments_by_currency.map(
            (item) => [
              item.currency,
              String(
                item.payment_count,
              ),
              money(
                item.amount,
                item.currency,
              ),
              money(
                item.fees,
                item.currency,
              ),
            ],
          )}
        />

        <CurrencyTable
          title="Receivables by currency"
          headers={[
            "Receivables",
            "Invoice amount",
            "Balance due",
          ]}
          rows={monetary.receivables_by_currency.map(
            (item) => [
              item.currency,
              String(
                item.receivable_count,
              ),
              money(
                item.invoice_amount,
                item.currency,
              ),
              money(
                item.balance_due,
                item.currency,
              ),
            ],
          )}
        />

        <CurrencyTable
          title="Refunds by currency"
          headers={[
            "Refunds",
            "Amount",
          ]}
          rows={monetary.refunds_by_currency.map(
            (item) => [
              item.currency,
              String(
                item.refund_count,
              ),
              money(
                item.amount,
                item.currency,
              ),
            ],
          )}
        />

        <CurrencyTable
          title="Settlements by currency"
          headers={[
            "Settlements",
            "Gross",
            "Net",
          ]}
          rows={monetary.settlements_by_currency.map(
            (item) => [
              item.currency,
              String(
                item.settlement_count,
              ),
              money(
                item.gross_amount,
                item.currency,
              ),
              money(
                item.net_amount,
                item.currency,
              ),
            ],
          )}
        />

        <CurrencyTable
          title="Commissions by currency"
          headers={[
            "Records",
            "Base",
            "Commission",
          ]}
          rows={monetary.commissions_by_currency.map(
            (item) => [
              item.currency,
              String(
                item.commission_count,
              ),
              money(
                item.base_amount,
                item.currency,
              ),
              money(
                item.commission_amount,
                item.currency,
              ),
            ],
          )}
        />

        <CurrencyTable
          title="Reconciliation differences"
          headers={[
            "Issues",
            "Expected",
            "Difference",
          ]}
          rows={monetary.reconciliation_by_currency.map(
            (item) => [
              item.currency,
              String(
                item.discrepancy_count,
              ),
              money(
                item.expected_amount,
                item.currency,
              ),
              money(
                item.difference,
                item.currency,
              ),
            ],
          )}
        />
      </section>
    </main>
  );
}

function CurrencyTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section className="rounded-xl border bg-white">
      <div className="border-b p-5">
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">
                Currency
              </th>

              {headers.map(
                (header) => (
                  <th
                    key={
                      header
                    }
                    className="px-5 py-3"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map(
              (
                row,
              ) => (
                <tr
                  key={
                    row.join(
                      "-",
                    )
                  }
                >
                  {row.map(
                    (
                      cell,
                      index,
                    ) => (
                      <td
                        key={`${index}-${cell}`}
                        className={`px-5 py-4 ${
                          index ===
                          0
                            ? "font-medium text-slate-900"
                            : ""
                        }`}
                      >
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}

            {rows.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    headers.length +
                    1
                  }
                  className="px-5 py-8 text-center text-slate-500"
                >
                  No finance evidence available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
