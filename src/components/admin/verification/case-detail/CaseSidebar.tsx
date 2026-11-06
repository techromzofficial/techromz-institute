'use client';

import { AlertTriangle } from 'lucide-react';
import { CaseDetail, CurrentUser } from '@/mocks/admin/caseDetail.mock';

export function CaseSidebar({
  caseDetail,
  currentUser,
  onRequestDecision,
}: {
  caseDetail: CaseDetail;
  currentUser: CurrentUser | null;
  onRequestDecision: (actionKey: string) => void;
}) {
  const can = (cap: string) => currentUser?.capabilities?.includes(cap);

  return (
    <aside className="case-sidebar space-y-6">
      {/* Decision Panel */}
      <article className="card decision-panel">
        <h3 className="section-title-sm">Decision Panel</h3>

        {/* Overall Progress */}
        <div className="sidebar-progress-block">
          <div className="progress-label-row">
            <span>Overall Progress</span>
            <strong>{caseDetail.progress}%</strong>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <i style={{ width: `${caseDetail.progress}%` }} />
          </div>
        </div>

        {/* Lead Officer info */}
        <div className="officer-badge">
          <img
            src="https://ui-avatars.com/api/?name=Elena+Vance&background=722140&color=ffffff&bold=true"
            alt="Elena Vance avatar"
            className="sidebar-avatar"
          />
          <div>
            <strong className="block-name">
              {caseDetail.officerRecommendation?.officerName || 'Elena Vance'}
            </strong>
            <small className="muted">Lead Compliance Officer</small>
          </div>
        </div>

        {/* Blocking issues */}
        {caseDetail.blockingIssues.length > 0 && (
          <div className="blocking-issues-block">
            <p className="eyebrow alert-eyebrow">
              <AlertTriangle size={14} /> Blocking Issues
            </p>
            {caseDetail.blockingIssues.map((issue) => (
              <div className="blocking-issue-card" key={issue.id}>
                <strong>{issue.title}</strong>
                {issue.detail && <small>{issue.detail}</small>}
              </div>
            ))}
          </div>
        )}

        {/* Approval Conditions */}
        {caseDetail.approvalConditions.length > 0 && (
          <div className="approval-conditions-block">
            <p className="eyebrow">Approval Conditions</p>
            <ul className="list space-y-1">
              {caseDetail.approvalConditions.map((cond, i) => (
                <li key={i} style={{ fontSize: 13 }}>
                  ✔ {cond}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compliance Recommendation */}
        {caseDetail.officerRecommendation && (
          <div className="recommendation-block">
            <p className="eyebrow">Compliance Officer Recommendation</p>
            <blockquote>&ldquo;{caseDetail.officerRecommendation.quote}&rdquo;</blockquote>
            <small className="muted">
              {caseDetail.officerRecommendation.officerName} · {caseDetail.officerRecommendation.date}
            </small>
          </div>
        )}

        {/* Action Decision Buttons */}
        <div className="decision-actions-stack">
          {can('approve_supplier') && (
            <button
              onClick={() => onRequestDecision('approve_supplier')}
              className="button primary full-width"
            >
              Approve Supplier
            </button>
          )}
          {can('approve_with_conditions') && (
            <button
              onClick={() => onRequestDecision('approve_with_conditions')}
              className="button full-width"
            >
              Approve with Conditions
            </button>
          )}
          {can('request_info') && (
            <button
              onClick={() => onRequestDecision('request_info')}
              className="button full-width"
            >
              Request Additional Information
            </button>
          )}
          {can('reject_supplier') && (
            <button
              onClick={() => onRequestDecision('reject_supplier')}
              className="button danger-outline full-width"
            >
              Reject Supplier
            </button>
          )}
          {can('suspend_review') && (
            <button
              onClick={() => onRequestDecision('suspend_review')}
              className="button text-button full-width"
            >
              Suspend Review
            </button>
          )}
        </div>
      </article>

      <div className="muted" style={{ fontSize: 12, padding: '0 4px' }}>
        ℹ All approval, rejection, suspension and override decisions require a reason and are recorded in the audit history.
      </div>
    </aside>
  );
}
