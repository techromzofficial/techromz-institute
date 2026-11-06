"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Zap,
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

export default function SupplierRiskCompliancePage() {
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(canView);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<any | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // New Compliance Case Modal
  const [caseModal, setCaseModal] = useState(false);
  const [caseData, setCaseData] = useState({
    supplier_id: "",
    case_type: "regulatory_investigation",
    severity: "medium",
    description: "",
  });
  const [savingCase, setSavingCase] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getRiskComplianceDashboard({
        search: search || undefined,
        page,
        per_page: 15,
      });

      setData(response);
      const rows = response.cases?.data ?? [];
      setSelectedCase((current: any) => {
        if (!rows.length) return null;
        if (current && rows.some((r: any) => r.id === current.id)) return current;
        return rows[0];
      });
    } catch (e: any) {
      setError(e.message || "Failed to load risk and compliance dashboard.");
    } finally {
      setLoading(false);
    }
  }, [canView, search, page]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCase(true);
    try {
      await brandsSuppliersApi.createComplianceCase(caseData);
      setCaseModal(false);
      setCaseData({
        supplier_id: "",
        case_type: "regulatory_investigation",
        severity: "medium",
        description: "",
      });
      void fetchDashboard();
    } catch (e: any) {
      setError(e.message || "Failed to log compliance case.");
    } finally {
      setSavingCase(false);
    }
  };

  const handleRunAssessment = async (supplierId: number) => {
    try {
      await brandsSuppliersApi.runRiskAssessment(supplierId);
      void fetchDashboard();
    } catch (e: any) {
      setError(e.message || "Failed to run assessment.");
    }
  };

  const cases = data?.cases?.data ?? [];
  const meta = data?.cases?.meta ?? { current_page: 1, per_page: 15, total: 0, last_page: 1 };
  const summary = data?.summary ?? {};
  const riskProfiles = data?.riskProfiles ?? [];

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Domain", value: "Risk & Compliance Governance" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to view supplier risk &amp; compliance.</p>
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
                Brands &amp; Suppliers / Risk &amp; Compliance
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Supplier Risk &amp; Compliance Governance
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Tenant-scoped risk profiles, compliance investigations, sanctions screening and corrective tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCaseModal(true)}
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Plus size={14} />
                <span>Log Compliance Case</span>
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
            accessNote="Risk assessments are computed against active tenant compliance cases."
          />

          {error && (
            <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => void fetchDashboard()} className="font-bold underline">Retry</button>
            </div>
          )}

          {/* KPIS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Total Compliance Cases</span>
                <ShieldCheck size={15} className="text-gray-400" />
              </div>
              <strong className="block text-2xl mt-3">{summary.total_cases ?? meta.total}</strong>
              <small className="text-gray-500">In this tenant</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Open Active Cases</span>
                <AlertTriangle size={15} className="text-amber-500" />
              </div>
              <strong className="block text-2xl mt-3 text-amber-700">{summary.open_cases ?? 0}</strong>
              <small className="text-gray-500">Under active investigation</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">High Risk Suppliers</span>
                <ShieldAlert size={15} className="text-rose-500" />
              </div>
              <strong className="block text-2xl mt-3 text-rose-700">{summary.high_risk_cases ?? 0}</strong>
              <small className="text-gray-500">Subject to operational limits</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">
                Low Risk Suppliers
              </span>
              <CheckCircle2
                size={15}
                className="text-emerald-600"
              />
            </div>

            <strong className="block text-2xl mt-3 text-emerald-700">
              {summary.low_risk_suppliers ?? 0}
            </strong>

            <small className="text-gray-500">
              Suppliers currently assessed as low risk
            </small>
          </div>
          </section>

          {/* SEARCH */}
          <FilterToolbar
            searchPlaceholder="Search compliance cases by reference or type..."
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

          {/* CASES TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-3">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">Compliance Cases &amp; Investigations</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{meta.total} cases found</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Case Number</th>
                    <th className="px-3 py-2">Case Type</th>
                    <th className="px-3 py-2">Assigned Investigator</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Logged Date</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">Loading cases…</td>
                    </tr>
                  ) : cases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                        No compliance cases currently open in this tenant.
                      </td>
                    </tr>
                  ) : (
                    cases.map((cs: any) => {
                      const isSelected = selectedCase?.id === cs.id;
                      return (
                        <tr
                          key={cs.id}
                          onClick={() => setSelectedCase(cs)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2 font-mono font-bold text-gray-800">{cs.case_number}</td>
                          <td className="px-3 py-2 text-gray-900 font-bold capitalize">{cs.case_type?.replace(/_/g, " ")}</td>
                          <td className="px-3 py-2 text-gray-600">{cs.assigned_to?.name ?? "Compliance Officer"}</td>
                          <td className="px-3 py-2">
                            <span className="font-bold text-amber-700 uppercase text-[10px]">
                              {cs.metadata?.severity ?? "Medium"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              {cs.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {cs.created_at ? new Date(cs.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-3 py-2 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleRunAssessment(cs.subject_id)}
                              className="text-rose-700 hover:text-rose-900 font-bold inline-flex items-center gap-1"
                            >
                              <Zap size={11} />
                              <span>Re-assess</span>
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
        </main>

        {/* RIGHT INTELLIGENCE RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Domain Status">
            <HealthScoreGauge
              score={0}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>
        </RightIntelligenceRail>

        {/* CREATE CASE MODAL */}
        {caseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900">Log Supplier Compliance Case</h3>
              <form onSubmit={handleCreateCase} className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier ID *</label>
                  <input
                    type="number"
                    required
                    value={caseData.supplier_id}
                    onChange={(e) => setCaseData({ ...caseData, supplier_id: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Case Type *</label>
                  <select
                    value={caseData.case_type}
                    onChange={(e) => setCaseData({ ...caseData, case_type: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="regulatory_investigation">Regulatory Investigation</option>
                    <option value="quality_defect">Severe Quality Defect</option>
                    <option value="counterfeit_suspected">Counterfeit / Unauthorized Goods</option>
                    <option value="sanctions_flag">Sanctions / PEP Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Severity Level</label>
                  <select
                    value={caseData.severity}
                    onChange={(e) => setCaseData({ ...caseData, severity: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity (Restrict Supplier)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Case Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={caseData.description}
                    onChange={(e) => setCaseData({ ...caseData, description: e.target.value })}
                    placeholder="Provide incident details, audit findings or regulatory notices..."
                    className="w-full border rounded p-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setCaseModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                  <button type="submit" disabled={savingCase} className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded">
                    {savingCase ? "Logging…" : "Log Case"}
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