'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Check,
  Clock,
  Edit3,
  FileText,
  Send,
  Store,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quotationsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const EMPTY_FORM = {
  currency: 'USD',
  lead_time: '',
  payment_terms: '',
  shipping_terms: '',
  remarks: '',
  items: [],
};

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

function money(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

function initialItems(rfq, quotation) {
  if (quotation?.items?.length) {
    return quotation.items.map((item) => ({
      rfq_item_id: item.rfq_item_id || '',
      product_name: item.product_name,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
    }));
  }

  return (rfq.items || []).map((item) => ({
    rfq_item_id: item.id,
    product_name: item.product_name,
    quantity: String(item.quantity),
    unit_price: '',
  }));
}

function QuotationCard({ quotation, rfq, buyerActions, actionId }) {
  const statusStyle = STATUS_STYLES[quotation.status] || 'bg-gray-100 text-gray-600';

  return (
    <article className="border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Store size={17} className="text-primary-700" />
            <h3 className="font-semibold text-gray-800">
              {quotation.supplier?.company_name || quotation.supplier?.name || 'Your quotation'}
            </h3>
          </div>
          <div className="text-xs text-gray-400 font-mono mt-1">{quotation.quotation_number}</div>
        </div>
        <div className="sm:text-right">
          <div className="text-xl font-bold text-primary-800">
            {money(quotation.total_amount, quotation.currency)}
          </div>
          <span className={`badge-pill capitalize mt-1 ${statusStyle}`}>{quotation.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-400">MOQ / quoted quantity</div>
          <div className="font-medium text-gray-800 mt-1">
            {(quotation.items || []).map((item) => {
              const rfqItem = (rfq.items || []).find(
                (candidate) => Number(candidate.id) === Number(item.rfq_item_id),
              );
              return `${item.quantity} ${rfqItem?.unit || 'units'}`;
            }).join(', ') || 'Not specified'}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-400">Lead time</div>
          <div className="font-medium text-gray-800 mt-1">{quotation.lead_time || 'Not specified'}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-400">Shipping terms</div>
          <div className="font-medium text-gray-800 mt-1">{quotation.shipping_terms || 'Not specified'}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {(quotation.items || []).map((item) => (
          <div key={item.id || `${item.product_name}-${item.rfq_item_id}`} className="flex justify-between gap-4 text-sm border-b border-gray-50 pb-2">
            <div>
              <span className="font-medium text-gray-700">{item.product_name}</span>
              <span className="text-gray-400"> · {item.quantity} × {money(item.unit_price, quotation.currency)}</span>
            </div>
            <span className="font-semibold text-gray-800">{money(item.amount, quotation.currency)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <div className="text-xs text-gray-400">Payment terms</div>
          <div className="text-gray-700 mt-1">{quotation.payment_terms || 'Not specified'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Message</div>
          <div className="text-gray-700 mt-1 whitespace-pre-line">{quotation.remarks || 'No message provided.'}</div>
        </div>
      </div>

      {buyerActions && quotation.status === 'pending' && rfq.status === 'open' && (
        <div className="flex flex-wrap justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={actionId === quotation.id}
            onClick={() => buyerActions.reject(quotation.id)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5"
          >
            <X size={14} />
            Reject
          </button>
          <button
            type="button"
            disabled={actionId === quotation.id}
            onClick={() => buyerActions.accept(quotation.id)}
            className="px-4 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check size={14} />
            Accept quotation
          </button>
        </div>
      )}

      {buyerActions && quotation.status === 'accepted' && (
        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
          <Link
            href={quotation.order_id
              ? `/orders/${quotation.order_id}`
              : `/orders/create?quotationId=${quotation.id}`}
            className="px-5 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 flex items-center gap-2"
          >
            <FileText size={15} />
            {quotation.order_id ? 'View Order' : 'Create Order'}
          </Link>
        </div>
      )}
    </article>
  );
}

function SupplierQuotationForm({ rfq, quotation, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = Boolean(quotation);

  useEffect(() => {
    setForm({
      currency: quotation?.currency || 'USD',
      lead_time: quotation?.lead_time || '',
      payment_terms: quotation?.payment_terms || '',
      shipping_terms: quotation?.shipping_terms || '',
      remarks: quotation?.remarks || '',
      items: initialItems(rfq, quotation),
    });
  }, [quotation, rfq]);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const setItem = (index, field) => (event) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: event.target.value } : item
      )),
    }));
  };

  const total = useMemo(
    () => form.items.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.unit_price || 0)),
      0,
    ),
    [form.items],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      currency: form.currency.trim().toUpperCase(),
      lead_time: form.lead_time.trim() || null,
      payment_terms: form.payment_terms.trim() || null,
      shipping_terms: form.shipping_terms.trim() || null,
      remarks: form.remarks.trim() || null,
      items: form.items.map((item) => ({
        rfq_item_id: item.rfq_item_id ? Number(item.rfq_item_id) : null,
        product_name: item.product_name.trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    };

    try {
      if (editing) {
        await quotationsApi.update(quotation.id, payload);
        toast.success('Quotation updated successfully.');
      } else {
        await quotationsApi.create(rfq.id, payload);
        toast.success('Quotation submitted successfully.');
      }

      await onSaved();
    } catch (err) {
      setError(err.message || 'Could not save quotation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-primary-100 bg-primary-50/40 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-gray-800">{editing ? 'Edit quotation' : 'Submit a quotation'}</h3>
          <p className="text-xs text-gray-500 mt-1">Quote each requested item and add your commercial terms.</p>
        </div>
        {editing && (
          <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {form.items.map((item, index) => {
          const requestedItem = (rfq.items || []).find(
            (candidate) => Number(candidate.id) === Number(item.rfq_item_id),
          );

          return (
            <div key={item.rfq_item_id || index} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="font-medium text-sm text-gray-800">{item.product_name}</div>
              <div className="text-xs text-gray-400 mt-1">
                Requested: {requestedItem?.quantity || item.quantity} {requestedItem?.unit || 'units'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Quoted quantity</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={item.quantity}
                    onChange={setItem(index, 'quantity')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unit price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.unit_price}
                    onChange={setItem(index, 'unit_price')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
          <input
            value={form.currency}
            onChange={setField('currency')}
            required
            minLength={3}
            maxLength={3}
            placeholder="USD"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Lead time</label>
          <input
            value={form.lead_time}
            onChange={setField('lead_time')}
            maxLength={255}
            placeholder="e.g. 15 days"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Payment terms</label>
          <input
            value={form.payment_terms}
            onChange={setField('payment_terms')}
            maxLength={255}
            placeholder="e.g. 30% advance"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Shipping terms</label>
          <input
            value={form.shipping_terms}
            onChange={setField('shipping_terms')}
            maxLength={255}
            placeholder="e.g. FOB Colombo"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
          <textarea
            value={form.remarks}
            onChange={setField('remarks')}
            rows={3}
            placeholder="Product quality, packaging, validity, or other details for the buyer."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-primary-100">
        <div>
          <div className="text-xs text-gray-400">Calculated quotation total</div>
          <div className="text-xl font-bold text-primary-800">{money(total, form.currency)}</div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={15} />
          {saving ? 'Saving…' : editing ? 'Update quotation' : 'Submit quotation'}
        </button>
      </div>
    </form>
  );
}

export default function QuotationWorkflow({ rfq, isBuyer, isSupplier, onRefreshRfq }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [editing, setEditing] = useState(false);

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (isBuyer) {
        const response = await quotationsApi.listByRfq(rfq.id);
        setQuotations(response.data || []);
      } else if (isSupplier) {
        const response = await quotationsApi.supplierList({ rfq_id: rfq.id });
        setQuotations(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Could not load quotations.');
    } finally {
      setLoading(false);
    }
  }, [isBuyer, isSupplier, rfq.id]);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  const refreshWorkflow = async () => {
    await Promise.all([loadQuotations(), onRefreshRfq()]);
    setEditing(false);
  };

  const runBuyerAction = async (quotationId, action) => {
    setActionId(quotationId);
    setError('');

    try {
      if (action === 'accept') {
        await quotationsApi.accept(quotationId);
        toast.success('Quotation accepted successfully.');
      } else {
        await quotationsApi.reject(quotationId);
        toast.success('Quotation rejected successfully.');
      }

      await refreshWorkflow();
    } catch (err) {
      setError(err.message || `Could not ${action} quotation.`);
    } finally {
      setActionId(null);
    }
  };

  const ownQuotation = isSupplier ? quotations[0] : null;
  const canCreate = isSupplier && rfq.status === 'open' && !ownQuotation;
  const canEdit = isSupplier && ownQuotation?.status === 'pending' && rfq.status === 'open';

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {isBuyer ? 'Supplier Quotations' : 'Your Quotation'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isBuyer
              ? 'Compare supplier pricing and commercial terms before accepting.'
              : 'Submit and manage your quotation for this sourcing request.'}
          </p>
        </div>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Edit3 size={14} />
            Edit quotation
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading quotations…" />
      ) : (
        <div className="space-y-4">
          {canCreate && (
            <SupplierQuotationForm
              rfq={rfq}
              onSaved={refreshWorkflow}
            />
          )}

          {editing && ownQuotation && (
            <SupplierQuotationForm
              rfq={rfq}
              quotation={ownQuotation}
              onSaved={refreshWorkflow}
              onCancel={() => setEditing(false)}
            />
          )}

          {quotations.length === 0 && !canCreate ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <FileText size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No quotations available.</p>
            </div>
          ) : (
            quotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                rfq={rfq}
                actionId={actionId}
                buyerActions={isBuyer ? {
                  accept: (id) => runBuyerAction(id, 'accept'),
                  reject: (id) => runBuyerAction(id, 'reject'),
                } : null}
              />
            ))
          )}

          {isSupplier && ownQuotation?.status !== 'pending' && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-500">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              Accepted or rejected quotations can no longer be edited.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
