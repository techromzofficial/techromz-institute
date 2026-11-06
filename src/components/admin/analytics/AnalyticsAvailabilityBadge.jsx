"use client";

import React from "react";
import { AlertCircle, Lock, ShieldAlert } from "lucide-react";

export function AnalyticsAvailabilityBadge({ status = "unavailable", message = "Not Available", reason }) {
  if (status === "restricted") {
    return (
      <span className="analytics-badge analytics-badge-restricted" title={reason || "Permission restricted"}>
        <Lock size={12} /> Restricted
      </span>
    );
  }

  if (status === "stale") {
    return (
      <span className="analytics-badge analytics-badge-warning" title={reason || "Data may be outdated"}>
        <AlertCircle size={12} /> Stale Data
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="analytics-badge analytics-badge-danger" title={reason || "Failed to load metric"}>
        <ShieldAlert size={12} /> Error
      </span>
    );
  }

  return (
    <span className="analytics-badge analytics-badge-muted" title={reason || message}>
      {message}
    </span>
  );
}

