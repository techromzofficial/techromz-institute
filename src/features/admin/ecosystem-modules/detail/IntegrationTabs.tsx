"use client";

import { Network, Plug, Flag as FlagIcon } from "lucide-react";
import type { EcosystemModuleDetail, FeatureFlagRow } from "../types";
import { EmptyRow, SectionCard, StatusPill } from "./shared";
import styles from "./moduleDetail.module.css";

export function DependenciesTab({ detail }: { detail: EcosystemModuleDetail }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section className={styles.metricsGrid} style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <div className={styles.metricCard}><span>Critical Dependencies</span><strong>{detail.dependencySummary.criticalDependencies}</strong></div>
        <div className={styles.metricCard}><span>Required Dependencies</span><strong>{detail.dependencySummary.requiredDependencies}</strong></div>
        <div className={styles.metricCard}><span>Health Status</span><strong>{detail.dependencySummary.healthStatus}</strong></div>
        <div className={styles.metricCard}><span>Impact Risk</span><strong>{detail.dependencySummary.impactRisk}</strong></div>
      </section>
      <SectionCard title="Dependencies" description="Upstream and downstream services this module relies on, or that rely on it." aside={<Network size={16} color="#74070a" />}>
        <table className={`${styles.dataTable} ${styles.wide}`}>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Direction</th><th>Health</th><th>Criticality</th><th>Owner</th></tr>
          </thead>
          <tbody>
            {detail.dependencies.length === 0 && <EmptyRow colSpan={6} message="No dependencies recorded yet." />}
            {detail.dependencies.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong></td>
                <td>{row.type}</td>
                <td>{row.direction}</td>
                <td><StatusPill value={row.health} tone={row.health === "Healthy" ? "success" : row.health === "Blocked" ? "danger" : "warning"} /></td>
                <td><StatusPill value={row.criticality} tone={row.criticality === "High" ? "danger" : row.criticality === "Medium" ? "warning" : "success"} /></td>
                <td>{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

export function IntegrationsTab({ detail }: { detail: EcosystemModuleDetail }) {
  return (
    <SectionCard title="Integrations" description="External and internal services this module integrates with." aside={<Plug size={16} color="#74070a" />}>
      <table className={`${styles.dataTable} ${styles.wide}`}>
        <thead>
          <tr><th>Name</th><th>Provider</th><th>Category</th><th>Status</th><th>Last Checked</th><th>Latency</th></tr>
        </thead>
        <tbody>
          {detail.integrations.length === 0 && <EmptyRow colSpan={6} message="No integrations recorded yet." />}
          {detail.integrations.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.name}</strong></td>
              <td>{row.provider}</td>
              <td>{row.category}</td>
              <td><StatusPill value={row.status} tone={row.status === "Healthy" ? "success" : "warning"} /></td>
              <td>{row.lastChecked}</td>
              <td>{row.latency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

export function FeatureFlagsTab({ detail, onEditFlag }: { detail: EcosystemModuleDetail; onEditFlag: (flag: FeatureFlagRow) => void }) {
  return (
    <SectionCard title="Feature Flags & Rollout" description="Every flag gating this module's behaviour, with approval, rollout and expiry metadata." aside={<FlagIcon size={16} color="#74070a" />}>
      <table className={`${styles.dataTable} ${styles.wide}`}>
        <thead>
          <tr><th>Flag Key</th><th>State</th><th>Audience</th><th>Rollout</th><th>Approval Status</th><th>Expiry</th><th>Updated At</th><th>Action</th></tr>
        </thead>
        <tbody>
          {detail.featureFlags.length === 0 && <EmptyRow colSpan={8} message="No feature flags recorded yet." />}
          {detail.featureFlags.map((flag) => (
            <tr key={flag.id}>
              <td><strong>{flag.flagKey}</strong></td>
              <td><StatusPill value={flag.state} tone={flag.state === "Enabled" ? "success" : "neutral"} /></td>
              <td>{flag.audience}</td>
              <td>{flag.rollout}%</td>
              <td><StatusPill value={flag.approvalStatus} tone={flag.approvalStatus === "Approved" ? "success" : "warning"} /></td>
              <td>{flag.expiry}</td>
              <td>{flag.updatedAt}</td>
              <td><button type="button" className={styles.rowAction} onClick={() => onEditFlag(flag)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

