"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderTree,
  Layers3,
  Link2,
  PackageSearch,
  Plus,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  EnterpriseDataTable,
  type Column,
} from "@/components/admin/common/EnterpriseDataTable";
import { FilterWorkspace } from "@/components/admin/common/FilterWorkspace";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import {
  LoadingSkeleton,
  EmptyState,
} from "@/components/admin/common/States";

import { useAdminContext } from "@/contexts/AdminContext";

import {
  CatalogueError,
  displayValue,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

import { metadataApi } from "@/features/admin/catalogue/api/catalogueApi";

import type {
  CategoryAdminSummary,
  PageResult,
} from "@/features/admin/catalogue/contracts/catalogueContracts";

import { catalogueCategoryPath } from "@/features/admin/catalogue/routes/catalogueRoutes";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function CategoriesPage() {
  const params = useSearchParams();
  const query = params.toString();

  const { hasPermission } =
    useAdminContext();

  const canRead = hasPermission(
    CATALOGUE_PERMISSIONS.view
  );

  const [data, setData] =
    useState<PageResult<CategoryAdminSummary> | null>(
      null
    );

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [loading, setLoading] =
    useState(canRead);

  useEffect(() => {
    if (!canRead) {
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);

    metadataApi
      .listCategories({
        search:
          params.get("search") ||
          undefined,
        status:
          params.get("status") ||
          undefined,
        page: Number(
          params.get("page") || 1
        ),
        pageSize: 20,
      })
      .then((value) => {
        if (active) {
          setData(value);
          setError(null);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason as LiveApiError
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [canRead, query, params]);

  const path = (page: number) => {
    const next =
      new URLSearchParams(
        params.toString()
      );

    if (page > 1) {
      next.set(
        "page",
        String(page)
      );
    } else {
      next.delete("page");
    }

    return `/admin/catalogue/categories${
      next.size
        ? `?${next.toString()}`
        : ""
    }`;
  };

  const rows = data?.data ?? [];

  const roots = Number(data?.summary?.root_categories ?? 0);
  const linked = Number(data?.summary?.attribute_links ?? 0);
  const products = Number(data?.summary?.product_links ?? 0);
  const active = Number(data?.summary?.active_categories ?? 0);
  const subcategories = Number(data?.summary?.subcategories ?? 0);
  const empty = Number(data?.summary?.empty_categories ?? 0);
  const uncategorized = Number(data?.summary?.uncategorized_products ?? 0);
  const missingAttributes = Number(data?.summary?.categories_missing_attributes ?? 0);

  const columns =
    useMemo<
      Column<CategoryAdminSummary>[]
    >(
      () => [
        {
          header: "Category",
          cell: (row) => (
            <div>
              <strong className="block text-[11.5px] font-bold text-gray-900">
                {row.name}
              </strong>

              <span className="block mt-0.5 text-[9.5px] font-mono text-gray-400">
                {row.slug}
              </span>
            </div>
          ),
        },
        {
          header: "Parent",
          cell: (row) =>
            displayValue(
              row.parent?.name,
              "Root"
            ),
        },
        {
          header: "Status",
          cell: (row) =>
            row.status,
        },
        {
          header: "Products",
          cell: (row) =>
            row.productCount,
        },
        {
          header: "Attributes",
          cell: (row) =>
            row.linkedAttributeCount,
        },
        {
          header: "Updated",
          cell: (row) =>
            formatDate(
              row.updatedAt
            ),
        },
      ],
      []
    );

  return (
    <PermissionGuard
      permission={
        CATALOGUE_PERMISSIONS.view
      }
      fallback={
        <CatalogueError
          error={Object.assign(
            new Error(
              "Permission required"
            ),
            {
              status: 403,
            }
          )}
        />
      }
    >
      <div className="flex flex-col gap-4 p-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
              Catalogue
              <span className="mx-2 text-gray-300">
                /
              </span>
              Categories
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
              Category Management
            </h1>

            <p className="mt-1 text-[11px] text-gray-500">
              Govern the
              tenant-owned operational
              taxonomy, hierarchy and
              Product applicability.
            </p>
          </div>

          <PermissionGuard
            permission={
              CATALOGUE_PERMISSIONS.categoriesManage
            }
          >
            <Link
              href="/admin/catalogue/categories/new"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a] transition-colors"
            >
              <Plus size={14} />
              New Category
            </Link>
          </PermissionGuard>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <CategoryMetric
            icon={
              <FolderTree
                size={16}
              />
            }
            label="Matching Categories"
            value={
              data?.total ??
              "—"
            }
            note="Tenant operational set"
          />

          <CategoryMetric
            icon={
              <Layers3
                size={16}
              />
            }
            label="Root Categories"
            value={roots}
            note="Full tenant taxonomy"
          />

          <CategoryMetric
            icon={
              <PackageSearch
                size={16}
              />
            }
            label="Product Links"
            value={products}
            note="Full tenant taxonomy"
          />

          <CategoryMetric
            icon={
              <Link2
                size={16}
              />
            }
            label="Attribute Links"
            value={linked}
            note="Full tenant taxonomy"
          />

          <CategoryMetric icon={<FolderTree size={16} />} label="Active Categories" value={active} note="Full tenant taxonomy" />
          <CategoryMetric icon={<Layers3 size={16} />} label="Subcategories" value={subcategories} note="Full tenant taxonomy" />
          <CategoryMetric icon={<PackageSearch size={16} />} label="Empty Categories" value={empty} note="No linked products" />
          <CategoryMetric icon={<PackageSearch size={16} />} label="Uncategorized Products" value={uncategorized} note="Tenant Product records" />
          <CategoryMetric icon={<Link2 size={16} />} label="Missing Attributes" value={missingAttributes} note="No attribute links" />
        </div>

        {data && <CategoryGovernanceTrend summary={data.summary} />}

        {/* FILTERS */}
        <div className="bg-white border border-gray-200 rounded p-4 shadow-2xs">
          <FilterWorkspace
            statusOptions={[
              "active",
              "inactive",
            ]}
            showAssignment={
              false
            }
          />
        </div>

        {/* TABLE SECTION */}
        <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Operational Taxonomy
            </h2>

            <p className="mt-0.5 text-[10.5px] text-gray-500">
              Legacy/global source rows
              are excluded from this
              workspace.
            </p>
          </div>

          {loading && (
            <div className="p-4">
              <LoadingSkeleton />
            </div>
          )}

          {error && (
            <div className="p-4">
              <CatalogueError
                error={error}
              />
            </div>
          )}

          {!loading &&
            !error &&
            data &&
            (rows.length ? (
              <EnterpriseDataTable
                rows={rows}
                columns={columns}
                actionLabel="Open category"
                href={(row) =>
                  catalogueCategoryPath(
                    row.id
                  )
                }
                page={data.page}
                totalPages={Math.max(
                  1,
                  Math.ceil(
                    data.total /
                      data.pageSize
                  )
                )}
                previousHref={
                  data.page > 1
                    ? path(
                        data.page -
                          1
                      )
                    : undefined
                }
                nextHref={
                  data.page *
                    data.pageSize <
                  data.total
                    ? path(
                        data.page +
                          1
                      )
                    : undefined
                }
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No categories found" />
              </div>
            ))}
        </section>
      </div>
    </PermissionGuard>
  );
}

function CategoryGovernanceTrend({summary}:{summary:PageResult<CategoryAdminSummary>["summary"]}) {
  const trend=(Array.isArray(summary?.governance_trend)?summary.governance_trend:[]) as {date:string;changes:number}[];
  const hasData=trend.some(point=>point.changes>0);
  return <section className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Category Governance Trend</h2><p className="mt-0.5 text-[10.5px] text-gray-500">Recorded category governance changes during the last 30 days.</p>{hasData?<div className="mt-3 h-56" data-testid="category-governance-trend"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{top:8,right:12,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/><XAxis dataKey="date" tick={{fontSize:9}} minTickGap={24}/><YAxis allowDecimals={false} tick={{fontSize:9}}/><Tooltip/><Line type="monotone" dataKey="changes" name="Governance changes" stroke="#741d35" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>:<div className="mt-3 flex h-48 items-center justify-center rounded border border-dashed text-xs text-gray-500">No category governance changes in the last 30 days</div>}</section>;
}

function CategoryMetric({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="text-[#741d35]">
          {icon}
        </div>

        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Live
        </span>
      </div>

      <div className="mt-3">
        <span className="block text-[10px] font-semibold text-gray-500">
          {label}
        </span>

        <strong className="block text-xl font-black text-gray-900 mt-0.5">
          {value}
        </strong>

        <span className="block text-[9.5px] text-gray-400 mt-1">
          {note}
        </span>
      </div>
    </div>
  );
}
