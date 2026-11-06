"use client";

import React from "react";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";
import { Package, ExternalLink } from "lucide-react";

export function InventoryHealthSummary({ data = {}, searchParams }) {
  const inventoryReportUrl = buildAnalyticsReportUrl({
    reportId: "inventory-health-report",
    currentSearchParams: searchParams,
  });

  const expiryReportUrl = buildAnalyticsReportUrl({
    reportId: "expiry-risk-report",
    currentSearchParams: searchParams,
  });

  const stockoutReportUrl = buildAnalyticsReportUrl({
    reportId: "stockout-report",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card summary-card">
      <div className="summary-card-header flex-between">
        <h3 className="summary-title">Inventory Health</h3>
        <a href={inventoryReportUrl} className="summary-header-link">
          View Inventory Report <ExternalLink size={12} />
        </a>
      </div>

      <div className="summary-card-body">
        <div className="summary-top-row">
          <div className="summary-main-stat">
            <span className="summary-stat-label">Total Stock Value</span>
            <span className="summary-stat-value">{data.totalStockValue || "LKR 142.0M"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Available Stock</span>
            <span className="summary-stat-value sm">{data.availableStock || "86,216"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Reserved</span>
            <span className="summary-stat-value sm">{data.reservedStock || "8,942"}</span>
          </div>
          <div className="summary-sub-stat">
            <span className="summary-stat-label">Quarantined</span>
            <span className="summary-stat-value sm">{data.quarantinedStock || "284"}</span>
          </div>
        </div>

        <div className="summary-grid-2col">
          <div className="summary-metric-pill">
            <span className="pill-label">Damaged</span>
            <span className="pill-val">{data.damagedStock || "126"}</span>
          </div>
          <div className="summary-metric-pill warning">
            <span className="pill-label">Expiring in 90 Days</span>
            <span className="pill-val">{data.expiringIn90Days || "1,486"}</span>
          </div>
          <div className="summary-metric-pill danger">
            <span className="pill-label">Expired</span>
            <span className="pill-val">{data.expiredStock || "42"}</span>
          </div>
          <div className="summary-metric-pill danger">
            <span className="pill-label">Stockout Products</span>
            <span className="pill-val">{data.stockoutProducts || "31"}</span>
          </div>
          <div className="summary-metric-pill">
            <span className="pill-label">Overstock Products</span>
            <span className="pill-val">{data.overstockProducts || "68"}</span>
          </div>
          <div className="summary-metric-pill">
            <span className="pill-label">Inventory Turnover</span>
            <span className="pill-val">{data.inventoryTurnover || "4.2x"}</span>
          </div>
        </div>

        <div className="summary-footer-stat-box warning">
          <span className="stat-box-label">Expiry Exposure</span>
          <span className="stat-box-val">{data.expiryExposure || "LKR 3.84M"}</span>
        </div>
      </div>

      <div className="summary-card-footer">
        <a href={expiryReportUrl} className="footer-action-link">
          View Expiry Risk
        </a>
        <a href={stockoutReportUrl} className="footer-action-link">
          View Stockout Report
        </a>
      </div>
    </div>
  );
}

