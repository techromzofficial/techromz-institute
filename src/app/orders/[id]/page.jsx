'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  FileText,
  Package,
  User,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api';

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

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/orders/${params.id}`)}`);
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await ordersApi.get(params.id);
        setOrder(response.order || response);
      } catch (err) {
        setError(err.message || 'Could not load this order.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [authLoading, isAuthenticated, params.id, router]);

  if (authLoading || loading || !isAuthenticated) {
    return (
      <>
        <Header />
        <LoadingSpinner label="Loading order…" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-5"
        >
          <ArrowLeft size={15} />
          Back to orders
        </Link>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-400 font-mono">Order</div>
                  <h1 className="text-2xl font-bold text-gray-800 mt-1">{order.order_number}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl font-bold text-primary-800">
                    {money(order.total_amount, order.currency)}
                  </div>
                  <span className="badge-pill bg-primary-50 text-primary-700 capitalize mt-1">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <User size={16} className="text-primary-700" />
                    Buyer
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{order.buyer?.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{order.buyer?.email}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Building2 size={16} className="text-primary-700" />
                    Supplier
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{order.supplier?.company_name}</div>
                  <div className="text-xs text-gray-400 mt-1">{order.supplier?.location}</div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FileText size={17} className="text-primary-700" />
                RFQ and Quotation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="text-xs text-gray-400">RFQ</div>
                  <Link href={`/rfq/${order.rfq_id}`} className="font-medium text-primary-700 hover:underline mt-1 block">
                    {order.rfq?.rfq_number}
                  </Link>
                  <div className="text-gray-600 mt-1">{order.rfq?.title}</div>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Quotation</div>
                  <div className="font-medium text-gray-800 mt-1">{order.quotation?.quotation_number}</div>
                  <div className="text-gray-600 mt-1">
                    {money(order.quotation?.total_amount, order.quotation?.currency)}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Package size={17} className="text-primary-700" />
                Order Items
              </h2>
              <div className="space-y-3">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="rounded-xl bg-gray-50 p-4 flex justify-between gap-4">
                    <div>
                      <div className="font-medium text-gray-800">{item.product_name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.quantity} × {money(item.unit_price, order.currency)}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {money(item.amount, order.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Payment terms</div>
                  <div className="text-gray-700 mt-1">{order.payment_terms || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Shipping terms</div>
                  <div className="text-gray-700 mt-1">{order.shipping_terms || 'Not specified'}</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
