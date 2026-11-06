"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import styles from "./returns-queue.module.css";
import type { ReturnCaseItem } from "@/types/admin";

interface ReturnsTableProps {
  cases: ReturnCaseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  selectedIds: string[];
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onOpenBulkAssign: () => void;
  onOpenOverrideModal: (returnId: string) => void;
  onOpenApproveRefundModal: (returnId: string) => void;
}

export function ReturnsTable({
  cases,
  total,
  page,
  pageSize,
  totalPages,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onPageChange,
  onPageSizeChange,
  onOpenBulkAssign,
  onOpenOverrideModal,
  onOpenApproveRefundModal,
}: ReturnsTableProps) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const allSelected = cases.length > 0 && cases.every((c) => selectedIds.includes(c.id));

  const renderBadge = (val: string, type: "eligibility" | "inspection" | "refund" | "dispute" | "risk" | "sla") => {
    if (type === "eligibility") {
      if (val.includes("ELIGIBLE")) return <span className={`${styles.badge} ${styles.badgeEligible}`}>{val}</span>;
      return <span className={`${styles.badge} ${styles.badgeEscalated}`}>{val}</span>;
    }
    if (type === "inspection") {
      if (val === "PENDING" || val === "REQUIRED") return <span className={`${styles.badge} ${styles.badgePending}`}>{val}</span>;
      if (val === "PASSED" || val === "NOT REQUIRED") return <span className={`${styles.badge} ${styles.badgeEligible}`}>{val}</span>;
      return <span className={`${styles.badge} ${styles.badgeEscalated}`}>{val}</span>;
    }
    if (type === "refund") {
      if (val === "PENDING REVIEW" || val === "PENDING APPROVAL") return <span className={`${styles.badge} ${styles.badgePendingReview}`}>{val}</span>;
      if (val === "APPROVED" || val === "PROCESSING") return <span className={`${styles.badge} ${styles.badgeEligible}`}>{val}</span>;
      return <span className={`${styles.badge} ${styles.badgeNone}`}>{val}</span>;
    }
    if (type === "dispute") {
      if (val === "NONE") return <span className={`${styles.badge} ${styles.badgeNone}`}>{val}</span>;
      return <span className={`${styles.badge} ${styles.badgeEscalated}`}>{val}</span>;
    }
    if (type === "risk") {
      if (val === "High" || val === "Critical") return <span className={`${styles.badge} ${styles.badgeHigh}`}>{val}</span>;
      return <span className={`${styles.badge} ${styles.badgeLow}`}>{val}</span>;
    }
    if (type === "sla") {
      if (val.includes("BREACHED")) return <span className={`${styles.badge} ${styles.badgeBreached}`}>{val}</span>;
      return <span className={`${styles.badge} ${styles.badgeTarget}`}>{val}</span>;
    }
    return <span className={styles.badge}>{val}</span>;
  };

  return (
    <div className={styles.leftTableContainer}>
      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span>{selectedIds.length} return case(s) selected</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={styles.btnDark} style={{ fontSize: "0.75rem", padding: "4px 8px" }} onClick={onOpenBulkAssign}>
              Assign Selected Cases
            </button>
          </div>
        </div>
      )}

      <table className={styles.returnsTable}>
        <thead>
          <tr>
            <th style={{ width: 32 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label="Select all rows"
              />
            </th>
            <th>Return Reference</th>
            <th>Database Return ID</th>
            <th>Order Reference</th>
            <th>Customer</th>
            <th>Product & Variant</th>
            <th>Supplier</th>
            <th>Qty</th>
            <th>Return Type</th>
            <th>Reason Category</th>
            <th>Condition Reported</th>
            <th>Eligibility Status</th>
            <th>Inspection Status</th>
            <th>Refund Status</th>
            <th>Dispute Status</th>
            <th>Risk Level</th>
            <th>SLA Status</th>
            <th>Assigned Officer</th>
            <th>Opened Date</th>
            <th>Action</th>
            <th style={{ width: 32 }}></th>
          </tr>
        </thead>
        <tbody>
          {cases.map((r) => {
            const isSelected = selectedIds.includes(r.id);
            return (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectRow(r.id, e.target.checked)}
                    aria-label={`Select case ${r.returnReference}`}
                  />
                </td>
                <td>
                  <Link href={`/admin/marketplace/returns/${encodeURIComponent(r.returnReference)}`} className={styles.refCell}>
                    {r.returnReference}
                  </Link>
                </td>
                <td>{r.dbReturnId}</td>
                <td>
                  <Link href={`/admin/marketplace/orders/${encodeURIComponent(r.orderReference)}`} className={styles.orderRefCell}>
                    {r.orderReference}
                  </Link>
                </td>
                <td style={{ fontWeight: 600 }}>{r.customerName}</td>
                <td>
                  <strong>{r.productName}</strong>
                  {r.productVariant && <span style={{ color: "#6b7280" }}> — {r.productVariant}</span>}
                </td>
                <td>{r.supplierName}</td>
                <td>{r.quantity}</td>
                <td>
                  <span style={{ color: r.returnType.includes("Safety") || r.returnType.includes("Authenticity") ? "#dc2626" : "inherit", fontWeight: 600 }}>
                    {r.returnType}
                  </span>
                </td>
                <td>
                  <span style={{ color: r.reasonCategory.includes("Irritation") || r.reasonCategory.includes("Counterfeit") ? "#dc2626" : "inherit" }}>
                    {r.reasonCategory}
                  </span>
                </td>
                <td>{r.conditionReported}</td>
                <td>{renderBadge(r.eligibilityStatus, "eligibility")}</td>
                <td>{renderBadge(r.inspectionStatus, "inspection")}</td>
                <td>{renderBadge(r.refundStatus, "refund")}</td>
                <td>{renderBadge(r.disputeStatus, "dispute")}</td>
                <td>{renderBadge(r.riskLevel, "risk")}</td>
                <td>{renderBadge(r.slaStatus, "sla")}</td>
                <td>{r.assignedOfficer}</td>
                <td style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.openedDate}</td>
                <td>
                  <button
                    type="button"
                    className={styles.btnOpenCase}
                    onClick={() => router.push(`/admin/marketplace/returns/${encodeURIComponent(r.returnReference)}`)}
                  >
                    Open Case
                  </button>
                </td>
                <td style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                    aria-label="Actions menu"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === r.id && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        zIndex: 50,
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        width: "180px",
                        padding: "4px 0",
                        fontSize: "0.75rem",
                      }}
                    >
                      <button
                        type="button"
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}
                        onClick={() => {
                          setOpenMenuId(null);
                          router.push(`/admin/marketplace/returns/${encodeURIComponent(r.returnReference)}`);
                        }}
                      >
                        Open Case Details
                      </button>
                      <button
                        type="button"
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}
                        onClick={() => {
                          setOpenMenuId(null);
                          router.push(`/admin/marketplace/orders/${encodeURIComponent(r.orderReference)}`);
                        }}
                      >
                        View Original Order
                      </button>
                      <button
                        type="button"
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenOverrideModal(r.id);
                        }}
                      >
                        Override Inspection
                      </button>
                      <button
                        type="button"
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenApproveRefundModal(r.id);
                        }}
                      >
                        Approve Refund
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className={styles.tableFooter}>
        <div>
          Showing <strong>{cases.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong> to{" "}
          <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> cases
        </div>

        <div className={styles.paginationControls}>
          <label style={{ marginRight: 8, fontSize: "0.75rem" }}>
            Rows per page:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ marginLeft: 6, padding: "2px 4px", borderRadius: 4, border: "1px solid #d1d5db" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>

          <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => onPageChange(1)}>
            <ChevronsLeft size={14} />
          </button>
          <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span className={`${styles.pageBtn} ${styles.pageBtnActive}`}>{page}</span>
          <button type="button" className={styles.pageBtn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight size={14} />
          </button>
          <button type="button" className={styles.pageBtn} disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
