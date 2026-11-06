'use client';
import { useEffect, useRef, useState } from 'react';
import { createSupportCase, supportError } from '@/services/api/customerSupportService';
import { supportCategories, supportChannels, supportIssueTypes, supportLabel, supportPriorities } from '@/types/supportApi';
import { SupportRecordPicker } from './SupportRecordPicker';
import styles from '@/app/admin/customer-support/cases/page.module.css';

export function SupportCaseIntake({ workspace, safetyAllowed, onClose, onCreated }: {
  workspace: string; safetyAllowed: boolean; onClose: () => void; onCreated: (uuid: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [customer, setCustomer] = useState('');
  const [links, setLinks] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const attempt = useRef<{ payload: string; key: string }>();
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const input = { ...fields, customer_uuid: customer, is_complaint: fields.is_complaint === 'on',
      ...Object.fromEntries(Object.entries(links).filter(([, value]) => value)) };
    const serialized = JSON.stringify(input);
    if (attempt.current?.payload !== serialized) attempt.current = { payload: serialized, key: crypto.randomUUID() };
    setBusy(true); setError('');
    try { const response = await createSupportCase({ ...input, idempotency_key: attempt.current!.key }); onCreated(response.data.uuid); }
    catch (cause) { setError(supportError(cause)); }
    finally { setBusy(false); }
  }
  const category = ({ 'returns-refunds': 'returns_refunds', 'order-delivery': 'order_delivery', 'product-supplier': 'product_quality', complaints: 'product_quality' } as Record<string, string>)[workspace] ?? 'general_inquiry';
  return <dialog ref={dialog} className={`${styles.modalCard} backdrop:bg-black/40`} onCancel={event => { if (busy) event.preventDefault(); else onClose(); }} aria-labelledby="support-intake-title">
    <form onSubmit={submit} className="flex min-h-0 flex-col">
      <header className={styles.modalHeader}><h2 id="support-intake-title" className={styles.modalTitle}>Create {workspace === 'complaints' ? 'complaint' : 'support case'}</h2><button type="button" className={styles.btnSecondary} onClick={onClose} disabled={busy}>Close</button></header>
      <fieldset disabled={busy} className={styles.modalBody}>
        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        <div className={styles.formGrid}>
          <SupportRecordPicker kind="customer" label="Customer" value={customer} required onChange={value => { setCustomer(value); setLinks({}); }} />
          <label className={styles.formGroup}>Subject<input name="subject" required minLength={3} maxLength={240} className={styles.formInput} /></label>
          <label className={styles.formGroup}>Category<select name="category" defaultValue={category} className={styles.formSelect}>{supportCategories.filter(value => safetyAllowed || value !== 'safety_concern').map(value => <option key={value} value={value}>{supportLabel(value)}</option>)}</select></label>
          <label className={styles.formGroup}>Channel<select name="channel" className={styles.formSelect}>{supportChannels.map(value => <option key={value} value={value}>{supportLabel(value)}</option>)}</select></label>
          <label className={styles.formGroup}>Priority<select name="priority" defaultValue="normal" className={styles.formSelect}>{supportPriorities.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className={styles.formGroup}>Severity<select name="severity" defaultValue="medium" className={styles.formSelect}>{['low', 'medium', 'high', 'critical'].map(value => <option key={value}>{value}</option>)}</select></label>
          <label><input type="checkbox" name="is_complaint" defaultChecked={workspace === 'complaints'} /> Complaint</label>
          <label className={styles.formGroup}>Issue classification<select name="issue_type" className={styles.formSelect}><option value="">Not classified</option>{supportIssueTypes.filter(value => safetyAllowed || value !== 'product_safety').map(value => <option key={value} value={value}>{supportLabel(value)}</option>)}</select></label>
          <label className={`${styles.formGroup} ${styles.formColSpan2}`}>Description<textarea name="description" required minLength={3} maxLength={10000} rows={4} className={styles.formTextarea} /></label>
        </div>
        <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold">Link existing business records (optional)</summary>
          <p className="my-2 text-xs text-slate-600">The server checks each link against the selected customer, order, and your permissions. Select an order before linking its payment, shipment, return, or refund.</p>
          <div className={styles.formGrid}>{['order', 'payment', 'shipment', 'return', 'refund', 'product', 'variant', 'supplier'].map(kind => <SupportRecordPicker key={`${kind}-${customer}`} kind={kind} label={supportLabel(kind)} value={links[kind === 'supplier' ? 'supplier_id' : `${kind}_uuid`] ?? ''} onChange={value => setLinks(previous => ({ ...previous, [kind === 'supplier' ? 'supplier_id' : `${kind}_uuid`]: value }))} />)}</div>
        </details>
        <p className="mt-3 text-xs text-slate-600">Safety concerns are restricted and set to critical priority. SLA and automatic routing are unavailable until policies are configured.</p>
      </fieldset>
      <footer className={styles.modalFooter}><button type="button" className={styles.btnSecondary} onClick={onClose} disabled={busy}>Cancel</button><button className={styles.btnPrimary} disabled={busy}>{busy ? 'Creating…' : 'Create case'}</button></footer>
    </form>
  </dialog>;
}
