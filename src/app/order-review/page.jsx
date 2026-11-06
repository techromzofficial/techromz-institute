'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Edit2, MessageCircle, FileText,
  AlertCircle, ArrowRight, ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const MOCK_REVIEW = {
  id: 'ECL-DRAFT-7741',
  type: 'Proforma Invoice',
  supplier: { name: 'Ceylon Exports (Pvt) Ltd.', id: 7 },
  items: [
    { desc: 'Premium BOPF Ceylon Black Tea — 500g Export Pack', qty: 200, unit: 'Kg', unit_price: 12.50, total: 2500 },
  ],
  shipping: 120,
  total: 2620,
  currency: 'USD',
  incoterms: 'CIF Dubai',
  lead_time: '14–21 days',
  payment_terms: '30% TT advance, 70% against B/L copy',
  valid_until: '2026-07-10',
  notes: 'Includes phytosanitary certificate and BOPF grade test report. Sample available on request.',
};

function OrderReviewContent() {
  const searchParams = useSearchParams();
  const router        = useRouter();
  const ref            = searchParams.get('order') || searchParams.get('quotation');

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get(`/order-review/${ref}`);
        setData(resp);
      } catch {
        setData({ ...MOCK_REVIEW, id: ref || MOCK_REVIEW.id });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ref]);

  const approve = async () => {
    setApproving(true);
    try {
      await api.post(`/order-review/${ref}/approve`);
    } catch { /* demo continues */ }
    setApproving(false);
    toast.success('Order approved — proceeding to payment');
    setTimeout(() => router.push(`/payment?order=${data.id}`), 800);
  };

  if (loading) return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </main>
      <Footer />
    </>
  );

  const r = data;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Review Order</h1>
          <p className="text-sm text-gray-400">{r.type} · {r.id}</p>
        </div>
      </div>

      {/* Validity notice */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
        <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">Please review carefully — this offer is valid until <strong>{r.valid_until}</strong>.</p>
      </div>

      {/* Supplier */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">From</p>
        <div className="flex items-center justify-between">
          <Link href={`/suppliers/${r.supplier.id}`} className="font-semibold text-gray-800 hover:text-primary-700">{r.supplier.name}</Link>
          <Link href={`/messages?supplier=${r.supplier.id}`} className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
            <MessageCircle size={12} /> Message
          </Link>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items</p>
        <table className="w-full text-sm mb-4">
          <thead className="border-b border-gray-100">
            <tr>
              {['Description', 'Qty', 'Unit Price', 'Total'].map((h) => (
                <th key={h} className="pb-2 text-left text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-3 text-gray-700 pr-4">{item.desc}</td>
                <td className="py-3 text-xs text-gray-500">{item.qty} {item.unit}</td>
                <td className="py-3 text-xs text-gray-600">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 font-semibold text-gray-800">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Shipping ({r.incoterms})</span><span>{formatCurrency(r.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
            <span>Total ({r.currency})</span><span>{formatCurrency(r.total)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Terms</p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[['Lead Time', r.lead_time], ['Incoterms', r.incoterms], ['Payment Terms', r.payment_terms]].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-700">{val}</p>
            </div>
          ))}
        </div>
        {r.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-3">{r.notes}</p>}
      </div>

      {/* Escrow note */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
        <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
        <p className="text-xs text-green-700">Approving this order moves it to secure Trade Assurance payment — your funds stay protected until delivery is confirmed.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={approve} disabled={approving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-800 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors">
          {approving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
          {approving ? 'Approving…' : 'Approve & Continue to Payment'}
          {!approving && <ArrowRight size={14} />}
        </button>
        <Link href={`/messages?supplier=${r.supplier.id}`}
          className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
          <Edit2 size={14} /> Request Changes
        </Link>
      </div>
    </main>
      <Footer />
    </>
  );
}

export default function OrderReviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderReviewContent />
    </Suspense>
  );
}
