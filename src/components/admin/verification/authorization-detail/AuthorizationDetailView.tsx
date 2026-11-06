"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  FileText,
  GitBranch,
  MapPin,
  MoreVertical,
  UserRound,
  UsersRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { ReasonModal } from "@/components/admin/common/ReasonModal";
import { submitAdminAction } from "@/services/api/adminDataSource";
import type { AuthorizationAuditEntry, BrandAuthorizationDetail } from "@/types/authorizationDetail";

const tabs = [
  "Overview",
  "Authorization Documents",
  "Territory & Sales Rights",
  "Product Category Scope",
  "Validation Checks",
  "Conflict Analysis",
  "Communication History",
  "Audit History",
];

const decisionActions = {
  approve: { label: "Approve Authorization", result: "Approved" },
  conditions: { label: "Approve with Conditions", result: "Approved with Conditions" },
  request: { label: "Request Additional Information", result: "Additional Information Requested" },
  escalate: { label: "Escalate Conflict", result: "Conflict Escalated" },
  reject: { label: "Reject Authorization", result: "Rejected" },
  suspend: { label: "Suspend Review", result: "Review Suspended" },
} as const;

type DecisionAction = keyof typeof decisionActions;

function scoreTone(score: number) {
  return score < 60 ? "warning" : "success";
}

export function AuthorizationDetailView({ initialCase }: { initialCase: BrandAuthorizationDetail }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [decision, setDecision] = useState<DecisionAction | null>(null);
  const [caseStatus, setCaseStatus] = useState(initialCase.status);
  const [auditHistory, setAuditHistory] = useState(initialCase.auditHistory);
  const [isConflictOpen, setConflictOpen] = useState(false);
  const [isMoreOpen, setMoreOpen] = useState(false);

  const action = decision ? decisionActions[decision] : null;
  const riskTone = initialCase.riskScore >= 60 ? "high" : initialCase.riskScore >= 30 ? "medium" : "low";
  const isOverview = activeTab === "Overview";
  const tabSummary = useMemo(() => {
    if (activeTab === "Authorization Documents") return "Review submitted authorization letters, trademark consents, and expiry information.";
    if (activeTab === "Territory & Sales Rights") return "Review the approved channels and requested distribution territory.";
    if (activeTab === "Conflict Analysis") return "Review active authorizations and resolve territory overlaps before making a final decision.";
    if (activeTab === "Audit History") return "View every review event and decision recorded for this authorization.";
    return "This section will surface the complete operational data when connected to the compliance service.";
  }, [activeTab]);

  async function confirmDecision(reason: string) {
    if (!decision || !action) return;

    await submitAdminAction(initialCase.reference, initialCase.authorizationId, action.label, reason);
    const event: AuthorizationAuditEntry = {
      id: crypto.randomUUID(),
      date: "Just now",
      actor: "Elena Vance",
      action: action.label,
      detail: reason,
    };
    setAuditHistory((items) => [event, ...items]);
    setCaseStatus(action.result);
    toast.success(`${action.label} recorded in the audit history.`);
  }

  return (
    <div className="authorization-detail">
      <div className="authorization-crumbs" aria-label="Breadcrumb">
        <Link href="/admin/verification-compliance/supplier-verification">Verification &amp; Compliance</Link>
        <ChevronRight size={14} />
        <Link href="/admin/brands-suppliers/authorizations">Brand Authorization Review</Link>
        <ChevronRight size={14} />
        <strong>{initialCase.reference}</strong>
      </div>

      <Link href="/admin/brands-suppliers/authorizations" className="authorization-back-link">
        <ArrowLeft size={16} /> Back to Brand Authorization Review Queue
      </Link>

      <section className="card authorization-header-card">
        <div className="authorization-header-main">
          <div className="authorization-brand-lockup" aria-label={`${initialCase.brandOwner} authorization`}>
            <Building2 size={28} aria-hidden="true" />
            <span>{initialCase.brandOwner.split(" ").slice(0, 2).join(" ")}</span>
          </div>

          <div className="authorization-title-block">
            <div className="authorization-title-row">
              <h1>{initialCase.reference}</h1>
              <span className="authorization-status-pill">{caseStatus}</span>
              <span className={`authorization-risk-pill ${riskTone}`}>Risk Score {initialCase.riskScore}/100 ({initialCase.riskLabel})</span>
            </div>
            <div className="authorization-identity-row">
              <strong>{initialCase.requestingEntity}</strong>
              <span>{initialCase.brandOwner}</span>
            </div>
            <div className="authorization-meta-row">
              <span><CalendarDays size={15} /> Case Created <strong>{initialCase.submittedDate}</strong></span>
              <span><Clock3 size={15} /> Last Updated <strong>{initialCase.lastUpdated}</strong></span>
              <span><UsersRound size={15} /> Assigned To <strong>{initialCase.assignedTo}</strong></span>
              <span><UserRound size={15} /> Submitted By <strong>{initialCase.submittedBy}</strong></span>
              <span className="priority-high"><CircleAlert size={15} /> Priority <strong>High Risk</strong></span>
            </div>
          </div>
        </div>

        <div className="authorization-header-actions">
          <div className="authorization-more-wrap">
            <button className="icon-button" aria-label="More authorization actions" onClick={() => setMoreOpen((open) => !open)}>
              <MoreVertical size={18} />
            </button>
            {isMoreOpen && (
              <div className="authorization-more-menu">
                <button onClick={() => { setMoreOpen(false); setDecision("conditions"); }}>Approve with Conditions</button>
                <button onClick={() => { setMoreOpen(false); setDecision("suspend"); }}>Suspend Review</button>
              </div>
            )}
          </div>
          <button className="button" onClick={() => setDecision("request")}>Request Additional Information</button>
          <button className="button primary" onClick={() => setDecision("approve")}>Approve Authorization</button>
        </div>
      </section>

      <div className="authorization-tabs" role="tablist" aria-label="Authorization case sections">
        {tabs.map((tab) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {isOverview ? (
        <div className="authorization-content-grid">
          <main className="authorization-main-column">
            <section className="card authorization-workflow-card">
              <p className="authorization-section-eyebrow">Authorization Status</p>
              <div className="authorization-stepper">
                {initialCase.workflow.map((step, index) => (
                  <div className={`authorization-step ${step.state}`} key={step.label}>
                    {index < initialCase.workflow.length - 1 && <span className="authorization-step-line" />}
                    <span className="authorization-step-icon">{step.state === "complete" ? <Check size={14} /> : step.state === "current" ? <FileText size={14} /> : index + 1}</span>
                    <strong>{step.label}</strong>
                    <small>{step.date}</small>
                  </div>
                ))}
              </div>
            </section>

            {initialCase.conflicts.map((conflict) => (
              <section className="card authorization-conflict-card" key={conflict.title}>
                <div className="authorization-conflict-heading">
                  <div>
                    <span className="authorization-conflict-label">{conflict.severity} conflict found</span>
                    <h2>Conflict Analysis: Overlapping Exclusive Claim</h2>
                  </div>
                  <button className="authorization-text-button" onClick={() => setConflictOpen((open) => !open)}>
                    {isConflictOpen ? "Hide Details" : "View Details"}
                  </button>
                </div>
                <div className="authorization-conflict-summary">
                  <div><span>Conflicting Entity</span><strong>{conflict.entity}</strong></div>
                  <div><span>Right Type</span><strong>{conflict.rightType}</strong></div>
                  <AlertCircle size={66} aria-hidden="true" />
                </div>
                {isConflictOpen && <p className="authorization-conflict-detail">{conflict.detail}</p>}
                <div className="authorization-conflict-actions">
                  <button className="button primary" onClick={() => setDecision("request")}>Request Brand Owner Confirmation</button>
                  <button className="button" onClick={() => toast.success("The conflict has been marked for follow-up.")}>Mark No Conflict</button>
                  <button className="button" onClick={() => setDecision("escalate")}>Escalate to Legal Review</button>
                  <button className="button" onClick={() => setDecision("conditions")}>Approve with Territory Restrictions</button>
                  <button className="button danger-outline" onClick={() => setDecision("reject")}>Reject Due to Conflict</button>
                </div>
              </section>
            ))}

            <div className="authorization-summary-grid">
              <section className="card authorization-summary-card">
                <div className="authorization-card-title"><p className="authorization-section-eyebrow">Authorization Summary</p><BadgeCheck size={18} /></div>
                <dl className="authorization-definition-list">
                  <div><dt>Requesting Entity</dt><dd>{initialCase.requestingEntity} (Sri Lanka)</dd></div>
                  <div><dt>Brand Owner</dt><dd>{initialCase.brandOwner}</dd></div>
                  <div><dt>Brand/License</dt><dd>{initialCase.brandLicense}</dd></div>
                  <div><dt>Authorization</dt><dd>{initialCase.authorizationType}</dd></div>
                </dl>
              </section>
              <section className="card authorization-territory-card">
                <div className="authorization-card-title"><p className="authorization-section-eyebrow">Territory &amp; Sales Rights</p><MapPin size={18} /></div>
                <p className="authorization-territory-name"><MapPin size={16} /> Requested Territory <strong>{initialCase.territory}</strong></p>
                <div className="authorization-channel-list">
                  {initialCase.channels.map((channel) => <div key={channel.label}><span>{channel.label}</span><strong className={channel.status === "Approved" ? "approved" : "restricted"}>{channel.status}</strong></div>)}
                </div>
              </section>
            </div>

            <section className="card authorization-documents-card">
              <div className="authorization-documents-heading">
                <p className="authorization-section-eyebrow">Authorization Documents</p>
                <button className="authorization-text-button" onClick={() => toast("Document upload will be connected to the compliance document service.")}>+ Upload New</button>
              </div>
              <div className="authorization-document-table-wrap">
                <table className="authorization-document-table">
                  <thead><tr><th>Document Name</th><th>Status</th><th>Issuer / Date</th><th>Expiry</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{initialCase.documents.map((document) => <tr key={document.id}>
                    <td><FileText size={17} /> {document.name}</td>
                    <td><span className={`authorization-document-status ${document.status.toLowerCase().replaceAll(" ", "-")}`}>{document.status}</span></td>
                    <td>{document.issuer}<small>{document.issuedOn}</small></td>
                    <td>{document.expiry}</td>
                    <td><button className="authorization-view-button" aria-label={`View ${document.name}`} onClick={() => toast(`Preview for ${document.name} will open here.`)}><Eye size={17} /></button></td>
                  </tr>)}</tbody>
                </table>
              </div>
            </section>

            <section className="card authorization-checklist-card">
              <p className="authorization-section-eyebrow">Validation Checklist</p>
              <div className="authorization-checklist-grid">
                {initialCase.checklist.map((group) => <div key={group.title}><h3><GitBranch size={14} /> {group.title}</h3>{group.items.map((item) => <p key={item.label}><ChevronRight size={14} /> {item.label} <span className={item.status}>{item.status === "complete" ? <Check size={14} /> : <Clock3 size={14} />}</span></p>)}</div>)}
              </div>
            </section>
          </main>

          <aside className="authorization-sidebar">
            <section className="card authorization-validation-card">
              <p className="authorization-section-eyebrow">Automated Validation Result</p>
              <div className="authorization-score-row"><div><small>Overall</small><strong>{initialCase.validationScore}%</strong></div><div><small>Risk Score</small><strong>{initialCase.riskScore}/100</strong><span>{initialCase.riskLabel}</span></div></div>
              <div className="authorization-score-meter"><i style={{ width: `${initialCase.validationScore}%` }} /></div>
              <div className="authorization-validation-list">
                {initialCase.validations.map((validation) => <div key={validation.label}><span>{validation.label}</span><strong>{validation.score}%</strong><i className={scoreTone(validation.score)}><b style={{ width: `${validation.score}%` }} /></i></div>)}
              </div>
            </section>

            <section className="card authorization-issues-card">
              <p className="authorization-section-eyebrow issues">Blocking Issues ({initialCase.blockingIssues.length})</p>
              {initialCase.blockingIssues.map((issue) => <button key={issue} onClick={() => setActiveTab("Conflict Analysis")}><span>{issue}</span><ChevronRight size={16} /></button>)}
            </section>

            <section className="card authorization-recommendation-card">
              <p className="authorization-section-eyebrow">Compliance Officer Recommendation</p>
              <div className="authorization-officer"><span>{initialCase.recommendation.initials}</span><div><strong>{initialCase.recommendation.officer}</strong><small>{initialCase.recommendation.role}</small></div></div>
              <blockquote>{initialCase.recommendation.note}</blockquote>
            </section>

            <section className="card authorization-decision-card">
              <p className="authorization-section-eyebrow">Final Authority Decision</p>
              <div>
                <button className="button primary" onClick={() => setDecision("approve")}>Approve Authorization</button>
                <button className="button" onClick={() => setDecision("conditions")}>Approve with Conditions</button>
                <button className="button" onClick={() => setDecision("request")}>Request Additional Information</button>
                <button className="button warning-outline" onClick={() => setDecision("escalate")}>Escalate Conflict</button>
                <button className="button danger-outline" onClick={() => setDecision("reject")}>Reject Authorization</button>
                <button className="button" onClick={() => setDecision("suspend")}>Suspend Review</button>
              </div>
              <p>All approvals, rejections, suspensions, escalations and overrides require a reason and are recorded in the audit history.</p>
            </section>
          </aside>
        </div>
      ) : (
        <section className="card authorization-tab-placeholder" role="tabpanel">
          <FileText size={26} />
          <div><h2>{activeTab}</h2><p>{tabSummary}</p></div>
          {activeTab === "Audit History" && <div className="authorization-audit-list">{auditHistory.map((event) => <article key={event.id}><strong>{event.action}</strong><span>{event.date} Â· {event.actor}</span><p>{event.detail}</p></article>)}</div>}
        </section>
      )}

      <ReasonModal
        open={!!action}
        record={initialCase.reference}
        action={action?.label ?? ""}
        resultingStatus={action?.result ?? caseStatus}
        impact="The compliance service will notify the requesting entity and record the decision in its audit history."
        onClose={() => setDecision(null)}
        onSubmit={confirmDecision}
      />
    </div>
  );
}
