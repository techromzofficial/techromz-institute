import type {
  EcosystemModule,
  EcosystemModuleDashboard,
  ModuleKpi,
  PortfolioHealthMetric,
} from "@/features/admin/ecosystem-modules/types";

const moduleDefaults: Omit<EcosystemModule, "id" | "publicReference" | "databaseModuleId" | "moduleName" | "moduleKey"> = {
  category: "Operations",
  lifecycle: "Operational",
  operationalStatus: "Operational",
  releaseStatus: "Released",
  currentVersion: "v2.4.0",
  targetVersion: "v2.4.1",
  productionEnabled: true,
  configurationStatus: "Configured",
  integrationReadiness: "Healthy",
  dependencyHealth: "Healthy",
  complianceStatus: "Approved",
  securityReview: "Approved",
  countriesEnabled: 4,
  activeUsers: 860,
  monthlyTransactions: 6240,
  adoptionRate: 74,
  availability: 99.2,
  errorRate: 0.5,
  healthScore: 91,
  riskLevel: "Low",
  riskTrend: "Stable",
  primaryOwner: "Elena Vance",
  technicalOwner: "Arjun Perera",
  lastRelease: "Jul 10, 2026",
  nextUpdate: "Aug 1, 2026",
  lastUpdated: "Jul 27, 2026 10:32 AM",
  environment: "Production",
  region: "Sri Lanka",
};

export function createMockEcosystemModule(
  overrides: Partial<EcosystemModule> & Pick<EcosystemModule, "id" | "publicReference" | "databaseModuleId" | "moduleName" | "moduleKey">,
): EcosystemModule {
  return { ...moduleDefaults, ...overrides };
}

export const mockEcosystemModules: EcosystemModule[] = [
  createMockEcosystemModule({
    id: "module-001", publicReference: "MOD-2036-00001", databaseModuleId: 1, moduleName: "B2C Marketplace", moduleKey: "b2c-marketplace", category: "Commerce", countriesEnabled: 11, activeUsers: 12545, monthlyTransactions: 45210, adoptionRate: 92, availability: 99.4, errorRate: 0.4, healthScore: 95,
  }),
  createMockEcosystemModule({
    id: "module-009", publicReference: "MOD-2036-00009", databaseModuleId: 9, moduleName: "AI Beauty Advisor", moduleKey: "ai-beauty-advisor", category: "AI", lifecycle: "Pilot", releaseStatus: "Candidate", currentVersion: "v0.9.0", targetVersion: "v1.0.0", integrationReadiness: "In Progress", dependencyHealth: "Attention Required", complianceStatus: "Conditionally Approved", securityReview: "Pending Review", countriesEnabled: 1, activeUsers: 460, monthlyTransactions: 1642, adoptionRate: 41, availability: 96.1, errorRate: 1.8, healthScore: 84, riskLevel: "Medium", riskTrend: "Rising", primaryOwner: "AI Product Team", technicalOwner: "AI Platform Team", lastRelease: "Jun 18, 2026", nextUpdate: "Aug 1, 2026", environment: "Staging", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-010", publicReference: "MOD-2036-00010", databaseModuleId: 10, moduleName: "B2B Wholesale", moduleKey: "b2b-wholesale", category: "Wholesale", lifecycle: "Coming Soon", operationalStatus: "Partially Configured", releaseStatus: "Not Scheduled", currentVersion: "v0.0.0", targetVersion: "v1.0.0", productionEnabled: false, configurationStatus: "Partially Configured", integrationReadiness: "In Progress", countriesEnabled: 0, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 0, availability: null, errorRate: null, healthScore: 72, riskLevel: "Medium", riskTrend: "Stable", primaryOwner: "Ruwan Das", technicalOwner: "Sanjiv Weerakoon", lastRelease: "-", nextUpdate: "-", environment: "Development", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-014", publicReference: "MOD-2036-00014", databaseModuleId: 14, moduleName: "Beauty Issue Analyzer", moduleKey: "beauty-issue-analyzer", category: "AI", lifecycle: "Planned", operationalStatus: "Unavailable", releaseStatus: "Blocked", currentVersion: "-", targetVersion: "Research Prototype", productionEnabled: false, configurationStatus: "Not Configured", integrationReadiness: "Not Started", dependencyHealth: "Blocked", complianceStatus: "Not Assessed", securityReview: "Not Started", countriesEnabled: 0, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 0, availability: null, errorRate: null, healthScore: 45, riskLevel: "High", riskTrend: "-", primaryOwner: "Dilan Perera", technicalOwner: "Tharindu Gunasekara", lastRelease: "-", nextUpdate: "-", environment: "Development", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-002", publicReference: "MOD-2036-00002", databaseModuleId: 2, moduleName: "Orders & Fulfilment", moduleKey: "orders-fulfilment", category: "Commerce", activeUsers: 10820, monthlyTransactions: 38790, adoptionRate: 89, availability: 99.6, errorRate: 0.3, healthScore: 94,
  }),
  createMockEcosystemModule({
    id: "module-003", publicReference: "MOD-2036-00003", databaseModuleId: 3, moduleName: "Logistics Network", moduleKey: "logistics-network", category: "Logistics", integrationReadiness: "Degraded", dependencyHealth: "Attention Required", activeUsers: 7200, monthlyTransactions: 29620, adoptionRate: 81, availability: 98.4, errorRate: 1.4, healthScore: 79, riskLevel: "Medium", riskTrend: "Rising", primaryOwner: "Nimali Fernando", technicalOwner: "Kasun Silva", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-004", publicReference: "MOD-2036-00004", databaseModuleId: 4, moduleName: "Customer Support", moduleKey: "customer-support", category: "Support", activeUsers: 6440, monthlyTransactions: 18450, adoptionRate: 74, availability: 99.0, errorRate: 0.8, healthScore: 87, primaryOwner: "Maya Perera", technicalOwner: "Ravin Fernando", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-005", publicReference: "MOD-2036-00005", databaseModuleId: 5, moduleName: "Analytics Pipeline", moduleKey: "analytics-pipeline", category: "Analytics", operationalStatus: "Degraded", configurationStatus: "Pending Review", integrationReadiness: "Attention Required", dependencyHealth: "Attention Required", activeUsers: 5240, monthlyTransactions: 13600, adoptionRate: 66, availability: 97.8, errorRate: 2.2, healthScore: 70, riskLevel: "High", riskTrend: "Rising", primaryOwner: "Suresh Kumar", technicalOwner: "Ishan Dissanayake", environment: "Production", region: "India",
  }),
  createMockEcosystemModule({
    id: "module-006", publicReference: "MOD-2036-00006", databaseModuleId: 6, moduleName: "Salon & Spa Portal", moduleKey: "salon-spa-portal", category: "Partner", lifecycle: "Coming Soon", operationalStatus: "Configured", releaseStatus: "Candidate", currentVersion: "v0.8.0", targetVersion: "v1.0.0", productionEnabled: false, configurationStatus: "Configured", integrationReadiness: "Healthy", countriesEnabled: 2, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 44, availability: null, errorRate: null, healthScore: 78, riskLevel: "Low", primaryOwner: "Sanjana Wickram", technicalOwner: "Nuwan Peris", environment: "Staging", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-007", publicReference: "MOD-2036-00007", databaseModuleId: 7, moduleName: "Clinics & Dermatologists", moduleKey: "clinics-dermatologists", category: "Partner", lifecycle: "Coming Soon", operationalStatus: "Partially Configured", releaseStatus: "Not Scheduled", currentVersion: "v0.5.0", targetVersion: "v1.0.0", productionEnabled: false, configurationStatus: "Partially Configured", integrationReadiness: "In Progress", dependencyHealth: "Attention Required", countriesEnabled: 1, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 36, availability: null, errorRate: null, healthScore: 69, riskLevel: "Medium", primaryOwner: "Sanjana Wickram", technicalOwner: "Nuwan Peris", environment: "Staging", region: "India",
  }),
  createMockEcosystemModule({
    id: "module-008", publicReference: "MOD-2036-00008", databaseModuleId: 8, moduleName: "Academy & Training", moduleKey: "academy-training", category: "Learning", lifecycle: "Coming Soon", operationalStatus: "Configured", releaseStatus: "Candidate", currentVersion: "v0.7.0", targetVersion: "v1.0.0", productionEnabled: false, countriesEnabled: 1, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 29, availability: null, errorRate: null, healthScore: 76, riskLevel: "Low", primaryOwner: "Nethmi Jayasuriya", technicalOwner: "Ruwan Das", environment: "Staging", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-011", publicReference: "MOD-2036-00011", databaseModuleId: 11, moduleName: "Vendor Onboarding", moduleKey: "vendor-onboarding", category: "Operations", lifecycle: "Planned", operationalStatus: "Unavailable", releaseStatus: "Not Scheduled", currentVersion: "-", targetVersion: "v1.0.0", productionEnabled: false, configurationStatus: "Pending Review", integrationReadiness: "Not Started", dependencyHealth: "Healthy", complianceStatus: "Pending Review", securityReview: "Pending Review", countriesEnabled: 0, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 0, availability: null, errorRate: null, healthScore: 62, riskLevel: "Medium", primaryOwner: "Elena Vance", technicalOwner: "Arjun Perera", environment: "Development", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-012", publicReference: "MOD-2036-00012", databaseModuleId: 12, moduleName: "Loyalty Rewards", moduleKey: "loyalty-rewards", category: "Commerce", lifecycle: "Planned", operationalStatus: "Unavailable", releaseStatus: "Not Scheduled", currentVersion: "-", targetVersion: "v1.0.0", productionEnabled: false, configurationStatus: "Pending Review", integrationReadiness: "Not Started", dependencyHealth: "Healthy", complianceStatus: "Not Assessed", securityReview: "Not Started", countriesEnabled: 0, activeUsers: 0, monthlyTransactions: 0, adoptionRate: 0, availability: null, errorRate: null, healthScore: 61, riskLevel: "Low", primaryOwner: "Maya Perera", technicalOwner: "Ravin Fernando", environment: "Development", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-013", publicReference: "MOD-2036-00013", databaseModuleId: 13, moduleName: "Campaign Studio", moduleKey: "campaign-studio", category: "Marketing", operationalStatus: "Degraded", releaseStatus: "Released", integrationReadiness: "Degraded", dependencyHealth: "Healthy", countriesEnabled: 3, activeUsers: 2030, monthlyTransactions: 10570, adoptionRate: 58, availability: 98.1, errorRate: 1.6, healthScore: 76, riskLevel: "Medium", riskTrend: "Stable", primaryOwner: "Ishara Dias", technicalOwner: "Malith Perera", environment: "Production", region: "Sri Lanka",
  }),
  createMockEcosystemModule({
    id: "module-015", publicReference: "MOD-2036-00015", databaseModuleId: 15, moduleName: "Partner Insights", moduleKey: "partner-insights", category: "Analytics", lifecycle: "Pilot", operationalStatus: "Operational", releaseStatus: "Candidate", currentVersion: "v0.9.2", targetVersion: "v1.0.0", productionEnabled: false, configurationStatus: "Configured", integrationReadiness: "Healthy", dependencyHealth: "Healthy", countriesEnabled: 2, activeUsers: 300, monthlyTransactions: 890, adoptionRate: 32, availability: 97.2, errorRate: 1.1, healthScore: 80, riskLevel: "Low", primaryOwner: "Suresh Kumar", technicalOwner: "Ishan Dissanayake", environment: "Staging", region: "Singapore",
  }),
  createMockEcosystemModule({
    id: "module-016", publicReference: "MOD-2036-00016", databaseModuleId: 16, moduleName: "Compliance Hub", moduleKey: "compliance-hub", category: "Compliance", operationalStatus: "Operational", releaseStatus: "Released", activeUsers: 3120, monthlyTransactions: 12040, adoptionRate: 70, availability: 99.5, errorRate: 0.2, healthScore: 93, primaryOwner: "Elena Vance", technicalOwner: "Arjun Perera", environment: "Production", region: "Sri Lanka",
  }),
];

export const moduleKpis: ModuleKpi[] = [
  { id: "total", label: "Total Registered Modules", value: "16", detail: "Portfolio records", tone: "info" },
  { id: "active", label: "Active Modules", value: "8", detail: "Serving users", tone: "success" },
  { id: "pilot", label: "Pilot Modules", value: "1", detail: "Controlled rollout", tone: "info" },
  { id: "coming-soon", label: "Coming Soon", value: "4", detail: "Pre-release", tone: "neutral" },
  { id: "planned", label: "Planned Modules", value: "3", detail: "Roadmap", tone: "info" },
  { id: "needs-attention", label: "Modules Requiring Attention", value: "4", detail: "Action needed", tone: "danger" },
  { id: "operational", label: "Operational Modules", value: "11", detail: "Available portfolio", tone: "success" },
  { id: "degraded", label: "Degraded Modules", value: "2", detail: "Service health", tone: "warning" },
  { id: "blocked", label: "Blocked Releases", value: "1", detail: "Release intervention", tone: "danger" },
  { id: "pending-config", label: "Pending Configurations", value: "3", detail: "Configuration review", tone: "warning" },
  { id: "integration-issues", label: "Integration Issues", value: "5", detail: "Integration checks", tone: "warning" },
  { id: "dependency-risk", label: "Dependency Risks", value: "3", detail: "Dependency review", tone: "warning" },
  { id: "countries-enabled", label: "Countries Enabled", value: "1", detail: "Live territories", tone: "info" },
  { id: "average-health", label: "Average Module Health", value: "91%", detail: "Portfolio average", tone: "success" },
];

export const portfolioHealth: PortfolioHealthMetric[] = [
  { label: "Portfolio Health Score", value: "91/100", progress: 91, tone: "success" },
  { label: "Operational Availability", value: "99.4%", progress: 99.4, tone: "success" },
  { label: "Configuration Completeness", value: "88%", progress: 88, tone: "warning" },
  { label: "Integration Readiness", value: "84%", progress: 84, tone: "warning" },
  { label: "Dependency Health", value: "89%", progress: 89, tone: "success" },
  { label: "Compliance Readiness", value: "92%", progress: 92, tone: "success" },
  { label: "Release Readiness", value: "86%", progress: 86, tone: "warning" },
  { label: "Adoption Growth", value: "+12.8%", progress: 84, tone: "success" },
];

export const mockEcosystemModuleDashboard: EcosystemModuleDashboard = {
  kpis: moduleKpis,
  portfolioHealth,
  generatedAt: "Jul 27, 2026, 10:32 AM",
  source: "Module registry aggregate",
  freshness: "fresh",
};

