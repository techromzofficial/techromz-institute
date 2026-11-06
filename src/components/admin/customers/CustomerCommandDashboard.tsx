"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Info, RefreshCw, UserPlus } from "lucide-react";
import { useCustomerCommandCenter } from "@/hooks/useCustomerCommandCenter";
import { CustomerKpiGrid } from "./CustomerKpiGrid";
import { CustomerStatusSummary } from "./CustomerStatusSummary";
import { CanonicalCustomerTable } from "./CanonicalCustomerTable";
import { useAdminContext } from "@/contexts/AdminContext";

export function CustomerCommandDashboard() {
  const router = useRouter();
  const { hasPermission } = useAdminContext();
  const {
    paginatedCustomers,
    statusSummary,
    filters,
    setFilters,
    toastMessage,
    lastSynced,
    isRefreshing,
    handleRefresh,
    kpis,
    isLoading,
  } = useCustomerCommandCenter();

  return (
    <div className="min-h-screen bg-[#faf8f8] px-4 py-5 sm:px-6">
      {toastMessage && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-xs font-bold shadow-xl">
          {toastMessage.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          {toastMessage.type === "info" && <Info className="h-4 w-4 text-sky-600" />}
          {toastMessage.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
          {toastMessage.text}
        </div>
      )}

      <header className="mb-4 flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#671021]">Customer administration</p>
          <h1 className="text-2xl font-black text-ink">Customer Command Center</h1>
          <p className="mt-1 text-xs text-slate-500">Tenant-owned profiles, lifecycle status, and recent Customer activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {(hasPermission("customers.create") || hasPermission("customers.manage")) && <button type="button" onClick={() => router.push("/admin/customers/new")} className="inline-flex items-center gap-2 rounded-md bg-[#671021] px-3 py-2 text-xs font-bold text-white">
            <UserPlus className="h-4 w-4" />
            Create Customer
          </button>}
        </div>
      </header>

      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex-1 text-xs font-semibold text-slate-700">
          Search Customers
          <input value={filters.searchQuery} onChange={(event) => setFilters((current) => ({ ...current, searchQuery: event.target.value }))} placeholder="Name, company, country, or permitted PII" className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm" />
        </label>
        <p className="self-end pb-2 font-mono text-[10px] text-slate-400">Last synced: {lastSynced || "Not yet synced"}</p>
      </div>

      <CustomerKpiGrid kpis={kpis} />
      <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CanonicalCustomerTable customers={paginatedCustomers} isLoading={isLoading} />
        <CustomerStatusSummary statusSummary={statusSummary} isLoading={isLoading} onRetry={handleRefresh} />
      </div>
    </div>
  );
}
