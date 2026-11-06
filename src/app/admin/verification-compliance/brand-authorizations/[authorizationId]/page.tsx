"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Building2,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  HealthScoreGauge,
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

interface BrandAuthorizationDetail {
  id: number | string;

  supplier_id?: number | string | null;
  brand_id?: number | string | null;

  authorization_type?: string | null;
  territory?: string | null;

  document_path?: string | null;
  evidence_key?: string | null;

  starts_at?: string | null;
  expires_at?: string | null;

  status?: string | null;

  reviewed_by?: number | string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  brand?: {
    id?: number | string;
    name?: string | null;
  } | null;

  supplier?: {
    id?: number | string;
    company_name?: string | null;
    verification_status?: string | null;
    status?: string | null;
  } | null;

  reviewer?: {
    id?: number | string;
    name?: string | null;
  } | null;
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

function statusClasses(status?: string | null) {
  const value = String(
    status ?? "unknown",
  ).toLowerCase();

  if (value === "approved") {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (value === "submitted") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "suspended") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value === "expired") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function SupplierBrandAuthorizationDetailCasePage() {
  const params = useParams();

  const authorizationId =
    typeof params?.authorizationId === "string"
      ? params.authorizationId
      : "";

  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view)
    && hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.view);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [authorization, setAuthorization] =
    useState<BrandAuthorizationDetail | null>(
      null,
    );

  const fetchAuthorization =
    useCallback(async () => {
      if (!canView || !authorizationId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await brandsSuppliersApi.getBrandAuthorization(
            authorizationId,
          );

        setAuthorization(
          response as BrandAuthorizationDetail,
        );
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load brand authorization:",
          requestError,
        );

        setError(
          requestError.message ||
            "Unable to load brand authorization.",
        );
      } finally {
        setLoading(false);
      }
    }, [authorizationId, canView]);

  useEffect(() => {
    void fetchAuthorization();
  }, [fetchAuthorization]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f8]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading brand authorization…
        </div>
      </div>
    );
  }

  if (error || !authorization) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f8] p-6">
        <div className="max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={32}
            className="mx-auto mb-3 text-amber-500"
          />

          <h2 className="text-lg font-bold text-gray-900">
            Authorization Not Found
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            No brand authorization matched reference{" "}
            <span className="font-mono">
              {authorizationId}
            </span>
            .
          </p>

          {error && (
            <p className="mt-3 text-xs text-rose-600">
              {error}
            </p>
          )}

          <Link
            href="/admin/verification-compliance/brand-authorizations"
            className="mt-4 inline-block rounded bg-[#7a0023] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a0002b]"
          >
            Return to Brand Authorizations
          </Link>
        </div>
      </div>
    );
  }

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
      label: "Authorization",
      value: String(authorization.id),
    },
  ];

  const status =
    authorization.status ?? "unknown";

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS.view
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
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/verification-compliance/brand-authorizations"
                className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50"
                aria-label="Back to brand authorizations"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Verification &amp; Compliance /
                  Brand Authorizations /{" "}
                  {authorizationId}
                </div>

                <h1 className="text-xl font-bold text-gray-900">
                  Brand Authorization Case Review
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchAuthorization()
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced="On request"
            accessNote="Authorization access is resolved from the authenticated tenant context"
          />

          {/* STATUS */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                  <Award size={24} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {authorization.brand?.name ??
                        "Brand not exposed"}
                    </h2>

                    <span
                      className={`border px-2 py-0.5 rounded text-[10px] font-bold capitalize ${statusClasses(
                        status,
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Authorization ID:{" "}
                    {authorization.id}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CORE AUTHORIZATION DATA */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Authorization Scope
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Current authoritative
                supplier-to-brand authorization
                details for this tenant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Authorization Type
                </div>
                <div className="font-bold text-gray-900 mt-1">
                  {authorization.authorization_type ??
                    "—"}
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Territory
                </div>
                <div className="font-bold text-gray-900 mt-1">
                  {authorization.territory ??
                    "—"}
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Start Date
                </div>
                <div className="font-bold text-gray-900 mt-1">
                  {formatDate(
                    authorization.starts_at,
                  )}
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Expiry Date
                </div>
                <div className="font-bold text-gray-900 mt-1">
                  {formatDate(
                    authorization.expires_at,
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SUPPLIER */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Building2
                size={18}
                className="text-gray-400"
              />

              <h2 className="text-sm font-bold text-gray-900">
                Supplier
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-gray-400">
                  Company
                </div>
                <strong>
                  {authorization.supplier
                    ?.company_name ?? "—"}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Verification Status
                </div>
                <strong className="capitalize">
                  {authorization.supplier
                    ?.verification_status ?? "—"}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Supplier Status
                </div>
                <strong className="capitalize">
                  {authorization.supplier
                    ?.status ?? "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* EVIDENCE */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText
                size={18}
                className="text-gray-400"
              />

              <h2 className="text-sm font-bold text-gray-900">
                Authorization Evidence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Document
                </div>

                <div
                  className={`font-bold mt-1 ${
                    authorization.document_path
                      ? "text-green-700"
                      : "text-gray-400"
                  }`}
                >
                  {authorization.document_path
                    ? "Present"
                    : "Not provided"}
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Evidence Reference
                </div>

                <div className="font-bold text-gray-900 mt-1 break-all">
                  {authorization.evidence_key ??
                    "—"}
                </div>
              </div>
            </div>
          </section>

          {/* REVIEW */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Review Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-gray-400">
                  Reviewer
                </div>
                <strong>
                  {authorization.reviewer?.name ??
                    "—"}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Reviewed At
                </div>
                <strong>
                  {formatDate(
                    authorization.reviewed_at,
                  )}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Review Status
                </div>
                <strong className="capitalize">
                  {status}
                </strong>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-400">
                Review Notes
              </div>

              <div className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                {authorization.review_notes ||
                  "No review notes are currently available."}
              </div>
            </div>
          </section>
        </main>

        {/* RIGHT RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Authorization Status">
            <HealthScoreGauge
              score={0}
              label="Authorization"
              statusText={
                status === "approved"
                  ? "Approved"
                  : status === "submitted"
                    ? "Submitted"
                    : status === "rejected"
                      ? "Rejected"
                      : status === "suspended"
                        ? "Suspended"
                        : status === "expired"
                          ? "Expired"
                          : "Draft"
              }
              statusColor={
                status === "approved"
                  ? "#16a34a"
                  : status === "rejected"
                    ? "#dc2626"
                    : status === "submitted"
                      ? "#0284c7"
                      : "#6b7280"
              }
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Evidence">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>
                  Authorization Document
                </span>

                <strong
                  className={
                    authorization.document_path
                      ? "text-green-700"
                      : "text-gray-400"
                  }
                >
                  {authorization.document_path
                    ? "Present"
                    : "Unavailable"}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>
                  Evidence Key
                </span>

                <strong>
                  {authorization.evidence_key
                    ? "Present"
                    : "Unavailable"}
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Review Authority">
            <div className="rounded border border-gray-100 bg-gray-50 p-2.5 text-xs text-gray-500">
              This Admin detail view is
              currently read-only. Approval,
              rejection, suspension and expiry
              mutations will be enabled only
              after the authoritative Admin
              review workflow is verified.
            </div>
          </RailSection>

          <RailSection title="Governance">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Tenant Isolation</span>
                <strong className="text-green-700">
                  Enforced
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Policy Authorization</span>
                <strong className="text-green-700">
                  Enforced
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Authenticity Score</span>
                <strong className="text-gray-400">
                  Not Assessed
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}
