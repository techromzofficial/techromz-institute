'use client';

/**
 * CategoryContent - public SL Beauty category listing page.
 *
 * Public category display is backed by SL Beauty frontend constants until
 * backend beauty category/product seed data is ready.
 */

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal, LayoutGrid, List,
  ChevronDown, X,
} from 'lucide-react';
import B2BProductCard from '@/components/product/B2BProductCard';
import Pagination from '@/components/ui/Pagination';
import { SRI_LANKA_CATEGORIES, TRENDING_PRODUCTS } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'best', label: 'Best Match' },
  { value: 'top', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price Low to High' },
  { value: 'price_desc', label: 'Price High to Low' },
];

const PAGE_SIZE = 12;

const CATEGORY_ALIASES = {
  hair: 'hair-care',
  haircare: 'hair-care',
  'hair-care': 'hair-care',
  bath: 'bath-body',
  body: 'bath-body',
  'bath-and-body': 'bath-body',
  'bath-body': 'bath-body',
  tools: 'tools-brushes',
  'beauty-tools': 'tools-brushes',
  'tools-brushes': 'tools-brushes',
  men: 'mens-grooming',
  'mens-grooming': 'mens-grooming',
  'men-grooming': 'mens-grooming',
};

const slugify = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

function normalizeCategorySlug(slug = '') {
  return CATEGORY_ALIASES[slug] || slug;
}

function buildBeautyProduct(product, index) {
  const brandSlug = slugify(product.brand_name);

  return {
    id: product.slug,
    slug: product.slug,
    name: product.label,
    image: product.image,
    price: product.price,
    price_min: product.price,
    currency_code: product.currency_code || 'LKR',
    unit: index % 5 === 0 ? 'Set' : 'Item',
    moq: index % 4 === 0 ? 2 : 1,
    minOrder: index % 4 === 0 ? 2 : 1,
    rating: product.rating,
    average_rating: product.rating,
    reviews_count: 24 + (index * 6),
    category: product.category,
    category_name: product.category?.label,
    supplier: {
      id: brandSlug,
      slug: brandSlug,
      name: product.brand_name,
      company_name: product.brand_name,
      location: 'Sri Lanka',
      verified: true,
    },
    supplier_id: brandSlug,
    verified: true,
    audited: true,
    featured: index < 6,
    is_original_brand: true,
    lead_time_days: [2, 3, 5, 7][index % 4],
    port: ['Colombo delivery', 'Islandwide delivery', 'Express delivery'][index % 3],
    supply_ability: 'Authentic beauty product',
    status: index < 6 ? 'featured' : 'active',
  };
}

export default function CategoryContent({ slug }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const normalizedSlug = normalizeCategorySlug(slug);
  const page = Number(searchParams.get('page') || 1);
  const sort = searchParams.get('sort') || 'newest';
  const urlPriceMin = searchParams.get('price_min') || '';
  const urlPriceMax = searchParams.get('price_max') || '';

  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(urlPriceMin);
  const [priceMax, setPriceMax] = useState(urlPriceMax);

  const categories = SRI_LANKA_CATEGORIES;
  const category = categories.find((item) => item.slug === normalizedSlug) || {
    slug: normalizedSlug,
    label: 'Beauty Products',
  };
  const related = categories.filter((item) => item.slug !== category.slug).slice(0, 8);

  useEffect(() => {
    setPriceMin(urlPriceMin);
    setPriceMax(urlPriceMax);
  }, [urlPriceMin, urlPriceMax]);

  const pushFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceMin) params.set('price_min', priceMin); else params.delete('price_min');
    if (priceMax) params.set('price_max', priceMax); else params.delete('price_max');
    params.set('page', '1');
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const pushSort = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const pushPage = (nextPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const filteredProducts = useMemo(() => {
    const min = Number(urlPriceMin);
    const max = Number(urlPriceMax);
    const matching = TRENDING_PRODUCTS.filter((product) => product.category?.slug === category.slug);
    const sourceProducts = matching.length > 0 ? matching : TRENDING_PRODUCTS.slice(0, 8);

    const priced = sourceProducts
      .map(buildBeautyProduct)
      .filter((product) => (!urlPriceMin || product.price >= min) && (!urlPriceMax || product.price <= max));

    return [...priced].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'top') return b.rating - a.rating;
      if (sort === 'best') return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
      return TRENDING_PRODUCTS.findIndex((item) => item.slug === b.slug) - TRENDING_PRODUCTS.findIndex((item) => item.slug === a.slug);
    });
  }, [category.slug, sort, urlPriceMax, urlPriceMin]);

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const products = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const FilterPanel = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-sm text-gray-800">Beauty filters</h3>

      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sort By</div>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => pushSort(option.value)}
            className={`block w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-colors ${sort === option.value ? 'bg-primary-50 text-primary-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Price (LKR)</div>
        <div className="flex gap-1.5 items-center mb-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-primary-400"
          />
          <span className="text-gray-300">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <button type="button" onClick={pushFilters} className="w-full py-1.5 bg-primary-800 text-white text-xs font-semibold rounded-lg">
          Apply Price
        </button>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Related</div>
        <div className="space-y-0.5">
          {related.map((item) => (
            <a
              key={item.slug}
              href={`/categories/${item.slug}`}
              className="block px-2 py-1.5 text-[13px] text-primary-700 hover:bg-primary-50 rounded-lg truncate"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-5 pb-4 border-b border-gray-100">
        <div className="text-sm text-gray-400 mb-1 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-primary-700">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-700">Products</Link>
          <span>/</span>
          <span className="text-gray-700">{category.label}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">SL Beauty category</p>
            <h1 className="mt-1 text-xl font-bold text-gray-800">{category.label}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total.toLocaleString()} beauty products available
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <aside className="hidden lg:block flex-shrink-0 w-48">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sticky top-20">
            <FilterPanel />
          </div>
        </aside>

        {filtersOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="relative w-72 bg-white h-full overflow-y-auto p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <FilterPanel />
              <button
                onClick={() => setFiltersOpen(false)}
                className="mt-4 w-full py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl"
              >
                Show Results ({total})
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Sort:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) => pushSort(event.target.value)}
                    className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none shadow-sm cursor-pointer"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 ${view === 'grid' ? 'bg-primary-800 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 ${view === 'list' ? 'bg-primary-800 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                  title="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No beauty products found in this category yet.</h3>
              <p className="text-sm text-gray-400 mb-4">Explore other beauty categories or check back soon.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Shop All Beauty Products
              </Link>
            </div>
          ) : (
            <>
              <div className={view === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'}
              >
                {products.map((product) => (
                  <B2BProductCard key={product.id} product={product} viewMode={view} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={pushPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
