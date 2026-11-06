'use client';

import React from 'react';
import {
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Send,
  UserCheck,
  Flag,
  MessageSquare,
  Building,
  Truck,
  ShieldAlert,
  FileCheck,
  CheckCircle,
  XCircle,
  Activity,
  ClipboardList,
  ClipboardCheck,
} from 'lucide-react';
import type { CaseDetailFullData } from '@/types/customerSupportDetail';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface RightWorkspaceRailProps {
  data: CaseDetailFullData;
  onOpenSendUpdate: () => void;
  onOpenAssign: () => void;
  onOpenChangePriority: () => void;
  onOpenEscalate: () => void;
  onOpenMarkResolved: () => void;
  onOpenCloseCase: () => void;
}

export function RightWorkspaceRail({
  data,
  onOpenSendUpdate,
  onOpenAssign,
  onOpenChangePriority,
  onOpenEscalate,
  onOpenMarkResolved,
  onOpenCloseCase,
}: RightWorkspaceRailProps) {
  const { metrics, blockingIssues, recommendedAction, caseInfo } = data;

  return (
    <aside className={styles.caseSidebar}>
      {/* 1. HEALTH & METRICS PANEL */}
      <div className={styles.sidebarPanel}>
        <div className={styles.sidebarPanelHeader}>
          <span className={styles.sidebarPanelHeading}>
            <Activity size={12} />
            HEALTH & METRICS
          </span>
          <span className="font-bold text-[10px] text-[#15803d]">
            {metrics.healthScore}/100
          </span>
        </div>

        {/* Case Health Score Progress Bar */}
        <div className={styles.healthScoreBlock}>
          <div className={styles.metricTitleRow}>
            <span>Case Health Score</span>
            <strong>{metrics.healthScore}/100</strong>
          </div>
          <div
            className={styles.healthProgressTrack}
            role="progressbar"
            aria-valuenow={metrics.healthScore}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={styles.healthProgressValue}
              style={{ width: `${metrics.healthScore}%` }}
            />
          </div>
        </div>

        {/* 4-Cell Health Metric Grid */}
        <div className={styles.healthMetricGrid}>
          <div className={styles.healthMetricCell}>
            <span className={styles.healthMetricLabel}>Risk Score</span>
            <span className={styles.healthMetricValue} style={{ color: '#dc2626' }}>
              {metrics.riskScore}/100
            </span>
          </div>

          <div className={styles.healthMetricCell}>
            <span className={styles.healthMetricLabel}>SLA Remaining</span>
            <span className={styles.healthMetricValue} style={{ color: '#d97706' }}>
              {metrics.slaRemaining}
            </span>
          </div>

          <div className={styles.healthMetricCell}>
            <span className={styles.healthMetricLabel}>Resolution Confidence</span>
            <span className={styles.healthMetricValue} style={{ color: '#15803d' }}>
              {metrics.resolutionConfidencePercent}%
            </span>
          </div>

          <div className={styles.healthMetricCell}>
            <span className={styles.healthMetricLabel}>Evidence Completeness</span>
            <span className={styles.healthMetricValue} style={{ color: '#252a31' }}>
              {metrics.evidenceCompletenessPercent}%
            </span>
          </div>
        </div>

        {/* Health Status Rows */}
        <div className={styles.healthStatusRows}>
          <div className={styles.healthStatusRow}>
            <span>Customer Sentiment</span>
            <span style={{ color: '#d97706' }}>
              <span className={styles.statusDot} style={{ background: '#d97706' }} />
              {metrics.customerSentiment}
            </span>
          </div>

          <div className={styles.healthStatusRow}>
            <span>Repeat Contact Risk</span>
            <span style={{ color: '#15803d' }}>
              <span className={styles.statusDot} style={{ background: '#15803d' }} />
              {metrics.repeatContactRisk}
            </span>
          </div>

          <div className={styles.healthStatusRow}>
            <span>Escalation Risk</span>
            <span style={{ color: '#d97706' }}>
              <span className={styles.statusDot} style={{ background: '#d97706' }} />
              {metrics.escalationRisk}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BLOCKING ISSUES PANEL */}
      <div className={styles.sidebarPanel}>
        <div className={styles.sidebarPanelHeader}>
          <span className={styles.sidebarPanelHeading}>
            <AlertTriangle size={12} className={styles.blockingHeaderIcon} />
            BLOCKING ISSUES
          </span>
          <span className={styles.blockingCount}>{blockingIssues.length}</span>
        </div>

        {blockingIssues.map((issue) => (
          <div key={issue.id} className={styles.blockingIssueRow}>
            <span className={styles.blockingIssueTitle} title={issue.title}>
              {issue.title}
            </span>
            <button type="button" className={styles.blockingIssueAction}>
              {issue.suggestedAction}
            </button>
          </div>
        ))}

        <div className={styles.blockingIssuesFooter}>
          <button type="button" className={styles.viewAllBlockingButton}>
            View all blocking issues ({blockingIssues.length})
          </button>
        </div>
      </div>

      {/* 3. RECOMMENDED NEXT ACTION PANEL */}
      <div className={styles.recommendationPanel}>
        <div className={styles.recommendationHeader}>
          <Lightbulb size={13} className={styles.recommendationIcon} />
          <h4 className={styles.recommendationTitle}>RECOMMENDED NEXT ACTION</h4>
        </div>

        <p className={styles.recommendationText}>{recommendedAction.text}</p>

        <div className={styles.recommendationMeta}>
          <div className={styles.recommendationMetaRow}>
            <span className={styles.recommendationMetaLabel}>Recommended Owner</span>
            <span className={styles.recommendationMetaValue}>{recommendedAction.recommendedOwner}</span>
          </div>

          <div className={styles.recommendationMetaRow}>
            <span className={styles.recommendationMetaLabel}>Due</span>
            <span className={styles.recommendationMetaValue}>{recommendedAction.dueBy}</span>
          </div>
        </div>

        <div className={styles.recommendationDisclaimer}>
          {recommendedAction.disclaimer}
        </div>
      </div>

      {/* 4. CASE ACTIONS PANEL */}
      <div className={styles.sidebarPanel}>
        <div className={styles.caseActionsHeader}>
          <ClipboardList size={13} />
          <h4 className={styles.caseActionsTitle}>CASE ACTIONS</h4>
        </div>

        <div>
          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenSendUpdate}
          >
            <Send size={12} />
            <span>Send Customer Update</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenAssign}
          >
            <UserCheck size={12} />
            <span>Assign or Reassign Agent</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenChangePriority}
          >
            <Flag size={12} />
            <span>Change Priority</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenSendUpdate}
          >
            <MessageSquare size={12} />
            <span>Contact Customer</span>
            <ChevronRight size={11} />
          </button>

          <button type="button" className={styles.caseActionButton}>
            <Building size={12} />
            <span>Contact Supplier</span>
            <ChevronRight size={11} />
          </button>

          <button type="button" className={styles.caseActionButton}>
            <Truck size={12} />
            <span>Contact Carrier</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenEscalate}
          >
            <ShieldAlert size={12} />
            <span>Escalate Case</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenMarkResolved}
          >
            <FileCheck size={12} />
            <span>Propose Resolution</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenMarkResolved}
          >
            <CheckCircle size={12} />
            <span>Mark Resolved</span>
            <ChevronRight size={11} />
          </button>

          <button
            type="button"
            className={styles.caseActionButton}
            onClick={onOpenCloseCase}
          >
            <XCircle size={12} />
            <span>Close Case</span>
            <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* 5. ASSIGNMENT & SLA SUMMARY PANEL */}
      <div className={styles.assignmentSlaPanel}>
        <div className={styles.assignmentSlaHeader}>
          <ClipboardCheck size={13} />
          <h4 className={styles.assignmentSlaTitle}>ASSIGNMENT & SLA SUMMARY</h4>
        </div>

        <div className={styles.assignmentSlaGrid}>
          <div className={styles.assignmentSlaItem}>
            <span className={styles.assignmentSlaLabel}>Assigned Agent</span>
            <span className={styles.assignmentSlaValue}>
              {caseInfo.assignedAgentName || 'Amaya Perera'}
            </span>
          </div>

          <div className={styles.assignmentSlaItem}>
            <span className={styles.assignmentSlaLabel}>Assigned Team</span>
            <span className={styles.assignmentSlaValue}>
              {caseInfo.assignedTeam || 'Customer Operations'}
            </span>
          </div>

          <div className={styles.assignmentSlaItem}>
            <span className={styles.assignmentSlaLabel}>First Response</span>
            <span className={`${styles.assignmentSlaValue} ${styles.assignmentSlaSuccess}`}>
              Completed in 9 Minutes
            </span>
          </div>

          <div className={styles.assignmentSlaItem}>
            <span className={styles.assignmentSlaLabel}>Resolution Due</span>
            <span className={styles.assignmentSlaValue}>
              {caseInfo.resolutionDue}
            </span>
          </div>

          <div className={styles.assignmentSlaItem}>
            <span className={styles.assignmentSlaLabel}>SLA Status</span>
            <span className={`${styles.assignmentSlaValue} ${styles.assignmentSlaSuccess}`}>
              Within Target
            </span>
          </div>

          <div className={styles.assignmentSlaItem}>
            <span className={styles.assignmentSlaLabel}>Escalation</span>
            <span className={`${styles.assignmentSlaValue} ${styles.assignmentSlaSuccess}`}>
              None
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

