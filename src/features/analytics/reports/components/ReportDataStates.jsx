"use client";

import React from "react";
import { AlertCircle, Lock, ServerCrash, RefreshCw, AlertTriangle, Info } from "lucide-react";

export function ReportLoadingState({ message = "Loading Analytics Report Workspace..." }) {
  return (
    <div className="report-loading-container p-4">
      <p className="loading-message text-muted mb-2 text-center text-sm">{message}</p>
      <div className="skeleton header-skeleton" style={{ height: 40, width: "30%", marginBottom: 12 }} />
      <div className="skeleton metadata-skeleton" style={{ height: 48, marginBottom: 14 }} />
      <div className="skeleton filter-skeleton" style={{ height: 110, marginBottom: 14 }} />
      <div className="grid-7-skeleton" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 14 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton kpi-skeleton" style={{ height: 90 }} />
        ))}
      </div>
      <div className="skeleton chart-row-skeleton" style={{ height: 220 }} />
    </div>
  );
}

export function ReportErrorState({ message = "Failed to load report data", onRetry }) {
  return (
    <div className="report-state-container error-state">
      <div className="report-state-card">
        <div className="state-icon-circle danger">
          <ServerCrash size={24} />
        </div>
        <h2 className="state-title">Unable to Load Analytics Report</h2>
        <p className="state-desc">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary-burgundy icon-btn">
            <RefreshCw size={14} /> Retry Loading
          </button>
        )}
      </div>
    </div>
  );
}

export function ReportUnauthorizedState() {
  return (
    <div className="report-state-container unauthorized-state">
      <div className="report-state-card">
        <div className="state-icon-circle warning">
          <Lock size={24} />
        </div>
        <h2 className="state-title">Access Restricted</h2>
        <p className="state-desc">
          You do not have permission to view this report. Please contact your system administrator.
        </p>
      </div>
    </div>
  );
}

export function ReportNotAvailableState() {
  return (
    <div className="report-state-container not-available-state">
      <div className="report-state-card">
        <div className="state-icon-circle muted">
          <AlertCircle size={24} />
        </div>
        <h2 className="state-title">Report Data Not Available</h2>
        <p className="state-desc">
          Data for this report domain is currently not available for the selected period.
        </p>
      </div>
    </div>
  );
}

export function ReportEmptyState({ message = "No data available for the selected filters." }) {
  return (
    <div className="report-state-container empty-state">
      <div className="report-state-card">
        <div className="state-icon-circle muted">
          <Info size={24} />
        </div>
        <h2 className="state-title">No Records Found</h2>
        <p className="state-desc">{message}</p>
      </div>
    </div>
  );
}

export function ReportPartialState({ message = "Some data sources delayed." }) {
  return (
    <div className="report-state-container partial-state">
      <div className="report-state-card">
        <div className="state-icon-circle warning">
          <AlertTriangle size={24} />
        </div>
        <h2 className="state-title">Partial Data Available</h2>
        <p className="state-desc">{message}</p>
      </div>
    </div>
  );
}

export function ReportStaleNotice({ lastGenerated = "Jul 24, 2026 – 4:30 AM" }) {
  return (
    <div className="report-stale-banner p-2 mb-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-xs flex items-center gap-2">
      <AlertTriangle size={14} />
      <span>Report data may be stale. Last generated on {lastGenerated}.</span>
    </div>
  );
}

