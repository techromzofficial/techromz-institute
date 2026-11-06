"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  MessageSquareText,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { ReasonModal } from "@/components/admin/common/ReasonModal";
import { WorkflowTimeline } from "@/components/admin/common/WorkflowTimeline";
import { LoadingSkeleton } from "@/components/admin/common/States";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";

import {
  catalogueApi,
  decideApproval,
} from "@/features/admin/catalogue/api/catalogueApi";

import type {
  ApprovalDecision,
  ApprovalDetail,
} from "@/features/admin/catalogue/contracts/catalogueContracts";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

import {
  CatalogueError,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

const labels: Partial<
  Record<ApprovalDecision, string>
> = {
  approve: "Approve",
  reject: "Reject",
  request_information: "Request information",
  suspend: "Suspend",
};

const tabs = [
  {
    id: "review",
    label: "Review",
  },
  {
    id: "workflow",
    label: "Workflow History",
  },
  {
    id: "audit",
    label: "Audit Events",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProductApprovalDetailPage(props: any) {
  const routeParams = useParams<{ productId: string }>();
  const params = props?.params ?? routeParams;
  const [data, setData] =
    useState<ApprovalDetail | null>(null);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [decision, setDecision] =
    useState<ApprovalDecision | null>(null);

  const [notice, setNotice] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<TabId>("review");

  const load = useCallback(async () => {
    try {
      const approval =
        await catalogueApi.getApproval(
          params.productId
        );

      setData(approval);
      setError(null);
    } catch (reason) {
      setError(reason as LiveApiError);
    }
  }, [params.productId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(reason: string) {
    if (!data || !decision) {
      return;
    }

    try {
      const fresh = await decideApproval(
        data.id,
        {
          decision,
          reason,
          expectedUpdatedAt:
            data.product.updatedAt ?? "",
        }
      );

      setData(fresh);

      setNotice(
        "Decision persisted and authoritative state refreshed."
      );

      setError(null);
    } catch (reason) {
      const problem =
        reason as LiveApiError;

      setError(problem);

      if (problem.status === 409) {
        await load();
      }

      throw reason;
    }
  }

  const availableDecisionCount =
    useMemo(() => {
      if (!data) {
        return 0;
      }

      return (
        Object.keys(labels) as ApprovalDecision[]
      ).filter(
        (action) =>
          data.capabilities[action]
      ).length;
    }, [data]);

  return (
    <PermissionGuard
      permission={
        CATALOGUE_PERMISSIONS.productsView
      }
      fallback={
        <CatalogueError
          error={Object.assign(
            new Error(
              "Permission required"
            ),
            {
              status: 403,
            }
          )}
        />
      }
    >
      {!data && !error && (
        <LoadingSkeleton />
      )}

      {error && (
        <CatalogueError
          error={error}
          notFound="Approval record not found"
        />
      )}

      {data && (
        <div className="flex flex-col gap-4 p-6">
          {/* HEADER */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
              Catalogue
              <span className="mx-2 text-gray-300">
                /
              </span>
              Product Approvals
              <span className="mx-2 text-gray-300">
                /
              </span>
              <span className="text-gray-800">
                {data.id}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <Link
                  href="/admin/catalogue/product-approvals"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 hover:text-[#741d35]"
                >
                  <ArrowLeft size={13} />
                  Back to Product Approvals
                </Link>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900">
                    {data.product.name}
                  </h1>

                  <StatusBadge
                    status={data.state}
                  />
                </div>

                <p className="text-[11px] text-gray-500 mt-1">
                  Product Approval Review ·{" "}
                  {data.product.sku ??
                    data.id}
                </p>
              </div>
            </div>
          </div>

          {/* SUMMARY STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <ApprovalMetric
              icon={
                <ShieldCheck size={16} />
              }
              label="Approval State"
              value={data.state}
            />

            <ApprovalMetric
              icon={
                <AlertTriangle size={16} />
              }
              label="Blocking Issues"
              value={String(
                data.blockers.length
              )}
            />

            <ApprovalMetric
              icon={<History size={16} />}
              label="Workflow Events"
              value={String(
                data.history.length
              )}
            />

            <ApprovalMetric
              icon={<Clock3 size={16} />}
              label="Available Decisions"
              value={String(
                availableDecisionCount
              )}
            />
          </div>

          {/* TABS */}
          <div className="bg-white border border-gray-200 rounded px-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`relative px-3 py-3 text-[11px] font-bold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-[#741d35] bg-[#f8eef1]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}

                  {activeTab ===
                    tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#741d35]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {notice && (
            <div
              role="status"
              className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-semibold text-emerald-700"
            >
              {notice}
            </div>
          )}

          {/* REVIEW TAB */}
          {activeTab === "review" && (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
              <div className="flex flex-col gap-4">
                {/* PRODUCT SUMMARY */}
                <section className="bg-white border border-gray-200 rounded shadow-2xs">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">
                      Product Review Summary
                    </h2>

                    <p className="text-[10.5px] text-gray-500 mt-0.5">
                      Authoritative product
                      information used for this
                      approval decision.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0">
                    <ReviewFact
                      label="Product"
                      value={
                        data.product.name
                      }
                    />

                    <ReviewFact
                      label="SKU"
                      value={
                        data.product.sku ??
                        "Unavailable"
                      }
                    />

                    <ReviewFact
                      label="Category"
                      value={
                        data.product.category
                          ?.name ??
                        "Unavailable"
                      }
                    />

                    <ReviewFact
                      label="Supplier"
                      value={
                        data.product
                          .supplierSummary
                          ?.name ??
                        "Unavailable"
                      }
                      hint="Read-only"
                    />
                  </div>
                </section>

                {/* READINESS */}
                <section className="bg-white border border-gray-200 rounded shadow-2xs">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">
                      Approval Readiness
                    </h2>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Product completeness
                        </span>

                        <strong className="block text-lg font-black text-gray-900 mt-1">
                          {data.product
                            .completeness
                            ?.percentage ===
                          undefined
                            ? "Unavailable"
                            : `${data.product.completeness.percentage}%`}
                        </strong>
                      </div>

                      <StatusBadge
                        status={data.state}
                      />
                    </div>

                    {data.product
                      .completeness
                      ?.percentage !==
                      undefined && (
                      <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#741d35]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                data.product
                                  .completeness
                                  ?.percentage ??
                                  0
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* BLOCKERS */}
                <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        Blocking Issues
                      </h2>

                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        Backend-reported
                        conditions affecting the
                        approval.
                      </p>
                    </div>

                    <span className="min-w-7 h-7 px-2 inline-flex items-center justify-center rounded-full bg-gray-100 text-[10.5px] font-bold text-gray-700">
                      {data.blockers.length}
                    </span>
                  </div>

                  {data.blockers.length ? (
                    <div className="divide-y divide-gray-100">
                      {data.blockers.map(
                        (blocker, index) => (
                          <div
                            key={`${blocker}-${index}`}
                            className="flex items-start gap-3 p-4"
                          >
                            <div className="mt-0.5 text-amber-600">
                              <AlertTriangle
                                size={15}
                              />
                            </div>

                            <div>
                              <span className="block text-[9.5px] uppercase tracking-wide font-bold text-amber-700">
                                Blocking issue
                              </span>

                              <p className="text-[11.5px] text-gray-800 mt-1">
                                {blocker}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-5">
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600"
                      />

                      <div>
                        <p className="text-[11.5px] font-bold text-gray-900">
                          No blocking issues
                        </p>

                        <p className="text-[10.5px] text-gray-500 mt-0.5">
                          The current approval
                          payload reports no
                          blockers.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* LATEST WORKFLOW */}
                <section className="bg-white border border-gray-200 rounded shadow-2xs">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">
                      Workflow History
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "workflow"
                        )
                      }
                      className="text-[10.5px] font-bold text-[#741d35] hover:underline"
                    >
                      View full history
                    </button>
                  </div>

                  <div className="p-4">
                    {data.history.length ? (
                      <WorkflowTimeline
                        items={data.history
                          .slice(0, 4)
                          .map(
                            (item) =>
                              `${
                                item.state
                              } · ${
                                item.actorName ??
                                "Administrator"
                              }${
                                item.reason
                                  ? ` · ${item.reason}`
                                  : ""
                              }`
                          )}
                      />
                    ) : (
                      <p className="text-[11px] text-gray-500">
                        No CAT-04 decisions
                        recorded.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* DECISION SIDEBAR */}
              <aside className="bg-white border border-gray-200 rounded shadow-2xs xl:sticky xl:top-4 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={15}
                      className="text-[#741d35]"
                    />

                    <h2 className="text-sm font-bold text-gray-900">
                      Approval Decision
                    </h2>
                  </div>

                  <p className="text-[10.5px] text-gray-500 mt-1">
                    Available transitions are
                    determined by the backend.
                  </p>
                </div>

                <div className="p-4 space-y-2">
                  {(
                    Object.keys(
                      labels
                    ) as ApprovalDecision[]
                  ).map((action) => (
                    <DecisionButton
                      key={action}
                      action={action}
                      label={
                        labels[action] ??
                        action
                      }
                      enabled={
                        Boolean(
                          data.capabilities[
                            action
                          ]
                        )
                      }
                      onClick={() =>
                        setDecision(action)
                      }
                    />
                  ))}
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[10px] leading-relaxed text-gray-500">
                    Every decision requires a
                    reason. The persisted state
                    and append-only audit
                    history are authoritative.
                  </p>
                </div>
              </aside>
            </div>
          )}

          {/* WORKFLOW TAB */}
          {activeTab === "workflow" && (
            <section className="bg-white border border-gray-200 rounded shadow-2xs">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">
                  Authoritative Workflow
                  History
                </h2>

                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  Persisted CAT-04 approval
                  decisions.
                </p>
              </div>

              <div className="p-4">
                {data.history.length ? (
                  <WorkflowTimeline
                    items={data.history.map(
                      (item) =>
                        `${item.state} · ${
                          item.actorName ??
                          "Administrator"
                        }${
                          item.reason
                            ? ` · ${item.reason}`
                            : ""
                        }`
                    )}
                  />
                ) : (
                  <div className="py-8 text-center">
                    <History
                      size={22}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-2 text-[11.5px] font-semibold text-gray-700">
                      No workflow history
                    </p>

                    <p className="text-[10.5px] text-gray-500 mt-1">
                      No CAT-04 decisions
                      have been recorded.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* AUDIT TAB */}
          {activeTab === "audit" && (
            <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">
                  General Catalogue Audit
                  Events
                </h2>

                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  General Catalogue audit
                  activity related to this
                  approval record.
                </p>
              </div>

              {data.auditEvents.length ? (
                <div className="divide-y divide-gray-100">
                  {data.auditEvents.map(
                    (event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                          <FileText
                            size={14}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11.5px] font-semibold text-gray-800">
                            {event.action}
                          </p>

                          <p className="text-[9.5px] text-gray-400 mt-0.5">
                            Audit Event{" "}
                            {event.id}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText
                    size={22}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-2 text-[11.5px] font-semibold text-gray-700">
                    No audit events
                  </p>

                  <p className="text-[10.5px] text-gray-500 mt-1">
                    No general Catalogue
                    audit events were returned.
                  </p>
                </div>
              )}
            </section>
          )}

          <ReasonModal
            open={decision !== null}
            record="product approval"
            action={
              decision
                ? labels[decision] ??
                  decision
                : ""
            }
            resultingStatus="Backend controlled"
            impact="The persisted state and append-only audit history will be updated."
            onClose={() =>
              setDecision(null)
            }
            onSubmit={submit}
          />
        </div>
      )}
    </PermissionGuard>
  );
}

function ApprovalMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="text-[#741d35]">
          {icon}
        </div>

        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Live
        </span>
      </div>

      <div className="mt-3">
        <span className="block text-[10px] font-semibold text-gray-500">
          {label}
        </span>

        <strong className="block text-lg font-black text-gray-900 mt-0.5 capitalize">
          {value}
        </strong>
      </div>
    </div>
  );
}

function ReviewFact({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 last:border-r-0">
      <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span className="block text-[11.5px] font-bold text-gray-900 mt-1.5">
        {value}
      </span>

      {hint && (
        <span className="block text-[9.5px] text-[#741d35] font-semibold mt-1">
          {hint}
        </span>
      )}
    </div>
  );
}

function DecisionButton({
  action,
  label,
  enabled,
  onClick,
}: {
  action: ApprovalDecision;
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  const icon =
    action === "approve" ? (
      <CheckCircle2 size={14} />
    ) : action === "reject" ? (
      <XCircle size={14} />
    ) : action ===
      "request_information" ? (
      <MessageSquareText size={14} />
    ) : (
      <Ban size={14} />
    );

  const enabledClass =
    action === "approve"
      ? "border-[#741d35] bg-[#741d35] text-white hover:bg-[#5c172a]"
      : action === "reject"
      ? "border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50";

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={`w-full min-h-9 px-3 rounded border inline-flex items-center justify-center gap-2 text-[10.5px] font-bold transition-colors ${
        enabled
          ? enabledClass
          : "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
