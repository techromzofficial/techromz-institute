import {
  createMockEcosystemModule,
  mockEcosystemModuleDashboard,
  mockEcosystemModules,
} from "@/mocks/admin/ecosystemModules.mock";
import type {
  EcosystemModule,
  EcosystemModuleDashboard,
  EcosystemModuleFilters,
  EcosystemModulePage,
  ModulePermissions,
  ModuleRegistrationDraft,
} from "@/features/admin/ecosystem-modules/types";

function includesValue(value: string | number | null, query: string) {
  return String(value ?? "").toLowerCase().includes(query.toLowerCase());
}

function matchesMetric(module: EcosystemModule, metric?: string) {
  switch (metric) {
    case "active": return module.operationalStatus === "Operational" && module.productionEnabled;
    case "pilot": return module.lifecycle === "Pilot";
    case "coming-soon": return module.lifecycle === "Coming Soon";
    case "planned": return module.lifecycle === "Planned";
    case "needs-attention": return module.riskLevel === "High" || module.dependencyHealth === "Attention Required";
    case "operational": return module.operationalStatus === "Operational";
    case "degraded": return module.operationalStatus === "Degraded";
    case "blocked": return module.releaseStatus === "Blocked";
    case "pending-config": return module.configurationStatus === "Pending Review";
    case "integration-issues": return ["In Progress", "Attention Required", "Degraded"].includes(module.integrationReadiness);
    case "dependency-risk": return module.dependencyHealth === "Attention Required" || module.dependencyHealth === "Blocked";
    case "countries-enabled": return module.countriesEnabled > 0;
    case "average-health": return module.healthScore < 85;
    default: return true;
  }
}

function matchesQuickFilter(module: EcosystemModule, quick?: string) {
  switch (quick) {
    case "operational": return module.operationalStatus === "Operational";
    case "pilot": return module.lifecycle === "Pilot";
    case "release-candidate": return module.releaseStatus === "Candidate";
    case "requires-attention": return module.riskLevel === "High" || module.dependencyHealth === "Attention Required";
    case "high-risk": return module.riskLevel === "High";
    case "not-configured": return module.configurationStatus === "Not Configured";
    case "blocked": return module.releaseStatus === "Blocked";
    case "upcoming-releases": return module.releaseStatus === "Candidate" || module.nextUpdate !== "-";
    default: return true;
  }
}

export async function fetchEcosystemModules(filters: EcosystemModuleFilters = {}): Promise<EcosystemModulePage> {
  let rows = [...mockEcosystemModules];
  const query = filters.search?.trim();

  if (query) {
    rows = rows.filter((module) => [
      module.publicReference, module.databaseModuleId, module.moduleName, module.moduleKey,
      module.primaryOwner, module.technicalOwner,
    ].some((value) => includesValue(value, query)));
  }
  if (filters.lifecycle) rows = rows.filter((module) => module.lifecycle === filters.lifecycle);
  if (filters.operationalStatus) rows = rows.filter((module) => module.operationalStatus === filters.operationalStatus);
  if (filters.owner) rows = rows.filter((module) => module.primaryOwner === filters.owner);
  if (filters.category) rows = rows.filter((module) => module.category === filters.category);
  if (filters.region) rows = rows.filter((module) => module.region === filters.region);
  if (filters.compliance) rows = rows.filter((module) => module.complianceStatus === filters.compliance);
  if (filters.risk) rows = rows.filter((module) => module.riskLevel === filters.risk);
  if (filters.release) rows = rows.filter((module) => module.releaseStatus === filters.release);
  if (filters.environment) rows = rows.filter((module) => module.environment === filters.environment);
  rows = rows.filter((module) => matchesMetric(module, filters.metric));
  rows = rows.filter((module) => matchesQuickFilter(module, filters.quick));

  const sortKey = filters.sort ?? "moduleName";
  const direction = filters.direction ?? "asc";
  rows.sort((left, right) => {
    const leftValue = left[sortKey];
    const rightValue = right[sortKey];
    const result = typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue ?? "").localeCompare(String(rightValue ?? ""));
    return direction === "asc" ? result : -result;
  });

  const pageSize = Math.min(25, Math.max(1, filters.pageSize ?? 5));
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);
  return { data: rows.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages };
}

export async function fetchEcosystemModuleDashboard(): Promise<EcosystemModuleDashboard> {
  return mockEcosystemModuleDashboard;
}

export async function fetchEcosystemModuleByKey(moduleKey: string): Promise<EcosystemModule | null> {
  return mockEcosystemModules.find((module) => module.moduleKey === moduleKey) ?? null;
}

export function getModulePermissions(readOnly = false): ModulePermissions {
  return {
    canRegister: !readOnly,
    canCompare: !readOnly,
    canExport: !readOnly,
    canManageReleases: !readOnly,
  };
}

export async function registerEcosystemModule(draft: ModuleRegistrationDraft): Promise<EcosystemModule> {
  const moduleName = draft.moduleName.trim();
  const moduleKey = draft.moduleKey.trim().toLowerCase();
  if (!moduleName || !moduleKey || !draft.primaryOwner || !draft.technicalOwner) {
    throw new Error("Module name, module key, primary owner and technical owner are required.");
  }
  if (!/^[a-z0-9-]+$/.test(moduleKey)) {
    throw new Error("Module key can use lowercase letters, numbers and hyphens only.");
  }
  if (mockEcosystemModules.some((module) => module.moduleKey === moduleKey)) {
    throw new Error("That module key is already registered.");
  }

  const createdModule = createMockEcosystemModule({
    id: `module-${Date.now()}`,
    publicReference: `MOD-2036-${String(mockEcosystemModules.length + 1).padStart(5, "0")}`,
    databaseModuleId: mockEcosystemModules.length + 1,
    moduleName,
    moduleKey,
    category: draft.category || "Operations",
    lifecycle: "Planned",
    operationalStatus: "Unavailable",
    releaseStatus: "Not Scheduled",
    currentVersion: "-",
    targetVersion: "v1.0.0",
    productionEnabled: false,
    configurationStatus: "Not Configured",
    integrationReadiness: "Not Started",
    dependencyHealth: "Not Assessed",
    complianceStatus: "Not Assessed",
    securityReview: "Not Started",
    countriesEnabled: 0,
    activeUsers: 0,
    monthlyTransactions: 0,
    adoptionRate: 0,
    availability: null,
    errorRate: null,
    healthScore: 0,
    riskLevel: "Low",
    riskTrend: "-",
    primaryOwner: draft.primaryOwner,
    technicalOwner: draft.technicalOwner,
    lastRelease: "-",
    nextUpdate: "-",
    lastUpdated: "Jul 27, 2026 10:32 AM",
    environment: draft.environment || "Development",
    region: "Sri Lanka",
  });
  mockEcosystemModules.unshift(createdModule);
  return createdModule;
}

export async function exportEcosystemModuleReport(filters: EcosystemModuleFilters = {}): Promise<string> {
  const results = await fetchEcosystemModules({ ...filters, page: 1, pageSize: 25 });
  const headers = ["Public reference", "Database module ID", "Module name", "Module key", "Lifecycle", "Operational status", "Health score", "Risk level"];
  const rows = results.data.map((module) => [
    module.publicReference, module.databaseModuleId, module.moduleName, module.moduleKey,
    module.lifecycle, module.operationalStatus, module.healthScore, module.riskLevel,
  ]);
  return [headers.join(","), ...rows.map((row) => row.map((item) => `\"${String(item).replaceAll("\"", "\"\"")}\"`).join(","))].join("\n");
}

