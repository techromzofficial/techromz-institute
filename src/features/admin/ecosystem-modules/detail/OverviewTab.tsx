"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  Cloud,
  Flag as FlagIcon,
  Globe2,
  HeartPulse,
  Landmark,
  Link2,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ConfigParameterRow, DetailTabKey, EcosystemModuleDetail, FeatureFlagRow } from "../types";
import { StatusPill, SectionCard, ViewDetailsLink, ProgressBar } from "./shared";
import styles from "./moduleDetail.module.css";

export function OverviewTab({
  detail,
  onNavigateTab,
  onEditFlag,
  onConfigAction,
}: {
  detail: EcosystemModuleDetail;
  onNavigateTab: (tab: DetailTabKey) => void;
  onEditFlag: (flag: FeatureFlagRow) => void;
  onConfigAction: (parameter: ConfigParameterRow) => void;
}) {
  const { governance, currentRelease, environmentSummary, configSummary, integrationSummary, dependencySummary } = detail;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section className={styles.summaryCardGrid}>
        <article className={styles.summaryCard}>
          <h3 className={styles.summaryCardTitle}><Users size={14} /> Governance</h3>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Business Owner</span><strong>{governance.businessOwner}</strong></div>
            <div className={styles.summaryRow}><span>Technical Owner</span><strong>{governance.technicalOwner}</strong></div>
            <div className={styles.summaryRow}><span>Last Review</span><strong>{governance.lastReview}</strong></div>
            <div className={styles.summaryRow}><span>Approval Chain</span><strong>{governance.approvalChain}</strong></div>
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("audit-history")} />
        </article>

        <article className={styles.summaryCard}>
          <h3 className={styles.summaryCardTitle}><Boxes size={14} /> Current Release</h3>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Current Version</span><strong>{currentRelease.currentVersion}</strong></div>
            <div className={styles.summaryRow}><span>Target Version</span><strong>{currentRelease.targetVersion}</strong></div>
            <div className={styles.summaryRow}><span>Release Status</span><StatusPill value={currentRelease.releaseStatus} tone={detail.statusDomains.find((f) => f.key === "release")?.tone ?? "neutral"} /></div>
            <div className={styles.summaryRow}><span>Next Release</span><strong>{currentRelease.nextRelease}</strong></div>
            <div className={styles.summaryRow}><span>Rollback Plan</span><StatusPill value={currentRelease.rollbackPlan} tone={currentRelease.rollbackPlan === "Required" ? "danger" : currentRelease.rollbackPlan === "Drafted" ? "warning" : "success"} /></div>
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("versions")} />
        </article>

        <article className={styles.summaryCard}>
          <h3 className={styles.summaryCardTitle}><Cloud size={14} /> Environment Summary</h3>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Production Enablement</span><StatusPill value={environmentSummary.productionEnablement} tone={detail.statusDomains.find((f) => f.key === "production")?.tone ?? "neutral"} /></div>
            <div className={styles.summaryRow}><span>Countries Enabled</span><strong>{environmentSummary.countriesEnabledSummary}</strong></div>
            <div className={styles.summaryRow}><span>Primary Region</span><strong>{environmentSummary.primaryRegion}</strong></div>
            <div className={styles.summaryRow}><span>Environment Health</span><StatusPill value={environmentSummary.environmentHealth} tone={environmentSummary.environmentHealth === "Healthy" ? "success" : "warning"} /></div>
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("environments")} />
        </article>

        <article className={styles.summaryCard}>
          <h3 className={styles.summaryCardTitle}><Settings2 size={14} /> Configuration Summary</h3>
          <div className={styles.summaryProgress}>
            <div><span>Secrets-safe completion</span><strong>{configSummary.secretsSafeCompletion}%</strong></div>
            <div><span>Parameter coverage</span><strong>{configSummary.parameterCoverage}%</strong></div>
            <div><span>Configuration Progress</span><strong>{configSummary.configurationProgress}%</strong></div>
            <ProgressBar value={configSummary.configurationProgress} tone={configSummary.configurationProgress >= 80 ? "success" : "warning"} />
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("configuration")} />
        </article>

        <article className={styles.summaryCard}>
          <h3 className={styles.summaryCardTitle}><Link2 size={14} /> Integration Summary</h3>
          <div className={styles.summaryProgress}>
            <div><span>Services-total completion</span><strong>{integrationSummary.servicesTotalCompletion}%</strong></div>
            <div><span>Parameter coverage</span><strong>{integrationSummary.parameterCoverage}%</strong></div>
            <div><span>Integration Progress</span><strong>{integrationSummary.integrationProgress}%</strong></div>
            <ProgressBar value={integrationSummary.integrationProgress} tone={integrationSummary.integrationProgress >= 80 ? "success" : "warning"} />
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("integrations")} />
        </article>

        <article className={styles.summaryCard}>
          <h3 className={styles.summaryCardTitle}><Landmark size={14} /> Dependency Summary</h3>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Critical Dependencies</span><strong>{dependencySummary.criticalDependencies}</strong></div>
            <div className={styles.summaryRow}><span>Required Dependencies</span><strong>{dependencySummary.requiredDependencies}</strong></div>
            <div className={styles.summaryRow}><span>Health Status</span><StatusPill value={dependencySummary.healthStatus} tone={detail.statusDomains.find((f) => f.key === "dependency")?.tone ?? "neutral"} /></div>
            <div className={styles.summaryRow}><span>Impact Risk</span><StatusPill value={dependencySummary.impactRisk} tone={dependencySummary.impactRisk === "High" ? "danger" : dependencySummary.impactRisk === "Medium" ? "warning" : "success"} /></div>
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("dependencies")} />
        </article>
      </section>

      <SectionCard title="Feature Flags & Rollout" description="Flags, rollout percentage and audience for this module." aside={<ViewDetailsLink onClick={() => onNavigateTab("feature-flags")} label="Manage flags" />}>
        <table className={styles.dataTable}>
          <thead>
            <tr><th>Flag Key</th><th>State</th><th>Audience</th><th>Rollout</th><th>Updated At</th><th>Action</th></tr>
          </thead>
          <tbody>
            {detail.featureFlags.map((flag) => (
              <tr key={flag.id}>
                <td><strong>{flag.flagKey}</strong></td>
                <td><StatusPill value={flag.state} tone={flag.state === "Enabled" ? "success" : "neutral"} /></td>
                <td>{flag.audience}</td>
                <td>{flag.rollout}%</td>
                <td>{flag.updatedAt}</td>
                <td><button type="button" className={styles.rowAction} onClick={() => onEditFlag(flag)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard title="Active Configuration Parameters" description="Configuration key and environment variable are tracked separately. Secret values are never rendered." aside={<ViewDetailsLink onClick={() => onNavigateTab("configuration")} label="Manage configuration" />}>
        <table className={`${styles.dataTable} ${styles.extraWide}`}>
          <thead>
            <tr><th>Configuration Key</th><th>Environment Variable</th><th>Category</th><th>Environment</th><th>Current Value</th><th>Secret</th><th>Required</th><th>Validation Status</th><th>Source</th><th>Last Updated</th><th>Updated By</th><th>Action</th></tr>
          </thead>
          <tbody>
            {detail.configParameters.map((parameter) => (
              <tr key={parameter.id}>
                <td>{parameter.configKey}</td>
                <td>{parameter.envVariable}</td>
                <td>{parameter.category}</td>
                <td>{parameter.environment}</td>
                <td>{parameter.secret ? <span className={styles.secretValue}>Secret Reference</span> : parameter.currentValue}</td>
                <td><StatusPill value={parameter.secret ? "Yes" : "No"} tone={parameter.secret ? "warning" : "neutral"} /></td>
                <td><StatusPill value={parameter.required ? "Yes" : "No"} tone={parameter.required ? "success" : "neutral"} /></td>
                <td><StatusPill value={parameter.validationStatus} tone={parameter.validationStatus === "Pass" ? "success" : "warning"} /></td>
                <td>{parameter.source}</td>
                <td>{parameter.lastUpdated}</td>
                <td>{parameter.updatedBy}</td>
                <td><button type="button" className={styles.rowAction} onClick={() => onConfigAction(parameter)}>{parameter.secret ? "Rotate Secret" : "Edit"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard title="Country & Legal Readiness" description="Business, legal and privacy review status by market." aside={<ViewDetailsLink onClick={() => onNavigateTab("country-availability")} label="Manage countries" />}>
        <table className={`${styles.dataTable} ${styles.wide}`}>
          <thead>
            <tr><th>Country (Code)</th><th>Availability</th><th>Business Approval</th><th>Legal Review</th><th>Privacy Review</th><th>Languages</th><th>Currency</th><th>Environment</th><th>Effective Date</th></tr>
          </thead>
          <tbody>
            {detail.countryReadiness.map((row) => (
              <tr key={row.id}>
                <td>{row.country} ({row.isoCode})</td>
                <td><StatusPill value={row.availability} tone={row.availability.includes("Enabled") ? "success" : "info"} /></td>
                <td><StatusPill value={row.businessApproval} tone={row.businessApproval === "Approved" ? "success" : "warning"} /></td>
                <td><StatusPill value={row.legalReview} tone={row.legalReview === "Approved" ? "success" : "warning"} /></td>
                <td><StatusPill value={row.privacyReview} tone={row.privacyReview === "Approved" ? "success" : "warning"} /></td>
                <td>{row.languages}</td>
                <td>{row.currency}</td>
                <td>{row.environment}</td>
                <td>{row.effectiveDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <div className={styles.splitGrid}>
        <article className={styles.chartCard}>
          <h2><HeartPulse size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Health & Performance Metrics (Last 7 Days)</h2>
          <p className={styles.chartCaption}>Request Volume (Last 7 Days)</p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detail.healthPerformance.requestVolume} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#8a919c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#8a919c" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} cursor={{ fill: "#f5eaea" }} />
                <Bar dataKey="value" fill="#74070a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartStatsGrid}>
            <div className={styles.chartStat}><span>Average Latency</span><strong>{detail.healthPerformance.averageLatency}</strong><em>{detail.healthPerformance.latencyTrend}</em></div>
            <div className={styles.chartStat}><span>Uptime</span><strong>{detail.healthPerformance.uptime}</strong><em className={styles.trendUp}>{detail.healthPerformance.uptimeTrend}</em></div>
            <div className={styles.chartStat}><span>Recommendation Success</span><strong>{detail.healthPerformance.recommendationSuccess}</strong><em className={styles.trendUp}>{detail.healthPerformance.recommendationTrend}</em></div>
            <div className={styles.chartStat}><span>Error Trend</span><strong>{detail.healthPerformance.errorTrend}</strong><em className={styles.trendDown}>{detail.healthPerformance.errorTrendChange}</em></div>
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("health-performance")} label="View full health workspace" />
        </article>

        <article className={styles.chartCard}>
          <h2>User Adoption & Insights (This Month)</h2>
          <div className={styles.insightList}>
            <div className={styles.insightRow}><span>Monthly Active Users</span><div><strong>{detail.adoptionInsights.monthlyActiveUsers.toLocaleString()}</strong><em className={styles.trendUp}>{detail.adoptionInsights.activeUsersTrend}</em></div></div>
            <div className={styles.insightRow}><span>Monthly Conversations</span><div><strong>{detail.adoptionInsights.monthlyConversations.toLocaleString()}</strong><em className={styles.trendUp}>{detail.adoptionInsights.conversationsTrend}</em></div></div>
            <div className={styles.insightRow}><span>Adoption Rate</span><div><strong>{detail.adoptionInsights.adoptionRate}%</strong><em className={styles.trendUp}>{detail.adoptionInsights.adoptionTrend}</em></div></div>
          </div>
          <ViewDetailsLink onClick={() => onNavigateTab("adoption")} label="View full adoption workspace" />
        </article>
      </div>

      <div className={styles.splitGrid}>
        <SectionCard title="Security & Compliance Detail" scroll={false} aside={<ViewDetailsLink onClick={() => onNavigateTab("security")} label="Open security tab" />}>
          <div className={styles.complianceGrid} style={{ padding: 0 }}>
            <div className={styles.complianceStat}><span>Security Review Status</span><StatusPill value={detail.complianceDetail.securityReviewStatus} tone={detail.complianceDetail.securityReviewStatus === "Approved" ? "success" : "warning"} /></div>
            <div className={styles.complianceStat}><span>Open Findings</span><strong>{detail.complianceDetail.openFindings}</strong></div>
            <div className={styles.complianceStat}><span>Critical Findings</span><strong>{detail.complianceDetail.criticalFindings}</strong></div>
            <div className={styles.complianceStat}><span>High Findings</span><strong>{detail.complianceDetail.highFindings}</strong></div>
          </div>
          <div className={styles.complianceGrid} style={{ padding: "0", marginTop: 12 }}>
            <div className={styles.complianceStat}><span>Privacy Review Required</span><StatusPill value={detail.complianceDetail.privacyReviewRequired} tone="success" /></div>
            <div className={styles.complianceStat}><span>Consent Requirement</span><StatusPill value={detail.complianceDetail.consentRequirement} tone="warning" /></div>
            <div className={styles.complianceStat}><span>Data Retention</span><StatusPill value={detail.complianceDetail.dataRetention} tone="info" /></div>
            <div className={styles.complianceStat}><span>Sensitive Data Handling</span><StatusPill value={detail.complianceDetail.sensitiveDataHandling} tone={detail.complianceDetail.sensitiveDataHandling === "Restricted" ? "danger" : "neutral"} /></div>
          </div>
        </SectionCard>

        <SectionCard title="Module Access Control" description="Role-based permissions for this module." aside={<ViewDetailsLink onClick={() => onNavigateTab("access-roles")} label="Manage access roles" />}>
          <table className={`${styles.dataTable} ${styles.wide}`}>
            <thead>
              <tr><th>Role</th><th>Scope</th><th>Environment</th><th>View</th><th>Configure</th><th>Release</th><th>Enable Prod.</th></tr>
            </thead>
            <tbody>
              {detail.accessRoles.slice(0, 5).map((row) => (
                <tr key={row.id}>
                  <td>{row.role}</td>
                  <td>{row.permissionScope}</td>
                  <td>{row.environment}</td>
                  <td>{row.view}</td>
                  <td>{row.configure}</td>
                  <td>{row.release}</td>
                  <td><StatusPill value={row.enableProduction} tone={row.enableProduction === "Yes" ? "success" : "neutral"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8a919c", fontSize: 10 }}>
        <ShieldCheck size={12} /> <Globe2 size={12} style={{ marginLeft: 8 }} /> <FlagIcon size={12} style={{ marginLeft: 8 }} />
        <span>Every summary above links to its full workspace tab — nothing here is edited without a controlled action.</span>
      </div>
    </div>
  );
}

