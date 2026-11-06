import { ChartCard } from '@/components/admin/shared/ChartCard';
import { DonutDistributionChart } from '@/components/admin/shared/DonutDistributionChart';
import { HorizontalStatusChart } from '@/components/admin/shared/HorizontalStatusChart';
import type { SupportDashboard, SupportFilters } from '@/types/supportApi';
import { supportLabel } from '@/types/supportApi';
import styles from '@/app/admin/customer-support/cases/page.module.css';

const colors = ['#722140', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
export function SupportSourceAnalytics({ dashboard, workspace, onFilter }: {
  dashboard: SupportDashboard; workspace: string; onFilter: (filters: SupportFilters) => void;
}) {
  return <>
    {workspace === 'complaints' && <ChartCard title="Complaint severity" subtitle="All matching complaints; unclassified is not estimated">
      <DonutDistributionChart totalLabel="Complaints" data={dashboard.severity.map((row, index) => ({ name: row.severity ? supportLabel(row.severity) : 'Unclassified', value: Number(row.count), color: colors[index % colors.length] }))} />
    </ChartCard>}
    {Object.entries(dashboard.sources ?? {}).map(([kind, source]) => <ChartCard key={kind} title={`${supportLabel(kind)} status`} subtitle="Distinct linked source records · current case filters">
      {!source.available ? <p className="text-xs text-slate-500">{source.reason}</p> : <>
        <DonutDistributionChart totalLabel="Records" data={(source.statuses ?? []).map((row, index) => ({ name: supportLabel(row.status), value: Number(row.count), color: colors[index % colors.length] }))} />
        <div className="mt-2 flex flex-wrap gap-2">{source.statuses?.map(row => <button key={row.status} className={styles.quickChip} onClick={() => onFilter({ source_kind: kind, source_status: row.status })}>Cases with {supportLabel(row.status)} {kind}</button>)}</div>
        {source.issues && <div className="mt-4"><h4 className="text-xs font-semibold">Most reported {kind === 'product' ? 'products' : 'suppliers'} (top 10)</h4>{source.issues.length ? <><HorizontalStatusChart data={source.issues.map((row, index) => ({ label: row.label, count: Number(row.count), percentage: Number(row.count) / source.issues!.reduce((sum, item) => sum + Number(item.count), 0) * 100, color: colors[index % colors.length] }))} total={source.issues.reduce((total, row) => total + Number(row.count), 0)} /><p className="mt-1 text-xs text-slate-500">Percentages use the displayed top-10 issue counts; unlinked cases and other source records are excluded.</p>{source.issues.map(row => <button key={row.id} className={`${styles.quickChip} mt-2`} onClick={() => onFilter({ [kind]: row.id })}>{row.label}: {row.count}</button>)}</> : <p className="text-xs">No linked issue records.</p>}</div>}
      </>}
    </ChartCard>)}
  </>;
}
