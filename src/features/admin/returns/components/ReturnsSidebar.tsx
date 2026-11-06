"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, AlertTriangle } from "lucide-react";
import styles from "./returns-queue.module.css";
import type {
  ReturnsOperationsHealth,
  PriorityAlert,
  RefundPerformanceMetrics,
  QuickQueueItem,
  LiabilitySummary,
} from "@/types/admin";

interface ReturnsSidebarProps {
  operationsHealth: ReturnsOperationsHealth;
  priorityAlerts: PriorityAlert[];
  refundPerformance: RefundPerformanceMetrics;
  quickQueue: QuickQueueItem[];
  liabilitySummary: LiabilitySummary;
  onFilterSlaBreaches?: () => void;
}

export function ReturnsSidebar({
  operationsHealth,
  priorityAlerts,
  refundPerformance,
  quickQueue,
  liabilitySummary,
  onFilterSlaBreaches,
}: ReturnsSidebarProps) {
  const router = useRouter();

  return (
    <div className={styles.rightSidebar}>
      {/* 1. Returns Operations Health */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <span>Returns Operations Health</span>
        </div>
        <div className={styles.sideMetricList}>
          <div className={styles.sideMetricRow}>
            <span>Avg Resolution Time</span>
            <span className={styles.sideValBold}>{operationsHealth.avgResolutionTime}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Cases Within SLA</span>
            <span className={styles.sideValGreen}>{operationsHealth.casesWithinSLA}</span>
          </div>
          <div className={styles.sideMetricRow} style={{ cursor: "pointer" }} onClick={onFilterSlaBreaches}>
            <span>Cases Breaching SLA</span>
            <span className={styles.sideValRed}>{operationsHealth.casesBreachingSLA}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Inspection Backlog</span>
            <span className={styles.sideValBold}>{operationsHealth.inspectionBacklog}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Refund Decisions Pending</span>
            <span className={styles.sideValBold}>{operationsHealth.refundDecisionsPending}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Unassigned High-Risk Cases</span>
            <span className={styles.sideValRed}>{operationsHealth.unassignedHighRiskCases}</span>
          </div>
        </div>
      </div>

      {/* 2. Priority Alerts */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardHeader} style={{ color: "#dc2626" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} /> Priority Alerts
          </span>
        </div>
        <div className={styles.alertsList}>
          {priorityAlerts.map((alert) => (
            <div
              key={alert.id}
              className={styles.alertItem}
              onClick={() => {
                if (alert.targetType === "return" && alert.returnId) {
                  router.push(`/admin/marketplace/returns/${encodeURIComponent(alert.returnId)}`);
                }
              }}
            >
              <div className={styles.alertMain}>
                <span className={styles.alertCategory}>{alert.category}</span>
                <span className={styles.alertRef}>{alert.reference}</span>
              </div>
              <ChevronRight size={16} style={{ color: "#9ca3af" }} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Refund Performance */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <span>Refund Performance</span>
        </div>
        <div className={styles.sideMetricList}>
          <div className={styles.sideMetricRow}>
            <span>Average Refund Resolution</span>
            <span className={styles.sideValBold}>{refundPerformance.avgRefundResolution}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Approval Rate</span>
            <span className={styles.sideValGreen}>{refundPerformance.approvalRate}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Rejection Rate</span>
            <span className={styles.sideValRed}>{refundPerformance.rejectionRate}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Partial Refund Rate</span>
            <span className={styles.sideValBold}>{refundPerformance.partialRefundRate}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Supplier Recovery Pending</span>
            <span className={styles.sideValBold}>{refundPerformance.supplierRecoveryPending}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Partial Refund Value</span>
            <span className={styles.sideValBold}>{refundPerformance.partialRefundValue}</span>
          </div>
        </div>
        <span style={{ fontSize: "0.6875rem", color: "#9ca3af", marginTop: 4 }}>
          Calculated aggregate from refund and recovery records
        </span>
      </div>

      {/* 4. Quick Queue */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <span>Quick Queue</span>
        </div>
        <div className={styles.queueList}>
          {quickQueue.map((item) => (
            <div
              key={item.id}
              className={styles.queueItem}
              onClick={() => router.push(`/admin/marketplace/returns/${encodeURIComponent(item.returnReference || item.returnId || "")}`)}
            >
              <span className={styles.queueLabel}>{item.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className={styles.queueRef}>{item.returnReference || item.returnId}</span>
                <ChevronRight size={14} style={{ color: "#6b7280" }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Liability Summary */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <span>Liability Summary</span>
        </div>
        <div className={styles.sideMetricList}>
          <div className={styles.sideMetricRow}>
            <span>Supplier Liability</span>
            <span className={styles.sideValBold}>{liabilitySummary.supplierLiability}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Logistics Liability</span>
            <span className={styles.sideValBold}>{liabilitySummary.logisticsLiability}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Platform Liability</span>
            <span className={styles.sideValBold}>{liabilitySummary.platformLiability}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Customer Liability</span>
            <span className={styles.sideValBold}>{liabilitySummary.customerLiability}</span>
          </div>
          <div className={styles.sideMetricRow}>
            <span>Recovery Pending</span>
            <span className={styles.sideValGreen}>{liabilitySummary.recoveryPending}</span>
          </div>
        </div>
        <span style={{ fontSize: "0.6875rem", color: "#9ca3af", marginTop: 4 }}>
          Calculated aggregate from resolved and open return cases
        </span>
      </div>
    </div>
  );
}
