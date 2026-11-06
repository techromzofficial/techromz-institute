'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, BookOpen, HelpCircle, MessageCircle, Mail, Phone,
  ChevronDown, ChevronRight, Package, Truck, CreditCard,
  ShieldCheck, Globe, FileText, Star, Users,
} from 'lucide-react';

const CATEGORIES = [
  { icon: Package,     label: 'Shopping on SL Beauty', color: 'text-blue-600 bg-blue-50',    href: '/buyer-guide' },
  { icon: Globe,       label: 'Brands & Partners',  color: 'text-primary-700 bg-primary-50', href: '/partners' },
  { icon: CreditCard,  label: 'Payments & Finance',   color: 'text-green-600 bg-green-50',  href: '/help-center/payments' },
  { icon: Truck,       label: 'Shipping & Logistics', color: 'text-purple-600 bg-purple-50', href: '/help-center/shipping' },
  { icon: ShieldCheck, label: 'Trust & Safety',        color: 'text-rose-600 bg-rose-50',    href: '/help-center/safety' },
  { icon: FileText,    label: 'Orders & Disputes',    color: 'text-amber-600 bg-amber-50',  href: '/help-center/orders' },
  { icon: Users,       label: 'Accounts & Settings',  color: 'text-indigo-600 bg-indigo-50', href: '/settings' },
  { icon: Star,        label: 'Reviews & Ratings',    color: 'text-orange-600 bg-orange-50', href: '/reviews' },
];

const FAQS = [
  {
    category: 'Buying',
    items: [
      {
        q: 'How do I find original beauty brands on SL Beauty?',
        a: 'Look for original brand and verified seller indicators on product and brand pages. Brand partners may be reviewed for authorization documents, product authenticity, and compliance requirements.',
      },
      {
        q: 'How do I shop beauty products?',
        a: 'Browse products by makeup, skincare, fragrance, hair care, bath and body, or brands. Open a product page to view details, add it to your wishlist, or add it to your basket.',
      },
      {
        q: 'Is my payment protected?',
        a: 'SL Beauty keeps checkout and order information protected with secure account flows and clear order tracking. Payment options may vary by launch phase and availability.',
      },
      {
        q: 'Are products original?',
        a: 'SL Beauty is built around authentic beauty products and approved brand or seller verification workflows. Product pages and brand pages show the available trust indicators.',
      },
      {
        q: 'What if my order is wrong or damaged?',
        a: 'Contact support from your order detail page or the help center. Our team will review the issue and guide you through replacement, return, or refund options.',
      },
    ],
  },
  {
    category: 'Brands',
    items: [
      {
        q: 'How do I become a brand partner?',
        a: 'Create an account, choose the brand partner option, and complete the verification information requested by SL Beauty.',
      },
      {
        q: 'What documents do I need for brand verification?',
        a: 'Verification may include business registration, brand authorization, distributor letters, product authenticity documents, and compliance details for beauty products.',
      },
      {
        q: 'How much does it cost to list products?',
        a: 'Partner listing options can vary by launch phase. Contact SL Beauty for brand onboarding, product listing, and promotional placement details.',
      },
      {
        q: 'Can I promote new launches?',
        a: 'Yes. Brand partners can request placement in New Arrivals, Best Sellers, Sale & Offers, and curated beauty collections once approval workflows are available.',
      },
    ],
  },
  {
    category: 'Shipping',
    items: [
      {
        q: 'What delivery options are available?',
        a: 'Delivery options may include standard, express, and selected area delivery depending on item availability and launch-phase operations.',
      },
      {
        q: 'How do I track my shipment?',
        a: 'Once shipped, you\'ll receive a tracking number by email and in your Order Detail page. Go to Orders → Order ID → Track Shipment for real-time status with carrier events, customs clearance, and ETA.',
      },
      {
        q: 'What about customs and import duties?',
        a: 'Some beauty products may be subject to delivery restrictions or compliance checks. Product pages will show important warnings when applicable.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 py-4 text-left group">
        <span className={`text-sm font-medium transition-colors ${open ? 'text-primary-800' : 'text-gray-800 group-hover:text-primary-700'}`}>
          {q}
        </span>
        {open ? <ChevronDown size={16} className="text-primary-600 flex-shrink-0 mt-0.5" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="pb-4">
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  const [search,   setSearch]   = useState('');
  const [faqTab,   setFaqTab]   = useState('Buying');

  const filteredFAQs = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) => !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How can we help?</h1>
        <p className="text-gray-500 mb-6">Find answers, guides, and support for SL Beauty Platform</p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search help articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4 text-center">Browse by Topic</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((topic) => {
            const Icon = topic['icon'];
            return (
              <Link key={topic.href} href={topic.href}
                className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.color}`}>
                  <Icon size={19} />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-800 transition-colors">{topic.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick guides */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/buyer-guide"
          className="group flex items-center gap-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-5 text-white hover:opacity-95 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold">Beauty Shopper Guide</p>
            <p className="text-blue-100 text-sm mt-0.5">Learn how to discover original brands, compare products, and place beauty orders</p>
          </div>
          <ChevronRight size={18} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/partners"
          className="group flex items-center gap-4 bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl p-5 text-white hover:opacity-95 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Globe size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold">Brand Partner Guide</p>
            <p className="text-primary-100 text-sm mt-0.5">Set up brand collections, list beauty products, and manage offers</p>
          </div>
          <ChevronRight size={18} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>

        {!search && (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
            {FAQS.map((cat) => (
              <button key={cat.category} onClick={() => setFaqTab(cat.category)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  faqTab === cat.category ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {cat.category}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5">
          {(search ? filteredFAQs : FAQS.filter((c) => c.category === faqTab)).map((cat) => (
            <div key={cat.category}>
              {search && <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-4 pb-1">{cat.category}</p>}
              {cat.items.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
            </div>
          ))}
          {search && filteredFAQs.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">No results for &quot;{search}&quot;</div>
          )}
        </div>
      </div>

      {/* Contact support */}
      <div id="contact" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-center mb-1">Still need help?</h2>
        <p className="text-sm text-gray-500 text-center mb-5">Our support team is available Mon–Fri, 9 AM–6 PM (IST)</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: MessageCircle, label: 'Live Chat',     desc: 'Chat with us now', href: '/messages', cta: 'Start Chat',   color: 'bg-primary-800' },
            { icon: Mail,          label: 'Email Support', desc: 'support@slbeauty.lk', href: 'mailto:support@slbeauty.lk', cta: 'Send Email', color: 'bg-blue-600' },
            { icon: Phone,         label: 'Phone Support', desc: '+94 11 234 5678', href: 'tel:+94112345678', cta: 'Call Now', color: 'bg-green-600' },
          ].map((channel) => {
            const Icon = channel['icon'];
            return (
              <Link key={channel.label} href={channel.href}
                className="flex flex-col items-center gap-3 p-5 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">{channel.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{channel.desc}</p>
                </div>
                <span className={`px-4 py-1.5 ${channel.color} text-white text-xs font-semibold rounded-full`}>{channel.cta}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
