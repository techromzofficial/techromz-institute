"use client";

import React from "react";
import { QUICK_PERIOD_TABS } from "@/lib/analytics/analyticsFilterUtils";
import { Calendar } from "lucide-react";

export function AnalyticsPeriodTabs({ activePeriod = "last-30-days", onSelectPeriod }) {
  return (
    <div className="analytics-period-tabs-bar" role="tablist" aria-label="Quick reporting period filter">
      {QUICK_PERIOD_TABS.map((tab) => {
        const isActive = activePeriod === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`period-tab-btn ${isActive ? "active" : ""}`}
            onClick={() => onSelectPeriod(tab.id)}
          >
            {tab.id === "custom-range" && <Calendar size={13} className="tab-icon" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

