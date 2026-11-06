"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";

export function SavedScheduledReportsPanel({ reports = [], onOpenScheduleModal }) {
  const defaultReports = [
    { id: "sr-1", name: "Daily Order Performance", schedule: "Daily — 09:00 AM" },
    { id: "sr-2", name: "Weekly Order Performance", schedule: "Weekly — Mon 08:00 AM" },
  ];

  const list = reports.length > 0 ? reports : defaultReports;

  return (
    <section className="reportSideCard scheduledReportsCard analytics-card right-panel-card flex-column">
      <header className="sideCardHeader flex-between mb-2">
        <div className="flex-center-gap">
          <Calendar size={13} className="header-icon text-muted" />
          <h3 className="sideCardTitle text-xs font-bold uppercase tracking-wider text-muted">
            Saved &amp; Scheduled Reports
          </h3>
        </div>
      </header>
      <div className="scheduledReportsList scheduled-reports-stack flex-1">
        {list.map((item) => (
          <div key={item.id} className="scheduledReportRow scheduled-item-row">
            <div className="scheduledReportIdentity">
              <Clock size={11} className="sched-icon text-muted flex-shrink-0" />
              <span className="scheduledReportName sched-name" title={item.name}>
                {item.name}
              </span>
            </div>
            <span className="scheduledReportTiming sched-freq">
              {item.schedule}
            </span>
          </div>
        ))}
      </div>
      <div className="card-bottom-link-wrap text-center pt-2">
        <button
          type="button"
          className="view-all-scheduled-btn text-link-btn font-semibold"
          onClick={() => onOpenScheduleModal && onOpenScheduleModal()}
        >
          View All Scheduled Reports
        </button>
      </div>
    </section>
  );
}

