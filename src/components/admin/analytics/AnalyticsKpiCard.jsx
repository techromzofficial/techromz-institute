"use client";

import React from "react";
import { ArrowDown, ArrowUp, ExternalLink, HelpCircle } from "lucide-react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { hasAnalyticsPermission } from "@/lib/analytics/analyticsPermissions";
import { AnalyticsAvailabilityBadge } from "./AnalyticsAvailabilityBadge";

export function AnalyticsKpiCard({
  kpi,
  searchParams,
  userPermissions,
  isLoading,
  error,
}) {
  if (isLoading) {
    return (
      <div className="analytics-kpi-card loading">
        <div className="kpi-card-header">
          <span className="kpi-number-badge skeleton-sm" />
          <span className="kpi-title skeleton-text" />
        </div>
        <div className="kpi-value-row skeleton-title" />
        <div className="kpi-comparison-row skeleton-subtext" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-kpi-card error">
        <div className="kpi-card-header">
          <span className="kpi-number-badge">{kpi?.id}</span>
          <span className="kpi-title">{kpi?.title || "KPI Metric"}</span>
        </div>
        <div className="kpi-value-row">
          <AnalyticsAvailabilityBadge status="error" message="Failed to Load" />
        </div>
      </div>
    );
  }

  const isPermissionGranted = hasAnalyticsPermission(userPermissions, kpi.permission);

  if (!isPermissionGranted) {
    return (
      <div className="analytics-kpi-card restricted">
        <div className="kpi-card-header">
          <span className="kpi-number-badge">{kpi.id}</span>
          <span className="kpi-title">{kpi.title}</span>
        </div>
        <div className="kpi-value-row">
          <AnalyticsAvailabilityBadge status="restricted" reason="Requires permission" />
        </div>
        <span className="kpi-comparison-text">Access Restricted</span>
      </div>
    );
  }

  const isAvailable = kpi.availability !== "unavailable" && kpi.formattedValue !== "Not Available";
  const reportUrl = buildAnalyticsReportUrl({
    reportId: kpi.reportId || `kpi-${kpi.id}`,
    currentSearchParams: searchParams,
  });

  const isTrendUp = kpi.direction === "up" || (kpi.trendPercentage && kpi.trendPercentage > 0);
  const isPositiveStatus = kpi.status === "positive";
  const isNegativeStatus = kpi.status === "negative";

  const trendClass = isPositiveStatus
    ? "trend-positive"
    : isNegativeStatus
    ? "trend-negative"
    : "trend-neutral";

  return (
    <a
      href={reportUrl}
      className="analytics-kpi-card"
      title={`Click to view ${kpi.title} report in Screen 19`}
    >
      <div className="kpi-card-header">
        <span className="kpi-number-badge">{kpi.id}</span>
        <span className="kpi-title">{kpi.title}</span>
        {kpi.tooltip && (
          <span className="kpi-tooltip-trigger" title={kpi.tooltip}>
            <HelpCircle size={12} />
          </span>
        )}
      </div>

      <div className="kpi-value-row">
        {isAvailable ? (
          <span className="kpi-value">{kpi.formattedValue}</span>
        ) : (
          <AnalyticsAvailabilityBadge status="unavailable" message="Not Available" />
        )}

        {isAvailable && kpi.trendPercentage !== undefined && kpi.trendPercentage !== null && (
          <span className={`kpi-trend-badge ${trendClass}`}>
            {isTrendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            <span>
              {kpi.isAbsoluteTrend
                ? Math.abs(kpi.trendPercentage)
                : `${Math.abs(kpi.trendPercentage)}%`}
            </span>
          </span>
        )}
      </div>

      <div className="kpi-comparison-row">
        <span className="kpi-comparison-text">{kpi.comparisonLabel || "vs Previous 30 Days"}</span>
        <ExternalLink size={12} className="kpi-link-icon" />
      </div>
    </a>
  );
}

