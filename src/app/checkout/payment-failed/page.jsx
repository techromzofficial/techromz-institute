'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CreditCard, RefreshCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function readCheckoutItem() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(sessionStorage.getItem('slb_checkout_item'));
  } catch {
    return null;
  }
}

export default function PaymentFailedPage() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    setItem(readCheckoutItem());
  }, []);

  const productPath = item?.product?.productPath || '/products';

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-14">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-800">
            <AlertCircle size={34} />
          </span>
          <h1 className="mt-5 text-3xl font-bold text-gray-950">Payment Unsuccessful</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            We could not complete your payment. Please try again or select another payment method.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link href="/checkout" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-800 px-4 text-sm font-bold text-white transition hover:bg-primary-900">
              <RefreshCcw size={16} /> Try Again
            </Link>
            <Link href="/checkout" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-800 transition hover:bg-gray-50">
              <CreditCard size={16} /> Change Payment
            </Link>
            <Link href={productPath} className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-800 transition hover:bg-gray-50">
              Back to Product
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
