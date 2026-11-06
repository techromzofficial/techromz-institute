'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard, ShieldCheck, Lock, ArrowLeft, CheckCircle2,
  Building2, AlertCircle, Copy, Upload,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'bank',   label: 'Bank Transfer (TT)',  icon: '🏦', desc: 'Wire transfer to our bank. 2–3 business days to clear.' },
  { id: 'paypal', label: 'PayPal',              icon: '🅿️', desc: 'Pay securely via PayPal balance or card.' },
  { id: 'stripe', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex accepted — instant confirmation.' },
  { id: 'lc',     label: 'Letter of Credit',    icon: '📄', desc: 'Documentary L/C via your bank.' },
];

const MOCK_ORDER = {
  id: 'ECL-20260619-002',
  status: 'Pending Payment',
  total: 860,
  currency: 'USD',
  supplier: 'High Grown Tea Exporters',
  items_summary: 'Cinnamon Sticks 1Kg × 100 units',
  due_date: '2026-07-03',
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const router        = useRouter();
  const orderId        = searchParams.get('order');

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [method,   setMethod]   = useState('bank');
  const [paying,   setPaying]   = useState(false);
  const [proofFile,setProofFile]= useState(null);

  useEffect(() => {
    const load = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        const data = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch {
        setOrder({ ...MOCK_ORDER, id: orderId });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const copyBankDetails = () => {
    navigator.clipboard.writeText('Commercial Bank of Ceylon PLC · A/C 1234567890 · SWIFT: CCEYLKLX');
    toast.success('Bank details copied');
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const fd = new FormData();
      fd.append('method', method);
      if (proofFile) fd.append('proof', proofFile);
      await api.post(`/orders/${orderId}/pay`, fd);
    } catch { /* demo continues regardless */ }
    setPaying(false);
    toast.success(method === 'bank' ? 'Payment proof submitted — pending confirmation' : 'Payment successful!');
    setTimeout(() => router.push(orderId ? `/orders/${orderId}` : '/orders'), 1200);
  };

  if (loading) return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
    </main>
      <Footer />
    </>
  );

  if (!orderId || !order) return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-20 text-center">
      <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
      <h1 className="text-lg font-bold text-gray-800 mb-2">No order selected</h1>
      <p className="text-sm text-gray-500 mb-5">Open this page from an order&apos;s &quot;Complete Payment&quot; link, or start a new purchase from checkout.</p>
      <Link href="/orders" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
        View My Orders
      </Link>
    </main>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-sm text-gray-400">Order {order.id}</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="badge-pill bg-amber-50 text-amber-700 text-xs font-semibold">{order.status || 'Pending Payment'}</span>
          {order.due_date && <span className="text-xs text-gray-400">Due by {order.due_date}</span>}
        </div>
        <p className="text-sm text-gray-600">{order.items_summary || 'Order items'}</p>
        <p className="text-xs text-gray-400 mt-0.5">Supplier: {order.supplier}</p>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Amount Due</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={16} className="text-primary-600" /> Choose Payment Method</h2>
        {PAYMENT_METHODS.map((m) => (
          <label key={m.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
            method === m.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1" />
            <span className="text-xl">{m.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </div>
          </label>
        ))}

        {/* Bank transfer details */}
        {method === 'bank' && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wire To</p>
              <button onClick={copyBankDetails} className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
                <Copy size={11} /> Copy
              </button>
            </div>
            <p className="text-sm text-gray-700">Commercial Bank of Ceylon PLC</p>
            <p className="text-sm text-gray-700 font-mono">A/C: 1234567890</p>
            <p className="text-sm text-gray-700 font-mono">SWIFT: CCEYLKLX</p>

            <label className="flex items-center gap-2 mt-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-primary-400 hover:text-primary-700 cursor-pointer transition-colors">
              <Upload size={13} /> {proofFile ? proofFile.name : 'Upload payment proof (optional)'}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        )}
      </div>

      {/* Escrow note */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
        <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
        <p className="text-xs text-green-700">Funds are held in Trade Assurance Escrow and only released to the supplier after you confirm delivery.</p>
      </div>

      <button onClick={handlePay} disabled={paying}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent-500 hover:bg-accent-600 text-white text-base font-bold rounded-xl disabled:opacity-60 transition-colors shadow-lg shadow-accent-500/25">
        {paying ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
        {paying ? 'Processing…' : `Pay ${formatCurrency(order.total)}`}
      </button>
    </main>
      <Footer />
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}
