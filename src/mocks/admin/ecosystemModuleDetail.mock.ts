import type {
  AccessRoleRow,
  AuditHistoryEntry,
  ConfigParameterRow,
  CountryReadinessRow,
  DependencyRow,
  EcosystemModule,
  EcosystemModuleDetail,
  EnvironmentRow,
  FeatureFlagRow,
  IntegrationRow,
  ModuleAlertRow,
  SecurityFindingRow,
  StatusDomainField,
  StatusTone,
  VersionReleaseRow,
} from "@/features/admin/ecosystem-modules/types";
import { mockEcosystemModules } from "./ecosystemModules.mock";

// Mocks stay framework-free (no React/UI imports) so this layer can be swapped
// for a live endpoint without touching any component. Tone classification here
// intentionally mirrors the registry's statusTone() in EcosystemModulesDashboard.
function deriveTone(value: string): StatusTone {
  const lower = value.toLowerCase();
  if (/blocked|high|attention|required|unavailable|degraded|critical|pending$/.test(lower)) return "danger";
  if (/pending|candidate|pilot|partial|progress|conditional|medium|review/.test(lower)) return "warning";
  if (/approved|operational|released|configured|healthy|low|yes|active|pass|enabled/.test(lower)) return "success";
  if (/planned|coming|staging|not requested/.test(lower)) return "info";
  return "neutral";
}

function percentFor(value: string, table: Record<string, number>, fallback = 50) {
  return table[value] ?? fallback;
}

const configCompletionTable: Record<string, number> = { Configured: 96, "Partially Configured": 64, "Pending Review": 48, "Not Configured": 8 };
const integrationTable: Record<string, number> = { Healthy: 92, "In Progress": 68, "Attention Required": 54, Degraded: 45, "Not Started": 12 };
const dependencyTable: Record<string, number> = { Healthy: 90, "Attention Required": 58, Blocked: 22, "Not Assessed": 35 };
const securityTable: Record<string, number> = { Approved: 94, "Pending Review": 60, "Not Started": 15 };
const complianceTable: Record<string, number> = { Approved: 95, "Conditionally Approved": 74, "Pending Review": 52, "Not Assessed": 20 };
const releaseTable: Record<string, number> = { Released: 96, Candidate: 78, Blocked: 24, "Not Scheduled": 38 };
const regionMap: Record<string, string> = { "Sri Lanka": "aws-ap-south-1", India: "aws-ap-south-1", Singapore: "aws-ap-southeast-1" };

function buildStatusDomains(m: EcosystemModule): StatusDomainField[] {
  return [
    { key: "lifecycle", label: "Business Lifecycle", value: m.lifecycle, tone: deriveTone(m.lifecycle) },
    { key: "operational", label: "Operational Status", value: m.operationalStatus, tone: deriveTone(m.operationalStatus) },
    { key: "release", label: "Release Status", value: m.releaseStatus, tone: deriveTone(m.releaseStatus) },
    { key: "production", label: "Production Enablement", value: m.productionEnabled ? "Enabled" : m.lifecycle === "Pilot" ? "Controlled Pilot" : "Not Enabled", tone: m.productionEnabled ? "success" : "warning" },
    { key: "configuration", label: "Configuration Status", value: m.configurationStatus, tone: deriveTone(m.configurationStatus) },
    { key: "integration", label: "Integration Readiness", value: m.integrationReadiness, tone: deriveTone(m.integrationReadiness) },
    { key: "dependency", label: "Dependency Health", value: m.dependencyHealth, tone: deriveTone(m.dependencyHealth) },
    { key: "compliance", label: "Compliance Status", value: m.complianceStatus, tone: deriveTone(m.complianceStatus) },
    { key: "security", label: "Security Review", value: m.securityReview, tone: deriveTone(m.securityReview) },
    { key: "risk", label: "Risk Level", value: m.riskLevel, tone: m.riskLevel === "High" ? "danger" : m.riskLevel === "Medium" ? "warning" : "success" },
  ];
}

function buildLifecycleStages(lifecycle: string) {
  const labels = ["Planned", "Design", "Development", "Internal Testing", "Pilot", "Active", "Deprecated", "Retired"];
  const currentIndex = lifecycle === "Planned" ? 0 : lifecycle === "Coming Soon" ? 3 : lifecycle === "Pilot" ? 4 : 5;
  return labels.map((label, index) => ({
    key: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    state: (index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming") as "complete" | "current" | "upcoming",
  }));
}

function buildOverviewMetrics(m: EcosystemModule) {
  const configPct = percentFor(m.configurationStatus, configCompletionTable);
  const integrationPct = percentFor(m.integrationReadiness, integrationTable);
  const dependencyPct = percentFor(m.dependencyHealth, dependencyTable);
  const securityPct = percentFor(m.securityReview, securityTable);
  const compliancePct = percentFor(m.complianceStatus, complianceTable);
  const releasePct = percentFor(m.releaseStatus, releaseTable);
  const isConversational = m.category === "AI";
  const openAlerts = m.riskLevel === "High" ? 6 : m.riskLevel === "Medium" ? 3 : 1;
  const blockingIssues = m.releaseStatus === "Blocked" ? 4 : m.dependencyHealth === "Attention Required" ? 2 : 0;
  const tier = (value: number) => (value >= 85 ? "success" : value >= 60 ? "warning" : "danger") as StatusTone;

  return [
    { id: "health", label: "Module Health Score", value: `${m.healthScore}/100`, tone: tier(m.healthScore) },
    { id: "release-readiness", label: "Release Readiness", value: `${releasePct}%`, tone: tier(releasePct) },
    { id: "config-completeness", label: "Configuration Completeness", value: `${configPct}%`, tone: tier(configPct) },
    { id: "integration-readiness", label: "Integration Readiness", value: `${integrationPct}%`, tone: tier(integrationPct) },
    { id: "dependency-health", label: "Dependency Health", value: `${dependencyPct}%`, tone: tier(dependencyPct) },
    { id: "security-readiness", label: "Security Readiness", value: `${securityPct}%`, tone: tier(securityPct) },
    { id: "compliance-readiness", label: "Compliance Readiness", value: `${compliancePct}%`, tone: tier(compliancePct) },
    { id: "adoption-rate", label: "Adoption Rate", value: `${m.adoptionRate}%`, tone: (m.adoptionRate >= 70 ? "success" : m.adoptionRate >= 40 ? "warning" : "neutral") as StatusTone },
    { id: "availability", label: "Availability", value: m.availability === null ? "-" : `${m.availability}%`, tone: ((m.availability ?? 0) >= 99 ? "success" : (m.availability ?? 0) >= 97 ? "warning" : "danger") as StatusTone },
    { id: "error-rate", label: "Error Rate", value: m.errorRate === null ? "-" : `${m.errorRate}%`, tone: ((m.errorRate ?? 0) <= 1 ? "success" : (m.errorRate ?? 0) <= 2 ? "warning" : "danger") as StatusTone },
    { id: "active-users", label: "Monthly Active Users", value: m.activeUsers.toLocaleString(), tone: "neutral" as StatusTone },
    { id: "transactions", label: isConversational ? "Monthly Conversations" : "Monthly Transactions", value: m.monthlyTransactions.toLocaleString(), tone: "neutral" as StatusTone },
    { id: "countries", label: "Countries Enabled", value: String(m.countriesEnabled), tone: "neutral" as StatusTone },
    { id: "open-alerts", label: "Open Alerts", value: String(openAlerts), tone: (openAlerts > 3 ? "danger" : openAlerts > 0 ? "warning" : "success") as StatusTone },
    { id: "blocking-issues", label: "Blocking Issues", value: String(blockingIssues), tone: (blockingIssues > 0 ? "danger" : "success") as StatusTone },
  ];
}

function buildGeneric(m: EcosystemModule): EcosystemModuleDetail {
  const base = m.moduleKey.replace(/-/g, "_");
  const dateOnly = m.lastUpdated.split(",")[0];
  const attention = m.dependencyHealth === "Attention Required" || m.dependencyHealth === "Blocked";
  const configurationProgress = percentFor(m.configurationStatus, configCompletionTable);
  const integrationProgress = percentFor(m.integrationReadiness, integrationTable);
  const openFindings = m.riskLevel === "High" ? 4 : m.riskLevel === "Medium" ? 2 : 0;

  const featureFlags: FeatureFlagRow[] = [
    { id: `${m.id}-flag-1`, flagKey: `${base}_enabled`, state: m.operationalStatus === "Unavailable" ? "Disabled" : "Enabled", audience: m.lifecycle === "Pilot" ? "Pilot Accounts" : "All Accounts", rollout: m.lifecycle === "Pilot" ? 25 : m.productionEnabled ? 100 : 0, approvalStatus: m.productionEnabled ? "Approved" : "Pending Review", expiry: "No expiry", updatedAt: dateOnly },
    { id: `${m.id}-flag-2`, flagKey: `${base}_new_experience`, state: "Enabled", audience: "Internal QA", rollout: 10, approvalStatus: "Approved", expiry: "Aug 30, 2026", updatedAt: dateOnly },
  ];

  const configParameters: ConfigParameterRow[] = [
    { id: `${m.id}-cfg-1`, configKey: `${m.moduleKey}.environment`, envVariable: `${base.toUpperCase()}_ENVIRONMENT`, category: "Runtime", environment: "ENV", currentValue: m.environment, secret: false, required: true, validationStatus: "Pass", source: ".env", lastUpdated: dateOnly, updatedBy: m.technicalOwner },
    { id: `${m.id}-cfg-2`, configKey: `${m.moduleKey}.timeout_seconds`, envVariable: `${base.toUpperCase()}_TIMEOUT_SECONDS`, category: "Reliability", environment: "ENV", currentValue: "30", secret: false, required: true, validationStatus: "Pass", source: "Config service", lastUpdated: dateOnly, updatedBy: "System" },
    { id: `${m.id}-cfg-3`, configKey: `${m.moduleKey}.provider_api_key`, envVariable: `${base.toUpperCase()}_PROVIDER_API_KEY`, category: "Secret", environment: "ENV", currentValue: "Secret Reference", secret: true, required: true, validationStatus: m.securityReview === "Approved" ? "Pass" : "Review Pending", source: "Secrets manager", lastUpdated: dateOnly, updatedBy: "Secrets manager" },
  ];

  const versionsReleases: VersionReleaseRow[] = [
    { id: `${m.id}-ver-1`, version: m.currentVersion, releaseType: "Minor", status: "Live", releasedOn: m.lastRelease === "-" ? "Not released" : m.lastRelease, releasedBy: m.technicalOwner, notes: "Current production build." },
    { id: `${m.id}-ver-2`, version: m.targetVersion, releaseType: m.releaseStatus === "Candidate" ? "Candidate" : "Minor", status: m.releaseStatus, releasedOn: m.nextUpdate, releasedBy: m.technicalOwner, notes: "Next planned release." },
  ];

  const environments: EnvironmentRow[] = [
    { id: `${m.id}-env-1`, name: "Production", status: m.environment === "Production" ? m.operationalStatus : "Not Deployed", endpoint: `${m.moduleKey}.slbeauty.internal`, lastDeployed: dateOnly, deployedBy: m.technicalOwner, driftStatus: "None" },
    { id: `${m.id}-env-2`, name: "Staging", status: "Operational", endpoint: `${m.moduleKey}.staging.slbeauty.internal`, lastDeployed: dateOnly, deployedBy: m.technicalOwner, driftStatus: attention ? "1 variable" : "None" },
    { id: `${m.id}-env-3`, name: "Development", status: "Operational", endpoint: `${m.moduleKey}.dev.slbeauty.internal`, lastDeployed: dateOnly, deployedBy: m.technicalOwner, driftStatus: "None" },
  ];

  const dependencies: DependencyRow[] = [
    { id: `${m.id}-dep-1`, name: "Platform Auth Service", type: "Internal Service", direction: "Upstream", health: "Healthy", criticality: "High", owner: "AI Platform Engineering" },
    { id: `${m.id}-dep-2`, name: `${m.category} Data Pipeline`, type: "Internal Service", direction: "Upstream", health: attention ? "Attention Required" : "Healthy", criticality: "Medium", owner: m.technicalOwner },
    { id: `${m.id}-dep-3`, name: "Notification Service", type: "Internal Service", direction: "Downstream", health: "Healthy", criticality: "Low", owner: "Platform Engineering" },
  ];

  const integrations: IntegrationRow[] = [
    { id: `${m.id}-int-1`, name: "Payment Gateway", provider: "Internal", category: "Commerce", status: "Healthy", lastChecked: dateOnly, latency: "180ms" },
    { id: `${m.id}-int-2`, name: "Notification Provider", provider: "Twilio", category: "Messaging", status: m.integrationReadiness, lastChecked: dateOnly, latency: attention ? "620ms" : "140ms" },
  ];

  const countryReadiness: CountryReadinessRow[] = [
    { id: `${m.id}-country-1`, country: "Sri Lanka", isoCode: "LK", availability: m.countriesEnabled > 0 ? "Enabled" : "Planning", businessApproval: "Approved", legalReview: "Approved", privacyReview: "Approved", languages: "English / Sinhala", currency: "LKR", environment: m.environment, effectiveDate: m.lastRelease === "-" ? "Not scheduled" : m.lastRelease },
    { id: `${m.id}-country-2`, country: "Canada", isoCode: "CA", availability: "Planning", businessApproval: "Pending", legalReview: "Pending", privacyReview: "Pending", languages: "English", currency: "CAD", environment: "Not Scheduled", effectiveDate: "None" },
  ];

  const accessRoles: AccessRoleRow[] = [
    { id: `${m.id}-role-1`, role: m.technicalOwner, permissionScope: "Full Access", environment: m.lifecycle === "Pilot" ? "Pilot" : "All", view: "Yes", configure: "Yes", release: "Review", enableProduction: "No", manageFlags: "Yes", viewAudit: "Yes", lastUpdated: dateOnly },
    { id: `${m.id}-role-2`, role: "Security Team", permissionScope: "Review Access", environment: "All", view: "Yes", configure: "No", release: "Review Required", enableProduction: "No", manageFlags: "No", viewAudit: "Yes", lastUpdated: dateOnly },
    { id: `${m.id}-role-3`, role: "Business Stakeholder", permissionScope: "Read Access", environment: "Dashboard", view: "Yes", configure: "No", release: "No", enableProduction: "No", manageFlags: "No", viewAudit: "Review", lastUpdated: dateOnly },
  ];

  const securityFindings: SecurityFindingRow[] = openFindings === 0 ? [] : [
    { id: `${m.id}-finding-1`, title: `${m.dependencyHealth === "Blocked" ? "Blocked dependency" : "Integration"} review required`, severity: m.riskLevel === "High" ? "High" : "Medium", status: "Open", discovered: dateOnly, owner: m.technicalOwner },
  ];

  const alerts: ModuleAlertRow[] = openFindings === 0 ? [] : [
    { id: `${m.id}-alert-1`, message: `${m.moduleName} security review pending`, tone: "warning", due: m.nextUpdate },
  ];

  const auditHistory: AuditHistoryEntry[] = [
    { id: `${m.id}-audit-1`, timestamp: m.lastUpdated, actor: m.technicalOwner, action: "Module record updated", detail: `Registry values refreshed for ${m.moduleName}.` },
    { id: `${m.id}-audit-2`, timestamp: m.lastRelease === "-" ? m.lastUpdated : `${m.lastRelease}, 9:00 AM`, actor: m.primaryOwner, action: "Module registered", detail: `${m.moduleName} added to the ecosystem module registry.` },
  ];

  return {
    module: m,
    moduleDescription: `${m.category} module supporting ${m.moduleName.toLowerCase()} for the ${m.region} market.`,
    statusDomains: buildStatusDomains(m),
    overviewMetrics: buildOverviewMetrics(m),
    lifecycleStages: buildLifecycleStages(m.lifecycle),
    governance: { businessOwner: m.primaryOwner, technicalOwner: m.technicalOwner, lastReview: m.lastRelease !== "-" ? m.lastRelease : dateOnly, approvalChain: `${m.primaryOwner} \u2192 CTO` },
    currentRelease: { currentVersion: m.currentVersion, targetVersion: m.targetVersion, releaseStatus: m.releaseStatus, nextRelease: m.nextUpdate, rollbackPlan: m.releaseStatus === "Candidate" ? "Drafted" : m.releaseStatus === "Blocked" ? "Required" : m.releaseStatus === "Released" ? "Not Required" : "Not Started" },
    environmentSummary: { productionEnablement: m.productionEnabled ? "Enabled" : m.lifecycle === "Pilot" ? "Controlled Pilot" : "Not Enabled", countriesEnabledSummary: m.countriesEnabled > 0 ? `${m.region} \u2014 ${m.countriesEnabled} enabled` : "Not configured", primaryRegion: regionMap[m.region] ?? "aws-ap-south-1", environmentHealth: m.operationalStatus === "Degraded" ? "Degraded" : "Healthy" },
    configSummary: { secretsSafeCompletion: Math.max(configurationProgress - 10, 5), parameterCoverage: Math.min(configurationProgress + 8, 100), configurationProgress },
    integrationSummary: { servicesTotalCompletion: integrationProgress, parameterCoverage: Math.min(integrationProgress + 8, 100), integrationProgress },
    dependencySummary: { criticalDependencies: attention ? 3 : 1, requiredDependencies: attention ? 7 : 4, healthStatus: m.dependencyHealth, impactRisk: m.riskLevel },
    featureFlags,
    configParameters,
    versionsReleases,
    environments,
    dependencies,
    integrations,
    countryReadiness,
    accessRoles,
    securityFindings,
    complianceDetail: { securityReviewStatus: m.securityReview, openFindings, criticalFindings: 0, highFindings: m.riskLevel === "High" ? 1 : 0, mediumFindings: m.riskLevel === "Medium" ? 1 : 0, privacyReviewRequired: "Yes", consentRequirement: "Required", dataRetention: "Defined", sensitiveDataHandling: attention ? "Restricted" : "Standard" },
    healthPerformance: {
      requestVolume: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({ day, value: Math.round((m.monthlyTransactions / 30) * (0.8 + index * 0.05)) })),
      averageLatency: attention ? "1.1s" : "0.4s", latencyTrend: "-1% vs prev 7 days",
      uptime: m.availability === null ? "-" : `${m.availability}%`, uptimeTrend: "+0.1% vs prev 7 days",
      recommendationSuccess: `${Math.max(m.healthScore - 5, 40)}%`, recommendationTrend: "+0.8% vs prev 7 days",
      errorTrend: m.errorRate === null ? "-" : `${m.errorRate}%`, errorTrendChange: "-0.1% vs prev 7 days",
    },
    adoptionInsights: { monthlyActiveUsers: m.activeUsers, activeUsersTrend: "+2% vs prev month", monthlyConversations: m.monthlyTransactions, conversationsTrend: "+1% vs prev month", adoptionRate: m.adoptionRate, adoptionTrend: "+1% vs prev month", adoptionByCohort: [{ label: "Sri Lanka", value: m.adoptionRate }, { label: "Other markets", value: Math.max(m.adoptionRate - 20, 0) }] },
    alerts,
    auditHistory,
    recommendedAction: { message: attention ? `Resolve the ${m.dependencyHealth.toLowerCase()} dependency and re-run integration checks before the next release window.` : `Keep ${m.moduleName} on its current release cadence and monitor portfolio health weekly.`, owner: m.technicalOwner, due: m.nextUpdate },
    releaseSummary: { currentVersion: m.currentVersion, targetVersion: m.targetVersion, releaseStatus: m.releaseStatus, targetDate: m.nextUpdate, approvalStatus: m.releaseStatus === "Candidate" ? "Pending" : m.releaseStatus === "Released" ? "Approved" : "Not Started", rollbackPlan: m.releaseStatus === "Candidate" ? "Drafted" : "Not Required" },
    productionEnablementStatus: "Not Requested",
    suspensionStatus: "Active",
    retirementStatus: "Active",
  };
}

/**
 * Hand-authored fixture for AI Beauty Advisor (MOD-2026-000009 / ai-beauty-advisor),
 * matching the reference design 1:1. Every other registered module falls back to
 * buildGeneric() above so the workspace never breaks regardless of which module
 * the registry links to.
 */
function buildAiBeautyAdvisor(m: EcosystemModule): EcosystemModuleDetail {
  return {
    module: m,
    moduleDescription: "AI-powered advisory module for guidance on personalized product recommendations, routines, and compliant beauty advice.",
    statusDomains: [
      { key: "lifecycle", label: "Business Lifecycle", value: "Pilot", tone: "warning" },
      { key: "operational", label: "Operational Status", value: "Operational", tone: "success" },
      { key: "release", label: "Release Status", value: "Release Candidate", tone: "warning" },
      { key: "production", label: "Production Enablement", value: "Controlled Pilot", tone: "warning" },
      { key: "configuration", label: "Configuration Status", value: "Partially Configured", tone: "warning" },
      { key: "integration", label: "Integration Readiness", value: "In Progress", tone: "warning" },
      { key: "dependency", label: "Dependency Health", value: "Attention Required", tone: "danger" },
      { key: "compliance", label: "Compliance Status", value: "Conditionally Approved", tone: "warning" },
      { key: "security", label: "Security Review", value: "Review Pending", tone: "warning" },
      { key: "risk", label: "Risk Level", value: "Medium", tone: "warning" },
    ],
    overviewMetrics: [
      { id: "health", label: "Module Health Score", value: "84/100", tone: "warning" },
      { id: "release-readiness", label: "Release Readiness", value: "86%", tone: "success" },
      { id: "config-completeness", label: "Configuration Completeness", value: "78%", tone: "warning" },
      { id: "integration-readiness", label: "Integration Readiness", value: "72%", tone: "warning" },
      { id: "dependency-health", label: "Dependency Health", value: "68%", tone: "warning" },
      { id: "security-readiness", label: "Security Readiness", value: "74%", tone: "warning" },
      { id: "compliance-readiness", label: "Compliance Readiness", value: "82%", tone: "success" },
      { id: "adoption-rate", label: "Adoption Rate", value: "41%", tone: "warning" },
      { id: "availability", label: "Availability", value: "98.9%", tone: "success" },
      { id: "error-rate", label: "Error Rate", value: "1.8%", tone: "warning" },
      { id: "active-users", label: "Monthly Active Users", value: "486", tone: "neutral" },
      { id: "transactions", label: "Monthly Conversations", value: "1,842", tone: "neutral" },
      { id: "pilot-accounts", label: "Pilot Accounts", value: "12", tone: "neutral" },
      { id: "open-alerts", label: "Open Alerts", value: "4", tone: "warning" },
      { id: "blocking-issues", label: "Blocking Issues", value: "3", tone: "danger" },
    ],
    lifecycleStages: buildLifecycleStages("Pilot"),
    governance: { businessOwner: "AI Product Team", technicalOwner: "AI Platform Engineering", lastReview: "Jul 16, 2026", approvalChain: "AI Platform Lead \u2192 CTO" },
    currentRelease: { currentVersion: "v0.9.0", targetVersion: "v1.0.0", releaseStatus: "Release Candidate", nextRelease: "Aug 1, 2026", rollbackPlan: "Drafted" },
    environmentSummary: { productionEnablement: "Controlled Pilot", countriesEnabledSummary: "Sri Lanka \u2014 LK", primaryRegion: "aws-ap-south-1", environmentHealth: "Healthy" },
    configSummary: { secretsSafeCompletion: 76, parameterCoverage: 86, configurationProgress: 78 },
    integrationSummary: { servicesTotalCompletion: 78, parameterCoverage: 86, integrationProgress: 78 },
    dependencySummary: { criticalDependencies: 3, requiredDependencies: 7, healthStatus: "Attention Required", impactRisk: "Medium" },
    featureFlags: [
      { id: "aba-flag-1", flagKey: "ai_advisor_enabled", state: "Enabled", audience: "Pilot Accounts", rollout: 100, approvalStatus: "Approved", expiry: "No expiry", updatedAt: "Jul 24, 2026" },
      { id: "aba-flag-2", flagKey: "ai_advisor_sinhala", state: "Enabled", audience: "Selected Pilot Users", rollout: 25, approvalStatus: "Approved", expiry: "Sep 1, 2026", updatedAt: "Jul 24, 2026" },
      { id: "aba-flag-3", flagKey: "ai_advisor_product_recommendations", state: "Enabled", audience: "Eligible Catalogue Only", rollout: 100, approvalStatus: "Conditionally Approved", expiry: "No expiry", updatedAt: "Jul 24, 2026" },
    ],
    configParameters: [
      { id: "aba-cfg-1", configKey: "advisor-provider", envVariable: "ADVISOR_PROVIDER", category: "Integration", environment: "ENV", currentValue: "Gemini", secret: false, required: true, validationStatus: "Pass", source: ".env", lastUpdated: "Jul 24, 2026", updatedBy: "AI Platform Eng" },
      { id: "aba-cfg-2", configKey: "advisor.default_language", envVariable: "ADVISOR_DEFAULT_LANGUAGE", category: "Safety", environment: "ENV", currentValue: "English", secret: false, required: true, validationStatus: "Pass", source: ".env", lastUpdated: "Jul 24, 2026", updatedBy: "System" },
      { id: "aba-cfg-3", configKey: "advisor.sinhala_enabled", envVariable: "ADVISOR_SINHALA_ENABLED", category: "Locale", environment: "ENV", currentValue: "Enabled", secret: false, required: true, validationStatus: "Pass", source: "Feature Flag", lastUpdated: "Jul 24, 2026", updatedBy: "System" },
      { id: "aba-cfg-4", configKey: "advisor.max_conversation_length", envVariable: "ADVISOR_MAX_CONVERSATION_LENGTH", category: "Business Logic", environment: "ENV", currentValue: "20", secret: false, required: true, validationStatus: "Pass", source: "Config service", lastUpdated: "Jul 24, 2026", updatedBy: "AI Platform Eng" },
      { id: "aba-cfg-5", configKey: "advisor_provider_api_key", envVariable: "ADVISOR_PROVIDER_API_KEY", category: "Secret", environment: "ENV", currentValue: "Secret Reference", secret: true, required: true, validationStatus: "Review Pending", source: "Secrets manager", lastUpdated: "Jul 24, 2026", updatedBy: "Secrets manager" },
    ],
    versionsReleases: [
      { id: "aba-ver-1", version: "v0.9.0", releaseType: "Minor", status: "Live", releasedOn: "Jun 18, 2026", releasedBy: "AI Platform Engineering", notes: "Current pilot build serving Sri Lanka pilot accounts." },
      { id: "aba-ver-2", version: "v1.0.0", releaseType: "Candidate", status: "Release Candidate", releasedOn: "Aug 1, 2026", releasedBy: "AI Platform Engineering", notes: "General availability candidate pending security and compliance sign-off." },
      { id: "aba-ver-3", version: "v0.8.0", releaseType: "Minor", status: "Superseded", releasedOn: "May 12, 2026", releasedBy: "AI Platform Engineering", notes: "Initial internal testing build." },
    ],
    environments: [
      { id: "aba-env-1", name: "Production", status: "Controlled Pilot", endpoint: "ai-beauty-advisor.slbeauty.internal", lastDeployed: "Jul 24, 2026", deployedBy: "AI Platform Engineering", driftStatus: "1 variable" },
      { id: "aba-env-2", name: "Staging", status: "Operational", endpoint: "ai-beauty-advisor.staging.slbeauty.internal", lastDeployed: "Jul 24, 2026", deployedBy: "AI Platform Engineering", driftStatus: "None" },
      { id: "aba-env-3", name: "Development", status: "Operational", endpoint: "ai-beauty-advisor.dev.slbeauty.internal", lastDeployed: "Jul 23, 2026", deployedBy: "AI Platform Engineering", driftStatus: "None" },
    ],
    dependencies: [
      { id: "aba-dep-1", name: "Gemini Provider API", type: "External Provider", direction: "Upstream", health: "Attention Required", criticality: "High", owner: "AI Platform Engineering" },
      { id: "aba-dep-2", name: "Product Catalogue Service", type: "Internal Service", direction: "Upstream", health: "Healthy", criticality: "High", owner: "Catalogue Engineering" },
      { id: "aba-dep-3", name: "Platform Auth Service", type: "Internal Service", direction: "Upstream", health: "Healthy", criticality: "Medium", owner: "AI Platform Engineering" },
      { id: "aba-dep-4", name: "Beauty Issue Analyzer", type: "Internal Module", direction: "Downstream", health: "Blocked", criticality: "Medium", owner: "AI Product Team" },
    ],
    integrations: [
      { id: "aba-int-1", name: "Gemini Provider", provider: "Google", category: "AI / ML", status: "Attention Required", lastChecked: "Jul 24, 2026", latency: "640ms" },
      { id: "aba-int-2", name: "Product Catalogue API", provider: "Internal", category: "Commerce", status: "Healthy", lastChecked: "Jul 24, 2026", latency: "120ms" },
      { id: "aba-int-3", name: "SMS Service", provider: "Internal", category: "Messaging", status: "Healthy", lastChecked: "Jul 24, 2026", latency: "160ms" },
    ],
    countryReadiness: [
      { id: "aba-country-1", country: "Sri Lanka", isoCode: "LK", availability: "Pilot Enabled", businessApproval: "Approved", legalReview: "Approved", privacyReview: "Conditionally Approved", languages: "English / Sinhala", currency: "LKR", environment: "Pilot", effectiveDate: "Jul 18, 2026" },
      { id: "aba-country-2", country: "Canada", isoCode: "CA", availability: "Planning", businessApproval: "Pending", legalReview: "Pending", privacyReview: "Pending", languages: "English", currency: "CAD", environment: "Not Scheduled", effectiveDate: "None" },
    ],
    accessRoles: [
      { id: "aba-role-1", role: "AI Platform Engineering", permissionScope: "Full Access", environment: "Pilot", view: "Yes", configure: "Yes", release: "Review", enableProduction: "No", manageFlags: "Yes", viewAudit: "Yes", lastUpdated: "Jul 24, 2026" },
      { id: "aba-role-2", role: "Security Team", permissionScope: "Review Access", environment: "All", view: "Yes", configure: "No", release: "Review Required", enableProduction: "No", manageFlags: "No", viewAudit: "Yes", lastUpdated: "Jul 24, 2026" },
      { id: "aba-role-3", role: "Compliance Team", permissionScope: "Review Access", environment: "All", view: "Yes", configure: "No", release: "Review Required", enableProduction: "No", manageFlags: "No", viewAudit: "Yes", lastUpdated: "Jul 24, 2026" },
      { id: "aba-role-4", role: "Product Manager", permissionScope: "Edit Access", environment: "Pilot", view: "Yes", configure: "Yes", release: "Approval Required", enableProduction: "No", manageFlags: "Yes", viewAudit: "Review", lastUpdated: "Jul 24, 2026" },
      { id: "aba-role-5", role: "Operations Team", permissionScope: "Read Access", environment: "All", view: "Yes", configure: "No", release: "No", enableProduction: "No", manageFlags: "No", viewAudit: "Review", lastUpdated: "Jul 24, 2026" },
      { id: "aba-role-6", role: "Audit Team", permissionScope: "Read Access", environment: "All", view: "Yes", configure: "No", release: "No", enableProduction: "No", manageFlags: "No", viewAudit: "Yes", lastUpdated: "Jul 24, 2026" },
      { id: "aba-role-7", role: "Business Stakeholder", permissionScope: "Read Access", environment: "Dashboard", view: "Yes", configure: "No", release: "No", enableProduction: "No", manageFlags: "No", viewAudit: "Review", lastUpdated: "Jul 24, 2026" },
    ],
    securityFindings: [
      { id: "aba-finding-1", title: "Gemini provider latency exceeds pilot SLA target", severity: "Medium", status: "Open", discovered: "Jul 22, 2026", owner: "AI Platform Engineering" },
      { id: "aba-finding-2", title: "Eligible product coverage validation incomplete", severity: "Medium", status: "Open", discovered: "Jul 23, 2026", owner: "AI Product Team" },
      { id: "aba-finding-3", title: "Minor user-control review pending", severity: "Low", status: "Open", discovered: "Jul 24, 2026", owner: "Compliance Team" },
    ],
    complianceDetail: { securityReviewStatus: "Review Pending", openFindings: 3, criticalFindings: 0, highFindings: 1, mediumFindings: 2, privacyReviewRequired: "Yes", consentRequirement: "Required", dataRetention: "Defined", sensitiveDataHandling: "Restricted" },
    healthPerformance: {
      requestVolume: [
        { day: "Jul 18", value: 2450 },
        { day: "Jul 19", value: 2680 },
        { day: "Jul 20", value: 2510 },
        { day: "Jul 21", value: 2790 },
        { day: "Jul 22", value: 2960 },
        { day: "Jul 23", value: 2870 },
        { day: "Jul 24", value: 3010 },
      ],
      averageLatency: "2.4s", latencyTrend: "-3% vs prev 7 days",
      uptime: "99.8%", uptimeTrend: "+0.2% vs prev 7 days",
      recommendationSuccess: "97.8%", recommendationTrend: "+1.2% vs prev 7 days",
      errorTrend: "1.8%", errorTrendChange: "-0.3% vs prev 7 days",
    },
    adoptionInsights: {
      monthlyActiveUsers: 486, activeUsersTrend: "+12% vs prev month",
      monthlyConversations: 1842, conversationsTrend: "+1.2% vs prev month",
      adoptionRate: 41, adoptionTrend: "+4% vs prev month",
      adoptionByCohort: [
        { label: "Pilot Accounts (Sri Lanka)", value: 41 },
        { label: "Sinhala-language sessions", value: 25 },
        { label: "Product recommendation follow-through", value: 34 },
      ],
    },
    alerts: [
      { id: "aba-alert-1", message: "Security review pending", tone: "warning", due: "Jul 28, 2026" },
      { id: "aba-alert-2", message: "Gemini provider latency above target", tone: "danger", due: "Jul 27, 2026" },
      { id: "aba-alert-3", message: "Eligible product coverage incomplete", tone: "warning", due: "Jul 29, 2026" },
      { id: "aba-alert-4", message: "Minor user-control review pending", tone: "warning", due: "Jul 30, 2026" },
    ],
    auditHistory: [
      { id: "aba-audit-1", timestamp: "Jul 24, 2026 \u2014 4:10 PM", actor: "System", action: "Registry sync", detail: "Module health, integration and adoption metrics refreshed from the last sync window." },
      { id: "aba-audit-2", timestamp: "Jul 22, 2026 \u2014 11:05 AM", actor: "AI Platform Engineering", action: "Security review requested", detail: "Requested ahead of the Aug 1, 2026 production candidate review." },
      { id: "aba-audit-3", timestamp: "Jun 18, 2026 \u2014 9:00 AM", actor: "AI Platform Engineering", action: "Release published", detail: "v0.9.0 released to the Sri Lanka pilot cohort." },
      { id: "aba-audit-4", timestamp: "May 12, 2026 \u2014 2:30 PM", actor: "AI Product Team", action: "Module registered", detail: "AI Beauty Advisor added to the ecosystem module registry as a planned module." },
    ],
    recommendedAction: {
      message: "Complete pending security review, confirm product eligibility coverage, and approve pilot-to-release readiness before the Aug 1, 2026 production release.",
      owner: "AI Platform Engineering",
      due: "Jul 28, 2026 - 5:00 PM",
    },
    releaseSummary: { currentVersion: "v0.9.0", targetVersion: "v1.0.0", releaseStatus: "Release Candidate", targetDate: "Aug 1, 2026", approvalStatus: "Pending", rollbackPlan: "Drafted" },
    productionEnablementStatus: "Not Requested",
    suspensionStatus: "Active",
    retirementStatus: "Active",
  };
}

const bespokeBuilders: Record<string, (m: EcosystemModule) => EcosystemModuleDetail> = {
  "ai-beauty-advisor": buildAiBeautyAdvisor,
};

const detailCache = new Map<string, EcosystemModuleDetail>();

export function getModuleDetailFixture(moduleKey: string): EcosystemModuleDetail | null {
  if (detailCache.has(moduleKey)) return detailCache.get(moduleKey)!;
  const registryModule = mockEcosystemModules.find((candidate) => candidate.moduleKey === moduleKey);
  if (!registryModule) return null;
  const build = bespokeBuilders[moduleKey] ?? buildGeneric;
  const detail = build(registryModule);
  detailCache.set(moduleKey, detail);
  return detail;
}

export function resetModuleDetailFixture(moduleKey: string) {
  detailCache.delete(moduleKey);
}

