"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Database,
  RefreshCw,
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { DonutChartCard } from "@/components/admin/brands-suppliers/charts/DonutChartCard";
import { TrendChartCard } from "@/components/admin/brands-suppliers/charts/TrendChartCard";
import { SupplierHealthGauge } from "@/components/admin/brands-suppliers/charts/SupplierHealthGauge";
import { useAdminContext } from "@/contexts/AdminContext";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import type { SupplierSummary } from "@/services/api/brandsSuppliers";

type DashboardData = Awaited<
  ReturnType<typeof brandsSuppliersApi.getSuppliersDashboard>
>;

export default function BrandsSuppliersCommandCenter() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canRead = hasPermission(
    BRANDS_SUPPLIERS_PERMISSIONS.view,
  );

  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [commandCenterData, setCommandCenterData] = useState<any | null>(null);
  const [days, setDays] = useState(30);

  const fetchDashboard = useCallback(async () => {
    if (!canRead) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [suppliersResp, ccResp] = await Promise.all([
        brandsSuppliersApi.getSuppliersDashboard({ page: 1, per_page: 10, days }),
        brandsSuppliersApi.getCommandCenter(days),
      ]);

      setDashboardData(suppliersResp);
      if (ccResp) {
        setCommandCenterData(ccResp);
      }
    } catch (reason) {
      const requestError = reason as Error & { referenceId?: string | null };
      console.error(requestError);
      setError(requestError.message || "Failed to load Brands & Suppliers data.");
    } finally {
      setLoading(false);
    }
  }, [canRead, days]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const kpis = commandCenterData?.kpis ?? {};
  const suppliers = dashboardData?.suppliers?.data ?? [];
  const meta = dashboardData?.suppliers?.meta;
  const totalSuppliers = kpis.total_suppliers ?? meta?.total ?? 0;
  const activeSuppliers = kpis.active_suppliers ?? (dashboardData?.statusSummary as any)?.active ?? 0;
  const verifiedSuppliers = kpis.verified_suppliers ?? (dashboardData?.statusSummary as any)?.verified ?? 0;
  const pendingVerification = kpis.pending_verification ?? (dashboardData?.statusSummary as any)?.pending_verification ?? 0;
  const activeAuthorizations = kpis.active_authorizations ?? 0;
  const activeContracts = kpis.active_contracts ?? 0;
  const openComplianceCases = kpis.open_compliance_cases ?? 0;

  const verificationQueue = commandCenterData?.verification_queue ?? [];
  const expiringAuthorizations = commandCenterData?.expiring_authorizations ?? [];
  const recentActivity = commandCenterData?.recent_activity ?? [];
  const composition = commandCenterData?.composition ?? [];
  const analytics = commandCenterData?.analytics ?? dashboardData?.analytics;
  const palette = ["#be123c", "#0284c7", "#16a34a", "#d97706", "#7c3aed", "#6b7280"];
  const chartData = (items: any[] = []) => items.map((item, index) => ({ ...item, color: palette[index % palette.length] }));

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
              You do not have permission to view supplier administration for the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        {/* MAIN CONTENT */}
        <main className="flex-grow min-w-0 px-6 py-4 pb-12 space-y-4">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Brands &amp; Suppliers / Command Center
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Brands &amp; Suppliers Command Center
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Tenant-scoped supplier administration and operational references. Operating against authoritative backend data.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/brands-suppliers/suppliers"
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Users size={14} />
                <span>Open Suppliers</span>
              </Link>

              {hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.verify) && (
                <Link
                  href="/admin/brands-suppliers/verification"
                  className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-700 hover:bg-gray-50 shadow-sm font-semibold"
                >
                  <ShieldCheck size={13} />
                  <span>Verification Queue</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => void fetchDashboard()}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 shadow-sm disabled:opacity-60"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </header>

          {/* Trusted context */}
          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Access is resolved from the authenticated tenant context"
          />

          {/* API Error */}
          {error && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs flex items-center justify-between gap-4"
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

          {/* KPI SUMMARY */}
          <section
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            aria-label="Supplier portfolio metrics"
          >
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-900">Total Suppliers</div>
                <Users size={15} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-3">
                {loading ? "…" : Number(totalSuppliers).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <span className="text-green-600 font-semibold">{activeSuppliers} Active</span>
                <span>•</span>
                <span className="text-amber-600 font-semibold">{pendingVerification} Pending</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-900">Verified Rate</div>
                <ShieldCheck size={15} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-3">
                {totalSuppliers > 0 ? `${Math.round((verifiedSuppliers / totalSuppliers) * 100)}%` : "0%"}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {verifiedSuppliers} of {totalSuppliers} verified in this tenant
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-900">Active Brand Authorizations</div>
                <Building2 size={15} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-3">
                {loading ? "…" : activeAuthorizations}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Authorized brand coverage in current scope
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-900">Active Contracts</div>
                <FileText size={15} className="text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-3">
                {loading ? "…" : activeContracts}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {openComplianceCases > 0 ? `${openComplianceCases} Open Compliance Cases` : "All agreements compliant"}
              </div>
            </div>
          </section>

          {/* Quick Queues & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Verification Queue */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-amber-500" />
                  Verification Queue
                </h2>
                <Link
                  href="/admin/brands-suppliers/verification"
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
                >
                  View All ({pendingVerification})
                </Link>
              </div>

              {verificationQueue.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No suppliers currently pending verification in this tenant.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {verificationQueue.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{item.company_name}</div>
                        <div className="text-[11px] text-gray-500">
                          {item.business_type} • {item.city ? `${item.city}, ` : ""}{item.country}
                        </div>
                      </div>
                      <Link
                        href={`/admin/brands-suppliers/suppliers/${item.id}`}
                        className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiring Authorizations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock size={16} className="text-rose-500" />
                  Expiring Brand Authorizations (30d)
                </h2>
                <Link
                  href="/admin/brands-suppliers/brand-authorizations"
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
                >
                  Manage
                </Link>
              </div>

              {expiringAuthorizations.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No brand authorizations expiring within the next 30 days.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {expiringAuthorizations.map((auth: any) => (
                    <div key={auth.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          {auth.brand?.name ?? "Brand"} — {auth.supplier?.company_name ?? "Supplier"}
                        </div>
                        <div className="text-[11px] text-rose-600 font-medium">
                          Expires on {new Date(auth.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Link
                        href={`/admin/brands-suppliers/brand-authorizations/${auth.id}`}
                        className="text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold px-2 py-1 rounded"
                      >
                        Renew
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DonutChartCard title="Supplier Composition" data={chartData(analytics?.composition)} totalLabel="Suppliers" totalValue={totalSuppliers} loading={loading} error={error} onRetry={fetchDashboard} />
            <DonutChartCard title="Verification Distribution" data={chartData(analytics?.verification)} totalLabel="Suppliers" totalValue={totalSuppliers} loading={loading} error={error} onRetry={fetchDashboard} />
            <DonutChartCard title="Lifecycle Distribution" data={chartData(analytics?.lifecycle)} totalLabel="Suppliers" totalValue={totalSuppliers} loading={loading} error={error} onRetry={fetchDashboard} />
          </div>
          <TrendChartCard title="Supplier Onboarding Trend" data={analytics?.onboarding_trend ?? []} days={days} onDaysChange={setDays} loading={loading} error={error} onRetry={fetchDashboard} series={[{ key: "applications", name: "Applications", color: "#0284c7", type: "line" }, { key: "approved", name: "Approved", color: "#16a34a", type: "bar", stackId: "decisions" }, { key: "rejected", name: "Rejected", color: "#dc2626", type: "bar", stackId: "decisions" }]} />

          {/* Supplier Composition & Quick Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Supplier Business Composition</h2>
              {composition.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No supplier composition data available.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {composition.map((comp: any) => (
                    <div key={comp.type} className="border border-gray-100 bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">{comp.type}</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">{comp.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Domain Modules</h2>
              <div className="space-y-2 text-xs">
                <Link
                  href="/admin/brands-suppliers/suppliers/create"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-rose-800 font-bold border border-rose-100 bg-rose-50/50"
                >
                  <span>+ Onboard New Supplier (13 Steps)</span>
                  <ExternalLink size={12} />
                </Link>
                <Link
                  href="/admin/brands-suppliers/contracts"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-gray-700 font-semibold border border-gray-100"
                >
                  <span>Contracts &amp; Agreements</span>
                  <ExternalLink size={12} />
                </Link>
                <Link
                  href="/admin/brands-suppliers/performance"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-gray-700 font-semibold border border-gray-100"
                >
                  <span>Performance &amp; SLA</span>
                  <ExternalLink size={12} />
                </Link>
                <Link
                  href="/admin/brands-suppliers/risk-compliance"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-gray-700 font-semibold border border-gray-100"
                >
                  <span>Risk &amp; Compliance Cases</span>
                  <ExternalLink size={12} />
                </Link>
                <Link
                  href="/admin/brands-suppliers/import-export-audit"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-gray-700 font-semibold border border-gray-100"
                >
                  <span>Data Import, Export &amp; Audit</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT INTELLIGENCE RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Domain Health">
            <SupplierHealthGauge
              score={null}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Recent Audit Stream">
            {recentActivity.length === 0 ? (
              <div className="text-[11px] text-gray-400">No recent audit records</div>
            ) : (
              <div className="space-y-2 text-[11px]">
                {recentActivity.slice(0, 5).map((act: any) => (
                  <div key={act.id} className="border-b border-gray-100 pb-1.5">
                    <div className="font-bold text-gray-800">{act.action}</div>
                    <div className="text-gray-500 text-[10px]">
                      {act.resource_type} • {new Date(act.occurred_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}
