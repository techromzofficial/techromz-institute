"use client";

import React from "react";
import { Info } from "lucide-react";
import styles from "./return-detail.module.css";
import type { CaseSummaryData } from "@/types/admin";

interface CaseSummaryCardProps {
  summary: CaseSummaryData;
}

export function CaseSummaryCard({ summary }: CaseSummaryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span>Case Summary</span>
          <Info size={14} style={{ color: "#6b7280" }} />
        </div>
      </div>

      {/* Customer Statement */}
      <div className={styles.statementBox}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4, fontStyle: "normal" }}>
          Customer Statement
        </span>
        &ldquo;{summary.customerStatement}&rdquo;
      </div>

      {/* Summary Metadata Grid */}
      <div className={styles.summaryGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Previous Claims</span>
          <span className={styles.metaValue}>{summary.previousClaimsCount} Claim</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Safety Complaint</span>
          <span className={styles.metaValue}>{summary.safetyComplaint ? "Yes" : "No"}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Claim Category</span>
          <span className={styles.metaValue}>{summary.claimCategory}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Authenticity Complaint</span>
          <span className={styles.metaValue}>{summary.authenticityComplaint ? "Yes" : "No"}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Reported Condition</span>
          <span className={styles.metaValue}>{summary.reportedCondition}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Delivery Damage Suspected</span>
          <span className={styles.metaValue}>{summary.deliveryDamageSuspected}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Product Hygiene Sensitivity</span>
          <span className={styles.metaValue}>{summary.productHygieneSensitivity}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Customer Risk Profile</span>
          <span className={`${styles.statusPill} ${styles.pillSuccess}`} style={{ width: "fit-content" }}>
            {summary.customerRiskProfile}
          </span>
        </div>
      </div>
    </div>
  );
}
