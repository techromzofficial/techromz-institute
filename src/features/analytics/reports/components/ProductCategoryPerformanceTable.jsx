"use client";

import React from "react";

export function ProductCategoryPerformanceTable({ data = [] }) {
  return (
    <section className="performanceCard analytics-card table-card flex-column">
      <div className="chart-card-header">
        <h3 className="table-title">Product &amp; Category Performance</h3>
      </div>

      <div className="tableScrollContainer table-responsive-wrap flex-1">
        <table className="performanceTable compact-report-table product-performance-table">
          <thead>
            <tr>
              <th style={{ width: "200px", minWidth: "150px" }}>Product</th>
              <th style={{ width: "90px" }}>Category</th>
              <th style={{ width: "100px" }}>Brand</th>
              <th style={{ width: "140px" }}>Supplier</th>
              <th className="text-right" style={{ width: "70px" }}>Units Sold</th>
              <th className="text-right" style={{ width: "90px" }}>Gross Sales</th>
              <th className="text-right" style={{ width: "110px" }}>Net Revenue (LKR)</th>
              <th className="text-right" style={{ width: "90px" }}>Conversion Rate</th>
              <th className="text-right" style={{ width: "80px" }}>Return Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id || row.product}>
                <td className="cell-product bold" title={row.product}>{row.product}</td>
                <td>{row.category}</td>
                <td>{row.brand}</td>
                <td className="cell-muted">{row.supplier}</td>
                <td className="text-right bold">{row.unitsSold}</td>
                <td className="text-right">{row.grossSales}</td>
                <td className="text-right bold">{row.netRevenue}</td>
                <td className="text-right">{row.conversionRate}</td>
                <td className="text-right">{row.returnRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

