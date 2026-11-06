"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export function ReportAnomaliesPanel({ alerts = [], onSelectQuickFilter }) {
  const defaultAlerts = [
    { id: "al-1", label: "18 orders awaiting supplier confirmation", quickFilter: "awaiting-supplier" },
    { id: "al-2", label: "12 SLA-breached orders", quickFilter: "sla-breaches" },
    { id: "al-3", label: "156 failed payments", quickFilter: "failed-payments" },
    { id: "al-4", label: "23 delivery exceptions", quickFilter: "delivery-exceptions" },
    { id: "al-5", label: "31 stockout-linked order risks", quickFilter: "stockout-risks" },
    { id: "al-6", label: "4 high-risk safety-related orders", quickFilter: "safety-orders" },
  ];

  const list = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <div className="analytics-card right-panel-card flex-column">
      <h3 className="right-card-title flex-center-gap">
        <AlertCircle size={13} className="text-danger" /> Anomalies and Alerts
      </h3>
      <div className="anomalies-list-stack">
        {list.map((item) => (
          <button
            key={item.id}
            type="button"
            className="anomaly-item-row text-left"
            onClick={() => onSelectQuickFilter && onSelectQuickFilter(item.quickFilter)}
          >
            <span className="anomaly-dot-badge" />
            <span className="anomaly-text">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

