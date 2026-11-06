"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import {
  CheckSquare,
  FolderTree,
  Info,
  Save,
  SlidersHorizontal,
} from "lucide-react";

import { metadataApi } from "../api/catalogueApi";

import {
  PRODUCT_ATTRIBUTE_DATA_TYPES,
  type AttributeAdminDetail,
  type CategoryAdminDetail,
  type EntitySummary,
  type ProductAttributeDataType,
} from "../contracts/catalogueContracts";

import {
  CatalogueError,
  type LiveApiError,
} from "./LiveCatalogueState";

const fieldClass =
  "w-full min-h-10 rounded border border-gray-300 bg-white px-3 text-[11.5px] text-gray-800 outline-none transition-colors focus:border-[#741d35] focus:ring-2 focus:ring-[#741d35]/10";

const attributeDataType = (
  value: FormDataEntryValue | null
): ProductAttributeDataType =>
  PRODUCT_ATTRIBUTE_DATA_TYPES.find(
    (type) => type === value
  ) ?? "text";

/* -------------------------------------------------------------------------- */
/* CATEGORY FORM                                                              */
/* -------------------------------------------------------------------------- */

export function CategoryForm({
  record,
}: {
  record?: CategoryAdminDetail;
}) {
  const router = useRouter();

  const [parents, setParents] =
    useState<EntitySummary[]>([]);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    metadataApi
      .listCategoryParentOptions(
        record?.id
      )
      .then(setParents)
      .catch((reason) =>
        setError(
          reason as LiveApiError
        )
      );
  }, [record?.id]);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSaving(true);

    const form =
      new FormData(
        event.currentTarget
      );

    const input = {
      name: String(
        form.get("name")
      ),
      slug: String(
        form.get("slug")
      ),
      description: String(
        form.get("description") ||
          ""
      ),
      parentId:
        String(
          form.get("parent_id") ||
            ""
        ) || null,
      status: String(
        form.get("status")
      ),
      sortOrder: Number(
        form.get("sort_order") ||
          0
      ),
      expectedUpdatedAt:
        record?.updatedAt ??
        undefined,
    };

    try {
      const saved = record
        ? await metadataApi.updateCategory(
            record.id,
            input
          )
        : await metadataApi.createCategory(
            input
          );

      router.push(
        `/admin/catalogue/categories/${saved.id}`
      );
    } catch (reason) {
      const problem =
        reason as LiveApiError;

      setError(problem);

      if (
        problem.status === 409 &&
        record
      ) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
    >
      <FormHeader
        icon={
          <FolderTree
            size={16}
          />
        }
        title={
          record
            ? "Category Definition"
            : "New Category Definition"
        }
        description="Configure the authoritative tenant-owned Catalogue taxonomy record."
      />

      <div className="p-5">
        {error && (
          <div className="mb-4">
            <CatalogueError
              error={error}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Category Name"
            required
            description="Human-readable operational category name."
          >
            <input
              name="name"
              required
              maxLength={255}
              defaultValue={
                record?.name
              }
              className={
                fieldClass
              }
              placeholder="e.g. Skin Care"
            />
          </FormField>

          <FormField
            label="Slug"
            required
            description="Lowercase URL-safe taxonomy identifier."
          >
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={
                record?.slug
              }
              className={`${fieldClass} font-mono`}
              placeholder="e.g. skin-care"
            />
          </FormField>

          <FormField
            label="Parent Category"
            description="Leave as Root when this category has no parent."
          >
            <select
              name="parent_id"
              defaultValue={
                record?.parent
                  ?.id ?? ""
              }
              className={
                fieldClass
              }
            >
              <option value="">
                Root
              </option>

              {parents.map(
                (parent) => (
                  <option
                    key={
                      parent.id
                    }
                    value={
                      parent.id
                    }
                  >
                    {
                      parent.name
                    }
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField
            label="Status"
            required
            description="Controls operational availability."
          >
            <select
              name="status"
              defaultValue={
                record?.status ??
                "active"
              }
              className={
                fieldClass
              }
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </FormField>

          <FormField
            label="Sort Order"
            description="Controls sibling ordering within the taxonomy."
          >
            <input
              name="sort_order"
              type="number"
              min="0"
              defaultValue={
                record?.sortOrder ??
                0
              }
              className={
                fieldClass
              }
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label="Description"
              description="Optional operational description for administrators."
            >
              <textarea
                name="description"
                defaultValue={
                  record?.description ??
                  ""
                }
                rows={4}
                className={`${fieldClass} py-2 resize-y`}
                placeholder="Describe the category and its intended product coverage."
              />
            </FormField>
          </div>
        </div>

        <FormActions
          saving={saving}
          label="Save Category"
        />
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* ATTRIBUTE FORM                                                             */
/* -------------------------------------------------------------------------- */

export function AttributeForm({
  record,
}: {
  record?: AttributeAdminDetail;
}) {
  const router = useRouter();

  const [groups, setGroups] =
    useState<EntitySummary[]>([]);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    metadataApi
      .listGroups()
      .then(setGroups)
      .catch((reason) =>
        setError(
          reason as LiveApiError
        )
      );
  }, []);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSaving(true);

    const form =
      new FormData(
        event.currentTarget
      );

    const input = {
      name: String(
        form.get("name")
      ),
      slug: String(
        form.get("slug")
      ),
      groupId:
        String(
          form.get("group_id") ||
            ""
        ) || null,
      dataType:
        attributeDataType(
          form.get("data_type")
        ),
      unit:
        String(
          form.get("unit") ||
            ""
        ) || null,
      isRequired:
        form.get(
          "is_required"
        ) === "on",
      isFilterable:
        form.get(
          "is_filterable"
        ) === "on",
      isVariantDefining:
        form.get(
          "is_variant_defining"
        ) === "on",
      status: String(
        form.get("status")
      ),
      sortOrder: Number(
        form.get("sort_order") ||
          0
      ),
      expectedUpdatedAt:
        record?.updatedAt ??
        undefined,
    };

    try {
      const saved = record
        ? await metadataApi.updateAttribute(
            record.id,
            input
          )
        : await metadataApi.createAttribute(
            input
          );

      router.push(
        `/admin/catalogue/attributes/${saved.id}`
      );
    } catch (reason) {
      const problem =
        reason as LiveApiError;

      setError(problem);

      if (
        problem.status === 409 &&
        record
      ) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
    >
      <FormHeader
        icon={
          <SlidersHorizontal
            size={16}
          />
        }
        title={
          record
            ? "Attribute Definition"
            : "New Attribute Definition"
        }
        description="Configure the canonical Product Attribute definition used by Catalogue products and Categories."
      />

      <div className="p-5">
        {error && (
          <div className="mb-4">
            <CatalogueError
              error={error}
            />
          </div>
        )}

        {/* CORE DEFINITION */}
        <FormSection
          title="Core Definition"
          description="Identity, data type and operational grouping."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField
              label="Name"
              required
              description="Administrator-facing Attribute name."
            >
              <input
                name="name"
                required
                maxLength={255}
                defaultValue={
                  record?.name
                }
                className={
                  fieldClass
                }
                placeholder="e.g. Skin Type"
              />
            </FormField>

            <FormField
              label="Slug"
              required
              description="Stable lowercase identifier."
            >
              <input
                name="slug"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                defaultValue={
                  record?.slug
                }
                className={`${fieldClass} font-mono`}
                placeholder="e.g. skin-type"
              />
            </FormField>

            <FormField
              label="Group"
              description="Optional Attribute grouping."
            >
              <select
                name="group_id"
                defaultValue={
                  record?.group
                    ?.id ?? ""
                }
                className={
                  fieldClass
                }
              >
                <option value="">
                  No group
                </option>

                {groups.map(
                  (group) => (
                    <option
                      key={
                        group.id
                      }
                      value={
                        group.id
                      }
                    >
                      {
                        group.name
                      }
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField
              label="Data Type"
              required
              description="Persisted value type."
            >
              <select
                name="data_type"
                defaultValue={
                  record?.dataType ??
                  "text"
                }
                className={
                  fieldClass
                }
              >
                {PRODUCT_ATTRIBUTE_DATA_TYPES.map(
                  (type) => (
                    <option
                      key={
                        type
                      }
                      value={
                        type
                      }
                    >
                      {
                        type
                      }
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField
              label="Unit"
              description="Optional unit such as ml, kg, cm or %."
            >
              <input
                name="unit"
                maxLength={50}
                defaultValue={
                  record?.unit ??
                  ""
                }
                className={
                  fieldClass
                }
                placeholder="Optional"
              />
            </FormField>

            <FormField
              label="Sort Order"
              description="Controls administrative ordering."
            >
              <input
                name="sort_order"
                type="number"
                min="0"
                defaultValue={
                  record?.sortOrder ??
                  0
                }
                className={
                  fieldClass
                }
              />
            </FormField>
          </div>
        </FormSection>

        {/* ATTRIBUTE BEHAVIOUR */}
        <FormSection
          title="Attribute Behaviour"
          description="Controls validation, filtering and Product Variant behaviour."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ToggleField
              name="is_required"
              title="Required"
              description="Products using this Attribute must provide a value."
              defaultChecked={
                record?.isRequired ??
                false
              }
            />

            <ToggleField
              name="is_filterable"
              title="Filterable"
              description="Attribute can participate in Catalogue filtering."
              defaultChecked={
                record?.isFilterable ??
                false
              }
            />

            <ToggleField
              name="is_variant_defining"
              title="Variant Defining"
              description="Attribute can differentiate Product Variants."
              defaultChecked={
                record?.isVariantDefining ??
                false
              }
            />
          </div>
        </FormSection>

        {/* OPERATIONAL STATE */}
        <FormSection
          title="Operational State"
          description="Controls whether this Attribute is available for Catalogue operations."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Status"
              required
            >
              <select
                name="status"
                defaultValue={
                  record?.status ??
                  "active"
                }
                className={
                  fieldClass
                }
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </FormField>

            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-2">
                <Info
                  size={14}
                  className="mt-0.5 shrink-0 text-[#741d35]"
                />

                <div>
                  <p className="text-[10.5px] font-bold text-gray-800">
                    Persisted Attribute Types
                  </p>

                  <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
                    Supported values are text,
                    number, boolean, date and
                    JSON. Variant behaviour
                    remains governed by the
                    current Catalogue backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <FormActions
          saving={saving}
          label="Save Attribute"
        />
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED PRESENTATION                                                        */
/* -------------------------------------------------------------------------- */

function FormHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#741d35]/15 bg-[#741d35]/5 text-[#741d35]">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-0.5 text-[10.5px] text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5 last:mb-0">
      <div className="mb-3">
        <h3 className="text-[11.5px] font-bold text-gray-900">
          {title}
        </h3>

        {description && (
          <p className="mt-0.5 text-[10px] text-gray-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function FormField({
  label,
  description,
  required = false,
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
        {label}

        {required && (
          <span className="ml-0.5 text-rose-600">
            *
          </span>
        )}
      </span>

      {children}

      {description && (
        <span className="mt-1.5 block text-[9.5px] leading-relaxed text-gray-400">
          {description}
        </span>
      )}
    </label>
  );
}

function ToggleField({
  name,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded border border-gray-200 bg-white p-4 transition-colors hover:border-[#741d35]/30 hover:bg-gray-50/50">
      <input
        name={name}
        type="checkbox"
        defaultChecked={
          defaultChecked
        }
        className="mt-0.5 h-4 w-4 accent-[#741d35]"
      />

      <div>
        <div className="flex items-center gap-1.5">
          <CheckSquare
            size={12}
            className="text-[#741d35]"
          />

          <span className="text-[10.5px] font-bold text-gray-900">
            {title}
          </span>
        </div>

        <p className="mt-1 text-[9.5px] leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
    </label>
  );
}

function FormActions({
  saving,
  label,
}: {
  saving: boolean;
  label: string;
}) {
  return (
    <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
      <button
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-[#741d35] px-4 text-[11px] font-bold text-white transition-colors hover:bg-[#5c172a] disabled:opacity-50"
        type="submit"
        disabled={saving}
      >
        <Save size={13} />

        {saving
          ? "Saving..."
          : label}
      </button>
    </div>
  );
}