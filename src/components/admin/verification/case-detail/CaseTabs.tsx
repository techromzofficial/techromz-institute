'use client';

import { useState } from 'react';
import { CaseDetail, AuditEntry } from '@/mocks/admin/caseDetail.mock';
import { EntityInformationCard } from './EntityInformationCard';
import { WorkflowStatusCard } from './WorkflowStatusCard';
import { VerificationChecklistCard } from './VerificationChecklistCard';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Company Documents' },
  { id: 'brand', label: 'Brand Authorizations' },
  { id: 'product', label: 'Product Compliance' },
  { id: 'finance', label: 'Finance & Settlement' },
  { id: 'risk', label: 'Risk Assessment' },
  { id: 'communication', label: 'Communication History' },
  { id: 'audit', label: 'Audit History' },
];

export function CaseTabs({ caseDetail, auditLog }: { caseDetail: CaseDetail; auditLog: AuditEntry[] }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="case-tabs-wrapper">
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <EntityInformationCard caseDetail={caseDetail} />
            <WorkflowStatusCard stages={caseDetail.workflow} />
            <VerificationChecklistCard checklist={caseDetail.checklist} />
          </div>
        )}

        {activeTab === 'documents' && (
          <article className="card">
            <h3>Company Documents</h3>
            <p className="muted">Uploaded legal &amp; commercial registration documents.</p>
            <ul className="list space-y-2" style={{ marginTop: 12 }}>
              <li>✔ Business Registration Certificate (UK-882931-B) — Verified</li>
              <li>✔ Tax Exemption / VAT Certificate (GB 921 003 442) — Verified</li>
              <li>✔ Identity Documents (Marcus Thorne, Sarah Jenkins) — Verified</li>
              <li>⏳ Warehouse Lease Agreement — Under Review</li>
            </ul>
          </article>
        )}

        {activeTab === 'brand' && (
          <article className="card">
            <h3>Brand Authorizations</h3>
            <p className="muted">Direct brand distribution authorizations &amp; trademark certificates.</p>
            <ul className="list space-y-2" style={{ marginTop: 12 }}>
              <li>✔ Velvet Botanics Trademark Registration (Classes 3 &amp; 5) — Valid</li>
              <li>✔ Exclusive Brand Owner Declaration — Verified</li>
            </ul>
          </article>
        )}

        {activeTab === 'product' && (
          <article className="card">
            <h3>Product Compliance</h3>
            <p className="muted">Safety data sheets, lab results, and ingredient declarations.</p>
            <ul className="list space-y-2" style={{ marginTop: 12 }}>
              <li style={{ color: 'var(--danger)' }}>
                ✖ MSDS - Rosehip Glow Serum: Missing updated safety sheet
              </li>
              <li>✔ Dermatological Testing Report — Passed</li>
              <li>✔ Heavy Metal &amp; Microbiological Screening — Passed</li>
            </ul>
          </article>
        )}

        {activeTab === 'finance' && (
          <article className="card">
            <h3>Finance &amp; Settlement</h3>
            <p className="muted">Bank account routing and tax clearance status.</p>
            <ul className="list space-y-2" style={{ marginTop: 12 }}>
              <li>✔ Bank Account Verification (Barclays UK) — Verified</li>
              <li>✔ Settlement Currency &amp; Schedule (LKR / Bi-weekly) — Configured</li>
            </ul>
          </article>
        )}

        {activeTab === 'risk' && (
          <article className="card">
            <h3>Risk Assessment</h3>
            <p className="muted">Automated risk score breakdown and watchlist checks.</p>
            <div style={{ marginTop: 12 }}>
              <strong>Overall Risk Score: {caseDetail.riskScore}/100 (Low Risk)</strong>
              <ul className="list space-y-1" style={{ marginTop: 8 }}>
                <li>Sanction &amp; PEP Screening: Clear</li>
                <li>Adverse Media Scan: Clear</li>
                <li>Corporate Registry Match: 100% Match</li>
              </ul>
            </div>
          </article>
        )}

        {activeTab === 'communication' && (
          <article className="card">
            <h3>Communication History</h3>
            <p className="muted">Messages sent between compliance officers and supplier.</p>
            <div className="space-y-3" style={{ marginTop: 12 }}>
              {caseDetail.communicationHistory.map((comm) => (
                <div key={comm.id} className="expiry-row">
                  <strong>{comm.subject}</strong>
                  <small>
                    {comm.from} · {comm.date}
                  </small>
                  <p style={{ fontSize: 13, marginTop: 4 }}>{comm.preview}</p>
                </div>
              ))}
              {!caseDetail.communicationHistory.length && (
                <p className="muted">No messages sent yet.</p>
              )}
            </div>
          </article>
        )}

        {activeTab === 'audit' && (
          <article className="card">
            <h3>Audit History</h3>
            <p className="muted">Immutable log of all compliance decisions and updates.</p>
            <div className="timeline" style={{ marginTop: 16 }}>
              {auditLog.map((log) => (
                <div className="timeline-item" key={log.id}>
                  <strong>
                    {log.action} — <small className="muted">{log.actor}</small>
                  </strong>
                  <p className="muted" style={{ fontSize: 12, margin: '2px 0' }}>
                    {log.timestamp}
                  </p>
                  <span style={{ fontSize: 13 }}>{log.detail}</span>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
