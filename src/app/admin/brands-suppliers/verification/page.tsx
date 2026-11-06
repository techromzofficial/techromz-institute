"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  XCircle,
  ArrowLeft,
  Search,
  ExternalLink,
  UserCheck,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  HealthScoreGauge,
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

const STATUS_TABS = [
  { id: "all", label: "All Queue" },
  { id: "pending", label: "Pending" },
  { id: "under_review", label: "Under Review" },
  { id: "information_requested", label: "Info Requested" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function SupplierVerificationQueuePage() {
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);
  const canVerify = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.verify);

  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(canView);
  const [error, setError] = useState<string | null>(null);

  const [queueData, setQueueData] = useState<any | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Quick Action Modal
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject" | "info";
    caseItem: any;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getVerificationQueue({
        search: search || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        page,
        per_page: 15,
      });

      setQueueData(response);
      const rows = response.data ?? [];
      setSelectedCase((current: any) => {
        if (!rows.length) return null;
        if (current && rows.some((r: any) => r.id === current.id)) return current;
        return rows[0];
      });
    } catch (e: any) {
      setError(e.message || "Failed to load verification queue.");
    } finally {
      setLoading(false);
    }
  }, [canView, activeTab, search, page]);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const handleExecuteAction = async () => {
    if (!actionModal) return;

    setActionLoading(true);
    try {
      if (actionModal.type === "approve") {
        await brandsSuppliersApi.approveVerification(actionModal.caseItem.id, actionNotes);
      } else if (actionModal.type === "reject") {
        await brandsSuppliersApi.rejectVerification(actionModal.caseItem.id, actionNotes || "Requirements not met.");
      } else if (actionModal.type === "info") {
        await brandsSuppliersApi.requestVerificationInformation(actionModal.caseItem.id, actionNotes || "Additional documents requested.");
      }

      setActionModal(null);
      setActionNotes("");
      void fetchQueue();
    } catch (e: any) {
      setError(e.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const cases = queueData?.data ?? [];
  const meta = queueData?.meta ?? { current_page: 1, per_page: 15, total: 0, last_page: 1 };
  const summary = queueData?.summary ?? {};

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Queue", value: "Supplier Verification Queue" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to view verification queue.</p>
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
                Brands &amp; Suppliers / Verification Queue
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Supplier Verification Queue
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Review legal registration, compliance documents and commercial standing before activating suppliers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchQueue()}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-60"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Verification approvals transactionally sync supplier verified status."
          />

          {error && (
            <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => void fetchQueue()} className="font-bold underline">Retry</button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Total Cases</span>
                <ShieldCheck size={15} className="text-gray-400" />
              </div>
              <strong className="block text-2xl mt-3">{summary.total ?? meta.total}</strong>
              <small className="text-gray-500">In this tenant</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Pending Review</span>
                <Clock size={15} className="text-amber-500" />
              </div>
              <strong className="block text-2xl mt-3 text-amber-700">{summary.pending ?? 0}</strong>
              <small className="text-gray-500">Awaiting reviewer decision</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Under Review</span>
                <UserCheck size={15} className="text-blue-500" />
              </div>
              <strong className="block text-2xl mt-3 text-blue-700">{summary.under_review ?? 0}</strong>
              <small className="text-gray-500">In active KYC investigation</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Approved</span>
                <CheckCircle2 size={15} className="text-green-600" />
              </div>
              <strong className="block text-2xl mt-3 text-green-700">{summary.approved ?? 0}</strong>
              <small className="text-gray-500">Successfully verified</small>
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

          {/* SEARCH */}
          <FilterToolbar
            searchPlaceholder="Search verification cases by supplier or case ID..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              setPage(1);
              void fetchQueue();
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
                <h2 className="text-[13px] font-bold text-gray-900">Verification Cases</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{meta.total} cases found</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Case Ref</th>
                    <th className="px-3 py-2">Supplier Entity</th>
                    <th className="px-3 py-2">Request Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Reviewer</th>
                    <th className="px-3 py-2">Submitted</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">Loading verification queue…</td>
                    </tr>
                  ) : cases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                        No verification cases in this view.
                      </td>
                    </tr>
                  ) : (
                    cases.map((c: any) => {
                      const isSelected = selectedCase?.id === c.id;
                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCase(c)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2 font-mono font-bold text-gray-800">
                            {c.uuid ? c.uuid.substring(0, 8).toUpperCase() : `CASE-${c.id}`}
                          </td>
                          <td className="px-3 py-2 font-bold text-gray-900">
                            <div>{c.supplier?.company_name ?? "Supplier"}</div>
                            <div className="text-[10px] text-gray-400 font-normal">
                              {c.company_profile?.legal_name ?? c.supplier?.email}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-600 capitalize">
                            {c.request_type ? c.request_type.replace(/_/g, " ") : "Onboarding"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.verification_status === "approved" || c.verification_status === "verified"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : c.verification_status === "rejected"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {c.verification_status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {c.reviewer?.name ?? "Unassigned"}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-3 py-2 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/admin/brands-suppliers/verification/${c.id}`}
                              className="text-rose-700 hover:text-rose-900 font-bold"
                            >
                              Inspect Case
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
                <span className="text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
                <div className="flex gap-1">
                  <button
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-gray-200 rounded text-gray-600 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-2.5 py-1 border border-gray-200 rounded text-gray-600 disabled:opacity-40"
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
          <RailSection title="Case Actions">
            {selectedCase ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-sm font-bold text-gray-900">{selectedCase.supplier?.company_name}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    Case: {selectedCase.uuid ? selectedCase.uuid.substring(0, 8).toUpperCase() : `#${selectedCase.id}`}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <Link
                    href={`/admin/brands-suppliers/verification/${selectedCase.id}`}
                    className="w-full flex items-center justify-center gap-1 text-xs bg-rose-800 hover:bg-rose-900 text-white font-bold py-1.5 rounded"
                  >
                    <span>Inspect Full Case</span>
                    <ExternalLink size={12} />
                  </Link>

                  {canVerify && selectedCase.verification_status !== "approved" && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setActionModal({ type: "approve", caseItem: selectedCase })}
                        className="flex items-center justify-center gap-1 text-[10px] bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 rounded col-span-2 shadow-sm"
                      >
                        <CheckCircle2 size={12} />
                        <span>Approve Verification</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal({ type: "info", caseItem: selectedCase })}
                        className="flex items-center justify-center gap-1 text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold py-1 rounded border border-amber-200"
                      >
                        <Clock size={11} />
                        <span>Request Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal({ type: "reject", caseItem: selectedCase })}
                        className="flex items-center justify-center gap-1 text-[10px] bg-red-50 text-red-700 hover:bg-red-100 font-bold py-1 rounded border border-red-200"
                      >
                        <XCircle size={11} />
                        <span>Reject Case</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">Select a case to inspect quick decision actions.</div>
            )}
          </RailSection>

          <RailSection title="Domain Status">
            <HealthScoreGauge
              score={0}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>
        </RightIntelligenceRail>

        {/* DECISION ACTION MODAL */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-gray-900 capitalize">
                {actionModal.type === "approve" ? "Approve Supplier Verification" : actionModal.type === "reject" ? "Reject Verification" : "Request Additional Information"}
              </h3>

              <p className="text-gray-500">
                Supplier: <strong>{actionModal.caseItem.supplier?.company_name}</strong>
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {actionModal.type === "approve" ? "Decision Notes (Optional)" : "Reason / Required Info *"}
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Provide audit notes or requirements..."
                  className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-rose-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteAction}
                  className={`px-4 py-1.5 rounded text-white font-bold shadow-sm ${
                    actionModal.type === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionModal.type === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {actionLoading ? "Processing…" : "Confirm Decision"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}