"use client";

import {
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Globe2,
  Image as ImageIcon,
  Save,
  Tags,
  Upload,
} from "lucide-react";

import { brandApi } from "../api/catalogueApi";

import type { BrandAdminDetail } from "../contracts/catalogueContracts";

import {
  CatalogueError,
  type LiveApiError,
} from "./LiveCatalogueState";

const fieldClass =
  "w-full min-h-10 rounded border border-gray-300 bg-white px-3 text-[11.5px] text-gray-800 outline-none transition-colors focus:border-[#741d35] focus:ring-2 focus:ring-[#741d35]/10";

export function BrandForm({
  record,
}: {
  record?: BrandAdminDetail;
}) {
  const router = useRouter();

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [saving, setSaving] =
    useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);

    const form = new FormData(
      event.currentTarget
    );

    const input = {
      name: String(form.get("name")),
      slug: String(form.get("slug")),
      description:
        String(
          form.get("description") || ""
        ) || null,
      websiteUrl:
        String(
          form.get("website_url") || ""
        ) || null,
      countryId:
        String(
          form.get("country_id") || ""
        ) || null,
      status: String(
        form.get("status")
      ),
      expectedUpdatedAt:
        record?.updatedAt ??
        undefined,
    };

    try {
      const saved = record
        ? await brandApi.update(
            record.id,
            input
          )
        : await brandApi.create(input);

      router.push(
        `/admin/catalogue/brands/${saved.id}`
      );
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
    >
      <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#741d35]/15 bg-[#741d35]/5 text-[#741d35]">
          <Tags size={15} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900">
            {record
              ? "Brand Definition"
              : "New Brand Definition"}
          </h2>

          <p className="mt-0.5 text-[10.5px] text-gray-500">
            Configure the tenant-owned operational Brand record.
          </p>
        </div>
      </div>

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
            label="Brand Name"
            required
          >
            <input
              name="name"
              required
              maxLength={255}
              defaultValue={record?.name}
              className={fieldClass}
              placeholder="e.g. Techromz Beauty"
            />
          </FormField>

          <FormField
            label="Slug"
            required
          >
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={record?.slug}
              className={`${fieldClass} font-mono`}
              placeholder="e.g. techromz-beauty"
            />
          </FormField>

          <FormField
            label="Website"
          >
            <div className="relative">
              <Globe2
                size={14}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                name="website_url"
                type="url"
                defaultValue={
                  record?.websiteUrl ?? ""
                }
                className={`${fieldClass} pl-9`}
                placeholder="https://example.com"
              />
            </div>
          </FormField>

          <FormField
            label="Country ID"
          >
            <input
              name="country_id"
              type="number"
              min="1"
              defaultValue={
                record?.countryId ?? ""
              }
              className={fieldClass}
              placeholder="Optional country reference"
            />
          </FormField>

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
              className={fieldClass}
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label="Description"
            >
              <textarea
                name="description"
                maxLength={5000}
                rows={4}
                defaultValue={
                  record?.description ?? ""
                }
                className={`${fieldClass} py-2 resize-y`}
                placeholder="Describe the Brand and its operational context."
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 items-center gap-1.5 rounded bg-[#741d35] px-4 text-[11px] font-bold text-white hover:bg-[#5c172a] disabled:opacity-50"
          >
            <Save size={13} />

            {saving
              ? "Saving..."
              : "Save Brand"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function BrandMediaForm({
  brand,
  onSaved,
}: {
  brand: BrandAdminDetail;
  onSaved: () => void;
}) {
  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [working, setWorking] =
    useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const file = form.get("file");

    if (
      !(file instanceof File) ||
      !file.size
    ) {
      return;
    }

    setWorking(true);
    setError(null);

    try {
      const uploadId =
        await brandApi.uploadImage(
          file
        );

      await brandApi.attachMedia(
        brand.id,
        {
          uploadId,
          role: String(
            form.get("role")
          ) as "logo" | "banner",
          altText: String(
            form.get(
              "alt_text"
            ) || ""
          ),
        }
      );

      event.currentTarget.reset();
      onSaved();
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
    >
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded border border-[#741d35]/15 bg-[#741d35]/5 text-[#741d35]">
          <ImageIcon size={15} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900">
            Attach Brand Media
          </h2>

          <p className="mt-0.5 text-[10.5px] text-gray-500">
            Upload an image and associate its authoritative Upload record with this Brand.
          </p>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4">
            <CatalogueError
              error={error}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            label="Image File"
            required
          >
            <input
              name="file"
              type="file"
              accept="image/*"
              required
              className="block w-full rounded border border-gray-300 bg-white p-2 text-[10.5px] text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-[10px] file:font-semibold"
            />
          </FormField>

          <FormField
            label="Media Role"
            required
          >
            <select
              name="role"
              className={fieldClass}
            >
              <option value="logo">
                Logo
              </option>

              <option value="banner">
                Banner
              </option>
            </select>
          </FormField>

          <FormField
            label="Alternative Text"
          >
            <input
              name="alt_text"
              maxLength={255}
              className={fieldClass}
              placeholder="Accessible image description"
            />
          </FormField>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={working}
            className="inline-flex h-9 items-center gap-1.5 rounded bg-[#741d35] px-4 text-[11px] font-bold text-white hover:bg-[#5c172a] disabled:opacity-50"
          >
            <Upload size={13} />

            {working
              ? "Uploading..."
              : "Upload and Attach"}
          </button>
        </div>
      </div>
    </form>
  );
}

function FormField({
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
      <span className="block mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
        {label}

        {required && (
          <span className="ml-0.5 text-rose-600">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}