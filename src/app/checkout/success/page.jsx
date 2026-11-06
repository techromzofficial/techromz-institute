'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock, PackageCheck, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { checkoutApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const PAYMENT_LABELS = {
  card: 'Credit / Debit Card',
  bank_transfer: 'Bank Transfer',
  cod: 'Cash on Delivery',
};

function readLastOrder() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(sessionStorage.getItem('slb_last_order'));
  } catch {
    return null;
  }
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('order');
    const fallback = readLastOrder();

    if (!reference) {
      setOrder(fallback);
      setLoading(false);
      return;
    }

    checkoutApi.tracking(reference)
      .then((response) => {
        setOrder(response.order);
        sessionStorage.setItem('slb_last_order', JSON.stringify(response.order));
      })
      .catch((requestError) => {
        setOrder(fallback);
        setError(requestError.message || 'Could not refresh order details.');
      })
      .finally(() => setLoading(false));
  }, []);

  const item = order?.items?.[0];
  const paymentState = order?.payment?.recovery_required
    ? 'recovery_required'
    : order?.payment_status;
  const paymentConfirmed = paymentState === 'paid';
  const paymentFailed = paymentState === 'failed' || paymentState === 'cancelled';
  const paymentRequiresAction = paymentState === 'requires_action';
  const paymentRecoveryRequired = paymentState === 'recovery_required';

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            paymentConfirmed ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {paymentConfirmed ? <CheckCircle2 size={34} /> : <Clock size={34} />}
          </span>
          <h1 className="mt-5 text-3xl font-bold text-gray-950">
            {paymentConfirmed ? 'Order Confirmed' : 'Order Created'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {paymentConfirmed
              ? 'Thank you for shopping with SL Beauty Platform.'
              : paymentRecoveryRequired
                ? 'Payment was confirmed, but this order requires inventory recovery before fulfilment.'
                : paymentFailed
                  ? 'Payment was not completed. Reserved inventory has been released.'
                  : paymentRequiresAction
                    ? 'Your payment requires additional action. Track the order for instructions.'
                    : 'Your payment is pending authoritative confirmation.'}
          </p>

          {loading && (
            <div className="mt-8 space-y-3">
              <div className="mx-auto h-8 w-48 animate-pulse rounded bg-gray-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </div>
          )}

          {!loading && order ? (
            <div className="mt-8 text-left">
              <div className="rounded-2xl bg-primary-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-primary-700">Order Reference</p>
                <p className="mt-1 text-xl font-semibold text-primary-900">{order.order_number}</p>
              </div>

              <div className="mt-5 flex gap-4 rounded-2xl border border-gray-100 p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {item?.image && <Image src={item.image} alt={item.product_name} fill unoptimized className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-gray-900">{item?.product_name}</p>
                  <p className="mt-1 text-sm text-gray-500">{order.supplier?.name}</p>
                  <p className="text-sm text-gray-400">Qty {item?.quantity}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.03em] text-gray-400">Total</p>
                  <p className="mt-1 font-bold text-primary-800">{formatCurrency(Number(order.total_amount || 0), order.currency || 'LKR')}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.03em] text-gray-400">Payment</p>
                  <p className="mt-1 font-semibold text-gray-900">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                  <p className="text-gray-500">{order.payment_status}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.03em] text-gray-400">Order Status</p>
                  <p className="mt-1 font-semibold capitalize text-gray-900">{order.status}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.03em] text-gray-400">Delivery Address</p>
                  <p className="mt-1 font-semibold text-gray-900">{order.delivery_address?.address1}</p>
                  <p className="text-gray-500">{[order.delivery_address?.city, order.delivery_address?.province, order.delivery_address?.country].filter(Boolean).join(', ')}</p>
                </div>
              </div>

              {!paymentConfirmed && (
                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  {paymentRecoveryRequired
                    ? 'Do not retry payment. Operations must reconcile inventory or compensation safely.'
                    : paymentFailed
                      ? 'Payment failed or was cancelled. You may start a new checkout when ready.'
                      : 'Payment is not complete yet. Track this order for authoritative payment updates.'}
                </div>
              )}
            </div>
          ) : null}

          {!loading && !order && (
            <div className="mt-8 rounded-2xl border border-gray-100 p-6">
              <PackageCheck size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No order details were found for this checkout.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {order?.id && (
              <Link href={`/orders/${order.id}/tracking`} className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
                Track My Order
              </Link>
            )}
            <Link href="/products" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-800 px-5 text-sm font-semibold text-white transition hover:bg-primary-900">
              <ShoppingBag size={17} /> Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
