"use client";

import React from "react";
import { Info } from "lucide-react";
import styles from "./return-detail.module.css";
import type { InternalHealthMetricsData } from "@/types/admin";

interface InternalHealthMetricsProps {
  metrics: InternalHealthMetricsData;
}

export function InternalHealthMetrics({ metrics }: InternalHealthMetricsProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span>Internal Risk & Health Metrics</span>
          <Info size={14} style={{ color: "#6b7280" }} />
        </div>
      </div>

      <div className={styles.healthGrid}>
        {/* Case Health Score */}
        <div className={styles.healthMetricItem}>
          <span className={styles.metaLabel}>Case Health Score</span>
          <span className={styles.refMainTitle} style={{ fontSize: "1.5rem", color: "#10b981" }}>
            {metrics.caseHealthScore}/100
          </span>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${metrics.caseHealthScore}%`, background: "#10b981" }}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div className={styles.healthMetricItem}>
          <span className={styles.metaLabel}>Risk Score</span>
          <span className={styles.refMainTitle} style={{ fontSize: "1.5rem", color: "#10b981" }}>
            {metrics.riskScore}/100
          </span>
          <span className={`${styles.statusPill} ${styles.pillSuccess}`} style={{ width: "fit-content" }}>
            {metrics.riskLevel}
          </span>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${metrics.riskScore}%`, background: "#10b981" }}
            />
          </div>
        </div>

        {/* Evidence Completeness */}
        <div className={styles.healthMetricItem}>
          <span className={styles.metaLabel}>Evidence Completeness</span>
          <span className={styles.refMainTitle} style={{ fontSize: "1.5rem", color: "#10b981" }}>
            {metrics.evidenceCompleteness}%
          </span>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${metrics.evidenceCompleteness}%`, background: "#10b981" }}
            />
          </div>
        </div>

        {/* Eligibility Confidence */}
        <div className={styles.healthMetricItem}>
          <span className={styles.metaLabel}>Eligibility Confidence</span>
          <span className={styles.refMainTitle} style={{ fontSize: "1.5rem", color: "#10b981" }}>
            {metrics.eligibilityConfidence}%
          </span>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${metrics.eligibilityConfidence}%`, background: "#10b981" }}
            />
          </div>
        </div>

        {/* Inspection Readiness */}
        <div className={styles.healthMetricItem}>
          <span className={styles.metaLabel}>Inspection Readiness</span>
          <span className={styles.refMainTitle} style={{ fontSize: "1.5rem", color: "#f59e0b" }}>
            {metrics.inspectionReadiness}%
          </span>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${metrics.inspectionReadiness}%`, background: "#f59e0b" }}
            />
          </div>
        </div>

        {/* Refund Exposure */}
        <div className={styles.healthMetricItem}>
          <span className={styles.metaLabel}>Refund Exposure</span>
          <span className={styles.refMainTitle} style={{ fontSize: "1.25rem", color: "#111827" }}>
            {metrics.refundExposure}
          </span>
        </div>
      </div>

      <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>
        Scores are calculated from case data, evidence quality, policy checks and operational rules.
      </span>
    </div>
  );
}
