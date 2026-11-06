"use client";

import React, { useState } from "react";
import { AnalyticsTableShell } from "./AnalyticsTableShell";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ArrowUpDown, ExternalLink } from "lucide-react";

export function ProductPerformanceTable({ products = [], searchParams, isLoading, error }) {
  const [sortField, setSortField] = useState("unitsSold");
  const [sortAsc, setSortAsc] = useState(false);

  const fullReportUrl = buildAnalyticsReportUrl({
    reportId: "product-performance-report",
    currentSearchParams: searchParams,
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA = a[sortField] || "";
    let valB = b[sortField] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <AnalyticsTableShell
      title="Product & Category Performance"
      actionLabel="View Full Product Report"
      actionUrl={fullReportUrl}
      isLoading={isLoading}
      error={error}
      isEmpty={products.length === 0}
    >
      <table className="analytics-data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("productName")} className="sortable-th">
              Product <ArrowUpDown size={11} />
            </th>
            <th>Product ID</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Supplier</th>
            <th onClick={() => handleSort("unitsSold")} className="sortable-th text-right">
              Units Sold <ArrowUpDown size={11} />
            </th>
            <th className="text-right">Gross Sales (LKR)</th>
            <th className="text-right">Net Revenue (LKR)</th>
            <th className="text-right">Conv. Rate</th>
            <th className="text-right">Return Rate</th>
            <th className="text-center">Avg. Rating</th>
            <th className="text-right">Stock Available</th>
            <th className="text-center">Expiry Risk</th>
            <th className="text-center">Trend</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((row) => {
            const productReportUrl = buildAnalyticsReportUrl({
              reportId: "product-detail-analytics",
              currentSearchParams: searchParams,
              additionalParams: { productId: row.productId },
            });

            const riskBadgeClass =
              row.expiryRisk === "High"
                ? "badge danger"
                : row.expiryRisk === "Medium"
                ? "badge warning"
                : "badge success";

            return (
              <tr key={row.id || row.productId}>
                <td className="cell-product-name">{row.productName}</td>
                <td className="cell-id">{row.productId}</td>
                <td>{row.category}</td>
                <td>{row.brand}</td>
                <td className="cell-muted">{row.supplier}</td>
                <td className="text-right font-medium">{row.unitsSold}</td>
                <td className="text-right">{row.grossSales}</td>
                <td className="text-right font-bold">{row.netRevenue}</td>
                <td className="text-right">{row.convRate}</td>
                <td className="text-right">{row.returnRate}</td>
                <td className="text-center">{row.avgRating}</td>
                <td className="text-right">{row.stockAvailable}</td>
                <td className="text-center">
                  <span className={riskBadgeClass}>{row.expiryRisk}</span>
                </td>
                <td className="text-center text-success font-medium">{row.trend}</td>
                <td className="text-center">
                  <a href={productReportUrl} className="table-action-link">
                    Open Report <ExternalLink size={11} />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AnalyticsTableShell>
  );
}

