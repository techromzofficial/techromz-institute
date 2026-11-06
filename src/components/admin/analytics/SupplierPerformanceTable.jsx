"use client";

import React, { useState } from "react";
import { AnalyticsTableShell } from "./AnalyticsTableShell";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ArrowUpDown, ExternalLink } from "lucide-react";

export function SupplierPerformanceTable({ suppliers = [], searchParams, isLoading, error }) {
  const [sortField, setSortField] = useState("orders");
  const [sortAsc, setSortAsc] = useState(false);

  const fullReportUrl = buildAnalyticsReportUrl({
    reportId: "supplier-performance-report",
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

  const sortedSuppliers = [...suppliers].sort((a, b) => {
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
      title="Supplier Performance"
      actionLabel="View Full Supplier Report"
      actionUrl={fullReportUrl}
      isLoading={isLoading}
      error={error}
      isEmpty={suppliers.length === 0}
    >
      <table className="analytics-data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("supplierName")} className="sortable-th">
              Supplier <ArrowUpDown size={11} />
            </th>
            <th>Supplier ID</th>
            <th className="text-center">Active Products</th>
            <th onClick={() => handleSort("orders")} className="sortable-th text-right">
              Orders <ArrowUpDown size={11} />
            </th>
            <th className="text-right">Fulfilment Rate</th>
            <th className="text-right">Conflict Rate</th>
            <th className="text-right">Dispatch SLA</th>
            <th className="text-right">Cancel. Rate</th>
            <th className="text-right">Return Rate</th>
            <th className="text-center">Compliance</th>
            <th className="text-center">Risk</th>
            <th className="text-right">Net Sales</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedSuppliers.map((row) => {
            const supplierReportUrl = buildAnalyticsReportUrl({
              reportId: "supplier-detail-analytics",
              currentSearchParams: searchParams,
              additionalParams: { supplierId: row.supplierId },
            });

            const complianceBadgeClass =
              row.compliance === "Verified" ? "badge success" : "badge warning";
            const riskBadgeClass =
              row.risk === "High"
                ? "badge danger"
                : row.risk === "Medium"
                ? "badge warning"
                : "badge success";

            return (
              <tr key={row.id || row.supplierId}>
                <td className="cell-product-name">{row.supplierName}</td>
                <td className="cell-id">{row.supplierId}</td>
                <td className="text-center">{row.activeProducts}</td>
                <td className="text-right font-medium">{row.orders}</td>
                <td className="text-right font-bold text-success">{row.fulfilmentRate}</td>
                <td className="text-right">{row.conflictRate}</td>
                <td className="text-right">{row.dispatchSla}</td>
                <td className="text-right">{row.cancellationRate}</td>
                <td className="text-right">{row.returnRate}</td>
                <td className="text-center">
                  <span className={complianceBadgeClass}>{row.compliance}</span>
                </td>
                <td className="text-center">
                  <span className={riskBadgeClass}>{row.risk}</span>
                </td>
                <td className="text-right font-bold">{row.netSales}</td>
                <td className="text-center">
                  <a href={supplierReportUrl} className="table-action-link">
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

