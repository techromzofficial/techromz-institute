"use client";

import React from "react";
import { AnalyticsKpiCard } from "./AnalyticsKpiCard";
import { AnalyticsErrorState } from "./AnalyticsErrorState";

export function AnalyticsKpiGrid({
  kpis = [],
  searchParams,
  userPermissions,
  isLoading,
  error,
  onRetry,
}) {
  if (error) {
    return (
      <AnalyticsErrorState
        title="Failed to Load Key Performance Indicators"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Guarantee 14 cards render
  const cards = kpis.length > 0 ? kpis : Array.from({ length: 14 }, (_, i) => ({ id: i + 1, title: `KPI ${i + 1}` }));

  return (
    <div className="analytics-kpi-grid" aria-label="14 Key Performance Indicators Grid">
      {cards.map((kpi, idx) => (
        <AnalyticsKpiCard
          key={kpi.id || idx}
          kpi={kpi}
          searchParams={searchParams}
          userPermissions={userPermissions}
          isLoading={isLoading}
          error={false}
        />
      ))}
    </div>
  );
}

