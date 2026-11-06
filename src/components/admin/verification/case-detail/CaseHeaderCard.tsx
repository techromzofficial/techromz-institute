'use client';

import { useRef, useState } from 'react';
import { ShieldCheck, MoreVertical, Building2 } from 'lucide-react';
import { CaseDetail, CurrentUser } from '@/mocks/admin/caseDetail.mock';
import { useClickOutside } from '@/lib/useClickOutside';

export function CaseHeaderCard({
  caseDetail,
  currentUser,
  onRequestDecision,
}: {
  caseDetail: CaseDetail;
  currentUser: CurrentUser | null;
  onRequestDecision: (actionKey: string) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMoreOpen(false));

  const can = (cap: string) => currentUser?.capabilities?.includes(cap);

  return (
    <article className="card case-header-card">
      <div className="case-header-main">
        <div className="case-header-identity">
          <div className="case-header-avatar">
            <Building2 size={24} />
          </div>
          <div className="case-header-title-block">
            <div className="case-header-title-row">
              <h2>{caseDetail.name}</h2>
              <span className="badge warning">{caseDetail.status}</span>
            </div>
            <p className="muted">
              Officer: {caseDetail.officerRecommendation?.officerName || 'Elena Vance'} · {caseDetail.date} · {caseDetail.processingDays} Days
            </p>
          </div>
        </div>

        <div className="case-header-risk-pill">
          <ShieldCheck size={16} />
          <span>{caseDetail.riskScore}/100 — Low Risk</span>
        </div>
      </div>

      <div className="case-header-actions-row">
        {can('request_info') && (
          <button
            onClick={() => onRequestDecision('request_info')}
            className="button"
          >
            Request Additional Information
          </button>
        )}
        {can('reject_supplier') && (
          <button
            onClick={() => onRequestDecision('reject_supplier')}
            className="button danger-outline"
          >
            Reject Supplier
          </button>
        )}
        {can('approve_supplier') && (
          <button
            onClick={() => onRequestDecision('approve_supplier')}
            className="button primary"
          >
            Approve Supplier
          </button>
        )}

        <div className="more-menu-wrap" ref={menuRef}>
          <button
            onClick={() => setMoreOpen((p) => !p)}
            className="icon-button"
            aria-label="More actions"
          >
            <MoreVertical size={17} />
          </button>
          {moreOpen && (
            <div className="more-dropdown">
              {can('approve_with_conditions') && (
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    onRequestDecision('approve_with_conditions');
                  }}
                  className="dropdown-item"
                >
                  Approve with Conditions
                </button>
              )}
              {can('suspend_review') && (
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    onRequestDecision('suspend_review');
                  }}
                  className="dropdown-item danger"
                >
                  Suspend Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
