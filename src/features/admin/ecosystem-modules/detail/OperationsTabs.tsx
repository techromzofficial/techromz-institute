"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, History, TrendingUp } from "lucide-react";
import type { EcosystemModuleDetail } from "../types";
import { EmptyRow, ProgressBar, SectionCard, StatusPill } from "./shared";
import styles from "./moduleDetail.module.css";

export function HealthPerformanceTab({ detail }: { detail: EcosystemModuleDetail }) {
  const hp = detail.healthPerformance;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <article className={styles.chartCard}>
        <h2>Request Volume (Last 7 Days)</h2>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hp.requestVolume} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#8a919c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a919c" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} cursor={{ fill: "#f5eaea" }} />
              <Bar dataKey="value" fill="#74070a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
      <section className={styles.metricsGrid} style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <div className={styles.metricCard}><span>Average Latency</span><strong>{hp.averageLatency}</strong></div>
        <div className={styles.metricCard}><span>Uptime</span><strong>{hp.uptime}</strong></div>
        <div className={styles.metricCard}><span>Recommendation Success</span><strong>{hp.recommendationSuccess}</strong></div>
        <div className={styles.metricCard}><span>Error Trend</span><strong>{hp.errorTrend}</strong></div>
      </section>
    </div>
  );
}

export function AdoptionTab({ detail }: { detail: EcosystemModuleDetail }) {
  const ai = detail.adoptionInsights;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section className={styles.metricsGrid} style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <div className={styles.metricCard}><span>Monthly Active Users</span><strong>{ai.monthlyActiveUsers.toLocaleString()}</strong></div>
        <div className={styles.metricCard}><span>Monthly Conversations</span><strong>{ai.monthlyConversations.toLocaleString()}</strong></div>
        <div className={styles.metricCard}><span>Adoption Rate</span><strong>{ai.adoptionRate}%</strong></div>
      </section>
      <SectionCard title="Adoption Breakdown" description="Where adoption is concentrated this month." aside={<TrendingUp size={16} color="#74070a" />} scroll={false}>
        <div className={styles.insightList}>
          {ai.adoptionByCohort.map((cohort) => (
            <div key={cohort.label} className={styles.insightRow}>
              <span>{cohort.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 120, display: "inline-block" }}>
                  <ProgressBar value={cohort.value} />
                </span>
                <strong>{cohort.value}%</strong>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function AlertsTab({ detail }: { detail: EcosystemModuleDetail }) {
  return (
    <SectionCard title="Alerts" description="Every open alert for this module, most urgent first." aside={<AlertTriangle size={16} color="#74070a" />} scroll={false}>
      <div className={styles.insightList}>
        {detail.alerts.length === 0 && <p style={{ color: "#69707d", fontSize: 12 }}>No open alerts for this module.</p>}
        {detail.alerts.map((alert) => (
          <div key={alert.id} className={styles.insightRow}>
            <span>{alert.message}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusPill value={`Due ${alert.due}`} tone={alert.tone} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function AuditHistoryTab({ detail }: { detail: EcosystemModuleDetail }) {
  return (
    <SectionCard title="Audit History" description="Every recorded action for this module, most recent first." aside={<History size={16} color="#74070a" />}>
      <table className={styles.dataTable}>
        <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead>
        <tbody>
          {detail.auditHistory.length === 0 && <EmptyRow colSpan={4} message="No audit history recorded yet." />}
          {detail.auditHistory.map((entry) => (
            <tr key={entry.id}>
              <td style={{ whiteSpace: "nowrap" }}>{entry.timestamp}</td>
              <td>{entry.actor}</td>
              <td><strong>{entry.action}</strong></td>
              <td style={{ whiteSpace: "normal", minWidth: 320 }}>{entry.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

