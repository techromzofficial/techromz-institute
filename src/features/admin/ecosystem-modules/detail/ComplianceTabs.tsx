"use client";

import { Globe2, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import type { EcosystemModuleDetail } from "../types";
import { EmptyRow, SectionCard, StatusPill } from "./shared";
import styles from "./moduleDetail.module.css";

export function CountryAvailabilityTab({ detail, onManageCountries }: { detail: EcosystemModuleDetail; onManageCountries: () => void }) {
  const enabled = detail.countryReadiness.filter((row) => row.availability.toLowerCase().includes("enabled")).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section className={styles.metricsGrid} style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <div className={styles.metricCard}><span>Markets Tracked</span><strong>{detail.countryReadiness.length}</strong></div>
        <div className={styles.metricCard}><span>Enabled Markets</span><strong>{enabled}</strong></div>
        <div className={styles.metricCard}><span>Primary Region</span><strong>{detail.environmentSummary.primaryRegion}</strong></div>
      </section>
      <SectionCard
        title="Country & Legal Readiness"
        description="ISO code, legal, privacy, language, currency, environment and effective date per market."
        aside={<button type="button" className={styles.rowAction} onClick={onManageCountries}><Globe2 size={11} style={{ verticalAlign: "-2px", marginRight: 4 }} />Manage Countries</button>}
      >
        <table className={`${styles.dataTable} ${styles.wide}`}>
          <thead>
            <tr><th>Country (Code)</th><th>Availability</th><th>Business Approval</th><th>Legal Review</th><th>Privacy Review</th><th>Languages</th><th>Currency</th><th>Environment</th><th>Effective Date</th></tr>
          </thead>
          <tbody>
            {detail.countryReadiness.length === 0 && <EmptyRow colSpan={9} message="No markets configured yet." />}
            {detail.countryReadiness.map((row) => (
              <tr key={row.id}>
                <td>{row.country} ({row.isoCode})</td>
                <td><StatusPill value={row.availability} tone={row.availability.toLowerCase().includes("enabled") ? "success" : "info"} /></td>
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
    </div>
  );
}

export function AccessRolesTab({ detail, onManageAccess }: { detail: EcosystemModuleDetail; onManageAccess: () => void }) {
  return (
    <SectionCard
      title="Module Access Control"
      description="Role-based permission matrix for this module."
      aside={<button type="button" className={styles.rowAction} onClick={onManageAccess}><Lock size={11} style={{ verticalAlign: "-2px", marginRight: 4 }} />Manage Access Roles</button>}
    >
      <table className={`${styles.dataTable} ${styles.extraWide}`}>
        <thead>
          <tr><th>Role</th><th>Permission Scope</th><th>Environment</th><th>View</th><th>Configure</th><th>Release</th><th>Enable Production</th><th>Manage Flags</th><th>View Audit</th><th>Last Updated</th></tr>
        </thead>
        <tbody>
          {detail.accessRoles.length === 0 && <EmptyRow colSpan={10} message="No access roles recorded yet." />}
          {detail.accessRoles.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.role}</strong></td>
              <td>{row.permissionScope}</td>
              <td>{row.environment}</td>
              <td><StatusPill value={row.view} tone={row.view === "Yes" ? "success" : "neutral"} /></td>
              <td><StatusPill value={row.configure} tone={row.configure === "Yes" ? "success" : "neutral"} /></td>
              <td>{row.release}</td>
              <td><StatusPill value={row.enableProduction} tone={row.enableProduction === "Yes" ? "success" : "neutral"} /></td>
              <td><StatusPill value={row.manageFlags} tone={row.manageFlags === "Yes" ? "success" : "neutral"} /></td>
              <td>{row.viewAudit}</td>
              <td>{row.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

export function SecurityTab({ detail, onRequestReview }: { detail: EcosystemModuleDetail; onRequestReview: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section className={styles.complianceGrid} style={{ padding: 0 }}>
        <div className={styles.complianceStat}><span>Security Review Status</span><StatusPill value={detail.complianceDetail.securityReviewStatus} tone={detail.complianceDetail.securityReviewStatus === "Approved" ? "success" : "warning"} /></div>
        <div className={styles.complianceStat}><span>Open Findings</span><strong>{detail.complianceDetail.openFindings}</strong></div>
        <div className={styles.complianceStat}><span>Critical Findings</span><strong>{detail.complianceDetail.criticalFindings}</strong></div>
        <div className={styles.complianceStat}><span>High Findings</span><strong>{detail.complianceDetail.highFindings}</strong></div>
      </section>
      <SectionCard
        title="Security Findings"
        description="Open findings tracked against this module."
        aside={<button type="button" className={styles.rowAction} onClick={onRequestReview}><ShieldAlert size={11} style={{ verticalAlign: "-2px", marginRight: 4 }} />Request Security Review</button>}
      >
        <table className={styles.dataTable}>
          <thead><tr><th>Finding</th><th>Severity</th><th>Status</th><th>Discovered</th><th>Owner</th></tr></thead>
          <tbody>
            {detail.securityFindings.length === 0 && <EmptyRow colSpan={5} message="No open security findings." />}
            {detail.securityFindings.map((row) => (
              <tr key={row.id}>
                <td style={{ whiteSpace: "normal", minWidth: 240 }}>{row.title}</td>
                <td><StatusPill value={row.severity} tone={row.severity === "Critical" || row.severity === "High" ? "danger" : row.severity === "Medium" ? "warning" : "success"} /></td>
                <td>{row.status}</td>
                <td>{row.discovered}</td>
                <td>{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

export function CompliancePrivacyTab({ detail }: { detail: EcosystemModuleDetail }) {
  return (
    <SectionCard title="Compliance & Privacy" description="Privacy review, consent and data-handling posture for this module." aside={<ShieldCheck size={16} color="#74070a" />} scroll={false}>
      <div className={styles.complianceGrid} style={{ padding: 0 }}>
        <div className={styles.complianceStat}><span>Privacy Review Required</span><StatusPill value={detail.complianceDetail.privacyReviewRequired} tone="success" /></div>
        <div className={styles.complianceStat}><span>Consent Requirement</span><StatusPill value={detail.complianceDetail.consentRequirement} tone="warning" /></div>
        <div className={styles.complianceStat}><span>Data Retention</span><StatusPill value={detail.complianceDetail.dataRetention} tone="info" /></div>
        <div className={styles.complianceStat}><span>Sensitive Data Handling</span><StatusPill value={detail.complianceDetail.sensitiveDataHandling} tone={detail.complianceDetail.sensitiveDataHandling === "Restricted" ? "danger" : "neutral"} /></div>
      </div>
      <p style={{ marginTop: 14, color: "#69707d", fontSize: 11, lineHeight: 1.6 }}>
        Compliance status for this module is <strong>{detail.statusDomains.find((f) => f.key === "compliance")?.value}</strong>, tracked
        against the markets listed under Country Availability. Requesting a compliance review notifies the compliance team and
        moves this status to review pending.
      </p>
    </SectionCard>
  );
}

