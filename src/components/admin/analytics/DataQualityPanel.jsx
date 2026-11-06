"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { Database, RefreshCw, ExternalLink } from "lucide-react";

export function DataQualityPanel({ dataQuality = {}, searchParams }) {
  const lastUpdated = dataQuality.lastUpdated || "Jul 24, 2026 — 4:30 AM";
  const sources = dataQuality.sources || [
    { name: "Order Data", status: "Complete" },
    { name: "Payment Data", status: "Complete" },
    { name: "Inventory Data", status: "Complete" },
    { name: "Logistics Data", status: "Minor Delay" },
    { name: "Support Data", status: "Complete" },
  ];
  const failedPipelines = dataQuality.failedPipelines ?? 1;

  const dataQualityReportUrl = buildAnalyticsReportUrl({
    reportId: "data-quality-report",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card right-panel-card">
      <div className="right-card-header flex-between">
        <h3 className="right-card-title flex-center-gap">
          <Database size={16} className="text-muted" /> Data Quality Status
        </h3>
        <span className="last-sync-time">
          {lastUpdated} <RefreshCw size={11} className="inline-icon" />
        </span>
      </div>

      <div className="data-sources-list">
        {sources.map((src, i) => {
          const isComplete = src.status === "Complete";
          const isDelay = src.status === "Minor Delay" || src.status === "Delayed";
          const isFailed = src.status === "Failed";

          const statusClass = isComplete
            ? "status-complete"
            : isDelay
            ? "status-delay"
            : isFailed
            ? "status-failed"
            : "status-muted";

          return (
            <div key={i} className="data-source-row">
              <span className="source-name">{src.name}</span>
              <span className={`source-status ${statusClass}`}>{src.status}</span>
            </div>
          );
        })}

        <div className="data-source-row highlight-failed">
          <span className="source-name">Failed Pipelines</span>
          <span className="source-status text-danger font-bold">{failedPipelines}</span>
        </div>
      </div>

      <div className="right-card-footer center">
        <a href={dataQualityReportUrl} className="chart-footer-link">
          View Data Quality Report <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

