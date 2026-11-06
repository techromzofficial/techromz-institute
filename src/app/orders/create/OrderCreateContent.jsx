'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Package, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, quotationsApi } from '@/lib/api';
import toast from 'react-hot-toast';

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

export default function OrderCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  const {
    isAuthenticated,
    isBuyer,
    loading: authLoading,
  } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    const returnUrl = `/orders/create${quotationId ? `?quotationId=${quotationId}` : ''}`;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!isBuyer) {
      setError('Only the buyer who owns the accepted quotation can create this order.');
      setLoading(false);
      return;
    }

    if (!quotationId) {
      setError('Select an accepted quotation before creating an order.');
      setLoading(false);
      return;
    }

    const loadQuotation = async () => {
      try {
        const response = await quotationsApi.get(quotationId);

        if (response.status !== 'accepted') {
          throw new Error('Orders can only be created from accepted quotations.');
        }

        if (response.order_id) {
          router.replace(`/orders/${response.order_id}`);
          return;
        }

        setQuotation(response);
      } catch (err) {
        setError(err.message || 'Could not load the accepted quotation.');
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [authLoading, isAuthenticated, isBuyer, quotationId, router]);

  const handleCreateOrder = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await ordersApi.create(Number(quotationId));
      const orderId = response.order?.id || response.id;

      if (!orderId) {
        throw new Error('Order was created but no order ID was returned.');
      }

      toast.success('Order created successfully.');
      router.push(`/orders/${orderId}`);
    } catch (err) {
      setError(err.message || 'Could not create the order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || (!isAuthenticated && !error)) {
    return (
      <>
        <Header />
        <LoadingSpinner label="Loading accepted quotation…" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-5"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-600">{error}</p>
              <Link href="/orders" className="inline-block text-sm text-primary-700 hover:underline mt-2">
                View existing orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create Order</h1>
              <p className="text-sm text-gray-500 mt-1">
                Confirm the accepted quotation below. Order values are copied directly from the quotation.
              </p>
            </div>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-400 font-mono">{quotation.quotation_number}</div>
                  <h2 className="font-bold text-lg text-gray-800 mt-1">{quotation.rfq?.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Supplier: {quotation.supplier?.company_name || quotation.supplier?.name}
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs text-gray-400">Order total</div>
                  <div className="text-2xl font-bold text-primary-800">
                    {money(quotation.total_amount, quotation.currency)}
                  </div>
                  <span className="badge-pill bg-green-100 text-green-700 mt-1">Accepted</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Package size={17} className="text-primary-700" />
                  Quoted Items
                </h3>
                <div className="space-y-3">
                  {(quotation.items || []).map((item) => (
                    <div key={item.id} className="rounded-xl bg-gray-50 p-4 flex justify-between gap-4">
                      <div>
                        <div className="font-medium text-gray-800">{item.product_name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.quantity} × {money(item.unit_price, quotation.currency)}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {money(item.amount, quotation.currency)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100 text-sm">
                  <div>
                    <div className="text-xs text-gray-400">Payment terms</div>
                    <div className="text-gray-700 mt-1">{quotation.payment_terms || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Shipping terms</div>
                    <div className="text-gray-700 mt-1">{quotation.shipping_terms || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start gap-3">
              <Shield size={18} className="text-primary-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary-800">
                Creating the order locks in this accepted quotation’s supplier, items, prices, and trade terms.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={submitting}
              className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={17} />
              {submitting ? 'Creating order…' : 'Confirm and Create Order'}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
