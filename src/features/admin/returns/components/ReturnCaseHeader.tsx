"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreVertical, CheckCircle2, ShieldAlert } from "lucide-react";
import styles from "./return-detail.module.css";
import type { ReturnCaseDetails } from "@/types/admin";

interface ReturnCaseHeaderProps {
  details: ReturnCaseDetails;
  onApproveReplacement: () => void;
  onApproveFullRefund: () => void;
  onRequestEvidence: () => void;
  onScheduleInspection: () => void;
  onRejectReturn: () => void;
  onEscalateCase: () => void;
  onSuspendDecision: () => void;
}

export function ReturnCaseHeader({
  details,
  onApproveReplacement,
  onApproveFullRefund,
  onRequestEvidence,
  onScheduleInspection,
  onRejectReturn,
  onEscalateCase,
  onSuspendDecision,
}: ReturnCaseHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.topNav}>
      {/* Back Link & Breadcrumbs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/marketplace/returns" className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>Back to Returns, Refunds & Disputes</span>
        </Link>
        <div className={styles.breadcrumbs}>
          <span>Marketplace</span>
          <ChevronRight size={12} className={styles.breadcrumbSeparator} />
          <Link href="/admin/marketplace/returns" style={{ color: "inherit", textDecoration: "none" }}>
            Returns, Refunds & Disputes
          </Link>
          <ChevronRight size={12} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{details.publicReference}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerTopRow}>
          <div className={styles.refTitleBlock}>
            <span className={styles.refSubTitle}>Public Return Reference</span>
            <h1 className={styles.refMainTitle}>{details.publicReference}</h1>
            <div className={styles.refSubDetails}>
              <span>Database Return ID: <strong>{details.dbReturnId}</strong></span>
              <span>·</span>
              <span>
                Original Order:{" "}
                <Link href={`/admin/marketplace/orders/${encodeURIComponent(details.orderReference)}`} className={styles.orderLink}>
                  {details.orderReference}
                </Link>
              </span>
              <span>·</span>
              <span>Database Order ID: <strong>{details.dbOrderId}</strong></span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className={styles.headerActions}>
            <button type="button" className={styles.btnPrimaryDark} onClick={onApproveReplacement}>
              <CheckCircle2 size={16} />
              <span>Approve Replacement</span>
            </button>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={styles.btnOutline}
                style={{ padding: "8px 10px" }}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 4,
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    width: 220,
                    zIndex: 50,
                    padding: "6px 0",
                  }}
                >
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onApproveFullRefund(); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    Approve Full Refund
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onRequestEvidence(); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    Request Evidence
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onScheduleInspection(); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    Schedule Inspection
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onEscalateCase(); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    Escalate Case
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onSuspendDecision(); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    Suspend Decision
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onRejectReturn(); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.875rem", color: "#dc2626" }}
                  >
                    Reject Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separated Workflow Status Pills Row */}
        <div className={styles.headerPillsRow}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Return Status</span>
            <span className={`${styles.statusPill} ${styles.pillWarning}`}>{details.returnStatus}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Eligibility Status</span>
            <span className={`${styles.statusPill} ${styles.pillWarning}`}>{details.eligibilityStatus}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Inspection Status</span>
            <span className={`${styles.statusPill} ${styles.pillInfo}`}>{details.inspectionStatus}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Refund Status</span>
            <span className={`${styles.statusPill} ${styles.pillWarning}`}>{details.refundStatus}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Dispute Status</span>
            <span className={`${styles.statusPill} ${styles.pillSuccess}`}>{details.disputeStatus}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Risk Level</span>
            <span className={`${styles.statusPill} ${styles.pillSuccess}`}>{details.riskLevel}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>SLA Status</span>
            <span className={`${styles.statusPill} ${styles.pillDanger}`}>
              <ShieldAlert size={12} />
              <span>{details.slaStatus}</span>
            </span>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className={styles.headerMetadataGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Opened</span>
            <span className={styles.metaValue}>{details.openedDate}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Return Type</span>
            <span className={styles.metaValue}>{details.returnType}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Product</span>
            <span className={styles.metaValue}>{details.productName}</span>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Product ID: {details.productId} · SKU: {details.sku}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Supplier</span>
            <span className={styles.metaValue}>{details.supplierName}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Batch</span>
            <span className={styles.metaValue}>
              <Link href={`/admin/catalogue/inventory/batches/${encodeURIComponent(details.batchId || details.batchNumber)}`} className={styles.orderLink}>
                {details.batchNumber}
              </Link>
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Assigned Officer</span>
            <span className={styles.metaValue}>{details.assignedOfficer}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Reason Category</span>
            <span className={styles.metaValue}>{details.reasonCategory}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Quantity</span>
            <span className={styles.metaValue}>{details.quantity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
