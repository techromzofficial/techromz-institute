"use client";

import React from "react";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";

export function DataFreshnessNotice({ lastUpdated, isStale, isPartial, onRefresh }) {
  if (!isStale && !isPartial && !lastUpdated) return null;

  return (
    <div className={`analytics-freshness-notice ${isStale || isPartial ? "notice-warning" : "notice-info"}`}>
      <div className="freshness-notice-content">
        {isStale || isPartial ? (
          <AlertTriangle size={15} className="text-warning" />
        ) : (
          <Clock size={15} className="text-muted" />
        )}
        <span>
          {isStale && <strong>Stale Data Warning: </strong>}
          {isPartial && <strong>Partial Data Success: </strong>}
          {lastUpdated ? `Data last synchronized: ${lastUpdated}` : "Some metric pipelines are experiencing delay."}
        </span>
      </div>

      {onRefresh && (
        <button onClick={onRefresh} className="freshness-refresh-btn" type="button" aria-label="Refresh data">
          <RefreshCw size={13} /> Refresh
        </button>
      )}
    </div>
  );
}

