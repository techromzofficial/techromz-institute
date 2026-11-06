"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import styles from "./order-detail.module.css";
import type { OrderDetail } from "@/types/admin";
import { OrderActionModals, ModalType } from "./OrderActionModals";

interface OrderDetailViewProps {
  order: OrderDetail;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tabParam = searchParams.get("tab") || "overview";
  const activeTab = tabParam.toLowerCase();

  const handleTabChange = (tabKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    router.push(`/admin/marketplace/orders/${encodeURIComponent(order.orderReference)}?${params.toString()}`);
  };

  const handleActionSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const renderStatusBadge = (status: string, type: "payment" | "order" | "fulfilment" | "delivery" | "risk" | "sla") => {
    if (type === "payment") {
      return (
        <span className={`${styles.statusPill} ${styles.badgePaid}`}>
          <span className={styles.statusPillDot} />
          {status}
        </span>
      );
    }
    if (type === "order") {
      return <span className={`${styles.statusPill} ${styles.badgeProcessing}`}>{status}</span>;
    }
    if (type === "fulfilment") {
      return <span className={`${styles.statusPill} ${styles.badgeAwaiting}`}>{status}</span>;
    }
    if (type === "delivery") {
      return <span className={`${styles.statusPill} ${styles.badgeNotDispatched}`}>{status}</span>;
    }
    if (type === "risk") {
      return <span className={`${styles.statusPill} ${styles.badgeLowRisk}`}>{status} Risk</span>;
    }
    if (type === "sla") {
      return <span className={`${styles.statusPill} ${styles.badgeSla}`}>{status}</span>;
    }
    return <span className={styles.statusPill}>{status}</span>;
  };

  return (
    <div className={styles.pageContainer}>
      {toastMessage && (
        <div
          className="toast success"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className={styles.topBreadcrumbNav}>
        <div className={styles.breadcrumbLeft}>
          <Link href="/admin/marketplace/orders" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Order Management
          </Link>
          <div className={styles.breadcrumbs}>
            <Link href="/admin/marketplace/orders" className={styles.crumbLink}>
              Marketplace
            </Link>
            <ChevronRight size={12} />
            <Link href="/admin/marketplace/orders" className={styles.crumbLink}>
              Order Management
            </Link>
            <ChevronRight size={12} />
            <span className={styles.crumbCurrent}>{order.orderReference}</span>
          </div>
        </div>
        <button type="button" className="icon-button" aria-label="Page action menu">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Top Section: Order Summary & Score/Action Panel */}
      <div className={styles.headerSummaryGrid}>
        <div className={styles.orderSummaryCard}>
          <div className={styles.summaryTitleRow}>
            <div className={styles.refBlock}>
              <h1 className={styles.mainRef}>{order.orderReference}</h1>
              <span className={styles.subRef}>Public Order Reference: {order.orderReference}</span>
              <span className={styles.subRef}>
                Database Order ID: <strong>{order.dbOrderId}</strong> · Created: {order.createdAt}
              </span>
            </div>
            <div className={styles.badgesRow}>
              {renderStatusBadge(order.paymentStatus, "payment")}
              {renderStatusBadge(order.orderStatus, "order")}
              {renderStatusBadge(order.fulfilmentStatus, "fulfilment")}
            </div>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Customer</span>
              <span className={styles.metaValue}>{order.customer.name}</span>
              <span className={styles.subRef}>{order.customerReference}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Channel</span>
              <span className={styles.metaValue}>{order.source.channel}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Order Date</span>
              <span className={styles.metaValue}>{order.orderDateTime}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Currency</span>
              <span className={styles.metaValue}>{order.currency}</span>
            </div>
          </div>

          <div className={styles.metaGrid} style={{ borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Items / Suppliers</span>
              <span className={styles.metaValue}>
                {order.itemsCount} items · {order.suppliersCount} suppliers
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Split Order</span>
              <span className={styles.metaValue}>{order.splitOrder ? "Yes" : "No"}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Assigned Officer</span>
              <span className={styles.metaValue}>{order.assignedOfficer}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Delivery / Risk / SLA</span>
              <div className={styles.badgesRow}>
                {renderStatusBadge(order.deliveryStatus, "delivery")}
                {renderStatusBadge(order.riskLevel, "risk")}
                {renderStatusBadge(order.slaStatus, "sla")}
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Operational Actions & Circular Score Widget */}
        <div className={styles.topActionsCard}>
          <div className={styles.actionButtonGrid}>
            <button type="button" className={styles.btnPrimaryDark} onClick={() => setActiveModal("status")}>
              Update Order Status
            </button>
            <button type="button" className={styles.btnOutline} onClick={() => setActiveModal("contact_customer")}>
              Contact Customer
            </button>
            <div className={styles.btnRowTwo}>
              <button type="button" className={styles.btnWarningOutline} onClick={() => setActiveModal("hold")}>
                Hold Order
              </button>
              <button type="button" className={styles.btnDangerOutline} onClick={() => setActiveModal("cancel")}>
                Cancel Order
              </button>
            </div>
          </div>

          <div className={styles.scoreWidgetWrapper}>
            <div className={styles.circleOuter}>{order.healthScore}</div>
            <div className={styles.scoreDetails}>
              <span className={styles.scoreVal}>{order.healthScore}/100</span>
              <span className={styles.scoreBadge}>Matched</span>
              <span className={styles.scoreMuted}>Risk: {order.riskScore}/100 — {order.riskLevel}</span>
              <span className={styles.scoreMuted}>SLA: {order.slaStatus}</span>
              <span className={styles.scoreMuted}>Allocation: {order.allocationPercentage}%</span>
              <span className={styles.scoreMuted}>Allocated: {order.itemsAllocated} of {order.itemsCount}</span>
              <span style={{ fontWeight: 600, color: "#d97706" }}>Readiness: {order.readinessStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9 Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        {[
          { key: "overview", label: "Order Overview" },
          { key: "items", label: "Items & Supplier Fulfilment" },
          { key: "payments", label: "Payment & Transactions" },
          { key: "allocation", label: "Batch Allocation" },
          { key: "shipping", label: "Shipping & Delivery" },
          { key: "returns", label: "Returns & Refunds" },
          { key: "communication", label: "Customer Communication" },
          { key: "issues", label: "Operational Issues" },
          { key: "audit", label: "Audit History" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Order Overview */}
      {activeTab === "overview" && (
        <div className={styles.mainLayoutGrid}>
          <div className={styles.leftColumn}>
            {/* 1. Timeline */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Order Lifecycle Timeline</h2>
              </div>
              <div className={styles.timelineContainer}>
                {order.timeline.map((stage) => {
                  let stepClass = styles.stepNotStarted;
                  if (stage.status === "completed") stepClass = styles.stepCompleted;
                  else if (stage.status === "in-progress") stepClass = styles.stepInProgress;
                  else if (stage.status === "partially-complete") stepClass = styles.stepPartially;

                  return (
                    <div key={stage.step} className={`${styles.timelineStep} ${stepClass}`}>
                      <div className={styles.stepCircle}>
                        {stage.status === "completed" ? <CheckCircle2 size={16} /> : stage.step}
                      </div>
                      <span className={styles.stepLabel}>{stage.label}</span>
                      {stage.timestamp && <span className={styles.stepTimestamp}>{stage.timestamp}</span>}
                      {!stage.timestamp && stage.note && (
                        <span className={styles.stepTimestamp} style={{ color: "#d97706" }}>
                          {stage.note}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer Summary Card */}
            <div className={styles.card}>
              <div className={styles.customerProfileRow}>
                <div className={styles.customerInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.customer.avatarUrl} alt={order.customer.name} className={styles.avatarImg} />
                  <div>
                    <div className={styles.customerDetailsName}>{order.customer.name}</div>
                    <div className={styles.customerContact}>
                      {order.customer.email} · {order.customer.phone}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className={`${styles.statusPill} ${styles.badgeLowRisk}`}>{order.customer.riskStatus}</span>
                  <Link href="/admin/customers" className={styles.cardLink}>
                    View Customer
                  </Link>
                </div>
              </div>

              <div className={styles.customerMetricsGrid}>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Customer Since</span>
                  <span className={styles.metricCellValue}>{order.customer.customerSince}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Total Orders</span>
                  <span className={styles.metricCellValue}>{order.customer.totalOrders}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Successful Orders</span>
                  <span className={styles.metricCellValue}>{order.customer.successfulOrders}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Returns</span>
                  <span className={styles.metricCellValue}>{order.customer.returns}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Loyalty Tier</span>
                  <span className={styles.metricCellValue} style={{ color: "#d97706" }}>
                    {order.customer.loyaltyTier}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Supplier Fulfilment Summary Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Supplier Fulfilment Summary</h2>
                <button type="button" className={styles.cardLink} onClick={() => handleTabChange("items")}>
                  Review All Fulfilments
                </button>
              </div>

              <div className={styles.supplierList}>
                {order.supplierFulfilments.map((sup) => (
                  <div key={sup.id} className={styles.supplierRow}>
                    <div className={styles.supplierMain}>
                      {sup.confirmationStatus === "Confirmed" ? (
                        <CheckCircle2 size={20} className={styles.iconConfirmed} />
                      ) : (
                        <Clock size={20} className={styles.iconAwaiting} />
                      )}
                      <div className={styles.supplierMeta}>
                        <span className={styles.supplierName}>{sup.supplierName}</span>
                        <span className={styles.supplierSub}>
                          Supplier Fulfilment ID: <strong>{sup.fulfilmentReference}</strong>
                          {sup.confirmedAt && ` · Confirmed: ${sup.confirmedAt}`}
                          {sup.awaitingSince && ` · Awaiting since: ${sup.awaitingSince}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className={`${styles.statusPill} ${
                          sup.confirmationStatus === "Confirmed" ? styles.badgePaid : styles.badgeAwaiting
                        }`}
                      >
                        {sup.confirmationStatus}
                      </span>
                      <button
                        type="button"
                        className={styles.btnOutline}
                        style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        onClick={() => setActiveModal("contact_supplier")}
                      >
                        Contact Supplier
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.supplierSummaryMetrics}>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Confirmed Suppliers</span>
                  <span className={styles.metricCellValue}>
                    {order.supplierFulfilments.filter((s) => s.confirmationStatus === "Confirmed").length} of{" "}
                    {order.supplierFulfilments.length}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Items Ready</span>
                  <span className={styles.metricCellValue}>
                    {order.itemsAllocated} of {order.itemsCount}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricCellLabel}>Supplier SLA Remaining</span>
                  <span className={styles.metricCellValue} style={{ color: "#d97706" }}>
                    {order.supplierSlaRemaining}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 & 5. Delivery Address & Order Source Cards */}
            <div className={styles.twoColCardsRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Delivery Address</h2>
                  <button
                    type="button"
                    className={styles.cardLink}
                    onClick={() => {
                      const query = encodeURIComponent(
                        `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.country}`
                      );
                      window.open(`https://maps.google.com/?q=${query}`, "_blank");
                    }}
                  >
                    View on Map
                  </button>
                </div>
                <div className={styles.addressContent}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <MapPin size={16} style={{ color: "#6b7280", marginTop: 2 }} />
                    <div>
                      <div>{order.deliveryAddress.line1}</div>
                      {order.deliveryAddress.line2 && <div>{order.deliveryAddress.line2}</div>}
                      <div>
                        {order.deliveryAddress.city}, {order.deliveryAddress.postalCode},{" "}
                        {order.deliveryAddress.country}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <strong>Phone:</strong> {order.deliveryAddress.phone}
                  </div>
                  {order.deliveryAddress.deliveryInstructions && (
                    <div style={{ background: "#f9fafb", padding: "6px 10px", borderRadius: "6px" }}>
                      <strong>Instructions:</strong> {order.deliveryAddress.deliveryInstructions}
                    </div>
                  )}
                  <div>
                    <strong>Address Type:</strong> {order.deliveryAddress.addressType}
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Order Source</h2>
                </div>
                <div className={styles.sourceGrid}>
                  <div>
                    <span className={styles.metaLabel}>Channel</span>
                    <div className={styles.metaValue}>{order.source.channel}</div>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Campaign</span>
                    <div className={styles.metaValue}>{order.source.campaign || "Direct"}</div>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Referral Source</span>
                    <div className={styles.metaValue}>{order.source.referralSource || "Organic"}</div>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Device</span>
                    <div className={styles.metaValue}>{order.source.device || "Desktop"}</div>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>External Ref</span>
                    <div className={styles.metaValue}>{order.source.externalReference || "N/A"}</div>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Fraud Screening</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669", fontWeight: 700 }}>
                      <ShieldCheck size={16} /> {order.source.fraudScreeningStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Financial Summary Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Financial Summary</h2>
              </div>
              <div className={styles.financialSummaryGrid}>
                <div className={styles.finTable}>
                  <div className={styles.finRow}>
                    <span>Subtotal</span>
                    <span>
                      {order.currency} {order.financials.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.finRow} style={{ color: "#dc2626" }}>
                    <span>Discount</span>
                    <span>
                      -{order.currency} {order.financials.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.finRow}>
                    <span>Shipping</span>
                    <span>
                      {order.currency} {order.financials.shipping.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.finRow}>
                    <span>Tax</span>
                    <span>
                      {order.currency} {order.financials.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className={styles.finTable} style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <div className={styles.finRowBold}>
                    <span>Order Total</span>
                    <span>
                      {order.currency} {order.financials.orderTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.finRow} style={{ marginTop: 8 }}>
                    <span>Paid</span>
                    <span style={{ color: "#059669", fontWeight: 700 }}>
                      {order.currency} {order.financials.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.finRow}>
                    <span>Refunded</span>
                    <span>
                      {order.currency} {order.financials.refunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.finRow}>
                    <span>Outstanding</span>
                    <span>
                      {order.currency} {order.financials.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Blocking Issues */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Blocking Issues</h2>
                <button type="button" className={styles.cardLink} onClick={() => handleTabChange("issues")}>
                  View All Issues
                </button>
              </div>
              <div className={styles.blockingIssuesList}>
                {order.blockingIssues.map((issue) => (
                  <div key={issue.id} className={styles.issueItem}>
                    <div className={styles.issueMain}>
                      <AlertTriangle size={18} style={{ color: "#dc2626", marginTop: 2 }} />
                      <div>
                        <div className={styles.issueTitle}>{issue.title}</div>
                        <div className={styles.issueMsg}>{issue.message}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.btnIssueAction}
                      onClick={() => handleTabChange("issues")}
                    >
                      {issue.actionLabel} &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Recommendations */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Automated Recommendations</h2>
              </div>
              <div className={styles.recsList}>
                {order.recommendations.map((rec) => (
                  <div key={rec.id} className={styles.recItem}>
                    <CheckCircle2 size={16} className={styles.recIcon} />
                    <span>{rec.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Red Financial Reconciliation Card */}
            <div className={styles.finReconciliationCard}>
              <div className={styles.finReconcilTitle}>Financial Reconciliation</div>
              <div className={styles.finReconcilGrid}>
                <div className={styles.finReconcilRow}>
                  <span>Order Total</span>
                  <span className={styles.goldText}>
                    {order.currency} {order.financials.orderTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.finReconcilRow}>
                  <span>Platform Commission (10%)</span>
                  <span className={styles.goldText}>
                    {order.currency} {order.financials.platformCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.finReconcilRow}>
                  <span>Supplier Payable</span>
                  <span>
                    {order.currency} {order.financials.supplierPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.finReconcilRow}>
                  <span>Captured</span>
                  <span>
                    {order.currency} {order.financials.captured.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.finReconcilRow}>
                  <span>Refunded</span>
                  <span>
                    {order.currency} {order.financials.refunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.finReconcilRow}>
                  <span>Outstanding</span>
                  <span>
                    {order.currency} {order.financials.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Order Actions */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Final Order Actions</h2>
              </div>
              <div className={styles.finalActionsList}>
                <button type="button" className={styles.btnPrimaryDark} onClick={() => setActiveModal("status")}>
                  Update Order Status
                </button>
                <div className={styles.btnRowTwo}>
                  <button type="button" className={styles.btnOutline} onClick={() => setActiveModal("contact_customer")}>
                    Contact Customer
                  </button>
                  <button type="button" className={styles.btnOutline} onClick={() => setActiveModal("contact_supplier")}>
                    Contact Suppliers
                  </button>
                </div>
                <div className={styles.btnRowTwo}>
                  <button type="button" className={styles.btnWarningOutline} onClick={() => setActiveModal("hold")}>
                    Hold Order
                  </button>
                  <button type="button" className={styles.btnDangerOutline} onClick={() => setActiveModal("cancel")}>
                    Cancel Order
                  </button>
                </div>
                <button type="button" className={styles.btnOutline} onClick={() => setActiveModal("refund")}>
                  Start Refund Review
                </button>
                <button type="button" className={styles.btnOutline} onClick={() => setActiveModal("return")}>
                  Start Return Review
                </button>
                <button
                  type="button"
                  className={styles.btnOutline}
                  style={{ color: "#9333ea", borderColor: "#e9d5ff" }}
                  onClick={() => setActiveModal("escalate")}
                >
                  Escalate Order
                </button>
                <p className={styles.disclaimerText}>
                  All order-status changes, holds, cancellations, refunds, returns, overrides and escalations require a reason and are recorded in the audit history.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Items & Supplier Fulfilment */}
      {activeTab === "items" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Order Items & Supplier Fulfilment Breakdown</h2>
          </div>
          <table className="order-table" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "10px" }}>SKU</th>
                <th>Item Name</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Supplier</th>
                <th>Allocation Status</th>
                <th>Batch Reference</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 600 }}>{item.sku}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.variant || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>LKR {item.unitPrice.toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>LKR {item.totalPrice.toLocaleString()}</td>
                  <td>{item.supplierName}</td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        item.allocationStatus === "Allocated" ? styles.badgePaid : styles.badgeAwaiting
                      }`}
                    >
                      {item.allocationStatus}
                    </span>
                  </td>
                  <td>
                    {item.batchId ? (
                      <Link href={`/admin/catalogue/inventory/batches/${item.batchId}`} style={{ color: "#501625", fontWeight: 600 }}>
                        {item.batchId}
                      </Link>
                    ) : (
                      <span style={{ color: "#d97706" }}>Pending Allocation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Payment & Transactions */}
      {activeTab === "payments" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Payment & Financial Transactions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#f9fafb", padding: 14, borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>Payment Method:</strong> {order.source.channel} Card Payment
                <br />
                <span className="muted" style={{ fontSize: "0.8125rem" }}>
                  Gateway Auth Code: AUTH-889021-X · Status: Authorized & Captured
                </span>
              </div>
              <span className={`${styles.statusPill} ${styles.badgePaid}`}>Paid LKR {order.financials.orderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Batch Allocation */}
      {activeTab === "allocation" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Inventory Batch Allocation Matrix</h2>
          </div>
          <p className="muted" style={{ fontSize: "0.875rem", marginBottom: 14 }}>
            Allocated {order.itemsAllocated} of {order.itemsCount} total order items to active inventory batches.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {order.items.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <div>
                  <strong>{it.name}</strong> ({it.sku})
                  <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                    Supplier: {it.supplierName}
                  </div>
                </div>
                <div>
                  {it.batchId ? (
                    <span className={`${styles.statusPill} ${styles.badgePaid}`}>
                      Allocated to {it.batchId}
                    </span>
                  ) : (
                    <span className={`${styles.statusPill} ${styles.badgeAwaiting}`}>
                      Batch Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Shipping & Delivery */}
      {activeTab === "shipping" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Shipping & Dispatch Logistics</h2>
          </div>
          <div className={styles.addressContent}>
            <div><strong>Logistics Partner:</strong> ShipXpress Logistics</div>
            <div><strong>Delivery Address:</strong> {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.country}</div>
            <div><strong>Status:</strong> {order.deliveryStatus}</div>
          </div>
        </div>
      )}

      {/* Tab 6: Returns & Refunds */}
      {activeTab === "returns" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Return Requests & Refund Exposure</h2>
          </div>
          {order.returnSummary.returnReference ? (
            <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: "1rem" }}>Return Case: {order.returnSummary.returnReference}</strong>
                <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }}>
                  Reason: {order.returnSummary.returnReason} · Inspection: {order.returnSummary.inspectionStatus}
                </div>
              </div>
              <Link href={`/admin/marketplace/returns/${order.returnSummary.returnId}`} className={styles.btnPrimaryDark} style={{ textDecoration: "none" }}>
                Open Return
              </Link>
            </div>
          ) : (
            <p className="muted">No active return cases recorded for this order.</p>
          )}
        </div>
      )}

      {/* Tab 7: Customer Communication */}
      {activeTab === "communication" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Customer Communications Log</h2>
            <button type="button" className={styles.btnPrimaryDark} onClick={() => setActiveModal("contact_customer")}>
              Send Message
            </button>
          </div>
          <p className="muted">Communication records and notification history for {order.customer.name}.</p>
        </div>
      )}

      {/* Tab 8: Operational Issues */}
      {activeTab === "issues" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Operational Issues & SLA Escalations</h2>
          </div>
          <div className={styles.blockingIssuesList}>
            {order.blockingIssues.map((issue) => (
              <div key={issue.id} className={styles.issueItem}>
                <div className={styles.issueMain}>
                  <AlertTriangle size={18} style={{ color: "#dc2626", marginTop: 2 }} />
                  <div>
                    <div className={styles.issueTitle}>{issue.title}</div>
                    <div className={styles.issueMsg}>{issue.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: Audit History */}
      {activeTab === "audit" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Complete Immutable Audit Log</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {order.auditHistory.map((audit) => (
              <div key={audit.id} style={{ borderLeft: "3px solid #501625", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#6b7280" }}>
                  <span>
                    <strong>{audit.actor}</strong> · {audit.action}
                  </span>
                  <span>{audit.timestamp}</span>
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", marginTop: 2 }}>
                  {audit.detail}
                </div>
                {audit.reason && (
                  <div style={{ fontSize: "0.8125rem", color: "#d97706", marginTop: 2 }}>
                    <em>Reason: {audit.reason}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <OrderActionModals
        order={order}
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
