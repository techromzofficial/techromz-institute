'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LifeBuoy, Plus, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChartCard } from '@/components/admin/shared/ChartCard';
import { TrendChart } from '@/components/admin/shared/TrendChart';
import { DonutDistributionChart } from '@/components/admin/shared/DonutDistributionChart';
import { HorizontalStatusChart } from '@/components/admin/shared/HorizontalStatusChart';
import { bulkSupportAction, exportSupportCases, exportSupportSelection, fetchSupportCases, fetchSupportDashboard, fetchSupportViews, saveSupportView, supportError, supportQuery } from '@/services/api/customerSupportService';
import { supportCategories, supportChannels, supportDependencies, supportIssueTypes, supportLabel, supportPriorities, supportStatuses } from '@/types/supportApi';
import type { SupportDashboard, SupportFilters, SupportList, SupportRecord, SupportView } from '@/types/supportApi';
import { SupportCaseIntake } from './SupportCaseIntake';
import { SupportRecordPicker } from './SupportRecordPicker';
import { SupportSourceAnalytics } from './SupportSourceAnalytics';
import styles from '@/app/admin/customer-support/cases/page.module.css';

const titles: Record<string, string> = { cases: 'Cases', 'support-operations': 'Command Center', conversations: 'Conversations', complaints: 'Complaints', 'returns-refunds': 'Returns & Refunds', 'order-delivery': 'Order & Delivery', 'product-supplier': 'Product & Supplier' };
const filterKeys = ['search', 'status', 'priority', 'category', 'channel', 'dependency', 'assignee', 'customer', 'order', 'product', 'supplier', 'issue_type', 'source_kind', 'source_status', 'escalated', 'reopened', 'created_from', 'created_to', 'metric', 'workspace', 'page', 'per_page', 'sort', 'direction'];
const colors = ['#722140', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const base = '/admin/customer-support';
export const supportTime = (value: string | null | undefined) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC' : 'Timestamp unavailable';

function Workspace({ workspace }: { workspace: string }) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const query = params.toString();
  const filters = useMemo(() => {
    const parsed = new URLSearchParams(query);
    const result: SupportFilters = Object.fromEntries(filterKeys.filter(key => parsed.get(key)).map(key => [key, parsed.get(key)!]));
    if (!['cases', 'support-operations'].includes(workspace)) result.workspace = workspace;
    return result;
  }, [query, workspace]);
  const [list, setList] = useState<SupportList | null>(null);
  const [dashboard, setDashboard] = useState<SupportDashboard | null>(null);
  const [error, setError] = useState(''); const [chartError, setChartError] = useState('');
  const [loading, setLoading] = useState(true); const [revision, setRevision] = useState(0);
  const [create, setCreate] = useState(false); const [selected, setSelected] = useState<string[]>([]);
  const [views, setViews] = useState<SupportView[]>([]); const [viewName, setViewName] = useState('');
  const [bulk, setBulk] = useState('assign'); const [agent, setAgent] = useState('');
  const [busy, setBusy] = useState(false); const [bulkResults, setBulkResults] = useState<string[]>([]);
  const replyAttempt = useRef<{ text: string; key: string }>();
  const caps = list?.capabilities ?? {};
  const bulkActions = [
    ...(caps['support.case.bulk_assign'] ? ['assign', 'update', 'transition'].filter(action => caps[`support.case.${action}`]) : []),
    ...(caps['support.case.bulk_reply'] && caps['support.case.reply'] ? ['reply'] : []),
  ];
  const bulkAllowed = bulkActions.join(',');
  useEffect(() => { if (bulkAllowed && !bulkAllowed.split(',').includes(bulk)) setBulk(bulkAllowed.split(',')[0]); }, [bulkAllowed, bulk]);
  const refresh = () => setRevision(value => value + 1);
  const navigate = useCallback((changes: SupportFilters) => {
    const next = { ...filters, ...changes };
    router.replace(`${pathname}?${supportQuery(next)}`, { scroll: false });
  }, [filters, pathname, router]);
  useEffect(() => {
    let current = true; setLoading(true); setError(''); setChartError(''); setList(null); setDashboard(null); setSelected([]);
    fetchSupportCases(filters).then(result => { if (current) setList(result); })
      .catch(cause => { if (current) setError(supportError(cause)); }).finally(() => { if (current) setLoading(false); });
    fetchSupportDashboard(filters).then(result => { if (current) setDashboard(result.data); })
      .catch(cause => { if (current) setChartError(supportError(cause)); });
    return () => { current = false; };
  }, [filters, revision]);
  useEffect(() => {
    let current = true;
    if (caps['support.saved_view.manage']) fetchSupportViews().then(result => { if (current) setViews(result.data); }).catch(cause => { if (current) toast.error(supportError(cause)); });
    else setViews([]);
    return () => { current = false; };
  }, [caps['support.saved_view.manage']]);
  function queue(changes: SupportFilters) {
    const next = { ...filters, ...changes, page: '1' };
    router.push(`${base}/cases?${supportQuery(next)}`);
  }
  const caseHref = (row: SupportRecord) => `${base}/cases/${row.uuid}?${supportQuery({ returnTo: `${pathname}?${query}`, ...(workspace === 'conversations' ? { tab: 'conversation' } : {}) })}`;
  async function exportCases(selection = false) {
    setBusy(true);
    try { const blob = selection ? await exportSupportSelection(selected) : await exportSupportCases(filters); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'support-cases.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (cause) { toast.error(supportError(cause)); } finally { setBusy(false); }
  }
  async function saveView(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try { setViews((await saveSupportView(viewName, filters)).data); setViewName(''); toast.success('View saved'); }
    catch (cause) { toast.error(supportError(cause)); } finally { setBusy(false); }
  }
  async function runBulk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setBulkResults([]);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const payload: Record<string, unknown> = { reason: fields.reason };
    if (bulk === 'assign') payload.agent_uuid = agent;
    if (bulk === 'update') payload.priority = fields.priority;
    if (bulk === 'transition') payload.status = fields.status;
    if (bulk === 'reply') {
      const text = String(fields.body);
      if (replyAttempt.current?.text !== text) replyAttempt.current = { text, key: crypto.randomUUID() };
      payload.body = text; payload.idempotency_key = replyAttempt.current!.key;
    }
    try {
      const items = list!.data.filter(row => selected.includes(row.uuid)).map(row => ({ uuid: row.uuid, expected_version: row.version }));
      const result = await bulkSupportAction(bulk, items, payload);
      if (result.data.every(item => item.success)) replyAttempt.current = undefined;
      setBulkResults(result.data.map(item => `${list!.data.find(row => row.uuid === item.uuid)?.reference ?? item.uuid}: ${item.success ? (bulk === 'reply' ? 'Persisted; delivery pending' : 'Updated') : item.message ?? `Failed (${item.status})`}`));
      refresh();
    } catch (cause) { setBulkResults([supportError(cause)]); } finally { setBusy(false); }
  }
  const metrics: { label: string; value: number | undefined; filter: SupportFilters }[] = [
    { label: 'Open cases', value: dashboard?.open, filter: { metric: 'open' } },
    { label: 'New today (UTC)', value: dashboard?.new_today, filter: { metric: 'new_today' } },
    { label: 'Unassigned', value: dashboard?.unassigned, filter: { metric: 'unassigned' } },
    { label: 'In progress', value: dashboard?.in_progress, filter: { metric: 'in_progress' } },
    { label: 'Waiting customer', value: dashboard?.waiting, filter: { metric: 'waiting' } },
    { label: 'Escalated', value: dashboard?.escalated, filter: { metric: 'escalated' } },
    { label: 'Critical', value: dashboard?.critical, filter: { metric: 'critical' } },
    { label: 'Resolved today (UTC)', value: dashboard?.resolved_today, filter: { metric: 'resolved_today' } },
  ];
  const selectFilters = { status: ['active', ...supportStatuses], priority: supportPriorities, category: supportCategories, channel: supportChannels, dependency: supportDependencies, issue_type: supportIssueTypes };
  return <div className={styles.pageContainer}>
    <header className={styles.pageHeader}>
      <nav className={styles.breadcrumbNav} aria-label="Breadcrumb"><Link href="/admin">Admin</Link> / Customer Support / {titles[workspace]}</nav>
      <div className={styles.headerTop}><div className={styles.titleBlock}><h1 className={styles.pageTitle}><LifeBuoy className={styles.titleIcon} size={24} />{titles[workspace]}</h1><p className={styles.pageDescription}>Customer Support workspace · live tenant records · dates and charts in UTC</p></div>
        <div className={styles.actionRow}><button className={styles.btnSecondary} onClick={refresh} disabled={loading}><RefreshCw size={14} />Refresh</button>
          {caps['support.export'] && <button className={styles.btnSecondary} onClick={() => exportCases()} disabled={busy}><Download size={14} />Export filtered cases</button>}
          {caps['support.case.create'] && <button className={styles.btnPrimary} onClick={() => setCreate(true)}><Plus size={14} />Create {workspace === 'complaints' ? 'complaint' : 'case'}</button>}</div>
      </div>
    </header>
    {error && <div role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <button className={styles.btnSecondary} onClick={refresh}>Retry</button></div>}
    <div className={`${styles.kpiGrid} mb-4`} aria-busy={!dashboard && !chartError}>{metrics.map(metric => <button key={metric.label} className={styles.kpiCard} disabled={!dashboard} onClick={() => queue(metric.filter)}><span className={styles.kpiValue}>{metric.value ?? '—'}</span><span className={styles.kpiLabel}>{metric.label}</span></button>)}</div>
    <div className={styles.pageLayout}><main className={styles.mainSection}>
      <section className={styles.filterCard} aria-label="Case filters">
        {(filters.metric || filters.source_status || filters.workspace || filters.product || filters.supplier) && <p className="mb-3 break-all text-xs text-slate-500">Applied drill-down: {Object.entries(filters).filter(([key]) => ['metric', 'source_status', 'source_kind', 'workspace', 'product', 'supplier'].includes(key)).map(([key, value]) => `${supportLabel(key)}: ${value}`).join(' · ')}. Clear filters to reset.</p>}
        <form key={query} onSubmit={event => { event.preventDefault(); navigate({ ...Object.fromEntries(new FormData(event.currentTarget)) as SupportFilters, page: '1' }); }}>
          <label className={styles.filterField}>Search cases<input name="search" defaultValue={filters.search} placeholder="Subject or case reference" maxLength={150} className={styles.searchInput} /></label>
          <div className={`${styles.filterGrid} mt-3`}>{Object.entries(selectFilters).map(([field, options]) => <label key={field} className={styles.filterField}>{supportLabel(field)}<select name={field} defaultValue={filters[field] ?? ''} className={styles.filterSelect}><option value="">All</option>{options.map(value => <option key={value} value={value}>{supportLabel(value)}</option>)}</select></label>)}
            <label className={styles.filterField}>Created from (UTC)<input type="date" name="created_from" defaultValue={filters.created_from} className={styles.formInput} /></label>
            <label className={styles.filterField}>Created to (UTC)<input type="date" name="created_to" defaultValue={filters.created_to} className={styles.formInput} /></label>
          </div>
          <details className="my-3 text-xs"><summary>More filters</summary><div className={styles.filterGrid}>
            {['customer', 'assignee', 'order'].map(field => <label key={field} className={styles.filterField}>{field === 'order' ? 'Order reference' : `${supportLabel(field)} UUID${field === 'assignee' ? ' or unassigned' : ''}`}<input name={field} defaultValue={filters[field]} className={styles.formInput} /></label>)}
            <label>Escalation<select name="escalated" defaultValue={filters.escalated ?? ''} className={styles.formSelect}><option value="">All</option><option value="1">Escalated</option><option value="0">Not escalated</option></select></label>
          </div><p className="mt-2">Team and SLA filters are unavailable: no support team or SLA policy configuration exists.</p></details>
          <div className={styles.actionRow}><button className={styles.btnPrimary}>Apply filters</button><button type="button" className={styles.btnSecondary} onClick={() => router.replace(pathname)}>Clear filters</button><label className="text-xs">Sort <select name="sort" defaultValue={filters.sort ?? 'updated_at'} className={styles.filterSelect}>{['updated_at', 'created_at', 'priority', 'status'].map(value => <option key={value} value={value}>{supportLabel(value)}</option>)}</select></label><select aria-label="Sort direction" name="direction" defaultValue={filters.direction ?? 'desc'} className={styles.filterSelect}><option value="desc">Descending</option><option value="asc">Ascending</option></select></div>
        </form>
        {caps['support.saved_view.manage'] && <form className={`${styles.actionRow} mt-3`} onSubmit={saveView}><label className="text-xs">Saved view <select className={styles.filterSelect} value="" onChange={event => { const view = views.find(item => item.uuid === event.target.value); if (view) router.replace(`${pathname}?${supportQuery(view.filters)}`); }}><option value="">Select view</option>{views.map(view => <option key={view.uuid} value={view.uuid}>{view.name}</option>)}</select></label><input aria-label="View name" value={viewName} onChange={event => setViewName(event.target.value)} required maxLength={100} className={styles.formInput} placeholder="Name these filters" /><button className={styles.btnSecondary} disabled={busy}>Save view</button></form>}
      </section>
      {selected.length > 0 && caps['support.export'] && <button className={styles.btnSecondary} disabled={busy} onClick={() => exportCases(true)}>Export {selected.length} selected cases</button>}
      {selected.length > 0 && bulkActions.length > 0 && <form className={styles.filterCard} onSubmit={runBulk}><h2 className="mb-2 text-sm font-semibold">{selected.length} selected cases</h2><fieldset disabled={busy}>
        <label>Bulk action<select className={styles.formSelect} value={bulk} onChange={event => setBulk(event.target.value)}>
          {caps['support.case.bulk_assign'] && caps['support.case.assign'] && <option value="assign">Assign</option>}
          {caps['support.case.bulk_assign'] && caps['support.case.update'] && <option value="update">Change priority</option>}
          {caps['support.case.bulk_assign'] && caps['support.case.transition'] && <option value="transition">Transition</option>}
          {caps['support.case.bulk_reply'] && caps['support.case.reply'] && <option value="reply">Queue response</option>}
        </select></label>
        {bulk === 'assign' && <SupportRecordPicker kind="agent" label="Agent" value={agent} onChange={setAgent} required />}
        {bulk === 'update' && <label>Priority<select name="priority" className={styles.formSelect}>{supportPriorities.map(value => <option key={value}>{value}</option>)}</select></label>}
        {bulk === 'transition' && <label>Target status<select name="status" className={styles.formSelect}>{supportStatuses.map(value => <option key={value}>{value}</option>)}</select></label>}
        {bulk === 'reply' ? <label>Response (external delivery pending)<textarea name="body" required maxLength={10000} className={styles.formTextarea} /></label> : <label>Audit reason<input name="reason" required minLength={3} maxLength={2000} className={styles.formInput} /></label>}
        <button className={`${styles.btnPrimary} mt-2`} disabled={busy}>Apply to selected cases</button>
      </fieldset></form>}
      {bulkResults.length > 0 && <section className={styles.rightCard} aria-live="polite"><h2>Bulk results</h2>{bulkResults.map((result, index) => <p key={index} className="break-all text-xs">{result}</p>)}</section>}
      <section className={styles.tableCard} aria-label="Support cases" aria-busy={loading}>
        <div className="flex items-center justify-between p-3"><h2 className="text-sm font-semibold">{workspace === 'conversations' ? 'Case conversations' : titles[workspace] === 'Command Center' ? 'Recent cases' : titles[workspace]}</h2><span className="text-xs">{list?.meta.total ?? '—'} matching cases</span></div>
        {loading ? <p role="status" className="p-6 text-sm">Loading support records…</p> : list && list.data.length === 0 ? <p className="p-6 text-sm">No cases match these filters.</p> : list && <div className={styles.tableScroll}><table className={styles.table}><thead><tr>{['Select', 'Case / Customer', 'Priority', 'Status', 'Category / Channel', 'Assigned agent', 'Updated (UTC)', 'Actions'].map(title => <th scope="col" key={title} className={styles.th}>{title === 'Select' ? <input type="checkbox" aria-label="Select all visible cases" checked={list.data.length > 0 && selected.length === list.data.length} onChange={event => setSelected(event.target.checked ? list.data.map(row => row.uuid) : [])} /> : title}</th>)}</tr></thead><tbody>{list.data.map(row => <tr key={row.uuid} className={styles.tr}>
          <td className={styles.td}><input type="checkbox" aria-label={`Select ${row.reference}`} checked={selected.includes(row.uuid)} onChange={event => setSelected(current => event.target.checked ? [...current, row.uuid] : current.filter(uuid => uuid !== row.uuid))} /></td>
          <td className={styles.td}><Link className="font-semibold text-[#722140]" href={caseHref(row)}>{row.subject}</Link><div className="max-w-[250px] break-all text-xs text-slate-500">{row.reference}</div><div>{row.customer.name ?? 'Customer name unavailable'}</div></td>
          <td className={styles.td}>{supportLabel(row.priority)}{row.restricted && <span className="block text-xs text-red-700">Restricted safety</span>}</td><td className={styles.td}>{supportLabel(row.status)}{row.escalated_at && <span className="block text-xs text-amber-800">Escalated</span>}</td>
          <td className={styles.td}>{supportLabel(row.category)}<div className="text-xs text-slate-500">{supportLabel(row.channel)}</div></td><td className={styles.td}>{row.assignee?.name ?? 'Unassigned'}</td><td className={styles.td}>{supportTime(row.updated_at)}</td><td className={styles.td}><Link className={styles.openCaseButton} href={caseHref(row)}>{workspace === 'conversations' ? 'Open conversation' : 'Open case'}</Link></td>
        </tr>)}</tbody></table></div>}
        {list && <div className={styles.paginationCard}><span className={styles.paginationInfo}>Page {list.meta.current_page} of {list.meta.last_page}</span><div className={styles.paginationControls}><label>Rows <select aria-label="Rows per page" value={filters.per_page ?? '25'} onChange={event => navigate({ per_page: event.target.value, page: '1' })}>{[10, 25, 50, 100].map(size => <option key={size}>{size}</option>)}</select></label><button className={styles.btnSecondary} disabled={list.meta.current_page <= 1} onClick={() => navigate({ page: String(list.meta.current_page - 1) })}>Previous</button><button className={styles.btnSecondary} disabled={list.meta.current_page >= list.meta.last_page} onClick={() => navigate({ page: String(list.meta.current_page + 1) })}>Next</button></div></div>}
      </section>
      <ChartCard title="Case activity trend" subtitle="Last 30 days · UTC · current filters" loading={!dashboard && !chartError} error={chartError} onRetry={refresh}><div className="h-[250px]">{dashboard?.trend.some(point => point.count || point.resolved || point.escalated) ? <TrendChart data={dashboard.trend.map(point => ({ date: point.date, Created: Number(point.count), Resolved: Number(point.resolved ?? 0), Escalated: Number(point.escalated ?? 0) }))} /> : <p className="text-sm text-slate-500">No case activity in this period.</p>}</div></ChartCard>
    </main><aside className={styles.rightRail} aria-label="Support analytics">
      <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Operations health</h2><p className="text-xs text-slate-600">SLA, CSAT, sentiment, and configured agent capacity are unavailable. No values or percentage changes are estimated.</p>{workspace === 'conversations' && <p className="mt-2 text-xs">External replies are persisted as pending. Delivery providers and inbound ingestion are not configured.</p>}{['returns-refunds', 'order-delivery', 'product-supplier'].includes(workspace) && <p className="mt-2 text-xs">Open a case to inspect authorized source records. Financial and logistics actions remain in their owning modules.</p>}</section>
      <ChartCard title="Case status distribution" loading={!dashboard && !chartError} error={chartError} onRetry={refresh}><DonutDistributionChart totalLabel="Cases" data={(dashboard?.statuses ?? []).map((row, index) => ({ name: supportLabel(row.status), value: Number(row.count), color: colors[index % colors.length] }))} /><div className="mt-2 flex flex-wrap gap-2">{dashboard?.statuses.map(row => <button key={row.status} className={styles.quickChip} onClick={() => queue({ status: row.status })}>{supportLabel(row.status)}: {row.count}</button>)}</div></ChartCard>
      <ChartCard title="Priority distribution" loading={!dashboard && !chartError} error={chartError} onRetry={refresh}>{dashboard?.priorities.length ? <><HorizontalStatusChart data={dashboard.priorities.map((row, index) => ({ label: supportLabel(row.priority), count: Number(row.count), percentage: dashboard.total ? Number(row.count) / dashboard.total * 100 : 0, color: colors[index % colors.length] }))} /><div className="mt-2 flex flex-wrap gap-2">{dashboard.priorities.map(row => <button key={row.priority} className={styles.quickChip} onClick={() => queue({ priority: row.priority })}>{supportLabel(row.priority)}</button>)}</div></> : <p className="text-xs">No matching cases.</p>}</ChartCard>
      <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Priority alerts</h2>{dashboard?.alerts.length ? dashboard.alerts.map(row => <Link key={row.uuid} href={caseHref(row)} className={styles.priorityAlertRow}>{row.subject} · {supportLabel(row.priority)}</Link>) : <p className="text-xs">{dashboard ? 'No active priority alerts.' : 'Alerts unavailable.'}</p>}</section>
      <section className={styles.rightCard}><h2 className={styles.rightCardTitle}>Agent workload</h2>{dashboard?.workload.length ? dashboard.workload.map(row => <button key={row.uuid} className={styles.quickQueueRow} onClick={() => queue({ status: 'active', assignee: row.uuid })}>{row.name}: {row.count} active cases</button>) : <p className="text-xs">{dashboard ? 'No assigned active cases.' : 'Workload unavailable.'}</p>}</section>
      <ChartCard title={workspace === 'complaints' ? 'Complaint categories' : 'Case mix'} loading={!dashboard && !chartError} error={chartError} onRetry={refresh}><DonutDistributionChart totalLabel="Cases" data={(dashboard?.categories ?? []).map((row, index) => ({ name: supportLabel(row.category), value: Number(row.count), color: colors[index % colors.length] }))} /><div className="flex flex-wrap gap-2">{dashboard?.categories.map(row => <button key={row.category} className={styles.quickChip} onClick={() => queue({ category: row.category })}>{supportLabel(row.category)}</button>)}</div></ChartCard>
      {dashboard && <SupportSourceAnalytics dashboard={dashboard} workspace={workspace} onFilter={changes => navigate({ ...changes, page: '1' })} />}
    </aside></div>
    {create && <SupportCaseIntake workspace={workspace} safetyAllowed={Boolean(caps['support.case.safety'])} onClose={() => setCreate(false)} onCreated={uuid => { setCreate(false); router.push(`${base}/cases/${uuid}`); }} />}
  </div>;
}
export function SupportWorkspace({ workspace }: { workspace: string }) {
  return <Suspense fallback={<p className="p-6" role="status">Loading Customer Support…</p>}><Workspace workspace={workspace} /></Suspense>;
}
