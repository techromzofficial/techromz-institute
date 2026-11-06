'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, ThumbsUp, Filter, Search, MessageSquare,
  Package, Truck, Phone, Wrench, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';
import Pagination from '@/components/ui/Pagination';

/* ── Mock data ─────────────────────────────────────── */
const MOCK_REVIEWS = [
  {
    id: 1, type: 'product',
    product: { id: 42, name: 'Premium BOPF Ceylon Black Tea 500g', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80' },
    supplier: { id: 7, name: 'Ceylon Exports (Pvt) Ltd.' },
    buyer: 'Nature Direct USA', buyer_country: 'US',
    date: '2026-06-18',
    ratings: { quality: 5, delivery: 5, communication: 5, service: 4 },
    overall: 5,
    title: 'Exceptional quality — exactly as described',
    body: 'The BOPF grade tea was exactly what we ordered. Full documentation provided. On-time delivery to Los Angeles port. We have placed a repeat order already.',
    helpful: 24, verified: true,
    order_id: 'ECL-20260510-001',
  },
  {
    id: 2, type: 'product',
    product: { id: 19, name: 'Virgin Coconut Oil 5L — Export Grade', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80' },
    supplier: { id: 12, name: 'Lanka Coconut Products' },
    buyer: 'Wellness World GmbH', buyer_country: 'DE',
    date: '2026-06-10',
    ratings: { quality: 5, delivery: 4, communication: 5, service: 5 },
    overall: 5,
    title: 'Best coconut oil supplier we have found',
    body: 'Cold-pressed, unrefined, and genuinely organic. The scent and taste are perfect for our premium product line. Supplier was very responsive throughout the process.',
    helpful: 18, verified: true,
    order_id: 'ECL-20260430-003',
  },
  {
    id: 3, type: 'supplier',
    product: null,
    supplier: { id: 7, name: 'Ceylon Exports (Pvt) Ltd.' },
    buyer: 'Organic Market KR', buyer_country: 'KR',
    date: '2026-06-05',
    ratings: { quality: 4, delivery: 5, communication: 5, service: 5 },
    overall: 5,
    title: 'Highly professional — best Sri Lankan exporter we have worked with',
    body: 'Third purchase from this supplier. They always deliver on time, never cut corners on documentation, and proactively communicate any shipping updates. Recommended.',
    helpful: 31, verified: true,
    order_id: 'ECL-20260415-002',
  },
  {
    id: 4, type: 'product',
    product: { id: 33, name: 'Ceylon Cinnamon Sticks 1Kg', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80' },
    supplier: { id: 9, name: 'High Grown Tea Exporters' },
    buyer: 'Spice Route LLC', buyer_country: 'AE',
    date: '2026-05-28',
    ratings: { quality: 4, delivery: 3, communication: 4, service: 4 },
    overall: 4,
    title: 'Good quality, slight delay in shipping',
    body: 'The cinnamon quality was very good — authentic Ceylon variety with a sweet flavour profile. Shipping was delayed by 4 days but supplier communicated the issue in advance.',
    helpful: 9, verified: true,
    order_id: 'ECL-20260410-007',
  },
  {
    id: 5, type: 'product',
    product: { id: 51, name: 'Batik Sarong Mixed Set — Handmade', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80' },
    supplier: { id: 18, name: 'Lanka Handloom Arts' },
    buyer: 'Kanzuki Trading JP', buyer_country: 'JP',
    date: '2026-05-15',
    ratings: { quality: 5, delivery: 5, communication: 4, service: 5 },
    overall: 5,
    title: 'Stunning handmade quality — perfect for our boutique',
    body: 'Each sarong is uniquely beautiful. The batik patterns are precisely what was shown in the product photos. Our customers love them. We will continue ordering monthly.',
    helpful: 42, verified: true,
    order_id: 'ECL-20260401-009',
  },
];

const MOCK_STATS = {
  overall: 4.8, total: 1247,
  distribution: [
    { stars: 5, count: 884, pct: 71 },
    { stars: 4, count: 249, pct: 20 },
    { stars: 3, count: 75,  pct: 6 },
    { stars: 2, count: 25,  pct: 2 },
    { stars: 1, count: 14,  pct: 1 },
  ],
  categories: {
    quality:       4.9,
    delivery:      4.7,
    communication: 4.8,
    service:       4.8,
  },
};

const CATEGORY_ICONS = {
  quality: Package, delivery: Truck, communication: Phone, service: Wrench,
};
const CATEGORY_LABELS = {
  quality: 'Product Quality', delivery: 'Delivery', communication: 'Communication', service: 'Service',
};

const FLAG = { US: '🇺🇸', DE: '🇩🇪', JP: '🇯🇵', KR: '🇰🇷', AE: '🇦🇪', GB: '🇬🇧', AU: '🇦🇺', LK: '🇱🇰' };

function StarRow({ count, value = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={count} className={i < Math.floor(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function ReviewCard({ review, onHelpful }) {
  const [liked, setLiked] = useState(false);
  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    onHelpful?.(review.id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {review.product?.image ? (
          <Image src={review.product.image} alt="" width={48} height={48} unoptimized
            className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-800 font-bold text-xl flex items-center justify-center flex-shrink-0">
            {review.supplier.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {review.product ? (
            <Link href={`/products/${review.product.id}`} className="font-semibold text-gray-800 text-sm hover:text-primary-700 line-clamp-1">
              {review.product.name}
            </Link>
          ) : (
            <Link href={`/suppliers/${review.supplier.id}`} className="font-semibold text-gray-800 text-sm hover:text-primary-700">
              {review.supplier.name}
            </Link>
          )}
          {review.product && (
            <Link href={`/suppliers/${review.supplier.id}`} className="text-xs text-gray-400 hover:text-primary-700">
              by {review.supplier.name}
            </Link>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRow count={13} value={review.overall} />
            <span className="text-xs font-bold text-amber-700">{review.overall}.0</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {review.verified && (
            <span className="badge-pill bg-green-50 text-green-700 text-[10px] block mb-1">✓ Verified Purchase</span>
          )}
          <span className="text-[10px] text-gray-400">{review.date}</span>
        </div>
      </div>

      {/* Review body */}
      <h3 className="font-semibold text-gray-800 text-sm mb-1">{review.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>

      {/* Per-category ratings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50">
        {Object.entries(review.ratings).map(([cat, val]) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <div key={cat} className="flex flex-col items-center gap-1">
              <Icon size={13} className="text-gray-400" />
              <StarRow count={11} value={val} />
              <span className="text-[10px] text-gray-400">{CATEGORY_LABELS[cat]}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{FLAG[review.buyer_country]} {review.buyer}</span>
          <span className="text-gray-200">·</span>
          <Link href={`/orders/${review.order_id}`} className="text-xs text-gray-400 hover:text-primary-700 font-mono">{review.order_id}</Link>
        </div>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            liked ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
          }`}
        >
          <ThumbsUp size={12} /> Helpful ({review.helpful + (liked ? 1 : 0)})
        </button>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats,   setStats]   = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [stars,   setStars]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 5;

  useEffect(() => {
    const load = async () => {
      try {
        const [rv, st] = await Promise.all([api.get('/reviews'), api.get('/reviews/stats')]);
        setReviews(rv.data || rv);
        setStats(st);
      } catch {
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markHelpful = async (id) => {
    try { await api.post(`/reviews/${id}/helpful`); } catch { /* ok */ }
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
  };

  const filtered = reviews.filter((r) => {
    const matchType   = filter === 'all' || r.type === filter;
    const matchStars  = !stars || r.overall === stars;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.body.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStars && matchSearch;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-sm text-gray-500">{stats.total.toLocaleString()} verified reviews from global buyers</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats sidebar */}
        <div className="space-y-4">
          {/* Overall score */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-5xl font-bold text-gray-900 mb-1">{stats.overall}</div>
            <StarRow count={20} value={stats.overall} />
            <p className="text-sm text-gray-400 mt-1">{stats.total.toLocaleString()} reviews</p>
          </div>

          {/* Star distribution */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rating Breakdown</h3>
            <div className="space-y-2">
              {stats.distribution.map((d) => (
                <button
                  key={d.stars}
                  onClick={() => { setStars(stars === d.stars ? 0 : d.stars); setPage(1); }}
                  className={`w-full flex items-center gap-2 group transition-all rounded-lg px-1 ${stars === d.stars ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-1 w-12 justify-end flex-shrink-0">
                    <span className="text-xs text-gray-500">{d.stars}</span>
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 flex-shrink-0">{d.pct}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category scores */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([cat, val]) => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <Icon size={13} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs text-gray-500">{CATEGORY_LABELS[cat]}</span>
                        <span className="text-xs font-semibold text-gray-700">{val}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(val / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search reviews…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[['all','All'],['product','Products'],['supplier','Suppliers']].map(([val, label]) => (
                <button key={val} onClick={() => { setFilter(val); setPage(1); }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {stars > 0 && (
              <button onClick={() => setStars(0)} className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg">
                {stars}★ <span className="text-amber-400">×</span>
              </button>
            )}
          </div>

          {loading ? (
            <RowSkeleton rows={3} />
          ) : paged.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No reviews match your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paged.map((r) => (
                <ReviewCard key={r.id} review={r} onHelpful={markHelpful} />
              ))}
            </div>
          )}

          {!loading && filtered.length > PER_PAGE && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filtered.length / PER_PAGE)}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </main>
  );
}
