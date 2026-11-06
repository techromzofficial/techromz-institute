"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ChevronRight, FileText } from "lucide-react";

export function QuickReportsPanel({ quickReports = [], searchParams }) {
  const defaultReports = [
    { id: "qr-1", label: "Order Performance", reportId: "order-performance" },
    { id: "qr-2", label: "Revenue Analysis", reportId: "revenue-analysis" },
    { id: "qr-3", label: "Product Performance", reportId: "product-performance" },
    { id: "qr-4", label: "Supplier Performance", reportId: "supplier-performance" },
    { id: "qr-5", label: "Inventory Risk", reportId: "inventory-risk" },
    { id: "qr-6", label: "Logistics Performance", reportId: "logistics-performance" },
    { id: "qr-7", label: "Returns Analysis", reportId: "returns-analysis" },
    { id: "qr-8", label: "Customer Support Performance", reportId: "customer-support-performance" },
  ];

  const reports = quickReports.length > 0 ? quickReports : defaultReports;

  return (
    <div className="analytics-card right-panel-card">
      <div className="right-card-header">
        <h3 className="right-card-title flex-center-gap">
          <FileText size={16} className="text-muted" /> Quick Reports
        </h3>
      </div>

      <div className="quick-reports-list">
        {reports.map((r) => {
          const url = buildAnalyticsReportUrl({
            reportId: r.reportId,
            currentSearchParams: searchParams,
          });

          return (
            <a key={r.id} href={url} className="quick-report-link">
              <FileText size={14} className="qr-icon" />
              <span className="qr-label">{r.label}</span>
              <ChevronRight size={14} className="qr-arrow" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

