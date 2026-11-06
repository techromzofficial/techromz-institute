"use client";

import { Bar, BarChart, CartesianGrid, Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type LogisticsStatusDatum = { key: string; label?: string; count: number };

const COLORS = ["#166534", "#2563eb", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#be123c", "#64748b"];
const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function statusData(counts?: Record<string, number> | null): LogisticsStatusDatum[] {
  return Object.entries(counts ?? {}).map(([key, count]) => ({ key, label: titleCase(key), count: Number(count) || 0 }));
}

export function LogisticsStatusCharts({ data, noun, distributionTitle, summaryTitle }: { data: LogisticsStatusDatum[]; noun: string; distributionTitle: string; summaryTitle: string }) {
  const rows = data.filter((item) => Number.isFinite(item.count) && item.count > 0).map((item) => ({ ...item, label: item.label ?? titleCase(item.key) }));
  const total = rows.reduce((sum, item) => sum + item.count, 0);

  return (
    <section aria-label={`${noun} analytics`} className="grid items-stretch gap-6 lg:grid-cols-2">
      <article className="flex min-w-0 flex-col rounded-xl border border-line bg-white shadow-sm">
        <header className="shrink-0 border-b border-line px-5 py-4"><h2 className="font-semibold leading-5 text-ink">{distributionTitle}</h2><p className="mt-1 text-xs leading-5 text-muted">Real tenant records grouped by persisted status</p></header>
        {total ? <div className="h-[300px] min-h-[300px] w-full min-w-0 p-4" data-testid={`${noun}-status-donut`} aria-label={`${total} ${noun}`}><ResponsiveContainer width="100%" height="100%" minHeight={268}><PieChart><Pie data={rows} dataKey="count" nameKey="label" innerRadius={58} outerRadius={88} paddingAngle={2}>{rows.map((item, index) => <Cell key={item.key} fill={COLORS[index % COLORS.length]} />)}<Label position="center" value={total} className="fill-ink text-xl font-bold" /></Pie><Tooltip formatter={(value) => [Number(value), noun]} /><Legend verticalAlign="bottom" height={48} /></PieChart></ResponsiveContainer></div> : <div className="grid h-[300px] min-h-[300px] place-items-center px-6 text-center text-sm text-muted">No {noun.toLowerCase()} analytics available.</div>}
      </article>
      <article className="flex min-w-0 flex-col rounded-xl border border-line bg-white shadow-sm">
        <header className="shrink-0 border-b border-line px-5 py-4"><h2 className="font-semibold leading-5 text-ink">{summaryTitle}</h2><p className="mt-1 text-xs leading-5 text-muted">Operational workload from the same authoritative records</p></header>
        {total ? <div className="h-[300px] min-h-[300px] w-full min-w-0 p-4" data-testid={`${noun}-status-bars`}><ResponsiveContainer width="100%" height="100%" minHeight={268}><BarChart data={rows} layout="vertical" margin={{ top: 4, right: 20, left: 30, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10 }} /><Tooltip formatter={(value) => [Number(value), noun]} /><Bar dataKey="count" name={noun} radius={[0, 4, 4, 0]}>{rows.map((item, index) => <Cell key={item.key} fill={COLORS[index % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div> : <div className="grid h-[300px] min-h-[300px] place-items-center px-6 text-center text-sm text-muted">No operational status data available.</div>}
      </article>
    </section>
  );
}
