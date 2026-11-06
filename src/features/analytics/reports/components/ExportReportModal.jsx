"use client";

import React, { useState } from "react";
import { X, Download, CheckCircle2 } from "lucide-react";

export function ExportReportModal({ isOpen, onClose }) {
  const [scope, setScope] = useState("underlying");
  const [format, setFormat] = useState("csv");
  const [rowLimit, setRowLimit] = useState(1000);
  const [maskCustomer, setMaskCustomer] = useState(true);
  const [maskFinancial, setMaskFinancial] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(rowLimit) > 10000) {
      setErrorMsg("Row limit exceeds maximum allowed (10,000)");
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
            <Download size={16} /> Export Report Data
          </h3>
          <button type="button" onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-success-state text-center p-4">
            <CheckCircle2 size={36} className="text-success inline-block mb-2" />
            <h4 className="font-bold text-lg">Export Request Prepared</h4>
            <p className="text-muted text-sm mt-1">Your export file is generating and will download shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body-form">
            {errorMsg && (
              <div className="error-banner text-xs text-red-600 bg-red-50 p-2 rounded mb-2 border border-red-200">
                {errorMsg}
              </div>
            )}
            <div className="form-field">
              <label className="field-label">Export Scope</label>
              <select className="field-select" value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="underlying">Underlying Order Records (Filtered)</option>
                <option value="summary">Summary KPIs &amp; Charts Only</option>
                <option value="full">Full Report Package (ZIP)</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">File Format</label>
              <select className="field-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="csv">CSV (.csv)</option>
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="pdf">PDF Document (.pdf)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="row-limit-input" className="field-label">Row Limit (Max 10,000)</label>
              <input
                id="row-limit-input"
                type="number"
                className="field-input"
                value={rowLimit}
                max={10000}
                min={10}
                onChange={(e) => setRowLimit(e.target.value)}
              />
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={maskCustomer}
                  onChange={(e) => setMaskCustomer(e.target.checked)}
                />
                Mask Customer Identifiers
              </label>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={maskFinancial}
                  onChange={(e) => setMaskFinancial(e.target.checked)}
                />
                Mask Sensitive Financial Values
              </label>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
                Include report header metadata &amp; generation timestamp
              </label>
            </div>

            <div className="modal-actions-footer flex-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="btn-secondary-light">
                Cancel
              </button>
              <button type="submit" className="btn-primary-burgundy">
                Download Export File
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

