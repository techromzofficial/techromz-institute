"use client";

import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Flag as FlagIcon,
  GitCompare,
  Globe2,
  HeartPulse,
  History,
  Lock,
  Network,
  PauseCircle,
  Plug,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  SearchX,
  Star,
  Trash2,
  X,
} from "lucide-react";
import shared from "../ecosystem-modules.module.css";
import styles from "./moduleDetail.module.css";
import { ErrorState, LoadingSkeleton, PermissionDeniedState } from "@/components/admin/common/States";
import { sanitizeInternalRedirect } from "@/lib/authRedirect";
import {
  exportModuleRecord,
  fetchEcosystemModuleDetail,
  getModuleDetailPermissions,
} from "@/services/api/ecosystemModuleDetail";
import { DETAIL_TABS } from "../types";
import type {
  AuditHistoryEntry,
  ConfigParameterRow,
  DetailTabKey,
  EcosystemModuleDetail as ModuleDetailType,
  FeatureFlagRow,
} from "../types";
import { StatusPill } from "./shared";
import { OverviewTab } from "./OverviewTab";
import { ConfigurationTab, EnvironmentsTab, VersionsTab } from "./ConfigurationTabs";
import { DependenciesTab, FeatureFlagsTab, IntegrationsTab } from "./IntegrationTabs";
import { AccessRolesTab, CompliancePrivacyTab, CountryAvailabilityTab, SecurityTab } from "./ComplianceTabs";
import { AdoptionTab, AlertsTab, AuditHistoryTab, HealthPerformanceTab } from "./OperationsTabs";
import {
  EditFeatureFlagModal,
  ProductionEnablementModal,
  RetireModuleModal,
  ReviewRequestModal,
  RotateSecretModal,
  ScheduleReleaseModal,
  SuspendModuleModal,
} from "./ActionModals";

type ModalState =
  | { kind: "none" }
  | { kind: "production-enablement" }
  | { kind: "schedule-release" }
  | { kind: "suspend" }
  | { kind: "retire" }
  | { kind: "review"; reviewKind: "security" | "compliance" }
  | { kind: "edit-flag"; flag: FeatureFlagRow }
  | { kind: "rotate-secret"; parameter: ConfigParameterRow }
  | { kind: "info"; title: string; body: string };

export function ModuleDetailWorkspace({ moduleKey }: { moduleKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [detail, setDetail] = useState<ModuleDetailType | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [notice, setNotice] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  const screenState = searchParams.get("state") ?? "";
  const readOnly = searchParams.get("access") === "read-only";
  const activeTab = (searchParams.get("tab") as DetailTabKey) || "overview";
  const returnTo = sanitizeInternalRedirect(
    searchParams.get("returnTo"),
    "/admin/ecosystem-modules",
  );
  const permissions = getModuleDetailPermissions(readOnly);

  const updateQuery = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParamsString);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      });
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [searchParamsString, pathname, router],
  );

  useEffect(() => {
    let cancelled = false;
    setDetail(undefined);
    fetchEcosystemModuleDetail(moduleKey).then((result) => {
      if (!cancelled) setDetail(result);
    });
    return () => {
      cancelled = true;
    };
  }, [moduleKey, refreshKey]);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick() {
      setMoreOpen(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [moreOpen]);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  function handleSuccess(_entry: AuditHistoryEntry, message: string) {
    setModal({ kind: "none" });
    setNotice(message);
    refresh();
  }

  async function handleExport() {
    if (!detail) return;
    const csv = await exportModuleRecord(moduleKey);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${detail.module.moduleKey}-module-record.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Module record exported.");
  }

  if (screenState === "unauthorized") return <PermissionDeniedState />;

  const forcedNotFound = screenState === "not-found";

  return (
    <div className={styles.workspace}>
      <div className={styles.breadcrumbRow}>
        <Link href={returnTo} className={styles.backLink}>
          <ArrowLeft size={13} /> Back to Ecosystem Modules
        </Link>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/admin/ecosystem-modules">Ecosystem Modules</Link>
          <ChevronRight size={11} />
          <span>Module Management</span>
          <ChevronRight size={11} />
          <strong>{detail ? detail.module.moduleName : "Module"}</strong>
        </nav>
      </div>

      {detail === undefined ? (
        <LoadingSkeleton />
      ) : screenState === "error" ? (
        <ErrorState message="Module details could not be loaded from the ecosystem module service. Try again in a moment." />
      ) : detail === null || forcedNotFound ? (
        <div className={styles.notFound}>
          <SearchX size={36} color="#9aa1ab" />
          <h2>Module not found</h2>
          <p>We couldn&apos;t find a module matching &ldquo;{moduleKey}&rdquo;. It may have been removed, renamed, or the link may be out of date.</p>
          <Link href={returnTo} className={shared.primaryButton}>Return to Ecosystem Modules</Link>
        </div>
      ) : (
        <ModuleDetailContent
          detail={detail}
          activeTab={activeTab}
          permissions={permissions}
          readOnly={readOnly}
          screenState={screenState}
          notice={notice}
          moreOpen={moreOpen}
          onDismissNotice={() => setNotice("")}
          onRefresh={refresh}
          onNavigateTab={(tab) => updateQuery({ tab })}
          onToggleMore={(event) => {
            event.stopPropagation();
            setMoreOpen((open) => !open);
          }}
          onExport={() => void handleExport()}
          onOpenModal={setModal}
        />
      )}

      {modal.kind === "production-enablement" && (
        <ProductionEnablementModal moduleKey={moduleKey} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "schedule-release" && detail && (
        <ScheduleReleaseModal moduleKey={moduleKey} targetVersion={detail.currentRelease.targetVersion} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "suspend" && detail && (
        <SuspendModuleModal moduleKey={moduleKey} moduleName={detail.module.moduleName} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "retire" && detail && (
        <RetireModuleModal moduleKey={moduleKey} moduleName={detail.module.moduleName} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "review" && (
        <ReviewRequestModal moduleKey={moduleKey} kind={modal.reviewKind} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "edit-flag" && (
        <EditFeatureFlagModal moduleKey={moduleKey} flag={modal.flag} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "rotate-secret" && (
        <RotateSecretModal moduleKey={moduleKey} parameter={modal.parameter} onClose={() => setModal({ kind: "none" })} onSuccess={handleSuccess} />
      )}
      {modal.kind === "info" && (
        <div className={shared.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModal({ kind: "none" })}>
          <div className={`${shared.modal} ${shared.standardDialog}`}>
            <div className={shared.modalHeader}>
              <h2>{modal.title}</h2>
              <button className={shared.iconButton} type="button" onClick={() => setModal({ kind: "none" })} aria-label="Close dialog"><X size={18} /></button>
            </div>
            <div className={shared.dialogBody}>{modal.body}</div>
            <div className={shared.modalActions}>
              <button className={shared.primaryButton} type="button" onClick={() => setModal({ kind: "none" })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleDetailContent({
  detail,
  activeTab,
  permissions,
  readOnly,
  screenState,
  notice,
  moreOpen,
  onDismissNotice,
  onRefresh,
  onNavigateTab,
  onToggleMore,
  onExport,
  onOpenModal,
}: {
  detail: ModuleDetailType;
  activeTab: DetailTabKey;
  permissions: ReturnType<typeof getModuleDetailPermissions>;
  readOnly: boolean;
  screenState: string;
  notice: string;
  moreOpen: boolean;
  onDismissNotice: () => void;
  onRefresh: () => void;
  onNavigateTab: (tab: DetailTabKey) => void;
  onToggleMore: (event: ReactMouseEvent) => void;
  onExport: () => void;
  onOpenModal: (modal: ModalState) => void;
}) {
  const { module, governance, currentRelease } = detail;

  function info(title: string, body: string) {
    onOpenModal({ kind: "info", title, body });
  }

  return (
    <>
      {readOnly && (
        <div className={shared.staleNotice}>
          <Lock size={14} /> You have read-only access to this module. Controlled actions are disabled.
        </div>
      )}
      {screenState === "stale" && (
        <div className={shared.staleNotice}>
          <AlertTriangle size={14} /> This module&apos;s data may be stale — last refreshed at {module.lastUpdated}.
          <button type="button" onClick={onRefresh} style={{ marginLeft: "auto", textDecoration: "underline", background: "none", border: 0, color: "inherit", cursor: "pointer" }}>Refresh</button>
        </div>
      )}
      {screenState === "partial" && (
        <div className={shared.staleNotice}>
          <AlertTriangle size={14} /> Some sections could not be loaded from every backing service. Showing the data that is available.
        </div>
      )}
      {notice && (
        <div className={shared.successNotice}>
          <Check size={14} /> {notice}
          <button type="button" onClick={onDismissNotice} style={{ marginLeft: "auto", background: "none", border: 0, color: "inherit", cursor: "pointer" }} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className={styles.headerTop}>
        <div className={styles.titleBlock}>
          <h1>{module.moduleName}</h1>
          <p>{detail.moduleDescription}</p>
        </div>
        <div className={styles.headerActionsStack}>
          <div className={styles.headerActionsRow}>
            <button type="button" className={shared.secondaryButton} onClick={() => info("Compare Versions", "Select two versions from Versions & Releases to compare configuration, health and adoption side by side. Full comparison connects once the backend endpoint is available.")}>
              <GitCompare size={13} /> Compare Versions
            </button>
            <button type="button" className={shared.secondaryButton} onClick={() => onNavigateTab("audit-history")}>
              <History size={13} /> View Audit
            </button>
            <button type="button" className={shared.priorityButton} onClick={() => info("Review Release Readiness", `Release readiness is currently ${detail.overviewMetrics.find((metric) => metric.id === "release-readiness")?.value ?? "-"}. Full readiness review checklist connects once the backend endpoint is available.`)}>
              <ShieldCheck size={13} /> Review Release Readiness
            </button>
          </div>
          <div className={styles.headerActionsRow}>
            <button type="button" className={shared.secondaryButton} onClick={() => onNavigateTab("configuration")}>
              <Settings2 size={13} /> Update Configuration
            </button>
            <button type="button" className={shared.secondaryButton} disabled={!permissions.canRequestReview} onClick={() => onOpenModal({ kind: "review", reviewKind: "security" })}>
              <ShieldAlert size={13} /> Request Security Review
            </button>
            <button type="button" className={shared.secondaryButton} disabled={!permissions.canRequestReview} onClick={() => onOpenModal({ kind: "review", reviewKind: "compliance" })}>
              <ShieldCheck size={13} /> Request Compliance Review
            </button>
            <div className={styles.moreActionsWrap}>
              <button type="button" className={shared.secondaryButton} onClick={onToggleMore}>
                More Actions <ChevronDown size={13} />
              </button>
              {moreOpen && (
                <div className={styles.moreActionsMenu} onMouseDown={(event) => event.stopPropagation()}>
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("dependencies")}><Network size={13} /> Manage Dependencies</button>
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("integrations")}><Plug size={13} /> Manage Integrations</button>
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("feature-flags")}><FlagIcon size={13} /> Manage Feature Flags</button>
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("country-availability")}><Globe2 size={13} /> Manage Countries</button>
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("access-roles")}><Lock size={13} /> Manage Access Roles</button>
                  <div className={styles.moreActionsDivider} />
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("health-performance")}><HeartPulse size={13} /> View Health Events</button>
                  <button type="button" className={styles.moreActionsItem} onClick={onExport}><Download size={13} /> Export Module Record</button>
                  <button type="button" className={styles.moreActionsItem} onClick={() => onNavigateTab("audit-history")}><History size={13} /> View Audit History</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={shared.dashboardLayout}>
      <div className={shared.mainColumn}>

      <div className={styles.identityCard}>
        <div className={styles.identityField}><span>Public Module Reference</span><strong>{module.publicReference}</strong></div>
        <div className={styles.identityField}><span>Database Module ID</span><strong>{module.databaseModuleId}</strong></div>
        <div className={styles.identityField}><span>Module Key</span><strong>{module.moduleKey}</strong></div>
        <div className={styles.identityField}><span>Category</span><strong>{module.category}</strong></div>
        <div className={styles.identityField}><span>Business Owner</span><strong>{governance.businessOwner}</strong></div>
        <div className={styles.identityField}><span>Technical Owner</span><strong>{governance.technicalOwner}</strong></div>
        <div className={styles.identityField}><span>Next Release</span><strong>{currentRelease.nextRelease}</strong></div>
        <div className={styles.identityField}><span>Last Updated</span><strong>{module.lastUpdated}</strong></div>
      </div>

      <div className={styles.statusDomainCard}>
        {detail.statusDomains.map((field) => (
          <div key={field.key} className={styles.statusDomainItem}>
            <span>{field.label}</span>
            <div className={styles.statusDomainValue}><StatusPill value={field.value} tone={field.tone} /></div>
          </div>
        ))}
      </div>

      <nav className={styles.tabsNav} aria-label="Module detail sections">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ""}`}
            aria-current={activeTab === tab.key ? "page" : undefined}
            onClick={() => onNavigateTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.metricsGrid}>
        {detail.overviewMetrics.map((metric) => (
          <div key={metric.id} className={`${styles.metricCard} ${metric.tone === "danger" ? styles.metricDanger : metric.tone === "warning" ? styles.metricWarning : metric.tone === "success" ? styles.metricSuccessText : ""}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </section>

      <div className={styles.lifecycleCard}>
        <div className={styles.lifecycleTrack}>
          {detail.lifecycleStages.map((stage, index) => (
            <div
              key={stage.key}
              className={`${styles.lifecycleStep} ${stage.state === "complete" ? styles.lifecycleStepComplete : stage.state === "current" ? styles.lifecycleStepCurrent : ""}`}
            >
              <span className={styles.lifecycleDot}>{stage.state === "complete" ? <Check size={14} /> : index + 1}</span>
              <span>{stage.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ minHeight: 200 }}>
        {activeTab === "overview" && (
          <OverviewTab
            detail={detail}
            onNavigateTab={onNavigateTab}
            onEditFlag={(flag) => onOpenModal({ kind: "edit-flag", flag })}
            onConfigAction={(parameter) => onOpenModal(parameter.secret ? { kind: "rotate-secret", parameter } : { kind: "edit-flag", flag: { id: parameter.id, flagKey: parameter.configKey, state: "Enabled", audience: "", rollout: 0, approvalStatus: "", expiry: "", updatedAt: "" } })}
          />
        )}
        {activeTab === "configuration" && (
          <ConfigurationTab detail={detail} onConfigAction={(parameter) => onOpenModal(parameter.secret ? { kind: "rotate-secret", parameter } : { kind: "info", title: parameter.configKey, body: `Editing non-secret configuration values updates the audit history immediately. Current value: ${parameter.currentValue}.` })} />
        )}
        {activeTab === "versions" && <VersionsTab detail={detail} onScheduleRelease={() => onOpenModal({ kind: "schedule-release" })} />}
        {activeTab === "environments" && <EnvironmentsTab detail={detail} />}
        {activeTab === "dependencies" && <DependenciesTab detail={detail} />}
        {activeTab === "integrations" && <IntegrationsTab detail={detail} />}
        {activeTab === "feature-flags" && <FeatureFlagsTab detail={detail} onEditFlag={(flag) => onOpenModal({ kind: "edit-flag", flag })} />}
        {activeTab === "country-availability" && <CountryAvailabilityTab detail={detail} onManageCountries={() => onNavigateTab("country-availability")} />}
        {activeTab === "access-roles" && <AccessRolesTab detail={detail} onManageAccess={() => onNavigateTab("access-roles")} />}
        {activeTab === "security" && <SecurityTab detail={detail} onRequestReview={() => onOpenModal({ kind: "review", reviewKind: "security" })} />}
        {activeTab === "compliance-privacy" && <CompliancePrivacyTab detail={detail} />}
        {activeTab === "health-performance" && <HealthPerformanceTab detail={detail} />}
        {activeTab === "adoption" && <AdoptionTab detail={detail} />}
        {activeTab === "alerts" && <AlertsTab detail={detail} />}
        {activeTab === "audit-history" && <AuditHistoryTab detail={detail} />}
      </div>

      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <section className={shared.sideCard}>
          <h2><HeartPulse size={15} /> Module Health</h2>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <strong style={{ fontSize: 22, fontWeight: 800 }}>{module.healthScore}<span style={{ fontSize: 11, color: "#8a919c", fontWeight: 600 }}>/100</span></strong>
            <StatusPill value={module.riskLevel} tone={module.riskLevel === "High" ? "danger" : module.riskLevel === "Medium" ? "warning" : "success"} />
          </div>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Availability</span><strong>{module.availability === null ? "-" : `${module.availability}%`}</strong></div>
            <div className={styles.summaryRow}><span>Error Rate</span><strong className={(module.errorRate ?? 0) > 2 ? shared.dangerText : undefined}>{module.errorRate === null ? "-" : `${module.errorRate}%`}</strong></div>
            <div className={styles.summaryRow}><span>Open Alerts</span><strong className={detail.alerts.length > 0 ? shared.dangerText : shared.successText}>{detail.overviewMetrics.find((m) => m.id === "open-alerts")?.value ?? detail.alerts.length}</strong></div>
            <div className={styles.summaryRow}><span>Blocking Issues</span><strong className={shared.dangerText}>{detail.overviewMetrics.find((m) => m.id === "blocking-issues")?.value ?? "0"}</strong></div>
          </div>
        </section>

        <section className={shared.sideCard}>
          <h2><AlertTriangle size={15} /> Priority Alerts</h2>
          {detail.alerts.length === 0 ? (
            <p style={{ color: "#8a919c", fontSize: 11 }}>No priority alerts right now.</p>
          ) : (
            detail.alerts.slice(0, 4).map((alert) => (
              <button key={alert.id} type="button" className={shared.alertItem} onClick={() => onNavigateTab("alerts")}>
                <AlertTriangle size={12} />
                <span>{alert.message} <em style={{ color: "#8a919c", fontStyle: "normal" }}>— Due: {alert.due}</em></span>
              </button>
            ))
          )}
          <button type="button" className={shared.sideLink} onClick={() => onNavigateTab("alerts")}>View all alerts <ChevronRight size={11} /></button>
        </section>

        <section className={styles.recommendedAction}>
          <h2><Star size={14} /> Recommended Next Action</h2>
          <p>{detail.recommendedAction.message}</p>
          <div className={styles.recommendedMeta}>
            <div><span>Owner</span><strong>{detail.recommendedAction.owner}</strong></div>
            <div><span>Due</span><strong>{detail.recommendedAction.due}</strong></div>
          </div>
        </section>

        <section className={shared.sideCard}>
          <h2><Boxes size={15} /> Release Summary</h2>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Current Version</span><strong>{detail.releaseSummary.currentVersion}</strong></div>
            <div className={styles.summaryRow}><span>Target Version</span><strong>{detail.releaseSummary.targetVersion}</strong></div>
            <div className={styles.summaryRow}><span>Release Status</span><StatusPill value={detail.releaseSummary.releaseStatus} tone={detail.statusDomains.find((f) => f.key === "release")?.tone ?? "neutral"} /></div>
            <div className={styles.summaryRow}><span>Target Date</span><strong>{detail.releaseSummary.targetDate}</strong></div>
            <div className={styles.summaryRow}><span>Approval Status</span><StatusPill value={detail.releaseSummary.approvalStatus} tone={detail.releaseSummary.approvalStatus === "Approved" ? "success" : detail.releaseSummary.approvalStatus === "Pending" ? "warning" : "neutral"} /></div>
            <div className={styles.summaryRow}><span>Rollback Plan</span><StatusPill value={detail.releaseSummary.rollbackPlan} tone={detail.releaseSummary.rollbackPlan === "Required" ? "danger" : detail.releaseSummary.rollbackPlan === "Drafted" ? "warning" : "success"} /></div>
          </div>
        </section>

        <section className={shared.sideCard}>
          <h2><ShieldCheck size={15} /> Controlled Module Actions</h2>
          <div className={styles.actionRowList}>
            <button type="button" className={styles.actionRow} onClick={() => onNavigateTab("configuration")}><span className={styles.actionRowLeft}><Settings2 size={13} /><span>Update Configuration</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} disabled={!permissions.canRequestReview} onClick={() => onOpenModal({ kind: "review", reviewKind: "security" })}><span className={styles.actionRowLeft}><ShieldAlert size={13} /><span>Request Security Review</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} disabled={!permissions.canRequestReview} onClick={() => onOpenModal({ kind: "review", reviewKind: "compliance" })}><span className={styles.actionRowLeft}><ShieldCheck size={13} /><span>Request Compliance Review</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} onClick={() => onNavigateTab("dependencies")}><span className={styles.actionRowLeft}><Network size={13} /><span>Manage Dependencies</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} onClick={() => onNavigateTab("integrations")}><span className={styles.actionRowLeft}><Plug size={13} /><span>Manage Integrations</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} onClick={() => onNavigateTab("feature-flags")}><span className={styles.actionRowLeft}><FlagIcon size={13} /><span>Manage Feature Flags</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} onClick={() => onNavigateTab("country-availability")}><span className={styles.actionRowLeft}><Globe2 size={13} /><span>Manage Countries</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} onClick={() => info("Compare Versions", "Select two versions from Versions & Releases to compare configuration, health and adoption side by side.")}><span className={styles.actionRowLeft}><GitCompare size={13} /><span>Compare Versions</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} disabled={!permissions.canScheduleRelease} onClick={() => onOpenModal({ kind: "schedule-release" })}><span className={styles.actionRowLeft}><Calendar size={13} /><span>Schedule Release</span></span><ChevronRight size={13} /></button>
            <button type="button" className={styles.actionRow} disabled={!permissions.canRequestProductionEnablement} onClick={() => onOpenModal({ kind: "production-enablement" })}><span className={styles.actionRowLeft}><ShieldCheck size={13} /><span>Request Production Enablement</span></span><ChevronRight size={13} /></button>
            <button type="button" className={`${styles.actionRow} ${styles.actionRowDanger}`} disabled={!permissions.canSuspend} onClick={() => onOpenModal({ kind: "suspend" })}><span className={styles.actionRowLeft}><PauseCircle size={13} /><span>Suspend Module</span></span><ChevronRight size={13} /></button>
            <button type="button" className={`${styles.actionRow} ${styles.actionRowDanger}`} disabled={!permissions.canRetire} onClick={() => onOpenModal({ kind: "retire" })}><span className={styles.actionRowLeft}><Trash2 size={13} /><span>Retire Module</span></span><ChevronRight size={13} /></button>
          </div>
        </section>
      </aside>
      </div>
    </>
  );
}
