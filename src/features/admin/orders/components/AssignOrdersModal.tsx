"use client";

import React, { useEffect, useState } from "react";
import { X, UserCheck, AlertTriangle } from "lucide-react";
import { mockOfficers } from "@/mocks/admin/orders.mock";

interface AssignOrdersModalProps {
  isOpen: boolean;
  orderIds: string[];
  onClose: () => void;
  onConfirm: (officerId: string, officerName: string, note?: string) => Promise<void>;
}

export function AssignOrdersModal({
  isOpen,
  orderIds,
  onClose,
  onConfirm,
}: AssignOrdersModalProps) {
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedOfficerId("");
      setOfficerSearch("");
      setNote("");
      setErrorMsg("");
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const filteredOfficers = mockOfficers.filter(
    (off) =>
      off.name.toLowerCase().includes(officerSearch.toLowerCase()) ||
      off.role.toLowerCase().includes(officerSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedOfficerId) {
      setErrorMsg("Please select an officer for assignment");
      return;
    }

    const selectedOfficer = mockOfficers.find((o) => o.id === selectedOfficerId);
    if (!selectedOfficer) {
      setErrorMsg("Selected officer is invalid");
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(selectedOfficer.id, selectedOfficer.name, note);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to assign order(s). Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <UserCheck size={20} className="modal-icon" />
            <h2>Assign Orders</h2>
          </div>
          <button
            type="button"
            className="icon-button close-modal-btn"
            aria-label="Close modal"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="order-count-banner">
            Assigning <strong>{orderIds.length}</strong> selected order{orderIds.length > 1 ? "s" : ""}
          </div>

          {errorMsg && (
            <div className="field-error-banner">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="assign-form">
            <div className="form-group">
              <label className="form-label" htmlFor="officer-search-input">
                Search Officer
              </label>
              <input
                id="officer-search-input"
                type="text"
                className="modal-input"
                placeholder="Search by officer name or role..."
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="officer-select">
                Select Officer <span className="required">*</span>
              </label>
              <select
                id="officer-select"
                className="modal-select"
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                required
              >
                <option value="">-- Choose an assigned officer --</option>
                {filteredOfficers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} ({officer.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="assignment-note">
                Assignment Note (Optional)
              </label>
              <textarea
                id="assignment-note"
                className="modal-textarea"
                rows={3}
                placeholder="Add contextual instructions or notes for the officer..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={submitting}>
                {submitting ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
