import React, { Suspense } from "react";
import { AnalyticsReportWorkspace } from "@/features/analytics/reports/AnalyticsReportWorkspace";

function ReportDetailContent({ reportId }) {
  return <AnalyticsReportWorkspace reportId={reportId} />;
}

export default async function AnalyticsReportDetailPage({ params }) {
  const resolvedParams = await params;
  const reportId = resolvedParams?.reportId;

  return (
    <Suspense fallback={<div className="p-4 text-center">Loading Analytics Report Workspace...</div>}>
      <ReportDetailContent reportId={reportId} />
    </Suspense>
  );
}
