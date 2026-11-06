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
  CheckCircle2,
  Filter,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
  type GovernanceRule,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

type SeverityFilter =
  | "all"
  | "low"
  | "medium"
  | "high"
  | "critical";

function severityClasses(
  severity: string,
): string {
  switch (severity) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "low":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function formatRuleValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item))
      .join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function RuleDefinition({
  rule,
}: {
  rule: GovernanceRule;
}) {
  const entries =
    Object.entries(rule.rules ?? {});

  if (entries.length === 0) {
    return (
      <span className="text-[10px] text-gray-400">
        No structured definition
      </span>
    );
  }

  return (
    <div className="space-y-1">
      {entries
        .slice(0, 3)
        .map(([key, value]) => (
          <div
            key={key}
            className="text-[10px] text-gray-600"
          >
            <span className="font-semibold">
              {key
                .replaceAll("_", " ")
                .replace(/\b\w/g, (letter) =>
                  letter.toUpperCase(),
                )}
              :
            </span>{" "}
            {formatRuleValue(value)}
          </div>
        ))}

      {entries.length > 3 && (
        <div className="text-[10px] text-gray-400">
          +{entries.length - 3} more
          definition
          {entries.length - 3 === 1
            ? ""
            : "s"}
        </div>
      )}
    </div>
  );
}

export default function ComplianceGovernancePage() {
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
      .rules.view,
  );

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [severity, setSeverity] =
    useState<SeverityFilter>("all");

  const [ruleType, setRuleType] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [rules, setRules] =
    useState<GovernanceRule[]>([]);

  const [scope, setScope] =
    useState({
      type: "platform_global",
      tenant_owned: false,
      description:
        "Platform-wide compliance governance definitions.",
    });

  const [ruleTypes, setRuleTypes] =
    useState<string[]>([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      active: 0,
      inactive: 0,
      low_severity: 0,
      medium_severity: 0,
      high_severity: 0,
      critical_severity: 0,
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
      create_rule: false,
      update_rule: false,
      delete_rule: false,
      publish_rule: false,
      approve_rule: false,
      version_rule: false,
      import_rules: false,
      export_rules: false,
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
          await verificationComplianceApi.getGovernanceRules(
            {
              search:
                search || undefined,

              status:
                status === "all"
                  ? undefined
                  : status,

              severity:
                severity === "all"
                  ? undefined
                  : severity,

              rule_type:
                ruleType || undefined,

              page,
              per_page: 20,
            },
          );

        setRules(response.data);
        setScope(response.scope);
        setRuleTypes(
          response.rule_types,
        );
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
          "Failed to load governance rules:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load compliance governance rules.",
        );

        setRules([]);
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      page,
      ruleType,
      search,
      severity,
      status,
    ]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const severityTotal =
    useMemo(
      () =>
        summary.low_severity +
        summary.medium_severity +
        summary.high_severity +
        summary.critical_severity,
      [summary],
    );

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
      label: "Governance Scope",
      value: "Platform Global",
    },
  ];

  const submitFilters = (
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
    setStatus("all");
    setSeverity("all");
    setRuleType("");
    setPage(1);
  };

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS
          .rules.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Compliance rule viewing
          permission is required to view
          governance.
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
                Governance
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Compliance Rules &amp;
                Governance
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Review authoritative
                platform-wide compliance rule
                definitions, severity, status
                and structured governance
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
            accessNote="Admin access remains tenant-scoped; governance definitions shown below are platform-global"
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
                  Total Rules
                </span>

                <SlidersHorizontal
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
                Platform definitions
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Active Rules
                </span>

                <CheckCircle2
                  size={15}
                  className="text-green-600"
                />
              </div>

              <strong className="block text-2xl mt-3 text-green-700">
                {loading
                  ? "…"
                  : summary.active.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Currently active
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  High Severity
                </span>

                <AlertTriangle
                  size={15}
                  className="text-orange-500"
                />
              </div>

              <strong className="block text-2xl mt-3">
                {loading
                  ? "…"
                  : summary.high_severity.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                High governance priority
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Critical Severity
                </span>

                <ShieldCheck
                  size={15}
                  className="text-rose-600"
                />
              </div>

              <strong className="block text-2xl mt-3 text-rose-700">
                {loading
                  ? "…"
                  : summary.critical_severity.toLocaleString()}
              </strong>

              <small className="text-gray-500">
                Critical rule definitions
              </small>
            </div>
          </section>

          <section className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole
                size={17}
                className="text-blue-700 mt-0.5"
              />

              <div>
                <h2 className="text-xs font-bold text-blue-900">
                  Platform-Global Governance
                  Registry
                </h2>

                <p className="text-[11px] leading-relaxed text-blue-800 mt-1 max-w-5xl">
                  These compliance rules are
                  global platform definitions,
                  not tenant-owned records. Your
                  current tenant context controls
                  access to this Admin screen,
                  while the rule registry itself
                  applies at platform governance
                  level.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Severity Distribution
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Real severity classifications
                stored on compliance rules.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Low
                  </div>

                  <strong className="text-lg">
                    {
                      summary.low_severity
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Medium
                  </div>

                  <strong className="text-lg">
                    {
                      summary.medium_severity
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    High
                  </div>

                  <strong className="text-lg">
                    {
                      summary.high_severity
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Critical
                  </div>

                  <strong className="text-lg">
                    {
                      summary.critical_severity
                    }
                  </strong>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 mt-3">
                Classified rules:{" "}
                {severityTotal}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Governance Operations
              </h2>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Read rules
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
                    Create / Edit
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Publish / Approve
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Versioning
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <form
            onSubmit={submitFilters}
            className="bg-white border border-gray-200 rounded-md p-3 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter
                size={14}
                className="text-gray-500"
              />

              <span className="text-xs font-bold">
                Governance Filters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
              <div className="xl:col-span-2 relative">
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
                  placeholder="Search rule key, name or type..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-rose-700"
                />
              </div>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target
                      .value as StatusFilter,
                  );
                  setPage(1);
                }}
                className="px-3 py-2 text-xs border border-gray-200 rounded bg-white"
              >
                <option value="all">
                  All statuses
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>

              <select
                value={severity}
                onChange={(event) => {
                  setSeverity(
                    event.target
                      .value as SeverityFilter,
                  );
                  setPage(1);
                }}
                className="px-3 py-2 text-xs border border-gray-200 rounded bg-white"
              >
                <option value="all">
                  All severities
                </option>
                <option value="low">
                  Low
                </option>
                <option value="medium">
                  Medium
                </option>
                <option value="high">
                  High
                </option>
                <option value="critical">
                  Critical
                </option>
              </select>

              <select
                value={ruleType}
                onChange={(event) => {
                  setRuleType(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="px-3 py-2 text-xs border border-gray-200 rounded bg-white"
              >
                <option value="">
                  All rule types
                </option>

                {ruleTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold rounded bg-gray-900 text-white"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-200 bg-white"
              >
                Clear
              </button>
            </div>
          </form>

          <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-bold">
                  Compliance Rule Registry
                </h2>

                <p className="text-[11px] text-gray-500">
                  {scope.description}
                </p>
              </div>

              <span className="text-[11px] text-gray-500">
                {meta.total.toLocaleString()}{" "}
                rules
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">
                      Rule
                    </th>

                    <th className="px-4 py-3">
                      Type
                    </th>

                    <th className="px-4 py-3">
                      Severity
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Definition
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-xs text-gray-500"
                      >
                        Loading governance
                        rules…
                      </td>
                    </tr>
                  ) : rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center"
                      >
                        <SlidersHorizontal
                          size={24}
                          className="mx-auto text-gray-300 mb-2"
                        />

                        <div className="text-xs font-semibold">
                          No rules found
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1">
                          No platform
                          compliance rules match
                          the current filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-gray-50/70"
                      >
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-gray-900">
                            {rule.name}
                          </div>

                          <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                            {rule.rule_key}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            {rule.rule_type}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${severityClasses(
                              rule.severity,
                            )}`}
                          >
                            {rule.severity}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              rule.status ===
                              "active"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-50 text-gray-500"
                            }`}
                          >
                            {rule.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 min-w-[280px]">
                          <RuleDefinition
                            rule={rule}
                          />
                        </td>
                      </tr>
                    ))
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
          <RailSection title="Governance Scope">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-blue-700">
                Scope
              </div>

              <div className="font-bold text-blue-900 mt-1">
                Platform Global
              </div>

              <p className="text-[10px] text-blue-700 mt-1">
                Not tenant-owned
              </p>
            </div>
          </RailSection>

          <RailSection title="Rule State">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Active
                </span>

                <strong>
                  {summary.active}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Inactive
                </span>

                <strong>
                  {summary.inactive}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Rule types
                </span>

                <strong>
                  {ruleTypes.length}
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Control Availability">
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
                  Create / Update
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Publish
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Import / Export
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