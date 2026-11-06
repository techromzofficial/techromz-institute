"use client";

import React from "react";

export function OperationalSummaryPanel({ summaries = {} }) {
  const {
    regionPerformance = {},
    logisticsPerformance = {},
    returnsRefunds = {},
    supportPerformance = {},
    customerAnalytics = {},
    complianceSafety = {},
    inventoryHealth = {},
  } = summaries;

  return (
    <div className="operational-summaries-grid">
      {/* 1. Region Performance */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Region Performance</h3>
        <div className="summary-list flex-1">
          {(regionPerformance.regions || []).map((r, i) => (
            <div key={i} className="summary-row flex-between">
              <span className="row-label">{r.name}</span>
              <span className="row-val-group">
                <span className="row-val">{r.value}</span>
                <span className="row-trend positive">{r.trend}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Logistics Performance */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Logistics Performance</h3>
        <div className="summary-list flex-1">
          <div className="summary-row flex-between">
            <span className="row-label">Pick Time</span>
            <span className="row-val-group">
              <span className="row-val">{logisticsPerformance.pickTime || "1.7 Days"}</span>
              <span className="row-trend positive">{logisticsPerformance.pickTimeTrend || "↑ 10.2%"}</span>
            </span>
          </div>
          {(logisticsPerformance.carriers || []).map((c, i) => (
            <div key={i} className="summary-row flex-between">
              <span className="row-label">{c.name}</span>
              <span className="row-val-group">
                <span className="row-val">{c.score}</span>
                <span className="row-trend positive">{c.trend}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Returns & Refunds */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Returns &amp; Refunds</h3>
        <div className="summary-list flex-1">
          <div className="summary-row flex-between">
            <span className="row-label">Refund Orders</span>
            <span className="row-val">{returnsRefunds.refundOrders || "1,286"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Return Rate</span>
            <span className="row-val">{returnsRefunds.returnRate || "4.2%"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Approved</span>
            <span className="row-val">{returnsRefunds.approved || "187"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Refunded</span>
            <span className="row-val">{returnsRefunds.refunded || "156"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Avg Refund Time</span>
            <span className="row-val">{returnsRefunds.avgRefundTime || "2.6 Days"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Refund Value (LKR)</span>
            <span className="row-val bold">{returnsRefunds.refundValue || "2.4M"}</span>
          </div>
        </div>
      </div>

      {/* 4. Customer Support Performance */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Customer Support Performance</h3>
        <div className="summary-list flex-1">
          <div className="summary-row flex-between">
            <span className="row-label">Tickets</span>
            <span className="row-val">{supportPerformance.tickets || "8,962"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Tickets Resolved</span>
            <span className="row-val">{supportPerformance.ticketsResolved || "7,836 (87.4%)"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Resolution Rate</span>
            <span className="row-val bold">{supportPerformance.resolutionRate || "91.3%"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Resolution Time</span>
            <span className="row-val">{supportPerformance.resolutionTime || "1.6 Days"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Avg Response Time</span>
            <span className="row-val">{supportPerformance.avgResponseTime || "4.3 Hrs"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">SLA Breaches</span>
            <span className="row-val warning">{supportPerformance.slaBreaches || 12}</span>
          </div>
        </div>
      </div>

      {/* 5. Customer Analytics */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Customer Analytics</h3>
        <div className="summary-list flex-1">
          <div className="summary-row flex-between">
            <span className="row-label">New Customers</span>
            <span className="row-val">{customerAnalytics.newCustomers || "1,184"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Repeat Customers</span>
            <span className="row-val">{customerAnalytics.repeatCustomers || "3,254"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Repeat Purchase Rate</span>
            <span className="row-val bold">{customerAnalytics.repeatPurchaseRate || "68.4%"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Avg Order Value (LKR)</span>
            <span className="row-val">{customerAnalytics.avgOrderValue || "6,744"}</span>
          </div>
        </div>
      </div>

      {/* 6. Compliance & Safety */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Compliance &amp; Safety</h3>
        <div className="summary-list flex-1">
          <div className="summary-row flex-between">
            <span className="row-label">Safety Complaints</span>
            <span className="row-val">{complianceSafety.safetyComplaints || 18}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Product Safety Alerts</span>
            <span className="row-val">{complianceSafety.productSafetyAlerts || 7}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Batch Recall Detections</span>
            <span className="row-val">{complianceSafety.batchRecallDetections || 12}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Compliance Rate</span>
            <span className="row-val bold">{complianceSafety.complianceRate || "99.2%"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Audit Findings</span>
            <span className="row-val">{complianceSafety.auditFindings || 3}</span>
          </div>
        </div>
      </div>

      {/* 7. Inventory Health */}
      <div className="analytics-card summary-card flex-column">
        <h3 className="summary-title">Inventory Health</h3>
        <div className="summary-list flex-1">
          <div className="summary-row flex-between">
            <span className="row-label">Write-off Value (LKR)</span>
            <span className="row-val">{inventoryHealth.writeOffValue || "8.4K"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Available Stock</span>
            <span className="row-val">{inventoryHealth.availableStock || "14.2K"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Active Stock Items</span>
            <span className="row-val">{inventoryHealth.activeStockItems || "1,206"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Out of Stock Items</span>
            <span className="row-val warning">{inventoryHealth.outOfStockItems || "126"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Overstock Items</span>
            <span className="row-val">{inventoryHealth.overstockItems || "63"}</span>
          </div>
          <div className="summary-row flex-between">
            <span className="row-label">Expiry Risk Items</span>
            <span className="row-val warning">{inventoryHealth.expiryRiskItems || "42"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

