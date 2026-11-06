"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Boxes,
  FolderTree,
  GitBranch,
  Link2,
  Pencil,
  RefreshCcw,
  Tags,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import {
  EmptyState,
  LoadingSkeleton,
} from "@/components/admin/common/States";

import { metadataApi } from "@/features/admin/catalogue/api/catalogueApi";

import type { CategoryAdminDetail } from "@/features/admin/catalogue/contracts/catalogueContracts";

import {
  CatalogueError,
  displayValue,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function CategoryDetailPage() {
  const categoryId =
    useParams<{
      categoryId: string;
    }>().categoryId;

  const [data, setData] =
    useState<CategoryAdminDetail | null>(
      null
    );

  const [error, setError] =
    useState<LiveApiError | null>(null);

  useEffect(() => {
    let active = true;

    metadataApi
      .getCategory(categoryId)
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
      });

    return () => {
      active = false;
    };
  }, [categoryId]);

  const activeChildren = useMemo(
    () =>
      data?.children.filter(
        (child) =>
          child.status === "active"
      ).length ?? 0,
    [data]
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
      {!data && !error && (
        <LoadingSkeleton />
      )}

      {error && (
        <CatalogueError
          error={error}
          notFound="Category not found"
        />
      )}

      {data && (
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
                <span className="mx-2 text-gray-300">
                  /
                </span>
                <span className="text-gray-800">
                  {data.id}
                </span>
              </div>

              <Link
                href="/admin/catalogue/categories"
                className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-gray-600 hover:text-[#741d35]"
              >
                <ArrowLeft size={13} />
                Back to Category Management
              </Link>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  {data.name}
                </h1>

                <StatusBadge
                  status={data.status}
                />
              </div>

              <p className="mt-1 text-[11px] font-mono text-gray-500">
                {data.slug}
              </p>
            </div>

            <PermissionGuard
              permission={
                CATALOGUE_PERMISSIONS.categoriesManage
              }
            >
              <Link
                href={`/admin/catalogue/categories/${data.id}/edit`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a] transition-colors"
              >
                <Pencil size={13} />
                Edit Category
              </Link>
            </PermissionGuard>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <CategoryMetric
              icon={
                <Boxes size={16} />
              }
              label="Product Links"
              value={data.productCount}
              note="Products assigned"
            />

            <CategoryMetric
              icon={
                <Link2 size={16} />
              }
              label="Linked Attributes"
              value={
                data.linkedAttributeCount
              }
              note="Configured applicability"
            />

            <CategoryMetric
              icon={
                <GitBranch
                  size={16}
                />
              }
              label="Child Categories"
              value={
                data.children.length
              }
              note={`${activeChildren} active`}
            />

            <CategoryMetric
              icon={
                <FolderTree
                  size={16}
                />
              }
              label="Sort Order"
              value={data.sortOrder}
              note="Hierarchy ordering"
            />
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
            <div className="flex flex-col gap-4">
              {/* OVERVIEW */}
              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">
                    Category Overview
                  </h2>

                  <p className="mt-0.5 text-[10.5px] text-gray-500">
                    Tenant-owned operational
                    taxonomy information.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <DetailFact
                    label="Category Name"
                    value={data.name}
                  />

                  <DetailFact
                    label="Slug"
                    value={data.slug}
                    mono
                  />

                  <DetailFact
                    label="Parent Category"
                    value={displayValue(
                      data.parent?.name,
                      "Root"
                    )}
                  />

                  <DetailFact
                    label="Status"
                    value={data.status}
                  />

                  <DetailFact
                    label="Sort Order"
                    value={String(
                      data.sortOrder
                    )}
                  />

                  <DetailFact
                    label="Last Updated"
                    value={formatDate(
                      data.updatedAt
                    )}
                  />
                </div>

                <div className="border-t border-gray-100 p-4">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
                    Description
                  </span>

                  <p className="mt-2 text-[11.5px] leading-relaxed text-gray-700">
                    {displayValue(
                      data.description,
                      "No description"
                    )}
                  </p>
                </div>
              </section>

              {/* CHILDREN */}
              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Child Categories
                    </h2>

                    <p className="mt-0.5 text-[10.5px] text-gray-500">
                      Categories directly
                      nested under this node.
                    </p>
                  </div>

                  <span className="min-w-7 h-7 px-2 inline-flex items-center justify-center rounded-full bg-gray-100 text-[10.5px] font-bold text-gray-700">
                    {data.children.length}
                  </span>
                </div>

                {data.children.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Category
                          </th>

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            ID
                          </th>

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {data.children.map(
                          (child) => (
                            <tr
                              key={
                                child.id
                              }
                              className="hover:bg-gray-50/70"
                            >
                              <td className="px-4 py-3 text-[11.5px] font-bold text-gray-900">
                                {child.name}
                              </td>

                              <td className="px-4 py-3 text-[10.5px] font-mono text-gray-500">
                                {child.id}
                              </td>

                              <td className="px-4 py-3">
                                <StatusBadge
                                  status={
                                    child.status
                                  }
                                />
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6">
                    <EmptyState title="No child Categories" />
                  </div>
                )}
              </section>

              {/* LINKED ATTRIBUTES */}
              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Linked Attributes
                    </h2>

                    <p className="mt-0.5 text-[10.5px] text-gray-500">
                      Product attributes
                      applicable to this
                      category.
                    </p>
                  </div>

                  <span className="min-w-7 h-7 px-2 inline-flex items-center justify-center rounded-full bg-gray-100 text-[10.5px] font-bold text-gray-700">
                    {
                      data.linkedAttributes
                        .length
                    }
                  </span>
                </div>

                {data.linkedAttributes
                  .length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Attribute
                          </th>

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Required
                          </th>

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Filterable
                          </th>

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Sort Order
                          </th>

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {data.linkedAttributes.map(
                          (link) => (
                            <tr
                              key={link.id}
                              className="hover:bg-gray-50/70"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Tags
                                    size={
                                      13
                                    }
                                    className="text-[#741d35]"
                                  />

                                  <span className="text-[11.5px] font-bold text-gray-900">
                                    {displayValue(
                                      link
                                        .attribute
                                        ?.name
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-[11px] text-gray-700">
                                {link.isRequired
                                  ? "Yes"
                                  : "No"}
                              </td>

                              <td className="px-4 py-3 text-[11px] text-gray-700">
                                {link.isFilterable
                                  ? "Yes"
                                  : "No"}
                              </td>

                              <td className="px-4 py-3 text-[11px] text-gray-700">
                                {link.sortOrder}
                              </td>

                              <td className="px-4 py-3">
                                <StatusBadge
                                  status={
                                    link.status
                                  }
                                />
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6">
                    <EmptyState title="No linked Attributes" />
                  </div>
                )}
              </section>
            </div>

            {/* SIDEBAR */}
            <aside className="flex flex-col gap-4">
              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <RefreshCcw
                      size={14}
                      className="text-[#741d35]"
                    />

                    <h2 className="text-sm font-bold text-gray-900">
                      Source Metadata
                    </h2>
                  </div>

                  <p className="mt-1 text-[10.5px] text-gray-500">
                    Metadata origin
                    returned by the current
                    Catalogue service.
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  <SidebarFact
                    label="Source Pack"
                    value={displayValue(
                      data.source.pack
                    )}
                  />

                  <SidebarFact
                    label="Version"
                    value={displayValue(
                      data.source.version
                    )}
                  />

                  <SidebarFact
                    label="Definition Key"
                    value={displayValue(
                      data.source
                        .definitionKey
                    )}
                    mono
                  />
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">
                    Hierarchy Summary
                  </h2>
                </div>

                <div className="p-4 space-y-3">
                  <HierarchyRow
                    label="Parent"
                    value={displayValue(
                      data.parent?.name,
                      "Root"
                    )}
                  />

                  <HierarchyRow
                    label="Children"
                    value={String(
                      data.children.length
                    )}
                  />

                  <HierarchyRow
                    label="Active Children"
                    value={String(
                      activeChildren
                    )}
                  />

                  <HierarchyRow
                    label="Linked Products"
                    value={String(
                      data.productCount
                    )}
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
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

function DetailFact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="p-4 border-b border-r border-gray-100">
      <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span
        className={`block mt-1.5 text-[11.5px] font-semibold text-gray-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SidebarFact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="px-4 py-3">
      <span className="block text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span
        className={`block mt-1 text-[11px] font-semibold text-gray-800 break-words ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function HierarchyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10.5px] text-gray-500">
        {label}
      </span>

      <strong className="text-[11px] text-gray-900 text-right">
        {value}
      </strong>
    </div>
  );
}