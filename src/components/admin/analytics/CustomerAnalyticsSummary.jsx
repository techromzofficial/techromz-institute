"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ExternalLink } from "lucide-react";

export function CustomerAnalyticsSummary({ data = {}, searchParams }) {
  const customerReportUrl = buildAnalyticsReportUrl({
    reportId: "customer-analytics-report",
    currentSearchParams: searchParams,
  });

  const segments = data.segments || ["New", "Active", "Loyalty", "High-Value", "At-Risk", "Dormant"];

  return (
    <div className="analytics-card summary-card">
      <div className="summary-card-header flex-between">
        <h3 className="summary-title">Customer Analytics</h3>
        <a href={customerReportUrl} className="summary-header-link">
          View Customer Report <ExternalLink size={12} />
        </a>
      </div>

      <div className="summary-card-body">
        <div className="summary-top-row grid-4col">
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Active Customers</span>
            <span className="summary-stat-value sm">{data.activeCustomers || "8,942"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">New Customers</span>
            <span className="summary-stat-value sm">{data.newCustomers || "1,184"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Repeat Customers</span>
            <span className="summary-stat-value sm">{data.repeatCustomers || "3,452"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Repeat Purchase Rate</span>
            <span className="summary-stat-value sm text-success">{data.repeatPurchaseRate || "38.6%"}</span>
          </div>
        </div>

        <div className="summary-grid-4col margin-v">
          <div className="summary-metric-pill">
            <span className="pill-label">Avg. Customer Value</span>
            <span className="pill-val">{data.avgCustomerValue || "LKR 28,400"}</span>
          </div>
          <div className="summary-metric-pill success">
            <span className="pill-label">Retention Rate</span>
            <span className="pill-val">{data.retentionRate || "72%"}</span>
          </div>
          <div className="summary-metric-pill warning">
            <span className="pill-label">At-Risk Customers</span>
            <span className="pill-val">{data.atRiskCustomers ?? 286}</span>
          </div>
          <div className="summary-metric-pill primary">
            <span className="pill-label">High-Value Customers</span>
            <span className="pill-val">{data.highValueCustomers ?? 412}</span>
          </div>
        </div>

        <div className="customer-segments-block">
          <span className="segments-label">Customer Segments</span>
          <div className="segment-pills-list">
            {segments.map((seg, i) => (
              <span key={i} className="segment-pill">
                {seg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

