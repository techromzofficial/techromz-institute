'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, FileText, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { rfqApi } from '@/lib/api';
import QuotationWorkflow from './QuotationWorkflow';

export default function RFQDetailPage({ params }) {
  const router = useRouter();
  const {
    isAuthenticated,
    isBuyer,
    isSupplier,
    loading: authLoading,
  } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRfq = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (isBuyer) {
        setRfq(await rfqApi.get(params.id));
        return;
      }

      if (isSupplier) {
        setRfq(await rfqApi.supplierGet(params.id));
        return;
      }

      throw new Error('RFQ quotations are available to buyer and supplier accounts only.');
    } catch (err) {
      setError(err.message || 'Could not load this RFQ.');
    } finally {
      setLoading(false);
    }
  }, [isBuyer, isSupplier, params.id]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/rfq/${params.id}`)}`);
      return;
    }

    loadRfq();
  }, [authLoading, isAuthenticated, loadRfq, params.id, router]);

  if (authLoading || loading || !isAuthenticated) {
    return (
      <>
        <Header />
        <LoadingSpinner label="Loading RFQ…" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-5"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">{rfq.rfq_number}</div>
                    <h1 className="text-2xl font-bold text-gray-800">{rfq.title}</h1>
                  </div>
                  <span className={`badge-pill capitalize ${
                    rfq.status === 'open'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rfq.status}
                  </span>
                </div>
                {rfq.description && (
                  <p className="text-sm text-gray-600 mt-4 whitespace-pre-line">{rfq.description}</p>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-400">Destination</div>
                  <div className="text-sm font-medium text-gray-800 mt-1">{rfq.destination_country}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Expected delivery</div>
                  <div className="text-sm font-medium text-gray-800 mt-1">
                    {rfq.expected_delivery_date || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Quotations received</div>
                  <div className="text-sm font-medium text-gray-800 mt-1">{rfq.quotations_count || 0}</div>
                </div>
              </div>

              <div className="p-6">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Package size={17} className="text-primary-700" />
                  Requested Items
                </h2>
                <div className="space-y-3">
                  {(rfq.items || []).map((item) => (
                    <div key={item.id} className="rounded-xl bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-gray-800">{item.product_name}</div>
                          {item.specifications && (
                            <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">
                              {item.specifications}
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-primary-800 whitespace-nowrap">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex items-center gap-2 text-sm text-gray-500">
                <FileText size={15} />
                Submitted {rfq.created_at ? new Date(rfq.created_at).toLocaleString() : 'recently'}
              </div>
            </div>

            <QuotationWorkflow
              rfq={rfq}
              isBuyer={isBuyer}
              isSupplier={isSupplier}
              onRefreshRfq={loadRfq}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
