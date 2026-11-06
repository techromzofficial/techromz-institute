"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileClock,
  Layers,
  Plus,
  RefreshCw,
  ShieldCheck,
  Upload,
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

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function SupplierImportExportAuditPage() {
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(canView);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [data, setData] = useState<any | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  // Import Modal
  const [importModal, setImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchAudits = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getImportExportAuditDashboard({
        search: search || undefined,
        page,
        per_page: 20,
      });

      setData(response);
      const rows = response.audits?.data ?? [];
      setSelectedAudit((current: any) => {
        if (!rows.length) return null;
        if (current && rows.some((r: any) => r.id === current.id)) return current;
        return rows[0];
      });
    } catch (e: any) {
      setError(e.message || "Failed to load audit history.");
    } finally {
      setLoading(false);
    }
  }, [canView, search, page]);

  useEffect(() => {
    void fetchAudits();
  }, [fetchAudits]);

  const handleDownloadTemplate = async () => {
    try {
      const template = await brandsSuppliersApi.getImportTemplate();
      const blob = new Blob([JSON.stringify(template.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `supplier_import_template_${tenant.name.toLowerCase().replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || "Failed to download template.");
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await brandsSuppliersApi.exportSuppliers();
      const blob = new Blob([JSON.stringify(exportData.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `supplier_export_${tenant.name.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice(`Exported ${exportData.data?.count ?? 0} suppliers successfully.`);
      void fetchAudits();
    } catch (e: any) {
      setError(e.message || "Export failed.");
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setError(null);
    try {
      const parsed = JSON.parse(importJson);
      const records = Array.isArray(parsed) ? parsed : (parsed.records ?? [parsed]);
      const res = await brandsSuppliersApi.importSuppliers(records);
      setImportModal(false);
      setImportJson("");
      setNotice(`Import completed: ${res.data?.imported_count ?? 0} suppliers created.`);
      void fetchAudits();
    } catch (e: any) {
      setError(e.message || "Import parsing/execution failed. Please ensure valid JSON array format.");
    } finally {
      setImporting(false);
    }
  };

  const audits = data?.audits?.data ?? [];
  const meta = data?.audits?.meta ?? { current_page: 1, per_page: 20, total: 0, last_page: 1 };
  const summary = data?.summary ?? {};

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Scope", value: "Supplier Data Operations & Audit Stream" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to view audit history.</p>
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
                Brands &amp; Suppliers / Data Import, Export &amp; Audit
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Data Operations &amp; Immutable Audit Log
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Tenant-scoped bulk supplier data management, secure template ingestion and complete cryptographic audit trail.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <Download size={13} />
                <span>Template</span>
              </button>

              <button
                type="button"
                onClick={() => setImportModal(true)}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <Upload size={13} />
                <span>Import Data</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Download size={13} />
                <span>Export Supplier Portfolio</span>
              </button>

              <button
                type="button"
                onClick={() => void fetchAudits()}
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
            accessNote="Audit logs are cryptographically sealed and tenant-isolated."
          />

          {error && (
            <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => void fetchAudits()} className="font-bold underline">Retry</button>
            </div>
          )}

          {notice && (
            <div className="my-3 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{notice}</span>
            </div>
          )}

          {/* KPIS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Total Audit Events</span>
                <FileClock size={15} className="text-gray-400" />
              </div>
              <strong className="block text-2xl mt-3">{summary.total ?? meta.total}</strong>
              <small className="text-gray-500">Recorded mutations</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Activity (Last 24h)</span>
                <Clock size={15} className="text-blue-500" />
              </div>
              <strong className="block text-2xl mt-3 text-blue-700">{summary.last24Hours ?? 0}</strong>
              <small className="text-gray-500">Recent changes</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Activity (Last 30d)</span>
                <Layers size={15} className="text-emerald-500" />
              </div>
              <strong className="block text-2xl mt-3 text-emerald-700">{summary.last30Days ?? 0}</strong>
              <small className="text-gray-500">Monthly throughput</small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Audited Suppliers</span>
                <ShieldCheck size={15} className="text-indigo-500" />
              </div>
              <strong className="block text-2xl mt-3 text-indigo-700">{summary.suppliersWithActivity ?? 0}</strong>
              <small className="text-gray-500">Distinct suppliers</small>
            </div>
          </section>

          {/* SEARCH */}
          <FilterToolbar
            searchPlaceholder="Search audit events by action, actor, resource ID..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              setPage(1);
              void fetchAudits();
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
                <h2 className="text-[13px] font-bold text-gray-900">Immutable Audit Trail</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{meta.total} records logged</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2">Resource</th>
                    <th className="px-3 py-2">Status Change</th>
                    <th className="px-3 py-2">Actor ID</th>
                    <th className="px-3 py-2">Correlation</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">Loading audit trail…</td>
                    </tr>
                  ) : audits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                        No audit records found matching query.
                      </td>
                    </tr>
                  ) : (
                    audits.map((a: any) => {
                      const isSelected = selectedAudit?.id === a.id;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedAudit(a)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2 text-gray-500">{formatDateTime(a.occurred_at)}</td>
                          <td className="px-3 py-2 font-mono font-bold text-rose-900">{a.action}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900">{a.supplier?.company_name ?? "—"}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {a.resource_type ? `${a.resource_type} #${a.resource_id ?? ""}` : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {a.previous_status || a.new_status ? (
                              <span className="font-mono text-[10px]">
                                {a.previous_status ?? "null"} → <strong>{a.new_status}</strong>
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-600">{a.actor?.id ?? "system"}</td>
                          <td className="px-3 py-2 font-mono text-gray-400 text-[10px]">
                            {a.correlation_id ? a.correlation_id.substring(0, 8) : "—"}
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
          <RailSection title="Domain Status">
            <HealthScoreGauge
              score={0}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>
        </RightIntelligenceRail>

        {/* IMPORT MODAL */}
        {importModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900">Bulk Ingest Supplier Records</h3>
              <p className="text-gray-500">
                Paste JSON array of supplier records (or click Template above to view sample headers).
              </p>
              <form onSubmit={handleImportSubmit} className="space-y-3">
                <textarea
                  rows={8}
                  required
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder={`[\n  {\n    "company_name": "Lanka Herbal Essentials",\n    "legal_name": "Lanka Herbal Essentials (Pvt) Ltd",\n    "business_type": "Manufacturer",\n    "registration_number": "PV-192834",\n    "email": "contact@lankaherbal.lk",\n    "country": "Sri Lanka"\n  }\n]`}
                  className="w-full font-mono text-[11px] border border-gray-300 rounded p-2"
                />

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setImportModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                  <button type="submit" disabled={importing} className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded">
                    {importing ? "Ingesting…" : "Ingest into Tenant"}
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