'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BadgeCheck, Star, MapPin, Package } from 'lucide-react';
import { suppliersApi } from '@/lib/api';
import useCategories from '@/hooks/useCategories';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SuppliersContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const category = searchParams.get('category') || '';
  const verified  = searchParams.get('verified') === '1';
  const page      = Number(searchParams.get('page') || 1);
  const q         = searchParams.get('q') || '';

  const [suppliers,   setSuppliers]   = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [reloadKey,   setReloadKey]   = useState(0);
  const [selCat,      setSelCat]      = useState(category);
  const [verifiedOnly,setVerifiedOnly]= useState(verified);
  const { categories, loading: categoriesLoading, error: categoriesError, retry: retryCategories } = useCategories();

  const pushParams = (updates) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, String(v)) : p.delete(k));
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) p.set('page', '1');
    router.push(`/suppliers?${p.toString()}`);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await suppliersApi.list({ search: q, category, verified: verified ? 1 : undefined, page });
        setSuppliers(data.data || data.suppliers || []);
        setTotalPages(data.last_page || 1);
      } catch (loadError) {
        setSuppliers([]);
        setTotalPages(1);
        setError(loadError.message || 'Could not load suppliers.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, category, verified, page, reloadKey]);

  useEffect(() => {
    setSelCat(category);
    setVerifiedOnly(verified);
  }, [category, verified]);

  return (
    <div className="flex gap-5">
      {/* Sidebar */}
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4 sticky top-20">
          <h3 className="font-semibold text-sm text-gray-800">Filter Suppliers</h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => { setVerifiedOnly(e.target.checked); pushParams({ verified: e.target.checked ? 1 : '' }); }}
              className="w-4 h-4 rounded border-gray-300 text-primary-700" />
            <span className="text-sm text-gray-700">Verified Only</span>
          </label>

          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</div>
            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              <button onClick={() => { setSelCat(''); pushParams({ category: '' }); }}
                className={`w-full text-left text-sm px-2 py-1.5 rounded ${!selCat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                All
              </button>
              {categories.map((c) => (
                <button key={c.slug} onClick={() => { setSelCat(c.slug); pushParams({ category: c.slug }); }}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded flex items-center gap-1.5 ${selCat === c.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="line-clamp-1">{c.label}</span>
                </button>
              ))}
              {categoriesLoading && <p className="px-2 py-1.5 text-xs text-gray-400">Loading categories…</p>}
              {categoriesError && (
                <button type="button" onClick={retryCategories} className="px-2 py-1.5 text-xs text-red-600 hover:underline">
                  Retry categories
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div className="flex-1 min-w-0">
        {loading ? <LoadingSpinner /> : error ? (
          <div className="py-16 text-center">
            <h3 className="text-gray-700 font-semibold">Suppliers could not be loaded</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="px-5 py-2 bg-primary-800 text-white text-sm font-semibold rounded-lg">
              Retry
            </button>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No suppliers match these filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((s) => (
                <a key={s.id} href={`/suppliers/${s.id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover-lift block">
                  <div className="flex items-start gap-3 mb-3">
                    <Image
                      src={s.logo || s.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'}
                      alt={s.name || s.company_name}
                      width={56}
                      height={56}
                      unoptimized
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{s.name || s.company_name}</h3>
                        {s.verified && <BadgeCheck size={14} className="text-primary-700 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <MapPin size={10} /> {s.location || [s.city, s.country].filter(Boolean).join(', ') || 'Location unavailable'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="font-medium text-gray-700">{Number(s.rating || 0).toFixed(1)}</span>
                      <span className="text-gray-400">({s.reviews ?? s.reviews_count ?? 0})</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Package size={11} />
                      {s.products ?? s.products_count ?? 0} products
                    </div>
                    {s.since && <span>Est. {s.since}</span>}
                  </div>

                  {s.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.categories.slice(0, 3).map((c) => (
                        <span key={c} className="badge-pill bg-primary-50 text-primary-700">{c}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => pushParams({ page: String(p) })} />
          </>
        )}
      </div>
    </div>
  );
}
