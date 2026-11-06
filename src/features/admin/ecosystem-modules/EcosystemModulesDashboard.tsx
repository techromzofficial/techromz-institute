"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  CloudCog,
  Component,
  Download,
  Filter,
  Gauge,
  Globe2,
  HeartPulse,
  Layers3,
  Link2,
  ListFilter,
  Network,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { adminRoute } from "@/lib/admin";
import { EmptyState, ErrorState, LoadingSkeleton, PermissionDeniedState } from "@/components/admin/common/States";
import {
  exportEcosystemModuleReport,
  fetchEcosystemModuleDashboard,
  fetchEcosystemModules,
  getModulePermissions,
  registerEcosystemModule,
} from "@/services/api/ecosystemModules";
import type {
  EcosystemModule,
  EcosystemModuleDashboard as DashboardData,
  EcosystemModuleFilters,
  EcosystemModulePage,
  ModuleRegistrationDraft,
  StatusTone,
} from "./types";
import styles from "./ecosystem-modules.module.css";

const PAGE_SIZE = 5;

const selectFilters = [
  { key: "lifecycle", label: "Lifecycle", options: ["Operational", "Pilot", "Coming Soon", "Planned"] },
  { key: "operationalStatus", label: "Status", options: ["Operational", "Degraded", "Partially Configured", "Unavailable"] },
  { key: "owner", label: "Owner", options: ["Elena Vance", "AI Product Team", "Suresh Kumar", "Maya Perera", "Sanjana Wickram"] },
  { key: "category", label: "Category", options: ["Commerce", "AI", "Wholesale", "Analytics", "Logistics", "Support", "Partner"] },
  { key: "region", label: "Region", options: ["Sri Lanka", "India", "Singapore"] },
  { key: "compliance", label: "Compliance", options: ["Approved", "Conditionally Approved", "Pending Review", "Not Assessed"] },
  { key: "risk", label: "Risk", options: ["Low", "Medium", "High"] },
  { key: "release", label: "Release", options: ["Released", "Candidate", "Blocked", "Not Scheduled"] },
  { key: "environment", label: "Environment", options: ["Production", "Staging", "Development"] },
] as const;

const quickFilters = [
  { id: "operational", label: "Operational", tone: "success" },
  { id: "pilot", label: "Pilot", tone: "info" },
  { id: "release-candidate", label: "Release Candidate", tone: "info" },
  { id: "requires-attention", label: "Requiring Attention", tone: "warning" },
  { id: "high-risk", label: "High Risk", tone: "danger" },
  { id: "not-configured", label: "Not Configured", tone: "neutral" },
  { id: "blocked", label: "Blocked", tone: "danger" },
  { id: "upcoming-releases", label: "Upcoming Releases", tone: "info" },
] as const;

const kpiIcons = {
  total: Layers3,
  active: CheckCircle2,
  pilot: Sparkles,
  "coming-soon": CircleDashed,
  planned: Component,
  "needs-attention": TriangleAlert,
  operational: ShieldCheck,
  degraded: AlertTriangle,
  blocked: XCircle,
  "pending-config": Settings2,
  "integration-issues": Link2,
  "dependency-risk": AlertTriangle,
  "countries-enabled": Globe2,
  "average-health": HeartPulse,
} as const;

type QueryUpdate = Record<string, string | null | undefined>;
type FilterKey = (typeof selectFilters)[number]["key"];
type DialogContent = { title: string; body: ReactNode } | null;

function toFilters(searchParams: URLSearchParams): EcosystemModuleFilters {
  const get = (key: string) => searchParams.get(key) || undefined;
  const page = Number(searchParams.get("page")) || 1;
  return {
    search: get("search"),
    lifecycle: get("lifecycle"),
    operationalStatus: get("operationalStatus"),
    owner: get("owner"),
    category: get("category"),
    region: get("region"),
    compliance: get("compliance"),
    risk: get("risk"),
    release: get("release"),
    environment: get("environment"),
    metric: get("metric"),
    quick: get("quick"),
    sort: (get("sort") as keyof EcosystemModule | undefined) ?? "moduleName",
    direction: get("direction") === "desc" ? "desc" : "asc",
    page,
    pageSize: PAGE_SIZE,
  };
}

export function statusTone(value: string): StatusTone {
  const lower = value.toLowerCase();
  if (/blocked|high|attention|required|unavailable|degraded/.test(lower)) return "danger";
  if (/pending|candidate|pilot|partial|progress|conditional|medium/.test(lower)) return "warning";
  if (/approved|operational|released|configured|healthy|low|yes/.test(lower)) return "success";
  if (/planned|coming|staging/.test(lower)) return "info";
  return "neutral";
}

function StatusPill({ value }: { value: string }) {
  return <span className={`${styles.statusPill} ${styles[`tone${statusTone(value)[0].toUpperCase()}${statusTone(value).slice(1)}`]}`}>{value}</span>;
}

function MetricBar({ value, tone = "success" }: { value: number; tone?: "success" | "warning" }) {
  return <span className={styles.metricTrack}><i className={tone === "warning" ? styles.metricWarning : styles.metricSuccess} style={{ width: `${value}%` }} /></span>;
}

function formatMetric(value: number | null, suffix: string) {
  return value === null ? "-" : `${value.toFixed(value % 1 === 0 ? 0 : 1)}${suffix}`;
}

function safeReturnPath(value: string | null) {
  return value?.startsWith("/admin/ecosystem-modules") ? value : "/admin/ecosystem-modules";
}

function RegistrationModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (module: EcosystemModule) => void;
}) {
  const [draft, setDraft] = useState<ModuleRegistrationDraft>({
    moduleName: "", moduleKey: "", category: "Operations", primaryOwner: "", technicalOwner: "", environment: "Development",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      onSaved(await registerEcosystemModule(draft));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The module could not be registered.");
    } finally {
      setSaving(false);
    }
  }

  function update(key: keyof ModuleRegistrationDraft, value: string) {
    setDraft((previous) => ({ ...previous, [key]: key === "moduleKey" ? value.toLowerCase().replace(/\s+/g, "-") : value }));
  }

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className={styles.modal} onSubmit={submit} aria-labelledby="register-module-title">
        <div className={styles.modalHeader}>
          <div><p className={styles.modalEyebrow}>Controlled frontend workflow</p><h2 id="register-module-title">Register module</h2></div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="Close register module dialog"><X size={18} /></button>
        </div>
        <p className={styles.modalIntro}>New modules begin in a planned, non-production state. Production enablement requires a separate approved workflow.</p>
        <div className={styles.formGrid}>
          <label>Module name<input required value={draft.moduleName} onChange={(event) => update("moduleName", event.target.value)} placeholder="e.g. Client Portal" /></label>
          <label>Module key<input required value={draft.moduleKey} onChange={(event) => update("moduleKey", event.target.value)} placeholder="client-portal" pattern="[a-z0-9-]+" /></label>
          <label>Category<select value={draft.category} onChange={(event) => update("category", event.target.value)}><option>Operations</option><option>Commerce</option><option>AI</option><option>Analytics</option><option>Partner</option></select></label>
          <label>Environment<select value={draft.environment} onChange={(event) => update("environment", event.target.value)}><option>Development</option><option>Staging</option></select></label>
          <label>Primary owner<input required value={draft.primaryOwner} onChange={(event) => update("primaryOwner", event.target.value)} placeholder="Business owner" /></label>
          <label>Technical owner<input required value={draft.technicalOwner} onChange={(event) => update("technicalOwner", event.target.value)} placeholder="Engineering owner" /></label>
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <div className={styles.modalActions}><button className={styles.secondaryButton} type="button" onClick={onClose} disabled={saving}>Cancel</button><button className={styles.primaryButton} disabled={saving}>{saving ? "Registering..." : "Register module"}</button></div>
      </form>
    </div>
  );
}

function StandardDialog({ content, onClose }: { content: DialogContent; onClose: () => void }) {
  if (!content) return null;
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`${styles.modal} ${styles.standardDialog}`} role="dialog" aria-modal="true" aria-labelledby="module-dialog-title"><div className={styles.modalHeader}><h2 id="module-dialog-title">{content.title}</h2><button className={styles.iconButton} type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div><div className={styles.dialogBody}>{content.body}</div><div className={styles.modalActions}><button className={styles.primaryButton} type="button" onClick={onClose}>Done</button></div></section></div>;
}

export function EcosystemModulesDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const filters = useMemo(() => toFilters(new URLSearchParams(queryString)), [queryString]);
  const screenState = searchParams.get("state") ?? "ready";
  const permissions = getModulePermissions(searchParams.get("access") === "read-only");
  const [search, setSearch] = useState(filters.search ?? "");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [registry, setRegistry] = useState<EcosystemModulePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogContent>(null);
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const updateQuery = (changes: QueryUpdate, resetPage = true) => {
    const next = new URLSearchParams(queryString);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    });
    if (resetPage && changes.page === undefined) next.delete("page");
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  };

  useEffect(() => setSearch(filters.search ?? ""), [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== (filters.search ?? "")) updateQuery({ search });
    }, 350);
    return () => window.clearTimeout(timer);
    // URL updates intentionally occur only after the user pauses typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let current = true;
    if (screenState === "error") {
      setLoading(false);
      setError("The module registry service is unavailable. No registry values were replaced with zero.");
      return () => { current = false; };
    }
    setLoading(true);
    setError("");
    Promise.all([fetchEcosystemModuleDashboard(), fetchEcosystemModules(filters)])
      .then(([summary, response]) => {
        if (!current) return;
        setDashboard({ ...summary, freshness: screenState === "stale" ? "stale" : screenState === "partial" ? "partial" : "fresh" });
        setRegistry(screenState === "empty" ? { ...response, data: [], total: 0, totalPages: 1 } : response);
      })
      .catch(() => current && setError("The module registry could not be loaded."))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [filters, refreshKey, screenState]);

  const returnTo = `${pathname}${queryString ? `?${queryString}` : ""}`;

  function selectMetric(metric: string) {
    updateQuery({ metric: filters.metric === metric || metric === "total" ? null : metric, quick: null });
  }

  function selectQuickFilter(quick: string) {
    updateQuery({ quick: filters.quick === quick ? null : quick, metric: null });
  }

  function updateSort(key: keyof EcosystemModule) {
    const direction = filters.sort === key && filters.direction === "asc" ? "desc" : "asc";
    updateQuery({ sort: key, direction }, false);
  }

  async function exportReport() {
    if (!permissions.canExport) return;
    const csv = await exportEcosystemModuleReport(filters);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ecosystem-module-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Module report exported with the current registry filters.");
  }

  function showReleaseCalendar() {
    setDialog({ title: "Release calendar", body: <><p>The release calendar remains a controlled frontend view until scheduling is connected to the backend.</p><ul className={styles.dialogList}><li>Aug 1 - AI Beauty Advisor candidate review</li><li>Aug 8 - Salon & Spa Portal readiness checkpoint</li><li>Aug 15 - B2B Wholesale dependency review</li></ul></> });
  }

  function onRegistered(module: EcosystemModule) {
    setRegisterOpen(false);
    setNotice(`${module.moduleName} was registered as planned. Production is disabled until a separate approval is completed.`);
    setRefreshKey((value) => value + 1);
  }

  if (screenState === "unauthorized") return <PermissionDeniedState />;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div><h1>Ecosystem Modules Management</h1><p>Monitor module health, track launches, ensure compliance, and maintain a healthy ecosystem.</p></div>
        <div className={styles.headerActions}>
          <button className={styles.priorityButton} type="button" onClick={() => selectMetric("needs-attention")}><AlertTriangle size={14} />Review Priority Modules</button>
          <button className={styles.secondaryButton} type="button" disabled={!permissions.canRegister} onClick={() => setRegisterOpen(true)}><Plus size={14} />Register Module</button>
          <button className={styles.secondaryButton} type="button" disabled={!permissions.canCompare} onClick={() => setDialog({ title: "Compare modules", body: <><p>Choose two module records from the registry to compare their health, readiness and release domains.</p><p className={styles.dialogNote}>Comparison is a frontend-only review and does not change module state.</p></> })}><SlidersHorizontal size={14} />Compare Modules</button>
          <button className={styles.secondaryButton} type="button" disabled={!permissions.canExport} onClick={() => void exportReport()}><ArrowDownToLine size={14} />Export Module Report</button>
          <button className={styles.secondaryButton} type="button" disabled={!permissions.canManageReleases} onClick={showReleaseCalendar}><CalendarDays size={14} />View Release Calendar</button>
        </div>
      </header>

      {searchParams.get("access") === "read-only" && <div className={styles.permissionNotice}><ShieldCheck size={16} />Read-only access: registration, comparison, export and release actions are disabled for this session.</div>}
      {notice && <div className={styles.successNotice} role="status"><CheckCircle2 size={16} /><span>{notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice("")}><X size={14} /></button></div>}
      {dashboard?.freshness === "stale" && <div className={styles.staleNotice}><CircleAlert size={16} />Showing the most recently generated portfolio aggregate from {dashboard.generatedAt}. A refresh is pending.</div>}
      {dashboard?.freshness === "partial" && <div className={styles.staleNotice}><CircleAlert size={16} />Partial registry data: availability and error-rate values may be temporarily unavailable for selected modules.</div>}

      {loading ? <LoadingSkeleton /> : error ? <ErrorState message={error} /> : dashboard && registry ? <div className={styles.dashboardLayout}>
        <div className={styles.mainColumn}>
          <section className={styles.kpiGrid} aria-label="Module portfolio key performance indicators">
            {dashboard.kpis.map((metric) => {
              const Icon = kpiIcons[metric.id as keyof typeof kpiIcons] ?? Gauge;
              const selected = filters.metric === metric.id || (metric.id === "total" && !filters.metric && !filters.quick);
              return <button className={`${styles.kpiCard} ${selected ? styles.kpiSelected : ""}`} type="button" key={metric.id} onClick={() => selectMetric(metric.id)} aria-pressed={selected}><span className={`${styles.kpiIcon} ${styles[`tone${metric.tone[0].toUpperCase()}${metric.tone.slice(1)}`]}`}><Icon size={18} /></span><span className={styles.kpiLabel}>{metric.label}</span><strong className={metric.tone === "danger" ? styles.dangerValue : ""}>{metric.value}</strong><small>{metric.detail}</small></button>;
            })}
          </section>

          <section className={styles.portfolioSummary}>
            <div className={styles.summaryHeader}><div><h2>Module Portfolio Health Summary</h2><p>{dashboard.source} - generated {dashboard.generatedAt}</p></div><span className={styles.freshness}><CheckCircle2 size={13} />{dashboard.freshness === "fresh" ? "Fresh" : dashboard.freshness}</span></div>
            <div className={styles.portfolioMetrics}>{dashboard.portfolioHealth.map((metric) => <div className={styles.portfolioMetric} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><MetricBar value={metric.progress} tone={metric.tone} /></div>)}</div>
          </section>

          <section className={styles.registryWorkspace} aria-label="Module registry workspace">
            <form className={styles.searchRow} onSubmit={(event) => { event.preventDefault(); updateQuery({ search }); }}>
              <label className={styles.searchField}><Search size={16} /><input aria-label="Search modules" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search modules by name, key, owner, or reference..." /></label>
              <button className={styles.filterButton} type="button" onClick={() => setDialog({ title: "Applied registry filters", body: <p>All selected filters, sorting and the current page are stored in the address bar so this operational view can be shared.</p> })}><Filter size={16} />Filters</button>
            </form>
            <div className={styles.filterGrid}>{selectFilters.map((filter) => <label key={filter.key}>{filter.label}<select aria-label={filter.label} value={filters[filter.key] ?? ""} onChange={(event) => updateQuery({ [filter.key]: event.target.value } as QueryUpdate)}><option value="">All {filter.label === "Status" ? "Statuses" : `${filter.label}s`}</option>{filter.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>
            <div className={styles.quickFilterRow}><span>Quick Filters:</span>{quickFilters.map((filter) => <button key={filter.id} type="button" onClick={() => selectQuickFilter(filter.id)} className={`${styles.quickFilter} ${filters.quick === filter.id ? styles.quickFilterActive : ""}`}><i className={`${styles.quickDot} ${styles[`tone${filter.tone[0].toUpperCase()}${filter.tone.slice(1)}`]}`} />{filter.label}</button>)}<button className={styles.clearFilters} type="button" onClick={() => { setSearch(""); router.push(pathname, { scroll: false }); }}>Clear All</button></div>
          </section>

          {!registry.data.length ? <div className={styles.emptyRegistry}><EmptyState title="No modules match this registry view" /><button className={styles.secondaryButton} type="button" onClick={() => router.push(pathname)}>Clear registry filters</button></div> : <ModuleRegistryTable registry={registry} filters={filters} returnTo={returnTo} onSort={updateSort} onPageChange={(page) => updateQuery({ page: String(page) }, false)} />}

          <PortfolioPanels onAction={(title, body) => setDialog({ title, body })} />
        </div>
        <OperationsPanel
          onFilter={(changes) => updateQuery(changes)}
          onDialog={(title, body) => setDialog({ title, body })}
          onRegister={() => setRegisterOpen(true)}
          onCalendar={showReleaseCalendar}
          canManageActions={permissions.canRegister}
        />
      </div> : null}

      {registerOpen && <RegistrationModal onClose={() => setRegisterOpen(false)} onSaved={onRegistered} />}
      <StandardDialog content={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}

function ModuleRegistryTable({
  registry,
  filters,
  returnTo,
  onSort,
  onPageChange,
}: {
  registry: EcosystemModulePage;
  filters: EcosystemModuleFilters;
  returnTo: string;
  onSort: (key: keyof EcosystemModule) => void;
  onPageChange: (page: number) => void;
}) {
  const columns: Array<{ key: keyof EcosystemModule; label: string; render: (module: EcosystemModule) => ReactNode }> = [
    { key: "publicReference", label: "Public Module Reference", render: (module) => module.publicReference },
    { key: "databaseModuleId", label: "Database Module ID", render: (module) => module.databaseModuleId },
    { key: "moduleName", label: "Module Name", render: (module) => <strong>{module.moduleName}</strong> },
    { key: "moduleKey", label: "Module Key", render: (module) => module.moduleKey },
    { key: "category", label: "Category", render: (module) => module.category },
    { key: "lifecycle", label: "Lifecycle", render: (module) => <StatusPill value={module.lifecycle} /> },
    { key: "operationalStatus", label: "Operational Status", render: (module) => <StatusPill value={module.operationalStatus} /> },
    { key: "releaseStatus", label: "Release Status", render: (module) => <StatusPill value={module.releaseStatus} /> },
    { key: "currentVersion", label: "Current Version", render: (module) => module.currentVersion },
    { key: "targetVersion", label: "Target Version", render: (module) => module.targetVersion },
    { key: "productionEnabled", label: "Production Enabled", render: (module) => <StatusPill value={module.productionEnabled ? "Yes" : "No"} /> },
    { key: "configurationStatus", label: "Configuration Status", render: (module) => <StatusPill value={module.configurationStatus} /> },
    { key: "integrationReadiness", label: "Integration Readiness", render: (module) => <StatusPill value={module.integrationReadiness} /> },
    { key: "dependencyHealth", label: "Dependency Health", render: (module) => <StatusPill value={module.dependencyHealth} /> },
    { key: "complianceStatus", label: "Compliance Status", render: (module) => <StatusPill value={module.complianceStatus} /> },
    { key: "securityReview", label: "Security Review", render: (module) => <StatusPill value={module.securityReview} /> },
    { key: "countriesEnabled", label: "Countries Enabled", render: (module) => module.countriesEnabled },
    { key: "activeUsers", label: "Active Users", render: (module) => module.activeUsers.toLocaleString() },
    { key: "monthlyTransactions", label: "Monthly Transactions", render: (module) => module.monthlyTransactions.toLocaleString() },
    { key: "adoptionRate", label: "Adoption Rate", render: (module) => `${module.adoptionRate}%` },
    { key: "availability", label: "Availability", render: (module) => formatMetric(module.availability, "%") },
    { key: "errorRate", label: "Error Rate", render: (module) => formatMetric(module.errorRate, "%") },
    { key: "healthScore", label: "Health Score", render: (module) => `${module.healthScore}/100` },
    { key: "riskLevel", label: "Risk Level", render: (module) => <StatusPill value={module.riskLevel} /> },
    { key: "riskTrend", label: "Risk Trend", render: (module) => module.riskTrend },
    { key: "primaryOwner", label: "Primary Owner", render: (module) => module.primaryOwner },
    { key: "technicalOwner", label: "Technical Owner", render: (module) => module.technicalOwner },
    { key: "lastRelease", label: "Last Release", render: (module) => module.lastRelease },
    { key: "nextUpdate", label: "Next Update", render: (module) => module.nextUpdate },
    { key: "lastUpdated", label: "Last Updated", render: (module) => module.lastUpdated },
  ];
  const resultStart = registry.total ? (registry.page - 1) * registry.pageSize + 1 : 0;
  const resultEnd = Math.min(registry.page * registry.pageSize, registry.total);

  return <section className={styles.tableSection}><div className={styles.tableHeading}><div><h2>Module Registry</h2><p>30-field module data model - horizontal scrolling keeps every status domain available.</p></div><span>{registry.total} module{registry.total === 1 ? "" : "s"}</span></div><div className={styles.tableScroll}><table className={styles.registryTable}><thead><tr>{columns.map((column) => <th key={column.key} scope="col"><button type="button" onClick={() => onSort(column.key)}>{column.label}<ArrowUpDown size={11} className={filters.sort === column.key ? styles.activeSort : ""} /></button></th>)}<th scope="col">Action</th></tr></thead><tbody>{registry.data.map((module) => <tr key={module.id}>{columns.map((column) => <td key={column.key}>{column.render(module)}</td>)}<td><Link className={styles.openModule} href={`${adminRoute.ecosystemModule(module.moduleKey)}?returnTo=${encodeURIComponent(returnTo)}`}>Open Module</Link></td></tr>)}</tbody></table></div><div className={styles.tableFooter}><span>Showing {resultStart}-{resultEnd} of {registry.total} modules</span><div><button className={styles.iconButton} type="button" aria-label="Previous module registry page" disabled={registry.page === 1} onClick={() => onPageChange(registry.page - 1)}><ChevronLeft size={16} /></button><strong>{registry.page} / {registry.totalPages}</strong><button className={styles.iconButton} type="button" aria-label="Next module registry page" disabled={registry.page === registry.totalPages} onClick={() => onPageChange(registry.page + 1)}><ChevronRight size={16} /></button></div></div></section>;
}

function PortfolioPanels({ onAction }: { onAction: (title: string, body: ReactNode) => void }) {
  const panels = [
    { title: "Adoption by Module", rows: [["B2C Marketplace", "92%"], ["Orders & Fulfilment", "89%"], ["Logistics", "81%"], ["Customer Support", "74%"], ["AI Beauty Advisor", "41%"]], action: "View full adoption report" },
    { title: "Release Readiness", rows: [["AI Beauty Advisor", "86%"], ["B2B Wholesale", "58%"], ["Salon & Spas", "44%"], ["Clinics & Dermatologists", "36%"], ["Academy & Training", "29%"]], action: "View release timeline" },
    { title: "Integration Health", rows: [["Payment Gateway", "Healthy"], ["Email Service", "Healthy"], ["SMS Service", "Healthy"], ["Logistics Providers", "Degraded"], ["Gemini Provider", "Attention Required"]], action: "View integration registry" },
    { title: "Dependency Risks", rows: [["AI Beauty Advisor depends on Gemini API", "High"], ["B2B Wholesale waiting on ERP integration", "Medium"], ["Logistics module depends on 2 degraded providers", "Medium"], ["Beauty Issue Analyzer blocked by ML model validation", "High"]], action: "View dependency map" },
    { title: "Country Availability", rows: [["Sri Lanka - LK", "11 enabled"], ["Canada - CA", "Planning"], ["United Kingdom - GB", "Not Configured"], ["Australia - AU", "Not Configured"], ["Maldives - MV", "Planning"]], action: "View country availability" },
    { title: "Security & Compliance", rows: [["Approved", "8"], ["Conditionally Approved", "2"], ["Reviews Pending", "3"], ["Not Assessed", "3"], ["High-Risk Findings", "2"]], action: "View compliance center" },
  ];
  return <section className={styles.portfolioPanels}>{panels.map((panel) => <article className={styles.portfolioPanel} key={panel.title}><h2>{panel.title}</h2>{panel.rows.map(([label, value]) => <div className={styles.panelRow} key={label}><span>{label}</span>{panel.title.includes("Adoption") || panel.title.includes("Readiness") ? <span className={styles.panelProgress}><i style={{ width: value }} /><strong>{value}</strong></span> : <strong className={statusTone(value) === "danger" ? styles.dangerText : ""}>{value}</strong>}</div>)}<button type="button" onClick={() => onAction(panel.title, <p>{panel.action} is ready for a route-level integration. This frontend view preserves the current module workspace state.</p>)}>{panel.action} <ChevronRight size={13} /></button></article>)}</section>;
}

function OperationsPanel({
  onFilter,
  onDialog,
  onRegister,
  onCalendar,
  canManageActions,
}: {
  onFilter: (changes: QueryUpdate) => void;
  onDialog: (title: string, body: ReactNode) => void;
  onRegister: () => void;
  onCalendar: () => void;
  canManageActions: boolean;
}) {
  const healthRows = [["Operational Availability", "99.4%", 99.4], ["Configuration Completeness", "88%", 88], ["Integration Readiness", "84%", 84], ["Dependency Health", "89%", 89], ["Compliance Readiness", "92%", 92], ["Release Readiness", "86%", 86], ["Adoption Growth", "+12.0%", 82]];
  const alerts = ["AI Beauty Advisor security review pending", "B2B Wholesale integration readiness blocked", "Beauty Issue Analyzer validation not started", "Logistics provider health degraded", "Three modules have pending compliance reviews", "One release is currently blocked"];
  return <aside className={styles.operationsPanel}>
    <section className={styles.sideCard}><h2>Portfolio Health</h2>{healthRows.map(([label, value, progress]) => <div className={styles.sideHealthRow} key={String(label)}><span>{label}</span><MetricBar value={Number(progress)} /><strong>{value}</strong></div>)}</section>
    <section className={styles.sideCard}><h2><TriangleAlert size={15} />Priority Alerts</h2>{alerts.map((alert, index) => <button type="button" className={styles.alertItem} key={alert} onClick={() => onFilter({ quick: index === 5 ? "blocked" : "requires-attention", metric: null })}><TriangleAlert size={12} /><span>{alert}</span></button>)}<button className={styles.sideLink} type="button" onClick={() => onFilter({ quick: "requires-attention", metric: null })}>View all alerts <ChevronRight size={13} /></button></section>
    <section className={styles.sideCard}><h2><ListFilter size={15} />Quick Queue</h2>{[["Highest-Risk Module", "Beauty Issue Analyzer"], ["Next Scheduled Release", "B2C Marketplace (Jul 24)"], ["Oldest Pending Configuration", "B2B Wholesale (62%)"], ["Most-Adopted Module", "B2C Marketplace (92%)"], ["Lowest-Adoption Active Module", "AI Beauty Advisor (41%)"], ["Dependency Review Required", "AI Beauty Advisor"]].map(([label, value]) => <button className={styles.queueItem} type="button" key={label} onClick={() => onFilter({ search: value.split(" (")[0], page: null })}><span>{label}</span><strong>{value}</strong></button>)}<button className={styles.sideLink} type="button" onClick={() => onDialog("Priority queue", <p>Queue entries open their matching filtered registry views while preserving all current URL state.</p>)}>View full queue <ChevronRight size={13} /></button></section>
    <section className={styles.sideCard}><h2><CloudCog size={15} />Environment Health</h2>{[["Production", "Operational"], ["Staging", "Operational"], ["Development", "Operational"], ["Failed Deployments", "1"], ["Configuration Drift", "2 modules"], ["Pending Migrations", "1"]].map(([label, value]) => <div className={styles.environmentRow} key={label}><span>{label}</span><strong className={value === "Operational" ? styles.successText : styles.dangerText}>{value}</strong></div>)}<button className={styles.sideLink} type="button" onClick={() => onDialog("Environment health", <p>Environment health is an aggregate read-only summary. No production controls are exposed here.</p>)}>View environment dashboard <ChevronRight size={13} /></button></section>
    <section className={styles.sideCard}><h2><CalendarDays size={15} />Release Summary</h2>{[["Released This Month", "3"], ["Release Candidates", "3"], ["Scheduled Releases", "2"], ["Blocked Releases", "1"], ["Rollback Events", "0"], ["Modules Connected", "8"]].map(([label, value]) => <div className={styles.environmentRow} key={label}><span>{label}</span><strong>{value}</strong></div>)}<button className={styles.sideLink} type="button" onClick={onCalendar}>View release dashboard <ChevronRight size={13} /></button></section>
    <section className={styles.sideCard}><h2><Network size={15} />Module Actions</h2><div className={styles.moduleActions}><button type="button" disabled={!canManageActions} onClick={onRegister}>Register Module</button><button type="button" disabled={!canManageActions} onClick={() => onDialog("Compare modules", <p>Select two registry records to compare their current health and release readiness.</p>)}>Compare Modules</button><button type="button" onClick={() => onDialog("Feature flags", <p>Feature flags are maintained in each module workspace and never reveal secret values.</p>)}>View Feature Flags</button><button type="button" onClick={() => onDialog("Dependency map", <p>Dependency map data will use the selected module registry filters when the backend integration is connected.</p>)}>View Dependency Map</button><button type="button" onClick={() => onDialog("Integration registry", <p>Integration registry supports operational review only; mutations require the detail workspace.</p>)}>View Integration Registry</button><button type="button" onClick={() => onDialog("Country availability", <p>Country availability status is available for planning and readiness review.</p>)}>View Country Availability</button><button type="button" disabled={!canManageActions} onClick={onCalendar}>View Release Calendar</button><button type="button" disabled={!canManageActions} onClick={() => onDialog("Export module report", <p>Use the export action in the page header to download the current registry view.</p>)}>Export Module Report</button></div></section>
  </aside>;
}

