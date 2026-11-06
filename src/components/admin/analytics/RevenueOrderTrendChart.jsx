"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ExternalLink, Download, TrendingUp } from "lucide-react";
import { formatCurrency, formatCount } from "@/lib/analytics/analyticsFormatters";

export function RevenueOrderTrendChart({ data = [], searchParams, isLoading, error }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const revenueReportUrl = buildAnalyticsReportUrl({
    reportId: "revenue-analysis",
    currentSearchParams: searchParams,
  });

  const orderReportUrl = buildAnalyticsReportUrl({
    reportId: "orders-volume-report",
    currentSearchParams: searchParams,
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
              <span className="tooltip-name">{entry.name}: </span>
              <span className="tooltip-val">
                {entry.dataKey === "gmv" || entry.dataKey === "netRevenue" || entry.dataKey === "aov"
                  ? formatCurrency(entry.value, "LKR", true)
                  : formatCount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-card chart-card flex-column">
      <div className="chart-card-header">
        <h3 className="chart-title">Revenue &amp; Order Trend</h3>
      </div>

      {/* Compact Legend matching Image 2 */}
      <div className="trend-custom-legend">
        <span className="legend-chip">
          <span className="chip-bar dark-burgundy" /> Gross Merchandise Value (LKR)
        </span>
        <span className="legend-chip">
          <span className="chip-bar muted-rose" /> Net Platform Revenue (LKR)
        </span>
        <span className="legend-chip">
          <span className="chip-line dark-line" /> Orders
        </span>
        <span className="legend-chip">
          <span className="chip-line dotted-orange" /> Avg Order Value (LKR)
        </span>
      </div>

      <div className="chart-body flex-1">
        {mounted && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000000}M`)}
                axisLine={false}
                tickLine={false}
                domain={[0, 12000000]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : `${v}`)}
                axisLine={false}
                tickLine={false}
                domain={[0, 1000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="gmv"
                name="Gross Merchandise Value (LKR)"
                fill="#741d35"
                radius={[2, 2, 0, 0]}
                barSize={10}
              />
              <Bar
                yAxisId="left"
                dataKey="netRevenue"
                name="Net Platform Revenue (LKR)"
                fill="#c05676"
                radius={[2, 2, 0, 0]}
                barSize={10}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#1e293b"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="aov"
                name="Avg Order Value (LKR)"
                stroke="#d97706"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder skeleton" style={{ height: 150 }} />
        )}
      </div>

      {/* Action Row matching Image 2 */}
      <div className="chart-card-footer">
        <a href={revenueReportUrl} className="chart-footer-link">
          View Revenue Report
        </a>
        <a href={orderReportUrl} className="chart-footer-link">
          View Order Report
        </a>
        <button type="button" className="chart-footer-btn">
          <TrendingUp size={11} /> Compare Period
        </button>
        <button type="button" className="chart-footer-btn">
          <Download size={11} /> Export Chart
        </button>
      </div>
    </div>
  );
}

