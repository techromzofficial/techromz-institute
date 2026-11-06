"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Boxes,
  CheckCircle2,
  CircleOff,
  Plus,
  Pencil,
  Power,
  X,
} from "lucide-react";

import {
  EmptyState,
  LoadingSkeleton,
} from "@/components/admin/common/States";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { useAdminContext } from "@/contexts/AdminContext";

import { variantApi } from "../api/variantApi";
import type {
  ProductVariantDetail,
  VariantAttributeOption,
} from "../contracts/catalogueContracts";
import { CATALOGUE_PERMISSIONS } from "../permissions/cataloguePermissions";
import {
  CatalogueError,
  type LiveApiError,
} from "./LiveCatalogueState";

type Draft = {
  sku: string;
  name: string;
  variantName: string;
  description: string;
  barcode: string;
  status: string;
  values: Record<string, string | boolean | undefined>;
};

const emptyDraft = (): Draft => ({
  sku: "",
  name: "",
  variantName: "",
  description: "",
  barcode: "",
  status: "active",
  values: {},
});

class VariantFormError extends Error {}

interface ProductVariantsManagerProps {
  productId: string;
  productVersion: string;
  onProductVersion: (
    version: string,
    approvalStatus: string
  ) => void;
}

export function ProductVariantsManager({
  productId,
  productVersion,
  onProductVersion,
}: ProductVariantsManagerProps) {
  const { hasPermission } = useAdminContext();

  const canRead = hasPermission(
    CATALOGUE_PERMISSIONS.productsView
  );

  const canManage = hasPermission(
    CATALOGUE_PERMISSIONS.productsManage
  );

  const [rows, setRows] = useState<ProductVariantDetail[]>([]);
  const [options, setOptions] = useState<
    VariantAttributeOption[]
  >([]);

  const [loading, setLoading] = useState(canRead);
  const [working, setWorking] = useState(false);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [editing, setEditing] =
    useState<ProductVariantDetail | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [draft, setDraft] =
    useState<Draft>(emptyDraft);

  const load = useCallback(async () => {
    if (!canRead) {
      return;
    }

    setLoading(true);

    try {
      const [variants, attributes] =
        await Promise.all([
          variantApi.list(productId),
          variantApi.attributes(productId),
        ]);

      setRows(variants);
      setOptions(attributes);
      setError(null);
    } catch (reason) {
      setError(reason as LiveApiError);
    } finally {
      setLoading(false);
    }
  }, [canRead, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      active: rows.filter(
        (row) => row.status === "active"
      ).length,
      inactive: rows.filter(
        (row) => row.status !== "active"
      ).length,
    }),
    [rows]
  );

  function beginCreate() {
    setEditing(null);
    setDraft(emptyDraft());
    setFormError(null);
    setShowForm(true);
  }

  function beginEdit(row: ProductVariantDetail) {
    setEditing(row);

    setDraft({
      sku: row.sku ?? "",
      name: row.name,
      variantName: row.variantName ?? "",
      description: row.description ?? "",
      barcode: row.barcode ?? "",
      status: row.status,
      values: Object.fromEntries(
        row.attributeValues.map((attribute) => [
          attribute.attributeId,
          attribute.dataType === "boolean"
            ? Boolean(attribute.value)
            : attribute.dataType === "json"
            ? JSON.stringify(attribute.value)
            : String(attribute.value ?? ""),
        ])
      ),
    });

    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  }

  function typed(
    option: VariantAttributeOption,
    value: string | boolean
  ) {
    if (option.dataType === "boolean") {
      return value;
    }

    if (option.dataType === "number") {
      return Number(value);
    }

    if (option.dataType === "json") {
      let parsed: unknown;

      try {
        parsed = JSON.parse(String(value));
      } catch {
        throw new VariantFormError(
          `${option.name} must contain valid JSON.`
        );
      }

      if (
        parsed === null ||
        typeof parsed !== "object"
      ) {
        throw new VariantFormError(
          `${option.name} must be a JSON object or array.`
        );
      }

      return parsed;
    }

    return value;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    setWorking(true);
    setFormError(null);

    try {
      const attributeValues = options
        .filter(
          (option) =>
            draft.values[option.id] !== undefined &&
            draft.values[option.id] !== ""
        )
        .map((option) => ({
          attributeId: option.id,
          value: typed(
            option,
            draft.values[option.id] as
              | string
              | boolean
          ),
        }));

      const input = {
        sku: draft.sku || null,
        name: draft.name,
        variantName: draft.variantName || null,
        description: draft.description || null,
        barcode: draft.barcode || null,
        status: draft.status,
        attributeValues,
        expectedProductUpdatedAt: productVersion,
      };

      const saved = editing
        ? await variantApi.update(
            productId,
            editing.id,
            input
          )
        : await variantApi.create(productId, input);

      onProductVersion(
        saved.product.updatedAt,
        saved.product.approvalStatus
      );

      closeForm();
      setError(null);

      await load();
    } catch (reason) {
      if (reason instanceof VariantFormError) {
        setFormError(reason.message);
      } else {
        setError(reason as LiveApiError);
      }
    } finally {
      setWorking(false);
    }
  }

  async function changeStatus(
    row: ProductVariantDetail,
    next: "active" | "inactive"
  ) {
    if (!canManage) {
      return;
    }

    setWorking(true);

    try {
      const saved = await variantApi.setStatus(
        productId,
        row.id,
        next,
        productVersion
      );

      onProductVersion(
        saved.product.updatedAt,
        saved.product.approvalStatus
      );

      setError(null);

      await load();
    } catch (reason) {
      setError(reason as LiveApiError);
    } finally {
      setWorking(false);
    }
  }

  if (!canRead) {
    return null;
  }

  return (
    <section
      id="variants"
      aria-label="Product variants"
      className="flex flex-col gap-4"
    >
      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VariantMetric
          icon={<Boxes size={16} />}
          label="Total Variants"
          value={rows.length}
        />

        <VariantMetric
          icon={<CheckCircle2 size={16} />}
          label="Active"
          value={counts.active}
        />

        <VariantMetric
          icon={<CircleOff size={16} />}
          label="Inactive"
          value={counts.inactive}
        />
      </div>

      {error && <CatalogueError error={error} />}

      {/* VARIANT TABLE */}
      <div className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Product Variants
            </h2>

            <p className="text-[11px] text-gray-500 mt-0.5">
              Manage tenant-owned product variants and
              their authoritative attributes.
            </p>
          </div>

          <PermissionGuard
            permission={
              CATALOGUE_PERMISSIONS.productsManage
            }
          >
            <button
              type="button"
              onClick={beginCreate}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11.5px] font-bold hover:bg-[#5c172a] transition-colors"
            >
              <Plus size={14} />
              Add Variant
            </button>
          </PermissionGuard>
        </div>

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton />
          </div>
        ) : rows.length ? (
          <div
            id="variant-table"
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                    SKU
                  </th>

                  <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                    Name
                  </th>

                  <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                    Variant Label
                  </th>

                  <th className="px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                    Attributes
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
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-[11.5px] font-mono font-semibold text-gray-800">
                      {row.sku ?? "No SKU"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-[11.5px] font-bold text-gray-900">
                        {row.name}
                      </div>

                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Variant ID {row.id}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-[11px] text-gray-700">
                      {row.variantName ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {row.attributeValues.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {row.attributeValues.map(
                            (attribute) => (
                              <span
                                key={
                                  attribute.attributeId
                                }
                                className="inline-flex items-center px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-[10px] text-gray-700"
                              >
                                <strong className="mr-1">
                                  {attribute.name}:
                                </strong>

                                {typeof attribute.value ===
                                "object"
                                  ? JSON.stringify(
                                      attribute.value
                                    )
                                  : String(
                                      attribute.value
                                    )}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-[10.5px] text-gray-400">
                          SKU-only variant
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={row.status}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <PermissionGuard
                        permission={
                          CATALOGUE_PERMISSIONS.productsManage
                        }
                      >
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              beginEdit(row)
                            }
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-gray-300 bg-white text-[10.5px] font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={working}
                            onClick={() =>
                              changeStatus(
                                row,
                                row.status ===
                                  "active"
                                  ? "inactive"
                                  : "active"
                              )
                            }
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-gray-300 bg-white text-[10.5px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Power size={12} />

                            {row.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="No variants" />
          </div>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <PermissionGuard
          permission={
            CATALOGUE_PERMISSIONS.productsManage
          }
        >
          <form
            onSubmit={submit}
            className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {editing
                    ? "Edit Variant"
                    : "Add Variant"}
                </h2>

                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  Variant changes use the current
                  product version and Catalogue
                  application service.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close variant form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              {formError && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-semibold"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <VariantField label="SKU">
                  <input
                    aria-label="Variant SKU"
                    value={draft.sku}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sku: event.target.value,
                      }))
                    }
                    className={fieldClass}
                    placeholder="Variant SKU"
                  />
                </VariantField>

                <VariantField
                  label="Name"
                  required
                >
                  <input
                    aria-label="Variant name"
                    required
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className={fieldClass}
                    placeholder="Variant name"
                  />
                </VariantField>

                <VariantField label="Variant Label">
                  <input
                    value={draft.variantName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        variantName:
                          event.target.value,
                      }))
                    }
                    className={fieldClass}
                    placeholder="e.g. 100ml / Red / Large"
                  />
                </VariantField>

                <VariantField label="Barcode">
                  <input
                    value={draft.barcode}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        barcode:
                          event.target.value,
                      }))
                    }
                    className={fieldClass}
                    placeholder="Barcode"
                  />
                </VariantField>

                <VariantField label="Status">
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status:
                          event.target.value,
                      }))
                    }
                    className={fieldClass}
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                    <option value="draft">
                      Draft
                    </option>
                  </select>
                </VariantField>

                <div className="md:col-span-2 xl:col-span-3">
                  <VariantField label="Description">
                    <textarea
                      value={draft.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          description:
                            event.target.value,
                        }))
                      }
                      rows={3}
                      className={`${fieldClass} py-2 resize-y`}
                      placeholder="Variant description"
                    />
                  </VariantField>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="mb-3">
                  <h3 className="text-xs font-bold text-gray-900">
                    Variant Attributes
                  </h3>

                  <p className="text-[10.5px] text-gray-500 mt-1">
                    A variant with no
                    differentiating attributes must
                    have a SKU.
                  </p>
                </div>

                {options.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {options.map((option) => (
                      <AttributeControl
                        key={option.id}
                        option={option}
                        value={
                          draft.values[option.id]
                        }
                        onChange={(value) => {
                          setFormError(null);

                          setDraft((current) => ({
                            ...current,
                            values: {
                              ...current.values,
                              [option.id]: value,
                            },
                          }));
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-[11px] text-gray-500">
                    No operational variant
                    attributes are configured for
                    this Product Category.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={working}
                  className="h-9 px-4 rounded border border-gray-300 bg-white text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={working}
                  className="h-9 px-4 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a] disabled:opacity-50"
                >
                  {working
                    ? "Saving..."
                    : editing
                    ? "Save Changes"
                    : "Create Variant"}
                </button>
              </div>
            </div>
          </form>
        </PermissionGuard>
      )}
    </section>
  );
}

function VariantMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
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
        <span className="block text-[10.5px] font-semibold text-gray-500">
          {label}
        </span>

        <strong className="block text-xl font-black text-gray-900 mt-0.5">
          {value}
        </strong>
      </div>
    </div>
  );
}

function VariantField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
        {label}
        {required && (
          <span className="text-rose-600 ml-0.5">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

const fieldClass =
  "w-full min-h-9 rounded border border-gray-300 bg-white px-3 text-[11.5px] text-gray-800 outline-none transition-colors focus:border-[#741d35] focus:ring-2 focus:ring-[#741d35]/10";

function AttributeControl({
  option,
  value,
  onChange,
}: {
  option: VariantAttributeOption;
  value: string | boolean | undefined;
  onChange: (
    value: string | boolean | undefined
  ) => void;
}) {
  if (option.dataType === "boolean") {
    return (
      <VariantField label={option.name}>
        <select
          aria-label={option.name}
          value={
            value === undefined
              ? ""
              : value
              ? "true"
              : "false"
          }
          onChange={(event) =>
            onChange(
              event.target.value === ""
                ? undefined
                : event.target.value ===
                  "true"
            )
          }
          className={fieldClass}
        >
          <option value="">Not set</option>
          <option value="true">True</option>
          <option value="false">
            False
          </option>
        </select>
      </VariantField>
    );
  }

  if (option.dataType === "json") {
    return (
      <VariantField label={option.name}>
        <textarea
          aria-label={option.name}
          value={String(value ?? "")}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`${fieldClass} min-h-20 py-2`}
          placeholder='{"key":"value"}'
        />
      </VariantField>
    );
  }

  return (
    <VariantField label={option.name}>
      <input
        aria-label={option.name}
        type={
          option.dataType === "number"
            ? "number"
            : option.dataType === "date"
            ? "date"
            : "text"
        }
        value={String(value ?? "")}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={fieldClass}
      />
    </VariantField>
  );
}