"use client";

import React from "react";
import { ReportBreadcrumb } from "./ReportBreadcrumb";
import { ReportActionToolbar } from "./ReportActionToolbar";

export function ReportHeader({
  title = "Order Performance",
  description = "Operational order analytics covering order flow, fulfilment, payments, returns, supplier performance and drill-down insights.",
  returnTo,
  onOpenExportModal,
  onOpenScheduleModal,
}) {
  return (
    <div className="report-header-section">
      <div className="report-header-titles">
        <ReportBreadcrumb reportTitle={title} returnTo={returnTo} />
        <h1 className="report-page-title">{title}</h1>
        <p className="report-page-desc">{description}</p>
      </div>

      <div className="report-header-actions">
        <ReportActionToolbar
          onOpenExportModal={onOpenExportModal}
          onOpenScheduleModal={onOpenScheduleModal}
        />
      </div>
    </div>
  );
}

