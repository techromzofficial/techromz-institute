"use client";

import React from "react";
import {
  Info,
  ShieldAlert,
  Bot,
  CheckCircle,
  RefreshCcw,
  MinusCircle,
  FileQuestion,
  Calendar,
  XCircle,
  ArrowUpRight,
  PauseCircle,
  Lock,
} from "lucide-react";
import styles from "./return-detail.module.css";
import type { CaseDecisionPanelData } from "@/types/admin";

interface CaseDecisionPanelProps {
  data: CaseDecisionPanelData;
  onSelectTab: (tabId: string) => void;
  onApproveFullRefund: () => void;
  onApproveReplacement: () => void;
  onApprovePartialRefund: () => void;
  onRequestEvidence: () => void;
  onScheduleInspection: () => void;
  onRejectReturn: () => void;
  onEscalateCase: () => void;
  onSuspendDecision: () => void;
  onOverrideInspection: () => void;
}

export function CaseDecisionPanel({
  data,
  onSelectTab,
  onApproveFullRefund,
  onApproveReplacement,
  onApprovePartialRefund,
  onRequestEvidence,
  onScheduleInspection,
  onRejectReturn,
  onEscalateCase,
  onSuspendDecision,
  onOverrideInspection,
}: CaseDecisionPanelProps) {
  const { health, blockingIssues, recommendation, canApproveFullRefund, approveFullRefundDisabledMessage } = data;

  return (
    <div className={styles.decisionPanelCard}>
      {/* 1. Case Health */}
      <div>
        <div className={styles.panelSectionTitle}>
          <span>Case Health</span>
          <Info size={14} style={{ color: "#6b7280" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "#6b7280" }}>Case Health Score</span>
            <strong style={{ color: "#10b981" }}>{health.caseHealthScore}/100</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "#6b7280" }}>Risk Score</span>
            <strong style={{ color: "#10b981" }}>{health.riskScore}/100 – {health.riskLevel}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "#6b7280" }}>SLA Status</span>
            <strong style={{ color: "#dc2626" }}>{health.riskLevel === "High" ? "SLA Breached" : "18 Hours Remaining"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "#6b7280" }}>Evidence Completeness</span>
            <strong style={{ color: "#10b981" }}>{health.evidenceCompleteness}%</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "#6b7280" }}>Eligibility Confidence</span>
            <strong style={{ color: "#10b981" }}>{health.eligibilityConfidence}%</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "#6b7280" }}>Inspection Readiness</span>
            <strong style={{ color: "#d97706" }}>{health.inspectionReadiness}%</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", borderTop: "1px solid #f3f4f6", paddingTop: 6 }}>
            <span style={{ color: "#374151", fontWeight: 600 }}>Refund Exposure</span>
            <strong style={{ color: "#111827" }}>{health.refundExposure}</strong>
          </div>
        </div>
      </div>

      {/* 2. Blocking Issues */}
      {blockingIssues.length > 0 && (
        <div>
          <div className={styles.panelSectionTitle} style={{ color: "#991b1b" }}>
            <ShieldAlert size={14} style={{ color: "#dc2626" }} />
            <span>Blocking Issues</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {blockingIssues.map((issue) => (
              <div key={issue.id} className={styles.blockingIssueRow}>
                <span className={styles.blockingTitle}>{issue.title}</span>
                <button
                  type="button"
                  className={styles.btnActionSmall}
                  onClick={() => onSelectTab(issue.targetTab)}
                >
                  {issue.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recommended Decision */}
      <div>
        <div className={styles.panelSectionTitle}>
          <Bot size={14} style={{ color: "#2563eb" }} />
          <span>Recommended Decision (automated)</span>
        </div>

        <div className={styles.recommendationBox} style={{ marginTop: 10 }}>
          <span style={{ fontWeight: 600 }}>Recommended Decision</span>
          <span>&ldquo;{recommendation.decision}&rdquo;</span>
          <div style={{ borderTop: "1px solid #bfdbfe", paddingTop: 6, display: "flex", flexDirection: "column", gap: 4, fontSize: "0.75rem" }}>
            <div>Resolution: <strong>{recommendation.recommendedResolution}</strong></div>
            <div>Responsible Party: <strong>{recommendation.recommendedResponsibleParty}</strong></div>
            <div>Recovery: <strong>{recommendation.recommendedRecovery}</strong></div>
          </div>
          <span style={{ fontSize: "0.6875rem", color: "#3b82f6", fontStyle: "italic", marginTop: 4 }}>
            Automated decision support — final approval requires an authorized officer.
          </span>
        </div>
      </div>

      {/* 4. Final Case Decision Actions */}
      <div>
        <div className={styles.panelSectionTitle}>
          <span>Final Case Decision</span>
        </div>

        <div className={styles.decisionButtonsGroup} style={{ marginTop: 10 }}>
          {/* Approve Full Refund (Disabled if pending inspection) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button
              type="button"
              className={`${styles.btnDecisionAction} ${
                canApproveFullRefund ? styles.btnApproveReplacement : styles.btnDisabled
              }`}
              onClick={canApproveFullRefund ? onApproveFullRefund : onOverrideInspection}
              title={canApproveFullRefund ? "Approve full refund" : "Physical inspection pending. Click to request inspection override."}
            >
              {!canApproveFullRefund && <Lock size={14} />}
              <CheckCircle size={16} />
              <span>Approve Full Refund</span>
            </button>
            {!canApproveFullRefund && (
              <span className={styles.disabledHelpText}>
                {approveFullRefundDisabledMessage || "Available after inspection completion or through an authorized override."}
              </span>
            )}
          </div>

          {/* Approve Replacement */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnApproveReplacement}`}
            onClick={onApproveReplacement}
          >
            <RefreshCcw size={16} />
            <span>Approve Replacement</span>
          </button>

          {/* Approve Partial Refund */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnApprovePartial}`}
            onClick={onApprovePartialRefund}
          >
            <MinusCircle size={16} />
            <span>Approve Partial Refund</span>
          </button>

          {/* Request Additional Evidence */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnApprovePartial}`}
            onClick={onRequestEvidence}
          >
            <FileQuestion size={16} />
            <span>Request Additional Evidence</span>
          </button>

          {/* Schedule Inspection */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnApprovePartial}`}
            onClick={onScheduleInspection}
          >
            <Calendar size={16} />
            <span>Schedule Inspection</span>
          </button>

          {/* Reject Return */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnReject}`}
            onClick={onRejectReturn}
          >
            <XCircle size={16} />
            <span>Reject Return</span>
          </button>

          {/* Escalate Case */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnApprovePartial}`}
            onClick={onEscalateCase}
          >
            <ArrowUpRight size={16} />
            <span>Escalate Case</span>
          </button>

          {/* Suspend Decision */}
          <button
            type="button"
            className={`${styles.btnDecisionAction} ${styles.btnApprovePartial}`}
            onClick={onSuspendDecision}
          >
            <PauseCircle size={16} />
            <span>Suspend Decision</span>
          </button>
        </div>

        <span style={{ fontSize: "0.6875rem", color: "#6b7280", display: "block", marginTop: 12, lineHeight: 1.4 }}>
          All approval, rejection, refund, replacement, inspection, liability, override, suspension and escalation decisions require a reason and are recorded in the audit history.
        </span>
      </div>
    </div>
  );
}
