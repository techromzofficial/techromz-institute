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
import { formatCurrency, formatCount } from "@/lib/analytics/analyticsFormatters";

export function OrderVolumeValueTrend({ data = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                {entry.dataKey === "grossOrderValue"
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
        <h3 className="chart-title">Order Volume &amp; Value Trend</h3>
      </div>

      <div className="trend-custom-legend">
        <span className="legend-chip">
          <span className="chip-bar dark-burgundy" /> Order Count
        </span>
        <span className="legend-chip">
          <span className="chip-line dark-line" /> Gross Order Value (LKR)
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
                tickFormatter={(v) => (v === 0 ? "0" : `${v}`)}
                axisLine={false}
                tickLine={false}
                domain={[0, 1200]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000000}M`)}
                axisLine={false}
                tickLine={false}
                domain={[0, 12000000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="orderCount"
                name="Order Count"
                fill="#741d35"
                radius={[2, 2, 0, 0]}
                barSize={10}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="grossOrderValue"
                name="Gross Order Value (LKR)"
                stroke="#1e293b"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="skeleton" style={{ height: 150 }} />
        )}
      </div>
    </div>
  );
}

