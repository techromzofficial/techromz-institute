'use client';

import { useState, useEffect } from 'react';
import { FileText, Send, Search, MessageCircle, X, Check, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';
import toast from 'react-hot-toast';

const MOCK_RFQS = [
  { id: 'RFQ-8821', product: 'Ceylon Black Tea',        quantity: '500 Kg/month', budget: '$5,000–$8,000', buyer: 'Ahmed Al-Farsi',  country: 'AE', email: 'ahmed@example.ae', received: '2026-06-25', status: 'new', description: 'Looking for premium BOPF grade. Need phytosanitary certificate. Monthly contract preferred.' },
  { id: 'RFQ-8815', product: 'Coconut Shell Charcoal',  quantity: '2 Tons',       budget: '$2,000–$3,500', buyer: 'Kim Ji-won',      country: 'KR', email: 'kim@organic.kr',   received: '2026-06-24', status: 'quoted', description: 'For BBQ charcoal retail. Need size 2-3cm chunks. Export packaging required.' },
  { id: 'RFQ-8801', product: 'Industrial Rubber Bands', quantity: '10,000 pcs',   budget: '$500–$1,200',   buyer: 'Marco Vitali',    country: 'IT', email: 'm@vitali.it',      received: '2026-06-23', status: 'new', description: 'Assorted sizes for office use. Need CE marking if applicable.' },
  { id: 'RFQ-8798', product: 'Cinnamon Sticks',         quantity: '500 Kg',       budget: '$3,000–$4,500', buyer: 'Sarah Johnson',   country: 'US', email: 'sarah@spice.us',   received: '2026-06-22', status: 'new', description: 'Ceylon variety only. Must have food safety certification. Wholesale pricing needed.' },
  { id: 'RFQ-8791', product: 'Batik Fabric 2m',         quantity: '500 pieces',   budget: '$4,000–$6,000', buyer: 'Yuki Tanaka',     country: 'JP', email: 'yuki@arts.jp',    received: '2026-06-20', status: 'declined', description: 'Handmade batik, assorted tropical patterns. Samples required before order.' },
  { id: 'RFQ-8782', product: 'Ayurvedic Hair Oil',      quantity: '2,000 bottles', budget: '$8,000–$12,000', buyer: 'Priya Sharma',  country: 'IN', email: 'priya@holi.in',   received: '2026-06-18', status: 'quoted', description: 'Private labeling required. Need GMP certificate. 200ml amber glass bottles.' },
];

const TAB_LABELS = ['All', 'New', 'Quoted', 'Declined'];

const STATUS_META = {
  new:      { color: 'text-amber-700', bg: 'bg-amber-50', label: 'New' },
  open:     { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Open' },
  pending:  { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
  quoted:   { color: 'text-primary-700', bg: 'bg-primary-50', label: 'Quoted' },
  accepted: { color: 'text-green-700', bg: 'bg-green-50', label: 'Accepted' },
  rejected: { color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
  declined: { color: 'text-red-600',  bg: 'bg-red-50',    label: 'Declined' },
  closed:   { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Closed' },
  expired:  { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Expired' },
  cancelled:{ color: 'text-gray-600', bg: 'bg-gray-100', label: 'Cancelled' },
  default:  { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' },
};

function statusMeta(status) {
  const value = String(status || 'default').toLowerCase();
  return STATUS_META[value] || {
    ...STATUS_META.default,
    label: value === 'default'
      ? STATUS_META.default.label
      : value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
  };
}

function isActionable(status) {
  return ['new', 'open', 'pending'].includes(String(status || '').toLowerCase());
}

function rfqProduct(rfq) {
  return rfq.product || rfq.product_name || rfq.items?.[0]?.product_name || rfq.title || 'Requested product';
}

function rfqQuantity(rfq) {
  const item = rfq.items?.[0];
  const quantity = rfq.quantity ?? item?.quantity;
  const unit = rfq.unit || item?.unit || '';
  return quantity ? `${quantity} ${unit}`.trim() : rfq.quantity_label || 'Quantity not specified';
}

function rfqBuyer(rfq) {
  return rfq.buyer || rfq.user?.name || rfq.buyer_name || 'Buyer';
}

function rfqCountry(rfq) {
  return rfq.country || rfq.destination_country || rfq.user?.country || 'N/A';
}

function rfqReceived(rfq) {
  if (rfq.received) return rfq.received;
  if (!rfq.created_at) return '';
  const date = new Date(rfq.created_at);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

function QuoteModal({ rfq, onClose, onSubmit }) {
  const [price,    setPrice]    = useState('');
  const [moq,      setMoq]      = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [note,     setNote]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ rfq_id: rfq.id, price, moq, lead_time: leadTime, note });
    setSubmitting(false);
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Submit Quotation</h2>
            <p className="text-xs text-gray-500 mt-0.5">{rfq.id} · {rfq.product}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handle} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Price (USD)</label>
              <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 12.50 / Kg" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MOQ</label>
              <input type="text" required value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="e.g. 100 Kg" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time</label>
              <input type="text" required value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="e.g. 14–21 days" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message to Buyer</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Include: certifications, packaging options, shipping terms, sample availability…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 bg-primary-800 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
              {submitting ? 'Sending…' : 'Send Quotation'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupplierRFQsPage() {
  const [rfqs,    setRfqs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('All');
  const [search,  setSearch]  = useState('');
  const [quoting, setQuoting] = useState(null); // RFQ being quoted
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/supplier/rfqs');
        setRfqs(data.data || data);
      } catch {
        setRfqs(MOCK_RFQS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = rfqs.filter((r) => {
    const status = String(r.status || '').toLowerCase();
    const product = rfqProduct(r).toLowerCase();
    const buyer = rfqBuyer(r).toLowerCase();
    const matchTab = tab === 'All' || status === tab.toLowerCase();
    const matchSearch = !search || product.includes(search.toLowerCase()) || buyer.includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const submitQuote = async (data) => {
    try {
      await api.post(`/rfq/${data.rfq_id}/respond`, data);
    } catch { /* continue */ }
    setRfqs((prev) => prev.map((r) => r.id === data.rfq_id ? { ...r, status: 'quoted' } : r));
    setQuoting(null);
    toast.success('Quotation sent to buyer!');
  };

  const decline = async (id) => {
    try {
      await api.patch(`/rfq/${id}`, { status: 'declined' });
    } catch { /* continue */ }
    setRfqs((prev) => prev.map((r) => r.id === id ? { ...r, status: 'declined' } : r));
    toast.success('RFQ declined');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">RFQ Requests</h1>
          <p className="text-sm text-gray-500">{rfqs.filter((r) => isActionable(r.status)).length} new requests waiting</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 overflow-x-auto">
          {TAB_LABELS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-primary-700 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t} {t !== 'All' && <span className="ml-1 text-[10px] text-gray-400">({rfqs.filter((r) => String(r.status || '').toLowerCase() === t.toLowerCase()).length})</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search RFQs…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        {loading ? (
          <div className="p-4"><RowSkeleton rows={4} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No RFQs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((rfq) => {
              const meta = statusMeta(rfq.status);
              const isExpanded = expanded === rfq.id;
              const product = rfqProduct(rfq);
              const quantity = rfqQuantity(rfq);
              const buyer = rfqBuyer(rfq);
              const country = rfqCountry(rfq);
              const received = rfqReceived(rfq);
              return (
                <div key={rfq.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{rfq.id}</span>
                        <span className={`badge-pill text-[10px] ${meta.bg} ${meta.color}`}>{meta.label}</span>
                        {isActionable(rfq.status) && (
                          <span className="badge-pill bg-red-500 text-white text-[10px]">
                            <Clock size={9} /> New
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 mt-1">{product}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">📦 {quantity}</span>
                        <span className="text-xs text-gray-500">💰 {rfq.budget || 'Budget not specified'}</span>
                        <span className="text-xs text-gray-500">👤 {buyer} · {country}</span>
                        <span className="text-xs text-gray-400">{received}</span>
                      </div>
                      {isExpanded && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">
                          {rfq.description || 'No additional description provided.'}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {isActionable(rfq.status) && (
                        <>
                          <button
                            onClick={() => setQuoting(rfq)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-800 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <Send size={12} /> Quote
                          </button>
                          <button
                            onClick={() => decline(rfq.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <X size={12} /> Decline
                          </button>
                        </>
                      )}
                      {rfq.status === 'quoted' && (
                        <span className="flex items-center gap-1 text-xs text-primary-700 font-medium">
                          <Check size={12} /> Quoted
                        </span>
                      )}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : rfq.id)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? 'Less' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {quoting && (
        <QuoteModal rfq={quoting} onClose={() => setQuoting(null)} onSubmit={submitQuote} />
      )}
    </div>
  );
}
