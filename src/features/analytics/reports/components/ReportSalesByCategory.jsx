"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export function ReportSalesByCategory({ categoryData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalGmv = categoryData?.totalGmvFormatted || "LKR 84.2M";
  const categories = categoryData?.categories || [
    { name: "Skincare", percentage: 42.6, gmvFormatted: "LKR 35.9M", color: "#741d35" },
    { name: "Makeup", percentage: 22.0, gmvFormatted: "LKR 19.2M", color: "#2563eb" },
    { name: "Haircare", percentage: 16.4, gmvFormatted: "LKR 13.8M", color: "#059669" },
    { name: "Fragrance", percentage: 9.1, gmvFormatted: "LKR 7.8M", color: "#d97706" },
    { name: "Personal Care", percentage: 6.1, gmvFormatted: "LKR 5.1M", color: "#7c3aed" },
    { name: "Wellness", percentage: 3.0, gmvFormatted: "LKR 2.5M", color: "#db2777" },
  ];

  return (
    <div className="analytics-card chart-card flex-column">
      <div className="chart-card-header flex-between">
        <h3 className="chart-title">Sales by Category</h3>
        <div className="gmv-header-badge text-right">
          <span className="badge-sub">TOTAL GMV</span>
          <span className="badge-val">{totalGmv}</span>
        </div>
      </div>

      <div className="pie-body-flex flex-1">
        <div className="pie-chart-container">
          {mounted ? (
            <ResponsiveContainer width={100} height={110}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={48}
                  paddingAngle={2}
                  dataKey="percentage"
                  nameKey="name"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name, item) => [`${val}% (${item.payload.gmvFormatted})`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton circle-skeleton" style={{ width: 90, height: 90 }} />
          )}
        </div>

        <div className="category-legend-stack">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-legend-row">
              <span className="legend-dot" style={{ backgroundColor: cat.color }} />
              <span className="cat-name">{cat.name}</span>
              <span className="cat-pct">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

