"use client";

import React from "react";
import Link from "next/link";
import { Info, AlertCircle, ChevronRight, CreditCard, Clock, ShieldAlert } from "lucide-react";
import type { PaymentSummaryMetrics, PriorityAlertItem, QuickQueueItem } from "@/types/admin";

interface OrderOperationsPanelProps {
  alerts: PriorityAlertItem[];
  paymentSummary: PaymentSummaryMetrics;
  quickQueue: QuickQueueItem[];
  onSelectAlert: (alert: PriorityAlertItem) => void;
}

export function OrderOperationsPanel({
  alerts,
  paymentSummary,
  quickQueue,
  onSelectAlert,
}: OrderOperationsPanelProps) {
  return (
    <aside className="order-operations-panel">
      {/* Card A: Order Operations Health */}
      <div className="card operations-card">
        <div className="card-heading">
          <div className="card-title">
            <Clock size={16} className="card-title-icon" />
            <h3>Order Operations Health</h3>
          </div>
          <Info size={16} className="info-icon" />
        </div>
        <div className="health-stats-list">
          <div className="health-stat-row">
            <span className="stat-label">Avg Time to Confirm</span>
            <span className="stat-value text-success">1.8h</span>
          </div>
          <div className="health-stat-row">
            <span className="stat-label">Avg Time to Dispatch</span>
            <span className="stat-value text-success">8.4h</span>
          </div>
          <div className="health-stat-row">
            <span className="stat-label">Orders Within SLA</span>
            <span className="stat-value text-success">94%</span>
          </div>
          <div className="health-stat-row">
            <span className="stat-label">Orders Breaching SLA</span>
            <span className="stat-value text-danger">4</span>
          </div>
          <div className="health-stat-row">
            <span className="stat-label">Unassigned Priority Orders</span>
            <span className="stat-value text-warning">6</span>
          </div>
        </div>
      </div>

      {/* Card B: Priority Alerts */}
      <div className="card operations-card">
        <div className="card-heading">
          <div className="card-title">
            <AlertCircle size={16} className="card-title-icon text-danger" />
            <h3>Priority Alerts</h3>
          </div>
          <button
            type="button"
            className="link-btn"
            onClick={() => onSelectAlert(alerts[0])}
          >
            View all 18 alerts
          </button>
        </div>
        <div className="alerts-list">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              className="alert-item-row"
              onClick={() => onSelectAlert(alert)}
            >
              <div className="alert-item-left">
                <span className={`alert-dot ${alert.tone}`} />
                <span className="alert-type">{alert.type}</span>
              </div>
              <span className="alert-ref">{alert.orderReference}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card C: Payment Summary (Dark Maroon Card) */}
      <div className="card operations-card payment-summary-card">
        <div className="card-heading">
          <div className="card-title">
            <CreditCard size={16} className="card-title-icon text-white" />
            <h3 className="text-white">Payment Summary</h3>
          </div>
          <Info size={16} className="info-icon text-white-muted" />
        </div>
        <div className="payment-summary-subtitle">Calculated aggregate from payment transactions</div>
        <div className="payment-summary-list">
          <div className="payment-row">
            <span>Paid Today</span>
            <strong>{paymentSummary.paidToday}</strong>
          </div>
          <div className="payment-row">
            <span>Pending Payments</span>
            <strong>{paymentSummary.pendingPayments}</strong>
          </div>
          <div className="payment-row">
            <span>Failed Payments</span>
            <strong>{paymentSummary.failedPayments}</strong>
          </div>
          <div className="payment-row">
            <span>COD Pending</span>
            <strong>{paymentSummary.codPending}</strong>
          </div>
          <div className="payment-row">
            <span>Refunds Pending</span>
            <strong>{paymentSummary.refundsPending}</strong>
          </div>
        </div>
      </div>

      {/* Card D: Quick Queue */}
      <div className="card operations-card">
        <div className="card-heading">
          <div className="card-title">
            <ShieldAlert size={16} className="card-title-icon" />
            <h3>Quick Queue</h3>
          </div>
        </div>
        <div className="quick-queue-list">
          {quickQueue.map((item) => (
            <Link
              key={item.id}
              href={`/admin/marketplace/orders/${encodeURIComponent(item.orderId || item.orderReference || "")}`}
              className="quick-queue-row"
            >
              <span className="queue-label">{item.label}</span>
              <div className="queue-ref-group">
                <span className="queue-ref">{item.orderReference}</span>
                <ChevronRight size={14} className="queue-arrow" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
