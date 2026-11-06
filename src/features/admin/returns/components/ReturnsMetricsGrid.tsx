"use client";

import React from "react";
import styles from "./returns-queue.module.css";
import type { ReturnsMetricSummary } from "@/types/admin";

interface ReturnsMetricsGridProps {
  metrics: ReturnsMetricSummary;
  activeFilter?: string;
  onSelectMetricFilter: (filterKey: string, filterVal: string) => void;
}

export function ReturnsMetricsGrid({
  metrics,
  activeFilter,
  onSelectMetricFilter,
}: ReturnsMetricsGridProps) {
  const metricCards = [
    { key: "new", label: "NEW RETURN REQUESTS", value: metrics.newReturnRequests, filterKey: "returnStatus", filterVal: "New" },
    { key: "evidence", label: "EVIDENCE REQUIRED", value: metrics.evidenceRequired, filterKey: "quickFilter", filterVal: "Evidence Required" },
    { key: "eligibility", label: "ELIGIBILITY REVIEW", value: metrics.eligibilityReview, filterKey: "returnStatus", filterVal: "Eligibility Review" },
    { key: "approved", label: "RETURN APPROVED", value: metrics.returnApproved, filterKey: "returnStatus", filterVal: "Approved" },
    { key: "pickup", label: "PICKUP SCHEDULED", value: metrics.pickupScheduled, filterKey: "returnStatus", filterVal: "Pickup Scheduled" },
    { key: "inspection", label: "INSPECTION PENDING", value: metrics.inspectionPending, filterKey: "inspectionStatus", filterVal: "PENDING" },
    { key: "refund_approval", label: "REFUND APPROVAL", value: metrics.refundApproval, filterKey: "refundStatus", filterVal: "PENDING APPROVAL" },
    { key: "refund_processing", label: "REFUND PROCESSING", value: metrics.refundProcessing, filterKey: "refundStatus", filterVal: "PROCESSING" },
    { key: "rejected", label: "REJECTED", value: metrics.rejected, filterKey: "returnStatus", filterVal: "Rejected" },
    { key: "escalated", label: "ESCALATED", value: metrics.escalated, filterKey: "disputeStatus", filterVal: "OPEN" },
    { key: "authenticity", label: "AUTHENTICITY COMPLAINTS", value: metrics.authenticityComplaints, filterKey: "quickFilter", filterVal: "Authenticity" },
    { key: "safety", label: "SAFETY / ALLERGY COMPLAINTS", value: metrics.safetyComplaints, filterKey: "quickFilter", filterVal: "Safety Complaint" },
    { key: "sla", label: "SLA BREACHES", value: metrics.slaBreaches, filterKey: "quickFilter", filterVal: "SLA Breach" },
    { key: "monthly_refund", label: "MONTHLY REFUND VALUE", value: metrics.monthlyRefundValue, isDarkRed: true, filterKey: "refundStatus", filterVal: "APPROVED" },
  ];

  return (
    <div className={styles.metricsGrid}>
      {metricCards.map((card) => {
        const isActive = activeFilter === card.filterVal;
        let cardClassName = styles.metricCard;
        if (card.isDarkRed) cardClassName += ` ${styles.metricCardDarkRed}`;
        if (isActive) cardClassName += ` ${styles.metricCardActive}`;

        return (
          <div
            key={card.key}
            className={cardClassName}
            onClick={() => onSelectMetricFilter(card.filterKey, card.filterVal)}
            role="button"
            tabIndex={0}
          >
            <span className={styles.metricLabel}>{card.label}</span>
            <span className={`${styles.metricValue} ${card.isDarkRed ? styles.metricValueDarkRed : ""}`}>
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
