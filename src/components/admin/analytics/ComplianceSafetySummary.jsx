"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ExternalLink } from "lucide-react";

export function ComplianceSafetySummary({ data = {}, searchParams }) {
  const complianceReportUrl = buildAnalyticsReportUrl({
    reportId: "compliance-safety-report",
    currentSearchParams: searchParams,
  });

  const safetyReportUrl = buildAnalyticsReportUrl({
    reportId: "safety-cases-report",
    currentSearchParams: searchParams,
  });

  const recallReportUrl = buildAnalyticsReportUrl({
    reportId: "recall-analysis-report",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card summary-card">
      <div className="summary-card-header flex-between">
        <h3 className="summary-title">Compliance &amp; Safety</h3>
        <a href={complianceReportUrl} className="summary-header-link">
          View Compliance Report <ExternalLink size={12} />
        </a>
      </div>

      <div className="summary-card-body">
        <div className="summary-top-row grid-3col">
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Verified Suppliers</span>
            <span className="summary-stat-value sm text-success">{data.verifiedSuppliers ?? 174}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Supplier Reviews Pending</span>
            <span className="summary-stat-value sm warning">{data.supplierReviewsPending ?? 10}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Approved Products</span>
            <span className="summary-stat-value sm">{data.approvedProducts || "1,842"}</span>
          </div>
        </div>

        <div className="summary-grid-3col margin-v">
          <div className="summary-metric-pill warning">
            <span className="pill-label">Product Reviews Pending</span>
            <span className="pill-val">{data.productReviewsPending ?? 36}</span>
          </div>
          <div className="summary-metric-pill">
            <span className="pill-label">Brand Authorizations</span>
            <span className="pill-val">{data.brandAuthorizations ?? 7}</span>
          </div>
          <div className="summary-metric-pill danger">
            <span className="pill-label">Active Recalls</span>
            <span className="pill-val">{data.activeRecalls ?? 2}</span>
          </div>
        </div>

        <div className="summary-grid-3col">
          <div className="summary-metric-pill warning">
            <span className="pill-label">Quarantined Batches</span>
            <span className="pill-val">{data.quarantinedBatches ?? 4}</span>
          </div>
          <div className="summary-metric-pill danger">
            <span className="pill-label">Open Safety Cases</span>
            <span className="pill-val">{data.openSafetyCases ?? 3}</span>
          </div>
          <div className="summary-metric-pill danger">
            <span className="pill-label">High-Risk Compliance Cases</span>
            <span className="pill-val">{data.highRiskComplianceCases ?? 6}</span>
          </div>
        </div>
      </div>

      <div className="summary-card-footer">
        <a href={safetyReportUrl} className="footer-action-link">
          View Safety Report
        </a>
        <a href={recallReportUrl} className="footer-action-link">
          View Recall Analysis
        </a>
      </div>
    </div>
  );
}

