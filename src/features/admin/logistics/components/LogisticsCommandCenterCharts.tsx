"use client";

import { Bar, BarChart, CartesianGrid, Cell, Label, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LogisticsCommandCenterResponse } from "@/lib/api/logistics";

const colors = ["#166534", "#2563eb", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#be123c", "#64748b"];
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

function EmptyChart({ message }: { message: string }) {
  return <div className="grid h-[280px] place-items-center px-6 text-center text-sm text-muted">{message}</div>;
}

export function LogisticsCommandCenterCharts({ analytics }: { analytics: LogisticsCommandCenterResponse["analytics"] }) {
  const distribution = analytics.shipment_status_distribution.map((item) => ({ ...item, label: label(item.status) }));
  const hasTrend = analytics.shipment_trend.some((item) => item.created > 0 || item.delivered > 0);
  const hasDistribution = distribution.some((item) => item.count > 0);

  return (
    <section aria-label="Logistics analytics" className="grid gap-6 xl:grid-cols-12">
      <article className="rounded-xl border border-line bg-white shadow-sm xl:col-span-5">
        <header className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Fulfilment &amp; Delivery Trend</h2><p className="mt-1 text-xs text-muted">Shipment creation and delivery over the last 30 days</p></header>
        {hasTrend ? <div className="h-[280px] min-w-0 p-4" data-testid="shipment-trend-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.shipment_trend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/><XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={24}/><YAxis allowDecimals={false} tick={{ fontSize: 11 }}/><Tooltip/><Legend/><Line type="monotone" dataKey="created" name="Created" stroke="#2563eb" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="delivered" name="Delivered" stroke="#16a34a" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div> : <EmptyChart message="No shipment trend data is available for the last 30 days."/>}
      </article>
      <article className="rounded-xl border border-line bg-white shadow-sm xl:col-span-3">
        <header className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Logistics Status Distribution</h2><p className="mt-1 text-xs text-muted">Current persisted shipment states</p></header>
        {hasDistribution ? <div className="h-[280px] min-h-[280px] w-full min-w-0 p-4" data-testid="shipment-status-donut" aria-label={`${distribution.reduce((sum, item) => sum + item.count, 0)} Shipments`}><ResponsiveContainer width="100%" height="100%" minHeight={248}><PieChart><Pie data={distribution} dataKey="count" nameKey="label" innerRadius={52} outerRadius={82} paddingAngle={2}>{distribution.map((item, index) => <Cell key={item.status} fill={colors[index % colors.length]}/>)}<Label position="center" value={distribution.reduce((sum, item) => sum + item.count, 0)} className="fill-ink text-xl font-bold" /></Pie><Tooltip/><Legend verticalAlign="bottom" height={44}/></PieChart></ResponsiveContainer></div> : <EmptyChart message="No shipment status data is available."/>}
      </article>
      <article className="rounded-xl border border-line bg-white shadow-sm xl:col-span-4">
        <header className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Operational Status Summary</h2><p className="mt-1 text-xs text-muted">Shipment workload by persisted status</p></header>
        {hasDistribution ? <div className="h-[280px] min-w-0 p-4" data-testid="operational-status-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution} layout="vertical" margin={{ top: 4, right: 18, left: 28, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="label" width={92} tick={{ fontSize: 10 }}/><Tooltip/><Bar dataKey="count" name="Shipments" radius={[0, 4, 4, 0]}>{distribution.map((item, index) => <Cell key={item.status} fill={colors[index % colors.length]}/>)}</Bar></BarChart></ResponsiveContainer></div> : <EmptyChart message="No operational status data is available."/>}
      </article>
    </section>
  );
}
