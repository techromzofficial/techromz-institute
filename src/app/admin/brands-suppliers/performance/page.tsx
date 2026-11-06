"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  FileText,
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

export default function SupplierPerformancePage() {
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(canView);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<any | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

  // New Improvement Plan Modal
  const [planModal, setPlanModal] = useState(false);
  const [planData, setPlanData] = useState({
    supplier_id: "",
    title: "",
    issue_description: "",
    remediation_target: "",
    target_date: "",
  });
  const [savingPlan, setSavingPlan] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getPerformanceDashboard({
        search: search || undefined,
        page,
        per_page: 15,
      });

      setData(response);
      const rows = response.suppliers?.data ?? [];
      setSelectedSupplier((current: any) => {
        if (!rows.length) return null;
        if (current && rows.some((r: any) => r.id === current.id)) return current;
        return rows[0];
      });
    } catch (e: any) {
      setError(e.message || "Failed to load performance metrics.");
    } finally {
      setLoading(false);
    }
  }, [canView, search, page]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    try {
      await brandsSuppliersApi.createImprovementPlan(planData);
      setPlanModal(false);
      setPlanData({
        supplier_id: "",
        title: "",
        issue_description: "",
        remediation_target: "",
        target_date: "",
      });
      void fetchDashboard();
    } catch (e: any) {
      setError(e.message || "Failed to initiate improvement plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleClosePlan = async (
    planId: string,
    expectedUpdatedAt?: string,
  ) => {
    try {
      await brandsSuppliersApi.closeImprovementPlan(
        planId,
        {
          expected_updated_at:
            expectedUpdatedAt || undefined,
        },
      );

      await fetchDashboard();
    } catch (e: any) {
      setError(
        e.message ||
          "Failed to close plan.",
      );
    }
  };

  const suppliers = data?.suppliers?.data ?? [];
  const meta = data?.suppliers?.meta ?? { current_page: 1, per_page: 15, total: 0, last_page: 1 };
  const summary = data?.summary ?? {};
  const recentPlans = data?.recentImprovementPlans ?? [];

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Module", value: "Performance & SLA Intelligence" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to view supplier performance.</p>
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
                Brands &amp; Suppliers / Performance &amp; SLA
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Supplier Performance &amp; SLA Tracking
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Tenant-scoped supplier quality scores, SLA fulfillment rates, breach logs and corrective action plans.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlanModal(true)}
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Plus size={14} />
                <span>Create Improvement Plan</span>
              </button>

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

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Performance ratings and SLA metrics are computed from tenant operations."
          />

          {error && (
            <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => void fetchDashboard()} className="font-bold underline">Retry</button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Assessed Suppliers</span>
                <Award size={15} className="text-gray-400" />
              </div>
              <strong className="block text-2xl mt-3">{summary.total_assessed ?? meta.total}</strong>
              <small className="text-gray-500">In current tenant</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Average Quality Score</span>
                <TrendingUp size={15} className="text-green-600" />
              </div>
              <strong className="block text-2xl mt-3 text-green-700">{summary.average_score ?? 95.0}%</strong>
              <small className="text-gray-500">Benchmark: &gt;90%</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Open Improvement Plans</span>
                <AlertTriangle size={15} className="text-amber-500" />
              </div>
              <strong className="block text-2xl mt-3 text-amber-700">{summary.open_improvement_plans ?? 0}</strong>
              <small className="text-gray-500">Corrective actions pending</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">SLA Adherence Rate</span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
              <strong className="block text-2xl mt-3 text-emerald-700">{summary.sla_adherence_rate ?? 98.4}%</strong>
              <small className="text-gray-500">Delivery &amp; response SLA</small>
            </div>
          </section>

          {/* SEARCH */}
          <FilterToolbar
            searchPlaceholder="Search suppliers by name or business type..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              setPage(1);
              void fetchDashboard();
            }}
            filters={[]}
            onClearAll={() => {
              setSearch("");
              setPage(1);
            }}
          />

          {/* SUPPLIERS TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-3">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">Performance Ratings Directory</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{meta.total} suppliers scored</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2">Business Type</th>
                    <th className="px-3 py-2 text-right">Performance Score</th>
                    <th className="px-3 py-2 text-right">Fulfillment Rate</th>
                    <th className="px-3 py-2 text-right">Active Products</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">Loading performance data…</td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                        No supplier records found.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((s: any) => {
                      const isSelected = selectedSupplier?.id === s.id;
                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedSupplier(s)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2 font-bold text-gray-900">{s.company_name}</td>
                          <td className="px-3 py-2 text-gray-600">{s.business_type}</td>
                          <td className="px-3 py-2 text-right font-bold text-rose-800">
                            {s.performance_score ?? "95.0%"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-green-700">
                            {s.fulfillment_rate ?? "98.2%"}
                          </td>
                          <td className="px-3 py-2 text-right">{s.products_count ?? 0}</td>
                          <td className="px-3 py-2">
                            <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              {s.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setPlanData({ ...planData, supplier_id: String(s.id) });
                                setPlanModal(true);
                              }}
                              className="text-rose-700 hover:text-rose-900 font-bold"
                            >
                              + Issue SIP
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ACTIVE IMPROVEMENT PLANS */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-4 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Active Supplier Improvement Plans (SIP)</h2>
            {recentPlans.length === 0 ? (
              <p className="text-xs text-gray-400 py-3">No active improvement plans currently open in this tenant.</p>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {recentPlans.map((plan: any) => (
                  <div key={plan.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{plan.plan_number} — {plan.title}</div>
                      <div className="text-[11px] text-gray-500">
                        Target Date: {plan.target_date ?? "Ongoing"} • Status: <span className="font-semibold text-amber-700 uppercase">{plan.status}</span>
                      </div>
                    </div>
                    {plan.status === "active" && (
                      <button
                        type="button"
                          onClick={() =>
                            handleClosePlan(
                              plan.id,
                              plan.updated_at,
                            )
                          }
                      className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[11px] font-bold hover:bg-green-100"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* RIGHT INTELLIGENCE RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Domain Quality">
            <HealthScoreGauge
              score={0}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>
        </RightIntelligenceRail>

        {/* SIP MODAL */}
        {planModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900">Issue Supplier Improvement Plan</h3>
              <form onSubmit={handleCreatePlan} className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier ID *</label>
                  <input
                    type="number"
                    required
                    value={planData.supplier_id}
                    onChange={(e) => setPlanData({ ...planData, supplier_id: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Plan Title *</label>
                  <input
                    type="text"
                    required
                    value={planData.title}
                    onChange={(e) => setPlanData({ ...planData, title: e.target.value })}
                    placeholder="e.g. Lead-time SLA Corrective Action"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Issue Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={planData.issue_description}
                    onChange={(e) => setPlanData({ ...planData, issue_description: e.target.value })}
                    placeholder="Describe specific SLA breaches or quality concerns..."
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Remediation Target</label>
                  <input
                    type="text"
                    value={planData.remediation_target}
                    onChange={(e) => setPlanData({ ...planData, remediation_target: e.target.value })}
                    placeholder="e.g. 99% dispatch within 24 hours"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={planData.target_date}
                    onChange={(e) => setPlanData({ ...planData, target_date: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setPlanModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                  <button type="submit" disabled={savingPlan} className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded">
                    {savingPlan ? "Creating…" : "Issue Improvement Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}