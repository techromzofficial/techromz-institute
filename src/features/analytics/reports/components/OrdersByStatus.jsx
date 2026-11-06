"use client";

import React from "react";

export function OrdersByStatus({ statusData }) {
  const statuses = statusData || [
    { name: "Processing", count: "10,516", percentage: 84.2, color: "#1e293b" },
    { name: "Cancelled", count: "142", percentage: 1.1, color: "#dc2626" },
    { name: "Returned", count: "244", percentage: 2.0, color: "#d97706" },
    { name: "On Hold", count: "126", percentage: 1.0, color: "#64748b" },
  ];

  return (
    <div className="analytics-card breakdown-card flex-column">
      <div className="chart-card-header">
        <h3 className="chart-title">Orders by Status</h3>
      </div>

      <div className="breakdown-list-stack flex-1">
        {statuses.map((item, idx) => (
          <div key={idx} className="breakdown-row">
            <span className="status-dot-marker" style={{ backgroundColor: item.color }} />
            <span className="breakdown-name">{item.name}</span>
            <span className="breakdown-count">{item.count}</span>
            <span className="breakdown-pct">({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

