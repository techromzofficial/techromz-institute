import React, { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { AnalyticsLoadingState } from "@/components/admin/analytics/AnalyticsLoadingState";

export const metadata = {
  title: "Analytics & Business Intelligence | SL Beauty Enterprise Admin",
  description:
    "Monitor marketplace growth, revenue, operations, customer behaviour, compliance and risk across the SL Beauty ecosystem.",
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoadingState rows={6} message="Loading Analytics Dashboard..." />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}

