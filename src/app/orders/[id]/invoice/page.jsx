'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const MOCK_INVOICE = {
  id: 'ECL-20260621-001',
  invoice_no: 'INV-2026-0412',
  issued_at: '2026-06-21',
  due_at: '2026-07-05',
  status: 'Paid',
  buyer: {
    name: 'Green World Trading Co., Ltd.',
    address: '2-14-5 Higashi-Shimbashi, Minato-ku, Tokyo 105-0021, Japan',
    tax_id: 'JP-123456789',
    email: 'import@greenworldjp.com',
  },
  supplier: {
    name: 'Ceylon Exports (Pvt) Ltd.',
    address: 'No. 45, Export Zone, Katunayake 11450, Sri Lanka',
    tax_id: 'LK-1234567',
    email: 'export@ceylonexports.lk',
    bank: 'Commercial Bank of Ceylon PLC',
    account: '1234567890',
    swift: 'CCEYLKLX',
  },
  items: [
    { desc: 'Premium BOPF Ceylon Black Tea — 500g Export Pack', qty: 200, unit: 'Kg', unit_price: 12.50, total: 2500 },
  ],
  subtotal: 2500,
  shipping: 120,
  tax: 0,
  discount: 0,
  total: 2620,
  payment_method: 'Bank Transfer',
  incoterms: 'FOB Colombo',
  notes: 'Includes phytosanitary certificate (No. PHY-2026-04121) and BOPF grade test report.',
};

export default function OrderInvoicePage() {
  const { id }    = useParams();
  const router    = useRouter();
  const printRef  = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/orders/${id}/invoice`);
        setInvoice(data);
      } catch {
        setInvoice({ ...MOCK_INVOICE, id });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );

  const inv = invoice;

  return (
    <>
      {/* Print controls — hidden on print */}
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3 print:hidden">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <h1 className="font-bold text-gray-900 flex-1">Invoice {inv.invoice_no}</h1>
        <button onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          <Printer size={14} /> Print
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Download size={14} /> Download PDF
        </button>
      </div>

      {/* Invoice document */}
      <div ref={printRef} className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 print:shadow-none print:border-0 print:rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <span className="text-xl font-bold text-primary-800">SL Beauty</span>
              </div>
              <p className="text-xs text-gray-400">Sri Lanka&apos;s Premier B2B Marketplace</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h2>
              <p className="text-sm text-gray-500 mt-1">{inv.invoice_no}</p>
              <span className={`badge-pill mt-1 text-xs font-semibold ${
                inv.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {inv.status}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-1 rounded-full bg-gradient-to-r from-primary-800 to-accent-500 mb-8" />

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            {[
              ['Invoice No.',    inv.invoice_no],
              ['Issue Date',     inv.issued_at],
              ['Due Date',       inv.due_at],
              ['Order Ref.',     inv.id],
              ['Payment',        inv.payment_method],
              ['Incoterms',      inv.incoterms],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <p className="text-gray-700 font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Bill from / to */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill From (Supplier)</p>
              <p className="font-semibold text-gray-800">{inv.supplier.name}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{inv.supplier.address}</p>
              <p className="text-xs text-gray-400 mt-1">Tax ID: {inv.supplier.tax_id}</p>
              <p className="text-xs text-gray-400">{inv.supplier.email}</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To (Buyer)</p>
              <p className="font-semibold text-gray-800">{inv.buyer.name}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{inv.buyer.address}</p>
              <p className="text-xs text-gray-400 mt-1">Tax ID: {inv.buyer.tax_id}</p>
              <p className="text-xs text-gray-400">{inv.buyer.email}</p>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-3 text-left rounded-tl-lg text-xs font-semibold">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">Unit Price</th>
                <th className="px-4 py-3 text-right rounded-tr-lg text-xs font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inv.items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-700">{item.desc}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.qty} {item.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              {[
                ['Subtotal',   inv.subtotal],
                ['Shipping',   inv.shipping],
                inv.tax      && ['Tax',      inv.tax],
                inv.discount && ['Discount', -inv.discount],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm text-gray-500">
                  <span>{label}</span>
                  <span>{val < 0 ? `−${formatCurrency(Math.abs(val))}` : formatCurrency(val)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>Total (USD)</span>
                <span>{formatCurrency(inv.total)}</span>
              </div>
            </div>
          </div>

          {/* Bank details */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">Bank Transfer Details</p>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <div><p className="text-xs text-gray-400">Bank</p><p className="font-medium text-gray-700">{inv.supplier.bank}</p></div>
              <div><p className="text-xs text-gray-400">Account No.</p><p className="font-medium text-gray-700">{inv.supplier.account}</p></div>
              <div><p className="text-xs text-gray-400">SWIFT/BIC</p><p className="font-medium text-gray-700 font-mono">{inv.supplier.swift}</p></div>
            </div>
          </div>

          {/* Notes */}
          {inv.notes && (
            <div className="border border-amber-100 bg-amber-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-amber-700 mb-1">Notes</p>
              <p className="text-sm text-amber-800">{inv.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
            <p>SL Beauty — Sri Lanka&apos;s Premier B2B Export Marketplace · slbeauty.lk</p>
            <p className="mt-0.5">This is an automatically generated invoice. For disputes, contact support@slbeauty.lk</p>
          </div>
        </div>
      </div>
    </>
  );
}
