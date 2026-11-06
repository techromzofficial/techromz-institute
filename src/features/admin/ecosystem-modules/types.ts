export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type EcosystemModule = {
  id: string;
  publicReference: string;
  databaseModuleId: number;
  moduleName: string;
  moduleKey: string;
  category: string;
  lifecycle: string;
  operationalStatus: string;
  releaseStatus: string;
  currentVersion: string;
  targetVersion: string;
  productionEnabled: boolean;
  configurationStatus: string;
  integrationReadiness: string;
  dependencyHealth: string;
  complianceStatus: string;
  securityReview: string;
  countriesEnabled: number;
  activeUsers: number;
  monthlyTransactions: number;
  adoptionRate: number;
  availability: number | null;
  errorRate: number | null;
  healthScore: number;
  riskLevel: string;
  riskTrend: string;
  primaryOwner: string;
  technicalOwner: string;
  lastRelease: string;
  nextUpdate: string;
  lastUpdated: string;
  environment: string;
  region: string;
};

export type EcosystemModuleFilters = {
  search?: string;
  lifecycle?: string;
  operationalStatus?: string;
  owner?: string;
  category?: string;
  region?: string;
  compliance?: string;
  risk?: string;
  release?: string;
  environment?: string;
  metric?: string;
  quick?: string;
  sort?: keyof EcosystemModule;
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type ModuleKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: StatusTone;
};

export type PortfolioHealthMetric = {
  label: string;
  value: string;
  progress: number;
  tone: "success" | "warning";
};

export type EcosystemModuleDashboard = {
  kpis: ModuleKpi[];
  portfolioHealth: PortfolioHealthMetric[];
  generatedAt: string;
  source: string;
  freshness: "fresh" | "stale" | "partial";
};

export type EcosystemModulePage = {
  data: EcosystemModule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ModuleRegistrationDraft = {
  moduleName: string;
  moduleKey: string;
  category: string;
  primaryOwner: string;
  technicalOwner: string;
  environment: string;
};

export type ModulePermissions = {
  canRegister: boolean;
  canCompare: boolean;
  canExport: boolean;
  canManageReleases: boolean;
};

// ---------------------------------------------------------------------------
// Screen 21 - Ecosystem Module Detail & Configuration
// ---------------------------------------------------------------------------

export type StatusDomainField = {
  key: string;
  label: string;
  value: string;
  tone: StatusTone;
};

export type LifecycleStageState = "complete" | "current" | "upcoming";

export type LifecycleStage = {
  key: string;
  label: string;
  state: LifecycleStageState;
};

export type OverviewMetric = {
  id: string;
  label: string;
  value: string;
  tone: StatusTone;
};

export type GovernanceInfo = {
  businessOwner: string;
  technicalOwner: string;
  lastReview: string;
  approvalChain: string;
};

export type CurrentReleaseInfo = {
  currentVersion: string;
  targetVersion: string;
  releaseStatus: string;
  nextRelease: string;
  rollbackPlan: string;
};

export type EnvironmentSummaryInfo = {
  productionEnablement: string;
  countriesEnabledSummary: string;
  primaryRegion: string;
  environmentHealth: string;
};

export type ConfigSummaryInfo = {
  secretsSafeCompletion: number;
  parameterCoverage: number;
  configurationProgress: number;
};

export type IntegrationSummaryInfo = {
  servicesTotalCompletion: number;
  parameterCoverage: number;
  integrationProgress: number;
};

export type DependencySummaryInfo = {
  criticalDependencies: number;
  requiredDependencies: number;
  healthStatus: string;
  impactRisk: string;
};

export type FeatureFlagRow = {
  id: string;
  flagKey: string;
  state: "Enabled" | "Disabled";
  audience: string;
  rollout: number;
  approvalStatus: string;
  expiry: string;
  updatedAt: string;
};

export type ConfigParameterRow = {
  id: string;
  configKey: string;
  envVariable: string;
  category: string;
  environment: string;
  currentValue: string;
  secret: boolean;
  required: boolean;
  validationStatus: string;
  source: string;
  lastUpdated: string;
  updatedBy: string;
};

export type VersionReleaseRow = {
  id: string;
  version: string;
  releaseType: "Major" | "Minor" | "Patch" | "Candidate";
  status: string;
  releasedOn: string;
  releasedBy: string;
  notes: string;
};

export type EnvironmentRow = {
  id: string;
  name: string;
  status: string;
  endpoint: string;
  lastDeployed: string;
  deployedBy: string;
  driftStatus: string;
};

export type DependencyRow = {
  id: string;
  name: string;
  type: string;
  direction: "Upstream" | "Downstream";
  health: string;
  criticality: "Low" | "Medium" | "High";
  owner: string;
};

export type IntegrationRow = {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  lastChecked: string;
  latency: string;
};

export type CountryReadinessRow = {
  id: string;
  country: string;
  isoCode: string;
  availability: string;
  businessApproval: string;
  legalReview: string;
  privacyReview: string;
  languages: string;
  currency: string;
  environment: string;
  effectiveDate: string;
};

export type AccessRoleRow = {
  id: string;
  role: string;
  permissionScope: string;
  environment: string;
  view: string;
  configure: string;
  release: string;
  enableProduction: string;
  manageFlags: string;
  viewAudit: string;
  lastUpdated: string;
};

export type SecurityFindingRow = {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: string;
  discovered: string;
  owner: string;
};

export type ComplianceDetailInfo = {
  securityReviewStatus: string;
  openFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  privacyReviewRequired: string;
  consentRequirement: string;
  dataRetention: string;
  sensitiveDataHandling: string;
};

export type RequestVolumePoint = { day: string; value: number };

export type HealthPerformanceInfo = {
  requestVolume: RequestVolumePoint[];
  averageLatency: string;
  latencyTrend: string;
  uptime: string;
  uptimeTrend: string;
  recommendationSuccess: string;
  recommendationTrend: string;
  errorTrend: string;
  errorTrendChange: string;
};

export type AdoptionCohort = { label: string; value: number };

export type AdoptionInsightsInfo = {
  monthlyActiveUsers: number;
  activeUsersTrend: string;
  monthlyConversations: number;
  conversationsTrend: string;
  adoptionRate: number;
  adoptionTrend: string;
  adoptionByCohort: AdoptionCohort[];
};

export type ModuleAlertRow = {
  id: string;
  message: string;
  tone: StatusTone;
  due: string;
};

export type AuditHistoryEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
};

export type RecommendedActionInfo = {
  message: string;
  owner: string;
  due: string;
};

export type ModuleReleaseSummaryInfo = {
  currentVersion: string;
  targetVersion: string;
  releaseStatus: string;
  targetDate: string;
  approvalStatus: string;
  rollbackPlan: string;
};

export type EcosystemModuleDetail = {
  module: EcosystemModule;
  moduleDescription: string;
  statusDomains: StatusDomainField[];
  overviewMetrics: OverviewMetric[];
  lifecycleStages: LifecycleStage[];
  governance: GovernanceInfo;
  currentRelease: CurrentReleaseInfo;
  environmentSummary: EnvironmentSummaryInfo;
  configSummary: ConfigSummaryInfo;
  integrationSummary: IntegrationSummaryInfo;
  dependencySummary: DependencySummaryInfo;
  featureFlags: FeatureFlagRow[];
  configParameters: ConfigParameterRow[];
  versionsReleases: VersionReleaseRow[];
  environments: EnvironmentRow[];
  dependencies: DependencyRow[];
  integrations: IntegrationRow[];
  countryReadiness: CountryReadinessRow[];
  accessRoles: AccessRoleRow[];
  securityFindings: SecurityFindingRow[];
  complianceDetail: ComplianceDetailInfo;
  healthPerformance: HealthPerformanceInfo;
  adoptionInsights: AdoptionInsightsInfo;
  alerts: ModuleAlertRow[];
  auditHistory: AuditHistoryEntry[];
  recommendedAction: RecommendedActionInfo;
  releaseSummary: ModuleReleaseSummaryInfo;
  productionEnablementStatus: "Not Requested" | "Pending Approval" | "Approved";
  suspensionStatus: "Active" | "Suspension Pending";
  retirementStatus: "Active" | "Retirement Pending";
};

export type ModuleDetailPermissions = {
  canManageConfiguration: boolean;
  canRequestReview: boolean;
  canScheduleRelease: boolean;
  canRequestProductionEnablement: boolean;
  canSuspend: boolean;
  canRetire: boolean;
};

export type ProductionEnablementDraft = {
  reason: string;
  evidenceLink: string;
  securityApproved: boolean;
  complianceApproved: boolean;
  pilotMetricsReviewed: boolean;
};

export type ScheduleReleaseDraft = {
  reason: string;
  version: string;
  scheduledDate: string;
};

export type SimpleReasonDraft = {
  reason: string;
};

export const DETAIL_TABS = [
  { key: "overview", label: "Module Overview" },
  { key: "configuration", label: "Configuration" },
  { key: "versions", label: "Versions & Releases" },
  { key: "environments", label: "Environments" },
  { key: "dependencies", label: "Dependencies" },
  { key: "integrations", label: "Integrations" },
  { key: "feature-flags", label: "Feature Flags" },
  { key: "country-availability", label: "Country Availability" },
  { key: "access-roles", label: "Access & Roles" },
  { key: "security", label: "Security" },
  { key: "compliance-privacy", label: "Compliance & Privacy" },
  { key: "health-performance", label: "Health & Performance" },
  { key: "adoption", label: "Adoption" },
  { key: "alerts", label: "Alerts" },
  { key: "audit-history", label: "Audit History" },
] as const;

export type DetailTabKey = (typeof DETAIL_TABS)[number]["key"];

