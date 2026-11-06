"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  FileText,
  RefreshCw,
  ShieldAlert,
  UserRound,
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
  type ComplianceCaseDetail,
  type ComplianceDecisionCommand,
  type ComplianceProfile,
  verificationComplianceApi,
} from "@/lib/api/verificationCompliance";

function formatDateTime(
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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function CapabilityRow({
  label,
  enabled,
  blocked = false,
}: {
  label: string;
  enabled: boolean;
  blocked?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">
        {label}
      </span>

      <strong
        className={
          blocked
            ? "text-amber-700"
            : enabled
              ? "text-green-700"
              : "text-gray-400"
        }
      >
        {blocked
          ? "Blocked"
          : enabled
            ? "Enabled"
            : "Unavailable"}
      </strong>
    </div>
  );
}

export default function ComplianceCaseDetailPage() {
  const params = useParams();

  const caseId =
    typeof params?.caseId === "string"
      ? params.caseId
      : "";

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

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [record, setRecord] =
    useState<ComplianceCaseDetail | null>(
      null,
    );

  const [profile, setProfile] =
    useState<ComplianceProfile | null>(
      null,
    );

  const [reason, setReason] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

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

  const fetchCase =
    useCallback(async () => {
      if (!canView || !caseId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          response,
          normalizedProfile,
        ] = await Promise.all([
          verificationComplianceApi.getComplianceCase(
            caseId,
          ),

          verificationComplianceApi.getComplianceProfile(
            caseId,
          ),
        ]);

        setRecord(
          response.data,
        );

        setCapabilities(
          response.capabilities,
        );

        setProfile(
          normalizedProfile,
        );
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load compliance case:",
          requestError,
        );

        setError(
          requestError.message ||
            "Failed to load compliance case.",
        );

        setRecord(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }, [canView, caseId]);

  useEffect(() => {
    void fetchCase();
  }, [fetchCase]);

  const submitDecision =
    async (
      command: ComplianceDecisionCommand,
    ) => {
      if (!record) {
        return;
      }

      const requiresReason =
        command !== "pass";

      if (
        requiresReason &&
        !reason.trim()
      ) {
        setError(
          "A reason is required for this decision.",
        );

        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        await verificationComplianceApi.decideCase(
          record.id,
          command,
          {
            expected_version:
              record.lock_version,

            reason:
              reason.trim() ||
              undefined,
          },
        );

        setReason("");

        await fetchCase();
      } catch (cause) {
        const requestError =
          cause as Error;

        setError(
          requestError.message ||
            "The compliance decision could not be completed. Reload the case and try again.",
        );
      } finally {
        setSubmitting(false);
      }
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
      label: "Case Ref",
      value:
        record?.case_number ??
        caseId,
    },
  ];

  const passBlocked =
    capabilities.pass &&
    profile?.is_eligible !== true;

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
          permission is required to access
          this case.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <Link
                href="/admin/verification-compliance/cases"
                className="mt-0.5 p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50"
                aria-label="Back to compliance cases"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <div className="text-[11px] text-gray-500 font-medium mb-1">
                  Verification &amp;
                  Compliance / Compliance
                  Cases /{" "}
                  {record?.case_number ??
                    caseId}
                </div>

                <h1 className="text-xl font-bold text-gray-900">
                  Compliance Case Review
                </h1>

                <p className="text-xs text-gray-500 mt-1">
                  Review the authoritative
                  tenant-scoped case,
                  compliance requirements,
                  assignment and governed
                  decision workflow.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchCase()
              }
              disabled={
                loading || submitting
              }
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
            accessNote="Compliance case access is resolved from the authenticated tenant context"
          />

          {error && (
            <div
              role="alert"
              className="my-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-4 bg-white border border-gray-200 rounded-md p-8 text-center text-xs text-gray-500">
              Loading compliance case…
            </div>
          ) : !record ? (
            <div className="mt-4 bg-white border border-gray-200 rounded-md p-8 text-center">
              <ShieldAlert
                size={28}
                className="mx-auto text-gray-300 mb-2"
              />

              <div className="text-sm font-bold text-gray-800">
                Compliance Case Not Found
              </div>

              <p className="text-xs text-gray-500 mt-1">
                The case does not exist in
                the current tenant context
                or is not accessible.
              </p>

              <Link
                href="/admin/verification-compliance/cases"
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-rose-800 hover:text-rose-950"
              >
                <ArrowLeft size={13} />

                Return to Compliance Cases
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
              <section className="xl:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h2 className="text-sm font-bold text-gray-900">
                      Requirement Evaluation
                    </h2>

                    {profile && (
                      <span
                        className={
                          profile.is_eligible
                            ? "text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
                            : "text-[10px] font-bold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                        }
                      >
                        {profile.is_eligible
                          ? "Eligible"
                          : "Blocked"}
                      </span>
                    )}
                  </div>

                  {!profile ? (
                    <p className="text-xs text-gray-500 mt-4">
                      Compliance evaluation
                      is unavailable.
                    </p>
                  ) : profile.requirements
                      .length === 0 ? (
                    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-800">
                        No active
                        requirements currently
                        apply.
                      </p>

                      <p className="text-[10px] text-amber-700 mt-1">
                        PASS remains
                        controlled by the
                        authoritative backend
                        evaluator.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {profile.requirements.map(
                        (
                          requirement,
                        ) => (
                          <div
                            key={
                              requirement.requirement_id
                            }
                            className="py-3 text-xs"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <strong className="text-gray-800">
                                {
                                  requirement.requirement_code
                                }
                              </strong>

                              <span
                                className={
                                  requirement.satisfied
                                    ? "text-green-700 font-semibold"
                                    : "text-rose-700 font-semibold"
                                }
                              >
                                {
                                  requirement.status
                                }
                              </span>
                            </div>

                            <div className="text-gray-500 mt-1">
                              {requirement
                                .reason_codes
                                .length > 0
                                ? requirement.reason_codes.join(
                                    ", ",
                                  )
                                : "Current evidence satisfies this requirement."}
                            </div>

                            {requirement
                              .warnings
                              .length >
                              0 && (
                              <div className="text-amber-700 mt-1">
                                {requirement.warnings.join(
                                  ", ",
                                )}
                              </div>
                            )}

                            {requirement.valid_until && (
                              <div className="text-amber-700 mt-1">
                                Valid until{" "}
                                {formatDateTime(
                                  requirement.valid_until,
                                )}
                              </div>
                            )}

                            <div className="text-[10px] text-gray-400 mt-1">
                              Rule version{" "}
                              {
                                requirement.rule_version
                              }
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {profile && (
                    <div className="mt-3 rounded-md bg-gray-50 border border-gray-100 p-3 text-xs">
                      <div className="font-semibold text-gray-800">
                        {
                          profile.blockers
                            .length
                        }{" "}
                        blocker(s) ·{" "}
                        {
                          profile.warnings
                            .length
                        }{" "}
                        warning(s)
                      </div>

                      {profile.valid_until && (
                        <div className="text-gray-500 mt-1">
                          Evaluation valid
                          until{" "}
                          {formatDateTime(
                            profile.valid_until,
                          )}
                        </div>
                      )}

                      <div className="text-[10px] text-gray-400 mt-1">
                        Policy version:{" "}
                        {profile.policy_version ||
                          "Unavailable"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-5">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FileText
                      size={16}
                      className="text-gray-500"
                    />

                    <h2 className="text-sm font-bold text-gray-900">
                      Case Record
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4 text-xs">
                    <div>
                      <div className="text-gray-500">
                        Case Number
                      </div>

                      <div className="font-semibold mt-1">
                        {
                          record.case_number
                        }
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Case Type
                      </div>

                      <div className="font-semibold mt-1">
                        {record.case_type}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Case Status
                      </div>

                      <div className="font-semibold mt-1">
                        {record.status}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Compliance Status
                      </div>

                      <div className="font-semibold mt-1">
                        {
                          record.compliance_status
                        }
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Subject Type
                      </div>

                      <div className="font-semibold mt-1">
                        {record.subject
                          ?.type ?? "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Subject ID
                      </div>

                      <div className="font-semibold mt-1">
                        {record.subject
                          ?.id ?? "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Workflow Version
                      </div>

                      <div className="font-semibold mt-1">
                        {
                          record.lock_version
                        }
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Created
                      </div>

                      <div className="font-semibold mt-1">
                        {formatDateTime(
                          record.created_at,
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Updated
                      </div>

                      <div className="font-semibold mt-1">
                        {formatDateTime(
                          record.updated_at,
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-5">
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                    Compliance Rule
                  </h2>

                  {record.compliance_rule ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                      <div>
                        <div className="text-gray-500">
                          Rule Name
                        </div>

                        <div className="font-semibold mt-1">
                          {record
                            .compliance_rule
                            .name ?? "—"}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500">
                          Rule Key
                        </div>

                        <div className="font-semibold mt-1">
                          {record
                            .compliance_rule
                            .rule_key ?? "—"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-4">
                      No compliance rule is
                      associated with this
                      case.
                    </p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-5">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <UserRound
                      size={16}
                      className="text-gray-500"
                    />

                    <h2 className="text-sm font-bold text-gray-900">
                      Assignment
                    </h2>
                  </div>

                  {record.assignee ? (
                    <div className="mt-4 text-xs space-y-1">
                      <div className="font-semibold">
                        {
                          record.assignee
                            .name
                        }
                      </div>

                      <div className="text-gray-500">
                        {
                          record.assignee
                            .email
                        }
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-4">
                      This case is currently
                      unassigned.
                    </p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-5">
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                    Case Notes
                  </h2>

                  {record.notes.length ===
                  0 ? (
                    <p className="text-xs text-gray-500 mt-4">
                      No case notes are
                      available.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 mt-2">
                      {record.notes.map(
                        (note) => (
                          <div
                            key={note.id}
                            className="py-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="text-xs font-semibold text-gray-800">
                                {note.user
                                  ?.name ??
                                  "System / Unknown User"}
                              </div>

                              <div className="text-[10px] text-gray-500">
                                {formatDateTime(
                                  note.created_at,
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-gray-700 whitespace-pre-wrap">
                              {note.note}
                            </p>

                            {note.is_internal && (
                              <span className="inline-flex mt-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                                Internal note
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                  <h2 className="text-[13px] font-bold text-gray-900">
                    Case Controls
                  </h2>

                  <p className="text-[10px] text-gray-500 mt-1">
                    All decisions are
                    tenant-scoped,
                    permission-controlled and
                    protected by workflow
                    version checks.
                  </p>

                  <div className="space-y-3 mt-4 text-xs">
                    <textarea
                      aria-label="Decision reason"
                      value={reason}
                      onChange={(event) =>
                        setReason(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Reason required for request changes, fail or escalate"
                      className="w-full rounded-md border border-gray-200 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                      rows={3}
                      disabled={submitting}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {capabilities.request_changes && (
                        <button
                          type="button"
                          disabled={
                            submitting
                          }
                          onClick={() =>
                            void submitDecision(
                              "request_changes",
                            )
                          }
                          className="rounded-md border border-gray-200 bg-white px-2 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                      )}

                      {capabilities.pass && (
                        <button
                          type="button"
                          disabled={
                            submitting ||
                            !profile?.is_eligible
                          }
                          onClick={() =>
                            void submitDecision(
                              "pass",
                            )
                          }
                          className="rounded-md bg-green-700 px-2 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                        >
                          Pass
                        </button>
                      )}

                      {capabilities.fail && (
                        <button
                          type="button"
                          disabled={
                            submitting
                          }
                          onClick={() =>
                            void submitDecision(
                              "fail",
                            )
                          }
                          className="rounded-md bg-rose-700 px-2 py-2 font-semibold text-white hover:bg-rose-800 disabled:opacity-50"
                        >
                          Fail
                        </button>
                      )}

                      {capabilities.escalate_case && (
                        <button
                          type="button"
                          disabled={
                            submitting
                          }
                          onClick={() =>
                            void submitDecision(
                              "escalate",
                            )
                          }
                          className="rounded-md border border-gray-200 bg-white px-2 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
                        >
                          Escalate
                        </button>
                      )}
                    </div>

                    {passBlocked && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
                        Pass is currently
                        blocked by the
                        authoritative
                        compliance evaluation.
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <CapabilityRow
                        label="View case"
                        enabled={
                          capabilities.read
                        }
                      />

                      <CapabilityRow
                        label="Request changes"
                        enabled={
                          capabilities.request_changes
                        }
                      />

                      <CapabilityRow
                        label="Pass"
                        enabled={
                          capabilities.pass &&
                          profile?.is_eligible ===
                            true
                        }
                        blocked={
                          passBlocked
                        }
                      />

                      <CapabilityRow
                        label="Fail"
                        enabled={
                          capabilities.fail
                        }
                      />

                      <CapabilityRow
                        label="Escalate"
                        enabled={
                          capabilities.escalate_case
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                  <div className="flex items-center gap-2">
                    <Clock
                      size={14}
                      className="text-gray-400"
                    />

                    <h2 className="text-[13px] font-bold text-gray-900">
                      Investigation Status
                    </h2>
                  </div>

                  <div className="mt-4 text-xs space-y-3">
                    <div>
                      <div className="text-gray-500">
                        Compliance
                        evaluation
                      </div>

                      <div
                        className={
                          profile?.is_eligible
                            ? "font-bold text-green-700 mt-1"
                            : "font-bold text-rose-700 mt-1"
                        }
                      >
                        {profile
                          ? profile.is_eligible
                            ? "Eligible"
                            : "Blocked"
                          : "Unavailable"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Blockers
                      </div>

                      <div className="font-bold text-gray-700 mt-1">
                        {profile
                          ? profile.blockers
                              .length
                          : "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Warnings
                      </div>

                      <div className="font-bold text-gray-700 mt-1">
                        {profile
                          ? profile.warnings
                              .length
                          : "—"}
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500">
                      Eligibility is computed
                      by the authoritative
                      compliance evaluator.
                      The screen does not
                      calculate or override
                      compliance state.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>

        <RightIntelligenceRail>
          <RailSection title="Case Status">
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-gray-500">
                  Current case state
                </div>

                <div className="font-bold mt-1">
                  {record?.status ??
                    "Unavailable"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">
                  Compliance state
                </div>

                <div className="font-bold mt-1">
                  {record?.compliance_status ??
                    "Unavailable"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">
                  Workflow version
                </div>

                <div className="font-bold mt-1">
                  {record?.lock_version ??
                    "Unavailable"}
                </div>
              </div>
            </div>
          </RailSection>

          <RailSection title="Workflow Availability">
            <div className="space-y-3 text-xs">
              <CapabilityRow
                label="Request changes"
                enabled={
                  capabilities.request_changes
                }
              />

              <CapabilityRow
                label="Pass"
                enabled={
                  capabilities.pass &&
                  profile?.is_eligible ===
                    true
                }
                blocked={passBlocked}
              />

              <CapabilityRow
                label="Fail"
                enabled={capabilities.fail}
              />

              <CapabilityRow
                label="Escalation"
                enabled={
                  capabilities.escalate_case
                }
              />
            </div>
          </RailSection>

          <RailSection title="Evaluation">
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-gray-500">
                  Eligibility
                </div>

                <div
                  className={
                    profile?.is_eligible
                      ? "font-bold text-green-700 mt-1"
                      : "font-bold text-rose-700 mt-1"
                  }
                >
                  {profile
                    ? profile.is_eligible
                      ? "Eligible"
                      : "Blocked"
                    : "Unavailable"}
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Blockers
                </span>

                <strong>
                  {profile
                    ? profile.blockers
                        .length
                    : "—"}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Warnings
                </span>

                <strong>
                  {profile
                    ? profile.warnings
                        .length
                    : "—"}
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}