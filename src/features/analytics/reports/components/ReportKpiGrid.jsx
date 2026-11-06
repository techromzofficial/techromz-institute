"use client";

import React from "react";
import { ReportKpiCard } from "./ReportKpiCard";

export function ReportKpiGrid({ kpis = [] }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="report-kpi-grid">
      {kpis.map((kpi) => (
        <ReportKpiCard key={kpi.id || kpi.metricId || kpi.order} kpi={kpi} />
      ))}
    </div>
  );
}

