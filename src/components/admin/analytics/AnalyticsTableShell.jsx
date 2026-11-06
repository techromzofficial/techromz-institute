"use client";

import React from "react";
import { AnalyticsLoadingState } from "./AnalyticsLoadingState";
import { AnalyticsEmptyState } from "./AnalyticsEmptyState";
import { AnalyticsErrorState } from "./AnalyticsErrorState";

export function AnalyticsTableShell({
  title,
  actionLabel,
  actionUrl,
  children,
  isLoading,
  error,
  isEmpty,
  onRetry,
}) {
  return (
    <div className="analytics-card table-card">
      <div className="table-card-header">
        <h3 className="table-title">{title}</h3>
        {actionLabel && actionUrl && (
          <a href={actionUrl} className="button sm icon-button-text">
            {actionLabel}
          </a>
        )}
      </div>

      <div className="table-card-body">
        {isLoading ? (
          <AnalyticsLoadingState rows={4} />
        ) : error ? (
          <AnalyticsErrorState title={`Failed to Load ${title}`} message={error} onRetry={onRetry} />
        ) : isEmpty ? (
          <AnalyticsEmptyState title="No Records Available" />
        ) : (
          <div className="analytics-table-wrap">{children}</div>
        )}
      </div>
    </div>
  );
}

