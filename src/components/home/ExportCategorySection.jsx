'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Leaf,
  PackageCheck,
  Palette,
  Shirt,
  Sparkles,
  Sprout,
  Waves,
} from 'lucide-react';
import useCategories from '@/hooks/useCategories';

const BEAUTY_MARKETPLACE_CATEGORIES = [
  {
    label: 'Skincare',
    keywords: ['skincare', 'skin', 'serum', 'cleanser', 'moisturizer'],
    summary: 'Cleansers, serums, moisturizers, SPF, and daily care',
    buyerNeed: 'Shoppers, salons, authorized retailers',
    query: 'Skincare',
    Icon: Leaf,
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  },
  {
    label: 'Hair Care',
    keywords: ['hair', 'shampoo', 'conditioner', 'treatment', 'mask'],
    summary: 'Shampoo, conditioner, treatments, masks, and styling care',
    buyerNeed: 'Salons, retailers, distributors',
    query: 'Hair Care',
    Icon: Waves,
    accent: 'text-cyan-700 bg-cyan-50 border-cyan-100',
  },
  {
    label: 'Fragrance',
    keywords: ['fragrance', 'perfume', 'cologne'],
    summary: 'Perfume, body mist, premium fragrance, and gift edits',
    buyerNeed: 'Shoppers, boutiques, authorized sellers',
    query: 'Fragrance',
    Icon: Sparkles,
    accent: 'text-amber-700 bg-amber-50 border-amber-100',
  },
  {
    label: 'Makeup',
    keywords: ['makeup', 'cosmetic', 'foundation', 'lipstick', 'mascara'],
    summary: 'Face, lip, eye, cheek, and long-wear cosmetic picks',
    buyerNeed: 'Beauty shoppers and retailers',
    query: 'Makeup',
    Icon: Shirt,
    accent: 'text-sky-700 bg-sky-50 border-sky-100',
  },
  {
    label: 'Beauty Tools',
    keywords: ['tool', 'brush', 'sponge', 'blender'],
    summary: 'Brushes, applicators, sponges, mirrors, and routine tools',
    buyerNeed: 'Makeup lovers, salons, retailers',
    query: 'Beauty Tools',
    Icon: Palette,
    accent: 'text-rose-700 bg-rose-50 border-rose-100',
  },
  {
    label: 'Wellness',
    keywords: ['ayurvedic', 'ayurveda', 'herbal', 'wellness'],
    summary: 'Natural beauty, wellness care, spa essentials, and self-care',
    buyerNeed: 'Spas, retailers, shoppers',
    query: 'Wellness Beauty',
    Icon: Sprout,
    accent: 'text-lime-700 bg-lime-50 border-lime-100',
  },
  {
    label: 'Gift Sets',
    keywords: ['gift', 'set', 'bundle', 'mini'],
    summary: 'Value sets, minis, beauty gifts, and seasonal bundles',
    buyerNeed: 'Gift shoppers and retailers',
    query: 'Gift Sets',
    Icon: PackageCheck,
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-100',
  },
  {
    label: 'Professional Beauty',
    keywords: ['professional', 'salon', 'spa', 'retail'],
    summary: 'Authorized seller, retailer, salon, and distributor-ready beauty selections',
    buyerNeed: 'Beauty suppliers, retailers, distributors',
    query: 'Professional Beauty',
    Icon: Box,
    accent: 'text-orange-700 bg-orange-50 border-orange-100',
  },
];

function categoryMatches(category, keywords) {
  const haystack = [
    category?.slug,
    category?.label,
    category?.name,
    category?.description,
  ].filter(Boolean).join(' ').toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
}

function buildCategoryHref(category, fallbackQuery) {
  if (category?.slug) return `/categories/${category.slug}`;
  return `/products?q=${encodeURIComponent(fallbackQuery)}`;
}

export default function ExportCategorySection() {
  const { categories, loading, error, retry } = useCategories();

  const beautyCards = BEAUTY_MARKETPLACE_CATEGORIES.map((category) => {
    const match = categories.find((item) => categoryMatches(item, category.keywords));
    const productCount = Number(
      match?.products_count
      || match?.productsCount
      || match?.products
      || 0,
    );

    return {
      ...category,
      displayLabel: match?.label || match?.name || category.label,
      href: buildCategoryHref(match, category.query),
      productCount,
      isBackendMatch: Boolean(match),
    };
  });

  const connectedCount = beautyCards.filter((category) => category.isBackendMatch).length;

  return (
    <section className="mt-5 sm:mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
              <BadgeCheck size={14} />
              Beauty marketplace categories
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900 sm:text-2xl">
              Shop trusted beauty products by category
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Built for shoppers, verified beauty brands, authorized sellers, retailers, and distributors discovering authentic beauty in Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            >
              Browse products
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Partner with SL Beauty
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-gray-50 px-2.5 py-1">
            {loading ? 'Syncing backend categories' : `${connectedCount} matched backend categories`}
          </span>
          <span className="rounded-full bg-gray-50 px-2.5 py-1">Safe search fallback enabled</span>
          <span className="rounded-full bg-gray-50 px-2.5 py-1">Authorized seller and distributor paths</span>
          {error && (
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-700 hover:bg-red-100"
            >
              Retry category sync
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {beautyCards.map(({ Icon, ...category }) => (
          <Link
            key={category.label}
            href={category.href}
            className="group min-h-[164px] border-b border-gray-100 p-3.5 transition-colors hover:bg-gray-50 sm:min-h-[188px] sm:border-r sm:p-4 xl:min-h-[206px] [&:nth-child(2n)]:sm:border-r-0 [&:nth-child(4n)]:xl:border-r-0"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border ${category.accent}`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-500 ring-1 ring-gray-100">
                  {category.isBackendMatch ? 'Live category' : 'Search route'}
                </span>
              </div>

              <div className="mt-3 min-w-0 sm:mt-4">
                <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-primary-800">
                  {category.displayLabel}
                </h3>
                <p className="mt-2 text-sm leading-5 text-gray-600 line-clamp-2">
                  {category.summary}
                </p>
              </div>

              <div className="mt-auto pt-3 sm:pt-4">
                <p className="text-xs font-medium text-gray-500 line-clamp-1">
                  {category.buyerNeed}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-gray-500">
                    {category.productCount > 0 ? `${category.productCount} products` : 'View beauty options'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary-700">
                    Explore
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
