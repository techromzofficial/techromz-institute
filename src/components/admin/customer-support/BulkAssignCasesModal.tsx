'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { BulkAssignSupportCasesDto } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface BulkAssignCasesModalProps {
  isOpen: boolean;
  selectedCaseIds: string[];
  onClose: () => void;
  onSubmit: (dto: BulkAssignSupportCasesDto) => Promise<void>;
}

export function BulkAssignCasesModal({
  isOpen,
  selectedCaseIds,
  onClose,
  onSubmit,
}: BulkAssignCasesModalProps) {
  const [assignedAgentName, setAssignedAgentName] = useState('Amaya Perera');
  const [assignedTeam, setAssignedTeam] = useState('Logistics Support');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCaseIds.length === 0) {
      setErrorMsg('No cases selected for bulk assignment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        caseIds: selectedCaseIds,
        assignedAgentName,
        assignedTeam,
        reason,
      });
      onClose();
    } catch {
      setErrorMsg('Failed to assign cases.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} style={{ width: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Assign Cases</h2>
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
            Assigning <strong style={{ color: '#722140' }}>{selectedCaseIds.length}</strong> selected support case(s).
          </p>

          <form id="bulk-assign-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assign Agent</label>
              <select
                value={assignedAgentName}
                onChange={(e) => setAssignedAgentName(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Amaya Perera">Amaya Perera</option>
                <option value="Dilan Perera">Dilan Perera</option>
                <option value="Nadeesha Silva">Nadeesha Silva</option>
                <option value="Elena Vance">Elena Vance</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assign Team</label>
              <select
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Logistics Support">Logistics Support</option>
                <option value="Finance & Payments">Finance & Payments</option>
                <option value="Safety & Compliance">Safety & Compliance</option>
                <option value="Returns Operations">Returns Operations</option>
                <option value="Quality & Authenticity">Quality & Authenticity</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reason / Reassignment Note</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional reason for assignment change"
                className={styles.formInput}
              />
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="bulk-assign-form" className={styles.btnPrimary} disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign Cases'}
          </button>
        </div>
      </div>
    </div>
  );
}

