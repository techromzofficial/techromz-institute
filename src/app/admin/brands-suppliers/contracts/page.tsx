"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  Ban,
  FileSignature,
  Send,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { DonutChartCard } from "@/components/admin/brands-suppliers/charts/DonutChartCard";
import { TrendChartCard } from "@/components/admin/brands-suppliers/charts/TrendChartCard";
import { SupplierHealthGauge } from "@/components/admin/brands-suppliers/charts/SupplierHealthGauge";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

const STATUS_TABS = [
  { id: "all", label: "All Contracts" },
  { id: "draft", label: "Draft" },
  { id: "pending_review", label: "Pending Review" },
  { id: "approved", label: "Approved" },
  { id: "active", label: "Active" },
  { id: "expired", label: "Expired" },
  { id: "terminated", label: "Terminated" },
];

export default function SupplierContractsPage() {
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(canView);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  // New Contract Modal
  const [createModal, setCreateModal] = useState(false);
  const [newContractData, setNewContractData] = useState({
    supplier_id: "",
    contract_number: "",
    title: "",
    contract_type: "standard_supply",
    currency: "LKR",
    annual_value: "5000000",
    payment_terms: "Net 30",
    starts_at: "",
    expires_at: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);

  // Action Modals
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "sign" | "renew" | "terminate" | "amend";
    contract: any;
  } | null>(null);
  const [actionParam, setActionParam] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchContracts = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getContractsDashboard({
        search: search || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        page,
        per_page: 15,
        days,
      });

      setDashboardData(response);
      const rows = response.contracts?.data ?? [];
      setSelectedContract((current: any) => {
        if (!rows.length) return null;
        if (current && rows.some((r: any) => r.id === current.id)) return current;
        return rows[0];
      });
    } catch (e: any) {
      setError(e.message || "Failed to load contracts portfolio.");
    } finally {
      setLoading(false);
    }
  }, [canView, activeTab, search, page, days]);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await brandsSuppliersApi.createContract(newContractData);
      setCreateModal(false);
      setNewContractData({
        supplier_id: "",
        contract_number: "",
        title: "",
        contract_type: "standard_supply",
        currency: "LKR",
        annual_value: "5000000",
        payment_terms: "Net 30",
        starts_at: "",
        expires_at: "",
        notes: "",
      });
      void fetchContracts();
    } catch (e: any) {
      setError(e.message || "Failed to create contract.");
    } finally {
      setCreating(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionModal) return;

    setActionLoading(true);
    try {
      const id = actionModal.contract.id;
      if (actionModal.type === "approve") {
        await brandsSuppliersApi.approveContract(id);
      } else if (actionModal.type === "sign") {
        await brandsSuppliersApi.signContract(id);
      } else if (actionModal.type === "renew") {
        await brandsSuppliersApi.renewContract(id, actionParam);
      } else if (actionModal.type === "terminate") {
        await brandsSuppliersApi.terminateContract(id, actionParam || "Terminated by admin.");
      } else if (actionModal.type === "amend") {
        await brandsSuppliersApi.amendContract(id, {
          amendment_summary: actionParam,
          expected_updated_at: actionModal.contract.updated_at,
        });
      }

      setActionModal(null);
      setActionParam("");
      void fetchContracts();
    } catch (e: any) {
      setError(e.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const contracts = dashboardData?.contracts?.data ?? [];
  const meta = dashboardData?.contracts?.meta ?? { current_page: 1, per_page: 15, total: 0, last_page: 1 };
  const summary = dashboardData?.summary ?? {};
  const analytics = dashboardData?.analytics;
  const contractColors: Record<string, string> = { draft: "#6b7280", pending_approval: "#d97706", active: "#16a34a", terminated: "#dc2626", expired: "#ea580c" };
  const distribution = (analytics?.distribution ?? []).map((item: any) => ({ ...item, color: contractColors[item.name] ?? "#0284c7" }));

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Module", value: "Supplier Contracts Portfolio" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to view contracts.</p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <Link
                href="/admin/brands-suppliers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Command Center
              </Link>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Brands &amp; Suppliers / Contracts &amp; Agreements
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Contracts &amp; Commercial Agreements
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Tenant-scoped commercial agreements, amendments, version tracking and automated renewal schedules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateModal(true)}
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Plus size={14} />
                <span>New Agreement</span>
              </button>

              <button
                type="button"
                onClick={() => void fetchContracts()}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Contracts and version amendments operate against persistent tenant storage."
          />

          {error && (
            <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => void fetchContracts()} className="font-bold underline">Retry</button>
            </div>
          )}

          {/* KPIS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Total Contracts</span>
                <FileText size={15} className="text-gray-400" />
              </div>
              <strong className="block text-2xl mt-3">{summary.total ?? meta.total}</strong>
              <small className="text-gray-500">Commercial agreements</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Active Contracts</span>
                <CheckCircle2 size={15} className="text-green-600" />
              </div>
              <strong className="block text-2xl mt-3 text-green-700">{summary.active ?? 0}</strong>
              <small className="text-gray-500">In operational execution</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Pending Approval</span>
                <Clock size={15} className="text-amber-500" />
              </div>
              <strong className="block text-2xl mt-3 text-amber-700">{summary.pending_review ?? 0}</strong>
              <small className="text-gray-500">Under legal/commercial review</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Expiring in 30 Days</span>
                <ShieldAlert size={15} className="text-rose-500" />
              </div>
              <strong className="block text-2xl mt-3 text-rose-700">{summary.expiring_30_days ?? 0}</strong>
              <small className="text-gray-500">Renewal action required</small>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <DonutChartCard title="Contract Status Distribution" data={distribution} totalLabel="Contracts" totalValue={summary.total ?? meta.total} loading={loading} error={error} onRetry={fetchContracts} />
            <TrendChartCard title="Contract Lifecycle Events" data={analytics?.trend ?? []} days={days} onDaysChange={setDays} loading={loading} error={error} onRetry={fetchContracts} series={[{ key: "draft", name: "Created", color: "#6b7280", type: "line" }, { key: "approved", name: "Approved", color: "#0284c7", type: "bar" }, { key: "active", name: "Signed", color: "#16a34a", type: "bar" }, { key: "renewed", name: "Renewed", color: "#7c3aed", type: "bar" }]} />
          </div>

          {/* STATUS TABS */}
          <div className="border-b border-gray-200 mb-3">
            <div className="flex flex-wrap gap-4">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`pb-2 text-xs font-semibold border-b-2 ${
                    activeTab === tab.id
                      ? "border-rose-800 text-rose-800"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH */}
          <FilterToolbar
            searchPlaceholder="Search contracts by title, contract number, supplier..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              setPage(1);
              void fetchContracts();
            }}
            filters={[]}
            onClearAll={() => {
              setSearch("");
              setPage(1);
            }}
          />

          {/* TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-3">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">Agreements Directory</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{meta.total} records in current view</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[950px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Contract Ref</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Annual Value</th>
                    <th className="px-3 py-2">Version</th>
                    <th className="px-3 py-2">Expiry</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">Loading contracts…</td>
                    </tr>
                  ) : contracts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        No agreements found for the current filters.
                      </td>
                    </tr>
                  ) : (
                    contracts.map((ctr: any) => {
                      const isSelected = selectedContract?.id === ctr.id;
                      return (
                        <tr
                          key={ctr.id}
                          onClick={() => setSelectedContract(ctr)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2 font-mono font-bold text-gray-800">{ctr.contract_number}</td>
                          <td className="px-3 py-2 font-bold text-gray-900">{ctr.title}</td>
                          <td className="px-3 py-2 text-gray-600">{ctr.supplier?.company_name ?? "—"}</td>
                          <td className="px-3 py-2 text-gray-600 capitalize">{ctr.contract_type?.replace(/_/g, " ")}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ctr.status === "active"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : ctr.status === "terminated"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {ctr.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {ctr.currency} {Number(ctr.annual_value ?? 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 font-mono">v{ctr.version ?? 1}</td>
                          <td className="px-3 py-2 text-gray-500">
                            {ctr.expires_at ? new Date(ctr.expires_at).toLocaleDateString() : "Perpetual"}
                          </td>
                          <td className="px-3 py-2 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedContract(ctr)}
                              className="text-rose-700 hover:text-rose-900 font-bold"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {meta.last_page > 1 && (
              <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
                <div className="flex gap-1">
                  <button
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border rounded text-gray-600 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-2.5 py-1 border rounded text-gray-600 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* RIGHT INTELLIGENCE RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Contract Actions">
            {selectedContract ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-sm font-bold text-gray-900">{selectedContract.title}</div>
                  <div className="text-gray-500 text-[11px] font-mono">{selectedContract.contract_number}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded border border-gray-100">
                  <div>
                    <span className="text-gray-400 block">Status:</span>
                    <span className="font-bold text-gray-800 uppercase text-[10px]">{selectedContract.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Version:</span>
                    <span className="font-bold text-gray-800 text-[10px]">v{selectedContract.version}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  {selectedContract.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => setActionModal({ type: "approve", contract: selectedContract })}
                      className="w-full flex items-center justify-center gap-1 text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold py-1.5 rounded"
                    >
                      <CheckCircle2 size={12} />
                      <span>Approve Agreement</span>
                    </button>
                  )}

                  {selectedContract.status === "approved" && (
                    <button
                      type="button"
                      onClick={() => setActionModal({ type: "sign", contract: selectedContract })}
                      className="w-full flex items-center justify-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 rounded"
                    >
                      <FileSignature size={12} />
                      <span>Execute &amp; Sign</span>
                    </button>
                  )}

                  {selectedContract.status === "active" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActionModal({ type: "amend", contract: selectedContract })}
                        className="w-full flex items-center justify-center gap-1 text-xs bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-bold py-1.5 rounded border border-indigo-200"
                      >
                        <FileText size={12} />
                        <span>Create Amendment (New Version)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal({ type: "renew", contract: selectedContract })}
                        className="w-full flex items-center justify-center gap-1 text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold py-1.5 rounded border border-emerald-200"
                      >
                        <RotateCw size={12} />
                        <span>Renew Agreement</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal({ type: "terminate", contract: selectedContract })}
                        className="w-full flex items-center justify-center gap-1 text-xs bg-red-50 text-red-800 hover:bg-red-100 font-bold py-1.5 rounded border border-red-200"
                      >
                        <Ban size={12} />
                        <span>Terminate Agreement</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">Select a contract to inspect actions.</div>
            )}
          </RailSection>

          <RailSection title="Domain Health">
            <SupplierHealthGauge
              score={null}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>
        </RightIntelligenceRail>

        {/* CREATE MODAL */}
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900">Create New Supplier Agreement</h3>
              <form onSubmit={handleCreateContract} className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier ID *</label>
                  <input
                    type="number"
                    required
                    value={newContractData.supplier_id}
                    onChange={(e) => setNewContractData({ ...newContractData, supplier_id: e.target.value })}
                    placeholder="Enter Supplier ID number"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agreement Title *</label>
                  <input
                    type="text"
                    required
                    value={newContractData.title}
                    onChange={(e) => setNewContractData({ ...newContractData, title: e.target.value })}
                    placeholder="e.g. Master Distribution Agreement 2026"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Contract Type</label>
                    <select
                      value={newContractData.contract_type}
                      onChange={(e) => setNewContractData({ ...newContractData, contract_type: e.target.value })}
                      className="w-full border rounded p-2"
                    >
                      <option value="standard_supply">Standard Supply</option>
                      <option value="consignment">Consignment</option>
                      <option value="exclusive">Exclusive Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Annual Value (LKR)</label>
                    <input
                      type="number"
                      value={newContractData.annual_value}
                      onChange={(e) => setNewContractData({ ...newContractData, annual_value: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newContractData.starts_at}
                      onChange={(e) => setNewContractData({ ...newContractData, starts_at: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newContractData.expires_at}
                      onChange={(e) => setNewContractData({ ...newContractData, expires_at: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setCreateModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                  <button type="submit" disabled={creating} className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded">
                    {creating ? "Creating…" : "Create Contract"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ACTION MODAL */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900 capitalize">{actionModal.type} Contract</h3>
              <p className="text-gray-500">Contract: <strong>{actionModal.contract.title}</strong></p>

              {actionModal.type === "renew" ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">New Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={actionParam}
                    onChange={(e) => setActionParam(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {actionModal.type === "amend" ? "Amendment Scope / Justification *" : "Notes / Reason"}
                  </label>
                  <textarea
                    rows={3}
                    value={actionParam}
                    onChange={(e) => setActionParam(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActionModal(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteAction}
                  className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded"
                >
                  {actionLoading ? "Processing…" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
