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
  BadgeCheck,
  Globe2,
  Image as ImageIcon,
  Images,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import {
  EmptyState,
  LoadingSkeleton,
} from "@/components/admin/common/States";

import {
  CatalogueError,
  displayValue,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

import { BrandMediaForm } from "@/features/admin/catalogue/components/BrandForms";

import { brandApi } from "@/features/admin/catalogue/api/catalogueApi";

import type { BrandAdminDetail } from "@/features/admin/catalogue/contracts/catalogueContracts";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function BrandDetailPage() {
  const { brandId } =
    useParams<{
      brandId: string;
    }>();

  const [brand, setBrand] =
    useState<BrandAdminDetail | null>(
      null
    );

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [workingMediaId, setWorkingMediaId] =
    useState<string | null>(null);

  const load = async () => {
    try {
      const value =
        await brandApi.get(brandId);

      setBrand(value);
      setError(null);
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    }
  };

  useEffect(() => {
    let active = true;

    brandApi
      .get(brandId)
      .then((value) => {
        if (active) {
          setBrand(value);
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
  }, [brandId]);

  const logoCount = useMemo(
    () =>
      brand?.media.filter(
        (media) =>
          media.role === "logo"
      ).length ?? 0,
    [brand]
  );

  const bannerCount = useMemo(
    () =>
      brand?.media.filter(
        (media) =>
          media.role === "banner"
      ).length ?? 0,
    [brand]
  );

  async function detachMedia(
    mediaId: string
  ) {
    if (!brand) {
      return;
    }

    setWorkingMediaId(mediaId);
    setError(null);

    try {
      await brandApi.detachMedia(
        brand.id,
        mediaId
      );

      await load();
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    } finally {
      setWorkingMediaId(null);
    }
  }

  if (error && !brand) {
    return (
      <CatalogueError
        error={error}
        notFound="Brand not found"
      />
    );
  }

  if (!brand) {
    return <LoadingSkeleton />;
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
              <span className="mx-2 text-gray-300">
                /
              </span>
              <span className="text-gray-800">
                {brand.id}
              </span>
            </div>

            <Link
              href="/admin/catalogue/brands"
              className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-gray-600 hover:text-[#741d35]"
            >
              <ArrowLeft size={13} />
              Back to Brand & Media Management
            </Link>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                {brand.name}
              </h1>

              <StatusBadge
                status={brand.status}
              />

              {brand.isVerified && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] font-mono text-gray-500">
              {brand.slug}
            </p>
          </div>

          <PermissionGuard
            permission={
              CATALOGUE_PERMISSIONS.brandsManage
            }
          >
            <Link
              href={`/admin/catalogue/brands/${brand.id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a]"
            >
              <Pencil size={13} />
              Edit Brand
            </Link>
          </PermissionGuard>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <BrandMetric
            icon={
              <ShieldCheck
                size={16}
              />
            }
            label="Verification"
            value={
              brand.isVerified
                ? "Verified"
                : "Not verified"
            }
            note="Current authoritative state"
          />

          <BrandMetric
            icon={
              <Images size={16} />
            }
            label="Media Links"
            value={
              brand.mediaCount
            }
            note="Upload-backed associations"
          />

          <BrandMetric
            icon={
              <ImageIcon
                size={16}
              />
            }
            label="Logos"
            value={logoCount}
            note="Current Brand media"
          />

          <BrandMetric
            icon={
              <ImageIcon
                size={16}
              />
            }
            label="Banners"
            value={bannerCount}
            note="Current Brand media"
          />
        </div>

        {error && (
          <CatalogueError
            error={error}
          />
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
          <div className="flex flex-col gap-4">
            {/* BRAND DEFINITION */}
            <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">
                  Brand Definition
                </h2>

                <p className="mt-0.5 text-[10.5px] text-gray-500">
                  Tenant-owned operational Brand information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <DetailFact
                  label="Brand Name"
                  value={brand.name}
                />

                <DetailFact
                  label="Slug"
                  value={brand.slug}
                  mono
                />

                <DetailFact
                  label="Status"
                  value={brand.status}
                />

                <DetailFact
                  label="Verification"
                  value={
                    brand.isVerified
                      ? "Verified"
                      : "Not verified"
                  }
                />

                <DetailFact
                  label="Country ID"
                  value={displayValue(
                    brand.countryId
                  )}
                />

                <DetailFact
                  label="Last Updated"
                  value={formatDate(
                    brand.updatedAt
                  )}
                />
              </div>

              <div className="border-t border-gray-100 p-4">
                <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
                  Description
                </span>

                <p className="mt-2 text-[11.5px] leading-relaxed text-gray-700">
                  {displayValue(
                    brand.description,
                    "No description"
                  )}
                </p>
              </div>

              {brand.websiteUrl && (
                <div className="border-t border-gray-100 p-4">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
                    Website
                  </span>

                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#741d35] hover:underline"
                  >
                    <Globe2 size={12} />
                    {brand.websiteUrl}
                  </a>
                </div>
              )}
            </section>

            {/* MEDIA WORKSPACE */}
            <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Brand Media
                  </h2>

                  <p className="mt-0.5 text-[10.5px] text-gray-500">
                    Logo and banner associations backed by authoritative Upload records.
                  </p>
                </div>

                <span className="min-w-7 h-7 px-2 inline-flex items-center justify-center rounded-full bg-gray-100 text-[10.5px] font-bold text-gray-700">
                  {brand.media.length}
                </span>
              </div>

              {brand.media.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {brand.media.map(
                    (media) => (
                      <article
                        key={media.id}
                        className="border border-gray-200 rounded overflow-hidden bg-white"
                      >
                        <div className="aspect-[16/7] bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden">
                          {media.upload
                            ?.url ? (
                            <img
                              src={
                                media.upload
                                  .url
                              }
                              alt={
                                media.altText ??
                                media.upload
                                  .name
                              }
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <ImageIcon
                              size={28}
                              className="text-gray-300"
                            />
                          )}
                        </div>

                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="inline-flex rounded bg-[#741d35]/5 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#741d35]">
                                {media.role}
                              </span>

                              <p className="mt-2 text-[11.5px] font-bold text-gray-900">
                                {media.altText ||
                                  media.upload
                                    ?.name ||
                                  "Brand media"}
                              </p>

                              <p className="mt-1 text-[9.5px] text-gray-400">
                                Upload ID{" "}
                                {
                                  media.uploadId
                                }
                              </p>
                            </div>

                            <StatusBadge
                              status={
                                media.status
                              }
                            />
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                            <span className="text-[9.5px] text-gray-400">
                              Updated{" "}
                              {formatDate(
                                media.updatedAt
                              )}
                            </span>

                            <PermissionGuard
                              permission={
                                CATALOGUE_PERMISSIONS.mediaManage
                              }
                            >
                              <button
                                type="button"
                                disabled={
                                  workingMediaId ===
                                  media.id
                                }
                                onClick={() =>
                                  detachMedia(
                                    media.id
                                  )
                                }
                                className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-rose-300 bg-white text-[10.5px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                              >
                                <Trash2 size={12} />

                                {workingMediaId ===
                                media.id
                                  ? "Detaching..."
                                  : "Detach"}
                              </button>
                            </PermissionGuard>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState title="No Brand media" />
                </div>
              )}
            </section>

            {/* ATTACH MEDIA */}
            <PermissionGuard
              permission={
                CATALOGUE_PERMISSIONS.mediaManage
              }
            >
              <BrandMediaForm
                brand={brand}
                onSaved={() => {
                  void load();
                }}
              />
            </PermissionGuard>
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
                    Media Governance
                  </h2>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <SummaryRow
                  label="Media Count"
                  value={String(
                    brand.mediaCount
                  )}
                />

                <SummaryRow
                  label="Logos"
                  value={String(
                    logoCount
                  )}
                />

                <SummaryRow
                  label="Banners"
                  value={String(
                    bannerCount
                  )}
                />

                <SummaryRow
                  label="Storage Model"
                  value="Upload-backed"
                />
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    size={14}
                    className="text-[#741d35]"
                  />

                  <h2 className="text-sm font-bold text-gray-900">
                    Brand State
                  </h2>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <SummaryRow
                  label="Operational Status"
                  value={brand.status}
                />

                <SummaryRow
                  label="Verified"
                  value={
                    brand.isVerified
                      ? "Yes"
                      : "No"
                  }
                />

                <SummaryRow
                  label="Country ID"
                  value={displayValue(
                    brand.countryId
                  )}
                />

                <SummaryRow
                  label="Updated"
                  value={formatDate(
                    brand.updatedAt
                  )}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PermissionGuard>
  );
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