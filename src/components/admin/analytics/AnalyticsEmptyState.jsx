"use client";

import React from "react";
import { Inbox } from "lucide-react";

export function AnalyticsEmptyState({
  title = "No Analytics Data Available",
  description = "No metric records were found matching the selected period or search criteria.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="analytics-empty-state">
      <div className="empty-icon-wrap">
        <Inbox size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="button primary sm" type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

