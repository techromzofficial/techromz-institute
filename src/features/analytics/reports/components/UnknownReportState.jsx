"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";

export function UnknownReportState({ searchParams }) {
  const backToAnalyticsUrl = buildAnalyticsReportUrl({
    reportId: "",
    currentSearchParams: searchParams,
  });

  return (
    <div className="report-state-container unknown-report-state">
      <div className="report-state-card">
        <div className="state-icon-circle danger">
          <AlertTriangle size={24} />
        </div>
        <h2 className="state-title">Report Not Found</h2>
        <p className="state-desc">
          The requested analytics report is unavailable or the report identifier is invalid.
        </p>
        <div className="state-actions">
          <Link href={backToAnalyticsUrl} className="btn-primary-burgundy icon-link">
            <ArrowLeft size={14} /> Back to Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

