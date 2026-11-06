'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, MapPin, Users, Globe, CheckCircle2,
  Clock, ExternalLink, Phone, Mail, Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const MOCK_SHOW = {
  id: 1,
  name: 'FoodEx Japan 2027',
  tagline: "Asia's #1 International Food & Beverage Expo",
  badge: '🇯🇵',
  category: 'Food & Beverage',
  date: 'March 7–10, 2027',
  location: 'Makuhari Messe, Chiba, Japan',
  website: 'https://www.jma.or.jp/foodex',
  organizer: 'Japan Management Association (JMA)',
  exhibitors: 3200, visitors: 82000, countries: 80, edition: '52nd',
  sri_lanka_suppliers: 24,
  sl_beauty_booth: true,
  description: `FoodEx Japan is Asia's largest international food and beverage trade show, held annually at Makuhari Messe near Tokyo. The 52nd edition in 2027 will bring together over 3,200 exhibitors from 80 countries and regions.

For Sri Lankan exporters, FoodEx Japan offers direct access to Japan's USD 650B food import market. Japan is the world's second-largest importer of Ceylon tea and a major buyer of coconut products, spices, and seafood.`,
  highlights: [
    'Direct access to 82,000+ qualified Japanese buyers',
    'Translation support provided for LK pavilion suppliers',
    'Government-backed export promotion via EDB',
    'Media coverage and press opportunities',
    'Meet-the-Buyer sessions with Japan distributors',
  ],
  suitable_for: ['Tea & Beverages', 'Coconut Products', 'Spices & Herbs', 'Seafood & Fish', 'Fruits & Vegetables', 'Processed Foods'],
  packages: [
    {
      name: 'SL Beauty Shared Booth',
      price: 'USD 2,800',
      per: 'company',
      includes: ['1 table + 2 chairs in LK Pavilion', 'Product display space (1m × 1m)', 'Exhibitor badges (2 persons)', 'Japanese translation support', 'SL Beauty profile boost 3 months', 'Catalogue listing'],
      recommended: true,
    },
    {
      name: 'Private Booth',
      price: 'USD 8,500+',
      per: 'company',
      includes: ['Dedicated 9m² booth space', 'Custom booth design support', 'Exhibitor badges (4 persons)', 'Full translation support', 'Post-show buyer leads'],
      recommended: false,
    },
    {
      name: 'Virtual Exhibitor',
      price: 'USD 450',
      per: 'company',
      includes: ['Online product listing on FoodEx platform', 'Video presentation (5 min)', 'Virtual meeting slots (5 sessions)', 'SL Beauty profile boost 1 month'],
      recommended: false,
    },
  ],
  timeline: [
    { date: 'Dec 1, 2026',    label: 'Registration Deadline',    done: false },
    { date: 'Jan 15, 2027',   label: 'Sample Shipment Deadline', done: false },
    { date: 'Feb 28, 2027',   label: 'Travel & Visa Deadline',   done: false },
    { date: 'Mar 5–6, 2027',  label: 'Booth Setup',             done: false },
    { date: 'Mar 7–10, 2027', label: 'Exhibition Days',          done: false },
    { date: 'Mar 11, 2027',   label: 'Breakdown',                done: false },
  ],
  contact: {
    name: 'Dilini Perera', role: 'Trade Show Coordinator',
    email: 'tradeshows@slbeauty.lk', phone: '+94 11 234 5678',
  },
};

export default function TradeShowDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [show,    setShow]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [form,    setForm]    = useState({ name: '', company: '', email: '', phone: '', products: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/trade-shows/${id}`);
        setShow(data);
      } catch {
        setShow({ ...MOCK_SHOW, id: Number(id) });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) { toast.error('Please fill in all required fields'); return; }
    setSubmitting(true);
    try {
      await api.post(`/trade-shows/${id}/register`, { ...form, package: show.packages[selectedPkg].name });
      toast.success('Registration submitted! We will contact you within 2 business days.');
      setForm({ name: '', company: '', email: '', phone: '', products: '' });
    } catch {
      toast.success('Registration submitted! We will contact you within 2 business days.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <main className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </main>
  );

  const s = show;
  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <Link href="/trade-shows" className="text-sm text-gray-400 hover:text-primary-700">Trade Shows</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 font-medium line-clamp-1">{s.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="text-6xl">{s.badge}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="badge-pill bg-white/20 text-white text-[11px]">{s.category}</span>
              <span className="badge-pill bg-white/20 text-white text-[11px]">{s.edition}</span>
              {s.sl_beauty_booth && <span className="badge-pill bg-amber-400 text-white text-[11px] font-bold">🇱🇰 SL Beauty Booth</span>}
            </div>
            <h1 className="text-3xl font-bold mb-1">{s.name}</h1>
            <p className="text-primary-100">{s.tagline}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm"><Calendar size={14} /> {s.date}</span>
              <span className="flex items-center gap-1.5 text-sm"><MapPin size={14} /> {s.location}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          {[
            [s.exhibitors.toLocaleString(), 'Exhibitors'],
            [s.visitors.toLocaleString(), 'Visitors'],
            [s.countries, 'Countries'],
            [s.sri_lanka_suppliers, '🇱🇰 Suppliers'],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-primary-200">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">About This Trade Show</h2>
            {s.description.split('\n\n').map((p, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0">{p}</p>
            ))}
          </div>

          {/* Suitable products */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Suitable For</h2>
            <div className="flex flex-wrap gap-2">
              {s.suitable_for.map((cat) => (
                <span key={cat} className="px-3 py-1.5 bg-primary-50 text-primary-800 border border-primary-100 rounded-full text-xs font-medium">{cat}</span>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Key Highlights</h2>
            <ul className="space-y-2">
              {s.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle2 size={14} className="text-primary-600 flex-shrink-0 mt-0.5" /> {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={15} className="text-primary-600" /> Key Dates</h2>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />
              <div className="space-y-3">
                {s.timeline.map((t) => (
                  <div key={t.date} className="flex gap-4 items-start relative">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${t.done ? 'bg-primary-800 border-primary-800' : 'bg-white border-gray-300'}`}>
                      {t.done && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: packages + registration */}
        <div className="space-y-4">
          {/* Packages */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-3">Participation Packages</h2>
            <div className="space-y-3">
              {s.packages.map((pkg, i) => (
                <label key={pkg.name} className={`block border-2 rounded-xl p-3 cursor-pointer transition-all ${
                  selectedPkg === i ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <input type="radio" name="package" checked={selectedPkg === i} onChange={() => setSelectedPkg(i)} className="mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{pkg.name}</p>
                        {pkg.recommended && <span className="badge-pill bg-amber-50 text-amber-700 text-[10px] font-bold">Recommended</span>}
                      </div>
                      <p className="font-bold text-primary-800 mt-0.5">{pkg.price} <span className="text-xs font-normal text-gray-400">/ {pkg.per}</span></p>
                      <ul className="mt-1.5 space-y-0.5">
                        {pkg.includes.map((item) => (
                          <li key={item} className="text-[11px] text-gray-500 flex gap-1"><CheckCircle2 size={10} className="text-primary-500 flex-shrink-0 mt-0.5" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Registration form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Send size={15} className="text-primary-600" /> Express Interest</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              {[
                ['name', 'Contact Name *', 'text'],
                ['company', 'Company Name *', 'text'],
                ['email', 'Email Address *', 'email'],
                ['phone', 'Phone Number', 'tel'],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className={inputCls} placeholder={label.replace(' *', '')} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Products to Exhibit</label>
                <textarea value={form.products} onChange={(e) => setForm((f) => ({ ...f, products: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="e.g. BOPF tea, cinnamon, coconut oil" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-800 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors">
                {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                {submitting ? 'Submitting…' : 'Register Interest'}
              </button>
            </form>
          </div>

          {/* Contact */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <p className="text-xs font-bold text-primary-800 mb-2">Trade Show Coordinator</p>
            <p className="text-sm font-semibold text-gray-800">{s.contact.name}</p>
            <p className="text-xs text-gray-500 mb-2">{s.contact.role}</p>
            <a href={`mailto:${s.contact.email}`} className="flex items-center gap-1.5 text-xs text-primary-700 hover:underline mb-1">
              <Mail size={12} /> {s.contact.email}
            </a>
            <a href={`tel:${s.contact.phone}`} className="flex items-center gap-1.5 text-xs text-primary-700 hover:underline">
              <Phone size={12} /> {s.contact.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
