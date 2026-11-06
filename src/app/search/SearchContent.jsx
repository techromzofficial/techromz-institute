'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import B2BProductCard from '@/components/product/B2BProductCard';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { productsApi } from '@/lib/api';
import { normalizeProductResponse } from '@/lib/products';
import useCategories from '@/hooks/useCategories';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc','label': 'Price: High → Low' },
  { value: 'newest',    label: 'Newest First' },
  { value: 'top',       label: 'Most Popular' },
];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const q        = searchParams.get('q')        || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'relevance';
  const page     = Number(searchParams.get('page') || 1);
  const urlPriceMin = searchParams.get('price_min') || '';
  const urlPriceMax = searchParams.get('price_max') || '';

  const [products,   setProducts]   = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [reloadKey,  setReloadKey]  = useState(0);
  const [filtersOpen,setFiltersOpen]= useState(false);

  const [priceMin, setPriceMin] = useState(urlPriceMin);
  const [priceMax, setPriceMax] = useState(urlPriceMax);
  const [selCat,   setSelCat]   = useState(category);
  const { categories, loading: categoriesLoading, error: categoriesError, retry: retryCategories } = useCategories();

  const updateQuery = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productsApi.list({
          search: q,
          category,
          sort,
          page,
          price_min: urlPriceMin,
          price_max: urlPriceMax,
        });
        const normalized = normalizeProductResponse(data);
        setProducts(normalized.data);
        setTotalPages(normalized.last_page);
        setTotal(normalized.total);
      } catch (loadError) {
        setProducts([]);
        setTotalPages(1);
        setTotal(0);
        setError(loadError.message || 'Could not load search results.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [q, category, sort, page, urlPriceMin, urlPriceMax, reloadKey]);

  useEffect(() => {
    setSelCat(category);
    setPriceMin(urlPriceMin);
    setPriceMax(urlPriceMax);
  }, [category, urlPriceMin, urlPriceMax]);

  return (
    <div>
      {/* ── Search header ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            {q ? `Results for "${q}"` : 'All Products'}
          </h1>
          {total > 0 && <p className="text-sm text-gray-400">{total.toLocaleString()} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateQuery({ sort: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-5">
        {/* ── Filters sidebar ── */}
        {(filtersOpen) && (
          <aside className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-5 sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-800">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
              </div>

              {/* Category filter */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => { setSelCat(''); updateQuery({ category: '' }); }}
                    className={`block w-full text-left text-sm px-2 py-1 rounded ${!selCat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => { setSelCat(cat.slug); updateQuery({ category: cat.slug }); }}
                      className={`block w-full text-left text-sm px-2 py-1 rounded ${selCat === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                  {categoriesLoading && <p className="px-2 py-1 text-xs text-gray-400">Loading categories…</p>}
                  {categoriesError && (
                    <button type="button" onClick={retryCategories} className="px-2 py-1 text-xs text-red-600 hover:underline">
                      Retry categories
                    </button>
                  )}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Price Range (USD)</div>
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary-400" />
                  <span className="text-gray-400 text-sm">–</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary-400" />
                </div>
                <button
                  type="button"
                  onClick={() => updateQuery({ price_min: priceMin, price_max: priceMax })}
                  className="mt-2 w-full py-1.5 bg-primary-800 text-white text-xs font-semibold rounded-lg"
                >
                  Apply Price
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner label="Searching…" />
          ) : error ? (
            <div className="text-center py-16">
              <Search size={40} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-600 font-medium">Search results could not be loaded</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">{error}</p>
              <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="px-5 py-2 bg-primary-800 text-white text-sm font-semibold rounded-lg">
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Search size={40} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-500 font-medium">No products found</h3>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or{' '}
                <Link href="/rfq" className="text-primary-700 underline">post an RFQ</Link>
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((p) => <B2BProductCard key={p.id} product={p} viewMode="grid" />)}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => updateQuery({ page: String(p) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
