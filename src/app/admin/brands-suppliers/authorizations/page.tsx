"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import {
  DashboardGrid,
  KpiCard,
} from "@/components/admin/shared/KpiCard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { SupplierHealthGauge } from "@/components/admin/brands-suppliers/charts/SupplierHealthGauge";
import { TrendChartCard } from "@/components/admin/brands-suppliers/charts/TrendChartCard";
import { DonutDistributionChart } from "@/components/admin/shared/DonutDistributionChart";
import { HorizontalStatusChart } from "@/components/admin/shared/HorizontalStatusChart";
import { ChartCard } from "@/components/admin/shared/ChartCard";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

type AuthorizationStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "suspended"
  | "expired";

interface BrandAuthorizationRow {
  id: number | string;
  supplier_id?: number | string | null;
  brand_id?: number | string | null;

  authorization_type?: string | null;
  territory?: string | null;
  document_path?: string | null;

  starts_at?: string | null;
  expires_at?: string | null;

  status?: string | null;

  reviewed_by?: number | string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  brand?: {
    id?: number | string;
    name?: string | null;
  } | null;

  supplier?: {
    id?: number | string;
    company_name?: string | null;
    verification_status?: string | null;
    status?: string | null;
  } | null;

  reviewer?: {
    id?: number | string;
    name?: string | null;
  } | null;
}

const TABS = [
  { id: "all", label: "All Authorizations" },
  { id: "draft", label: "Draft" },
  { id: "submitted", label: "Submitted" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "suspended", label: "Suspended" },
  { id: "expired", label: "Expired" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function statusBadge(status?: string | null) {
  const normalized = String(
    status ?? "unknown",
  ).toLowerCase();

  const styles: Record<string, string> = {
    approved:
      "bg-green-50 text-green-700 border-green-200",
    submitted:
      "bg-blue-50 text-blue-700 border-blue-200",
    draft:
      "bg-gray-50 text-gray-700 border-gray-200",
    rejected:
      "bg-red-50 text-red-700 border-red-200",
    suspended:
      "bg-amber-50 text-amber-700 border-amber-200",
    expired:
      "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`inline-flex border px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
        styles[normalized] ??
        "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {normalized}
    </span>
  );
}

export default function AuthorizationsPage() {
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

  const [activeTab, setActiveTab] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [days, setDays] =
    useState(30);

  const [loading, setLoading] =
    useState(canRead);

  const [error, setError] =
    useState<string | null>(null);

  const [data, setData] =
    useState<Awaited<
      ReturnType<
        typeof brandsSuppliersApi.getBrandAuthorizations
      >
    > | null>(null);

  const fetchAuthorizations =
    useCallback(async () => {
      if (!canRead) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await brandsSuppliersApi.getBrandAuthorizations(
            {
              search:
                search || undefined,

              status:
                activeTab === "all"
                  ? undefined
                  : activeTab,

              page,
              per_page: 15,
              days,
            },
          );

        setData(result);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load brand authorizations:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load brand authorizations.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      activeTab,
      canRead,
      page,
      search,
      days,
    ]);

  useEffect(() => {
    void fetchAuthorizations();
  }, [
    activeTab,
    page,
    fetchAuthorizations,
  ]);

  const rows = useMemo(
    () =>
      (data?.data ??
        []) as BrandAuthorizationRow[],
    [data],
  );

  const summary = data?.summary ?? {
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    expired: 0,
    expiring_30_days: 0,
  };

  const meta = data?.meta ?? {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  };

  /*
   * These distribution values are backed by
   * tenant-wide server summary counts.
   */
  const statusDistribution =
    useMemo(
      () => [
        {
          name: "Approved",
          value: summary.approved,
          color: "#16a34a",
        },
        {
          name: "Submitted",
          value: summary.submitted,
          color: "#0284c7",
        },
        {
          name: "Draft",
          value: summary.draft,
          color: "#6b7280",
        },
        {
          name: "Rejected",
          value: summary.rejected,
          color: "#dc2626",
        },
        {
          name: "Suspended",
          value: summary.suspended,
          color: "#d97706",
        },
        {
          name: "Expired",
          value: summary.expired,
          color: "#ea580c",
        },
      ],
      [summary],
    );

  const statusSummary =
    useMemo(() => {
      const total =
        Math.max(summary.total, 1);

      return [
        {
          label: "Approved",
          count: summary.approved,
          percentage:
            (summary.approved /
              total) *
            100,
          color: "#16a34a",
        },
        {
          label: "Submitted",
          count: summary.submitted,
          percentage:
            (summary.submitted /
              total) *
            100,
          color: "#0284c7",
        },
        {
          label: "Draft",
          count: summary.draft,
          percentage:
            (summary.draft /
              total) *
            100,
          color: "#6b7280",
        },
        {
          label: "Rejected",
          count: summary.rejected,
          percentage:
            (summary.rejected /
              total) *
            100,
          color: "#dc2626",
        },
      ];
    }, [summary]);

  const kpis = [
    {
      index: 1,
      title: "Total Brand Authorizations",
      value:
        summary.total.toLocaleString(),
      icon: "Award",
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      index: 2,
      title: "Approved",
      value:
        summary.approved.toLocaleString(),
      icon: "CheckCircle2",
      iconBgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      index: 3,
      title: "Submitted for Review",
      value:
        summary.submitted.toLocaleString(),
      icon: "Clock",
      iconBgColor: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      index: 4,
      title: "Draft",
      value:
        summary.draft.toLocaleString(),
      icon: "FileText",
      iconBgColor: "bg-gray-50",
      iconColor: "text-gray-600",
    },
    {
      index: 5,
      title: "Expiring in 30 Days",
      value:
        summary.expiring_30_days.toLocaleString(),
      icon: "AlertCircle",
      iconBgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      index: 6,
      title: "Expired",
      value:
        summary.expired.toLocaleString(),
      icon: "AlertTriangle",
      iconBgColor: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      index: 7,
      title: "Rejected",
      value:
        summary.rejected.toLocaleString(),
      icon: "ShieldAlert",
      iconBgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      index: 8,
      title: "Suspended",
      value:
        summary.suspended.toLocaleString(),
      icon: "ShieldCheck",
      iconBgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      index: 9,
      title: "Territory Conflicts",
      value: "Unavailable",
      icon: "ShieldAlert",
      iconBgColor: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      index: 10,
      title: "Channel Violations",
      value: "Unavailable",
      icon: "AlertTriangle",
      iconBgColor: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      index: 11,
      title: "Authorization SLA",
      value: "Unavailable",
      icon: "Clock",
      iconBgColor: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      index: 12,
      title: "Letter Authenticity",
      value: "Unavailable",
      icon: "FileText",
      iconBgColor: "bg-gray-50",
      iconColor: "text-gray-500",
    },
  ];

  const contextItems = [
    {
      label: "Tenant",
      value: tenant.name,
    },
    {
      label: "Ecosystem",
      value: ecosystem.name,
    },
    {
      label: "Business Unit",
      value:
        businessUnit?.name ??
        "All permitted units",
    },
    {
      label: "Channel",
      value:
        channel?.name ??
        "All permitted channels",
    },
    {
      label: "Sector Pack",
      value:
        sectorPack?.name ??
        "Not assigned",
    },
    {
      label: "Scope",
      value: "Brand Authorizations",
    },
  ];

  const handleSearchSubmit = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }

    void fetchAuthorizations();
  };

  const handleClear = () => {
    setSearch("");
    setActiveTab("all");
    setPage(1);
  };

  return (
    <PermissionGuard
      permission={
        BRANDS_SUPPLIERS_PERMISSIONS.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          <div className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="font-bold text-gray-900">
              Supplier access required
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              You do not have permission to
              view brand authorizations for
              the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        {/* MAIN */}
        <main className="flex-grow min-w-0 px-6 py-4 pb-12 space-y-4">
          {/* HEADER */}
          <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Brands &amp; Suppliers /
                Authorizations
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Brand Authorization
                Management
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-4xl">
                Govern supplier-to-brand
                authorization rights,
                territory coverage, validity
                periods, review state and
                authorization evidence
                within the current tenant.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void fetchAuthorizations()
              }
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 shadow-sm disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span>Refresh</span>
            </button>
          </header>

          {/* CONTEXT */}
          <ContextScopeBar
            items={contextItems}
            lastSynced="On request"
            accessNote="Authorization access is resolved from the authenticated tenant context"
          />

          {error && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs flex justify-between gap-4"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  void fetchAuthorizations()
                }
                className="font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* ENTERPRISE KPI GRID */}
          <DashboardGrid>
            {kpis.map((kpi) => {
              const IconComponent =
                ICON_MAP[kpi.icon] ??
                Award;

              return (
                <KpiCard
                  key={kpi.index}
                  {...kpi}
                  icon={IconComponent}
                />
              );
            })}
          </DashboardGrid>

          {/* ENTERPRISE ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 min-h-[280px]">
              <TrendChartCard
                title="Authorization Lifecycle Events"
                data={data?.analytics?.trend ?? []}
                days={days}
                onDaysChange={setDays}
                loading={loading}
                error={error}
                onRetry={fetchAuthorizations}
                series={[
                  { key: "created", name: "Created", color: "#6b7280", type: "line" },
                  { key: "submitted", name: "Submitted", color: "#0284c7", type: "bar" },
                  { key: "approved", name: "Approved", color: "#16a34a", type: "bar" },
                  { key: "rejected", name: "Rejected", color: "#dc2626", type: "bar" },
                  { key: "renewed", name: "Renewed", color: "#7c3aed", type: "bar" },
                  { key: "suspended", name: "Suspended", color: "#d97706", type: "bar" },
                  { key: "expired", name: "Expired", color: "#ea580c", type: "bar" },
                ]}
              />
            </div>

            <ChartCard
              title="Authorization Status Distribution"
              subtitle="Tenant-wide lifecycle distribution"
              loading={loading}
              error={error}
              onRetry={
                fetchAuthorizations
              }
              className="min-h-[280px]"
            >
              <DonutDistributionChart
                data={
                  statusDistribution
                }
                totalLabel="Authorizations"
                totalValue={summary.total.toLocaleString()}
              />
            </ChartCard>
          </div>

          <ChartCard
            title="Authorization Lifecycle Summary"
            subtitle="Current tenant authorization state"
            loading={loading}
            error={error}
            onRetry={
              fetchAuthorizations
            }
          >
            <HorizontalStatusChart
              data={statusSummary}
              total={summary.total}
            />
          </ChartCard>

          {/* TABS */}
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(
                      tab.id,
                    );
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
            searchPlaceholder="Search by brand, supplier, territory or authorization type..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={
              handleSearchSubmit
            }
            filters={[]}
            onClearAll={handleClear}
          />

          {/* AUTHORIZATION TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">
                  Brand Authorizations
                </h2>

                <p className="text-[11px] text-gray-500 mt-0.5">
                  {meta.total.toLocaleString()}{" "}
                  records match the current
                  filter
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[1450px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">
                      Authorization ID
                    </th>

                    <th className="px-3 py-2">
                      Brand
                    </th>

                    <th className="px-3 py-2">
                      Supplier
                    </th>

                    <th className="px-3 py-2">
                      Type
                    </th>

                    <th className="px-3 py-2">
                      Territory
                    </th>

                    <th className="px-3 py-2">
                      Start
                    </th>

                    <th className="px-3 py-2">
                      Expiry
                    </th>

                    <th className="px-3 py-2">
                      Status
                    </th>

                    <th className="px-3 py-2">
                      Reviewer
                    </th>

                    <th className="px-3 py-2">
                      Reviewed
                    </th>

                    <th className="px-3 py-2">
                      Evidence
                    </th>

                    <th className="px-3 py-2 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        Loading brand
                        authorizations…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        No authorization
                        records matched the
                        current filters.
                      </td>
                    </tr>
                  ) : (
                    rows.map(
                      (
                        row:
                          BrandAuthorizationRow,
                      ) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 font-bold text-rose-800">
                            {row.id}
                          </td>

                          <td className="px-3 py-2">
                            <div className="font-bold text-gray-900">
                              {row.brand
                                ?.name ??
                                "—"}
                            </div>

                            {row.brand_id && (
                              <div className="text-[10px] text-gray-400">
                                Brand{" "}
                                {
                                  row.brand_id
                                }
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2">
                            <div className="font-semibold text-gray-900">
                              {row.supplier
                                ?.company_name ??
                                "—"}
                            </div>

                            {row.supplier_id && (
                              <div className="text-[10px] text-gray-400">
                                Supplier{" "}
                                {
                                  row.supplier_id
                                }
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2 text-gray-600">
                            {row.authorization_type ??
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-gray-600">
                            {row.territory ??
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-gray-500">
                            {formatDate(
                              row.starts_at,
                            )}
                          </td>

                          <td className="px-3 py-2 text-gray-500">
                            {formatDate(
                              row.expires_at,
                            )}
                          </td>

                          <td className="px-3 py-2">
                            {statusBadge(
                              row.status,
                            )}
                          </td>

                          <td className="px-3 py-2 text-gray-600">
                            {row.reviewer
                              ?.name ??
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-gray-500">
                            {formatDate(
                              row.reviewed_at,
                            )}
                          </td>

                          <td className="px-3 py-2">
                            {row.document_path ? (
                              <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                                <FileText
                                  size={
                                    11
                                  }
                                />
                                Present
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                Not provided
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-2 text-right">
                            <Link
                              href={`/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(
                                String(
                                  row.id,
                                ),
                              )}`}
                              className="inline-flex bg-[#171717] text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-black"
                            >
                              Open Case
                            </Link>
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="p-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500">
              <div>
                Page {meta.current_page} of{" "}
                {meta.last_page} ·{" "}
                {meta.total.toLocaleString()}{" "}
                records
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={
                    meta.current_page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                    )
                  }
                  className="px-2 py-1 bg-white border border-gray-200 rounded disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    meta.current_page >=
                      meta.last_page ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        meta.last_page,
                        current + 1,
                      ),
                    )
                  }
                  className="px-2 py-1 bg-white border border-gray-200 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ENTERPRISE INTELLIGENCE RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Authorization Readiness">
            <SupplierHealthGauge
              score={null}
              label="Authorization health"
              statusText="Not Assessed"
              statusColor="#6b7280"
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Review Queue">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between p-2 rounded bg-blue-50">
                <span className="text-gray-700">
                  Submitted
                </span>

                <strong className="text-blue-700">
                  {summary.submitted}
                </strong>
              </div>

              <div className="flex justify-between p-2 rounded bg-orange-50">
                <span className="text-gray-700">
                  Expiring 30 Days
                </span>

                <strong className="text-orange-700">
                  {
                    summary.expiring_30_days
                  }
                </strong>
              </div>

              <div className="flex justify-between p-2 rounded bg-red-50">
                <span className="text-gray-700">
                  Rejected
                </span>

                <strong className="text-red-700">
                  {summary.rejected}
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Authorization Controls">
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Tenant isolation
                </span>

                <strong className="text-green-700">
                  Enforced
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Review policy
                </span>

                <strong className="text-green-700">
                  Enforced
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Evidence reference
                </span>

                <strong className="text-green-700">
                  Available
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Advanced Intelligence">
            <div className="space-y-1.5 text-[11px] text-gray-500">
              <div className="flex justify-between">
                <span>
                  Territory conflicts
                </span>
                <strong>
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Channel violations
                </span>
                <strong>
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  SLA breaches
                </span>
                <strong>
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Letter authenticity
                </span>
                <strong>
                  Unavailable
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}
