import Link from 'next/link';
import { Gift, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SL_BEAUTY_DISPLAY_CONFIG } from '@/lib/slBeautyConfig';

export const metadata = {
  title: `Gift Cards | ${SL_BEAUTY_DISPLAY_CONFIG.displayName}`,
  description: 'SL Beauty gift cards are coming soon for beauty lovers in Sri Lanka.',
};

export default function GiftCardsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-10">
        <section className="overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-orange-50 px-5 py-12 text-center shadow-sm sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white shadow-sm">
            <Gift size={28} />
          </div>
          <p className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-pink-700 ring-1 ring-pink-100">
            <Sparkles size={14} />
            SL Beauty gift cards
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-normal text-gray-950 sm:text-5xl">
            Beauty gift cards are coming soon
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            We are preparing SL Beauty gift cards for makeup, skincare, fragrance, haircare, wellness, and luxury beauty shoppers.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              Shop Beauty Products
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800"
            >
              Browse Brands
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
