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
  Beaker,
  CheckCircle2,
  Clock,
  FileText,
  FlaskConical,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  DashboardGrid,
  KpiCard,
} from "@/components/admin/shared/KpiCard";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import {
  type ProductSafetyRecord,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type SafetyTab =
  | "all"
  | "pending_review"
  | "approved"
  | "changes_requested"
  | "rejected"
  | "not_required";

const TABS: Array<{
  id: SafetyTab;
  label: string;
}> = [
  {
    id: "all",
    label: "All Profiles",
  },
  {
    id: "pending_review",
    label: "Pending Review",
  },
  {
    id: "approved",
    label: "Approved",
  },
  {
    id: "changes_requested",
    label: "Changes Requested",
  },
  {
    id: "rejected",
    label: "Rejected",
  },
  {
    id: "not_required",
    label: "Not Required",
  },
];

function statusLabel(
  value: string,
): string {
  switch (value) {
    case "pending_review":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "changes_requested":
      return "Changes Requested";
    case "rejected":
      return "Rejected";
    case "not_required":
      return "Not Required";
    default:
      return value;
  }
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Approved
      </span>
    );
  }

  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Clock size={11} />
        Pending Review
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <ShieldAlert size={11} />
        Rejected
      </span>
    );
  }

  if (status === "changes_requested") {
    return (
      <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
        Changes Requested
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      {statusLabel(status)}
    </span>
  );
}

export default function ProductSafetyPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    VERIFICATION_COMPLIANCE_PERMISSIONS.view,
  );

  const [activeTab, setActiveTab] =
    useState<SafetyTab>("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [records, setRecords] =
    useState<ProductSafetyRecord[]>([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      pending_review: 0,
      approved: 0,
      changes_requested: 0,
      rejected: 0,
      not_required: 0,
      expiry_control_required: 0,
      batch_tracking_required: 0,
      with_warnings: 0,
    });

  const [meta, setMeta] =
    useState({
      current_page: 1,
      per_page: 20,
      total: 0,
      last_page: 1,
    });

  const [capabilities, setCapabilities] =
    useState({
      read: false,
      review_profile: false,
      approve_safety: false,
      reject_safety: false,
      block_publication: false,
      ingredient_risk_assessment: false,
      laboratory_evidence: false,
      regulatory_registration: false,
      claims_review: false,
      packaging_review: false,
      safety_report_export: false,
    });

  const fetchData =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await verificationComplianceApi.getProductSafety(
            {
              search:
                search || undefined,

              compliance_status:
                activeTab === "all"
                  ? undefined
                  : activeTab,

              page,
              per_page: 20,
            },
          );

        setRecords(response.data);
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
          "Failed to load product safety data:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load product safety data.",
        );

        setRecords([]);
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
    void fetchData();
  }, [fetchData]);

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
      label: "Safety Scope",
      value: "Beauty Product Profiles",
    },
  ];

  const reviewedCount = useMemo(
    () =>
      summary.approved +
      summary.rejected +
      summary.changes_requested,
    [summary],
  );

  const handleTabChange = (
    tab: SafetyTab,
  ) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (page !== 1) {
      setPage(1);
      return;
    }

    void fetchData();
  };

  const clearFilters = () => {
    setSearch("");
    setActiveTab("all");
    setPage(1);
  };

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Verification &amp; Compliance
          viewing permission is required
          to view product safety data.
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
                Product Safety
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Product Safety &amp;
                Compliance Oversight
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Review real tenant-scoped
                Beauty product profile
                compliance state, ingredient
                information, warnings, expiry
                controls and batch-tracking
                requirements.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchData()
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
            accessNote="Safety data is resolved from authenticated tenant context"
          />

          {error && (
            <div
              role="alert"
              className="my-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs"
            >
              {error}
            </div>
          )}

          <DashboardGrid columns={4}>
            <KpiCard
              title="Product Profiles"
              value={
                loading
                  ? "…"
                  : summary.total.toLocaleString()
              }
              icon={FileText}
            />

            <KpiCard
              title="Pending Review"
              value={
                loading
                  ? "…"
                  : summary.pending_review.toLocaleString()
              }
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
              alert={summary.pending_review > 0}
            />

            <KpiCard
              title="Approved"
              value={
                loading
                  ? "…"
                  : summary.approved.toLocaleString()
              }
              icon={CheckCircle2}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <KpiCard
              title="Profiles With Warnings"
              value={
                loading
                  ? "…"
                  : summary.with_warnings.toLocaleString()
              }
              icon={AlertTriangle}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
              alert={summary.with_warnings > 0}
            />
          </DashboardGrid>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Safety Profile Coverage
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                These values come from real
                Beauty product profile fields.
                They are not safety scores.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Reviewed Outcomes
                  </div>

                  <strong className="text-lg">
                    {reviewedCount}
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Changes Requested
                  </div>

                  <strong className="text-lg">
                    {
                      summary.changes_requested
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Expiry Control
                  </div>

                  <strong className="text-lg">
                    {
                      summary.expiry_control_required
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Batch Tracking
                  </div>

                  <strong className="text-lg">
                    {
                      summary.batch_tracking_required
                    }
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Admin Safety Operations
              </h2>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Read profiles
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
                    Approve / Reject
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Publication blocking
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Safety report export
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={17}
                className="text-amber-700 mt-0.5"
              />

              <div>
                <h2 className="text-xs font-bold text-amber-900">
                  Partial Product Safety
                  Capability
                </h2>

                <p className="text-[11px] leading-relaxed text-amber-800 mt-1 max-w-5xl">
                  The current backend provides
                  Beauty product profile
                  compliance state and safety
                  metadata. It does not yet
                  provide an ingredient-risk
                  engine, laboratory evidence
                  workflow, regulatory
                  registration authority,
                  claims review, packaging
                  compliance decisions or
                  publication-block actions.
                </p>
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

          <form
            onSubmit={handleSearch}
            className="bg-white border border-gray-200 rounded-md p-3 flex flex-col sm:flex-row gap-2 sm:items-center"
          >
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search product, SKU, ingredients or warnings..."
              className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-rose-700"
            />

            <button
              type="submit"
              className="px-3 py-2 text-xs font-semibold rounded bg-gray-900 text-white"
            >
              Search
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-xs font-semibold rounded border border-gray-200 bg-white"
            >
              Clear
            </button>
          </form>

          <section className="mt-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-bold">
                  Product Safety Profiles
                </h2>

                <p className="text-[11px] text-gray-500">
                  Read-only Beauty compliance
                  data
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
                      Product
                    </th>

                    <th className="px-4 py-3">
                      Supplier
                    </th>

                    <th className="px-4 py-3">
                      Compliance
                    </th>

                    <th className="px-4 py-3">
                      Ingredients
                    </th>

                    <th className="px-4 py-3">
                      Warnings
                    </th>

                    <th className="px-4 py-3">
                      SPF
                    </th>

                    <th className="px-4 py-3">
                      Controls
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
                        Loading product
                        safety profiles…
                      </td>
                    </tr>
                  ) : records.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center"
                      >
                        <Beaker
                          size={24}
                          className="mx-auto text-gray-300 mb-2"
                        />

                        <div className="text-xs font-semibold">
                          No product safety
                          profiles found
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1">
                          No tenant-scoped
                          Beauty profiles match
                          the current filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map(
                      (record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gray-50/70"
                        >
                          <td className="px-4 py-3">
                            <div className="text-xs font-bold text-gray-900">
                              {record.product
                                .name ??
                                "Unnamed Product"}
                            </div>

                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {record.product
                                .sku ??
                                "No SKU"}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {record.supplier
                              ?.name ?? "—"}
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge
                              status={
                                record.compliance_status
                              }
                            />
                          </td>

                          <td className="px-4 py-3">
                            {record.ingredient_information_present ? (
                              <div className="max-w-[240px]">
                                <div className="text-[10px] font-bold text-green-700">
                                  Information
                                  present
                                </div>

                                <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                  {
                                    record.ingredients
                                  }
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-400">
                                Not provided
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {record.warnings_present ? (
                              <div className="max-w-[220px]">
                                <div className="text-[10px] font-bold text-orange-700">
                                  Warning text
                                  present
                                </div>

                                <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                  {
                                    record.warnings
                                  }
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-400">
                                None recorded
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {record.spf_value ===
                            null
                              ? "—"
                              : record.spf_value}
                          </td>

                          <td className="px-4 py-3">
                            <div className="space-y-1 text-[10px]">
                              <div>
                                Expiry:{" "}
                                <strong>
                                  {record.expiry_required
                                    ? "Required"
                                    : "No"}
                                </strong>
                              </div>

                              <div>
                                Batch:{" "}
                                <strong>
                                  {record.batch_tracking_required
                                    ? "Required"
                                    : "No"}
                                </strong>
                              </div>
                            </div>
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

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <FlaskConical
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Laboratory Evidence
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                Backend capability not
                implemented.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <ShieldAlert
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Ingredient Risk Assessment
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                No authoritative restricted
                ingredient engine exists.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <PackageCheck
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Packaging Compliance
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                Backend decision workflow not
                implemented.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <FileText
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Regulatory Registration
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                Registration authority is not
                currently available.
              </p>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Safety Health">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Safety Score
              </div>

              <div className="font-bold text-gray-700 mt-1">
                Not Assessed
              </div>

              <p className="text-[10px] text-gray-500 mt-1">
                No authoritative safety
                scoring engine is implemented.
              </p>
            </div>
          </RailSection>

          <RailSection title="Workflow State">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Pending review
                </span>

                <strong>
                  {
                    summary.pending_review
                  }
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Approved
                </span>

                <strong>
                  {summary.approved}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Rejected
                </span>

                <strong>
                  {summary.rejected}
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Control Availability">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
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

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Approve / Reject
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Laboratory review
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Claims review
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}