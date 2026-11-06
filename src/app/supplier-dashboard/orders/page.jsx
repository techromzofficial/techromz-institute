'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Download, ShoppingBag, CheckCircle2,
  Truck, Clock, XCircle, Package, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';
import toast from 'react-hot-toast';

const MOCK_ORDERS = [
  { id: 'ECL-20260621-001', buyer: 'Green World Trading, JP',     product: 'BOPF Ceylon Tea 500g',     qty: '200 Kg',   amount: 2400, status: 'Processing', date: '2026-06-21', paid: true },
  { id: 'ECL-20260619-002', buyer: 'Organic Market GmbH, DE',    product: 'Cinnamon Sticks 1Kg',     qty: '300 Kg',   amount: 860,  status: 'Pending',    date: '2026-06-19', paid: false },
  { id: 'ECL-20260615-003', buyer: 'Silk Route LLC, AE',          product: 'Batik Sarong Mixed Set',   qty: '60 pcs',   amount: 1540, status: 'Shipped',    date: '2026-06-15', paid: true },
  { id: 'ECL-20260610-004', buyer: 'Nature Direct, US',           product: 'Virgin Coconut Oil 5L',   qty: '100 units', amount: 3200, status: 'Delivered',  date: '2026-06-10', paid: true },
  { id: 'ECL-20260601-005', buyer: 'EcoGoods Pty, AU',            product: 'Ceylon Pepper Whole 1kg', qty: '200 Kg',   amount: 1800, status: 'Delivered',  date: '2026-06-01', paid: true },
  { id: 'ECL-20260520-006', buyer: 'Bio Natur GmbH, AT',          product: 'Organic Green Tea 200g',  qty: '500 pcs',  amount: 2200, status: 'Cancelled',  date: '2026-05-20', paid: false },
  { id: 'ECL-20260512-007', buyer: 'Gem Gallery SG, SG',          product: 'Blue Sapphire 3ct',       qty: '4 pcs',    amount: 1800, status: 'Delivered',  date: '2026-05-12', paid: true },
  { id: 'ECL-20260501-008', buyer: 'Rubber Solutions UK, UK',     product: 'Industrial Rubber Sheets', qty: '50 rolls', amount: 1100, status: 'Delivered',  date: '2026-05-01', paid: true },
];

const STATUS_META = {
  Pending:    { icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50',  nextStatus: 'Processing' },
  Processing: { icon: Package,      color: 'text-blue-600',  bg: 'bg-blue-50',   nextStatus: 'Shipped' },
  Shipped:    { icon: Truck,        color: 'text-primary-700', bg: 'bg-primary-50', nextStatus: 'Delivered' },
  Delivered:  { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50',  nextStatus: null },
  Cancelled:  { icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50',    nextStatus: null },
};

const STATUS_TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function SupplierOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [tab,     setTab]     = useState('All');
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/supplier/orders');
        setOrders(data.data || data);
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.buyer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search) || o.product.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'All' || o.status === tab;
    return matchSearch && matchTab;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const advanceStatus = async (id, nextStatus) => {
    if (!nextStatus) return;
    try {
      await api.patch(`/supplier/orders/${id}`, { status: nextStatus });
    } catch { /* continue */ }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: nextStatus } : o));
    toast.success(`Order marked as ${nextStatus}`);
  };

  const totals = {
    revenue:  orders.filter((o) => o.paid).reduce((s, o) => s + o.amount, 0),
    pending:  orders.filter((o) => o.status === 'Pending').length,
    shipping: orders.filter((o) => o.status === 'Shipped').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-lg font-bold text-green-700">{formatCurrency(totals.revenue)}</p>
          <p className="text-xs text-gray-400">Revenue Collected</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-lg font-bold text-amber-700">{totals.pending}</p>
          <p className="text-xs text-gray-400">Awaiting Action</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-lg font-bold text-primary-700">{totals.shipping}</p>
          <p className="text-xs text-gray-400">In Transit</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 overflow-x-auto">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-primary-700 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
              {t !== 'All' && (
                <span className="ml-1 text-[10px] text-gray-400">({orders.filter((o) => o.status === t).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, buyer, or product…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter <ChevronDown size={12} />
          </button>
        </div>

        {loading ? (
          <div className="p-4"><RowSkeleton rows={5} /></div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Order ID', 'Buyer', 'Product', 'Qty', 'Amount', 'Payment', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((order) => {
                  const meta = STATUS_META[order.status] || STATUS_META.Pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{order.buyer}</p>
                        <p className="text-[10px] text-gray-400">{order.date}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 line-clamp-1 max-w-[140px]">{order.product}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{order.qty}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge-pill text-[10px] ${order.paid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {order.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-pill text-[10px] ${meta.bg} ${meta.color}`}>
                          <Icon size={10} /> {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {meta.nextStatus && (
                            <button
                              onClick={() => advanceStatus(order.id, meta.nextStatus)}
                              className="px-2 py-1 text-[10px] bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors font-medium whitespace-nowrap"
                            >
                              Mark {meta.nextStatus}
                            </button>
                          )}
                          <Link href={`/orders/${order.id}`} className="px-2 py-1 text-[10px] border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > PER_PAGE && (
          <div className="px-4 pb-4">
            <Pagination currentPage={page} totalPages={Math.ceil(filtered.length / PER_PAGE)} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
