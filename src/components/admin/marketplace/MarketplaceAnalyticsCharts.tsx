"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartDatum = { name: string; value: number };

const COLORS = ["#741d35", "#b7791f", "#2f855a", "#2b6cb0", "#805ad5", "#c05621", "#4a5568"];

function normalize(data: ChartDatum[]) {
  return data
    .map((item) => ({ name: item.name.replaceAll("_", " "), value: Number(item.value) || 0 }))
    .filter((item) => item.value > 0);
}

export function MarketplaceDistributionCharts({
  title,
  donutData,
  barData = donutData,
  totalLabel = "Total",
}: {
  title: string;
  donutData: ChartDatum[];
  barData?: ChartDatum[];
  totalLabel?: string;
}) {
  const donut = normalize(donutData);
  const bars = normalize(barData);
  const testIdPrefix = `marketplace-${title.replaceAll(" ", "-")}`;

  return (
    <section className="grid gap-4 lg:grid-cols-2" aria-label={`${title} analytics`}>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="font-semibold capitalize text-slate-950">{title} distribution</h2>
          <p className="text-xs text-slate-500">Persisted tenant-scoped records</p>
        </div>
        {donut.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-64 min-w-0" data-testid={`${testIdPrefix}-distribution`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
                  {donut.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="-mt-36 flex h-20 flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase text-slate-500">{totalLabel}</span>
            </div>
            <div className="mt-16 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
              {donut.map((item, index) => <span key={item.name}><i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{item.name} ({item.value})</span>)}
            </div>
          </div>
        )}
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="font-semibold capitalize text-slate-950">{title} status overview</h2>
          <p className="text-xs text-slate-500">Counts returned by the authoritative API</p>
        </div>
        {bars.length === 0 ? <EmptyChart /> : <div className="h-64 min-w-0" data-testid={`${testIdPrefix}-status`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
              <XAxis type="number" allowDecimals={false} tick={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#741d35" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>}
      </article>
    </section>
  );
}

function EmptyChart() {
  return <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">No persisted records available.</div>;
}
