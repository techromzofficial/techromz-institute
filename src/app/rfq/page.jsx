'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertCircle, Package, Send } from 'lucide-react';
import { rfqApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function RFQForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthenticated,
    isBuyer,
    loading: authLoading,
  } = useAuth();

  const productId = searchParams.get('productId');
  const returnQuery = searchParams.toString();
  const returnUrl = `/rfq${returnQuery ? `?${returnQuery}` : ''}`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: searchParams.get('product')
      ? `Request for ${searchParams.get('product')}`
      : '',
    description: searchParams.get('description') || '',
    destination_country: '',
    expected_delivery_date: '',
    product_name: searchParams.get('product') || '',
    quantity: searchParams.get('qty') || '',
    unit: searchParams.get('unit') || 'Kg',
    specifications: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, isAuthenticated, returnUrl, router]);

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!isBuyer) {
      setError('Only buyer accounts can post RFQs.');
      return;
    }

    const numericProductId = Number(productId);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      destination_country: form.destination_country.trim(),
      expected_delivery_date: form.expected_delivery_date || null,
      items: [
        {
          product_id: productId && Number.isInteger(numericProductId) && numericProductId > 0
            ? numericProductId
            : null,
          product_name: form.product_name.trim(),
          quantity: Number(form.quantity),
          unit: form.unit,
          specifications: form.specifications.trim() || null,
        },
      ],
    };

    setLoading(true);
    try {
      const createdRfq = await rfqApi.submit(payload);

      if (!createdRfq?.id) {
        throw new Error('RFQ was created but no RFQ ID was returned.');
      }

      toast.success('RFQ posted successfully.');
      router.push(`/rfq/${createdRfq.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner label="Checking your account…" />;
  }

  if (!isBuyer) {
    return (
      <div className="max-w-3xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700">Only buyer accounts can post RFQs.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={18} className="text-primary-700" />
          Request Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RFQ Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              required
              maxLength={255}
              placeholder="e.g. Request for export-grade Ceylon black tea"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.product_name}
              onChange={set('product_name')}
              required
              maxLength={255}
              placeholder="e.g. Ceylon Black Tea, BOPF Grade"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Quantity <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.quantity}
                onChange={set('quantity')}
                required
                min="0.01"
                step="any"
                placeholder="e.g. 500"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              />
              <select
                value={form.unit}
                onChange={set('unit')}
                className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white"
              >
                {['Kg', 'MT', 'Tons', 'Pieces', 'Boxes', 'Liters', 'Cartons', 'Pairs', 'Sets', 'Rolls'].map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.destination_country}
              onChange={set('destination_country')}
              required
              maxLength={100}
              placeholder="e.g. United Arab Emirates"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={form.expected_delivery_date}
              onChange={set('expected_delivery_date')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RFQ Description
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Summarize your sourcing request and delivery expectations."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Specifications
            </label>
            <textarea
              value={form.specifications}
              onChange={set('specifications')}
              rows={4}
              placeholder="Grade, quality requirements, packaging, certifications, labelling, or other product specifications."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 resize-none"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send size={16} />
            Post Request Now — Get Quotes from Suppliers
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Your RFQ will be sent to verified Sri Lankan suppliers matching your requirements.
        No obligations — compare quotes and choose.
      </p>
    </form>
  );
}

export default function RFQPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Post a Request for Quotation</h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            One request, multiple competitive quotes from verified Sri Lankan exporters.
            Free, fast and secure.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            {['✅ 100% Free', '⚡ Quotes in 24h', '🔒 Verified Suppliers', '📦 Global Shipping'].map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </div>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <RFQForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
