"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ExternalLink } from "lucide-react";

export function SupportPerformanceSummary({ data = {}, searchParams }) {
  const supportReportUrl = buildAnalyticsReportUrl({
    reportId: "customer-support-performance",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card summary-card">
      <div className="summary-card-header flex-between">
        <h3 className="summary-title">Customer Support Performance</h3>
        <a href={supportReportUrl} className="summary-header-link">
          View Support Report <ExternalLink size={12} />
        </a>
      </div>

      <div className="summary-card-body">
        <div className="summary-top-row grid-5col">
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Open Cases</span>
            <span className="summary-stat-value sm">{data.openCases ?? 1286}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">New Cases</span>
            <span className="summary-stat-value sm">{data.newCases ?? 1184}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Cases Within SLA</span>
            <span className="summary-stat-value sm text-success">{data.casesWithinSla || "93%"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">SLA Breaches</span>
            <span className="summary-stat-value sm text-danger">{data.slaBreaches ?? 12}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Avg. First Response</span>
            <span className="summary-stat-value sm">{data.avgFirstResponse || "18 Mins"}</span>
          </div>
        </div>

        <div className="summary-grid-4col margin-v">
          <div className="summary-metric-pill">
            <span className="pill-label">Avg. Resolution</span>
            <span className="pill-val">{data.avgResolutionTime || "6.4 Hours"}</span>
          </div>
          <div className="summary-metric-pill">
            <span className="pill-label">Resolved Today</span>
            <span className="pill-val">{data.resolvedToday ?? 196}</span>
          </div>
          <div className="summary-metric-pill success">
            <span className="pill-label">Customer Satisfaction</span>
            <span className="pill-val">{data.customerSatisfaction || "91%"}</span>
          </div>
          <div className="summary-metric-pill warning">
            <span className="pill-label">Escalated Cases</span>
            <span className="pill-val">{data.escalatedCases ?? 17}</span>
          </div>
        </div>

        <div className="summary-footer-stat-box danger">
          <span className="stat-box-label">Safety Complaints</span>
          <span className="stat-box-val">{data.safetyComplaints ?? 4}</span>
        </div>
      </div>
    </div>
  );
}

