'use client';

import Link from 'next/link';
import { BadgeCheck, ChevronRight } from 'lucide-react';
import useCategories from '@/hooks/useCategories';

const CATEGORY_PRIORITIES = [
  { label: 'Makeup', keywords: ['makeup', 'cosmetic', 'lipstick', 'foundation'] },
  { label: 'Skincare', keywords: ['skincare', 'skin', 'serum', 'cleanser', 'moisturizer'] },
  { label: 'Fragrance', keywords: ['fragrance', 'perfume', 'cologne'] },
  { label: 'Hair Care', keywords: ['hair', 'shampoo', 'conditioner', 'treatment'] },
  { label: 'Bath & Body', keywords: ['bath', 'body', 'lotion', 'shower'] },
  { label: 'Tools & Brushes', keywords: ['tool', 'brush', 'sponge', 'blender'] },
  { label: 'Wellness', keywords: ['wellness', 'ayurvedic', 'natural', 'supplement'] },
  { label: 'Gift Sets', keywords: ['gift', 'set', 'bundle', 'mini'] },
];

function categoryMatches(category, keywords) {
  const haystack = `${category.slug || ''} ${category.label || ''}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

export default function CategorySidebar() {
  const { categories, loading, error, retry } = useCategories();
  const prioritizedCategories = CATEGORY_PRIORITIES.map((priority) => {
    const match = categories.find((category) => categoryMatches(category, priority.keywords));
    return match ? { ...match, displayLabel: match.label } : null;
  }).filter(Boolean);

  const prioritySlugs = new Set(prioritizedCategories.map((category) => category.slug));
  const remainingCategories = categories.filter((category) => !prioritySlugs.has(category.slug));
  const visibleCategories = [...prioritizedCategories, ...remainingCategories].slice(0, 12);

  return (
    <aside className="hidden lg:block w-52 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 py-2 self-start">
      <div className="px-3 py-2 border-b border-gray-100 mb-1">
        <div className="flex items-center gap-2">
          <BadgeCheck size={14} className="text-primary-700" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Beauty Categories</span>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-gray-400">Authentic beauty brands and retailer-ready collections</p>
      </div>
      <nav className="space-y-0.5 px-1">
        {visibleCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800 group transition-colors"
          >
            <span className="flex-1 text-[13px] leading-tight line-clamp-1">{cat.displayLabel || cat.label}</span>
            <ChevronRight size={12} className="text-gray-300 group-hover:text-primary-600" />
          </Link>
        ))}
        {loading && <p className="px-2 py-2 text-xs text-gray-400">Loading categories…</p>}
        {error && (
          <button type="button" onClick={retry} className="px-2 py-2 text-xs text-red-600 hover:underline">
            Retry categories
          </button>
        )}
      </nav>
      <div className="px-3 pt-2 mt-1 border-t border-gray-100">
        <Link href="/products" className="text-xs text-primary-700 font-medium hover:underline">
          More Categories →
        </Link>
      </div>
    </aside>
  );
}
