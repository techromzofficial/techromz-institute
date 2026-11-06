"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import styles from "./returns-queue.module.css";
import { bulkAssignReturnCases, saveReturnsView, overrideInspection, approveRefund } from "@/services/api/returnsService";
import type { ReturnFilterParams } from "@/types/admin";

export type ReturnsModalType = "bulk_assign" | "save_view" | "override_inspection" | "approve_refund" | null;

interface ReturnsModalsProps {
  activeModal: ReturnsModalType;
  selectedIds: string[];
  currentReturnId?: string;
  currentFilters: ReturnFilterParams;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ReturnsModals({
  activeModal,
  selectedIds,
  currentReturnId,
  currentFilters,
  onClose,
  onSuccess,
}: ReturnsModalsProps) {
  const [officerName, setOfficerName] = useState("Elena Vance");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [viewName, setViewName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeModal) return null;

  const handleClose = () => {
    setReason("");
    setNote("");
    setViewName("");
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeModal === "bulk_assign") {
        const res = await bulkAssignReturnCases({
          returnIds: selectedIds,
          officerName,
          reason,
          note,
        });
        onSuccess(res.message);
      } else if (activeModal === "save_view") {
        const res = await saveReturnsView({
          name: viewName,
          isDefault,
          filters: currentFilters,
        });
        onSuccess(res.message);
      } else if (activeModal === "override_inspection" && currentReturnId) {
        const res = await overrideInspection(currentReturnId, reason);
        onSuccess(res.message);
      } else if (activeModal === "approve_refund" && currentReturnId) {
        const res = await approveRefund(currentReturnId, reason);
        onSuccess(res.message);
      }
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Operation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: 12 }}>
          <h3 className={styles.modalTitle}>
            {activeModal === "bulk_assign" && `Bulk Assign ${selectedIds.length} Case(s)`}
            {activeModal === "save_view" && "Save Filter View"}
            {activeModal === "override_inspection" && `Override Inspection Requirement (${currentReturnId})`}
            {activeModal === "approve_refund" && `Approve Refund (${currentReturnId})`}
          </h3>
          <button type="button" className="icon-button" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="alert danger" style={{ padding: "8px 12px", fontSize: "0.8125rem" }}>
            <AlertTriangle size={14} style={{ marginRight: 6 }} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {activeModal === "bulk_assign" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Assign To Officer / Team *</label>
                <select
                  style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem" }}
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                >
                  <option value="Elena Vance">Elena Vance (Compliance Lead)</option>
                  <option value="Dilan Perera">Dilan Perera (Fulfillment Specialist)</option>
                  <option value="Compliance Operations Team">Compliance Operations Team</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Mandatory Assignment Reason *</label>
                <textarea
                  style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem", minHeight: 70 }}
                  required
                  placeholder="Provide reason for bulk assignment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Optional Note</label>
                <input
                  type="text"
                  style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem" }}
                  placeholder="Internal reference or ticket link..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}

          {activeModal === "save_view" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>View Name *</label>
                <input
                  type="text"
                  style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem" }}
                  required
                  placeholder="e.g. High Risk Pending Inspections"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label htmlFor="defaultCheck" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                  Set as my default Returns Queue view
                </label>
              </div>
            </>
          )}

          {activeModal === "override_inspection" && (
            <>
              <div className="alert danger" style={{ padding: "10px", fontSize: "0.8125rem" }}>
                <AlertTriangle size={16} style={{ marginRight: 6 }} />
                Overriding physical inspection bypasses lab review. Authorized permission & compliance logging required.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Mandatory Override Reason *</label>
                <textarea
                  style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem", minHeight: 80 }}
                  required
                  placeholder="Provide explicit compliance justification..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          )}

          {activeModal === "approve_refund" && (
            <>
              <p style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Approve refund authorization for this return case. Ensure all return conditions are met.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Mandatory Approval Reason *</label>
                <textarea
                  style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem", minHeight: 80 }}
                  required
                  placeholder="Explain why refund approval is granted..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
            <button type="button" className={styles.btnOutline} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnDark} disabled={submitting}>
              {submitting ? "Processing..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
