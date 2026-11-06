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
  ArrowLeft,
  Clock3,
  Database,
  FileClock,
  LockKeyhole,
  RefreshCw,
  Search,
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
  type ComplianceAuditRecord,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

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

export default function ComplianceImportExportAuditPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    VERIFICATION_COMPLIANCE_PERMISSIONS.audit.view,
  );

  const [search, setSearch] =
    useState("");

  const [submittedSearch, setSubmittedSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [records, setRecords] =
    useState<ComplianceAuditRecord[]>([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      last_24_hours: 0,
      last_30_days: 0,
      cases_with_activity: 0,
    });

  const [capabilities, setCapabilities] =
    useState({
      read: false,
      export: false,
    });

  const [meta, setMeta] =
    useState({
      current_page: 1,
      per_page: 20,
      total: 0,
      last_page: 1,
    });

  const fetchAudit =
    useCallback(async () => {
      if (!canView) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await verificationComplianceApi.getComplianceAudit(
            {
              search:
                submittedSearch ||
                undefined,

              action:
                actionFilter ||
                undefined,

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
          "Failed to load compliance audit history:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load compliance audit history.",
        );

        setRecords([]);
      } finally {
        setLoading(false);
      }
    }, [
      actionFilter,
      canView,
      page,
      submittedSearch,
    ]);

  useEffect(() => {
    void fetchAudit();
  }, [fetchAudit]);

  const actionOptions =
    useMemo(() => {
      const values = new Set<string>();

      records.forEach((record) => {
        if (record.action) {
          values.add(
            record.action,
          );
        }
      });

      return Array.from(
        values,
      ).sort();
    }, [records]);

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
      label: "Data Scope",
      value:
        "Compliance audit events",
    },
  ];

  const submitSearch = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setPage(1);
    setSubmittedSearch(
      search.trim(),
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setActionFilter("");
    setPage(1);
  };

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS.audit.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Compliance audit viewing
          permission is required to view
          the audit history.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          {/* HEADER */}
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
                Audit
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Compliance Audit Trail
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Inspect authoritative,
                tenant-scoped compliance audit
                events generated by compliance
                workflow decisions, evidence
                actions, waivers and other
                governed compliance operations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchAudit()
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

          {/* TENANT CONTEXT */}
          <ContextScopeBar
            items={contextItems}
            lastSynced="On request"
            accessNote="Compliance audit history is explicitly tenant-scoped and read-only."
          />

          {error && (
            <div
              role="alert"
              className="my-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
            >
              {error}
            </div>
          )}

          {/* KPI GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Total Audit Events
                </span>

                <Database
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
                Tenant-scoped records
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Last 24 Hours
                </span>

                <Activity
                  size={15}
                  className="text-green-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.last_24_hours.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Recent audit activity
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Last 30 Days
                </span>

                <FileClock
                  size={15}
                  className="text-blue-600"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.last_30_days.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Rolling activity window
              </small>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Cases With Activity
                </span>

                <ShieldCheck
                  size={15}
                  className="text-[#850019]"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.cases_with_activity.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Distinct compliance cases
              </small>
            </div>
          </section>

          {/* AUTHORITY NOTICE */}
          <section className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole
                size={17}
                className="mt-0.5 text-blue-700"
              />

              <div>
                <h2 className="text-xs font-bold text-blue-900">
                  Compliance Audit Authority
                </h2>

                <p className="mt-1 max-w-5xl text-[11px] leading-relaxed text-blue-800">
                  This screen reads the
                  authoritative Compliance
                  Audit Event domain. Events
                  are resolved using the
                  trusted current tenant
                  context and expose governed
                  workflow history without
                  borrowing supplier-trust
                  audit data.
                </p>
              </div>
            </div>
          </section>

          {/* CAPABILITY SUMMARY */}
          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 mb-4">
            <div className="rounded-md border border-gray-200 bg-white shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Audit Capability
              </h2>

              <p className="mt-1 text-[11px] text-gray-500">
                Only capabilities exposed by
                the authoritative compliance
                backend are treated as
                available.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                <div className="rounded border border-gray-100 p-3">
                  <div className="text-[10px] text-gray-500">
                    Audit History
                  </div>

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

                <div className="rounded border border-gray-100 p-3">
                  <div className="text-[10px] text-gray-500">
                    Import
                  </div>

                  <strong className="text-gray-400">
                    Not implemented
                  </strong>
                </div>

                <div className="rounded border border-gray-100 p-3">
                  <div className="text-[10px] text-gray-500">
                    Export
                  </div>

                  <strong
                    className={
                      capabilities.export
                        ? "text-green-700"
                        : "text-gray-400"
                    }
                  >
                    {capabilities.export
                      ? "Available"
                      : "Not implemented"}
                  </strong>
                </div>

                <div className="rounded border border-gray-100 p-3">
                  <div className="text-[10px] text-gray-500">
                    Scheduled Exports
                  </div>

                  <strong className="text-gray-400">
                    Not implemented
                  </strong>
                </div>

                <div className="rounded border border-gray-100 p-3">
                  <div className="text-[10px] text-gray-500">
                    Job Tracking
                  </div>

                  <strong className="text-gray-400">
                    Not implemented
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-[13px] font-bold text-amber-900">
                Unsupported Operations
              </h2>

              <p className="mt-1 text-[11px] text-amber-800">
                The current compliance backend
                exposes authoritative audit
                history but does not yet expose
                broader audit data operations.
              </p>

              <div className="mt-4 space-y-2 text-[11px] text-amber-800">
                <div>• Import templates</div>
                <div>• Validation pipelines</div>
                <div>• Field mappings</div>
                <div>• Duplicate reconciliation</div>
                <div>• Export packages</div>
                <div>• Scheduled jobs</div>
                <div>• Operations health score</div>
              </div>
            </div>
          </section>

          {/* FILTERS */}
          <form
            onSubmit={submitSearch}
            className="rounded-md border border-gray-200 bg-white p-3 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px_auto] gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-2.5 text-gray-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search action, reason, rule version, actor or correlation ID..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#850019]"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(event) => {
                  setActionFilter(
                    event.target.value,
                  );

                  setPage(1);
                }}
                className="px-3 py-2 text-xs border border-gray-200 rounded bg-white"
              >
                <option value="">
                  All actions
                </option>

                {actionOptions.map(
                  (action) => (
                    <option
                      key={action}
                      value={action}
                    >
                      {humanize(action)}
                    </option>
                  ),
                )}
              </select>

              <div className="flex gap-2">
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
              </div>
            </div>
          </form>

          {/* AUDIT TABLE */}
          <section className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-bold">
                  Compliance Audit Trail
                </h2>

                <p className="mt-1 text-[11px] text-gray-500">
                  Authoritative compliance
                  events from the current
                  tenant.
                </p>
              </div>

              <span className="text-[11px] text-gray-500">
                {meta.total.toLocaleString()}{" "}
                events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">
                      Case / Subject
                    </th>

                    <th className="px-4 py-3">
                      Action
                    </th>

                    <th className="px-4 py-3">
                      Subject
                    </th>

                    <th className="px-4 py-3">
                      Actor
                    </th>

                    <th className="px-4 py-3">
                      Change Detail
                    </th>

                    <th className="px-4 py-3">
                      Correlation
                    </th>

                    <th className="px-4 py-3">
                      Occurred
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
                        Loading audit
                        history…
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center"
                      >
                        <Database
                          size={24}
                          className="mx-auto text-gray-300 mb-2"
                        />

                        <div className="text-xs font-semibold">
                          No audit events
                          found
                        </div>

                        <div className="mt-1 text-[11px] text-gray-500">
                          No compliance audit
                          events match the
                          current filters.
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
                            {record.case ? (
                              <>
                                <div className="text-xs font-bold text-gray-900">
                                  Case{" "}
                                  {
                                    record.case
                                      .uuid
                                  }
                                </div>

                                <div className="text-[10px] text-gray-400">
                                  ID{" "}
                                  {
                                    record.case
                                      .id
                                  }{" "}
                                  ·{" "}
                                  {humanize(
                                    record.case
                                      .status,
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-xs font-medium text-gray-700">
                                  {humanize(
                                    record.subject
                                      .type,
                                  )}
                                </div>

                                <div className="text-[10px] text-gray-400 font-mono">
                                  {record.subject
                                    .id ??
                                    "No subject ID"}
                                </div>
                              </>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                              {humanize(
                                record.action,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-xs font-medium">
                              {humanize(
                                record.subject
                                  .type,
                              )}
                            </div>

                            <div className="text-[10px] text-gray-400 font-mono">
                              {record.subject
                                .id ?? "—"}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            {record.actor ? (
                              <>
                                <div className="text-xs font-medium text-gray-700">
                                  {record.actor
                                    .name ??
                                    `User #${record.actor.id}`}
                                </div>

                                <div className="text-[10px] text-gray-400">
                                  {record.actor
                                    .email ??
                                    `ID ${record.actor.id}`}
                                </div>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400">
                                System /
                                unavailable
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {record.reason ? (
                              <div className="max-w-[260px]">
                                <div className="text-[10px] font-semibold text-gray-700">
                                  Reason
                                </div>

                                <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                  {
                                    record.reason
                                  }
                                </div>

                                {record.rule_version && (
                                  <div className="text-[9px] text-gray-400 mt-1">
                                    Rule{" "}
                                    {
                                      record.rule_version
                                    }
                                  </div>
                                )}
                              </div>
                            ) : record.before ||
                              record.after ? (
                              <div className="text-[10px] text-gray-500">
                                State change
                                recorded
                                {record.rule_version
                                  ? ` · Rule ${record.rule_version}`
                                  : ""}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400">
                                No change
                                details
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-[10px] font-mono text-gray-500 break-all">
                              {record.correlation_id ??
                                "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                              <Clock3
                                size={12}
                                className="text-gray-400"
                              />

                              {formatDate(
                                record.occurred_at,
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          <RailSection title="Audit Authority">
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={14}
                  className="text-green-700"
                />

                <strong className="text-xs text-green-800">
                  Tenant Scoped
                </strong>
              </div>

              <p className="mt-1 text-[10px] text-green-700">
                Compliance audit events are
                resolved through the trusted
                current tenant context.
              </p>
            </div>
          </RailSection>

          <RailSection title="Audit Integrity">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  History
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

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  API mutations
                </span>

                <strong className="text-gray-500">
                  Not exposed
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Tenant filtering
                </span>

                <strong className="text-green-700">
                  Enforced
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Data Operations">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Import
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Export
                </span>

                <strong
                  className={
                    capabilities.export
                      ? "text-green-700"
                      : "text-gray-400"
                  }
                >
                  {capabilities.export
                    ? "Available"
                    : "Unavailable"}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Scheduled exports
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Job tracking
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Activity Window">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Last 24 hours
                </span>

                <strong>
                  {
                    summary.last_24_hours
                  }
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Last 30 days
                </span>

                <strong>
                  {
                    summary.last_30_days
                  }
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Cases with activity
                </span>

                <strong>
                  {
                    summary.cases_with_activity
                  }
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}