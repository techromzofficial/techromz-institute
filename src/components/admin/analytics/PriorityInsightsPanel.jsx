"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  ShieldAlert,
  TrendingUp,
  Truck,
} from "lucide-react";

const ICON_MAP = {
  TrendingUp,
  AlertTriangle,
  Truck,
  Clock,
  ShieldAlert,
  Calendar,
};

function getIconComponent(icon) {
  if (typeof icon === "string") {
    return ICON_MAP[icon] || TrendingUp;
  }
  return icon || TrendingUp;
}

export function PriorityInsightsPanel({ insights = [], searchParams }) {
  const defaultInsights = [
    {
      id: "pi-1",
      icon: TrendingUp,
      title: "Revenue growth driven by skincare category",
      reportId: "revenue-analysis",
      reportLabel: "View Revenue Report",
      iconColor: "#741d35",
    },
    {
      id: "pi-2",
      icon: AlertTriangle,
      title: "31 products are currently out of stock",
      reportId: "stockout-report",
      reportLabel: "View Stockout Report",
      iconColor: "#d97706",
    },
    {
      id: "pi-3",
      icon: Truck,
      title: "23 active delivery exceptions",
      reportId: "logistics-exceptions-report",
      reportLabel: "View Logistics Report",
      iconColor: "#2563eb",
    },
    {
      id: "pi-4",
      icon: Clock,
      title: "12 customer support SLA breaches",
      reportId: "support-sla-report",
      reportLabel: "View Support Report",
      iconColor: "#dc2626",
    },
    {
      id: "pi-5",
      icon: ShieldAlert,
      title: "4 active safety complaints",
      reportId: "safety-report",
      reportLabel: "View Safety Report",
      iconColor: "#dc2626",
    },
    {
      id: "pi-6",
      icon: Calendar,
      title: "LKR 3.84M inventory expiry exposure",
      reportId: "expiry-risk-report",
      reportLabel: "View Expiry Risk Report",
      iconColor: "#d97706",
    },
  ];

  const items = insights.length > 0 ? insights : defaultInsights;
  const viewAllUrl = buildAnalyticsReportUrl({
    reportId: "priority-insights-list",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card right-panel-card">
      <div className="right-card-header flex-between">
        <h3 className="right-card-title flex-center-gap">
          <Eye size={16} className="text-burgundy" /> Priority Insights
        </h3>
        <a href={viewAllUrl} className="button danger-outline xs font-bold">
          View All
        </a>
      </div>

      <div className="insights-list">
        {items.map((item) => {
          const IconComp = getIconComponent(item.icon);
          const reportUrl = buildAnalyticsReportUrl({
            reportId: item.reportId,
            currentSearchParams: searchParams,
          });

          return (
            <a key={item.id} href={reportUrl} className="insight-item-link">
              <div className="insight-icon-wrap" style={{ color: item.iconColor }}>
                <IconComp size={16} />
              </div>
              <div className="insight-text-wrap">
                <span className="insight-title">{item.title}</span>
                <span className="insight-action-label">{item.reportLabel}</span>
              </div>
              <ChevronRight size={14} className="insight-arrow" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

