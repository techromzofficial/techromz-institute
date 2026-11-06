'use client';

import { useState } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Users, Eye, ShoppingCart, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const MONTHLY_REVENUE = [14200, 18900, 12400, 21300, 19800, 25600, 22100, 28900, 24300, 31200, 27800, 38100];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PRODUCT_PERF = [
  { name: 'BOPF Ceylon Tea 500g',        views: 9240, orders: 184, revenue: 22080, conv: '2.0%' },
  { name: 'Cinnamon Sticks 1Kg',          views: 5100, orders: 93,  revenue: 8370,  conv: '1.8%' },
  { name: 'Virgin Coconut Oil 5L',         views: 6800, orders: 72,  revenue: 15840, conv: '1.1%' },
  { name: 'Batik Sarong Mixed Set',        views: 3200, orders: 38,  revenue: 5700,  conv: '1.2%' },
  { name: 'Industrial Rubber Sheets',      views: 2100, orders: 29,  revenue: 3190,  conv: '1.4%' },
];

const BUYER_COUNTRIES = [
  { country: 'Japan',          buyers: 42, pct: 28 },
  { country: 'Germany',        buyers: 31, pct: 21 },
  { country: 'United States',  buyers: 28, pct: 19 },
  { country: 'UAE',            buyers: 19, pct: 13 },
  { country: 'South Korea',    buyers: 14, pct: 9 },
  { country: 'Other',          buyers: 15, pct: 10 },
];

const maxRevenue = Math.max(...MONTHLY_REVENUE);

function BarChart({ data, months, maxVal, color = '#155e2c' }) {
  return (
    <div className="flex items-end gap-1.5 h-32 mt-2">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all hover:opacity-80 cursor-default"
            style={{ height: `${(val / maxVal) * 100}%`, background: color }}
            title={`${months[i]}: ${formatCurrency(val)}`}
          />
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, color, bg }) {
  const up = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={17} className={color} />
        </div>
        <span className={`badge-pill text-[10px] ${up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {Math.abs(change)}%
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function SupplierAnalyticsPage() {
  const [period, setPeriod] = useState('12m');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Your performance at a glance</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {['1m', '3m', '6m', '12m'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(304700)} change={+18.4} icon={DollarSign} color="text-green-600"   bg="bg-green-50" />
        <StatCard label="Total Orders"  value="1,247"                  change={+12.1} icon={ShoppingCart} color="text-blue-600"  bg="bg-blue-50" />
        <StatCard label="Product Views" value="54,200"                 change={+24.3} icon={Eye}          color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="New Buyers"    value="284"                     change={+9.7}  icon={Users}        color="text-amber-600"  bg="bg-amber-50" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-gray-800">Monthly Revenue</h2>
          <span className="badge-pill bg-green-50 text-green-700 text-[11px]">
            <ArrowUp size={11} /> +18.4% vs last year
          </span>
        </div>
        <p className="text-xs text-gray-400">Jan 2026 – Dec 2026 (USD)</p>
        <BarChart data={MONTHLY_REVENUE} months={MONTHS} maxVal={maxRevenue} />
        <div className="flex justify-between mt-1">
          {MONTHS.map((m) => (
            <span key={m} className="text-[9px] text-gray-400 flex-1 text-center">{m}</span>
          ))}
        </div>
      </div>

      {/* Product performance + geo */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Product performance */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Product Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Product', 'Views', 'Orders', 'Revenue', 'Conv.'].map((h) => (
                    <th key={h} className="pb-2 text-xs text-gray-400 font-medium text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PRODUCT_PERF.map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 text-xs text-gray-700 font-medium pr-4 line-clamp-1 max-w-[160px]">{p.name}</td>
                    <td className="py-2.5 text-xs text-gray-500">{(p.views ?? 0).toLocaleString()}</td>
                    <td className="py-2.5 text-xs text-gray-500">{p.orders}</td>
                    <td className="py-2.5 text-xs font-semibold text-gray-800">{formatCurrency(p.revenue)}</td>
                    <td className="py-2.5">
                      <span className="badge-pill bg-green-50 text-green-700 text-[10px]">{p.conv}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyer countries */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Buyer Countries</h2>
          <div className="space-y-3">
            {BUYER_COUNTRIES.map((bc) => (
              <div key={bc.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 font-medium">{bc.country}</span>
                  <span className="text-xs text-gray-400">{bc.buyers} buyers · {bc.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${bc.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-primary-600" />
              <span className="text-xs text-gray-500">Most growth from <strong className="text-gray-700">South Korea</strong> (+43%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ growth */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-3">RFQ Activity — Last 6 Months</h2>
        <div className="grid grid-cols-6 gap-2">
          {[
            { month: 'Jan', received: 12, quoted: 8, won: 5 },
            { month: 'Feb', received: 18, quoted: 14, won: 9 },
            { month: 'Mar', received: 22, quoted: 18, won: 12 },
            { month: 'Apr', received: 28, quoted: 22, won: 16 },
            { month: 'May', received: 35, quoted: 29, won: 21 },
            { month: 'Jun', received: 41, quoted: 37, won: 28 },
          ].map((d) => (
            <div key={d.month} className="text-center">
              <div className="space-y-1 mb-2">
                <div className="text-[10px] text-gray-400">{d.received} rcvd</div>
                <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(d.quoted / d.received) * 100}%` }} />
                </div>
                <div className="text-[10px] text-gray-400">{d.quoted} quoted</div>
                <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(d.won / d.received) * 100}%` }} />
                </div>
                <div className="text-[10px] text-green-600 font-medium">{d.won} won</div>
              </div>
              <div className="text-[11px] font-medium text-gray-600">{d.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
