
"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
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
  type ComplianceCaseSummary,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type CaseTab =
  | "all"
  | "open"
  | "resolved"
  | "closed";

const TABS: Array<{
  id: CaseTab;
  label: string;
}> = [
  {
    id: "all",
    label: "All Compliance Cases",
  },
  {
    id: "open",
    label: "Open",
  },
  {
    id: "resolved",
    label: "Resolved",
  },
  {
    id: "closed",
    label: "Closed",
  },
];

function CaseStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (
    normalized === "resolved" ||
    normalized === "closed"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />

        {normalized === "closed"
          ? "Closed"
          : "Resolved"}
      </span>
    );
  }

  if (normalized === "open") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Clock size={11} />
        Open
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      {status || "Unknown"}
    </span>
  );
}

function ComplianceStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "passed"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />

        {normalized === "passed"
          ? "Passed"
          : "Approved"}
      </span>
    );
  }

  if (normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Clock size={11} />
        Pending
      </span>
    );
  }

  if (
    normalized === "rejected" ||
    normalized === "failed" ||
    normalized === "blocked"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <AlertTriangle size={11} />

        {normalized === "failed"
          ? "Failed"
          : normalized === "blocked"
            ? "Blocked"
            : "Rejected"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      {status || "Unknown"}
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

function CapabilityState({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <strong
      className={
        enabled
          ? "text-green-700"
          : "text-gray-400"
      }
    >
      {enabled
        ? "Available"
        : "Unavailable"}
    </strong>
  );
}

export default function ComplianceCasesPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView =
    hasPermission(
      VERIFICATION_COMPLIANCE_PERMISSIONS
        .cases.view,
    );

  const [activeTab, setActiveTab] =
    useState<CaseTab>("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [cases, setCases] =
    useState<ComplianceCaseSummary[]>([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      open: 0,
      resolved: 0,
      pending_compliance: 0,
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
      resolve_case: false,
      escalate_case: false,
      update_case: false,
      pass: false,
      fail: false,
      request_changes: false,
    });

  const fetchCases =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await verificationComplianceApi.getComplianceCases(
            {
              search:
                search || undefined,

              status:
                activeTab === "all"
                  ? undefined
                  : activeTab,

              page,
              per_page: 15,
            },
          );

        setCases(
          response.data,
        );

        setSummary(
          response.summary,
        );

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
          reason as Error & {
            referenceId?: string | null;
          };

        console.error(
          "Failed to load compliance cases:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load compliance cases.",
        );

        setCases([]);
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
    void fetchCases();
  }, [fetchCases]);

  const handleTabChange = (
    tab: CaseTab,
  ) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchSubmit = () => {
    if (page !== 1) {
      setPage(1);

      return;
    }

    void fetchCases();
  };

  const handleClear = () => {
    setSearch("");
    setActiveTab("all");
    setPage(1);
  };

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
      label: "Compliance Scope",
      value: "Case Management",
    },
  ];

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS
          .cases.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Compliance case viewing
          permission is required to view
          compliance cases.
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
                Compliance / Compliance
                Cases
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Central Compliance Case
                Management
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Review authoritative,
                tenant-scoped compliance
                case records, applicable
                rules, workflow ownership
                and current compliance
                state.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchCases()
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
            accessNote="Compliance cases are resolved from the authenticated tenant context"
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
              title="Total Cases"
              value={
                loading
                  ? "…"
                  : summary.total.toLocaleString()
              }
              icon={ShieldAlert}
            />

            <KpiCard
              title="Open Cases"
              value={
                loading
                  ? "…"
                  : summary.open.toLocaleString()
              }
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
              alert={summary.open > 0}
            />

            <KpiCard
              title="Resolved / Closed"
              value={
                loading
                  ? "…"
                  : summary.resolved.toLocaleString()
              }
              icon={CheckCircle2}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <KpiCard
              title="Pending Compliance"
              value={
                loading
                  ? "…"
                  : summary.pending_compliance.toLocaleString()
              }
              icon={FileText}
              iconBgColor="bg-gray-100"
              iconColor="text-gray-600"
              alert={
                summary.pending_compliance >
                0
              }
            />
          </DashboardGrid>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm p-4 min-h-[160px]">
              <h2 className="text-[13px] font-bold text-gray-900">
                Compliance Case Trend
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Historical compliance case
                trend analytics are not
                exposed by the current
                authoritative Admin
                compliance API.
              </p>

              <div className="h-[90px] mt-4 border border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                Trend analytics unavailable
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 min-h-[160px]">
              <h2 className="text-[13px] font-bold text-gray-900">
                Case Operations
              </h2>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Read case files
                  </span>

                  <CapabilityState
                    enabled={
                      capabilities.read
                    }
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Request changes
                  </span>

                  <CapabilityState
                    enabled={
                      capabilities.request_changes
                    }
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Pass cases
                  </span>

                  <CapabilityState
                    enabled={
                      capabilities.pass
                    }
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Fail cases
                  </span>

                  <CapabilityState
                    enabled={
                      capabilities.fail
                    }
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Escalate cases
                  </span>

                  <CapabilityState
                    enabled={
                      capabilities.escalate_case
                    }
                  />
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
                    handleTabChange(
                      tab.id,
                    )
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
            searchPlaceholder="Search case number, type or compliance status..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
            }}
            onSearchSubmit={
              handleSearchSubmit
            }
            filters={[]}
            onClearAll={handleClear}
          />

          <section className="mt-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">
                  Compliance Cases
                </h2>

                <p className="text-[11px] text-gray-500 mt-0.5">
                  Tenant-scoped
                  authoritative compliance
                  case records
                </p>
              </div>

              <span className="text-[11px] text-gray-500">
                {meta.total.toLocaleString()}{" "}
                record
                {meta.total === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 font-bold">
                      Case
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Type
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Case Status
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Compliance
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Rule
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Assigned To
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Updated
                    </th>

                    <th className="px-4 py-3 font-bold text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-xs text-gray-500"
                      >
                        Loading compliance
                        cases…
                      </td>
                    </tr>
                  ) : cases.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center"
                      >
                        <ShieldAlert
                          size={24}
                          className="mx-auto text-gray-300 mb-2"
                        />

                        <div className="text-xs font-semibold text-gray-700">
                          No compliance cases
                          found
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1">
                          No tenant-scoped
                          case records match
                          the current filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cases.map(
                      (
                        complianceCase,
                      ) => (
                        <tr
                          key={
                            complianceCase.id
                          }
                          className="hover:bg-gray-50/70"
                        >
                          <td className="px-4 py-3">
                            <div className="text-xs font-bold text-gray-900">
                              {
                                complianceCase.case_number
                              }
                            </div>

                            <div className="text-[10px] text-gray-500 mt-0.5">
                              ID{" "}
                              {
                                complianceCase.id
                              }
                              {" · "}
                              v
                              {
                                complianceCase.lock_version
                              }
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {
                              complianceCase.case_type
                            }
                          </td>

                          <td className="px-4 py-3">
                            <CaseStatusBadge
                              status={
                                complianceCase.status
                              }
                            />
                          </td>

                          <td className="px-4 py-3">
                            <ComplianceStatusBadge
                              status={
                                complianceCase.compliance_status
                              }
                            />
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-700">
                              {complianceCase
                                .compliance_rule
                                ?.name ??
                                "—"}
                            </div>

                            {complianceCase
                              .compliance_rule
                              ?.rule_key && (
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {
                                  complianceCase
                                    .compliance_rule
                                    .rule_key
                                }
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-700">
                              {complianceCase
                                .assignee
                                ?.name ??
                                "Unassigned"}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(
                              complianceCase.updated_at,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/verification-compliance/cases/${encodeURIComponent(
                                String(
                                  complianceCase.id,
                                ),
                              )}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-950"
                            >
                              <Eye
                                size={13}
                              />

                              Review
                            </Link>
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
                )}{" "}
                ·{" "}
                {meta.total.toLocaleString()}{" "}
                total cases
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    loading ||
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current - 1,
                          1,
                        ),
                    )
                  }
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded bg-white text-gray-600 hover:text-gray-900 disabled:opacity-50"
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
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded bg-white text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Compliance Health">
            <div className="space-y-3 text-xs">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  Health Score
                </div>

                <div className="font-bold text-gray-700 mt-1">
                  Not Assessed
                </div>

                <p className="text-[10px] text-gray-500 mt-1">
                  No authoritative
                  aggregate compliance
                  health scoring service is
                  currently exposed.
                </p>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Open cases
                </span>

                <strong>
                  {summary.open}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Pending compliance
                </span>

                <strong>
                  {
                    summary.pending_compliance
                  }
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Case Controls">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Read
                </span>

                <CapabilityState
                  enabled={
                    capabilities.read
                  }
                />
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Request changes
                </span>

                <CapabilityState
                  enabled={
                    capabilities.request_changes
                  }
                />
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Pass
                </span>

                <CapabilityState
                  enabled={
                    capabilities.pass
                  }
                />
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Fail
                </span>

                <CapabilityState
                  enabled={
                    capabilities.fail
                  }
                />
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Escalate
                </span>

                <CapabilityState
                  enabled={
                    capabilities.escalate_case
                  }
                />
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}