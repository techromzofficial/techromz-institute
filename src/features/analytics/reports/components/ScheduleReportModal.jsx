"use client";

import React, { useState } from "react";
import { X, Calendar, CheckCircle2 } from "lucide-react";

export function ScheduleReportModal({ isOpen, onClose }) {
  const [reportName, setReportName] = useState("Order Performance Daily Digest");
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00");
  const [recipients, setRecipients] = useState("management@slbeauty.lk");
  const [format, setFormat] = useState("pdf");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipients.trim() || !recipients.includes("@")) {
      setErrorMsg("Please enter a valid recipient email address.");
      return;
    }
    setErrorMsg("");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="report-modal-overlay" role="dialog" aria-modal="true">
      <div className="report-modal-card">
        <div className="modal-header flex-between">
          <h3 className="modal-title flex-center-gap">
            <Calendar size={16} /> Schedule Recurring Report
          </h3>
          <button type="button" onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-success-state text-center p-4">
            <CheckCircle2 size={36} className="text-success inline-block mb-2" />
            <h4 className="font-bold text-lg">Report Scheduled Successfully</h4>
            <p className="text-muted text-sm mt-1">The report will be automatically dispatched to target recipients.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body-form">
            {errorMsg && (
              <div className="error-banner text-xs text-red-600 bg-red-50 p-2 rounded mb-2 border border-red-200">
                {errorMsg}
              </div>
            )}
            <div className="form-field">
              <label className="field-label">Scheduled Report Name</label>
              <input
                type="text"
                className="field-input"
                value={reportName}
                required
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Frequency</label>
              <select className="field-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (Every Monday)</option>
                <option value="monthly">Monthly (1st of month)</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Dispatch Time (UTC+05:30)</label>
              <input
                type="time"
                className="field-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Recipient Email Addresses (comma separated)</label>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. analytics@slbeauty.lk"
                value={recipients}
                required
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Attachment Format</label>
              <select className="field-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="csv">CSV Data (.csv)</option>
                <option value="xlsx">Excel (.xlsx)</option>
              </select>
            </div>

            <div className="modal-actions-footer flex-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="btn-secondary-light">
                Cancel
              </button>
              <button type="submit" className="btn-primary-burgundy">
                Save Schedule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

