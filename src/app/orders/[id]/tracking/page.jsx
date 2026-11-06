'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Package,
  Truck,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { checkoutApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

function StatusIcon({ status }) {
  if (status === 'complete') return <CheckCircle2 size={13} />;
  if (status === 'current') return <Clock size={13} />;
  return <Package size={13} />;
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkoutApi.tracking(id)
      .then((response) => setOrder(response.order))
      .catch((requestError) => setError(requestError.message || 'Could not load tracking details.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">Order Tracking</h1>
            <p className="text-sm text-gray-400">Payment and delivery status</p>
          </div>
          {order?.id && (
            <Link href={`/orders/${order.id}`} className="flex items-center gap-0.5 text-xs text-primary-700 hover:underline">
              Order details <ExternalLink size={11} />
            </Link>
          )}
        </div>

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-36 rounded-2xl bg-gray-100" />
            <div className="h-72 rounded-2xl bg-gray-100" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle size={18} /> Tracking unavailable
            </div>
            <p className="mt-2">{error}</p>
          </div>
        )}

        {!loading && order && (
          <>
            <section className="rounded-2xl bg-primary-800 p-5 text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.04em] text-primary-100">Order Reference</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{order.order_number}</p>
                  <p className="mt-2 text-sm text-primary-100">{order.supplier?.name}</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold capitalize text-white">
                  {order.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-primary-100">Payment</p>
                  <p className="mt-1 text-sm font-semibold capitalize">{order.payment_status}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-primary-100">Fulfillment</p>
                  <p className="mt-1 text-sm font-semibold capitalize">{order.fulfillment_status || 'pending'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-primary-100">Total</p>
                  <p className="mt-1 text-sm font-semibold">{formatCurrency(Number(order.total_amount || 0), order.currency || 'LKR')}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                  <CreditCard size={16} className="text-primary-600" /> Payment
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-semibold text-gray-900">{order.payment?.method || order.payment_method}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold capitalize text-gray-900">{order.payment_status}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono text-xs text-gray-600">{order.payment?.payment_number || '-'}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                  <Truck size={16} className="text-primary-600" /> Shipment
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold capitalize text-gray-900">{order.shipment?.status || 'pending'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-semibold text-gray-900">{order.shipment?.shipping_method || 'Standard delivery'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ETA</span><span className="font-semibold text-gray-900">{order.shipment?.estimated_delivery_date || order.expected_delivery_date || '-'}</span></div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 font-semibold text-gray-800">
                <Truck size={15} className="text-primary-600" /> Timeline
              </h2>
              <div className="relative">
                <div className="absolute bottom-3 left-3.5 top-3 w-0.5 bg-gray-100" />
                <div className="space-y-4">
                  {(order.timeline || []).map((event) => (
                    <div key={`${event.key}-${event.timestamp || ''}`} className="relative flex gap-4">
                      <div className={`z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        event.status === 'complete'
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : event.status === 'current'
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-gray-200 bg-white text-gray-300'
                      }`}>
                        <StatusIcon status={event.status} />
                      </div>
                      <div className="flex-1 pb-4 last:pb-0">
                        <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-gray-500">{event.description}</p>
                        {event.timestamp && <p className="mt-1 text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                <Package size={15} className="text-primary-600" /> Items
              </h2>
              <div className="divide-y divide-gray-50">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qty {item.quantity} {item.unit}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(item.total_amount || item.amount || 0), order.currency || 'LKR')}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
