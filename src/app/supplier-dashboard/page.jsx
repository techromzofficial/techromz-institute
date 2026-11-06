'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, ShoppingCart, FileText, MessageSquare,
  TrendingUp, DollarSign, Eye, Star, ArrowUp, ArrowDown,
  Plus, ChevronRight, Bell, RefreshCw, Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatCurrency, initials } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

/* ── Mock dashboard data ─────────────────────────────── */
const MOCK_STATS = {
  revenue:         { value: 48200, change: +12.4, label: 'Revenue (USD)' },
  orders:          { value: 184,   change: +8.1,  label: 'Total Orders' },
  rfqs:            { value: 37,    change: +22.0, label: 'Active RFQs' },
  messages:        { value: 12,    change: -3,    label: 'Unread Messages' },
  product_views:   { value: 9240,  change: +31.2, label: 'Product Views' },
  conversion_rate: { value: '2.0%',change: +0.3,  label: 'Conversion Rate' },
  new_customers:   { value: 28,    change: +14,   label: 'New Customers' },
  avg_order:       { value: 261,   change: +5.2,  label: 'Avg Order Value' },
};

const MOCK_RECENT_ORDERS = [
  { id: 'ECL-20260621-001', buyer: 'Green World Trading Co., JP', product: 'BOPF Ceylon Tea 500g',   amount: 2400, status: 'Processing', date: '2026-06-21' },
  { id: 'ECL-20260619-002', buyer: 'Organic Market GmbH, DE',    product: 'Cinnamon Sticks 1Kg',    amount: 860,  status: 'Pending',    date: '2026-06-19' },
  { id: 'ECL-20260615-003', buyer: 'Silk Route LLC, AE',          product: 'Batik Sarong Mixed Set',  amount: 1540, status: 'Shipped',    date: '2026-06-15' },
  { id: 'ECL-20260610-004', buyer: 'Nature Direct, US',           product: 'Virgin Coconut Oil 5L',   amount: 3200, status: 'Delivered',  date: '2026-06-10' },
];

const MOCK_RECENT_RFQS = [
  { id: 'RFQ-8821', product: 'Ceylon Black Tea',      quantity: '500 Kg/month', buyer: 'Ahmed Al-Farsi, AE', received: '1h ago' },
  { id: 'RFQ-8815', product: 'Coconut Shell Charcoal', quantity: '2 Tons',     buyer: 'Kim Ji-won, KR',     received: '4h ago' },
  { id: 'RFQ-8801', product: 'Rubber Bands (Industrial)', quantity: '10,000 pcs', buyer: 'Marco Vitali, IT', received: '1d ago' },
];

const STATUS_COLORS = {
  Pending:    'bg-amber-50 text-amber-700',
  Processing: 'bg-blue-50 text-blue-700',
  Shipped:    'bg-primary-50 text-primary-700',
  Delivered:  'bg-green-50 text-green-700',
  Cancelled:  'bg-red-50 text-red-600',
};

/* ── Mini bar chart (pure CSS) ───────────────────────── */
const CHART_DATA = [40, 65, 48, 72, 55, 88, 74, 91, 83, 96, 78, 100];
const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];

function MiniBarChart() {
  return (
    <div className="flex items-end gap-1 h-24 mt-2">
      {CHART_DATA.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary-500 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ height: `${h}%` }}
            title={`${MONTHS[i]}: ${Math.round(h * 482)}$`}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────── */
function StatCard({ label, value, change, icon: Icon, color, bg }) {
  const up = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={17} className={color} />
        </div>
        <span className={`badge-pill text-[10px] ${up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">
        {typeof value === 'number' && label.includes('Revenue') ? formatCurrency(value) : value}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function unwrapData(response) {
  return response?.data || response || {};
}

function collection(response) {
  const payload = unwrapData(response);
  return Array.isArray(payload.data) ? payload.data : [];
}

function supplierStatsFromApi(response, rfqs = [], orders = []) {
  const payload = unwrapData(response);
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const avgOrder = orders.length ? Math.round(revenue / orders.length) : 0;

  return {
    revenue: { value: revenue, change: +12.4, label: 'Revenue (USD)' },
    orders: { value: payload.orders_count ?? orders.length, change: +8.1, label: 'Total Orders' },
    rfqs: { value: rfqs.length, change: +22.0, label: 'Active RFQs' },
    messages: { value: payload.messages_count ?? 0, change: -3, label: 'Unread Messages' },
    product_views: { value: 9240, change: +31.2, label: 'Product Views' },
    conversion_rate: { value: '2.0%', change: +0.3, label: 'Conversion Rate' },
    new_customers: { value: Math.max(orders.length, 1), change: +14, label: 'New Customers' },
    avg_order: { value: avgOrder || 261, change: +5.2, label: 'Avg Order Value' },
  };
}

function rfqRow(rfq) {
  return {
    id: rfq.rfq_number || `RFQ-${rfq.id}`,
    product: rfq.product_name || rfq.items?.[0]?.product_name || rfq.title,
    quantity: rfq.quantity && rfq.unit ? `${Number(rfq.quantity).toLocaleString()} ${rfq.unit}` : 'Quantity in RFQ',
    buyer: rfq.destination_country || 'Buyer',
    received: rfq.created_at ? new Date(rfq.created_at).toLocaleDateString() : 'Recently',
  };
}

function orderRow(order) {
  return {
    id: order.order_number || `ORD-${order.id}`,
    buyer: order.buyer?.company_name || order.buyer?.name || 'Buyer',
    product: order.items?.[0]?.product_name || order.rfq?.product_name || 'Marketplace order',
    amount: Number(order.total_amount || 0),
    status: String(order.status || 'Pending').replace(/^\w/, (letter) => letter.toUpperCase()),
    date: order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
  };
}

/* ── Main page ───────────────────────────────────────── */
export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [recentRfqs, setRecentRfqs] = useState(MOCK_RECENT_RFQS);
  const [recentOrders, setRecentOrders] = useState(MOCK_RECENT_ORDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardResponse, rfqResponse, orderResponse] = await Promise.all([
          api.get('/user/dashboard'),
          api.get('/supplier/rfqs'),
          api.get('/orders'),
        ]);
        const rfqs = collection(rfqResponse).slice(0, 3);
        const orders = collection(orderResponse).slice(0, 4);
        setStats(supplierStatsFromApi(dashboardResponse, rfqs, orders));
        setRecentRfqs(rfqs.length ? rfqs.map(rfqRow) : MOCK_RECENT_RFQS);
        setRecentOrders(orders.length ? orders.map(orderRow) : MOCK_RECENT_ORDERS);
      } catch {
        setStats(MOCK_STATS);
        setRecentRfqs(MOCK_RECENT_RFQS);
        setRecentOrders(MOCK_RECENT_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const s = stats || MOCK_STATS;

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ── */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {initials(user?.name || 'S')}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Supplier'} 👋</h1>
          <p className="text-primary-100 text-sm">{user?.company || 'SL Beauty Supplier'}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/supplier-dashboard/products/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-primary-800 text-xs font-semibold rounded-lg hover:bg-primary-50 transition-colors">
            <Plus size={13} /> Add Product
          </Link>
          <Link href="/supplier-dashboard/rfqs" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg hover:bg-white/30 transition-colors">
            <Bell size={13} /> {s.rfqs?.value || 0} RFQs
          </Link>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={s.revenue?.label}         value={s.revenue?.value}         change={s.revenue?.change}         icon={DollarSign}  color="text-green-600"   bg="bg-green-50" />
        <StatCard label={s.orders?.label}          value={s.orders?.value}          change={s.orders?.change}          icon={ShoppingCart} color="text-blue-600"    bg="bg-blue-50" />
        <StatCard label={s.product_views?.label}   value={s.product_views?.value}   change={s.product_views?.change}   icon={Eye}          color="text-purple-600"  bg="bg-purple-50" />
        <StatCard label={s.conversion_rate?.label} value={s.conversion_rate?.value} change={s.conversion_rate?.change} icon={TrendingUp}   color="text-amber-600"   bg="bg-amber-50" />
        <StatCard label={s.rfqs?.label}            value={s.rfqs?.value}            change={s.rfqs?.change}            icon={FileText}     color="text-rose-600"    bg="bg-rose-50" />
        <StatCard label={s.messages?.label}        value={s.messages?.value}        change={s.messages?.change}        icon={MessageSquare}color="text-primary-600" bg="bg-primary-50" />
        <StatCard label={s.new_customers?.label}   value={s.new_customers?.value}   change={s.new_customers?.change}   icon={Users}        color="text-indigo-600"  bg="bg-indigo-50" />
        <StatCard label={s.avg_order?.label}       value={s.avg_order?.value}       change={s.avg_order?.change}       icon={Star}         color="text-orange-600"  bg="bg-orange-50" />
      </div>

      {/* ── Revenue chart + recent RFQs ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-800">Revenue — Last 12 Months</h2>
            <span className="badge-pill bg-green-50 text-green-700 text-[11px]">
              <ArrowUp size={11} /> +12.4% YoY
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2">USD · hover bars for monthly total</p>
          <MiniBarChart />
          <div className="flex justify-between mt-1">
            {MONTHS.map((m) => (
              <span key={m} className="text-[9px] text-gray-400 flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        {/* Recent RFQs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">New RFQs</h2>
            <Link href="/supplier-dashboard/rfqs" className="text-xs text-primary-700 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentRfqs.map((rfq) => (
              <div key={rfq.id} className="border border-gray-100 rounded-lg p-3 hover:border-primary-200 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">{rfq.id}</span>
                  <span className="text-[10px] text-gray-400">{rfq.received}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-0.5 line-clamp-1">{rfq.product}</p>
                <p className="text-xs text-gray-500">{rfq.quantity} · {rfq.buyer}</p>
                <Link href={`/supplier-dashboard/rfqs`} className="mt-2 block text-center text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg py-1 transition-colors">
                  View & Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/supplier-dashboard/orders" className="text-xs text-primary-700 hover:underline flex items-center gap-0.5">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-400 font-medium">Order ID</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-medium">Buyer</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-medium hidden md:table-cell">Product</th>
                <th className="text-right pb-2 text-xs text-gray-400 font-medium">Amount</th>
                <th className="text-center pb-2 text-xs text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-xs font-mono text-gray-500">{order.id}</td>
                  <td className="py-3">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{order.buyer}</p>
                    <p className="text-[10px] text-gray-400">{order.date}</p>
                  </td>
                  <td className="py-3 text-xs text-gray-600 hidden md:table-cell line-clamp-1">{order.product}</td>
                  <td className="py-3 text-right text-sm font-semibold text-gray-800">{formatCurrency(order.amount)}</td>
                  <td className="py-3 text-center">
                    <span className={`badge-pill text-[10px] ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Product',    href: '/supplier-dashboard/products/new', icon: Plus,         color: 'bg-primary-50 text-primary-800' },
          { label: 'View Orders',    href: '/supplier-dashboard/orders',       icon: ShoppingCart,  color: 'bg-blue-50 text-blue-800' },
          { label: 'Check RFQs',     href: '/supplier-dashboard/rfqs',         icon: FileText,      color: 'bg-amber-50 text-amber-800' },
          { label: 'Messages',       href: '/supplier-dashboard/messages',     icon: MessageSquare, color: 'bg-rose-50 text-rose-800' },
        ].map((a) => (
          <Link key={a.href} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all ${a.color}`}>
            <a.icon size={22} />
            <span className="text-xs font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
