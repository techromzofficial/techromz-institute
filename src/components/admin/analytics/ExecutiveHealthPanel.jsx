"use client";

import React from "react";

export function ExecutiveHealthPanel({ healthData = {} }) {
  const overallScore = healthData.overallHealthPercentage ?? 92;

  const items = [
    { label: "Revenue Growth", val: healthData.revenueGrowth || "12.4%", pct: 85, color: "var(--success)" },
    { label: "Orders Growth", val: healthData.ordersGrowth || "11.2%", pct: 80, color: "var(--success)" },
    { label: "Gross Margin", val: healthData.grossMargin || "18.6%", pct: 75, color: "var(--success)" },
    { label: "Fulfilment Health", val: healthData.fulfilmentHealth || "93.8%", pct: 93.8, color: "var(--success)" },
    { label: "Delivery Health", val: healthData.deliveryHealth || "91.4%", pct: 91.4, color: "var(--success)" },
    { label: "Support SLA", val: healthData.supportSla || "93%", pct: 93, color: "var(--success)" },
    { label: "Inventory Risk", val: healthData.inventoryRisk || "Medium", pct: 50, color: "#d97706" },
    { label: "Compliance Risk", val: healthData.complianceRisk || "Low", pct: 25, color: "#059669" },
  ];

  return (
    <div className="analytics-card right-panel-card">
      <div className="right-card-header flex-between">
        <h3 className="right-card-title">Executive Health</h3>
        <span className="health-score-badge">{overallScore}%</span>
      </div>
      <p className="health-subtitle">Overall Operational Health</p>

      <div className="health-bars-list">
        {items.map((item, i) => (
          <div key={i} className="health-bar-row">
            <div className="health-bar-label-line">
              <span className="health-item-name">{item.label}</span>
              <span className="health-item-val">{item.val}</span>
            </div>
            <div className="health-track">
              <div className="health-fill" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

