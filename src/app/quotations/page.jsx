'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, Clock, Star, ChevronRight, Search, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';

const MOCK_QUOTATIONS = [
  {
    id: 'Q-001', rfq_id: 'RFQ-8821', product: 'Ceylon Black Tea BOPF Grade',
    supplier: 'Ceylon Exports (Pvt) Ltd.', supplier_id: 7, verified: true, rating: 4.8,
    price: '12.50 USD/Kg', moq: '100 Kg', lead_time: '14–21 days',
    received: '2026-06-25', status: 'new', rfq_qty: '500 Kg/month',
  },
  {
    id: 'Q-002', rfq_id: 'RFQ-8821', product: 'Ceylon Black Tea BOPF Grade',
    supplier: 'High Grown Tea Exporters', supplier_id: 9, verified: true, rating: 4.6,
    price: '11.80 USD/Kg', moq: '200 Kg', lead_time: '10–18 days',
    received: '2026-06-26', status: 'new', rfq_qty: '500 Kg/month',
  },
  {
    id: 'Q-003', rfq_id: 'RFQ-8815', product: 'Coconut Shell Charcoal 2-3cm',
    supplier: 'Lanka Coir Products', supplier_id: 11, verified: true, rating: 4.5,
    price: '1,100 USD/Ton', moq: '1 Ton', lead_time: '21–30 days',
    received: '2026-06-24', status: 'accepted', rfq_qty: '2 Tons',
  },
  {
    id: 'Q-004', rfq_id: 'RFQ-8798', product: 'Ceylon Cinnamon Sticks',
    supplier: 'Spice Garden Exports', supplier_id: 14, verified: false, rating: 4.2,
    price: '8.50 USD/Kg', moq: '100 Kg', lead_time: '14–28 days',
    received: '2026-06-22', status: 'rejected', rfq_qty: '500 Kg',
  },
];

const STATUS_META = {
  new:      { label: 'New',      color: 'bg-amber-50 text-amber-700' },
  accepted: { label: 'Accepted', color: 'bg-green-50 text-green-700' },
  rejected: { label: 'Declined', color: 'bg-red-50 text-red-600' },
};

const TABS = ['All', 'New', 'Accepted', 'Declined'];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('All');
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/quotations');
        setQuotations(data.data || data);
      } catch {
        setQuotations(MOCK_QUOTATIONS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = quotations.filter((q) => {
    const matchTab    = tab === 'All' || q.status === tab.toLowerCase();
    const matchSearch = !search || q.product.toLowerCase().includes(search.toLowerCase()) || q.supplier.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const newCount  = quotations.filter((q) => q.status === 'new').length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500">{newCount > 0 ? `${newCount} new quotations awaiting review` : 'All quotations from suppliers'}</p>
        </div>
        <Link href="/rfq" className="flex items-center gap-1.5 px-3 py-2 bg-primary-800 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
          <FileText size={14} /> Post New RFQ
        </Link>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-primary-700 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t}
              {t === 'New' && newCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">{newCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search quotations…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        {loading ? (
          <div className="p-4"><RowSkeleton rows={4} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No quotations found</p>
            <Link href="/rfq" className="mt-2 inline-block text-sm text-primary-700 hover:underline">Post an RFQ to receive quotes →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((q) => {
              const meta = STATUS_META[q.status] || STATUS_META.new;
              return (
                <div key={q.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* RFQ link */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link href={`/rfq/${q.rfq_id}`} className="text-xs text-primary-700 font-mono hover:underline">{q.rfq_id}</Link>
                        <span className={`badge-pill text-[10px] ${meta.color}`}>{meta.label}</span>
                        {q.verified && <span className="badge-pill bg-primary-50 text-primary-700 text-[10px]">✓ Verified Supplier</span>}
                      </div>

                      <p className="font-semibold text-gray-800 text-sm mb-0.5">{q.product}</p>
                      <p className="text-xs text-gray-500">Your RFQ: {q.rfq_qty}</p>

                      {/* Supplier */}
                      <Link href={`/suppliers/${q.supplier_id}`} className="flex items-center gap-1 mt-1.5 group w-fit">
                        <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                          {q.supplier.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-600 group-hover:text-primary-700 transition-colors">{q.supplier}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span className="text-[10px] text-gray-400">{q.rating}</span>
                        </div>
                      </Link>

                      {/* Quote details */}
                      <div className="flex gap-4 flex-wrap mt-2">
                        {[['Price', q.price], ['MOQ', q.moq], ['Lead Time', q.lead_time]].map(([label, val]) => (
                          <div key={label}>
                            <span className="text-[10px] text-gray-400">{label}: </span>
                            <span className="text-xs font-semibold text-gray-700">{val}</span>
                          </div>
                        ))}
                        <span className="text-[10px] text-gray-400">Received: {q.received}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href={`/rfq/${q.rfq_id}#quotations`}
                        className="flex items-center gap-1 px-3 py-2 bg-primary-800 text-white text-xs font-medium rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap">
                        {q.status === 'new' ? <><CheckCircle2 size={12} /> Review</> : <><ChevronRight size={12} /> View</>}
                      </Link>
                      <Link href={`/messages?supplier=${q.supplier_id}`}
                        className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-600 text-xs rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <MessageCircle size={12} /> Message
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
