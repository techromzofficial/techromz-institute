"use client";

import React from "react";
import { Key, Layers, Calendar, Clock, DollarSign, RefreshCw, CheckCircle2 } from "lucide-react";

export function ReportMetadataStrip({ metadata = {} }) {
  const {
    reportKey = "order-performance",
    domain = "Orders",
    reportingPeriod = "Jun 25, 2026 – Jul 24, 2026",
    comparisonPeriod = "May 26, 2026 – Jun 24, 2026",
    currency = "LKR",
    lastGenerated = "Jul 24, 2026 – 4:30 AM",
    dataFreshness = "Current",
  } = metadata;

  return (
    <div className="report-metadata-strip">
      <div className="metadata-item">
        <span className="metadata-label">
          <Key size={11} /> Report Key
        </span>
        <span className="metadata-value bold">{reportKey}</span>
      </div>

      <div className="metadata-divider" />

      <div className="metadata-item">
        <span className="metadata-label">
          <Layers size={11} /> Report Domain
        </span>
        <span className="metadata-value bold">{domain}</span>
      </div>

      <div className="metadata-divider" />

      <div className="metadata-item">
        <span className="metadata-label">
          <Calendar size={11} /> Reporting Period
        </span>
        <span className="metadata-value">{reportingPeriod}</span>
      </div>

      <div className="metadata-divider" />

      <div className="metadata-item">
        <span className="metadata-label">
          <RefreshCw size={11} /> Comparison Period
        </span>
        <span className="metadata-value">{comparisonPeriod}</span>
      </div>

      <div className="metadata-divider" />

      <div className="metadata-item">
        <span className="metadata-label">
          <DollarSign size={11} /> Currency
        </span>
        <span className="metadata-value bold">{currency}</span>
      </div>

      <div className="metadata-divider" />

      <div className="metadata-item">
        <span className="metadata-label">
          <Clock size={11} /> Last Generated
        </span>
        <span className="metadata-value">{lastGenerated}</span>
      </div>

      <div className="metadata-divider" />

      <div className="metadata-item">
        <span className="metadata-label">
          <CheckCircle2 size={11} /> Data Freshness
        </span>
        <span className="metadata-value freshness-badge success">
          <span className="freshness-dot" /> {dataFreshness}
        </span>
      </div>
    </div>
  );
}

