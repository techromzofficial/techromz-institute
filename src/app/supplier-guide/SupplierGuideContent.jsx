'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Rocket, BadgeCheck, Package, FileText, ShoppingCart,
  DollarSign, TrendingUp, ChevronRight, ArrowRight, MessageCircle,
} from 'lucide-react';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'verification', label: 'Verification', icon: BadgeCheck },
  { id: 'listing', label: 'Listing Products', icon: Package },
  { id: 'rfqs', label: 'Responding to RFQs', icon: FileText },
  { id: 'orders', label: 'Managing Orders', icon: ShoppingCart },
  { id: 'payments', label: 'Getting Paid', icon: DollarSign },
  { id: 'growth', label: 'Growing Your Business', icon: TrendingUp },
];

function Step({ n, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-primary-800 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{n}</div>
      <div className="pb-6">
        <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
          <Icon size={17} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SupplierGuideContent() {
  const [active, setActive] = useState('getting-started');

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl p-8 text-white mb-6">
        <p className="text-primary-100 text-xs font-bold uppercase tracking-wider mb-1">Help Center / Supplier Guide</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">The Complete Supplier&apos;s Guide</h1>
        <p className="text-primary-100 max-w-xl">Set up your storefront, get verified, and start exporting to global buyers through SL Beauty.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* TOC sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">On this page</p>
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                    active === s.id ? 'bg-primary-50 text-primary-800 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}>
                  <Icon size={14} /> {s.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-700">Buying instead? See the <Link href="/buyer-guide" className="underline font-medium">Buyer Guide</Link>.</p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Section id="getting-started" title="Getting Started" icon={Rocket}>
            <Step n={1} title="Register and switch to Supplier mode">
              Create your account, then go to Settings → Switch to Supplier Mode. This unlocks the Supplier Dashboard and lets buyers find you in the directory.
            </Step>
            <Step n={2} title="Complete your company profile">
              Add your business type, year established, main products, export markets, and a clear company description — this is the first thing buyers read.
            </Step>
            <Step n={3} title="List your first product">
              Go to Supplier Dashboard → Products → Add Product. Listing up to 10 products is completely free, with no time limit.
            </Step>
          </Section>

          <Section id="verification" title="Verification" icon={BadgeCheck}>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Verified suppliers get significantly more buyer trust and a higher position in search results. Verification has three tiers:
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                ['✅', 'Verified', 'Business registration + tax certificate. Free, 1–3 days.'],
                ['⭐', 'Premium', 'Adds export license, bank reference, quality certifications.'],
                ['🏆', 'Top Supplier', 'Factory inspection, 2+ years, 50+ orders, 4.5+ rating.'],
              ].map(([badge, title, desc]) => (
                <div key={title} className="border border-gray-100 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{badge}</div>
                  <p className="text-xs font-bold text-gray-800">{title}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
            <Link href="/company-verification" className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline font-medium">
              Start Verification <ArrowRight size={13} />
            </Link>
          </Section>

          <Section id="listing" title="Listing Products" icon={Package}>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Strong listings get more views and more RFQs. A few things that consistently improve conversion:
            </p>
            <ul className="space-y-2">
              {[
                'Use clear, high-resolution photos — buyers can\'t touch the product, so photos do the convincing.',
                'Fill in every specification field (grade, certifications, packaging) — incomplete listings rank lower in filtered search.',
                'Set a realistic MOQ. A lower MOQ on at least one listing makes it easier for new buyers to place a trial order.',
                'Keep your lead time accurate — missed delivery promises are the #1 cause of negative reviews.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="text-primary-500 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="rfqs" title="Responding to RFQs" icon={FileText}>
            <Step n={1} title="Check your RFQ inbox daily">
              Go to Supplier Dashboard → RFQs. Buyers expect a response within 24–48 hours — faster responses convert noticeably better.
            </Step>
            <Step n={2} title="Quote with full terms, not just price">
              Always include MOQ, lead time, shipping method, and whether a sample is available. Vague quotes get skipped in favor of complete ones.
            </Step>
            <Step n={3} title="Follow up via message">
              After quoting, send a short message highlighting what makes your offer worth choosing — certifications, faster lead time, or sample availability.
            </Step>
          </Section>

          <Section id="orders" title="Managing Orders" icon={ShoppingCart}>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track every order through Supplier Dashboard → Orders. Move orders through Pending → Processing → Shipped → Delivered as you progress — buyers see this status update in real time, which significantly reduces &quot;where is my order&quot; messages.
            </p>
          </Section>

          <Section id="payments" title="Getting Paid" icon={DollarSign}>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Funds from Trade Assurance orders are held in escrow and released to you once the buyer confirms delivery — typically within 3–5 business days of confirmation. For bank transfer orders, payment is verified manually and may take slightly longer.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">Add your bank details under Supplier Dashboard → Settings before your first order to avoid payout delays.</p>
            </div>
          </Section>

          <Section id="growth" title="Growing Your Business" icon={TrendingUp}>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Once you&apos;ve got the basics running, a few levers consistently grow order volume:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Upgrade to Premium for featured placement and unlimited listings.',
                'Join a Trade Show under the SL Beauty pavilion — shared booth costs, real buyer meetings.',
                'Keep your response rate above 95% — it\'s a visible filter buyers actively use.',
                'Ask satisfied buyers to leave a review — supplier rating is one of the strongest ranking signals.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="text-primary-500 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
            <Link href="/trade-shows" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Browse Trade Shows <ArrowRight size={14} />
            </Link>
          </Section>

          {/* Bottom nav */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <Link href="/buyer-guide" className="text-sm text-gray-500 hover:text-primary-700 flex items-center gap-1">
              <ChevronRight size={14} className="rotate-180" /> Buyer Guide
            </Link>
            <Link href="/contact-support" className="flex items-center gap-1 text-sm text-primary-700 hover:underline font-medium">
              <MessageCircle size={14} /> Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
