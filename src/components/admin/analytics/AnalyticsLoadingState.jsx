"use client";

import React from "react";

export function AnalyticsLoadingState({ rows = 3, message = "Loading analytics data..." }) {
  return (
    <div className="analytics-loading-card" role="status" aria-live="polite">
      <div className="skeleton-title skeleton" style={{ width: "35%", height: "20px" }} />
      <div className="skeleton-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton skeleton-row" style={{ height: "16px", margin: "10px 0" }} />
        ))}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
}

