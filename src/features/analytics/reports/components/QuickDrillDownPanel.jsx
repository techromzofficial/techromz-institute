"use client";

import React from "react";
import { Filter } from "lucide-react";

export function QuickDrillDownPanel({ onSelectQuickFilter, onSelectFilter }) {
  const handleSelect = (quickFilter) => {
    if (onSelectFilter) onSelectFilter(quickFilter);
    if (onSelectQuickFilter) onSelectQuickFilter(quickFilter);
  };

  const drillDownButtons = [
    { id: "paid-orders", label: "Paid Orders", quickFilter: "paid-orders" },
    { id: "failed-payments", label: "Failed Payments", quickFilter: "failed-payments" },
    { id: "awaiting-supplier", label: "Awaiting Supplier", quickFilter: "awaiting-supplier" },
    { id: "sla-breaches", label: "SLA Breaches", quickFilter: "sla-breaches" },
    { id: "high-value", label: "High-Value Orders", quickFilter: "high-value" },
    { id: "split-orders", label: "Split Orders", quickFilter: "split-orders" },
    { id: "return-linked", label: "Return-Linked Orders", quickFilter: "return-linked" },
    { id: "delivery-exceptions", label: "Delivery Exceptions", quickFilter: "delivery-exceptions" },
  ];

  return (
    <div className="analytics-card right-panel-card flex-column">
      <h3 className="right-card-title flex-center-gap">
        <Filter size={13} /> Quick Drill-Down
      </h3>
      <div className="quick-drilldown-grid">
        {drillDownButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className="quick-drilldown-btn"
            onClick={() => handleSelect(btn.quickFilter)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

