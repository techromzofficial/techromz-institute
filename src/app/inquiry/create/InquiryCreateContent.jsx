'use client';

/**
 * InquiryCreateContent — Send Inquiry form for products that need supplier
 * discussion before purchase (custom specs, certified gemstones, bespoke
 * manufacturing, etc.) — as opposed to /orders/create, which is for
 * products with fixed pricing that can be bought immediately.
 *
 * Laravel: POST /api/inquiries — see sendInquiry() in services.js
 */

import { useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Paperclip, X, CheckCircle, Loader2, HelpCircle, Send,
} from 'lucide-react';
import { sendInquiry } from '@/lib/services';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';

const UNITS = ['Pieces', 'Kg', 'Sets', 'Cartons', 'Boxes', 'Tons', 'Litres', 'Carat'];
const MAX_FILES = 5;
const MAX_CONTENT = 4000;

export default function InquiryCreateContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const fileInputRef  = useRef(null);

  const productId     = searchParams.get('productId')     || '';
  const productName    = searchParams.get('productName')   || 'Selected Product';
  const supplierName   = searchParams.get('supplierName')  || 'Supplier';
  const productImage   = searchParams.get('image') || `https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80))}`;

  const [qty, setQty]         = useState(Number(searchParams.get('qty')) || '');
  const [unit, setUnit]       = useState('Pieces');
  const [content, setContent] = useState('');
  const [email, setEmail]     = useState('');
  const [files, setFiles]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]     = useState('');

  const handleFiles = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (files.length + incoming.length > MAX_FILES) {
      toast.error(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    setFiles((prev) => [...prev, ...incoming]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError('Please describe what you need so the supplier can quote accurately.'); return; }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await sendInquiry({
        product_id: productId,
        quantity: qty || undefined,
        unit,
        content: content.trim(),
        email,
        attachments: files,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not send your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success state ───────────────────────────── */
  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-screen-xl mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="text-primary-700" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Inquiry Sent!</h1>
            <p className="text-gray-500 mb-6">
              Your inquiry about <strong>{productName}</strong> has been sent to {supplierName}.
              They&apos;ll usually reply to <strong>{email}</strong> within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/messages" className="px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                View Messages
              </Link>
              <Link href="/products" className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Continue Browsing
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 placeholder-gray-400 transition-colors';

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back + title */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Send Inquiry</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seller bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
              <span className="text-sm text-gray-500">Seller: </span>
              <span className="text-sm font-semibold text-gray-800">{supplierName}</span>
            </div>

            {/* Product row */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Image
                  src={productImage}
                  alt={productName}
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                />
                <Link
                  href={`/products/${productId}`}
                  className="flex-1 min-w-[160px] text-sm font-medium text-primary-700 hover:underline line-clamp-2"
                >
                  {productName}
                </Link>
                <div className="flex gap-2 flex-shrink-0">
                  <input
                    type="number"
                    min={1}
                    placeholder="Quantity"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className={`${inputCls} w-28`}
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={`${inputCls} w-28 bg-white`}
                  >
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="text-red-500">*</span> Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
                rows={6}
                placeholder="Please enter details such as material, size, application, specifications and other requirements to receive an accurate quote."
                className={`${inputCls} resize-none`}
              />
              <div className="flex items-center justify-between mt-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Paperclip size={14} /> Attach Files ({files.length}/{MAX_FILES})
                  <HelpCircle size={13} className="text-gray-300" />
                </button>
                <span className="text-xs text-gray-400">{content.length}/{MAX_CONTENT}</span>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFiles} className="hidden" />
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {files.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-600">
                      {f.name.length > 24 ? `${f.name.slice(0, 21)}…` : f.name}
                      <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="text-red-500">*</span> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={inputCls}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Sending…</>
              ) : (
                <><Send size={15} /> Send Inquiry Now</>
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
