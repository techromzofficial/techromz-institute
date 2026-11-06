"use client";

import React from "react";

export function ReportDataQualityPanel({ dataQuality = {} }) {
  const {
    sources = [
      { name: "Order Data", status: "Complete" },
      { name: "Payment Data", status: "Complete" },
      { name: "Supplier Data", status: "Complete" },
      { name: "Logistics Data", status: "Minor Delay" },
      { name: "Support Data", status: "Complete" },
    ],
    failedPipelines = 1,
  } = dataQuality;

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("complete")) return "text-success";
    if (s.includes("minor") || s.includes("delay")) return "text-warning";
    if (s.includes("failed")) return "text-danger";
    return "text-muted";
  };

  return (
    <div className="analytics-card right-panel-card flex-column">
      <h3 className="right-card-title">Data Quality Status</h3>
      <div className="data-quality-stack">
        {sources.map((src, idx) => (
          <div key={idx} className="quality-row flex-between">
            <span className="source-name">{src.name}</span>
            <span className={`source-status bold ${getStatusClass(src.status)}`}>{src.status}</span>
          </div>
        ))}
        <div className="quality-row flex-between failed-pipeline-row">
          <span className="source-name">Failed Pipelines</span>
          <span className="source-status warning bold">{failedPipelines}</span>
        </div>
      </div>
    </div>
  );
}

