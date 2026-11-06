"use client";

import React from "react";

export function SupplierFulfilmentPerformanceTable({ data = [] }) {
  const getRiskBadgeClass = (risk) => {
    const r = (risk || "").toLowerCase();
    if (r.includes("low")) return "badge-success";
    if (r.includes("medium")) return "badge-warning";
    if (r.includes("high")) return "badge-danger";
    return "badge-muted";
  };

  return (
    <section className="performanceCard analytics-card table-card flex-column">
      <div className="chart-card-header">
        <h3 className="table-title">Supplier &amp; Fulfilment Performance</h3>
      </div>

      <div className="tableScrollContainer table-responsive-wrap flex-1">
        <table className="performanceTable compact-report-table supplier-performance-table">
          <thead>
            <tr>
              <th style={{ width: "200px", minWidth: "160px" }}>Supplier</th>
              <th style={{ width: "110px", minWidth: "90px" }}>Fulfilment Type</th>
              <th className="text-right" style={{ width: "70px" }}>Orders</th>
              <th className="text-right" style={{ width: "70px" }}>Fill Rate</th>
              <th className="text-right" style={{ width: "60px" }}>SLA</th>
              <th className="text-right" style={{ width: "70px" }}>Dispatch</th>
              <th className="text-right" style={{ width: "80px" }}>Cancellation</th>
              <th className="text-right" style={{ width: "75px" }}>Return Rate</th>
              <th className="text-right" style={{ width: "120px", minWidth: "110px" }}>Net Order Value (LKR)</th>
              <th className="text-center" style={{ width: "65px" }}>Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id || row.supplier}>
                <td className="cell-supplier bold" title={row.supplier}>{row.supplier}</td>
                <td>{row.fulfilmentType}</td>
                <td className="text-right bold">{row.orders}</td>
                <td className="text-right">{row.fillRate}</td>
                <td className="text-right">{row.sla}</td>
                <td className="text-right">{row.dispatch}</td>
                <td className="text-right">{row.cancellation}</td>
                <td className="text-right">{row.returnRate}</td>
                <td className="text-right bold">{row.netOrderValue}</td>
                <td className="text-center">
                  <span className={`status-pill ${getRiskBadgeClass(row.risk)}`}>{row.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

