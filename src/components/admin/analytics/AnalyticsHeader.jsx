"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  FilePlus,
  MoreVertical,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";

export function AnalyticsHeader({
  searchParams,
  onReviewExecutiveInsights,
  onExportDashboard,
  onScheduleReport,
  onComparePeriods,
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const createReportUrl = buildAnalyticsReportUrl({
    reportId: "custom-builder",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-header-section">
      <div className="analytics-header-titles">
        <h1 className="analytics-page-title">Analytics &amp; Business Intelligence</h1>
        <p className="analytics-page-desc">
          Monitor marketplace growth, revenue, operations, customer behaviour, compliance and risk across the SL Beauty ecosystem.
        </p>
      </div>

      <div className="analytics-header-actions">
        <button
          type="button"
          className="button primary analytics-btn-primary"
          onClick={onReviewExecutiveInsights}
        >
          <Sparkles size={15} /> Review Executive Insights
        </button>

        <a
          href={createReportUrl}
          className="button icon-button-text"
          title="Create custom report"
        >
          <FilePlus size={15} /> Create Report
        </a>

        <button
          type="button"
          className="button icon-button-text"
          onClick={onExportDashboard}
        >
          <Download size={15} /> Export Dashboard
        </button>

        <button
          type="button"
          className="button icon-button-text"
          onClick={onScheduleReport}
        >
          <Calendar size={15} /> Schedule Report
        </button>

        <button
          type="button"
          className="button icon-button-text"
          onClick={onComparePeriods}
        >
          <TrendingUp size={15} /> Compare Periods
        </button>

        <div className="relative-menu-wrap">
          <button
            type="button"
            className="button icon-button"
            onClick={() => setMoreMenuOpen((p) => !p)}
            aria-label="More header actions"
            aria-expanded={moreMenuOpen}
          >
            <MoreVertical size={16} />
          </button>

          {moreMenuOpen && (
            <div className="analytics-dropdown-menu">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setMoreMenuOpen(false);
                  onExportDashboard?.();
                }}
              >
                Export Raw Data (CSV)
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setMoreMenuOpen(false);
                  onScheduleReport?.();
                }}
              >
                Manage Scheduled Reports
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setMoreMenuOpen(false);
                }}
              >
                Reset Dashboard View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

