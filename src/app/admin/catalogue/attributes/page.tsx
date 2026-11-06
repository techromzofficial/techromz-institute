"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Braces,
  Filter,
  Link2,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

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
  AttributeAdminSummary,
  PageResult,
} from "@/features/admin/catalogue/contracts/catalogueContracts";

import { catalogueAttributePath } from "@/features/admin/catalogue/routes/catalogueRoutes";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function AttributesPage() {
  const params = useSearchParams();
  const query = params.toString();

  const { hasPermission } =
    useAdminContext();

  const canRead = hasPermission(
    CATALOGUE_PERMISSIONS.view
  );

  const [data, setData] =
    useState<PageResult<AttributeAdminSummary> | null>(
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
      .listAttributes({
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

    return `/admin/catalogue/attributes${
      next.size
        ? `?${next.toString()}`
        : ""
    }`;
  };

  const rows = data?.data ?? [];

  const filterable = Number(data?.summary?.filterable_attributes ?? 0);
  const variant = Number(data?.summary?.variant_attributes ?? 0);
  const links = Number(data?.summary?.category_links ?? 0);
  const active = Number(data?.summary?.active_attributes ?? 0);
  const required = Number(data?.summary?.required_attributes ?? 0);
  const groups = Number(data?.summary?.attribute_groups ?? 0);
  const missingValues = Number(data?.summary?.missing_required_values ?? 0);

  const columns =
    useMemo<
      Column<AttributeAdminSummary>[]
    >(
      () => [
        {
          header: "Attribute",
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
          header: "Group",
          cell: (row) =>
            displayValue(
              row.group?.name
            ),
        },
        {
          header: "Type",
          cell: (row) => (
            <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              {row.dataType}
            </span>
          ),
        },
        {
          header: "Status",
          cell: (row) =>
            row.status,
        },
        {
          header: "Required",
          cell: (row) =>
            row.isRequired
              ? "Yes"
              : "No",
        },
        {
          header: "Filterable",
          cell: (row) =>
            row.isFilterable
              ? "Yes"
              : "No",
        },
        {
          header: "Categories",
          cell: (row) =>
            row.linkedCategoryCount,
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
              Attributes
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
              Attribute Management
            </h1>

            <p className="mt-1 text-[11px] text-gray-500">
              Control canonical Product
              Attributes, types, groups and
              Category applicability.
            </p>
          </div>

          <PermissionGuard
            permission={
              CATALOGUE_PERMISSIONS.attributesManage
            }
          >
            <Link
              href="/admin/catalogue/attributes/new"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a] transition-colors"
            >
              <Plus size={14} />
              New Attribute
            </Link>
          </PermissionGuard>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AttributeMetric
            icon={
              <SlidersHorizontal
                size={16}
              />
            }
            label="Matching Attributes"
            value={
              data?.total ??
              "—"
            }
            note="Tenant operational set"
          />

          <AttributeMetric
            icon={
              <Filter size={16} />
            }
            label="Filterable"
            value={filterable}
            note="Full tenant schema"
          />

          <AttributeMetric
            icon={
              <Braces size={16} />
            }
            label="Variant Defining"
            value={variant}
            note="Full tenant schema"
          />

          <AttributeMetric
            icon={
              <Link2 size={16} />
            }
            label="Category Links"
            value={links}
            note="Full tenant schema"
          />
          <AttributeMetric icon={<SlidersHorizontal size={16} />} label="Active Attributes" value={active} note="Full tenant schema" />
          <AttributeMetric icon={<SlidersHorizontal size={16} />} label="Attribute Groups" value={groups} note="Tenant groups" />
          <AttributeMetric icon={<Braces size={16} />} label="Required Attributes" value={required} note="Full tenant schema" />
          <AttributeMetric icon={<Filter size={16} />} label="Missing Required Values" value={missingValues} note="Active quality findings" />
        </div>

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
              Attribute Portfolio
            </h2>

            <p className="mt-0.5 text-[10.5px] text-gray-500">
              Supported persisted types:
              text, number, boolean, date
              and JSON.
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
                actionLabel="Open attribute"
                href={(row) =>
                  catalogueAttributePath(
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
                <EmptyState title="No attributes found" />
              </div>
            ))}
        </section>
      </div>
    </PermissionGuard>
  );
}

function AttributeMetric({
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
