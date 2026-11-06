'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import { verificationCaseService } from '@/mocks/admin/caseDetail.mock';
import { CaseDetail, CurrentUser, AuditEntry } from '@/mocks/admin/caseDetail.mock';
import { CaseHeaderCard } from './CaseHeaderCard';
import { CaseTabs } from './CaseTabs';
import { CaseSidebar } from './CaseSidebar';
import { DecisionActionModal, ActionConfig } from './DecisionActionModal';

const QUEUE_HREF = '/admin/verification-compliance/supplier-verification';

function getDecisionActions(caseDetail: CaseDetail): Record<string, ActionConfig> {
  return {
    approve_supplier: {
      key: 'approve_supplier',
      title: 'Approve Supplier',
      description: `This approves ${caseDetail.name} and moves the case toward marketplace activation.`,
      confirmLabel: 'Approve Supplier',
      destructive: false,
    },
    approve_with_conditions: {
      key: 'approve_with_conditions',
      title: 'Approve with Conditions',
      description: `This approves ${caseDetail.name}, subject to the listed approval conditions being met.`,
      confirmLabel: 'Approve with Conditions',
      destructive: false,
    },
    request_info: {
      key: 'request_info',
      title: 'Request Additional Information',
      description: `Send ${caseDetail.name} a request for more information before this case can proceed.`,
      confirmLabel: 'Send Request',
      destructive: false,
    },
    reject_supplier: {
      key: 'reject_supplier',
      title: 'Reject Supplier',
      description: `This rejects ${caseDetail.name}'s application — a significant decision that will be recorded.`,
      confirmLabel: 'Reject Supplier',
      destructive: true,
    },
    suspend_review: {
      key: 'suspend_review',
      title: 'Suspend Review',
      description: `This pauses active review of ${caseDetail.name} until it's reactivated.`,
      confirmLabel: 'Suspend Review',
      destructive: false,
    },
  };
}

export function CaseDetailView({ supplierId }: { supplierId: string }) {
  // undefined = loading, null = not found, object = loaded
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCaseDetail(undefined);
    setAuditLog([]);

    verificationCaseService.getCaseDetail(supplierId).then((data) => {
      if (!active) return;
      setCaseDetail(data);
      setAuditLog(data?.auditHistory || []);
    });

    verificationCaseService.getCurrentUser().then((user) => {
      if (active) setCurrentUser(user);
    });

    return () => {
      active = false;
    };
  }, [supplierId]);

  if (caseDetail === undefined) {
    return (
      <div className="space-y-6">
        <div className="card space-y-4" style={{ height: 120 }}>
          <div className="skeleton" style={{ height: 28, width: '33%' }} />
          <div className="skeleton" style={{ height: 16, width: '50%' }} />
        </div>
        <div className="grid two-column">
          <div className="space-y-6">
            <div className="skeleton" style={{ height: 200, width: '100%', borderRadius: 12 }} />
            <div className="skeleton" style={{ height: 280, width: '100%', borderRadius: 12 }} />
          </div>
          <div className="skeleton" style={{ height: 400, width: '100%', borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (caseDetail === null) {
    return (
      <article className="card state">
        <SearchX className="text-gray-300" size={36} />
        <h2 style={{ marginTop: 12 }}>We couldn&apos;t find that verification case.</h2>
        <p className="muted">It may have been removed, or the link might be out of date.</p>
        <Link
          href={QUEUE_HREF}
          className="button primary"
          style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={15} /> Back to Supplier Verification Queue
        </Link>
      </article>
    );
  }

  const decisionActions = getDecisionActions(caseDetail);
  const pendingAction = pendingActionKey ? decisionActions[pendingActionKey] : null;

  function handleConfirmDecision(reason: string) {
    if (!pendingActionKey || !caseDetail) return;
    const action = decisionActions[pendingActionKey];
    setAuditLog((prev) => [
      {
        id: (prev[0]?.id || 0) + 1,
        timestamp: 'Just now',
        actor: currentUser?.name || 'Elena Vance',
        action: action.title,
        detail: reason,
      },
      ...prev,
    ]);
    toast.success(`${action.title} recorded.`);
    setPendingActionKey(null);
  }

  return (
    <div className="case-detail-container">
      <div className="case-breadcrumb-bar">
        <Link href={QUEUE_HREF} className="back-link">
          <ArrowLeft size={15} /> Back to Supplier Verification Queue
        </Link>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={QUEUE_HREF}>Verification &amp; Compliance</Link>
          <span>/</span>
          <Link href={QUEUE_HREF}>Supplier Verification Cases</Link>
          <span>/</span>
          <strong>{caseDetail.publicReference}</strong>
        </nav>
      </div>

      <CaseHeaderCard
        caseDetail={caseDetail}
        currentUser={currentUser}
        onRequestDecision={setPendingActionKey}
      />

      <div className="grid two-column">
        <div>
          <CaseTabs caseDetail={caseDetail} auditLog={auditLog} />
        </div>
        <CaseSidebar
          caseDetail={caseDetail}
          currentUser={currentUser}
          onRequestDecision={setPendingActionKey}
        />
      </div>

      <DecisionActionModal
        open={!!pendingAction}
        action={pendingAction}
        onClose={() => setPendingActionKey(null)}
        onConfirm={handleConfirmDecision}
      />
    </div>
  );
}
