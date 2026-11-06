"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, WalletCards } from "lucide-react";
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
import { DashboardGrid, KpiCard } from "@/components/admin/shared/KpiCard";
import { useAdminContext } from "@/contexts/AdminContext";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions/financePermissions";
import { financeApi, type SupplierPayablesResponse } from "@/lib/api/finance";

const title = (v: string) => v.replaceAll("_", " ").replace(/\b\w/g, l => l.toUpperCase());
const money = (v: string, c: string) => `${c} ${Number(v).toFixed(2)}`;

export default function Page() {
  const ctx = useAdminContext();
  const canView = ctx.hasPermission(FINANCE_PERMISSIONS.view);
  const canManage = ctx.hasPermission(FINANCE_PERMISSIONS.manage);
  const [result, setResult] = useState<SupplierPayablesResponse | null>(null);
  const [loading, setLoading] = useState(canView);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [invoice, setInvoice] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await financeApi.getSupplierPayables({ search: search || undefined, status: status || undefined, page, per_page: 20 }));
    } catch (e) {
      setError((e as Error).message || "Failed to load supplier payables.");
    } finally {
      setLoading(false);
    }
  }, [canView, search, status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const materialize = async () => {
    setError(null);
    setMessage(null);
    try {
      const r = await financeApi.materializeSupplierPayable(Number(invoice));
      setMessage(r.message ?? "Payable materialized.");
      setInvoice("");
      await load();
    } catch (e) {
      setError((e as Error).message || "Payable could not be materialized.");
    }
  };

  const s = result?.summary ?? { total: 0, open: 0, on_hold: 0, scheduled: 0, amounts_by_currency: [] };

  const statusChartData = useMemo(() => {
    return [
      { name: "Total", value: s.total, fill: "#6366f1" },
      { name: "Open", value: s.open, fill: "#3b82f6" },
      { name: "On Hold", value: s.on_hold, fill: "#f59e0b" },
      { name: "Scheduled", value: s.scheduled, fill: "#10b981" },
    ];
  }, [s]);

  const supplierChartData = useMemo(() => {
    if (!result?.data) return [];
    const map: Record<string, { supplier: string; count: number; outstanding: number }> = {};
    result.data.forEach((r) => {
      const name = r.supplier?.company_name || (r.supplier?.id ? `Supplier #${r.supplier.id}` : "N/A");
      if (!map[name]) {
        map[name] = { supplier: name, count: 0, outstanding: 0 };
      }
      map[name].count += 1;
      map[name].outstanding += Number(r.outstanding_amount) || 0;
    });
    return Object.values(map);
  }, [result]);

  return (
    <PermissionGuard permission={FINANCE_PERMISSIONS.view} fallback={<div className="p-6" role="alert">Finance access required.</div>}>
      <main className="min-h-screen bg-[#faf8f8] p-6 text-gray-900">
        <header className="flex items-end justify-between">
          <div>
            <Link href="/admin/finance" className="text-xs text-gray-500">Back to Finance</Link>
            <h1 className="mt-2 text-2xl font-bold">Supplier Payables</h1>
            <p className="text-xs text-gray-500">Real invoice-backed supplier obligations. Scheduling never means payout executed.</p>
          </div>
          <button onClick={() => void load()} disabled={loading} className="rounded border bg-white px-3 py-2 text-xs">
            <RefreshCw size={13} className="inline" /> Refresh
          </button>
        </header>

        <ContextScopeBar items={[{ label: "Tenant", value: ctx.tenant.name }, { label: "Ecosystem", value: ctx.ecosystem.name }, { label: "Channel", value: ctx.channel?.name ?? "All permitted channels" }]} />

        <div className="mt-4">
          <DashboardGrid>
            <KpiCard title="Payables" value={s.total} icon={WalletCards} />
            <KpiCard title="Open" value={s.open} icon={WalletCards} />
            <KpiCard title="On hold" value={s.on_hold} icon={WalletCards} />
            <KpiCard title="Scheduled" value={s.scheduled} icon={WalletCards} />
          </DashboardGrid>
        </div>

        {s.amounts_by_currency.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {s.amounts_by_currency.map((x) => (
              <div key={x.currency} className="rounded border bg-white p-4">
                <b>{x.currency}</b>
                <div className="text-lg font-bold">{money(x.outstanding_amount, x.currency)}</div>
                <small>{x.payable_count} payable{x.payable_count === 1 ? "" : "s"}</small>
              </div>
            ))}
          </div>
        )}

        {/* Visual Recharts Analytics Section */}
        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded border bg-white p-4 lg:col-span-2">
            <div className="mb-3 border-b pb-2">
              <h2 className="text-sm font-bold text-gray-900">Payables by Supplier</h2>
              <p className="text-[11px] text-gray-500">Live outstanding payables distribution across suppliers</p>
            </div>
            <div className="h-56 w-full">
              {supplierChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={supplierChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="supplier" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Payable Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outstanding" name="Outstanding Amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-500">
                  No supplier payable evidence available for selected period
                </div>
              )}
            </div>
          </div>

          <div className="rounded border bg-white p-4">
            <div className="mb-3 border-b pb-2">
              <h2 className="text-sm font-bold text-gray-900">Payable Status Breakdown</h2>
              <p className="text-[11px] text-gray-500">Total, Open, On Hold, and Scheduled states</p>
            </div>
            <div className="h-56 w-full">
              {statusChartData.some((x) => x.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData.filter((x) => x.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.filter((x) => x.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-500">
                  No status distribution available
                </div>
              )}
            </div>
          </div>
        </section>

        {canManage && result?.capabilities.materialize && (
          <section className="mt-4 rounded border bg-white p-4">
            <b>Materialize invoice obligation</b>
            <p className="text-xs text-gray-500">One idempotent payable per eligible issued invoice with paid value.</p>
            <div className="mt-2 flex gap-2">
              <input value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="Invoice ID" className="rounded border px-3 py-2 text-xs" />
              <button disabled={!invoice} onClick={() => void materialize()} className="rounded bg-[#7a0023] px-4 text-xs font-bold text-white disabled:opacity-50">Materialize</button>
            </div>
          </section>
        )}

        {error && <div role="alert" className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
        {message && <div role="status" className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-xs text-green-700">{message}</div>}

        <section className="mt-4 rounded border bg-white">
          <div className="flex gap-2 border-b p-4">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search payable, supplier or invoice" className="flex-1 rounded border px-3 py-2 text-xs" />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded border px-3 text-xs">
              <option value="">All statuses</option>
              {["open", "on_hold", "scheduled"].map((v) => (
                <option key={v} value={v}>{title(v)}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {["Payable", "Supplier", "Source", "Original", "Outstanding", "Due", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && !result ? (
                  <tr><td colSpan={7} className="p-10 text-center">Loading supplier payables...</td></tr>
                ) : !error && result?.data.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center">No supplier payables found for the current tenant and filters.</td></tr>
                ) : (
                  result?.data.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3"><Link className="font-bold text-[#7a0023]" href={`/admin/finance/supplier-payables/${r.id}`}>{r.payable_number}</Link></td>
                      <td className="px-4 py-3">{r.supplier?.company_name ?? "—"}</td>
                      <td className="px-4 py-3">{r.invoice?.invoice_number ?? `${r.source_type} #${r.source_id}`}</td>
                      <td className="px-4 py-3">{money(r.original_amount, r.currency)}</td>
                      <td className="px-4 py-3 font-bold">{money(r.outstanding_amount, r.currency)}</td>
                      <td className="px-4 py-3">{r.due_date ?? "—"}</td>
                      <td className="px-4 py-3">{title(r.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {result && result.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
              <span className="text-slate-500">Page {result.current_page} of {result.last_page} ({result.total} total items)</span>
              <div className="flex gap-2">
                <button type="button" disabled={loading || result.current_page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40">Previous</button>
                <button type="button" disabled={loading || result.current_page >= result.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </PermissionGuard>
  );
}
