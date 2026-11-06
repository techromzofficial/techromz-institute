'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { SaveSupportViewDto, SupportCaseFilterParams } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface SaveViewModalProps {
  isOpen: boolean;
  activeFilters: SupportCaseFilterParams;
  onClose: () => void;
  onSubmit: (dto: SaveSupportViewDto) => Promise<void>;
}

export function SaveViewModal({
  isOpen,
  activeFilters,
  onClose,
  onSubmit,
}: SaveViewModalProps) {
  const [viewName, setViewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) {
      setErrorMsg('View name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        name: viewName.trim(),
        filters: activeFilters,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save view.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} style={{ width: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Save Filter View</h2>
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
          <form id="save-view-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Preset View Name *</label>
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g. Critical Safety Complaints"
                className={styles.formInput}
                required
              />
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="save-view-form" className={styles.btnPrimary} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save View'}
          </button>
        </div>
      </div>
    </div>
  );
}

