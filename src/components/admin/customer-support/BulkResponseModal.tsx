'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { BulkResponseDto } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface BulkResponseModalProps {
  isOpen: boolean;
  selectedCaseIds: string[];
  onClose: () => void;
  onSubmit: (dto: BulkResponseDto) => Promise<void>;
}

export function BulkResponseModal({
  isOpen,
  selectedCaseIds,
  onClose,
  onSubmit,
}: BulkResponseModalProps) {
  const [template, setTemplate] = useState('status-update');
  const [message, setMessage] = useState(
    'Thank you for contacting SL Beauty Support. Your case is currently under review by our operations team, and we will update you within 4 hours.'
  );
  const [internalNote, setInternalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    if (val === 'status-update') {
      setMessage(
        'Thank you for contacting SL Beauty Support. Your case is currently under review by our operations team, and we will update you within 4 hours.'
      );
    } else if (val === 'logistics-delay') {
      setMessage(
        'We sincerely apologize for the delay in dispatching your package. We have contacted our logistics partner to expedite your delivery.'
      );
    } else if (val === 'refund-acknowledgement') {
      setMessage(
        'Your refund request has been received and escalated to our Finance team for verification. Please allow 1-2 business days for processing.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Response message cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        caseIds: selectedCaseIds,
        templateId: template,
        message: message.trim(),
        internalNote: internalNote.trim() || undefined,
      });
      onClose();
    } catch {
      setErrorMsg('Failed to send bulk response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} style={{ width: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Send Bulk Response</h2>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', marginTop: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className={styles.modalBody}>
          <p style={{ fontSize: '13px', color: '#475467', marginBottom: '14px' }}>
            Sending batch response to <strong style={{ color: '#722140' }}>{selectedCaseIds.length}</strong> customer support case(s).
          </p>

          <form id="bulk-response-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Response Template</label>
              <select
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className={styles.formSelect}
              >
                <option value="status-update">General Status Update</option>
                <option value="logistics-delay">Logistics Delay Notification</option>
                <option value="refund-acknowledgement">Refund Request Acknowledgement</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Customer Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className={styles.formTextarea}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Internal Operations Note</label>
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Optional internal note for audit trail"
                className={styles.formInput}
              />
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="bulk-response-form" className={styles.btnPrimary} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Response'}
          </button>
        </div>
      </div>
    </div>
  );
}

