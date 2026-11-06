"use client";

import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export function ReportPriorityInsights({ insights = [] }) {
  const defaultInsights = [
    { id: "pi-1", title: "Order growth is 11.2% above the comparison period", severity: "info" },
    { id: "pi-2", title: "Skincare contributes 42.4% of gross order value", severity: "info" },
    { id: "pi-3", title: "Supplier confirmation delays affect 18 active orders", severity: "warning" },
    { id: "pi-4", title: "Failed payments decreased by 8.2%", severity: "success" },
    { id: "pi-5", title: "Colombo region has the highest order value", severity: "info" },
    { id: "pi-6", title: "Return-linked orders remain below 2.1%", severity: "success" },
  ];

  const items = insights.length > 0 ? insights : defaultInsights;

  const getIcon = (severity) => {
    if (severity === "warning") return <AlertTriangle size={12} className="text-warning" />;
    if (severity === "success") return <CheckCircle2 size={12} className="text-success" />;
    return <TrendingUp size={12} className="text-info" />;
  };

  return (
    <div className="analytics-card right-panel-card flex-column">
      <h3 className="right-card-title">Priority Insights</h3>
      <div className="insights-list-stack">
        {items.map((item) => (
          <div key={item.id} className="insight-item-row">
            <span className="insight-icon">{getIcon(item.severity)}</span>
            <span className="insight-text">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

