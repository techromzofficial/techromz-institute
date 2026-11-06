'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Tag, Search, ArrowRight, Globe, Filter } from 'lucide-react';

const TRADE_SHOWS = [
  {
    id: 1, status: 'upcoming', featured: true,
    name: 'FoodEx Japan 2027', category: 'Food & Beverage',
    date: '2027-03-07', date_end: '2027-03-10', location: 'Makuhari Messe, Chiba, Japan',
    description: 'Asia\'s leading international food and beverage trade show. Connect with Japan\'s top importers and distributors.',
    exhibitors: 3200, visitors: 82000, sri_lanka_suppliers: 24,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: '🇯🇵', deadline: '2026-12-01', sl_beauty_booth: true,
    tags: ['Tea', 'Coconut', 'Spices', 'Seafood'],
  },
  {
    id: 2, status: 'upcoming', featured: true,
    name: 'Anuga 2027', category: 'Food & Beverage',
    date: '2027-10-04', date_end: '2027-10-08', location: 'Cologne Exhibition Centre, Germany',
    description: 'The world\'s leading food and beverage trade fair. 8 days, 170 countries, 7,900+ exhibitors.',
    exhibitors: 7900, visitors: 170000, sri_lanka_suppliers: 41,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: '🇩🇪', deadline: '2027-04-01', sl_beauty_booth: true,
    tags: ['Tea', 'Organic', 'Spices', 'Confectionery'],
  },
  {
    id: 3, status: 'upcoming',
    name: 'Gulfood 2027', category: 'Food & Beverage',
    date: '2027-02-17', date_end: '2027-02-21', location: 'Dubai World Trade Centre, UAE',
    description: 'The Middle East\'s premier food and hospitality show. Gateway to GCC markets.',
    exhibitors: 5000, visitors: 97000, sri_lanka_suppliers: 19,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: '🇦🇪', deadline: '2026-10-15', sl_beauty_booth: false,
    tags: ['Tea', 'Coconut', 'Rice', 'Fish'],
  },
  {
    id: 4, status: 'upcoming',
    name: 'Canton Fair — Spring 2027', category: 'General Trade',
    date: '2027-04-15', date_end: '2027-05-05', location: 'Guangzhou, China',
    description: 'China\'s largest import/export fair. Over 24,000 exhibitors across all sectors.',
    exhibitors: 24000, visitors: 190000, sri_lanka_suppliers: 8,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: '🇨🇳', deadline: '2026-12-30', sl_beauty_booth: false,
    tags: ['General', 'Textiles', 'Gems', 'Rubber'],
  },
  {
    id: 5, status: 'past',
    name: 'SAITEX 2026 (Virtual)', category: 'General Trade',
    date: '2026-04-20', date_end: '2026-04-22', location: 'Virtual / Online',
    description: 'South Asian International Trade Exhibition — online edition for Sri Lankan exporters.',
    exhibitors: 340, visitors: 12000, sri_lanka_suppliers: 95,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: '🇱🇰', deadline: null, sl_beauty_booth: true,
    tags: ['All Categories'],
  },
  {
    id: 6, status: 'upcoming',
    name: 'BIOFACH 2027', category: 'Organic & Natural',
    date: '2027-02-11', date_end: '2027-02-14', location: 'Nuremberg, Germany',
    description: 'The world\'s leading trade fair for organic food. Essential for certified organic exporters.',
    exhibitors: 3100, visitors: 49000, sri_lanka_suppliers: 12,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: '🇩🇪', deadline: '2026-09-01', sl_beauty_booth: false,
    tags: ['Organic', 'Tea', 'Coconut', 'Spices'],
  },
];

const CATEGORIES = ['All', 'Food & Beverage', 'General Trade', 'Organic & Natural', 'Textiles & Gems'];

export default function TradeShowsPage() {
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState('All');
  const [status,   setStatus]   = useState('upcoming');

  const filtered = TRADE_SHOWS.filter((show) => {
    const matchSearch = !search || show.name.toLowerCase().includes(search.toLowerCase()) || show.location.toLowerCase().includes(search.toLowerCase());
    const matchCat    = tab === 'All' || show.category === tab;
    const matchStatus = status === 'all' || show.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const featured = filtered.filter((s) => s.featured && s.status === 'upcoming');
  const rest     = filtered.filter((s) => !s.featured || s.status !== 'upcoming');

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe size={22} className="text-primary-600" /> Trade Shows & Events
        </h1>
        <p className="text-sm text-gray-500 mt-1">Exhibit at global trade fairs and connect with international buyers</p>
      </div>

      {/* SL Beauty booth banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider mb-1">🇱🇰 Sri Lanka Pavilion</p>
            <h2 className="text-xl font-bold mb-1">Exhibit under the SL Beauty Brand</h2>
            <p className="text-primary-100 text-sm">Share a booth with us at FoodEx Japan, Anuga, and other key shows. Reduced costs, shared logistics, translation support.</p>
          </div>
          <Link href="/contact-support?subject=trade-show"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-800 font-bold text-sm rounded-xl hover:bg-primary-50 transition-colors flex-shrink-0">
            Express Interest <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search trade shows…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
          {[['upcoming','Upcoming'],['past','Past'],['all','All']].map(([val, label]) => (
            <button key={val} onClick={() => setStatus(val)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                status === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setTab(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              tab === cat ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured shows */}
      {featured.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Tag size={15} className="text-amber-500" /> Featured</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {featured.map((show) => (
              <Link key={show.id} href={`/trade-shows/${show.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
                  <span className="text-6xl opacity-20">{show.badge}</span>
                  <div className="absolute inset-0 flex items-end p-4">
                    <div className="flex gap-2 flex-wrap">
                      {show.tags.slice(0, 3).map((t) => (
                        <span key={t} className="badge-pill bg-white/80 text-gray-700 text-[10px] backdrop-blur-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    {show.sl_beauty_booth && (
                      <span className="badge-pill bg-primary-800 text-white text-[10px] font-bold">🇱🇰 SL Beauty Booth</span>
                    )}
                    <span className="badge-pill bg-green-500 text-white text-[10px] font-bold">Featured</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{show.name}</h3>
                    <span className="text-2xl flex-shrink-0">{show.badge}</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar size={12} className="text-gray-400" /> {show.date} → {show.date_end}</p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={12} className="text-gray-400" /> {show.location}</p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{show.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-3">
                    {[
                      [show.exhibitors.toLocaleString(), 'Exhibitors'],
                      [show.visitors.toLocaleString(), 'Visitors'],
                      [show.sri_lanka_suppliers, 'LK Suppliers'],
                    ].map(([val, label]) => (
                      <div key={label}><p className="text-sm font-bold text-gray-800">{val}</p><p className="text-[10px] text-gray-400">{label}</p></div>
                    ))}
                  </div>
                  {show.deadline && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-3">
                      📅 Registration deadline: {show.deadline}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All other shows */}
      {rest.length > 0 && (
        <div>
          {featured.length > 0 && <h2 className="font-bold text-gray-900 mb-3">All Events</h2>}
          <div className="space-y-3">
            {rest.map((show) => (
              <Link key={show.id} href={`/trade-shows/${show.id}`}
                className="group flex gap-4 items-center bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-primary-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
                  {show.badge}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">{show.name}</h3>
                    {show.status === 'past' && <span className="badge-pill bg-gray-100 text-gray-500 text-[10px]">Past</span>}
                    {show.sl_beauty_booth && <span className="badge-pill bg-primary-50 text-primary-700 text-[10px]">🇱🇰 LK Booth</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={11} /> {show.date}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} /> {show.location}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={11} /> {show.sri_lanka_suppliers} LK suppliers</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <Globe size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No trade shows found</p>
        </div>
      )}
    </main>
  );
}
