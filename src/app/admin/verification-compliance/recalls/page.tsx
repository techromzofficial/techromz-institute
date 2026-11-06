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
  Ban,
  Boxes,
  CheckCircle2,
  Clock,
  PackageX,
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
  type RecallBatchRecord,
  type RecallState,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

type RecallTab =
  | "recalled_or_quarantined"
  | "recalled"
  | "quarantined";

const TABS: Array<{
  id: RecallTab;
  label: string;
}> = [
  {
    id: "recalled_or_quarantined",
    label: "All Flagged Batches",
  },
  {
    id: "recalled",
    label: "Recalled",
  },
  {
    id: "quarantined",
    label: "Quarantined",
  },
];

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

function BatchState({
  record,
}: {
  record: RecallBatchRecord;
}) {
  if (
    record.is_recalled &&
    record.is_quarantined
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <ShieldAlert size={11} />
        Recalled &amp; Quarantined
      </span>
    );
  }

  if (record.is_recalled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
        <PackageX size={11} />
        Recalled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
      <Ban size={11} />
      Quarantined
    </span>
  );
}

export default function RecallsPage() {
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
    useState<RecallTab>(
      "recalled_or_quarantined",
    );

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [records, setRecords] =
    useState<RecallBatchRecord[]>([]);

  const [summary, setSummary] =
    useState({
      recalled_batches: 0,
      quarantined_batches: 0,
      recalled_and_quarantined: 0,
      active_batches: 0,
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
      create_recall_incident: false,
      update_recall_incident: false,
      recall_classification: false,
      lifecycle_management: false,
      criticality_assessment: false,
      corrective_action: false,
      recall_report_export: false,
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
          await verificationComplianceApi.getRecalls(
            {
              search:
                search || undefined,
              state:
                activeTab as RecallState,
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
          "Failed to load recalls:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load recalled and quarantined batches.",
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
      label: "Inventory Scope",
      value:
        "Recalled & Quarantined Batches",
    },
  ];

  const handleTabChange = (
    tab: RecallTab,
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
    setActiveTab(
      "recalled_or_quarantined",
    );
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
          to view recall and quarantine
          controls.
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
                Recalls
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Recalls &amp; Quarantine
                Oversight
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                Monitor real tenant-scoped
                inventory batches currently
                marked as recalled or
                quarantined.
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
            accessNote="Batch state is resolved from authenticated tenant inventory context"
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
              title="Recalled Batches"
              value={
                loading
                  ? "…"
                  : summary.recalled_batches.toLocaleString()
              }
              icon={PackageX}
              iconBgColor="bg-red-50"
              iconColor="text-red-600"
              alert={summary.recalled_batches > 0}
            />

            <KpiCard
              title="Quarantined Batches"
              value={
                loading
                  ? "…"
                  : summary.quarantined_batches.toLocaleString()
              }
              icon={Ban}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
              alert={summary.quarantined_batches > 0}
            />

            <KpiCard
              title="Both States"
              value={
                loading
                  ? "…"
                  : summary.recalled_and_quarantined.toLocaleString()
              }
              icon={ShieldAlert}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-600"
              alert={summary.recalled_and_quarantined > 0}
            />

            <KpiCard
              title="Active Batches"
              value={
                loading
                  ? "…"
                  : summary.active_batches.toLocaleString()
              }
              icon={Boxes}
            />
          </DashboardGrid>

          <section className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={17}
                className="text-amber-700 mt-0.5"
              />

              <div>
                <h2 className="text-xs font-bold text-amber-900">
                  Partial Recall Capability
                </h2>

                <p className="text-[11px] leading-relaxed text-amber-800 mt-1 max-w-5xl">
                  The current backend provides
                  authoritative recalled and
                  quarantined inventory batch
                  state. It does not yet provide
                  recall incident creation,
                  criticality classification,
                  lifecycle workflow, corrective
                  actions or regulatory recall
                  reporting.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Inventory Risk State
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                These metrics reflect stored
                inventory batch flags only.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Recalled
                  </div>

                  <strong className="text-lg">
                    {
                      summary.recalled_batches
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Quarantined
                  </div>

                  <strong className="text-lg">
                    {
                      summary.quarantined_batches
                    }
                  </strong>
                </div>

                <div className="border border-gray-100 rounded p-3">
                  <div className="text-[10px] text-gray-500">
                    Dual Flag
                  </div>

                  <strong className="text-lg">
                    {
                      summary.recalled_and_quarantined
                    }
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
              <h2 className="text-[13px] font-bold">
                Recall Operations
              </h2>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Read batches
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
                    Create incident
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Lifecycle management
                  </span>

                  <strong className="text-gray-400">
                    Not enabled
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Recall export
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
              placeholder="Search lot number, product or SKU..."
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
                  Flagged Inventory Batches
                </h2>

                <p className="text-[11px] text-gray-500">
                  Read-only recall and
                  quarantine state
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
                      Lot
                    </th>

                    <th className="px-4 py-3">
                      Product
                    </th>

                    <th className="px-4 py-3">
                      Variant
                    </th>

                    <th className="px-4 py-3">
                      State
                    </th>

                    <th className="px-4 py-3">
                      Manufactured
                    </th>

                    <th className="px-4 py-3">
                      Received
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
                        Loading flagged
                        batches…
                      </td>
                    </tr>
                  ) : records.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center"
                      >
                        <CheckCircle2
                          size={24}
                          className="mx-auto text-gray-300 mb-2"
                        />

                        <div className="text-xs font-semibold">
                          No flagged batches
                          found
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1">
                          No recalled or
                          quarantined inventory
                          batches match the
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
                            <div className="text-xs font-bold text-gray-900">
                              {
                                record.lot_number
                              }
                            </div>

                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {record.status}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-xs font-semibold text-gray-900">
                              {record.product
                                ?.name ?? "—"}
                            </div>

                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {record.product
                                ?.sku ?? "No SKU"}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {record.variant
                              ?.sku ?? "—"}
                          </td>

                          <td className="px-4 py-3">
                            <BatchState
                              record={record}
                            />
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(
                              record.manufactured_at,
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(
                              record.received_at,
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(
                              record.expires_at,
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

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <ShieldAlert
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Criticality Assessment
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                No authoritative recall
                classification engine exists.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <Clock
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Recall Lifecycle
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                Incident lifecycle workflow is
                not implemented.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <Boxes
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Corrective Actions
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                Corrective-action authority is
                not currently available.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <PackageX
                size={16}
                className="text-gray-400"
              />

              <h3 className="text-xs font-bold mt-3">
                Regulatory Recall Report
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                Regulatory recall reporting is
                not implemented.
              </p>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Recall Readiness">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Readiness Score
              </div>

              <div className="font-bold text-gray-700 mt-1">
                Not Assessed
              </div>

              <p className="text-[10px] text-gray-500 mt-1">
                No recall readiness scoring
                service exists in the current
                backend.
              </p>
            </div>
          </RailSection>

          <RailSection title="Inventory State">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Recalled
                </span>

                <strong>
                  {
                    summary.recalled_batches
                  }
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Quarantined
                </span>

                <strong>
                  {
                    summary.quarantined_batches
                  }
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Dual flag
                </span>

                <strong>
                  {
                    summary.recalled_and_quarantined
                  }
                </strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Control Availability">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Read batches
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
                  Create incident
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Lifecycle
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Report export
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