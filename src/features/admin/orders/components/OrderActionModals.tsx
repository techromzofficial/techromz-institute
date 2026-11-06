"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import styles from "./order-detail.module.css";
import type { OrderDetail } from "@/types/admin";
import {
  updateOrderStatus,
  holdOrder,
  cancelOrder,
  startRefundReview,
  startReturnReview,
  escalateOrder,
  contactCustomer,
  contactSuppliers,
} from "@/services/api/orderService";

export type ModalType =
  | "status"
  | "contact_customer"
  | "contact_supplier"
  | "hold"
  | "cancel"
  | "refund"
  | "return"
  | "escalate"
  | null;

interface OrderActionModalsProps {
  order: OrderDetail;
  activeModal: ModalType;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function OrderActionModals({
  order,
  activeModal,
  onClose,
  onSuccess,
}: OrderActionModalsProps) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(
    order.supplierFulfilments.map((s) => s.id)
  );
  const [category, setCategory] = useState("Fulfilment Breach");
  const [priority, setPriority] = useState("High");
  const [assignedTo, setAssignedTo] = useState("Elena Vance");
  const [overrideInspection, setOverrideInspection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeModal) return null;

  const handleClose = () => {
    setReason("");
    setNote("");
    setSubject("");
    setMessage("");
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeModal === "status") {
        const res = await updateOrderStatus(order.id, selectedStatus, reason);
        onSuccess(res.message);
      } else if (activeModal === "hold") {
        const res = await holdOrder(order.id, reason, note);
        onSuccess(res.message);
      } else if (activeModal === "cancel") {
        const res = await cancelOrder(order.id, reason);
        onSuccess(res.message);
      } else if (activeModal === "refund") {
        const res = await startRefundReview(order.id, reason);
        onSuccess(res.message);
      } else if (activeModal === "return") {
        const res = await startReturnReview(order.id, reason, overrideInspection);
        onSuccess(res.message);
      } else if (activeModal === "escalate") {
        const res = await escalateOrder(order.id, category, priority, reason, assignedTo);
        onSuccess(res.message);
      } else if (activeModal === "contact_customer") {
        const res = await contactCustomer(order.id, subject, message);
        onSuccess(res.message);
      } else if (activeModal === "contact_supplier") {
        const res = await contactSuppliers(order.id, selectedSuppliers, subject, message);
        onSuccess(res.message);
      }
      handleClose();
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
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {activeModal === "status" && "Update Order Status"}
            {activeModal === "hold" && "Hold Order"}
            {activeModal === "cancel" && "Cancel Order"}
            {activeModal === "refund" && "Start Refund Review"}
            {activeModal === "return" && "Start Return Review"}
            {activeModal === "escalate" && "Escalate Order"}
            {activeModal === "contact_customer" && `Contact Customer (${order.customer.name})`}
            {activeModal === "contact_supplier" && "Contact Suppliers"}
          </h3>
          <button
            type="button"
            className="icon-button"
            onClick={handleClose}
            aria-label="Close modal"
          >
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
          {activeModal === "status" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Status</label>
                <select
                  className={styles.formSelect}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Processing">Processing</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mandatory Reason *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Provide reason for changing order status..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          )}

          {activeModal === "hold" && (
            <>
              <p style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Placing this order on hold will pause all supplier allocations and dispatch tasks.
              </p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mandatory Reason *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Explain why this order is being placed on hold..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Optional Internal Note</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Additional context for support team..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}

          {activeModal === "cancel" && (
            <>
              <div className="alert danger" style={{ padding: "10px", fontSize: "0.8125rem" }}>
                <AlertTriangle size={16} style={{ marginRight: 6 }} />
                Warning: Cancelling an order cannot be undone. Customer payment authorization will be reversed.
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mandatory Cancellation Reason *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Provide explicit reason for cancelling order..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          )}

          {activeModal === "refund" && (
            <>
              <p style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Initiate formal refund eligibility assessment for payment of {order.currency} {order.financials.orderTotal.toLocaleString()}.
              </p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Refund Reason *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Reason for requesting refund review..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          )}

          {activeModal === "return" && (
            <>
              <p style={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                Start return case review for reference {order.returnSummary.returnReference || order.orderReference}.
              </p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Review Reason *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Reason for initiating return review..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="overrideCheck"
                  checked={overrideInspection}
                  onChange={(e) => setOverrideInspection(e.target.checked)}
                />
                <label htmlFor="overrideCheck" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#991b1b" }}>
                  Override pending physical inspection requirement (Requires compliance log)
                </label>
              </div>
            </>
          )}

          {activeModal === "escalate" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Escalation Category</label>
                <select className={styles.formSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Fulfilment Breach">Fulfilment Breach</option>
                  <option value="Payment Fraud Risk">Payment Fraud Risk</option>
                  <option value="Supplier Dispute">Supplier Dispute</option>
                  <option value="Customer Complaint">Customer Complaint</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Priority Level</label>
                <select className={styles.formSelect} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assign To Officer</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Escalation Note / Reason *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Detail the issue requiring escalation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          )}

          {(activeModal === "contact_customer" || activeModal === "contact_supplier") && (
            <>
              {activeModal === "contact_supplier" && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Target Suppliers</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {order.supplierFulfilments.map((s) => (
                      <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem" }}>
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuppliers([...selectedSuppliers, s.id]);
                            } else {
                              setSelectedSuppliers(selectedSuppliers.filter((id) => id !== s.id));
                            }
                          }}
                        />
                        {s.supplierName} ({s.fulfilmentReference})
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  placeholder="Enter message subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Message Body *</label>
                <textarea
                  className={styles.formTextarea}
                  required
                  placeholder="Type your communication..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnOutline} onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={activeModal === "cancel" ? styles.btnDangerOutline : styles.btnPrimaryDark}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Confirm Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
