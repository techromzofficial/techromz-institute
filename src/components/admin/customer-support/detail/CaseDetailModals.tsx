'use client';

import React, { useState } from 'react';
import { X, Send, Plus, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. ADD INTERNAL NOTE MODAL
export function AddNoteModal({
  isOpen,
  onClose,
  onSubmitNote,
}: ModalBaseProps & { onSubmitNote: (text: string) => void }) {
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onSubmitNote(noteText);
    setNoteText('');
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-[#722140]" />
            <h2 className={styles.modalTitle}>Add Internal Note</h2>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Note Content (Internal Only)</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter confidential internal observations, supplier contact notes, or logistics updates..."
                className={styles.formTextarea}
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={!noteText.trim()} className={styles.btnPrimary}>
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. SEND CUSTOMER UPDATE MODAL
export function SendUpdateModal({
  isOpen,
  onClose,
  onSubmitUpdate,
}: ModalBaseProps & { onSubmitUpdate: (msg: string) => void }) {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmitUpdate(message);
    setMessage('');
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2">
            <Send size={18} className="text-[#722140]" />
            <h2 className={styles.modalTitle}>Send Customer Update</h2>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Message to Customer</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the message update to send to the customer via In-App Chat..."
                className={styles.formTextarea}
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={!message.trim()} className={styles.btnPrimary}>
              Send Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. ASSIGN AGENT MODAL
export function AssignAgentModal({
  isOpen,
  onClose,
  onAssign,
}: ModalBaseProps & { onAssign: (agentName: string, team: string, reason: string) => void }) {
  const [agentName, setAgentName] = useState('Amaya Perera');
  const [team, setTeam] = useState('Customer Operations');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(agentName, team, reason);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-[#722140]" />
            <h2 className={styles.modalTitle}>Assign / Reassign Case Owner</h2>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Support Agent</label>
              <select
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Amaya Perera">Amaya Perera (Customer Operations)</option>
                <option value="Dilan Perera">Dilan Perera (Logistics Support)</option>
                <option value="Nadeesha Silva">Nadeesha Silva (Supplier Ops)</option>
                <option value="Elena Vance">Elena Vance (Compliance Lead)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Assigned Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Customer Operations">Customer Operations</option>
                <option value="Logistics Support">Logistics Support</option>
                <option value="Supplier Management">Supplier Management</option>
                <option value="Compliance & Safety">Compliance & Safety</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reason for Reassignment</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter operational reason..."
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. MARK RESOLVED MODAL
export function MarkResolvedModal({
  isOpen,
  onClose,
  onResolve,
}: ModalBaseProps & { onResolve: (cat: string, sum: string, outcome: string) => void }) {
  const [category, setCategory] = useState('Dispatch Confirmed');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !outcome.trim() || !confirmed) return;
    onResolve(category, summary, outcome);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-700" />
            <h2 className={styles.modalTitle}>Mark Case as Resolved</h2>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Resolution Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Dispatch Confirmed">Dispatch Confirmed</option>
                <option value="Replacement Dispatched">Replacement Dispatched</option>
                <option value="Refund Issued">Refund Issued</option>
                <option value="Customer Clarification Provided">Customer Clarification Provided</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Resolution Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Summarize resolution steps taken..."
                className={styles.formTextarea}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Customer Outcome / Message</label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Final message communicated to customer..."
                className={styles.formInput}
                required
              />
            </div>

            <div className="flex items-center gap-2 mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
              <input
                type="checkbox"
                id="confirmResolvedCheck"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="rounded border-slate-300 text-[#722140]"
              />
              <label htmlFor="confirmResolvedCheck" className="font-semibold text-slate-800 cursor-pointer">
                I confirm that all investigation tasks are complete and customer update is sent.
              </label>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={!summary.trim() || !outcome.trim() || !confirmed} className={styles.btnPrimary}>
              Confirm Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. CLOSE CASE MODAL
export function CloseCaseModal({
  isOpen,
  onClose,
  onCloseCase,
}: ModalBaseProps & { onCloseCase: (reason: string) => void }) {
  const [reason, setReason] = useState('Customer confirmed issue is resolved.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onCloseCase(reason);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-slate-600" />
            <h2 className={styles.modalTitle}>Close Case</h2>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Closure Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter closure details and final confirmation..."
                className={styles.formTextarea}
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={!reason.trim()} className={styles.btnPrimary}>
              Close Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

