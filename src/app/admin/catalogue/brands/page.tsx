"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import {
  BadgeCheck,
  Image as ImageIcon,
  Plus,
  Tags,
  ToggleRight,
} from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  EnterpriseDataTable,
  type Column,
} from "@/components/admin/common/EnterpriseDataTable";
import { FilterWorkspace } from "@/components/admin/common/FilterWorkspace";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import {
  EmptyState,
  LoadingSkeleton,
} from "@/components/admin/common/States";

import { useAdminContext } from "@/contexts/AdminContext";

import {
  CatalogueError,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

import { brandApi } from "@/features/admin/catalogue/api/catalogueApi";

import type {
  BrandAdminSummary,
  PageResult,
} from "@/features/admin/catalogue/contracts/catalogueContracts";

import { catalogueBrandPath } from "@/features/admin/catalogue/routes/catalogueRoutes";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function BrandsPage() {
  const params = useSearchParams();
  const query = params.toString();

  const { hasPermission } =
    useAdminContext();

  const canRead = hasPermission(
    CATALOGUE_PERMISSIONS.view
  );

  const [data, setData] =
    useState<PageResult<BrandAdminSummary> | null>(
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

    brandApi
      .list({
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

  const pageHref = (page: number) => {
    const next =
      new URLSearchParams(query);

    if (page > 1) {
      next.set(
        "page",
        String(page)
      );
    } else {
      next.delete("page");
    }

    return `/admin/catalogue/brands${
      next.size
        ? `?${next.toString()}`
        : ""
    }`;
  };

  const rows = data?.data ?? [];

  const verified = Number(data?.summary?.verified_brands ?? 0);
  const active = Number(data?.summary?.active_brands ?? 0);
  const media = Number(data?.summary?.media_links ?? 0);
  const awaitingVerification = Number(data?.summary?.unverified_active_brands ?? 0);
  const inactive = Number(data?.summary?.inactive_brands ?? 0);

  const columns =
    useMemo<
      Column<BrandAdminSummary>[]
    >(
      () => [
        {
          header: "Brand",
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
          header: "Status",
          cell: (row) =>
            row.status,
        },
        {
          header: "Verified",
          cell: (row) => (
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                row.isVerified
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <BadgeCheck size={11} />
              {row.isVerified
                ? "Verified"
                : "Not verified"}
            </span>
          ),
        },
        {
          header: "Media",
          cell: (row) =>
            row.mediaCount,
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
              Brands
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
              Brand & Media Management
            </h1>

            <p className="mt-1 text-[11px] text-gray-500">
              Manage tenant-owned operational
              Brands and controlled
              Upload-backed media
              associations.
            </p>
          </div>

          <PermissionGuard
            permission={
              CATALOGUE_PERMISSIONS.brandsManage
            }
          >
            <Link
              href="/admin/catalogue/brands/new"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a] transition-colors"
            >
              <Plus size={14} />
              New Brand
            </Link>
          </PermissionGuard>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <BrandMetric
            icon={<Tags size={16} />}
            label="Matching Brands"
            value={
              data?.total ??
              "—"
            }
            note="Tenant operational set"
          />

          <BrandMetric
            icon={
              <ToggleRight
                size={16}
              />
            }
            label="Active"
            value={active}
            note="Full tenant portfolio"
          />

          <BrandMetric
            icon={
              <BadgeCheck
                size={16}
              />
            }
            label="Verified"
            value={verified}
            note="Full tenant portfolio"
          />

          <BrandMetric
            icon={
              <ImageIcon
                size={16}
              />
            }
            label="Media Links"
            value={media}
            note="Upload-backed associations"
          />
          <BrandMetric icon={<BadgeCheck size={16} />} label="Awaiting Verification" value={awaitingVerification} note="Active unverified Brands" />
          <BrandMetric icon={<ToggleRight size={16} />} label="Inactive" value={inactive} note="Full tenant portfolio" />
        </div>

        {data && <BrandReadinessDistribution summary={data.summary} />}

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

        {/* PORTFOLIO */}
        <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Brand Portfolio
            </h2>

            <p className="mt-0.5 text-[10.5px] text-gray-500">
              Open a Brand to manage
              approved logo and banner
              associations. Raw file paths
              are never accepted.
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
                actionLabel="Open workspace"
                href={(row) =>
                  catalogueBrandPath(
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
                    ? pageHref(
                        data.page -
                          1
                      )
                    : undefined
                }
                nextHref={
                  data.page *
                    data.pageSize <
                  data.total
                    ? pageHref(
                        data.page +
                          1
                      )
                    : undefined
                }
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No brands found" />
              </div>
            ))}
        </section>
      </div>
    </PermissionGuard>
  );
}

function BrandReadinessDistribution({summary}:{summary:PageResult<BrandAdminSummary>["summary"]}) {
  const distribution=[{name:"Verified active",value:Number(summary?.verified_active_brands??0)},{name:"Awaiting verification",value:Number(summary?.unverified_active_brands??0)},{name:"Inactive",value:Number(summary?.inactive_brands??0)}].filter(item=>item.value>0);
  const colors=["#059669","#f59e0b","#94a3b8"];
  return <section className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Brand Readiness Distribution</h2><p className="mt-0.5 text-[10.5px] text-gray-500">Tenant Brand verification and operational status.</p>{distribution.length?<div className="mt-3 h-64" data-testid="brand-readiness-distribution"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={2}>{distribution.map((item,index)=><Cell key={item.name} fill={colors[index]}/>)}</Pie><Tooltip/><Legend wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer></div>:<div className="mt-3 flex h-48 items-center justify-center rounded border border-dashed text-xs text-gray-500">No Brand data available</div>}</section>;
}

function BrandMetric({
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
