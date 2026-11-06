'use client';

import { CaseDetail } from '@/mocks/admin/caseDetail.mock';

export function EntityInformationCard({ caseDetail }: { caseDetail: CaseDetail }) {
  return (
    <article className="card entity-info-card">
      <h3 className="section-title-sm">Entity Information</h3>
      <div className="entity-info-grid">
        <div className="info-cell">
          <span className="info-label">LEGAL NAME</span>
          <strong className="info-value">{caseDetail.legalName}</strong>
        </div>
        <div className="info-cell">
          <span className="info-label">TRADING NAME</span>
          <strong className="info-value">{caseDetail.tradingName}</strong>
        </div>
        <div className="info-cell">
          <span className="info-label">REGISTRATION NUMBER</span>
          <strong className="info-value">{caseDetail.registrationNumber}</strong>
        </div>
        <div className="info-cell">
          <span className="info-label">TAX ID</span>
          <strong className="info-value">{caseDetail.taxId}</strong>
        </div>
        <div className="info-cell full-width">
          <span className="info-label">REGISTERED ADDRESS</span>
          <strong className="info-value">{caseDetail.registeredAddress}</strong>
        </div>
        <div className="info-cell">
          <span className="info-label">DIRECTORS</span>
          <strong className="info-value">{caseDetail.directors.join(', ')}</strong>
        </div>
        <div className="info-cell">
          <span className="info-label">CLASSIFICATION</span>
          <strong className="info-value">{caseDetail.classification}</strong>
        </div>
      </div>
    </article>
  );
}
