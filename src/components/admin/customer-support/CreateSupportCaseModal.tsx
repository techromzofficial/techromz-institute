'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import type { SupportChannel, SupportPriority, CreateSupportCaseDto } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface CreateSupportCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateSupportCaseDto) => Promise<void>;
}

export function CreateSupportCaseModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSupportCaseModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [caseCategory, setCaseCategory] = useState('Delivery Issue');
  const [issueType, setIssueType] = useState('Shipment Not Dispatched');
  const [channel, setChannel] = useState<SupportChannel>('In-App Chat');
  const [priority, setPriority] = useState<SupportPriority>('Normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedOrderId, setRelatedOrderId] = useState('');
  const [relatedReturnId, setRelatedReturnId] = useState('');
  const [relatedShipmentId, setRelatedShipmentId] = useState('');
  const [relatedProductName, setRelatedProductName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('Tier 1 Support');
  const [assignedAgent, setAssignedAgent] = useState('Unassigned');
  const [slaTarget, setSlaTarget] = useState('24 Hours');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Customer Name is required.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Subject is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Case Description is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        customerName: customerName.trim(),
        customerId: customerId.trim() || undefined,
        caseCategory,
        issueType,
        channel,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        relatedOrderId: relatedOrderId.trim() || undefined,
        relatedReturnId: relatedReturnId.trim() || undefined,
        relatedShipmentId: relatedShipmentId.trim() || undefined,
        relatedProductName: relatedProductName.trim() || undefined,
        supplierName: supplierName.trim() || undefined,
        assignedTeam,
        assignedAgent: assignedAgent.trim() || undefined,
        slaTarget,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create support case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create Support Case</h2>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', marginTop: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body / Form */}
        <form id="create-support-case-form" onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            {/* Row 1 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Elena Rodriguez"
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Customer ID</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. CUS-2026-01842"
                className={styles.formInput}
              />
            </div>

            {/* Row 2 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Case Category *</label>
              <select
                value={caseCategory}
                onChange={(e) => setCaseCategory(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Delivery Issue">Delivery Issue</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Product Safety">Product Safety</option>
                <option value="Return & Refund">Return & Refund</option>
                <option value="Authenticity">Authenticity</option>
                <option value="Supplier Issue">Supplier Issue</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Issue Type *</label>
              <input
                type="text"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                placeholder="e.g. Shipment Not Dispatched"
                className={styles.formInput}
                required
              />
            </div>

            {/* Row 3 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Channel *</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as SupportChannel)}
                className={styles.formSelect}
              >
                <option value="In-App Chat">In-App Chat</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Web Portal">Web Portal</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportPriority)}
                className={styles.formSelect}
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Row 4: Subject (Span 2) */}
            <div className={`${styles.formGroup} ${styles.formColSpan2}`}>
              <label className={styles.formLabel}>Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Summary of customer inquiry or complaint"
                className={styles.formInput}
                required
              />
            </div>

            {/* Row 5: Description (Span 2) */}
            <div className={`${styles.formGroup} ${styles.formColSpan2}`}>
              <label className={styles.formLabel}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of customer inquiry, order issue, or complaint details"
                className={styles.formTextarea}
                required
              />
            </div>

            {/* Row 6 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Related Order ID</label>
              <input
                type="text"
                value={relatedOrderId}
                onChange={(e) => setRelatedOrderId(e.target.value)}
                placeholder="e.g. ORD-2026-009021"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Related Return ID</label>
              <input
                type="text"
                value={relatedReturnId}
                onChange={(e) => setRelatedReturnId(e.target.value)}
                placeholder="e.g. RET-2026-045075"
                className={styles.formInput}
              />
            </div>

            {/* Row 7 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Related Shipment ID</label>
              <input
                type="text"
                value={relatedShipmentId}
                onChange={(e) => setRelatedShipmentId(e.target.value)}
                placeholder="e.g. SHP-2026-010293"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Related Product Name</label>
              <input
                type="text"
                value={relatedProductName}
                onChange={(e) => setRelatedProductName(e.target.value)}
                placeholder="e.g. Radiance Vitamin C Serum - 30 ml"
                className={styles.formInput}
              />
            </div>

            {/* Row 8 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Luxe Distribution Pvt Ltd"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned Team *</label>
              <select
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Tier 1 Support">Tier 1 Support</option>
                <option value="Tier 2 Support">Tier 2 Support</option>
                <option value="Finance Team">Finance Team</option>
                <option value="Logistics Ops">Logistics Ops</option>
                <option value="Safety & Compliance">Safety & Compliance</option>
              </select>
            </div>

            {/* Row 9 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned Agent</label>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className={styles.formSelect}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Amaya Perera">Amaya Perera</option>
                <option value="Dilan Perera">Dilan Perera</option>
                <option value="Nadeesha Silva">Nadeesha Silva</option>
                <option value="Elena Vance">Elena Vance</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>SLA Target *</label>
              <select
                value={slaTarget}
                onChange={(e) => setSlaTarget(e.target.value)}
                className={styles.formSelect}
              >
                <option value="4 Hours">4 Hours</option>
                <option value="12 Hours">12 Hours</option>
                <option value="24 Hours">24 Hours</option>
                <option value="48 Hours">48 Hours</option>
              </select>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>
            Cancel
          </button>

          <button
            type="submit"
            form="create-support-case-form"
            className={styles.btnPrimary}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Creating Case...</span>
              </>
            ) : (
              <span>Create Support Case</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

