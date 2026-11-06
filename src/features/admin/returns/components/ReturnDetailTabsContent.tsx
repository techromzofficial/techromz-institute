"use client";

import React from "react";
import Link from "next/link";
import { Download, CheckCircle, Clock, ShieldCheck, AlertCircle, ExternalLink, ArrowRight } from "lucide-react";
import styles from "./return-detail.module.css";
import type { ReturnCaseDetails } from "@/types/admin";
import { CaseSummaryCard } from "./CaseSummaryCard";
import { CaseLifecycleTimeline } from "./CaseLifecycleTimeline";
import { OriginalOrderSummary } from "./OriginalOrderSummary";
import { CustomerProfileCard } from "./CustomerProfileCard";
import { InternalHealthMetrics } from "./InternalHealthMetrics";
import { InternalCaseNote } from "./InternalCaseNote";

interface ReturnDetailTabsContentProps {
  details: ReturnCaseDetails;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onViewPayment?: () => void;
  onViewFulfilment?: () => void;
  onViewCustomer?: () => void;
  onContactCustomer?: () => void;
  onViewClaimHistory?: () => void;
  onEditNote?: () => void;
}

export function ReturnDetailTabsContent({
  details,
  activeTab,
  onSelectTab,
  onViewPayment,
  onViewFulfilment,
  onViewCustomer,
  onContactCustomer,
  onViewClaimHistory,
  onEditNote,
}: ReturnDetailTabsContentProps) {
  switch (activeTab) {
    case "items":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Returned Items ({details.returnedItems.length})</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Product & SKU</th>
                  <th style={{ padding: "10px 12px" }}>Batch</th>
                  <th style={{ padding: "10px 12px" }}>Supplier</th>
                  <th style={{ padding: "10px 12px" }}>Ordered / Returned</th>
                  <th style={{ padding: "10px 12px" }}>Unit Price</th>
                  <th style={{ padding: "10px 12px" }}>Reported Condition</th>
                  <th style={{ padding: "10px 12px" }}>Item Eligibility</th>
                  <th style={{ padding: "10px 12px" }}>Refund Amount</th>
                </tr>
              </thead>
              <tbody>
                {details.returnedItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{item.productName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Variant: {item.variant} · SKU: {item.sku} · ID: {item.productId}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Link
                        href={`/admin/catalogue/inventory/batches/${encodeURIComponent(item.batchNumber)}`}
                        className={styles.orderLink}
                      >
                        {item.batchNumber}
                      </Link>
                    </td>
                    <td style={{ padding: "12px" }}>{item.supplierName}</td>
                    <td style={{ padding: "12px" }}>{item.orderedQuantity} ordered / <strong>{item.returnedQuantity} returned</strong></td>
                    <td style={{ padding: "12px" }}>LKR {item.unitPrice.toLocaleString()}</td>
                    <td style={{ padding: "12px", color: "#b91c1c", fontWeight: 500 }}>{item.reportedCondition}</td>
                    <td style={{ padding: "12px" }}>
                      <span className={`${styles.statusPill} ${styles.pillWarning}`}>{item.itemEligibility}</span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#111827" }}>
                      LKR {item.itemRefundAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "evidence":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Customer Evidence ({details.evidenceList.length})</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {details.evidenceList.map((ev) => (
              <div key={ev.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, background: "#ffffff", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{ev.title}</div>
                  <span className={`${styles.statusPill} ${ev.verificationStatus === "Verified" ? styles.pillSuccess : styles.pillWarning}`}>
                    {ev.verificationStatus}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  Category: <strong>{ev.category}</strong> · Uploaded {ev.uploadDate}
                </div>
                <div style={{ background: "#f9fafb", borderRadius: 6, height: 120, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #d1d5db", color: "#6b7280", fontSize: "0.8125rem" }}>
                  [{ev.type.toUpperCase()} PREVIEW: {ev.title}]
                </div>
                {ev.notes && (
                  <div style={{ fontSize: "0.75rem", color: "#4b5563", fontStyle: "italic" }}>
                    Notes: {ev.notes}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button type="button" className={styles.btnOutline} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "eligibility":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Eligibility Assessment</span>
            </div>
            <span className={`${styles.statusPill} ${styles.pillWarning}`}>
              Confidence: {details.eligibilityAssessment.eligibilityConfidence}%
            </span>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Return Window Check</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.returnWindowResult}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Product Category Rules</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.productCategoryRules}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Hygiene Restrictions</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.hygieneRestrictions}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Usage Restrictions</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.usageRestrictions}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Product Condition Check</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.productConditionCheck}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Delivery State</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.orderDeliveryState}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Return History</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.previousReturnHistoryCheck}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Defect Assessment</span>
              <span className={styles.metaValue}>{details.eligibilityAssessment.productDefectAssessment}</span>
            </div>
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 14, marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e40af" }}>
              Eligibility Decision: {details.eligibilityAssessment.eligibilityDecision}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#1d4ed8", marginTop: 4 }}>
              Reason: {details.eligibilityAssessment.decisionReason}
            </div>
          </div>
        </div>
      );

    case "inspection":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Product Inspection Record</span>
            </div>
            <span className={`${styles.statusPill} ${styles.pillInfo}`}>
              Status: {details.productInspection.sealIntegrity}
            </span>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Inspection Requirement</span>
              <span className={styles.metaValue}>{details.productInspection.inspectionRequirement}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Inspection Type</span>
              <span className={styles.metaValue}>{details.productInspection.inspectionType}</span>
            </div>
            <div className={styles.metaItem} style={{ gridColumn: "span 2" }}>
              <span className={styles.metaLabel}>Assigned Facility</span>
              <span className={styles.metaValue}>{details.productInspection.inspectionFacility}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Inspector</span>
              <span className={styles.metaValue}>{details.productInspection.assignedInspector}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Scheduled Date</span>
              <span className={styles.metaValue}>{details.productInspection.scheduledDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Seal Integrity</span>
              <span className={styles.metaValue}>{details.productInspection.sealIntegrity}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Leakage Findings</span>
              <span className={styles.metaValue}>{details.productInspection.leakageFindings}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Product Authenticity</span>
              <span className={styles.metaValue}>{details.productInspection.productAuthenticity}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Inspector Conclusion</span>
              <span className={styles.metaValue}>{details.productInspection.inspectorConclusion}</span>
            </div>
          </div>
        </div>
      );

    case "batch":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Batch & Authenticity Verification</span>
            </div>
            <Link
              href={`/admin/catalogue/inventory/batches/${encodeURIComponent(details.batchAuthenticity.batchNumber)}`}
              className={styles.btnOutline}
              style={{ textDecoration: "none" }}
            >
              <span>View Inventory Batch</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Batch Number</span>
              <span className={styles.metaValue}>
                <Link
                  href={`/admin/catalogue/inventory/batches/${encodeURIComponent(details.batchAuthenticity.batchNumber)}`}
                  className={styles.orderLink}
                >
                  {details.batchAuthenticity.batchNumber}
                </Link>
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Production Date</span>
              <span className={styles.metaValue}>{details.batchAuthenticity.productionDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Expiry Date</span>
              <span className={styles.metaValue}>{details.batchAuthenticity.expiryDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Supplier Batch Reference</span>
              <span className={styles.metaValue}>{details.batchAuthenticity.supplierBatchReference}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Authenticity Result</span>
              <span className={`${styles.statusPill} ${styles.pillSuccess}`} style={{ width: "fit-content" }}>
                {details.batchAuthenticity.authenticityResult}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Serial / QR Verification</span>
              <span className={styles.metaValue}>{details.batchAuthenticity.serialQrVerification}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Packaging Hologram Check</span>
              <span className={styles.metaValue}>{details.batchAuthenticity.packagingVerification}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Quarantine / Recall Status</span>
              <span className={styles.metaValue}>{details.batchAuthenticity.quarantineStatus} / {details.batchAuthenticity.recallStatus}</span>
            </div>
          </div>
        </div>
      );

    case "refund":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Refund Calculation & Financial Exposure</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span>Product Subtotal</span>
                <span>LKR {details.refundCalculation.productSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span>Tax (VAT)</span>
                <span>LKR {details.refundCalculation.tax.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span>Shipping</span>
                <span>LKR {details.refundCalculation.shipping.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: 700, fontSize: "1rem" }}>
                <span>Max Refundable Amount</span>
                <span>LKR {details.refundCalculation.maxRefundableAmount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: "0.8125rem", color: "#6b7280", fontWeight: 600 }}>Refund Adjudication</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Requested Refund:</span>
                <strong>LKR {details.refundCalculation.requestedRefund.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Recommended Refund:</span>
                <strong>LKR {details.refundCalculation.recommendedRefund.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 8, color: "#065f46" }}>
                <span>Approved Refund:</span>
                <strong>LKR {details.refundCalculation.approvedRefund.toLocaleString()}</strong>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>
                Method: {details.refundCalculation.refundMethod}
              </div>
            </div>
          </div>
        </div>
      );

    case "responsibility":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Responsibility & Recovery Allocation</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Supplier Liability */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#ffffff" }}>
              <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>
                Supplier Recovery ({details.responsibilityRecovery.supplierRecovery.percentage}%)
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Party: <strong>{details.responsibilityRecovery.supplierRecovery.responsibleParty}</strong>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Reason: {details.responsibilityRecovery.supplierRecovery.reason}
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#065f46", marginTop: 8 }}>
                LKR {details.responsibilityRecovery.supplierRecovery.recoverableAmount.toLocaleString()}
              </div>
              <span className={`${styles.statusPill} ${styles.pillWarning}`} style={{ marginTop: 6, display: "inline-block" }}>
                Status: {details.responsibilityRecovery.supplierRecovery.recoveryStatus}
              </span>
            </div>

            {/* Logistics Claim */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#ffffff" }}>
              <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>
                Logistics Claim ({details.responsibilityRecovery.logisticsClaim.percentage}%)
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Party: <strong>{details.responsibilityRecovery.logisticsClaim.responsibleParty}</strong>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Reason: {details.responsibilityRecovery.logisticsClaim.reason}
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1e40af", marginTop: 8 }}>
                LKR {details.responsibilityRecovery.logisticsClaim.recoverableAmount.toLocaleString()}
              </div>
              <span className={`${styles.statusPill} ${styles.pillInfo}`} style={{ marginTop: 6, display: "inline-block" }}>
                Status: {details.responsibilityRecovery.logisticsClaim.recoveryStatus}
              </span>
            </div>
          </div>
        </div>
      );

    case "logistics":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Reverse Logistics & Pickup</span>
            </div>
            <span className={`${styles.statusPill} ${styles.pillInfo}`}>
              {details.returnLogistics.pickupStatus}
            </span>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Logistics Partner</span>
              <span className={styles.metaValue}>{details.returnLogistics.logisticsPartner}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Tracking Reference</span>
              <span className={styles.metaValue}>{details.returnLogistics.trackingReference}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Scheduled Pickup</span>
              <span className={styles.metaValue}>{details.returnLogistics.scheduledPickupDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Receiving Warehouse</span>
              <span className={styles.metaValue}>{details.returnLogistics.receivingWarehouse}</span>
            </div>
            <div className={styles.metaItem} style={{ gridColumn: "span 2" }}>
              <span className={styles.metaLabel}>Pickup Address</span>
              <span className={styles.metaValue}>{details.returnLogistics.pickupAddress}</span>
            </div>
          </div>
        </div>
      );

    case "communications":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Communications History ({details.communications.length})</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {details.communications.map((comm) => (
              <div key={comm.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#6b7280", marginBottom: 4 }}>
                  <span><strong>{comm.sender}</strong> &rarr; {comm.recipient} ({comm.channel})</span>
                  <span>{comm.timestamp}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827", marginBottom: 4 }}>
                  {comm.subject}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#374151", lineHeight: 1.5 }}>
                  {comm.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "issues":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Operational Issues ({details.operationalIssues.length})</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {details.operationalIssues.map((issue) => (
              <div key={issue.id} className={styles.blockingIssueRow}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={styles.blockingTitle}>{issue.title}</span>
                  <span className={`${styles.statusPill} ${styles.pillDanger}`}>{issue.severity} Severity</span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#791919" }}>{issue.description}</div>
                <button
                  type="button"
                  className={styles.btnActionSmall}
                  onClick={() => onSelectTab(issue.targetTab)}
                >
                  {issue.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case "audit":
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span>Audit History ({details.auditHistory.length})</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {details.auditHistory.map((evt) => (
              <div key={evt.id} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                  <span>{evt.event}</span>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 400 }}>{evt.timestamp}</span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#4b5563", marginTop: 2 }}>
                  User: <strong>{evt.actingUser}</strong> ({evt.role}) · Source: {evt.source}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#374151", marginTop: 4, fontStyle: "italic" }}>
                  Reason: &ldquo;{evt.mandatoryReason}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "overview":
    default:
      return (
        <>
          <CaseSummaryCard summary={details.summary} />
          <CaseLifecycleTimeline stages={details.lifecycle} />
          <OriginalOrderSummary
            order={details.originalOrder}
            onViewPayment={onViewPayment}
            onViewFulfilment={onViewFulfilment}
          />
          <CustomerProfileCard
            profile={details.customerProfile}
            onViewCustomer={onViewCustomer}
            onContactCustomer={onContactCustomer}
            onViewClaimHistory={onViewClaimHistory}
          />
          <InternalHealthMetrics metrics={details.healthMetrics} />
          <InternalCaseNote note={details.internalCaseNote} onEditNote={onEditNote} />
        </>
      );
  }
}
