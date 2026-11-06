'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchCaseDetail, mutateSupportCase } from '@/services/api/customerSupportDetailService';
import { supportError } from '@/services/api/customerSupportService';
import { sanitizeInternalRedirect } from '@/lib/authRedirect';
import type { SupportCapabilities, SupportRecord } from '@/types/supportApi';
import { supportDependencies, supportLabel, supportPriorities } from '@/types/supportApi';
import { SupportRecordPicker } from './SupportRecordPicker';
import { SupportRelatedRecords } from './SupportRelatedRecords';
import { supportTime } from './SupportWorkspace';
import styles from '@/app/admin/customer-support/cases/page.module.css';
import detailStyles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';
import { CaseTabsBar } from './detail/CaseTabsBar';
import type { CaseTabType } from '@/types/customerSupportDetail';

function CaseWorkspace() {
  const params = useParams(); const search = useSearchParams(); const router = useRouter(); const pathname = usePathname();
  const uuid = String(params.caseId ?? '');
  const returnTo = sanitizeInternalRedirect(search.get('returnTo'), '/admin/customer-support/cases');
  const tab = search.get('tab') ?? 'overview';
  const [record, setRecord] = useState<SupportRecord | null>(null);
  const [caps, setCaps] = useState<SupportCapabilities>({});
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const [revision, setRevision] = useState(0);
  const [agent, setAgent] = useState('');
  const [drafts, setDrafts] = useState({ reply: '', note: '' });
  const draftKind = tab === 'internal-notes' ? 'note' : 'reply';
  const draft = drafts[draftKind];
  const setDraft = (value: string) => setDrafts(previous => ({ ...previous, [draftKind]: value }));
  const [links, setLinks] = useState<Record<string, string>>({});
  const attempt = useRef<{ payload: string; key: string }>();
  useEffect(() => { setDrafts({ reply: '', note: '' }); setLinks({}); setAgent(''); attempt.current = undefined; }, [uuid]);
  useEffect(() => {
    let current = true; setLoading(true); setError('');
    fetchCaseDetail(uuid).then(result => { if (current) { setRecord(result.data); setCaps(result.capabilities); } })
      .catch(cause => { if (current) { setRecord(null); setCaps({}); setError(supportError(cause)); } })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [uuid, revision]);
  function selectTab(value: string) { const next = new URLSearchParams(search.toString()); next.set('tab', value); router.replace(`${pathname}?${next}`, { scroll: false }); }
  async function mutate(action: string, input: Record<string, unknown>) {
    if (!record || busy) return;
    setBusy(true); setError('');
    try {
      const result = await mutateSupportCase(uuid, action, record.version, input);
      setRecord(result.data);
      if (action === 'reply' || action === 'note') { setDrafts(previous => ({ ...previous, [action]: '' })); attempt.current = undefined; }
      toast.success(action === 'reply' ? 'Reply persisted. External delivery is pending.' : 'Case updated');
    } catch (cause) { setError(supportError(cause)); }
    finally { setBusy(false); }
  }
  function submit(event: React.FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault(); const input: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    if (action === 'assign') input.agent_uuid = agent;
    if (action === 'update') Object.assign(input, Object.fromEntries(Object.entries(links).map(([kind, value]) => [kind === 'supplier' ? 'supplier_id' : `${kind}_uuid`, value || null])));
    if (action === 'reply' || action === 'note') {
      input.body = draft;
      const payload = JSON.stringify({ action, body: draft });
      if (attempt.current?.payload !== payload) attempt.current = { payload, key: crypto.randomUUID() };
      input.idempotency_key = attempt.current!.key;
    }
    void mutate(action, input);
  }
  const tabs = ['overview', 'conversation', 'customer-context', 'related-records', 'evidence', 'investigation', 'sla-escalation', 'resolution', ...(caps['support.case.note'] ? ['internal-notes'] : []), 'communications', 'operational-issues', 'audit-history'];
  return <div className={detailStyles.screen17Page}>
    <header className={detailStyles.caseHeader}><nav className={detailStyles.breadcrumbNav} aria-label="Breadcrumb"><Link href={returnTo}>Customer Support</Link> / Case detail</nav><div className={styles.headerTop}><div><h1 className={detailStyles.caseTitle}>{record?.subject ?? 'Case detail'}</h1><p className="mt-1 break-all text-xs text-slate-500">{record?.reference}</p></div><div className={styles.actionRow}><Link className={styles.btnSecondary} href={returnTo}>Back to queue</Link><button className={styles.btnSecondary} disabled={busy || loading} onClick={() => setRevision(value => value + 1)}>Refresh</button></div></div></header>
    {error && <p role="alert" className="my-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error} <button className={styles.btnSecondary} onClick={() => setRevision(value => value + 1)} disabled={busy}>Refresh record</button></p>}
    {loading && <p role="status" className="p-4">Loading case…</p>}
    {record && <>
      <section className={`${styles.rightCard} mb-3`} aria-label="Case identity"><div className="flex flex-wrap gap-5 text-sm"><span><strong>Status:</strong> {supportLabel(record.status)}</span><span><strong>Priority:</strong> {supportLabel(record.priority)}</span><span><strong>Customer:</strong> {record.customer.name ?? 'Unavailable'}</span><span><strong>Agent:</strong> {record.assignee?.name ?? 'Unassigned'}</span><span><strong>Channel:</strong> {supportLabel(record.channel)}</span></div>{record.restricted && <p className="mt-2 text-sm text-red-700">Restricted safety complaint · critical priority</p>}{record.escalated_at && <p className="mt-2 text-xs">Escalated {supportTime(record.escalated_at)} · {record.dependency ?? 'Dependency not set'}</p>}</section>
      <CaseTabsBar activeTab={tab as CaseTabType} onSelectTab={selectTab} canViewNotes={Boolean(caps['support.case.note'])} counts={{ messages: record.messages?.length, internalNotes: record.notes?.length, auditEvents: record.history?.length }} />
      <div className={styles.pageLayout}><main className={styles.mainSection} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'overview' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Case overview</h2><p className="whitespace-pre-wrap text-sm">{record.description}</p><dl className="my-3 grid grid-cols-2 gap-2 text-xs"><dt>Category</dt><dd>{supportLabel(record.category)}</dd><dt>Severity</dt><dd>{record.severity ?? 'Not classified'}</dd><dt>Created</dt><dd>{supportTime(record.created_at)}</dd><dt>Reopened</dt><dd>{record.reopen_count} times</dd><dt>Resolution</dt><dd>{record.resolution ?? 'Not resolved'}</dd></dl>
          {caps['support.case.update'] && <details><summary className="cursor-pointer text-sm font-semibold">Edit permitted details</summary><form onSubmit={event => submit(event, 'update')}><fieldset disabled={busy || loading} className="mt-3 space-y-3">
            <label className={styles.formGroup}>Subject<input name="subject" defaultValue={record.subject} required minLength={3} maxLength={240} className={styles.formInput} /></label>
            <label className={styles.formGroup}>Description<textarea name="description" defaultValue={record.description} required minLength={3} maxLength={10000} className={styles.formTextarea} /></label>
            <div className={styles.formGrid}><label>Priority<select name="priority" defaultValue={record.priority} className={styles.formSelect} disabled={record.restricted}>{supportPriorities.map(value => <option key={value}>{value}</option>)}</select></label><label>Dependency<select name="dependency" defaultValue={record.dependency ?? ''} className={styles.formSelect}><option value="">None</option>{supportDependencies.map(value => <option key={value}>{value}</option>)}</select></label><label>Severity<select name="severity" defaultValue={record.severity ?? ''} className={styles.formSelect}><option value="">Unclassified</option>{['low', 'medium', 'high', 'critical'].map(value => <option key={value}>{value}</option>)}</select></label></div>
            <details><summary>Update record links</summary><p className="my-2 text-xs">Only changed links are submitted. Clearing a selected link removes it; customer ownership cannot be changed.</p><div className={styles.formGrid}>{['order', 'payment', 'shipment', 'return', 'refund', 'product', 'variant', 'supplier'].map(kind => <SupportRecordPicker key={kind} kind={kind} label={supportLabel(kind)} value={links[kind] ?? record.context?.[kind]?.reference_id ?? ''} onChange={value => setLinks(previous => ({ ...previous, [kind]: value }))} />)}</div></details>
            <label className={styles.formGroup}>Audit reason<input name="reason" required minLength={3} maxLength={2000} className={styles.formInput} /></label><button className={styles.btnPrimary}>Save changes</button>
          </fieldset></form></details>}
        </section>}
        {(tab === 'conversation' || (tab === 'internal-notes' && caps['support.case.note'])) && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>{tab === 'internal-notes' ? 'Internal notes — staff only' : 'Customer conversation'}</h2>
          <p className="mb-3 text-xs text-slate-500">Latest 200 stored messages/notes. {tab === 'conversation' && 'External delivery and inbound providers are not configured. Pending does not mean delivered.'}</p>
          {(tab === 'internal-notes' ? record.notes : record.messages)?.map(message => <article className="mb-3 rounded border border-slate-200 p-3" key={message.uuid}><p className="text-xs font-semibold">{message.author} · {supportTime(message.created_at)}</p><p className="my-2 whitespace-pre-wrap break-words text-sm">{message.body}</p><p className="text-xs text-slate-500">{message.direction} · {message.delivery_status}{message.read_at ? ` · Read ${supportTime(message.read_at)}` : ' · No read receipt'}</p></article>)}
          {!(tab === 'internal-notes' ? record.notes : record.messages)?.length && <p className="my-3 text-sm text-slate-500">No {tab === 'internal-notes' ? 'internal notes' : 'messages'} recorded.</p>}
          {caps[tab === 'internal-notes' ? 'support.case.note' : 'support.case.reply'] && <form onSubmit={event => submit(event, tab === 'internal-notes' ? 'note' : 'reply')}><fieldset disabled={busy || loading}><label className={styles.formGroup}>{tab === 'internal-notes' ? 'Internal note' : 'Reply'}<textarea required maxLength={10000} rows={5} value={draft} onChange={event => setDraft(event.target.value)} className={styles.formTextarea} /></label><button className={`${styles.btnPrimary} mt-2`}>{busy ? 'Saving…' : tab === 'internal-notes' ? 'Add internal note' : 'Persist reply (delivery pending)'}</button></fieldset></form>}
          <p className="mt-3 text-xs text-slate-500">Attachments and delivery retries are unavailable until a private evidence store and delivery provider are integrated.</p>
        </section>}
        {tab === 'related-records' && <SupportRelatedRecords record={record} />}
        {tab === 'audit-history' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Audit and assignment history</h2><p className="mb-3 text-xs">Latest 200 events. Operational records cannot be deleted from this workspace.</p>{record.history?.map(event => <article key={event.uuid} className="mb-3 border-b pb-3"><p className="text-sm font-semibold">{supportLabel(event.action)} · {event.actor}</p><p className="text-xs text-slate-500">{supportTime(event.created_at)}</p><p className="whitespace-pre-wrap text-sm">{event.reason}</p></article>)}</section>}
        {tab === 'customer-context' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Customer context</h2><p>{record.customer.name ?? 'Name unavailable'}</p><p className="break-all text-xs">{record.customer.uuid}</p><p className="mt-2 text-xs">Contact and sensitive customer data are not exposed by the support API.</p></section>}
        {tab === 'sla-escalation' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>SLA & escalation</h2><p>{record.sla.reason}</p><p className="mt-2 text-sm">{record.escalated_at ? `Escalated ${supportTime(record.escalated_at)} to ${record.dependency}` : 'No escalation recorded.'}</p></section>}
        {tab === 'resolution' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Resolution workspace</h2><p className="whitespace-pre-wrap">{record.resolution ?? 'No resolution recorded. Use the lifecycle controls to record an outcome and resolve this case.'}</p><p className="mt-2 text-xs">Status: {supportLabel(record.status)} · Reopened {record.reopen_count} times</p></section>}
        {tab === 'communications' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Communications</h2><p className="text-sm">Channel: {supportLabel(record.channel)}. External delivery is not configured. Stored pending replies can be reviewed in Conversation.</p></section>}
        {tab === 'operational-issues' && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Operational issues</h2><p className="text-sm">Dependency: {record.dependency ?? 'None recorded'}. This case does not modify source payment, refund, or delivery status.</p><button className={`${styles.btnSecondary} mt-2`} onClick={() => selectTab('related-records')}>View linked records</button></section>}
        {['evidence', 'investigation'].includes(tab) && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>{tab === 'evidence' ? 'Evidence & attachments' : 'Investigation'}</h2><p className="text-sm">{tab === 'evidence' ? 'Private evidence storage and scanning are not integrated. Upload is unavailable; do not place private customer evidence in the public upload service.' : 'Investigation checklists are not integrated. Authorized staff can record findings in Internal Notes; note text is not customer-visible.'}</p></section>}
        {!tabs.includes(tab) && <section className={styles.rightCard}><p>This section is unavailable. Select an available case section above.</p></section>}
      </main><aside className={styles.rightRail}>
        <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Assignment & SLA</h2><p className="text-xs">{record.assignee?.name ?? 'Unassigned'}</p><p className="mt-2 text-xs text-slate-500">{record.sla.reason}</p>
          {caps['support.case.assign'] && !['resolved', 'closed'].includes(record.status) && <form className="mt-3" onSubmit={event => submit(event, 'assign')}><fieldset disabled={busy || loading}><SupportRecordPicker kind="agent" label="Agent" value={agent} onChange={setAgent} required /><label className={styles.formGroup}>Assignment reason<input name="reason" required minLength={3} maxLength={2000} className={styles.formInput} /></label><button className={`${styles.btnPrimary} mt-2`}>Assign agent</button></fieldset></form>}
        </section>
        {caps['support.case.transition'] && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Case lifecycle</h2><form onSubmit={event => submit(event, 'transition')}><fieldset disabled={busy || loading}><label className={styles.formGroup}>Next status<select key={record.status} name="status" className={styles.formSelect}>{record.allowed_transitions.map(value => <option key={value} value={value}>{supportLabel(value)}</option>)}</select></label><label className={styles.formGroup}>Outcome / reason<textarea name="reason" required minLength={3} maxLength={2000} className={styles.formTextarea} /></label><p className="my-2 text-xs">Assign an agent before moving an open case forward. Resolution and reopening require an audit reason.</p><button className={styles.btnPrimary}>Apply transition</button></fieldset></form></section>}
        {caps['support.case.escalate'] && !['resolved', 'closed'].includes(record.status) && <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Escalate case</h2><form onSubmit={event => submit(event, 'escalate')}><fieldset disabled={busy || loading}><label className={styles.formGroup}>Responsible domain<select name="dependency" className={styles.formSelect}>{supportDependencies.filter(value => value !== 'customer').map(value => <option key={value}>{value}</option>)}</select></label><label className={styles.formGroup}>Escalation reason<textarea name="reason" required minLength={3} maxLength={2000} className={styles.formTextarea} /></label><button className={`${styles.btnPrimary} mt-2`}>Record escalation</button></fieldset></form></section>}
      </aside></div>
    </>}
  </div>;
}
export function SupportCaseWorkspace() { return <Suspense fallback={<p role="status" className="p-4">Loading case…</p>}><CaseWorkspace /></Suspense>; }
