'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ShieldCheck, FileText, Package, CreditCard, Truck,
  AlertCircle, CheckCircle2, ArrowRight, MessageCircle, ChevronRight,
} from 'lucide-react';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: Search },
  { id: 'finding-suppliers', label: 'Finding the Right Supplier', icon: ShieldCheck },
  { id: 'rfq', label: 'Posting RFQs & Quotations', icon: FileText },
  { id: 'ordering', label: 'Placing an Order', icon: Package },
  { id: 'payment', label: 'Payment & Trade Assurance', icon: CreditCard },
  { id: 'shipping', label: 'Shipping & Tracking', icon: Truck },
  { id: 'disputes', label: 'Resolving Issues', icon: AlertCircle },
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

export default function BuyerGuideContent() {
  const [active, setActive] = useState('getting-started');

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-8 text-white mb-6">
        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Help Center / Buyer Guide</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">The Complete Buyer&apos;s Guide</h1>
        <p className="text-blue-100 max-w-xl">Everything you need to source, vet, and order confidently from Sri Lankan exporters on SL Beauty.</p>
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
          <div className="mt-5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700">Selling instead? See the <Link href="/supplier-guide" className="underline font-medium">Supplier Guide</Link>.</p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Section id="getting-started" title="Getting Started" icon={Search}>
            <Step n={1} title="Create your free buyer account">
              Sign up with your business email. No verification is required to browse, but a confirmed email is needed to message suppliers or place orders.
            </Step>
            <Step n={2} title="Tell us what you're sourcing">
              Browse by category, or use Search with filters for country, MOQ, certifications, and supplier verification status to narrow results fast.
            </Step>
            <Step n={3} title="Shortlist a few suppliers">
              Save suppliers and products to your Wishlist so you can compare them later, side-by-side, on the Compare page.
            </Step>
          </Section>

          <Section id="finding-suppliers" title="Finding the Right Supplier" icon={ShieldCheck}>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Not all suppliers are equal. SL Beauty uses a three-tier verification system so you can quickly judge trustworthiness before you commit.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                ['✅', 'Verified Supplier', 'Business registration and tax documents confirmed.'],
                ['⭐', 'Premium Supplier', 'Adds export license, bank reference, and quality certifications.'],
                ['🏆', 'Top Supplier', 'Factory-inspected, 2+ years active, 50+ verified orders, 4.5+ rating.'],
              ].map(([badge, title, desc]) => (
                <div key={title} className="border border-gray-100 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{badge}</div>
                  <p className="text-xs font-bold text-gray-800">{title}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Check the supplier&apos;s <strong>Factory Tour</strong> and <strong>Trade Capacity</strong> tabs on their storefront — real photos and export-market data are strong trust signals. Response rate and response time (shown on every supplier profile) tell you how reliably they&apos;ll communicate once you&apos;re mid-order.
            </p>
          </Section>

          <Section id="rfq" title="Posting RFQs & Quotations" icon={FileText}>
            <Step n={1} title="Post a Request for Quotation (RFQ)">
              Go to &quot;Post Buying Request&quot; and describe your product, quantity, target price, and any required certifications. Multiple suppliers can respond — you don&apos;t have to chase one at a time.
            </Step>
            <Step n={2} title="Compare quotations as they arrive">
              Each quotation includes price, MOQ, lead time, shipping terms, and whether a sample is available. Open any RFQ from your dashboard to see all responses side-by-side.
            </Step>
            <Step n={3} title="Accept, counter-offer, or decline">
              Accepting a quotation moves it straight into checkout. You can also send a counter-offer if the price doesn&apos;t quite match your target — most suppliers respond within 24 hours.
            </Step>
          </Section>

          <Section id="ordering" title="Placing an Order" icon={Package}>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              You can order two ways: directly from a product page (for fixed-price, ready-stock items), or by accepting a quotation from an RFQ (for custom or bulk orders).
            </p>
            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                Always request a sample for first-time orders above 100kg/units or US$1,000 — most suppliers offer this for a small fee plus shipping.
              </p>
            </div>
          </Section>

          <Section id="payment" title="Payment & Trade Assurance" icon={CreditCard}>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              SL Beauty supports Bank Transfer (TT), PayPal, Credit/Debit Card, and Letter of Credit. All payments made through checkout are protected by <strong>Trade Assurance Escrow</strong> — your funds are held securely and only released to the supplier after you confirm delivery.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Bank Transfer (TT)', '2–3 business days to clear. Best for larger orders.'],
                ['Credit / Debit Card', 'Instant. Visa, Mastercard, Amex accepted.'],
                ['PayPal', 'Instant, with PayPal Buyer Protection as an extra layer.'],
                ['Letter of Credit', 'For large export orders — arranged via your bank.'],
              ].map(([title, desc]) => (
                <div key={title} className="border border-gray-100 rounded-xl p-3">
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="shipping" title="Shipping & Tracking" icon={Truck}>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Common methods from Sri Lanka: Air Freight (7–14 days), Sea Freight FCL/LCL (28–50 days), and Express courier (3–7 days). Your supplier will confirm Incoterms (FOB, CIF, EXW, DDP) before shipment.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Once shipped, track everything from <Link href="/orders" className="text-primary-700 hover:underline font-medium">Orders → Track Shipment</Link>, including customs clearance status and document downloads (Certificate of Origin, Phytosanitary Certificate, etc.).
            </p>
          </Section>

          <Section id="disputes" title="Resolving Issues" icon={AlertCircle}>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              If an order arrives damaged, incorrect, or doesn&apos;t match what was agreed, open the order and select &quot;Raise Dispute&quot; within 7 days of delivery. Our team mediates between you and the supplier — most disputes resolve within 14 business days.
            </p>
            <Link href="/contact-support" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              <MessageCircle size={14} /> Contact Support <ArrowRight size={14} />
            </Link>
          </Section>

          {/* Bottom nav */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <Link href="/help-center" className="text-sm text-gray-500 hover:text-primary-700">← Help Center</Link>
            <Link href="/supplier-guide" className="flex items-center gap-1 text-sm text-primary-700 hover:underline font-medium">
              Supplier Guide <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
