"use client";

import React from "react";
import { TrendingUp, TrendingDown, HelpCircle, Lock, AlertCircle } from "lucide-react";

export function ReportKpiCard({ kpi }) {
  if (!kpi) return null;

  const {
    id,
    order,
    title,
    formattedValue,
    comparisonLabel,
    direction,
    trendPercentage,
    status,
    availability,
    tooltip,
  } = kpi;

  const isRestricted = availability === "restricted";
  const isNotAvailable = availability === "not_available" || formattedValue === null || formattedValue === undefined;

  // Determine trend badge color class
  const isPositiveStatus = status === "positive";
  const isNegativeStatus = status === "negative";
  const isUp = direction === "up";

  return (
    <div className="report-kpi-card" title={tooltip || title}>
      <div className="kpi-card-header">
        <span className="kpi-number-badge">{order || id}</span>
        <span className="kpi-title">{title}</span>
        <span className="kpi-tooltip-trigger">
          <HelpCircle size={10} />
        </span>
      </div>

      <div className="kpi-value-row">
        {isRestricted ? (
          <span className="kpi-value restricted-value">
            <Lock size={12} /> Restricted
          </span>
        ) : isNotAvailable ? (
          <span className="kpi-value not-available-value">
            <AlertCircle size={12} /> Not Available
          </span>
        ) : (
          <>
            <span className="kpi-value">{formattedValue}</span>
            {trendPercentage !== undefined && trendPercentage !== null && (
              <span
                className={`kpi-trend-badge ${
                  isPositiveStatus ? "trend-positive" : isNegativeStatus ? "trend-negative" : "trend-neutral"
                }`}
              >
                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(trendPercentage)}%
              </span>
            )}
          </>
        )}
      </div>

      <div className="kpi-comparison-row">
        <span className="kpi-comparison-text">{comparisonLabel || "vs previous period"}</span>
      </div>
    </div>
  );
}

