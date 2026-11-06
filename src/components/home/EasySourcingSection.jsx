'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Handshake,
  PackageSearch,
  Route,
  Scale,
  Send,
  Ship,
} from 'lucide-react';

const BEAUTY_DISCOVERY_FLOW = [
  {
    title: 'Choose your beauty need',
    copy: 'Search skincare, haircare, fragrance, cosmetics, wellness, or salon-ready products.',
    Icon: ClipboardList,
  },
  {
    title: 'Shop verified sellers',
    copy: 'Discover brand verified sellers, beauty suppliers, retailers, and distributors in Sri Lanka.',
    Icon: BadgeCheck,
  },
  {
    title: 'Compare trusted picks',
    copy: 'Review product details, brand indicators, pricing, variants, and routine-friendly options.',
    Icon: PackageSearch,
  },
  {
    title: 'Buy or connect',
    copy: 'Shop authentic beauty products or connect with partners for B2B beauty supply needs.',
    Icon: Scale,
  },
];

const TRUST_POINTS = [
  { label: 'Brand verified sellers', Icon: BadgeCheck },
  { label: 'Authentic beauty brands', Icon: PackageSearch },
  { label: 'B2B and B2C marketplace', Icon: Route },
  { label: 'Retailer-ready partners', Icon: Handshake },
  { label: 'Beauty supply support', Icon: Ship },
];

export default function EasySourcingSection() {
  const router = useRouter();
  const [form, setForm] = useState({
    product: '',
    description: '',
    qty: '',
    unit: 'Pieces',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const qs = new URLSearchParams({ ...form }).toString();
    router.push(`/products?${qs}`);
  };

  return (
    <section className="mt-6 sm:mt-8 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="bg-primary-900 px-4 py-5 text-white sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-200">
              Beauty shopping and partner discovery
            </p>
            <h2 className="mt-2 text-xl font-bold leading-tight sm:text-3xl">
              Discover authentic beauty products and trusted sellers in Sri Lanka
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-100">
              Built for shoppers, salons, retailers, beauty suppliers, and distributors exploring skincare, haircare, fragrance, cosmetics, and wellness collections.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
            {BEAUTY_DISCOVERY_FLOW.map(({ title, copy, Icon }, index) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/8 p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-primary-800">
                    <Icon size={18} />
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-200">
                      Step {index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-5 text-primary-100 sm:mt-3">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            {TRUST_POINTS.map(({ label, Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-50 ring-1 ring-white/10"
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-50"
            >
              Shop beauty products <ArrowRight size={15} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse products
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore beauty partners
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-7">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5 sm:p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
                <Send size={18} />
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Quick beauty search</h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Start with the essentials and continue into SL Beauty product discovery.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-2.5 sm:space-y-3">
            <input
              type="text"
              placeholder="Product or keywords, e.g. vitamin C serum"
              value={form.product}
              onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
            />
            <textarea
              placeholder="Beauty need, preferred brand, skin or hair concern, or retailer quantity"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none resize-none"
            />
            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
              <input
                type="number"
                placeholder="Quantity"
                value={form.qty}
                onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                className="min-w-0 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
              />
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 outline-none bg-white"
              >
                {['Pieces', 'Sets', 'Bottles', 'Tubes', 'Jars', 'Boxes', 'Cartons'].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
            >
              <Send size={15} />
              Search SL Beauty
            </button>
            <p className="text-center text-xs leading-5 text-gray-400">
              Shoppers and B2B partners can compare trusted products, brands, and seller details.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
