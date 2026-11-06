"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import styles from "./returns-queue.module.css";
import {
  overrideInspection,
  approveRefund,
  submitReplacementApproval,
  submitPartialRefund,
  submitEvidenceRequest,
  submitScheduleInspection,
  submitRejectReturn,
  submitEscalateCase,
  submitSuspendDecision,
  submitInternalNote,
} from "@/services/api/returnsService";

export type ReturnDetailModalType =
  | "override_inspection"
  | "approve_refund"
  | "approve_replacement"
  | "approve_partial"
  | "request_evidence"
  | "schedule_inspection"
  | "reject_return"
  | "escalate_case"
  | "suspend_decision"
  | "edit_note"
  | "contact_customer"
  | null;

interface ReturnCaseModalsProps {
  activeModal: ReturnDetailModalType;
  returnId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ReturnCaseModals({
  activeModal,
  returnId,
  onClose,
  onSuccess,
}: ReturnCaseModalsProps) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("Customer");
  const [evidenceType, setEvidenceType] = useState("Product Condition Photo");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("2026-07-25");
  const [facility, setFacility] = useState("Colombo Central Fulfillment Facility #2");
  const [inspector, setInspector] = useState("Kamal Perera");
  const [scheduledDate, setScheduledDate] = useState("2026-07-23T10:00");
  const [category, setCategory] = useState("Ineligible Return Window");
  const [priority, setPriority] = useState("High");
  const [targetTeam, setTargetTeam] = useState("Legal & Compliance");
  const [dependency, setDependency] = useState("Supplier Inspection Report");
  const [reviewDate, setReviewDate] = useState("2026-07-28");
  const [noteContent, setNoteContent] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeModal === "override_inspection") {
        if (!confirmCheckbox) {
          throw new Error("You must check the override confirmation box.");
        }
        const res = await overrideInspection(returnId, reason);
        onSuccess(res.message);
      } else if (activeModal === "approve_refund") {
        const res = await approveRefund(returnId, reason);
        onSuccess(res.message);
      } else if (activeModal === "approve_replacement") {
        const res = await submitReplacementApproval(returnId, reason);
        onSuccess(res.message);
      } else if (activeModal === "approve_partial") {
        const numAmt = Number(amount);
        const res = await submitPartialRefund(returnId, numAmt, reason);
        onSuccess(res.message);
      } else if (activeModal === "request_evidence") {
        const res = await submitEvidenceRequest(returnId, recipient, evidenceType, instructions, dueDate);
        onSuccess(res.message);
      } else if (activeModal === "schedule_inspection") {
        const res = await submitScheduleInspection(returnId, facility, inspector, scheduledDate, reason);
        onSuccess(res.message);
      } else if (activeModal === "reject_return") {
        const res = await submitRejectReturn(returnId, category, reason);
        onSuccess(res.message);
      } else if (activeModal === "escalate_case") {
        const res = await submitEscalateCase(returnId, priority, targetTeam, reason);
        onSuccess(res.message);
      } else if (activeModal === "suspend_decision") {
        const res = await submitSuspendDecision(returnId, dependency, reviewDate, reason);
        onSuccess(res.message);
      } else if (activeModal === "edit_note") {
        const res = await submitInternalNote(returnId, noteContent);
        onSuccess(res.message);
      } else if (activeModal === "contact_customer") {
        onSuccess(`Message sent to customer for case ${returnId}.`);
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Action failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContent} style={{ maxWidth: 540 }}>
        <div className={styles.modalHeader}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            {activeModal === "override_inspection" && <ShieldAlert size={18} style={{ color: "#dc2626" }} />}
            {activeModal === "override_inspection" && "Inspection Requirement Override"}
            {activeModal === "approve_refund" && "Approve Full Refund"}
            {activeModal === "approve_replacement" && "Approve Replacement Order"}
            {activeModal === "approve_partial" && "Approve Partial Refund"}
            {activeModal === "request_evidence" && "Request Additional Evidence"}
            {activeModal === "schedule_inspection" && "Schedule Physical Inspection"}
            {activeModal === "reject_return" && "Reject Return Case"}
            {activeModal === "escalate_case" && "Escalate Case Priority"}
            {activeModal === "suspend_decision" && "Suspend Decision"}
            {activeModal === "edit_note" && "Edit Internal Case Note"}
            {activeModal === "contact_customer" && "Contact Customer"}
          </h3>
          <button type="button" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 6, fontSize: "0.875rem", margin: "12px 16px 0 16px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {activeModal === "override_inspection" && (
            <>
              <div style={{ background: "#fffbe5", border: "1px solid #fcd34d", padding: "10px 14px", borderRadius: 6, fontSize: "0.8125rem", color: "#92400e" }}>
                <AlertTriangle size={14} style={{ display: "inline", marginRight: 6 }} />
                Overriding inspection requirements bypasses mandatory physical quality verification for cosmetic items.
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mandatory Override Reason <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Enter detailed compliance justification for early override..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  required
                />
                <span>I confirm that I have compliance authority to override physical inspection for case {returnId}.</span>
              </label>
            </>
          )}

          {activeModal === "approve_refund" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Mandatory Approval Reason <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Enter justification for full refund approval..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          )}

          {activeModal === "approve_replacement" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Replacement Reason & Order Justification <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Enter replacement justification & dispatch note..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          )}

          {activeModal === "approve_partial" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Partial Refund Amount (LKR) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="e.g. 2300"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Partial Refund Reason <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Explain partial refund calculation basis..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeModal === "request_evidence" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Target Recipient</label>
                <select className={styles.select} value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                  <option value="Customer">Customer (Elena Rodriguez)</option>
                  <option value="Supplier">Supplier (Luxe Distribution)</option>
                  <option value="Logistics">Logistics (SL Express Courier)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Evidence Type</label>
                <select className={styles.select} value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
                  <option value="Product Condition Photo">Product Condition Photo</option>
                  <option value="Packaging & Box Photo">Packaging & Box Photo</option>
                  <option value="Unboxing Video">Unboxing Video</option>
                  <option value="Serum Texture Video">Serum Texture Video</option>
                  <option value="Batch Label Photo">Batch Label Photo</option>
                  <option value="Courier Damage Report">Courier Damage Report</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Instructions <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Specific details requested..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeModal === "schedule_inspection" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Inspection Facility</label>
                <input
                  type="text"
                  className={styles.input}
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Assigned Inspector</label>
                <input
                  type="text"
                  className={styles.input}
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeModal === "reject_return" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Rejection Category</label>
                <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Ineligible Return Window">Ineligible Return Window</option>
                  <option value="Policy Exclusion">Policy Exclusion</option>
                  <option value="Product Used / Damaged by Customer">Product Used / Damaged by Customer</option>
                  <option value="Insufficient Evidence">Insufficient Evidence</option>
                  <option value="Fraudulent Claim">Fraudulent Claim</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mandatory Rejection Reason <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Explain rejection reason for audit log & customer notice..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeModal === "escalate_case" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Escalation Priority</label>
                <select className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Target Team</label>
                <select className={styles.select} value={targetTeam} onChange={(e) => setTargetTeam(e.target.value)}>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                  <option value="Supplier Adjudication Lead">Supplier Adjudication Lead</option>
                  <option value="Executive Appeals">Executive Appeals</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mandatory Escalation Reason <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Explain reasons for escalating case priority..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeModal === "suspend_decision" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Dependency Blocker</label>
                <input
                  type="text"
                  className={styles.input}
                  value={dependency}
                  onChange={(e) => setDependency(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Review Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Suspension Reason <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Explain why decision is suspended..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeModal === "edit_note" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Internal Case Note Content <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Enter internal note content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                required
              />
            </div>
          )}

          {activeModal === "contact_customer" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Message to Customer <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Type customer communication..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={submitting}
              style={{
                background: activeModal === "reject_return" ? "#dc2626" : "#111827",
              }}
            >
              {submitting ? "Processing..." : "Confirm Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
