'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Production', value: 'production' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_META = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  production: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  shipped: { icon: Truck, color: 'text-primary-700', bg: 'bg-primary-50' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

function money(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

export default function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await ordersApi.list(status ? { status } : {});
        setOrders(response.data || []);
      } catch (err) {
        setError(err.message || 'Could not load orders.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status]);

  if (loading) return <LoadingSpinner label="Loading your orders…" />;

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => router.push(`/orders${tab.value ? `?status=${tab.value}` : ''}`)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              status === tab.value
                ? 'border-primary-700 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-3" />
          <h2 className="text-gray-500 font-medium">No orders found</h2>
          <Link href="/dashboard" className="mt-3 inline-block text-sm text-primary-700 hover:underline">
            View RFQs and quotations →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const Icon = meta.icon;
            const firstItem = order.quotation?.items?.[0];

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center hover:border-primary-200 transition-colors"
              >
                <div className={`w-14 h-14 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Package size={24} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">{order.order_number}</span>
                    <span className={`badge-pill capitalize ${meta.bg} ${meta.color}`}>
                      <Icon size={11} />
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-gray-800 mt-1 line-clamp-1">
                    {order.rfq?.title || firstItem?.product_name || 'Trade order'}
                  </h3>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {order.supplier?.company_name || order.buyer?.name || 'Marketplace order'}
                    {' · '}
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 flex-shrink-0">
                  <div className="font-bold text-gray-800">
                    {money(order.total_amount, order.currency)}
                  </div>
                  <span className="text-xs text-primary-700 flex items-center gap-0.5">
                    View Order <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
