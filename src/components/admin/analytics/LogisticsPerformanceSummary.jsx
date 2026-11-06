"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { ExternalLink } from "lucide-react";

export function LogisticsPerformanceSummary({ data = {}, searchParams }) {
  const logisticsReportUrl = buildAnalyticsReportUrl({
    reportId: "logistics-performance-report",
    currentSearchParams: searchParams,
  });

  const carriers = data.carriers || [
    { name: "SpeedX", onTimeDelivery: "93.4%", activeShipments: 642, exceptions: 11, failedDeliveries: 6, avgCost: "LKR 320" },
    { name: "Karyos", onTimeDelivery: "90.1%", activeShipments: 384, exceptions: 9, failedDeliveries: 4, avgCost: "LKR 290" },
    { name: "QuickPack", onTimeDelivery: "88.2%", activeShipments: 222, exceptions: 4, failedDeliveries: 2, avgCost: "LKR 310" },
  ];

  return (
    <div className="analytics-card summary-card">
      <div className="summary-card-header flex-between">
        <h3 className="summary-title">Logistics Performance</h3>
        <a href={logisticsReportUrl} className="summary-header-link">
          View Logistics Report <ExternalLink size={12} />
        </a>
      </div>

      <div className="summary-card-body">
        <div className="summary-top-row grid-4col">
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Active Shipments</span>
            <span className="summary-stat-value sm">{data.activeShipments || "1,248"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">On-Time Pickup</span>
            <span className="summary-stat-value sm text-success">{data.onTimePickup || "94%"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">On-Time Delivery</span>
            <span className="summary-stat-value sm text-success">{data.onTimeDelivery || "91.4%"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">First-Attempt Delivery</span>
            <span className="summary-stat-value sm">{data.firstAttemptDelivery || "82%"}</span>
          </div>
        </div>

        <div className="summary-grid-2col margin-v">
          <div className="summary-metric-pill warning">
            <span className="pill-label">Delivery Exceptions</span>
            <span className="pill-val">{data.deliveryExceptions ?? 23}</span>
          </div>
          <div className="summary-metric-pill danger">
            <span className="pill-label">Failed Deliveries</span>
            <span className="pill-val">{data.failedDeliveries ?? 12}</span>
          </div>
        </div>

        <div className="cod-remittance-row">
          <div>
            <span className="cod-label">COD Pending Remittance</span>
            <span className="cod-val">{data.codPendingRemittance || "LKR 1.84M"}</span>
          </div>
          <div className="text-right">
            <span className="cod-label">Avg. Delivery Time</span>
            <span className="cod-val">{data.avgDeliveryTime || "1.8 Days"}</span>
          </div>
        </div>

        {/* Carrier Mini Table */}
        <div className="mini-carrier-table-wrap">
          <table className="mini-table">
            <thead>
              <tr>
                <th>Carrier</th>
                <th>On-Time Delivery</th>
                <th>Active Shipments</th>
                <th>Exceptions</th>
                <th>Failed Deliveries</th>
                <th>Avg. Cost / Shipment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {carriers.map((c, i) => {
                const carrierReportUrl = buildAnalyticsReportUrl({
                  reportId: "carrier-detail-report",
                  currentSearchParams: searchParams,
                  additionalParams: { carrier: c.name },
                });
                return (
                  <tr key={i}>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-success">{c.onTimeDelivery}</td>
                    <td>{c.activeShipments}</td>
                    <td>{c.exceptions}</td>
                    <td>{c.failedDeliveries}</td>
                    <td>{c.avgCost}</td>
                    <td>
                      <a href={carrierReportUrl} className="mini-table-link">
                        Open Report
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

