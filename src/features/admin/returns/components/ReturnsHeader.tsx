"use client";

import React from "react";
import styles from "./returns-queue.module.css";

interface ReturnsHeaderProps {
  onReviewPriority: () => void;
  onAssignCases: () => void;
  onExportReport: () => void;
  onFilterAuthenticity: () => void;
  onFilterDamage: () => void;
  onFilterRefundQueue: () => void;
  onFilterSafety: () => void;
}

export function ReturnsHeader({
  onReviewPriority,
  onAssignCases,
  onExportReport,
  onFilterAuthenticity,
  onFilterDamage,
  onFilterRefundQueue,
  onFilterSafety,
}: ReturnsHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.headerTopRow}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Returns, Refunds & Disputes</h1>
          <p className={styles.pageDescription}>
            Review customer return requests, evidence, product-condition inspections, refund claims, authenticity complaints, safety incidents, delivery damage, supplier liability and payment disputes.
          </p>
        </div>
      </div>

      <div className={styles.headerActionsRow}>
        <button type="button" className={styles.btnDark} onClick={onReviewPriority}>
          Review Priority Cases
        </button>
        <button type="button" className={styles.btnOutline} onClick={onAssignCases}>
          Assign Cases
        </button>
        <button type="button" className={styles.btnOutline} onClick={onExportReport}>
          Export Report
        </button>
        <button type="button" className={styles.btnOutline} onClick={onFilterAuthenticity}>
          View Authenticity Complaints
        </button>
        <button type="button" className={styles.btnOutline} onClick={onFilterDamage}>
          View Delivery Damage Cases
        </button>
        <button type="button" className={styles.btnOutline} onClick={onFilterRefundQueue}>
          View Refund Queue
        </button>
        <button type="button" className={styles.btnOutline} onClick={onFilterSafety}>
          View Safety Complaints
        </button>
      </div>
    </div>
  );
}
