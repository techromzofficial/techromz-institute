import { getModuleDetailFixture } from "@/mocks/admin/ecosystemModuleDetail.mock";
import type {
  AuditHistoryEntry,
  EcosystemModuleDetail,
  ModuleDetailPermissions,
  ProductionEnablementDraft,
  ScheduleReleaseDraft,
} from "@/features/admin/ecosystem-modules/types";

function nowStamp() {
  return new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).replace(",", " \u2014");
}

function pushAudit(detail: EcosystemModuleDetail, action: string, actor: string, entryDetail: string): AuditHistoryEntry {
  const entry: AuditHistoryEntry = { id: `audit-${Date.now()}`, timestamp: nowStamp(), actor, action, detail: entryDetail };
  detail.auditHistory = [entry, ...detail.auditHistory];
  return entry;
}

export async function fetchEcosystemModuleDetail(moduleKey: string): Promise<EcosystemModuleDetail | null> {
  return getModuleDetailFixture(moduleKey);
}

export function getModuleDetailPermissions(readOnly = false): ModuleDetailPermissions {
  return {
    canManageConfiguration: !readOnly,
    canRequestReview: !readOnly,
    canScheduleRelease: !readOnly,
    canRequestProductionEnablement: !readOnly,
    canSuspend: !readOnly,
    canRetire: !readOnly,
  };
}

const CURRENT_USER = "Elena Vance";

export async function requestProductionEnablement(
  moduleKey: string,
  draft: ProductionEnablementDraft,
): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");

  const missing: string[] = [];
  if (!draft.reason.trim()) missing.push("a reason for the audit record");
  if (!draft.evidenceLink.trim()) missing.push("a link to supporting evidence");
  if (!draft.securityApproved) missing.push("confirmed security review approval");
  if (!draft.complianceApproved) missing.push("confirmed compliance review approval");
  if (!draft.pilotMetricsReviewed) missing.push("confirmed pilot metrics review");
  if (missing.length) {
    throw new Error(`Request blocked \u2014 still missing: ${missing.join(", ")}.`);
  }

  detail.productionEnablementStatus = "Pending Approval";
  return pushAudit(
    detail,
    "Production enablement requested",
    CURRENT_USER,
    `${draft.reason.trim()} Evidence: ${draft.evidenceLink.trim()}. Awaiting final sign-off \u2014 production is not enabled by this request alone.`,
  );
}

export async function scheduleRelease(moduleKey: string, draft: ScheduleReleaseDraft): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  if (!draft.reason.trim()) throw new Error("A reason is required for the audit record.");
  if (!draft.version.trim()) throw new Error("A target version is required.");
  if (!draft.scheduledDate.trim()) throw new Error("A scheduled release date is required.");

  detail.versionsReleases = [
    { id: `release-${Date.now()}`, version: draft.version.trim(), releaseType: "Candidate", status: "Scheduled", releasedOn: draft.scheduledDate, releasedBy: CURRENT_USER, notes: draft.reason.trim() },
    ...detail.versionsReleases,
  ];
  detail.releaseSummary = { ...detail.releaseSummary, targetVersion: draft.version.trim(), targetDate: draft.scheduledDate, approvalStatus: "Pending" };
  return pushAudit(detail, "Release scheduled", CURRENT_USER, `${draft.version.trim()} scheduled for ${draft.scheduledDate}. ${draft.reason.trim()}`);
}

export async function suspendModule(moduleKey: string, reason: string): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  if (!reason.trim()) throw new Error("A reason is required for the audit record.");

  detail.suspensionStatus = "Suspension Pending";
  return pushAudit(detail, "Suspension requested", CURRENT_USER, `${reason.trim()} Module remains operational until suspension review is complete.`);
}

export async function retireModule(moduleKey: string, reason: string): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  if (!reason.trim()) throw new Error("A reason is required for the audit record.");

  detail.retirementStatus = "Retirement Pending";
  return pushAudit(detail, "Retirement requested", CURRENT_USER, `${reason.trim()} Module remains active until the retirement plan is approved.`);
}

export async function requestModuleReview(moduleKey: string, kind: "security" | "compliance", reason: string): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  if (!reason.trim()) throw new Error("A reason is required for the audit record.");

  if (kind === "security") {
    detail.statusDomains = detail.statusDomains.map((field) => (field.key === "security" ? { ...field, value: "Review Pending", tone: "warning" } : field));
    detail.complianceDetail = { ...detail.complianceDetail, securityReviewStatus: "Review Pending" };
  } else {
    detail.statusDomains = detail.statusDomains.map((field) => (field.key === "compliance" ? { ...field, value: "Pending Review", tone: "warning" } : field));
  }
  return pushAudit(detail, `${kind === "security" ? "Security" : "Compliance"} review requested`, CURRENT_USER, reason.trim());
}

export async function rotateSecret(moduleKey: string, parameterId: string, reason: string): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  if (!reason.trim()) throw new Error("A reason is required for the audit record.");

  const dateOnly = nowStamp().split(" \u2014")[0];
  detail.configParameters = detail.configParameters.map((row) =>
    row.id === parameterId ? { ...row, lastUpdated: dateOnly, updatedBy: "Secrets manager", validationStatus: "Pass" } : row,
  );
  return pushAudit(detail, "Secret rotated", CURRENT_USER, `${reason.trim()} The secret value itself is never shown or stored in the frontend.`);
}

export async function updateFeatureFlagRollout(moduleKey: string, flagId: string, rollout: number, reason: string): Promise<AuditHistoryEntry> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  if (!reason.trim()) throw new Error("A reason is required for the audit record.");
  if (rollout < 0 || rollout > 100) throw new Error("Rollout must be between 0 and 100.");

  const dateOnly = nowStamp().split(" \u2014")[0];
  let flagKey = "";
  detail.featureFlags = detail.featureFlags.map((row) => {
    if (row.id !== flagId) return row;
    flagKey = row.flagKey;
    return { ...row, rollout, updatedAt: dateOnly };
  });
  return pushAudit(detail, "Feature flag updated", CURRENT_USER, `${flagKey} rollout set to ${rollout}%. ${reason.trim()}`);
}

export async function exportModuleRecord(moduleKey: string): Promise<string> {
  const detail = getModuleDetailFixture(moduleKey);
  if (!detail) throw new Error("This module could not be found.");
  const headers = ["Field", "Value"];
  const rows: [string, string][] = [
    ["Public reference", detail.module.publicReference],
    ["Database module ID", String(detail.module.databaseModuleId)],
    ["Module key", detail.module.moduleKey],
    ["Module name", detail.module.moduleName],
    ...detail.statusDomains.map((field): [string, string] => [field.label, field.value]),
    ...detail.overviewMetrics.map((metric): [string, string] => [metric.label, metric.value]),
  ];
  return [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))].join("\n");
}

