"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, UserPlus } from "lucide-react";
import { useCustomerDirectory } from "@/hooks/useCustomerDirectory";
import { CanonicalCustomerTable } from "../CanonicalCustomerTable";
import { useAdminContext } from "@/contexts/AdminContext";

export function CustomerDirectoryDashboard() {
  const { hasPermission } = useAdminContext();
  const {
    customers,
    pagination,
    setPagination,
    isLoading,
    isRefreshing,
    lastSynced,
    filters,
    setFilters,
    handleRefresh,
  } = useCustomerDirectory();

  return (
    <div className="min-h-screen bg-[#faf8f8] px-4 py-5 sm:px-6">
      <header className="mb-4 flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-[#671021]">
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink">Customer Directory</h1>
          <p className="mt-1 text-xs text-slate-500">Canonical tenant Customer profiles identified by UUID.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />Refresh</button>
          {(hasPermission("customers.create") || hasPermission("customers.manage")) && <Link href="/admin/customers/new" className="inline-flex items-center gap-2 rounded-md bg-[#671021] px-3 py-2 text-xs font-bold text-white"><UserPlus className="h-4 w-4" />Create Customer</Link>}
        </div>
      </header>

      <div className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end">
        <label className="text-xs font-semibold text-slate-700">Search<input value={filters.searchQuery} onChange={(event) => setFilters((current) => ({ ...current, searchQuery: event.target.value }))} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-700">Lifecycle<select value={filters.activeTab === "all" ? "" : filters.activeTab} onChange={(event) => setFilters((current) => ({ ...current, activeTab: event.target.value || "all" }))} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"><option value="">All</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="locked">Locked</option><option value="disabled">Disabled</option><option value="anonymized">Anonymized</option></select></label>
        <p className="pb-2 font-mono text-[10px] text-slate-400">Synced {lastSynced || "—"}</p>
      </div>

      <CanonicalCustomerTable customers={customers} isLoading={isLoading} />

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span>{pagination.total} Customer profile(s)</span>
        <div className="flex gap-2"><button type="button" disabled={pagination.currentPage <= 1} onClick={() => setPagination((current) => ({ ...current, currentPage: current.currentPage - 1 }))} className="rounded border border-line bg-white px-3 py-1.5 disabled:opacity-40">Previous</button><span className="px-2 py-1.5 font-mono">{pagination.currentPage} / {pagination.lastPage}</span><button type="button" disabled={pagination.currentPage >= pagination.lastPage} onClick={() => setPagination((current) => ({ ...current, currentPage: current.currentPage + 1 }))} className="rounded border border-line bg-white px-3 py-1.5 disabled:opacity-40">Next</button></div>
      </div>
    </div>
  );
}
