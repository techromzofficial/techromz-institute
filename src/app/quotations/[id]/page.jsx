'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, X, MessageCircle, Star,
  FileText, Truck, Clock, ShieldCheck, Download, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';
import toast from 'react-hot-toast';

const MOCK_QUOTATION = {
  id: 'Q-001',
  rfq_id: 'RFQ-8821',
  rfq_product: 'Ceylon Black Tea BOPF Grade',
  rfq_qty: '500 Kg/month',
  status: 'new',
  received_at: '2026-06-25',
  valid_until: '2026-07-10',
  supplier: {
    id: 7, name: 'Ceylon Exports (Pvt) Ltd.', country: 'LK',
    rating: 4.8, reviews: 142, orders: 380,
    verified: true, premium: true,
    response_time: '< 4 hours',
    on_time_delivery: '97%',
    member_since: '2019',
  },
  items: [
    {
      desc: 'Premium BOPF Ceylon Black Tea (Export Grade)',
      qty: 500, unit: 'Kg',
      unit_price: 12.50, currency: 'USD',
      total: 6250,
    },
  ],
  shipping_cost: 420,
  total: 6670,
  currency: 'USD',
  moq: '100 Kg',
  lead_time: '14–21 days',
  incoterms: 'CIF Dubai',
  port_of_loading: 'Colombo (CMB)',
  port_of_discharge: 'Dubai (DXB)',
  payment_terms: '30% TT advance, 70% against B/L copy',
  sample_available: true,
  sample_price: 'USD 25 + DHL freight',
  certifications: ['ISO 22000', 'Phytosanitary Certificate', 'Certificate of Origin'],
  packing: '25kg kraft paper bags, palletized',
  note: 'We can accommodate monthly shipments of up to 1 Ton. BOPF grade sourced exclusively from Nuwara Eliya high-grown estates. Full documentation package included with every shipment: Phytosanitary Certificate, Certificate of Origin, Commercial Invoice, Packing List, Bill of Lading.',
  counter_offer: null,
};

export default function QuotationDetailPage() {
  const { id }     = useParams();
  const router     = useRouter();
  const [quot,     setQuot]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [counter,  setCounter]  = useState('');
  const [showOffer,setShowOffer]= useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/quotations/${id}`);
        setQuot(data);
      } catch {
        setQuot({ ...MOCK_QUOTATION, id });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const accept = async () => {
    try { await api.post(`/quotations/${id}/accept`); } catch { /* ok */ }
    setQuot((q) => ({ ...q, status: 'accepted' }));
    toast.success('Quotation accepted! Proceeding to checkout…');
    setTimeout(() => router.push('/checkout'), 1500);
  };

  const reject = async () => {
    try { await api.post(`/quotations/${id}/reject`); } catch { /* ok */ }
    setQuot((q) => ({ ...q, status: 'rejected' }));
    toast.success('Quotation declined');
  };

  const submitCounter = async () => {
    if (!counter.trim()) return;
    try { await api.post(`/quotations/${id}/counter`, { price: counter }); } catch { /* ok */ }
    setQuot((q) => ({ ...q, counter_offer: counter }));
    setShowOffer(false);
    toast.success('Counter-offer sent to supplier');
  };

  if (loading) return <main className="max-w-3xl mx-auto px-4 py-8"><RowSkeleton rows={6} /></main>;

  const q = quot;
  const isNew      = q.status === 'new';
  const isAccepted = q.status === 'accepted';

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">Quotation {q.id}</h1>
            <span className={`badge-pill text-xs font-semibold ${
              isAccepted ? 'bg-green-50 text-green-700'
              : q.status === 'rejected' ? 'bg-red-50 text-red-600'
              : 'bg-amber-50 text-amber-700'
            }`}>
              {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            For <Link href={`/rfq/${q.rfq_id}`} className="text-primary-700 hover:underline">{q.rfq_id}</Link>
            {' · '}{q.rfq_product}
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={13} /> Export PDF
        </button>
      </div>

      {/* Accepted banner */}
      {isAccepted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800 text-sm">You accepted this quotation</p>
            <p className="text-xs text-green-700 mt-0.5">Proceed to checkout to confirm your order.</p>
          </div>
          <Link href="/checkout"
            className="flex items-center gap-1 px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors flex-shrink-0">
            Checkout <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Validity */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
        <Clock size={14} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          This quotation is valid until <strong>{q.valid_until}</strong>.
          Received {q.received_at}.
        </p>
      </div>

      {/* Supplier card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Supplier</h2>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-800 font-bold text-lg flex items-center justify-center flex-shrink-0">
            {q.supplier.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/suppliers/${q.supplier.id}`} className="font-bold text-gray-800 hover:text-primary-700">
                {q.supplier.name}
              </Link>
              {q.supplier.verified && <span className="badge-pill bg-primary-50 text-primary-700 text-[10px]">✓ Verified</span>}
              {q.supplier.premium  && <span className="badge-pill bg-amber-50 text-amber-700 text-[10px]">⭐ Premium</span>}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className={i < Math.floor(q.supplier.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
              ))}
              <span className="text-xs text-gray-400 ml-1">{q.supplier.rating} ({q.supplier.reviews} reviews)</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                ['Response Time', q.supplier.response_time],
                ['On-time Delivery', q.supplier.on_time_delivery],
                ['Member Since', q.supplier.member_since],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-gray-700">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Pricing Breakdown</h2>
        <table className="w-full text-sm mb-4">
          <thead className="border-b border-gray-100">
            <tr>
              {['Description', 'Qty', 'Unit Price', 'Total'].map((h) => (
                <th key={h} className="pb-2 text-left text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-3 text-gray-700 pr-4">{item.desc}</td>
                <td className="py-3 text-gray-500 text-xs">{item.qty} {item.unit}</td>
                <td className="py-3 text-gray-600 text-xs">{formatCurrency(item.unit_price)}/{item.unit}</td>
                <td className="py-3 font-semibold text-gray-800">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>{formatCurrency(q.items.reduce((s, i) => s + i.total, 0))}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Shipping ({q.incoterms})</span><span>{formatCurrency(q.shipping_cost)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total ({q.currency})</span><span>{formatCurrency(q.total)}</span>
          </div>
        </div>
      </div>

      {/* Terms grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Terms & Conditions</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ['MOQ',               q.moq, Truck],
            ['Lead Time',         q.lead_time, Clock],
            ['Incoterms',         q.incoterms, FileText],
            ['Port of Loading',   q.port_of_loading, null],
            ['Port of Discharge', q.port_of_discharge, null],
            ['Payment Terms',     q.payment_terms, ShieldCheck],
            ['Packaging',         q.packing, null],
            ['Sample',            q.sample_available ? `Available · ${q.sample_price}` : 'Not available', null],
          ].map(([label, value, Icon]) => (
            <div key={label} className="flex gap-2">
              {Icon && <Icon size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Documents Included</h2>
        <div className="flex flex-wrap gap-2">
          {q.certifications.map((cert) => (
            <span key={cert} className="badge-pill bg-green-50 text-green-700 border border-green-100 text-xs">
              <CheckCircle2 size={11} /> {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Supplier note */}
      {q.note && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Supplier Message</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{q.note}</p>
        </div>
      )}

      {/* Counter offer modal */}
      {showOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Make a Counter-Offer</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your target price</label>
              <input
                type="text" value={counter} onChange={(e) => setCounter(e.target.value)}
                placeholder="e.g. USD 11.50/Kg"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">The supplier will receive your offer and respond within 24h.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={submitCounter} className="flex-1 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Send Offer
              </button>
              <button onClick={() => setShowOffer(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {isNew && (
        <div className="flex flex-wrap gap-3">
          <button onClick={accept}
            className="flex items-center gap-2 px-6 py-3 bg-primary-800 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-800/20">
            <CheckCircle2 size={16} /> Accept & Proceed to Checkout
          </button>
          <button onClick={() => setShowOffer(true)}
            className="flex items-center gap-2 px-4 py-3 border-2 border-primary-700 text-primary-800 text-sm font-semibold rounded-xl hover:bg-primary-50 transition-colors">
            Counter-Offer
          </button>
          <Link href={`/messages?supplier=${q.supplier.id}&quot=${q.id}`}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
            <MessageCircle size={15} /> Message Supplier
          </Link>
          <button onClick={reject}
            className="flex items-center gap-2 px-4 py-3 text-red-500 text-sm rounded-xl hover:bg-red-50 transition-colors">
            <X size={15} /> Decline
          </button>
        </div>
      )}

      {q.status === 'rejected' && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
          <X size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">You declined this quotation. <Link href={`/rfq/${q.rfq_id}`} className="underline font-medium">View other quotations</Link> for this RFQ.</p>
        </div>
      )}
    </main>
  );
}
