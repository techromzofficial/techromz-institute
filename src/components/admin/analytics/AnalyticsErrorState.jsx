"use client";

import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export function AnalyticsErrorState({
  title = "Failed to Load Section",
  message = "An unexpected error occurred while loading this analytics widget.",
  onRetry,
}) {
  return (
    <div className="analytics-error-state" role="alert">
      <div className="error-icon-wrap">
        <AlertOctagon size={24} />
      </div>
      <h4>{title}</h4>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="button danger-outline sm" type="button">
          <RefreshCw size={13} /> Retry Loading
        </button>
      )}
    </div>
  );
}

