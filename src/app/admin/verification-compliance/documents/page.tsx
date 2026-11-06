"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import {
  type ComplianceDocumentRecord,
  type ComplianceDocumentSource,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type SourceTab =
  | "all"
  | ComplianceDocumentSource;

const TABS: Array<{
  id: SourceTab;
  label: string;
}> = [
  {
    id: "all",
    label: "All Evidence",
  },
  {
    id: "verification_request",
    label: "Verification Documents",
  },
  {
    id: "kyc",
    label: "KYC Documents",
  },
  {
    id: "supplier_certificate",
    label: "Supplier Certificates",
  },
  {
    id: "brand_authorization",
    label: "Brand Authorizations",
  },
];

function sourceLabel(
  source: ComplianceDocumentSource,
): string {
  switch (source) {
    case "verification_request":
      return "Verification Request";

    case "kyc":
      return "KYC";

    case "supplier_certificate":
      return "Supplier Certificate";

    case "brand_authorization":
      return "Brand Authorization";

    default:
      return "Document";
  }
}

function SourceBadge({
  source,
}: {
  source: ComplianceDocumentSource;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      {sourceLabel(source)}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500">
        Not Applicable
      </span>
    );
  }

  const normalized =
    status.toLowerCase();

  if (
    normalized === "verified" ||
    normalized === "approved"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        {normalized === "approved"
          ? "Approved"
          : "Verified"}
      </span>
    );
  }

  if (
    normalized === "pending" ||
    normalized === "submitted"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Clock size={11} />
        {normalized === "submitted"
          ? "Submitted"
          : "Pending"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      {status}
    </span>
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    },
  ).format(date);
}

export default function ComplianceDocumentsPage() {
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
      .evidence.view,
  );

  const [activeTab, setActiveTab] =
    useState<SourceTab>("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [documents, setDocuments] =
    useState<
      ComplianceDocumentRecord[]
    >([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      verification_request: 0,
      kyc: 0,
      supplier_certificate: 0,
      brand_authorization: 0,
      pending_verification: 0,
    });

  const [meta, setMeta] =
    useState({
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    });

  const [capabilities, setCapabilities] =
    useState({
      read: false,
      download: false,
      verify_document: false,
      reject_document: false,
      batch_approve: false,
      request_replacement: false,
      revalidate: false,
      audit_export: false,
    });

  const fetchDocuments =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await verificationComplianceApi.getComplianceDocuments(
            {
              search:
                search || undefined,

              source:
                activeTab === "all"
                  ? undefined
                  : activeTab,

              page,
              per_page: 15,
            },
          );

        setDocuments(response.data);
        setSummary(response.summary);
        setCapabilities(
          response.capabilities,
        );

        setMeta({
          current_page:
            response.current_page,
          per_page:
            response.per_page,
          total:
            response.total,
          last_page:
            response.last_page,
        });
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load compliance documents:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load documents and evidence.",
        );

        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }, [
      activeTab,
      canView,
      page,
      search,
    ]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

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
      label: "Evidence Scope",
      value: "Compliance Documents",
    },
  ];

  const handleTabChange = (
    tab: SourceTab,
  ) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchSubmit = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }

    void fetchDocuments();
  };

  const handleClear = () => {
    setSearch("");
    setActiveTab("all");
    setPage(1);
  };

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS
          .evidence.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Compliance evidence viewing
          permission is required to view
          this screen.
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
                Verification &amp; Compliance /
                Documents &amp; Evidence
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Documents &amp; Evidence
                Management
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Review authoritative
                tenant-scoped compliance
                evidence across verification
                requests, KYC, supplier
                certificates and brand
                authorizations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchDocuments()
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
            lastSynced="On request"
            accessNote="Evidence access is resolved from the authenticated tenant context"
          />

          {error && (
            <div
              role="alert"
              className="my-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs"
            >
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Total Evidence
                </span>

                <FileText
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.total.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Current tenant
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Verification Documents
                </span>

                <FileCheck2
                  size={15}
                  className="text-blue-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.verification_request.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Verification requests
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Supplier Certificates
                </span>

                <ShieldCheck
                  size={15}
                  className="text-green-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.supplier_certificate.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Supplier evidence
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Pending Verification
                </span>

                <Clock
                  size={15}
                  className="text-amber-500"
                />
              </div>

              <strong className="block text-2xl mt-3 text-amber-700">
                {loading
                  ? "…"
                  : summary.pending_verification.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Supported document sources
              </small>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold text-gray-900">
                Evidence Source Summary
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Authoritative evidence
                records available to the
                current tenant.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Verification
                  </div>

                  <strong className="text-lg">
                    {
                      summary.verification_request
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    KYC
                  </div>

                  <strong className="text-lg">
                    {summary.kyc}
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Certificates
                  </div>

                  <strong className="text-lg">
                    {
                      summary.supplier_certificate
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Brand Evidence
                  </div>

                  <strong className="text-lg">
                    {
                      summary.brand_authorization
                    }
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold text-gray-900">
                Document Operations
              </h2>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Read evidence
                  </span>

                  <strong
                    className={
                      capabilities.read
                        ? "text-green-700"
                        : "text-gray-400"
                    }
                  >
                    {capabilities.read
                      ? "Available"
                      : "Unavailable"}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Download
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Verify / Reject
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Batch approval
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <div className="border-b border-gray-200 mb-3">
            <div className="flex flex-wrap gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    handleTabChange(tab.id)
                  }
                  className={`pb-2 text-xs font-semibold border-b-2 ${
                    activeTab === tab.id
                      ? "border-rose-800 text-rose-800"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <FilterToolbar
            searchPlaceholder="Search document, number, supplier or file name..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={
              handleSearchSubmit
            }
            filters={[]}
            onClearAll={handleClear}
          />

          <section className="mt-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between">
              <div>
                <h2 className="text-[13px] font-bold">
                  Compliance Evidence
                </h2>

                <p className="text-[11px] text-gray-500">
                  Read-only authoritative
                  document records
                </p>
              </div>

              <span className="text-[11px] text-gray-500">
                {meta.total.toLocaleString()}{" "}
                records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">
                      Document
                    </th>

                    <th className="px-4 py-3">
                      Source
                    </th>

                    <th className="px-4 py-3">
                      Owner
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Evidence
                    </th>

                    <th className="px-4 py-3">
                      Issued
                    </th>

                    <th className="px-4 py-3">
                      Expires
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-xs text-gray-500"
                      >
                        Loading documents…
                      </td>
                    </tr>
                  ) : documents.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center"
                      >
                        <FileText
                          size={24}
                          className="mx-auto text-gray-300 mb-2"
                        />

                        <div className="text-xs font-semibold">
                          No evidence found
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1">
                          No tenant-scoped
                          document records
                          match the current
                          filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    documents.map(
                      (document) => (
                        <tr
                          key={`${document.source}-${document.id}`}
                          className="hover:bg-gray-50/70"
                        >
                          <td className="px-4 py-3">
                            <div className="text-xs font-bold text-gray-900">
                              {document.document_name ??
                                "Unnamed Document"}
                            </div>

                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {document.document_number ??
                                document.file_name ??
                                `Record ${document.id}`}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <SourceBadge
                              source={
                                document.source
                              }
                            />
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {document.owner_name ??
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge
                              status={
                                document.status
                              }
                            />
                          </td>

                          <td className="px-4 py-3">
                            {document.evidence_present ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700">
                                <CheckCircle2
                                  size={11}
                                />
                                Present
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-400">
                                Not attached
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(
                              document.issued_at,
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(
                              document.expires_at,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-gray-500">
                Page{" "}
                {meta.current_page} of{" "}
                {Math.max(
                  meta.last_page,
                  1,
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    loading ||
                    page <= 1
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        current - 1,
                        1,
                      ),
                    )
                  }
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded bg-white disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    loading ||
                    page >=
                      meta.last_page
                  }
                  onClick={() =>
                    setPage((current) =>
                      current + 1,
                    )
                  }
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Evidence Coverage">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Total records
                </span>

                <strong>
                  {summary.total}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  KYC
                </span>

                <strong>
                  {summary.kyc}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Certificates
                </span>

                <strong>
                  {
                    summary.supplier_certificate
                  }
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Verification Controls">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Read
                </span>

                <strong
                  className={
                    capabilities.read
                      ? "text-green-700"
                      : "text-gray-400"
                  }
                >
                  {capabilities.read
                    ? "Enabled"
                    : "Unavailable"}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Verify
                </span>

                <strong className="text-gray-400">
                  Not enabled
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Audit export
                </span>

                <strong className="text-gray-400">
                  Not enabled
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}