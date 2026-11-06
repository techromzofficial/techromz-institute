"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { Calendar, Plus } from "lucide-react";

export function SavedScheduledReportsPanel({
  scheduledReports = [],
  searchParams,
  onScheduleNewReport,
}) {
  const defaultReports = [
    {
      id: "sr-1",
      title: "Weekly Executive Summary",
      schedule: "Every Monday — 8:00 AM",
      status: "Active",
      reportId: "weekly-executive-summary",
    },
    {
      id: "sr-2",
      title: "Daily Operations Report",
      schedule: "Daily — 7:00 AM",
      status: "Active",
      reportId: "daily-operations-report",
    },
    {
      id: "sr-3",
      title: "Monthly Supplier Performance",
      schedule: "First Day of Month — 9:00 AM",
      status: "Active",
      reportId: "monthly-supplier-performance",
    },
  ];

  const reports = scheduledReports.length > 0 ? scheduledReports : defaultReports;
  const viewAllUrl = buildAnalyticsReportUrl({
    reportId: "scheduled-reports-list",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card right-panel-card">
      <div className="right-card-header flex-between">
        <h3 className="right-card-title flex-center-gap">
          <Calendar size={16} className="text-muted" /> Saved &amp; Scheduled Reports
        </h3>
        <a href={viewAllUrl} className="button danger-outline xs font-bold">
          View All
        </a>
      </div>

      <div className="scheduled-reports-list">
        {reports.map((r) => {
          const reportUrl = buildAnalyticsReportUrl({
            reportId: r.reportId,
            currentSearchParams: searchParams,
          });

          return (
            <a key={r.id} href={reportUrl} className="scheduled-report-item">
              <div className="sr-item-left">
                <span className="sr-item-title">{r.title}</span>
                <span className="sr-item-schedule">{r.schedule}</span>
              </div>
              <span className="sr-item-badge">{r.status}</span>
            </a>
          );
        })}
      </div>

      <div className="right-card-footer margin-top">
        <button
          type="button"
          className="button sm full-width"
          onClick={onScheduleNewReport}
        >
          <Plus size={13} /> Schedule New Report
        </button>
      </div>
    </div>
  );
}

