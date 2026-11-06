"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Braces,
  Filter,
  Layers3,
  Link2,
  Pencil,
  RefreshCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import {
  EmptyState,
  LoadingSkeleton,
} from "@/components/admin/common/States";

import { metadataApi } from "@/features/admin/catalogue/api/catalogueApi";

import type {
  AttributeAdminDetail,
  CategoryAdminSummary,
} from "@/features/admin/catalogue/contracts/catalogueContracts";

import {
  CatalogueError,
  displayValue,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

const fieldClass =
  "w-full min-h-9 rounded border border-gray-300 bg-white px-3 text-[11px] text-gray-800 outline-none transition-colors focus:border-[#741d35] focus:ring-2 focus:ring-[#741d35]/10";

export default function AttributeDetailPage() {
  const attributeId =
    useParams<{
      attributeId: string;
    }>().attributeId;

  const [data, setData] =
    useState<AttributeAdminDetail | null>(null);

  const [categories, setCategories] =
    useState<CategoryAdminSummary[]>([]);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [working, setWorking] =
    useState(false);

  const load = async () => {
    try {
      const attribute =
        await metadataApi.getAttribute(
          attributeId
        );

      setData(attribute);
      setError(null);
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    }
  };

  useEffect(() => {
    let active = true;

    metadataApi
      .getAttribute(attributeId)
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

    metadataApi
      .listCategories({
        pageSize: 100,
        sort: "name",
        direction: "asc",
      })
      .then((value) => {
        if (active) {
          setCategories(
            value.data
          );
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [attributeId]);

  const availableCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            !data?.linkedCategories.some(
              (link) =>
                link.category?.id ===
                category.id
            )
        ),
      [
        categories,
        data?.linkedCategories,
      ]
    );

  async function link(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      new FormData(
        event.currentTarget
      );

    setWorking(true);
    setError(null);

    try {
      await metadataApi.linkCategory(
        attributeId,
        {
          categoryId: String(
            form.get(
              "category_id"
            )
          ),
          isRequired:
            form.get(
              "is_required"
            ) === "on",
          isFilterable:
            form.get(
              "is_filterable"
            ) === "on",
          sortOrder: 0,
        }
      );

      await load();

      event.currentTarget.reset();
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    } finally {
      setWorking(false);
    }
  }

  async function unlink(
    categoryId: string
  ) {
    setWorking(true);
    setError(null);

    try {
      await metadataApi.unlinkCategory(
        attributeId,
        categoryId
      );

      await load();
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    } finally {
      setWorking(false);
    }
  }

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
          notFound="Attribute not found"
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
                Attributes
                <span className="mx-2 text-gray-300">
                  /
                </span>
                <span className="text-gray-800">
                  {data.id}
                </span>
              </div>

              <Link
                href="/admin/catalogue/attributes"
                className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-gray-600 hover:text-[#741d35]"
              >
                <ArrowLeft size={13} />
                Back to Attribute Management
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
                CATALOGUE_PERMISSIONS.attributesManage
              }
            >
              <Link
                href={`/admin/catalogue/attributes/${data.id}/edit`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a]"
              >
                <Pencil size={13} />
                Edit Attribute
              </Link>
            </PermissionGuard>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AttributeMetric
              icon={
                <Layers3 size={16} />
              }
              label="Usage Count"
              value={data.usageCount}
              note="Current authoritative usage"
            />

            <AttributeMetric
              icon={
                <Link2 size={16} />
              }
              label="Linked Categories"
              value={
                data.linkedCategoryCount
              }
              note="Category applicability"
            />

            <AttributeMetric
              icon={
                <Filter size={16} />
              }
              label="Filterable"
              value={
                data.isFilterable
                  ? "Yes"
                  : "No"
              }
              note="Catalogue filtering"
            />

            <AttributeMetric
              icon={
                <Braces size={16} />
              }
              label="Variant Defining"
              value={
                data.isVariantDefining
                  ? "Yes"
                  : "No"
              }
              note="Variant differentiation"
            />
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
            <div className="flex flex-col gap-4">
              {/* DEFINITION */}
              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">
                    Attribute Definition
                  </h2>

                  <p className="mt-0.5 text-[10.5px] text-gray-500">
                    Canonical Product Attribute configuration.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <DetailFact
                    label="Name"
                    value={data.name}
                  />

                  <DetailFact
                    label="Slug"
                    value={data.slug}
                    mono
                  />

                  <DetailFact
                    label="Group"
                    value={displayValue(
                      data.group?.name
                    )}
                  />

                  <DetailFact
                    label="Data Type"
                    value={data.dataType}
                  />

                  <DetailFact
                    label="Unit"
                    value={displayValue(
                      data.unit
                    )}
                  />

                  <DetailFact
                    label="Sort Order"
                    value={String(
                      data.sortOrder
                    )}
                  />

                  <DetailFact
                    label="Required"
                    value={
                      data.isRequired
                        ? "Yes"
                        : "No"
                    }
                  />

                  <DetailFact
                    label="Filterable"
                    value={
                      data.isFilterable
                        ? "Yes"
                        : "No"
                    }
                  />

                  <DetailFact
                    label="Variant Defining"
                    value={
                      data.isVariantDefining
                        ? "Yes"
                        : "No"
                    }
                  />

                  <DetailFact
                    label="Last Updated"
                    value={formatDate(
                      data.updatedAt
                    )}
                  />
                </div>
              </section>

              {/* LINKED CATEGORIES */}
              <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Linked Categories
                    </h2>

                    <p className="mt-0.5 text-[10.5px] text-gray-500">
                      Category applicability for this Attribute.
                    </p>
                  </div>

                  <span className="min-w-7 h-7 px-2 inline-flex items-center justify-center rounded-full bg-gray-100 text-[10.5px] font-bold text-gray-700">
                    {
                      data
                        .linkedCategories
                        .length
                    }
                  </span>
                </div>

                {data
                  .linkedCategories
                  .length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                            Category
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

                          <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {data.linkedCategories.map(
                          (link) => (
                            <tr
                              key={
                                link.id
                              }
                              className="hover:bg-gray-50/70"
                            >
                              <td className="px-4 py-3 text-[11.5px] font-bold text-gray-900">
                                {displayValue(
                                  link
                                    .category
                                    ?.name
                                )}
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

                              <td className="px-4 py-3 text-right">
                                {link
                                  .category && (
                                  <PermissionGuard
                                    permission={
                                      CATALOGUE_PERMISSIONS.attributesManage
                                    }
                                  >
                                    <button
                                      type="button"
                                      disabled={
                                        working
                                      }
                                      onClick={() =>
                                        unlink(
                                          link
                                            .category!
                                            .id
                                        )
                                      }
                                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-rose-300 bg-white text-[10.5px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                    >
                                      <Trash2
                                        size={
                                          12
                                        }
                                      />
                                      Unlink
                                    </button>
                                  </PermissionGuard>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6">
                    <EmptyState title="No linked Categories" />
                  </div>
                )}

                <PermissionGuard
                  permission={
                    CATALOGUE_PERMISSIONS.attributesManage
                  }
                >
                  <form
                    onSubmit={link}
                    className="border-t border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="mb-3">
                      <h3 className="text-[11.5px] font-bold text-gray-900">
                        Link Category
                      </h3>

                      <p className="mt-0.5 text-[10px] text-gray-500">
                        Add an operational Category relationship to this Attribute.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 items-end">
                      <label className="block">
                        <span className="block mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                          Category
                        </span>

                        <select
                          aria-label="Category"
                          name="category_id"
                          required
                          className={fieldClass}
                        >
                          <option value="">
                            Select Category
                          </option>

                          {availableCategories.map(
                            (
                              category
                            ) => (
                              <option
                                key={
                                  category.id
                                }
                                value={
                                  category.id
                                }
                              >
                                {
                                  category.name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <label className="flex h-9 items-center gap-2 rounded border border-gray-200 bg-white px-3 text-[10.5px] font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          name="is_required"
                          className="accent-[#741d35]"
                        />
                        Required
                      </label>

                      <label className="flex h-9 items-center gap-2 rounded border border-gray-200 bg-white px-3 text-[10.5px] font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          name="is_filterable"
                          className="accent-[#741d35]"
                        />
                        Filterable
                      </label>

                      <button
                        type="submit"
                        disabled={
                          working ||
                          availableCategories.length ===
                            0
                        }
                        className="h-9 px-4 rounded bg-[#741d35] text-white text-[10.5px] font-bold hover:bg-[#5c172a] disabled:opacity-50"
                      >
                        {working
                          ? "Linking..."
                          : "Link Category"}
                      </button>
                    </div>

                    {availableCategories.length ===
                      0 && (
                      <p className="mt-2 text-[9.5px] text-gray-400">
                        No additional Categories are available to link.
                      </p>
                    )}
                  </form>
                </PermissionGuard>
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
                    Metadata origin returned by the current Catalogue service.
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
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={14}
                      className="text-[#741d35]"
                    />

                    <h2 className="text-sm font-bold text-gray-900">
                      Behaviour Summary
                    </h2>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <SummaryRow
                    label="Required"
                    value={
                      data.isRequired
                        ? "Yes"
                        : "No"
                    }
                  />

                  <SummaryRow
                    label="Filterable"
                    value={
                      data.isFilterable
                        ? "Yes"
                        : "No"
                    }
                  />

                  <SummaryRow
                    label="Variant Defining"
                    value={
                      data.isVariantDefining
                        ? "Yes"
                        : "No"
                    }
                  />

                  <SummaryRow
                    label="Data Type"
                    value={
                      data.dataType
                    }
                  />

                  <SummaryRow
                    label="Usage"
                    value={String(
                      data.usageCount
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

function SummaryRow({
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