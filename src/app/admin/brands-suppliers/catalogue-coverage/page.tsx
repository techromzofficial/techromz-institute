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
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Package,
  RefreshCw,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import {
  DashboardGrid,
  KpiCard,
} from "@/components/admin/shared/KpiCard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  HealthScoreGauge,
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { ChartCard } from "@/components/admin/shared/ChartCard";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

interface CatalogueProductRow {
  id: number | string;
  sku?: string | null;
  name?: string | null;
  status?: string | null;
  approval_status?: string | null;

  category?: {
    id?: number | string;
    name?: string | null;
  } | null;

  supplier_summary?: {
    id?: number | string;
    company_name?: string | null;
    name?: string | null;
  } | null;

  publication_summary?: {
    state?: string | null;
    published_at?: string | null;
  } | null;

  completeness?: {
    percentage?: number | null;
    missing_fields?: string[];
  } | null;

  updated_at?: string | null;
}

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

function approvalClasses(
  status?: string | null,
) {
  const value = String(
    status ?? "unknown",
  ).toLowerCase();

  if (
    value === "approved" ||
    value === "active"
  ) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (
    value === "submitted" ||
    value === "under_review" ||
    value === "pending"
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (
    value === "rejected" ||
    value === "information_requested"
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-600 border-gray-200";
}

export default function SupplierCatalogueCoveragePage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    BRANDS_SUPPLIERS_PERMISSIONS.view,
  );

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [data, setData] =
    useState<Awaited<
      ReturnType<
        typeof brandsSuppliersApi.getCatalogueCoverageDashboard
      >
    > | null>(null);

  const fetchDashboard =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await brandsSuppliersApi.getCatalogueCoverageDashboard(
            {
              search:
                search || undefined,
              page,
              per_page: 15,
            },
          );

        setData(response);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load catalogue coverage:",
          requestError,
        );

        setError(
          requestError.message ||
            "Unable to load catalogue coverage.",
        );
      } finally {
        setLoading(false);
      }
    }, [canView, page, search]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const products =
    useMemo(
      () =>
        (data?.products.data ??
          []) as CatalogueProductRow[],
      [data],
    );

  const meta =
    data?.products.meta ?? {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    };

  const catalogue =
    data?.catalogue;

  const totalProducts =
    Number(
      catalogue?.metrics.find(
        (metric: any) =>
          metric.id ===
          "products_total",
      )?.value ?? 0,
    );

  const activeProducts =
    Number(
      catalogue?.metrics.find(
        (metric: any) =>
          metric.id ===
          "products_active",
      )?.value ?? 0,
    );

  const approvalQueue =
    Number(
      catalogue?.approvalQueue.total ??
        0,
    );

  const lowStock =
    catalogue?.inventory.lowStock;

  const completeProductsAvailability =
    catalogue?.readiness.find(
      (item: any) =>
        item.id ===
        "catalogue_complete",
    );

  const kpis = [
    {
      index: 1,
      title: "Total Products",
      value:
        totalProducts.toLocaleString(),
      icon: Package,
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      index: 2,
      title: "Active Products",
      value:
        activeProducts.toLocaleString(),
      icon: CheckCircle2,
      iconBgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      index: 3,
      title: "Approval Queue",
      value:
        approvalQueue.toLocaleString(),
      icon: Clock,
      iconBgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      index: 4,
      title: "Low Stock",
      value:
        lowStock === null ||
        lowStock === undefined
          ? "Unavailable"
          : Number(
              lowStock,
            ).toLocaleString(),
      icon: AlertCircle,
      iconBgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      index: 5,
      title: "Complete Products",
      value:
        completeProductsAvailability
          ?.availability === "available"
          ? String(
              completeProductsAvailability.value ??
                0,
            )
          : "Unavailable",
      icon: Layers,
      iconBgColor: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      index: 6,
      title: "Expiring Inventory",
      value:
        catalogue?.inventory.expiring ===
          null ||
        catalogue?.inventory.expiring ===
          undefined
          ? "Unavailable"
          : String(
              catalogue.inventory
                .expiring,
            ),
      icon: FileText,
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
      value:
        "Supplier Catalogue Coverage",
    },
  ];

  const handleSearchSubmit = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }

    void fetchDashboard();
  };

  return (
    <PermissionGuard
      permission={
        BRANDS_SUPPLIERS_PERMISSIONS.view
      }
      fallback={
        <div className="p-6">
          Supplier access required.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12 space-y-4">
          {/* HEADER */}
          <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <Link
                href="/admin/brands-suppliers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Brands &amp; Suppliers
              </Link>

              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Brands &amp; Suppliers /
                Catalogue Coverage
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Supplier Product &amp;
                Catalogue Coverage
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-4xl">
                Monitor supplier-linked
                catalogue records,
                publication state,
                approval readiness,
                completeness and
                inventory-reference status
                within the current tenant.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void fetchDashboard()
              }
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced="On request"
            accessNote="Catalogue visibility is resolved from the authenticated tenant context"
          />

          {error && (
            <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* KPI GRID */}
          <DashboardGrid>
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.index}
                {...kpi}
              />
            ))}
          </DashboardGrid>

          {/* ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Catalogue Growth & Readiness Trend"
              subtitle="Historical SKU and publication trajectory"
              loading={false}
              error={null}
            >
              <div className="h-[220px] rounded border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-8">
                <Layers
                  size={24}
                  className="text-gray-300"
                />

                <div className="mt-3 text-sm font-semibold text-gray-500">
                  Historical trend
                  unavailable
                </div>

                <p className="mt-1 max-w-md text-[11px] leading-5 text-gray-400">
                  The current Catalogue
                  API exposes live
                  catalogue state but does
                  not provide historical
                  supplier catalogue
                  snapshots.
                </p>
              </div>
            </ChartCard>

            <ChartCard
              title="Supplier Catalogue Composition"
              subtitle="Category and brand distribution"
              loading={false}
              error={null}
            >
              <div className="h-[220px] rounded border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-8">
                <Package
                  size={24}
                  className="text-gray-300"
                />

                <div className="mt-3 text-sm font-semibold text-gray-500">
                  Composition analytics
                  unavailable
                </div>

                <p className="mt-1 max-w-md text-[11px] leading-5 text-gray-400">
                  Category is exposed per
                  product, but tenant-wide
                  supplier composition and
                  brand distribution are
                  not currently returned as
                  authoritative aggregate
                  analytics.
                </p>
              </div>
            </ChartCard>
          </div>

          {/* FILTER */}
          <FilterToolbar
            searchPlaceholder="Search product name or SKU..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={
              handleSearchSubmit
            }
            filters={[]}
            onClearAll={() => {
              setSearch("");
              setPage(1);
            }}
          />

          {/* PRODUCT TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h2 className="text-[13px] font-bold text-gray-900">
                Supplier Products
              </h2>

              <p className="text-[11px] text-gray-500 mt-0.5">
                {meta.total.toLocaleString()}{" "}
                catalogue records match
                the current filter
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[1350px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">
                      Product
                    </th>
                    <th className="px-3 py-2">
                      SKU
                    </th>
                    <th className="px-3 py-2">
                      Supplier
                    </th>
                    <th className="px-3 py-2">
                      Category
                    </th>
                    <th className="px-3 py-2">
                      Publication
                    </th>
                    <th className="px-3 py-2">
                      Approval
                    </th>
                    <th className="px-3 py-2">
                      Completeness
                    </th>
                    <th className="px-3 py-2">
                      Updated
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        Loading catalogue
                        records…
                      </td>
                    </tr>
                  ) : products.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        No catalogue records
                        matched the current
                        filters.
                      </td>
                    </tr>
                  ) : (
                    products.map(
                      (
                        row:
                          CatalogueProductRow,
                      ) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">
                            <div className="font-bold text-gray-900">
                              {row.name ??
                                "—"}
                            </div>

                            <div className="text-[10px] text-gray-400">
                              Product{" "}
                              {row.id}
                            </div>
                          </td>

                          <td className="px-3 py-2 font-mono text-[10px] text-gray-600">
                            {row.sku ??
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-gray-600">
                            {row
                              .supplier_summary
                              ?.company_name ??
                              row
                                .supplier_summary
                                ?.name ??
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-gray-600">
                            {row.category
                              ?.name ??
                              "—"}
                          </td>

                          <td className="px-3 py-2">
                            <span className="inline-flex rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-700">
                              {row
                                .publication_summary
                                ?.state ??
                                "unknown"}
                            </span>
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold capitalize ${approvalClasses(
                                row.approval_status,
                              )}`}
                            >
                              {String(
                                row.approval_status ??
                                  "unknown",
                              ).replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="px-3 py-2">
                            <div className="font-bold text-gray-900">
                              {row
                                .completeness
                                ?.percentage ??
                                0}
                              %
                            </div>

                            {row
                              .completeness
                              ?.missing_fields
                              ?.length ? (
                              <div className="text-[10px] text-amber-600">
                                {
                                  row
                                    .completeness
                                    .missing_fields
                                    .length
                                }{" "}
                                missing
                              </div>
                            ) : (
                              <div className="text-[10px] text-green-600">
                                Complete
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2 text-gray-500">
                            {formatDate(
                              row.updated_at,
                            )}
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
                    meta.current_page <=
                      1 || loading
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

        {/* RIGHT RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Catalogue Health">
            <HealthScoreGauge
              score={0}
              label="Catalogue Health"
              statusText="Not Assessed"
              statusColor="#6b7280"
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Catalogue Operations">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <span>
                  Total Products
                </span>
                <strong>
                  {totalProducts}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span>
                  Active Products
                </span>
                <strong>
                  {activeProducts}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span>
                  Approval Queue
                </span>
                <strong>
                  {approvalQueue}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span>
                  Low Stock
                </span>
                <strong>
                  {lowStock === null ||
                  lowStock === undefined
                    ? "Unavailable"
                    : lowStock}
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Data Availability">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>
                  Supplier Link
                </span>
                <strong className="text-green-700">
                  Available
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Category
                </span>
                <strong className="text-green-700">
                  Available
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Publication State
                </span>
                <strong className="text-green-700">
                  Available
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Approval State
                </span>
                <strong className="text-green-700">
                  Available
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Brand
                </span>
                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Per-row Stock
                </span>
                <strong className="text-gray-400">
                  Not exposed
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}