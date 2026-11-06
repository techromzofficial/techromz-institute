"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import {
  type ComplianceReportsOverview,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type DomainRow = {
  label: string;
  primary: number;
  primaryLabel: string;
  secondary: number;
  secondaryLabel: string;
  status: "available" | "limited";
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

export default function ComplianceReportsPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    VERIFICATION_COMPLIANCE_PERMISSIONS
      .reports.view,
  );

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [overview, setOverview] =
    useState<ComplianceReportsOverview | null>(
      null,
    );

  const fetchOverview =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await verificationComplianceApi.getReportsOverview();

        setOverview(response);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load compliance reports overview:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load compliance reporting overview.",
        );

        setOverview(null);
      } finally {
        setLoading(false);
      }
    }, [canView]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const domainRows =
    useMemo<DomainRow[]>(() => {
      if (!overview) {
        return [];
      }

      return [
        {
          label: "Compliance Cases",
          primary:
            overview.cases.total,
          primaryLabel:
            "Total cases",
          secondary:
            overview.cases.open,
          secondaryLabel:
            "Open cases",
          status: "available",
        },
        {
          label:
            "Documents & Evidence",
          primary:
            overview.documents.total,
          primaryLabel:
            "Evidence records",
          secondary:
            overview.documents
              .pending_verification,
          secondaryLabel:
            "Pending verification",
          status: "available",
        },
        {
          label: "Product Safety",
          primary:
            overview.product_safety
              .total,
          primaryLabel:
            "Safety profiles",
          secondary:
            overview.product_safety
              .pending_review,
          secondaryLabel:
            "Pending review",
          status: "available",
        },
        {
          label:
            "Recalls & Quarantine",
          primary:
            overview.recalls
              .recalled_batches,
          primaryLabel:
            "Recalled batches",
          secondary:
            overview.recalls
              .quarantined_batches,
          secondaryLabel:
            "Quarantined batches",
          status: "available",
        },
        {
          label:
            "Governance Rules",
          primary:
            overview.governance.total,
          primaryLabel:
            "Platform rules",
          secondary:
            overview.governance.active,
          secondaryLabel:
            "Active rules",
          status: "limited",
        },
      ];
    }, [overview]);

  const criticalAttention =
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
      label: "Reporting Mode",
      value:
        "Read-only aggregate",
    },
  ];

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS
          .reports.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Compliance reporting permission
          is required to view this screen.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <Link
                href="/admin/verification-compliance"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Verification &amp;
                Compliance
              </Link>

              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Verification &amp;
                Compliance / Reports
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Compliance Reports &amp;
                Analytics
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Consolidated operational
                reporting based only on the
                compliance data currently
                supported by the
                authoritative backend.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchOverview()
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

          <ContextScopeBar
            items={contextItems}
            lastSynced={
              overview
                ? formatDate(
                    overview.generated_at,
                  )
                : "Not yet loaded"
            }
            accessNote="All tenant-owned operational data remains tenant-scoped. Governance rules are separately identified as platform-global."
          />

          {error && (
            <div
              role="alert"
              className="my-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
            >
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 my-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Compliance Cases
                </span>

                <FileText
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : overview?.cases.total ??
                    0}
              </strong>

              <small className="text-gray-500">
                {overview?.cases.open ??
                  0}{" "}
                open
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Evidence Records
                </span>

                <FileCheck2
                  size={15}
                  className="text-blue-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : overview?.documents
                      .total ?? 0}
              </strong>

              <small className="text-gray-500">
                {overview?.documents
                  .pending_verification ??
                  0}{" "}
                pending verification
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Product Safety
                </span>

                <ShieldCheck
                  size={15}
                  className="text-green-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : overview
                      ?.product_safety
                      .total ?? 0}
              </strong>

              <small className="text-gray-500">
                {overview
                  ?.product_safety
                  .pending_review ??
                  0}{" "}
                pending review
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Recall / Quarantine
                </span>

                <AlertTriangle
                  size={15}
                  className="text-orange-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : (overview?.recalls
                      .recalled_batches ??
                      0) +
                    (overview?.recalls
                      .quarantined_batches ??
                      0)}
              </strong>

              <small className="text-gray-500">
                Current flagged batches
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Governance Rules
                </span>

                <BarChart3
                  size={15}
                  className="text-[#850019]"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : overview?.governance
                      .total ?? 0}
              </strong>

              <small className="text-gray-500">
                Platform-global registry
              </small>
            </div>
          </section>

          <section className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole
                size={17}
                className="mt-0.5 text-amber-700"
              />

              <div>
                <h2 className="text-xs font-bold text-amber-900">
                  Reporting Capability
                  Boundary
                </h2>

                <p className="mt-1 max-w-5xl text-[11px] leading-relaxed text-amber-800">
                  This screen currently
                  provides a live read-only
                  operational overview from
                  supported compliance
                  domains. Formal report
                  generation, export,
                  scheduling, saved reports,
                  report history, SLA
                  analytics, trend
                  analytics, health scoring
                  and custom report
                  building are not yet
                  implemented by the
                  backend.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 mb-4">
            <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-[13px] font-bold">
                  Compliance Domain
                  Overview
                </h2>

                <p className="mt-1 text-[11px] text-gray-500">
                  Real current-state
                  summaries from supported
                  compliance domains.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Domain
                      </th>

                      <th className="px-4 py-3">
                        Primary Metric
                      </th>

                      <th className="px-4 py-3">
                        Secondary Metric
                      </th>

                      <th className="px-4 py-3">
                        Reporting Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-xs text-gray-500"
                        >
                          Loading compliance
                          reporting overview…
                        </td>
                      </tr>
                    ) : domainRows.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-xs text-gray-500"
                        >
                          No reporting data
                          available.
                        </td>
                      </tr>
                    ) : (
                      domainRows.map(
                        (row) => (
                          <tr
                            key={row.label}
                            className="hover:bg-gray-50/70"
                          >
                            <td className="px-4 py-3">
                              <div className="text-xs font-bold text-gray-900">
                                {
                                  row.label
                                }
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="text-sm font-bold">
                                {
                                  row.primary
                                }
                              </div>

                              <div className="text-[10px] text-gray-500">
                                {
                                  row.primaryLabel
                                }
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="text-sm font-bold">
                                {
                                  row.secondary
                                }
                              </div>

                              <div className="text-[10px] text-gray-500">
                                {
                                  row.secondaryLabel
                                }
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                  row.status ===
                                  "available"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                }`}
                              >
                                {row.status ===
                                "available"
                                  ? "Live summary"
                                  : "Global scope"}
                              </span>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-[13px] font-bold">
                Attention Summary
              </h2>

              <p className="mt-1 text-[11px] text-gray-500">
                Direct counts only. This is
                not a calculated risk score.
              </p>

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  Current Attention Items
                </div>

                <div className="mt-1 text-3xl font-bold text-[#850019]">
                  {loading
                    ? "…"
                    : criticalAttention}
                </div>
              </div>

              <div className="mt-5 space-y-3 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Open cases
                  </span>

                  <strong>
                    {overview?.cases.open ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Pending documents
                  </span>

                  <strong>
                    {overview?.documents
                      .pending_verification ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Pending safety review
                  </span>

                  <strong>
                    {overview
                      ?.product_safety
                      .pending_review ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Recalled batches
                  </span>

                  <strong>
                    {overview?.recalls
                      .recalled_batches ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Quarantined batches
                  </span>

                  <strong>
                    {overview?.recalls
                      .quarantined_batches ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Critical governance
                    rules
                  </span>

                  <strong>
                    {overview?.governance
                      .critical_severity ??
                      0}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-[13px] font-bold">
                Product Safety Snapshot
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Approved
                  </span>

                  <strong className="text-green-700">
                    {overview
                      ?.product_safety
                      .approved ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Rejected
                  </span>

                  <strong className="text-rose-700">
                    {overview
                      ?.product_safety
                      .rejected ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    With warnings
                  </span>

                  <strong>
                    {overview
                      ?.product_safety
                      .with_warnings ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Expiry control
                    required
                  </span>

                  <strong>
                    {overview
                      ?.product_safety
                      .expiry_control_required ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Batch tracking
                    required
                  </span>

                  <strong>
                    {overview
                      ?.product_safety
                      .batch_tracking_required ??
                      0}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-[13px] font-bold">
                Evidence Composition
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Verification request
                    documents
                  </span>

                  <strong>
                    {overview?.documents
                      .verification_request ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    KYC documents
                  </span>

                  <strong>
                    {overview?.documents
                      .kyc ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Supplier certificates
                  </span>

                  <strong>
                    {overview?.documents
                      .supplier_certificate ??
                      0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Brand authorizations
                  </span>

                  <strong>
                    {overview?.documents
                      .brand_authorization ??
                      0}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-[13px] font-bold">
                Governance Snapshot
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Active rules
                  </span>

                  <strong>
                    {overview?.governance
                      .active ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Inactive rules
                  </span>

                  <strong>
                    {overview?.governance
                      .inactive ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    High severity
                  </span>

                  <strong>
                    {overview?.governance
                      .high_severity ?? 0}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Critical severity
                  </span>

                  <strong>
                    {overview?.governance
                      .critical_severity ??
                      0}
                  </strong>
                </div>

                <div className="pt-2 border-t border-gray-100 text-[10px] text-blue-700">
                  Platform-global registry,
                  not tenant-owned.
                </div>
              </div>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Reporting Status">
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={14}
                  className="text-green-700"
                />

                <strong className="text-xs text-green-800">
                  Operational Overview
                </strong>
              </div>

              <p className="mt-1 text-[10px] text-green-700">
                Live summaries are
                available from supported
                compliance APIs.
              </p>
            </div>
          </RailSection>

          <RailSection title="Formal Reports">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Generate report
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Export
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Schedule
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  History
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Analytics Boundary">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  SLA analytics
                </span>

                <strong className="text-gray-400">
                  Not implemented
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Trend analytics
                </span>

                <strong className="text-gray-400">
                  Not implemented
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Health score
                </span>

                <strong className="text-gray-400">
                  Not scored
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Risk score
                </span>

                <strong className="text-gray-400">
                  Not scored
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Last Refresh">
            <div className="flex items-start gap-2 text-xs">
              <Clock3
                size={14}
                className="mt-0.5 text-gray-400"
              />

              <span className="text-gray-600">
                {overview
                  ? formatDate(
                      overview.generated_at,
                    )
                  : "Not yet loaded"}
              </span>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}