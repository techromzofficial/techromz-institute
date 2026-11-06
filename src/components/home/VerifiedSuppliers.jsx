import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Globe2,
  MapPin,
  Package,
  Send,
  ShieldCheck,
  Star,
} from 'lucide-react';

const SUPPLIER_FOCUS = [
  { label: 'Skincare brand', keywords: ['skincare', 'skin', 'serum', 'cleanser', 'moisturizer'] },
  { label: 'Haircare partner', keywords: ['hair', 'shampoo', 'conditioner', 'treatment'] },
  { label: 'Fragrance brand', keywords: ['fragrance', 'perfume', 'cologne'] },
  { label: 'Cosmetics seller', keywords: ['makeup', 'cosmetic', 'foundation', 'lipstick'] },
  { label: 'Wellness supplier', keywords: ['wellness', 'ayurveda', 'ayurvedic', 'herbal'] },
  { label: 'Beauty retailer', keywords: ['retail', 'salon', 'spa', 'distributor'] },
];

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function getIndustry(supplier) {
  const candidates = asArray(supplier.categories)
    .concat(asArray(supplier.industries))
    .concat(asArray(supplier.main_products));

  const haystack = [
    supplier.company_name,
    supplier.name,
    supplier.business_type,
    supplier.industry,
    supplier.category,
    supplier.description,
    ...candidates,
  ].filter(Boolean).join(' ').toLowerCase();

  const focus = SUPPLIER_FOCUS.find((item) => (
    item.keywords.some((keyword) => haystack.includes(keyword))
  ));

  return focus?.label || candidates[0] || supplier.industry || supplier.business_type || 'Beauty partner';
}

function numberFrom(...values) {
  const found = values.find((value) => value !== undefined && value !== null && value !== '');
  if (found === undefined) return null;
  const parsed = Number(found);
  return Number.isFinite(parsed) ? parsed : null;
}

function supplierHref(supplier) {
  return supplier.slug ? `/brands/${supplier.slug}` : '/brands';
}

function supplierProductsHref(supplier) {
  return supplier.id ? `/products?supplier_id=${encodeURIComponent(supplier.id)}` : '/products';
}

function inquiryHref(supplier) {
  const name = supplier.company_name || supplier.name || '';
  return name ? `/brands?search=${encodeURIComponent(name)}` : '/brands';
}

function normalizeSupplier(supplier, index) {
  const companyName = supplier.company_name || supplier.name || 'Verified Beauty Partner';
  const rating = numberFrom(supplier.rating, supplier.average_rating);
  const trustScore = numberFrom(supplier.trust_score, supplier.profile_completion_score);
  const responseRate = numberFrom(supplier.response_rate, supplier.responseRate);
  const productsCount = numberFrom(supplier.products_count, supplier.products, supplier.total_products);
  const partnerMarkets = asArray(supplier.main_markets || supplier.markets);
  const location = supplier.location || [supplier.city, supplier.country].filter(Boolean).join(', ') || 'Sri Lanka';

  return {
    id: supplier.id || `${companyName}-${index}`,
    companyName,
    logo: supplier.logo
      || supplier.image
      || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=320&q=80',
    href: supplierHref(supplier),
    productsHref: supplierProductsHref(supplier),
    inquiryHref: inquiryHref(supplier),
    industry: getIndustry(supplier),
    verified: Boolean(
      supplier.verified
      || supplier.verification_status === 'verified'
      || supplier.storefront_status === 'active',
    ),
    rating,
    trustScore,
    responseRate,
    productsCount,
    partnerMarkets,
    location,
    country: supplier.country || 'Sri Lanka',
    rank: SUPPLIER_FOCUS.findIndex((item) => item.label === getIndustry(supplier)),
  };
}

export default function VerifiedSuppliers({ suppliers = [] }) {
  const items = Array.isArray(suppliers)
    ? suppliers.map(normalizeSupplier).sort((a, b) => {
      const rankA = a.rank >= 0 ? a.rank : SUPPLIER_FOCUS.length;
      const rankB = b.rank >= 0 ? b.rank : SUPPLIER_FOCUS.length;
      return rankA - rankB;
    }).slice(0, 6)
    : [];

  if (!items.length) return null;

  return (
    <section className="mt-5 sm:mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Brand verified seller network</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Trusted beauty suppliers and retailers</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Discover approved beauty brands, distributors, salons, wellness partners, and retailers supporting Sri Lanka&apos;s hybrid B2B and B2C beauty marketplace.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            >
              View partners <ArrowRight size={14} />
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Partner with us <Send size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {items.map((supplier) => (
          <article
            key={supplier.id}
            className="flex min-h-[270px] flex-col border-b border-gray-100 p-3.5 transition-colors hover:bg-gray-50 sm:p-4 md:min-h-[300px] md:border-r [&:nth-child(2n)]:md:border-r-0 [&:nth-child(3n)]:xl:border-r-0"
          >
            <div className="flex items-start gap-3">
              <Link href={supplier.href} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                <Image
                  src={supplier.logo}
                  alt={supplier.companyName}
                  width={80}
                  height={80}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <Link href={supplier.href} className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-2 hover:text-primary-800">
                      {supplier.companyName}
                    </h3>
                  </Link>
                  {supplier.verified && (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-800">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} className="flex-shrink-0 text-gray-400" />
                  <span className="line-clamp-1">{supplier.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
              <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-100">
                {supplier.industry}
              </span>
              {supplier.partnerMarkets.slice(0, 2).map((market) => (
                <span key={market} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  <Globe2 size={11} />
                  {market}
                </span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:mt-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <ShieldCheck size={13} />
                  Trust
                </div>
                <div className="mt-1 font-bold text-gray-900">
                  {supplier.trustScore !== null ? `${supplier.trustScore}%` : supplier.verified ? 'Verified' : 'Reviewing'}
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <Star size={13} />
                  Rating
                </div>
                <div className="mt-1 font-bold text-gray-900">
                  {supplier.rating !== null ? supplier.rating.toFixed(1) : 'New'}
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <BarChart3 size={13} />
                  Response
                </div>
                <div className="mt-1 font-bold text-gray-900">
                  {supplier.responseRate !== null ? `${supplier.responseRate}%` : 'On request'}
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <Package size={13} />
                  Products
                </div>
                <div className="mt-1 font-bold text-gray-900">
                  {supplier.productsCount !== null ? supplier.productsCount.toLocaleString() : 'Catalog'}
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-3 sm:pt-4">
              <Link
                href={supplier.href}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-800"
              >
                View partner
              </Link>
              <Link
                href={supplier.productsHref}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
              >
                View products
              </Link>
              <Link
                href={supplier.inquiryHref}
                className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
              >
                Contact partner <ArrowRight size={12} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
