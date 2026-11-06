"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ExternalLink } from "lucide-react";

export function ReturnsRefundsSummary({ data = {}, searchParams }) {
  const returnsReportUrl = buildAnalyticsReportUrl({
    reportId: "returns-analysis-report",
    currentSearchParams: searchParams,
  });

  const topReasons = data.topReturnReasons || [
    { reason: "Product Defect", percentage: 38 },
    { reason: "Wrong Shade", percentage: 24 },
    { reason: "Damaged Delivery", percentage: 18 },
    { reason: "Authenticity Concern", percentage: 12 },
    { reason: "Skin Reaction", percentage: 8 },
  ];

  return (
    <div className="analytics-card summary-card">
      <div className="summary-card-header flex-between">
        <h3 className="summary-title">Returns &amp; Refunds</h3>
        <a href={returnsReportUrl} className="summary-header-link">
          View Returns Report <ExternalLink size={12} />
        </a>
      </div>

      <div className="summary-card-body">
        <div className="summary-top-row grid-5col">
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Return Requests</span>
            <span className="summary-stat-value sm">{data.returnRequests ?? 244}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Return Rate</span>
            <span className="summary-stat-value sm text-success">{data.returnRate || "4.8%"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Approved</span>
            <span className="summary-stat-value sm">{data.approvedCount ?? 89}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Rejected</span>
            <span className="summary-stat-value sm">{data.rejectedCount ?? 18}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Refund Processing</span>
            <span className="summary-stat-value sm">{data.refundProcessingCount ?? 56}</span>
          </div>
        </div>

        <div className="returns-financial-row">
          <div>
            <span className="returns-label">Avg. Resolution</span>
            <span className="returns-val">{data.avgResolutionTime || "3.4 Days"}</span>
          </div>
          <div>
            <span className="returns-label">Refund Value</span>
            <span className="returns-val">{data.refundValue || "LKR 2.4M"}</span>
          </div>
          <div>
            <span className="returns-label">Supplier Recovery Pending</span>
            <span className="returns-val warning">{data.supplierRecoveryPending || "LKR 185,000"}</span>
          </div>
        </div>

        <div className="top-reasons-block">
          <h4 className="reasons-heading">Top Return Reasons</h4>
          <ul className="reasons-list">
            {topReasons.map((item, i) => (
              <li key={i} className="reason-item">
                <span className="reason-name">{item.reason}</span>
                <div className="reason-bar-track">
                  <div className="reason-bar-fill" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="reason-pct">{item.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

