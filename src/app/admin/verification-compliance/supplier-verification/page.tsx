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
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  XCircle,
  ArrowLeft,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  HealthScoreGauge,
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";
import type { SupplierSummary } from "@/services/api/brandsSuppliers";

type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected";

type DashboardData = Awaited<
  ReturnType<
    typeof brandsSuppliersApi.getVerificationQueue
  >
>;

const TABS = [
  { id: "all", label: "All Suppliers" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function normalizeVerificationStatus(
  value: string | null | undefined,
): VerificationStatus | "unknown" {
  const normalized = String(
    value ?? "",
  ).toLowerCase();

  if (normalized === "under_review" || normalized === "information_requested") {
    return "pending";
  }

  if (
    normalized === "pending" ||
    normalized === "approved" ||
    normalized === "rejected"
  ) {
    return normalized;
  }

  return "unknown";
}

function VerificationBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    normalizeVerificationStatus(status);

  if (normalized === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
        <XCircle size={11} />
        Rejected
      </span>
    );
  }

  if (["pending", "under_review", "information_requested"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Clock size={11} />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      Unknown
    </span>
  );
}

export default function SupplierVerificationPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    VERIFICATION_COMPLIANCE_PERMISSIONS.cases.view,
  );

  const canPass = hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.cases.pass);
  const canFail = hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.cases.fail);
  const canVerify = canPass || canFail;

  const [activeTab, setActiveTab] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [mutatingId, setMutatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const fetchVerificationQueue =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await brandsSuppliersApi.getVerificationQueue(
            {
              search:
                search || undefined,
              page,
              per_page: 15,
            },
          );

        setDashboardData(response);
      } catch (reason) {
        const requestError =
          reason as Error & {
            referenceId?: string | null;
          };

        console.error(
          "Failed to load supplier verification queue:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load supplier verification queue.",
        );
      } finally {
        setLoading(false);
      }
    }, [canView, page, search]);

  useEffect(() => {
    void fetchVerificationQueue();
  }, [
    page,
    fetchVerificationQueue,
  ]);

  const suppliers = useMemo(
    () =>
      (dashboardData?.cases
        ?.data ??
        []) as SupplierSummary[],
    [dashboardData],
  );

  const visibleSuppliers =
    useMemo(() => {
      if (activeTab === "all") {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) =>
          normalizeVerificationStatus(
            supplier.verificationStatus,
          ) === activeTab,
      );
    }, [activeTab, suppliers]);

  const meta =
    dashboardData?.cases?.meta ??
    {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    };

  const loadedCounts =
    useMemo(() => {
      let pending = 0;
      let approved = 0;
      let rejected = 0;

      suppliers.forEach(
        (supplier) => {
          const status =
            normalizeVerificationStatus(
              supplier.verificationStatus,
            );

          if (status === "pending") {
            pending += 1;
          }

          if (status === "approved") {
            approved += 1;
          }

          if (status === "rejected") {
            rejected += 1;
          }
        },
      );

      return {
        pending,
        approved,
        rejected,
      };
    }, [suppliers]);

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
      label: "Verification Scope",
      value: "Supplier Network",
    },
  ];

  const updateVerification =
    async (
      supplier: SupplierSummary,
      status: VerificationStatus,
    ) => {
      if (!canVerify) {
        return;
      }

      setMutatingId(supplier.id);
      setError(null);
      setNotice(null);

      try {
        const response =
          status === "approved"
            ? await brandsSuppliersApi.approveVerification(
                supplier.id,
                undefined,
                supplier.updatedAt || undefined,
              )
            : await brandsSuppliersApi.rejectVerification(
                supplier.id,
                window.prompt("Reason for rejection") || "",
                supplier.updatedAt || undefined,
              );

        setNotice(response.message);

        await fetchVerificationQueue();
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to update supplier verification:",
          requestError,
        );

        setError(
          requestError.message ||
            "Unable to update supplier verification.",
        );
      } finally {
        setMutatingId(null);
      }
    };

  const handleSearchSubmit = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }

    void fetchVerificationQueue();
  };

  const handleClear = () => {
    setSearch("");
    setActiveTab("all");
    setPage(1);
  };

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS.cases.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
                Compliance case access required.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <Link
            href="/admin/verification-compliance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
            >
            <ArrowLeft size={14} />
            Back to Verification &amp; Compliance
            </Link>
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Verification &amp; Compliance /
                Supplier Verification
              </div>

             <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Supplier Verification &amp;
                Eligibility
              </h1>

              <p className="text-xs text-gray-500 mt-1">
                Review and decide supplier verification status using authoritative tenant-scoped supplier records.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchVerificationQueue()
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

          {/* CONTEXT */}
          <ContextScopeBar
            items={contextItems}
            lastSynced="On request"
            accessNote="Access is resolved from the authenticated tenant context"
          />

          {/* NOTICES */}
          {error && (
            <div
              role="alert"
              className="my-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="my-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs"
            >
              {notice}
            </div>
          )}

          {/* ZIP-STYLE KPI AREA */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Total Suppliers
                </span>

                <ShieldCheck
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : meta.total.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Current tenant
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Pending
                </span>

                <Clock
                  size={15}
                  className="text-amber-500"
                />
              </div>

              <strong className="block text-2xl mt-3 text-amber-700">
                {loadedCounts.pending}
              </strong>

              <small className="text-gray-500">
                Loaded page only
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Approved
                </span>

                <CheckCircle2
                  size={15}
                  className="text-green-600"
                />
              </div>

              <strong className="block text-2xl mt-3 text-green-700">
                {loadedCounts.approved}
              </strong>

              <small className="text-gray-500">
                Loaded page only
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Rejected
                </span>

                <XCircle
                  size={15}
                  className="text-red-500"
                />
              </div>

              <strong className="block text-2xl mt-3 text-red-700">
                {loadedCounts.rejected}
              </strong>

              <small className="text-gray-500">
                Loaded page only
              </small>
            </div>
          </section>

          {/* ZIP ANALYTICS PLACEHOLDER */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm p-4 min-h-[180px]">
              <h2 className="text-[13px] font-bold text-gray-900">
                Verification Trend
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Historical verification
                trend is not exposed by the
                current Admin supplier API.
              </p>

              <div className="h-[110px] mt-4 border border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                Trend analytics unavailable
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 min-h-[180px]">
              <h2 className="text-[13px] font-bold text-gray-900">
                Verification Intelligence
              </h2>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    KYC workflow
                  </span>

                  <strong className="text-gray-400">
                    Unavailable
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Legal review
                  </span>

                  <strong className="text-gray-400">
                    Unavailable
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    SLA analytics
                  </span>

                  <strong className="text-gray-400">
                    Unavailable
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Risk scoring
                  </span>

                  <strong className="text-gray-400">
                    Unavailable
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* TABS */}
          <div className="border-b border-gray-200 mb-3">
            <div className="flex flex-wrap gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
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

          {/* FILTERS */}
          <FilterToolbar
            searchPlaceholder="Search suppliers..."
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={
              handleSearchSubmit
            }
            filters={[]}
            onClearAll={handleClear}
          />

          {/* TABLE */}
          <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-3 mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[1050px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">
                      Supplier ID
                    </th>

                    <th className="px-3 py-2">
                      Supplier
                    </th>

                    <th className="px-3 py-2">
                      Type
                    </th>

                    <th className="px-3 py-2">
                      Country
                    </th>

                    <th className="px-3 py-2">
                      Verification
                    </th>

                    <th className="px-3 py-2">
                      Lifecycle
                    </th>

                    <th className="px-3 py-2 text-right">
                      Products
                    </th>

                    <th className="px-3 py-2">
                      Verification Action
                    </th>

                    <th className="px-3 py-2 text-right">
                      Workspace
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-8 text-center text-gray-400"
                      >
                        Loading supplier
                        verification records…
                      </td>
                    </tr>
                  ) : visibleSuppliers.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-8 text-center text-gray-400"
                      >
                        No suppliers matched
                        the selected
                        verification filter.
                      </td>
                    </tr>
                  ) : (
                    visibleSuppliers.map(
                      (
                        supplier:
                          SupplierSummary,
                      ) => {
                        const status =
                          normalizeVerificationStatus(
                            supplier.verificationStatus,
                          );

                        const busy =
                          mutatingId ===
                          supplier.id;

                        return (
                          <tr
                            key={
                              supplier.id
                            }
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-2 font-bold text-rose-800">
                              {
                                supplier.id
                              }
                            </td>

                            <td className="px-3 py-2">
                              <div className="font-bold text-gray-900">
                                {
                                  supplier.name
                                }
                              </div>

                              {supplier.email && (
                                <div className="text-[10px] text-gray-400">
                                  {
                                    supplier.email
                                  }
                                </div>
                              )}
                            </td>

                            <td className="px-3 py-2 text-gray-600">
                              {supplier.type ??
                                "—"}
                            </td>

                            <td className="px-3 py-2 text-gray-600">
                              {supplier.country ??
                                "—"}
                            </td>

                            <td className="px-3 py-2">
                              <VerificationBadge
                                status={
                                  supplier.verificationStatus
                                }
                              />
                            </td>

                            <td className="px-3 py-2 text-gray-600">
                              {supplier.status ??
                                "unknown"}
                            </td>

                            <td className="px-3 py-2 text-right font-semibold">
                              {supplier.activeProducts ??
                                0}
                            </td>

                            <td className="px-3 py-2">
                              {canVerify ? (
                                <div className="flex flex-wrap gap-1">
                                  {canPass && status !==
                                    "approved" && (
                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        void updateVerification(
                                          supplier,
                                          "approved",
                                        )
                                      }
                                      className="px-2 py-1 rounded text-[10px] font-bold bg-green-50 border border-green-200 text-green-700 disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {canFail && status !==
                                    "rejected" && (
                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        void updateVerification(
                                          supplier,
                                          "rejected",
                                        )
                                      }
                                      className="px-2 py-1 rounded text-[10px] font-bold bg-red-50 border border-red-200 text-red-700 disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  Read only
                                </span>
                              )}
                            </td>

                            <td className="px-3 py-2 text-right">
                              <Link
                                href={`/admin/verification-compliance/supplier-verification/${encodeURIComponent(
                                  supplier.id,
                                )}`}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                Review Case
                              </Link>
                            </td>
                          </tr>
                        );
                      },
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 flex items-center justify-between border-t border-gray-200 text-[11px] text-gray-500 bg-gray-50 rounded-b-md">
              <div>
                Page {meta.current_page} of{" "}
                {meta.last_page} ·{" "}
                {meta.total.toLocaleString()}{" "}
                total suppliers
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={
                    meta.current_page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                    )
                  }
                  className="px-2 py-1 border border-gray-200 rounded bg-white disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    meta.current_page >=
                      meta.last_page ||
                    loading
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        meta.last_page,
                        current + 1,
                      ),
                    )
                  }
                  className="px-2 py-1 border border-gray-200 rounded bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* RIGHT RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Verification Health">
            <HealthScoreGauge
              score={0}
              label="Verification health"
              statusText="Not Assessed"
              statusColor="#6b7280"
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Current API Workflow">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Pending
                </span>

                <strong className="text-amber-700">
                  Available
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Verified
                </span>

                <strong className="text-green-700">
                  Available
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Rejected
                </span>

                <strong className="text-red-700">
                  Available
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Verification Permission">
            {canVerify ? (
              <div className="text-xs bg-green-50 border border-green-100 text-green-700 rounded p-2.5">
                You can update supplier
                verification for the current
                tenant.
              </div>
            ) : (
              <div className="text-xs bg-gray-50 border border-gray-100 text-gray-500 rounded p-2.5">
                Verification is read-only in
                your current administrator
                context.
              </div>
            )}
          </RailSection>

          <RailSection title="Unavailable Workflow Data">
            <div className="space-y-1.5 text-[11px] text-gray-500">
              <div>KYC progress</div>
              <div>Legal-review queue</div>
              <div>Assigned reviewer</div>
              <div>Verification SLA</div>
              <div>Risk scoring</div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}
