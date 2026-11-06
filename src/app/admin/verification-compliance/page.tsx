"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  FileCheck2,
  FileText,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";
import {
  type ComplianceAuditListResponse,
  type ComplianceReportsOverview,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type BrandAuthorizationSummary = {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  suspended: number;
  expired: number;
  expiring_30_days: number;
};

type SupplierOverview = {
  total: number;
};

const EMPTY_BRAND_AUTHORIZATION_SUMMARY: BrandAuthorizationSummary = {
  total: 0,
  draft: 0,
  submitted: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
  expired: 0,
  expiring_30_days: 0,
};

const EMPTY_AUDIT: ComplianceAuditListResponse = {
  data: [],
  summary: {
    total: 0,
    last_24_hours: 0,
    last_30_days: 0,
    cases_with_activity: 0,
  },
  capabilities: {
    read: false,
    export: false,
  },
  current_page: 1,
  per_page: 5,
  total: 0,
  last_page: 1,
};

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

function humanize(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function VerificationComplianceCommandCenter() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canAccessCompliance =
    hasPermission(
      VERIFICATION_COMPLIANCE_PERMISSIONS
        .view,
    );

  const canViewReports =
    hasPermission(
      VERIFICATION_COMPLIANCE_PERMISSIONS
        .reports.view,
    );

  const canViewAudit =
    hasPermission(
      VERIFICATION_COMPLIANCE_PERMISSIONS
        .audit.view,
    );

  /*
   * Supplier and Brand Authorization
   * information remains owned by the
   * Brands & Suppliers domain.
   */
  const canViewSuppliers =
    hasPermission(
      BRANDS_SUPPLIERS_PERMISSIONS.view,
    );

  const [loading, setLoading] =
    useState(canAccessCompliance);

  const [error, setError] =
    useState<string | null>(null);

  const [overview, setOverview] =
    useState<ComplianceReportsOverview | null>(
      null,
    );

  const [
    supplierOverview,
    setSupplierOverview,
  ] = useState<SupplierOverview>({
    total: 0,
  });

  const [
    brandAuthorizations,
    setBrandAuthorizations,
  ] =
    useState<BrandAuthorizationSummary>(
      EMPTY_BRAND_AUTHORIZATION_SUMMARY,
    );

  const [audit, setAudit] =
    useState<ComplianceAuditListResponse>(
      EMPTY_AUDIT,
    );

  const fetchDashboard =
    useCallback(async () => {
      if (!canAccessCompliance) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const compliancePromise =
          canViewReports
            ? verificationComplianceApi.getReportsOverview()
            : Promise.resolve(null);

        const supplierPromise =
          canViewSuppliers
            ? brandsSuppliersApi.getSuppliersDashboard(
                {
                  page: 1,
                  per_page: 1,
                },
              )
            : Promise.resolve(null);

        const authorizationPromise =
          canViewSuppliers
            ? brandsSuppliersApi.getBrandAuthorizations(
                {
                  page: 1,
                  per_page: 1,
                },
              )
            : Promise.resolve(null);

        const auditPromise =
          canViewAudit
            ? verificationComplianceApi.getComplianceAudit(
                {
                  page: 1,
                  per_page: 5,
                },
              )
            : Promise.resolve(null);

        const [
          complianceResult,
          supplierResult,
          authorizationResult,
          auditResult,
        ] = await Promise.allSettled([
          compliancePromise,
          supplierPromise,
          authorizationPromise,
          auditPromise,
        ]);

        if (
          complianceResult.status ===
          "fulfilled"
        ) {
          if (
            complianceResult.value
          ) {
            setOverview(
              complianceResult.value,
            );
          } else {
            setOverview(null);
          }
        } else if (canViewReports) {
          throw complianceResult.reason;
        }

        if (
          supplierResult.status ===
            "fulfilled" &&
          supplierResult.value
        ) {
          setSupplierOverview({
            total: Number(
              supplierResult.value.suppliers
                ?.meta?.total ?? 0,
            ),
          });
        }

        if (
          authorizationResult.status ===
            "fulfilled" &&
          authorizationResult.value
        ) {
          setBrandAuthorizations(
            authorizationResult.value
              .summary,
          );
        }

        if (
          auditResult.status ===
            "fulfilled" &&
          auditResult.value
        ) {
          setAudit(
            auditResult.value,
          );
        } else if (!canViewAudit) {
          setAudit(
            EMPTY_AUDIT,
          );
        }
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load Verification & Compliance command center:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load Verification & Compliance command center.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canAccessCompliance,
      canViewAudit,
      canViewReports,
      canViewSuppliers,
    ]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const attentionCount =
    useMemo(() => {
      if (!overview) {
        return 0;
      }

      return (
        overview.cases.open +
        overview.documents
          .pending_verification +
        overview.product_safety
          .pending_review +
        overview.recalls
          .recalled_batches +
        overview.recalls
          .quarantined_batches +
        overview.governance
          .critical_severity
      );
    }, [overview]);

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
      label: "Data Authority",
      value: "Live backend",
    },
  ];

  const navigationCards = [
    {
      title:
        "Supplier Verification",

      description:
        "Review supplier verification state and perform permitted verification decisions.",

      href:
        "/admin/verification-compliance/supplier-verification",

      icon: Building2,

      primary:
        canViewSuppliers
          ? supplierOverview.total
          : null,

      primaryLabel:
        "Total suppliers",

      note:
        canViewSuppliers
          ? "Verification-status totals are not exposed by the current summary API."
          : "Supplier view permission required.",
    },

    {
      title:
        "Brand Authorizations",

      description:
        "Inspect submitted, approved, rejected, suspended and expiring brand authorizations.",

      href:
        "/admin/verification-compliance/brand-authorizations",

      icon: ShieldCheck,

      primary:
        canViewSuppliers
          ? brandAuthorizations.total
          : null,

      primaryLabel:
        "Total authorizations",

      note:
        canViewSuppliers
          ? `${brandAuthorizations.submitted} submitted · ${brandAuthorizations.approved} approved`
          : "Supplier view permission required.",
    },

    {
      title:
        "Compliance Cases",

      description:
        "Review tenant-scoped authoritative compliance case files and governed case workflow.",

      href:
        "/admin/verification-compliance/cases",

      icon: Scale,

      primary:
        canViewReports
          ? overview?.cases.total ??
            0
          : null,

      primaryLabel:
        "Total cases",

      note:
        canViewReports
          ? `${
              overview?.cases.open ??
              0
            } open · ${
              overview?.cases
                .resolved ?? 0
            } resolved`
          : "Compliance reporting permission required.",
    },

    {
      title:
        "Documents & Evidence",

      description:
        "Inspect normalized verification, KYC, certificate and authorization evidence.",

      href:
        "/admin/verification-compliance/documents",

      icon: FileCheck2,

      primary:
        canViewReports
          ? overview?.documents
              .total ?? 0
          : null,

      primaryLabel:
        "Evidence records",

      note:
        canViewReports
          ? `${
              overview?.documents
                .pending_verification ??
              0
            } pending verification`
          : "Compliance reporting permission required.",
    },

    {
      title:
        "Product Safety",

      description:
        "Review real Beauty product safety profile state and compliance controls.",

      href:
        "/admin/verification-compliance/product-safety",

      icon: ShieldCheck,

      primary:
        canViewReports
          ? overview?.product_safety
              .total ?? 0
          : null,

      primaryLabel:
        "Safety profiles",

      note:
        canViewReports
          ? `${
              overview
                ?.product_safety
                .pending_review ?? 0
            } pending review`
          : "Compliance reporting permission required.",
    },

    {
      title:
        "Product Authenticity",

      description:
        "Authenticity and counterfeit investigation authority is not yet implemented.",

      href:
        "/admin/verification-compliance/authenticity",

      icon:
        ShieldAlert,

      primary:
        null,

      primaryLabel:
        "Not assessed",

      note:
        "Capability shell only — no counterfeit or authenticity records are fabricated.",
    },

    {
      title:
        "Recalls & Quarantine",

      description:
        "Inspect real inventory batch recall and quarantine flags.",

      href:
        "/admin/verification-compliance/recalls",

      icon:
        AlertTriangle,

      primary:
        canViewReports
          ? (overview?.recalls
              .recalled_batches ??
              0) +
            (overview?.recalls
              .quarantined_batches ??
              0)
          : null,

      primaryLabel:
        "Flagged batches",

      note:
        canViewReports
          ? `${
              overview?.recalls
                .recalled_batches ??
              0
            } recalled · ${
              overview?.recalls
                .quarantined_batches ??
              0
            } quarantined`
          : "Compliance reporting permission required.",
    },

    {
      title:
        "Governance",

      description:
        "Review the platform-global compliance rule registry.",

      href:
        "/admin/verification-compliance/governance",

      icon:
        FileText,

      primary:
        canViewReports
          ? overview?.governance
              .total ?? 0
          : null,

      primaryLabel:
        "Global rules",

      note:
        canViewReports
          ? `${
              overview?.governance
                .active ?? 0
            } active · ${
              overview?.governance
                .critical_severity ??
              0
            } critical`
          : "Compliance reporting permission required.",
    },

    {
      title:
        "Reports",

      description:
        "Read-only operational reporting across supported compliance domains.",

      href:
        "/admin/verification-compliance/reports",

      icon:
        Activity,

      primary:
        canViewReports
          ? attentionCount
          : null,

      primaryLabel:
        "Attention items",

      note:
        canViewReports
          ? "Formal export, scheduling and report history are not yet implemented."
          : "Compliance reporting permission required.",
    },

    {
      title:
        "Import, Export & Audit",

      description:
        "Inspect append-only, tenant-scoped compliance audit history.",

      href:
        "/admin/verification-compliance/import-export-audit",

      icon:
        FileText,

      primary:
        canViewAudit
          ? audit.summary.total
          : null,

      primaryLabel:
        "Audit events",

      note:
        canViewAudit
          ? `${audit.summary.last_24_hours} events in last 24 hours`
          : "Compliance audit permission required.",
    },
  ];

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS
          .view
      }
      fallback={
        <div
          role="alert"
          className="p-6"
        >
          Verification &amp; Compliance
          access permission is required to
          open the Command Center.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Verification &amp;
                Compliance / Command Center
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Verification &amp;
                Compliance Command Center
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Central operational view of
                the authoritative
                verification and compliance
                capabilities currently
                supported by the Retail
                Ecosystem backend.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchDashboard()
              }
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          <div className="mt-4">
            <ContextScopeBar
              items={contextItems}
              lastSynced={
                overview
                  ? formatDate(
                      overview.generated_at,
                    )
                  : "Not yet loaded"
              }
              accessNote="Tenant-owned records are resolved through trusted tenant context. Global governance rules are explicitly identified separately."
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
            >
              <div className="flex items-center justify-between gap-4">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() =>
                    void fetchDashboard()
                  }
                  className="font-bold underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!canViewReports && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Compliance reporting
              permission is not available.
              Operational reporting totals
              are therefore hidden.
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 my-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold">
                Compliance Cases
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : canViewReports
                    ? overview?.cases
                        .total ?? 0
                    : "—"}
              </strong>

              <small className="text-gray-500">
                {canViewReports
                  ? `${
                      overview?.cases
                        .open ?? 0
                    } open`
                  : "Reporting access required"}
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold">
                Evidence
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : canViewReports
                    ? overview?.documents
                        .total ?? 0
                    : "—"}
              </strong>

              <small className="text-gray-500">
                {canViewReports
                  ? `${
                      overview?.documents
                        .pending_verification ??
                      0
                    } pending`
                  : "Reporting access required"}
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold">
                Safety Profiles
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : canViewReports
                    ? overview
                        ?.product_safety
                        .total ?? 0
                    : "—"}
              </strong>

              <small className="text-gray-500">
                {canViewReports
                  ? `${
                      overview
                        ?.product_safety
                        .pending_review ??
                      0
                    } pending`
                  : "Reporting access required"}
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold">
                Flagged Batches
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : canViewReports
                    ? (overview?.recalls
                        .recalled_batches ??
                        0) +
                      (overview?.recalls
                        .quarantined_batches ??
                        0)
                    : "—"}
              </strong>

              <small className="text-gray-500">
                {canViewReports
                  ? "Recall / quarantine"
                  : "Reporting access required"}
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold">
                Governance Rules
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : canViewReports
                    ? overview
                        ?.governance
                        .total ?? 0
                    : "—"}
              </strong>

              <small className="text-gray-500">
                {canViewReports
                  ? "Platform global"
                  : "Reporting access required"}
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold">
                Attention Items
              </div>

              <strong className="block text-2xl mt-3 text-[#850019]">
                {loading
                  ? "…"
                  : canViewReports
                    ? attentionCount
                    : "—"}
              </strong>

              <small className="text-gray-500">
                {canViewReports
                  ? "Direct counts, not a risk score"
                  : "Reporting access required"}
              </small>
            </div>
          </section>

          <section className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={17}
                className="mt-0.5 text-blue-700"
              />

              <div>
                <h2 className="text-xs font-bold text-blue-900">
                  Authoritative Capability
                  Boundary
                </h2>

                <p className="mt-1 max-w-5xl text-[11px] leading-relaxed text-blue-800">
                  This Command Center shows
                  only data supported by the
                  current backend and
                  permitted for the current
                  actor. No compliance
                  health score, counterfeit
                  statistics, NMRA
                  approvals, SLA
                  performance, regulatory
                  notices, trend analytics
                  or unsupported audit
                  exports are invented.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {navigationCards.map(
              ({
                title,
                description,
                href,
                icon: Icon,
                primary,
                primaryLabel,
                note,
              }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-md border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
                        <Icon
                          size={16}
                          className="text-[#850019]"
                        />
                      </div>

                      <h2 className="text-[13px] font-bold text-gray-900">
                        {title}
                      </h2>
                    </div>

                    <ArrowUpRight
                      size={14}
                      className="text-gray-300 transition group-hover:text-[#850019]"
                    />
                  </div>

                  <p className="mt-3 min-h-[36px] text-[11px] leading-relaxed text-gray-500">
                    {description}
                  </p>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    {primary !== null ? (
                      <>
                        <strong className="text-xl text-gray-900">
                          {primary.toLocaleString()}
                        </strong>

                        <div className="text-[10px] text-gray-500">
                          {primaryLabel}
                        </div>
                      </>
                    ) : (
                      <strong className="text-xs text-gray-400">
                        {primaryLabel}
                      </strong>
                    )}

                    <div className="mt-2 text-[10px] text-gray-500">
                      {note}
                    </div>
                  </div>
                </Link>
              ),
            )}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 mt-4">
            <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-[13px] font-bold">
                  Recent Compliance Audit
                  Activity
                </h2>

                <p className="mt-1 text-[11px] text-gray-500">
                  Latest append-only audit
                  events available to the
                  current tenant and actor.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Supplier
                      </th>

                      <th className="px-4 py-3">
                        Action
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Occurred
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {!canViewAudit ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-xs text-gray-500"
                        >
                          Compliance audit
                          permission is
                          required to view
                          audit activity.
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-xs text-gray-500"
                        >
                          Loading activity…
                        </td>
                      </tr>
                    ) : audit.data.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-xs text-gray-500"
                        >
                          No compliance audit
                          events are
                          available.
                        </td>
                      </tr>
                    ) : (
                      audit.data.map(
                        (record) => (
                          <tr
                            key={record.id}
                          >
                            <td className="px-4 py-3 text-xs font-semibold">
                              {record.case
                                ? `Case ${record.case.uuid}`
                                : record.subject.id !== null
                                  ? `${humanize(
                                      record.subject.type,
                                    )} #${record.subject.id}`
                                  : humanize(
                                      record.subject.type,
                                    )}
                            </td>

                            <td className="px-4 py-3 text-[11px]">
                              {humanize(
                                record.action,
                              )}
                            </td>

                            <td className="px-4 py-3 text-[11px] text-gray-500">
                              {record.reason
                                ? record.reason
                                : record.before ||
                                    record.after
                                  ? "State change recorded"
                                  : "No change details"}
                            </td>

                            <td className="px-4 py-3 text-[10px] text-gray-500">
                              {formatDate(
                                record.occurred_at,
                              )}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <Link
                  href="/admin/verification-compliance/import-export-audit"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#850019] hover:underline"
                >
                  Open full audit trail

                  <ArrowUpRight
                    size={12}
                  />
                </Link>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-[13px] font-bold">
                Current Operational
                Attention
              </h2>

              <p className="mt-1 text-[11px] text-gray-500">
                Raw operational counts only.
                This is not a calculated
                compliance score.
              </p>

              {canViewReports ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Open cases
                    </span>

                    <strong>
                      {overview?.cases.open ??
                        0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Pending evidence
                    </span>

                    <strong>
                      {overview?.documents
                        .pending_verification ??
                        0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Safety reviews
                    </span>

                    <strong>
                      {overview
                        ?.product_safety
                        .pending_review ??
                        0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Recalled batches
                    </span>

                    <strong>
                      {overview?.recalls
                        .recalled_batches ??
                        0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Quarantined batches
                    </span>

                    <strong>
                      {overview?.recalls
                        .quarantined_batches ??
                        0}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Critical global rules
                    </span>

                    <strong>
                      {overview?.governance
                        .critical_severity ??
                        0}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-xs text-gray-500">
                  Compliance reporting
                  permission is required to
                  view operational totals.
                </div>
              )}
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Command Status">
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={14}
                  className="text-green-700"
                />

                <strong className="text-xs text-green-800">
                  Live Operational Data
                </strong>
              </div>

              <p className="mt-1 text-[10px] text-green-700">
                Supported compliance
                domains are connected to
                authoritative APIs and
                permission-scoped.
              </p>
            </div>
          </RailSection>

          <RailSection title="Priority Counts">
            {canViewReports ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Attention items
                  </span>

                  <strong className="text-[#850019]">
                    {attentionCount}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Pending evidence
                  </span>

                  <strong>
                    {overview?.documents
                      .pending_verification ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Open cases
                  </span>

                  <strong>
                    {overview?.cases.open ??
                      0}
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Reporting permission
                required.
              </p>
            )}
          </RailSection>

          <RailSection title="Capability Gaps">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Authenticity data
                </span>

                <strong className="text-gray-400">
                  Not implemented
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Compliance score
                </span>

                <strong className="text-gray-400">
                  Not scored
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Formal reports
                </span>

                <strong className="text-gray-400">
                  Not implemented
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Compliance import/export
                </span>

                <strong className="text-gray-400">
                  Not implemented
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Audit Activity">
            {canViewAudit ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Last 24 hours
                  </span>

                  <strong>
                    {
                      audit.summary
                        .last_24_hours
                    }
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Last 30 days
                  </span>

                  <strong>
                    {
                      audit.summary
                        .last_30_days
                    }
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Audit permission required.
              </p>
            )}
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}