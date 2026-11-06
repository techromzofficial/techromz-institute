"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsReportWorkspace } from "@/features/analytics/reports/AnalyticsReportWorkspace";

function ReportsContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId") || "order-performance";

  return <AnalyticsReportWorkspace reportId={reportId} />;
}

export default function AnalyticsReportsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading Analytics Report Workspace...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

