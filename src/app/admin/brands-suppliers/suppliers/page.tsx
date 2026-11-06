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
  Building2,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  Users,
  Plus,
  Ban,
  Archive,
  AlertOctagon,
  ExternalLink,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { SupplierHealthGauge } from "@/components/admin/brands-suppliers/charts/SupplierHealthGauge";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";
import type { SupplierSummary } from "@/services/api/brandsSuppliers";

type DashboardData = Awaited<
  ReturnType<typeof brandsSuppliersApi.getSuppliersDashboard>
>;

const STATUS_TABS = [
  { id: "all", label: "All Suppliers" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
  { id: "archived", label: "Archived" },
];

export default function SupplierManagementPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canRead = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSummary | null>(null);

  // Lifecycle Action Modal State
  const [actionModal, setActionModal] = useState<{
    type: "suspend" | "restrict" | "archive";
    supplier: SupplierSummary;
    impact?: any;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!canRead) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getSuppliersDashboard({
        search: search || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        business_type: businessType || undefined,
        page,
        per_page: 15,
      });

      setDashboardData(response);

      const rows = response.suppliers.data as SupplierSummary[];
      setSelectedSupplier((current) => {
        if (!rows.length) {
          return null;
        }
        if (current && rows.some((supplier) => supplier.id === current.id)) {
          return current;
        }
        return rows[0];
      });
    } catch (reason) {
      const requestError = reason as Error & { referenceId?: string | null };
      console.error("Failed to load supplier directory:", requestError);
      setError(requestError.message || "Failed to load supplier directory.");
    } finally {
      setLoading(false);
    }
  }, [canRead, activeTab, search, businessType, page]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleSearchSubmit = () => {
    setPage(1);
    void fetchDashboard();
  };

  const handleClear = () => {
    setSearch("");
    setBusinessType(undefined);
    setPage(1);
  };

  const handleOpenActionModal = async (type: "suspend" | "restrict" | "archive", supplier: SupplierSummary) => {
    setActionError(null);
    setActionReason("");
    setActionModal({ type, supplier });
    try {
      const impactData = await brandsSuppliersApi.getSupplierImpact(supplier.id);
      setActionModal((prev) => prev ? { ...prev, impact: impactData } : null);
    } catch (err) {
      console.error("Impact analysis fetch error:", err);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionModal || !actionReason.trim()) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      if (actionModal.type === "suspend") {
        await brandsSuppliersApi.suspendSupplier(actionModal.supplier.id, actionReason.trim());
      } else if (actionModal.type === "restrict") {
        await brandsSuppliersApi.restrictSupplier(actionModal.supplier.id, actionReason.trim());
      } else if (actionModal.type === "archive") {
        await brandsSuppliersApi.archiveSupplier(actionModal.supplier.id, actionReason.trim());
      }

      setActionModal(null);
      void fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || "Failed to execute lifecycle transition.");
    } finally {
      setActionLoading(false);
    }
  };

  const suppliers = (dashboardData?.suppliers?.data as SupplierSummary[]) ?? [];
  const meta = dashboardData?.suppliers?.meta ?? { total: 0, current_page: 1, per_page: 15, last_page: 1 };
  const summary: any = dashboardData?.statusSummary ?? {};

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Business Unit", value: businessUnit?.name ?? "All permitted units" },
    { label: "Channel", value: channel?.name ?? "All permitted channels" },
    { label: "Sector Pack", value: sectorPack?.name ?? "Not assigned" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Supplier access required</h2>
            <p className="text-sm text-gray-500 mt-1">
              You do not have permission to view suppliers for the current tenant.
            </p>
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
                Brands &amp; Suppliers / Suppliers
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Supplier Management
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                View tenant-scoped supplier records, verification status and current operational lifecycle data.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/brands-suppliers/suppliers/create"
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Plus size={14} />
                <span>Onboard Supplier</span>
              </Link>

              <button
                type="button"
                onClick={() => void fetchDashboard()}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </header>

          {/* CONTEXT */}
          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Access is resolved from the authenticated tenant context"
          />

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="my-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs flex items-center justify-between gap-3"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void fetchDashboard()}
                className="font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* SUMMARY */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Total Suppliers</span>
                <Users size={15} className="text-gray-400" />
              </div>
              <strong className="block text-2xl mt-3">
                {loading ? "…" : (summary.total ?? meta.total).toLocaleString()}
              </strong>
              <small className="text-gray-500">Current tenant</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Active Suppliers</span>
                <Building2 size={15} className="text-green-600" />
              </div>
              <strong className="block text-2xl mt-3 text-green-700">
                {loading ? "…" : (summary.active ?? 0).toLocaleString()}
              </strong>
              <small className="text-gray-500">In operational state</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Verified Suppliers</span>
                <ShieldCheck size={15} className="text-emerald-500" />
              </div>
              <strong className="block text-2xl mt-3 text-emerald-700">
                {loading ? "…" : (summary.verified ?? 0).toLocaleString()}
              </strong>
              <small className="text-gray-500">KYC &amp; Legal verified</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Pending Verification</span>
                <AlertTriangle size={15} className="text-amber-500" />
              </div>
              <strong className="block text-2xl mt-3 text-amber-700">
                {loading ? "…" : (summary.pending_verification ?? 0).toLocaleString()}
              </strong>
              <small className="text-gray-500">In verification queue</small>
            </div>
          </section>

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

          {/* FILTERS */}
          <FilterToolbar
            searchPlaceholder="Search suppliers by name, email, city, country..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            filters={[]}
            onClearAll={handleClear}
          />

          {/* TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-3">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">Suppliers</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {meta.total.toLocaleString()} tenant-scoped records
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[950px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Verification</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Products</th>
                    <th className="px-3 py-2 text-right">Contracts</th>
                    <th className="px-3 py-2">Updated</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        Loading suppliers…
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        No supplier records found for the current filters in this tenant.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier) => {
                      const isSelected = selectedSupplier?.id === supplier.id;
                      return (
                        <tr
                          key={supplier.id}
                          onClick={() => setSelectedSupplier(supplier)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2 font-bold text-gray-900">
                            <div>{supplier.name}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{supplier.email}</div>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{supplier.type ?? "—"}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {supplier.city ? `${supplier.city}, ` : ""}{supplier.country ?? "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                supplier.verification_status === "verified"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : supplier.verification_status === "rejected"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {supplier.verification_status ?? "pending"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                supplier.status === "active"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : supplier.status === "suspended"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : supplier.status === "restricted"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {supplier.status ?? "active"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold">{supplier.activeProducts ?? 0}</td>
                          <td className="px-3 py-2 text-right font-bold">{(supplier as any).contracts_count ?? 0}</td>
                          <td className="px-3 py-2 text-gray-500">
                            {supplier.updated ? new Date(supplier.updated).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-3 py-2 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/admin/brands-suppliers/suppliers/${supplier.id}`}
                              className="inline-flex text-rose-700 hover:text-rose-900 font-bold text-[11px]"
                            >
                              View Detail
                            </Link>
                            <span className="text-gray-300">|</span>
                            <Link
                              href={`/admin/brands-suppliers/suppliers/${supplier.id}/edit`}
                              className="inline-flex text-gray-600 hover:text-gray-900 font-semibold text-[11px]"
                            >
                              Edit
                            </Link>
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
                <span className="text-gray-500">
                  Page {meta.current_page} of {meta.last_page} ({meta.total} records)
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-2.5 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
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
          <RailSection title="Selected Supplier">
            {selectedSupplier ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-sm font-bold text-gray-900">{selectedSupplier.name}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    {selectedSupplier.type} • {selectedSupplier.country}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded border border-gray-100">
                  <div>
                    <span className="text-gray-400 block">Verification:</span>
                    <span className="font-bold text-gray-800 uppercase text-[10px]">
                      {selectedSupplier.verification_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Lifecycle:</span>
                    <span className="font-bold text-gray-800 uppercase text-[10px]">
                      {selectedSupplier.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <Link
                    href={`/admin/brands-suppliers/suppliers/${selectedSupplier.id}`}
                    className="w-full flex items-center justify-center gap-1 text-xs bg-rose-800 hover:bg-rose-900 text-white font-bold py-1.5 rounded"
                  >
                    <span>Inspect Full Profile</span>
                    <ExternalLink size={12} />
                  </Link>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {selectedSupplier.status !== "suspended" && (
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal("suspend", selectedSupplier)}
                        className="flex items-center justify-center gap-1 text-[10px] bg-red-50 text-red-700 hover:bg-red-100 font-bold py-1 rounded border border-red-200"
                      >
                        <Ban size={11} />
                        <span>Suspend</span>
                      </button>
                    )}
                    {selectedSupplier.status !== "restricted" && (
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal("restrict", selectedSupplier)}
                        className="flex items-center justify-center gap-1 text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold py-1 rounded border border-amber-200"
                      >
                        <AlertOctagon size={11} />
                        <span>Restrict</span>
                      </button>
                    )}
                    {selectedSupplier.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal("archive", selectedSupplier)}
                        className="flex items-center justify-center gap-1 text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-1 rounded border border-gray-300 col-span-2"
                      >
                        <Archive size={11} />
                        <span>Archive Supplier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">Select a supplier to inspect quick actions.</div>
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

        {/* SENSITIVE ACTION CONFIRMATION MODAL */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center gap-2">
                {actionModal.type === "suspend" && <Ban size={20} className="text-red-600" />}
                {actionModal.type === "restrict" && <AlertOctagon size={20} className="text-amber-600" />}
                {actionModal.type === "archive" && <Archive size={20} className="text-gray-600" />}
                <h3 className="text-base font-bold text-gray-900 capitalize">
                  {actionModal.type} Supplier: {actionModal.supplier.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500">
                This action requires authoritative justification and will be permanently recorded in the immutable tenant audit stream.
              </p>

              {actionModal.impact && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1">
                  <div className="font-bold text-gray-700 mb-1">Impact Analysis:</div>
                  <div>• {actionModal.impact.active_products} active published products</div>
                  <div>• {actionModal.impact.active_contracts} active commercial contracts</div>
                  <div>• {actionModal.impact.active_brand_authorizations} brand authorizations</div>
                </div>
              )}

              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded">
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for {actionModal.type} *
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide detailed compliance, commercial or administrative reason..."
                  className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-rose-800"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !actionReason.trim()}
                  onClick={handleExecuteAction}
                  className={`px-3 py-1.5 rounded text-xs font-bold text-white shadow-sm disabled:opacity-50 ${
                    actionModal.type === "suspend"
                      ? "bg-red-600 hover:bg-red-700"
                      : actionModal.type === "restrict"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {actionLoading ? "Processing..." : `Confirm ${actionModal.type}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
