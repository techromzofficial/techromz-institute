"use client";

import { CalendarClock, KeyRound, Layers, Settings2 } from "lucide-react";
import type { ConfigParameterRow, EcosystemModuleDetail } from "../types";
import { EmptyRow, SectionCard, StatusPill } from "./shared";
import styles from "./moduleDetail.module.css";

export function ConfigurationTab({ detail, onConfigAction }: { detail: EcosystemModuleDetail; onConfigAction: (parameter: ConfigParameterRow) => void }) {
  const total = detail.configParameters.length;
  const secrets = detail.configParameters.filter((row) => row.secret).length;
  const passing = detail.configParameters.filter((row) => row.validationStatus === "Pass").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section className={styles.metricsGrid} style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <div className={styles.metricCard}><span>Total Parameters</span><strong>{total}</strong></div>
        <div className={styles.metricCard}><span>Secret Parameters</span><strong>{secrets}</strong></div>
        <div className={styles.metricCard}><span>Passing Validation</span><strong>{passing}/{total}</strong></div>
        <div className={styles.metricCard}><span>Configuration Progress</span><strong>{detail.configSummary.configurationProgress}%</strong></div>
      </section>
      <SectionCard
        title="Active Configuration Parameters"
        description="Configuration key and environment variable are kept as separate fields. Secret values are never rendered — only rotated."
        aside={<Settings2 size={16} color="#74070a" />}
      >
        <table className={`${styles.dataTable} ${styles.extraWide}`}>
          <thead>
            <tr><th>Configuration Key</th><th>Environment Variable</th><th>Category</th><th>Environment</th><th>Current Value</th><th>Secret</th><th>Required</th><th>Validation Status</th><th>Source</th><th>Last Updated</th><th>Updated By</th><th>Action</th></tr>
          </thead>
          <tbody>
            {detail.configParameters.length === 0 && <EmptyRow colSpan={12} message="No configuration parameters recorded yet." />}
            {detail.configParameters.map((parameter) => (
              <tr key={parameter.id}>
                <td>{parameter.configKey}</td>
                <td>{parameter.envVariable}</td>
                <td>{parameter.category}</td>
                <td>{parameter.environment}</td>
                <td>{parameter.secret ? <span className={styles.secretValue}><KeyRound size={11} /> Secret Reference</span> : parameter.currentValue}</td>
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
    </div>
  );
}

export function VersionsTab({ detail, onScheduleRelease }: { detail: EcosystemModuleDetail; onScheduleRelease: () => void }) {
  return (
    <SectionCard
      title="Versions & Releases"
      description="Full release history for this module, most recent first."
      aside={<button type="button" className={styles.rowAction} onClick={onScheduleRelease}><CalendarClock size={11} style={{ verticalAlign: "-2px", marginRight: 4 }} />Schedule Release</button>}
    >
      <table className={`${styles.dataTable} ${styles.wide}`}>
        <thead>
          <tr><th>Version</th><th>Type</th><th>Status</th><th>Released On</th><th>Released By</th><th>Notes</th></tr>
        </thead>
        <tbody>
          {detail.versionsReleases.length === 0 && <EmptyRow colSpan={6} message="No release history recorded yet." />}
          {detail.versionsReleases.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.version}</strong></td>
              <td>{row.releaseType}</td>
              <td><StatusPill value={row.status} tone={row.status === "Live" ? "success" : row.status === "Scheduled" ? "info" : row.status === "Superseded" ? "neutral" : "warning"} /></td>
              <td>{row.releasedOn}</td>
              <td>{row.releasedBy}</td>
              <td style={{ whiteSpace: "normal", minWidth: 220 }}>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

export function EnvironmentsTab({ detail }: { detail: EcosystemModuleDetail }) {
  return (
    <SectionCard title="Environments" description="Deployment status across every environment tier." aside={<Layers size={16} color="#74070a" />}>
      <table className={`${styles.dataTable} ${styles.wide}`}>
        <thead>
          <tr><th>Environment</th><th>Status</th><th>Endpoint</th><th>Last Deployed</th><th>Deployed By</th><th>Drift Status</th></tr>
        </thead>
        <tbody>
          {detail.environments.length === 0 && <EmptyRow colSpan={6} message="No environments recorded yet." />}
          {detail.environments.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.name}</strong></td>
              <td><StatusPill value={row.status} tone={row.status === "Operational" || row.status === "Controlled Pilot" ? "success" : "warning"} /></td>
              <td>{row.endpoint}</td>
              <td>{row.lastDeployed}</td>
              <td>{row.deployedBy}</td>
              <td><StatusPill value={row.driftStatus} tone={row.driftStatus === "None" ? "success" : "warning"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

