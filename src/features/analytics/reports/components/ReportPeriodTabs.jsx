"use client";

import React from "react";
import { Calendar } from "lucide-react";

export function ReportPeriodTabs({ activePeriod = "last-30-days", onSelectPeriod }) {
  const periodTabs = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "last-7-days", label: "Last 7 Days" },
    { id: "last-30-days", label: "Last 30 Days" },
    { id: "last-90-days", label: "Last 90 Days" },
    { id: "this-month", label: "This Month" },
    { id: "previous-month", label: "Previous Month" },
    { id: "this-quarter", label: "This Quarter" },
    { id: "this-year", label: "This Year" },
    { id: "custom-range", label: "Custom Range", icon: true },
  ];

  return (
    <div className="report-period-tabs-bar">
      {periodTabs.map((tab) => {
        const isActive = activePeriod === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`period-tab-btn ${isActive ? "active" : ""}`}
            onClick={() => onSelectPeriod(tab.id)}
          >
            {tab.label}
            {tab.icon && <Calendar size={11} />}
          </button>
        );
      })}
    </div>
  );
}

