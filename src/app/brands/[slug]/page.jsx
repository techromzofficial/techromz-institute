import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSlBeautyBrand } from '@/lib/api/slBeauty';
import { SL_BEAUTY_DISPLAY_CONFIG } from '@/lib/slBeautyConfig';

function brandFromResponse(response) {
  return response?.brand || response?.data || response || null;
}

function brandLogo(brand) {
  const logo = brand?.logo_path || brand?.logo || brand?.image;
  if (!logo || typeof logo !== 'string') return null;
  if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/')) return logo;
  return `/${logo}`;
}

function brandDescription(brand) {
  return brand?.description || brand?.summary || 'Authentic beauty brand available through SL Beauty Platform.';
}

function isVerified(brand) {
  return Boolean(brand?.is_verified || brand?.verified || brand?.verification_status === 'verified');
}

function publicWebsiteUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.href;
  } catch {
    return null;
  }
}

async function loadBrand(slug) {
  try {
    const response = await getSlBeautyBrand(slug);
    return { brand: brandFromResponse(response), error: null };
  } catch (error) {
    return { brand: null, error: error.message || 'Could not load this brand right now.' };
  }
}

export async function generateMetadata({ params }) {
  const { brand } = await loadBrand(params?.slug);
  const name = brand?.name || 'Brand';

  return {
    title: `${name} | ${SL_BEAUTY_DISPLAY_CONFIG.displayName}`,
    description: brandDescription(brand),
  };
}

export default async function BrandDetailPage({ params }) {
  const { brand, error } = await loadBrand(params?.slug);
  const name = brand?.name || 'Beauty Brand';
  const logo = brandLogo(brand);
  const verified = isVerified(brand);
  const websiteUrl = publicWebsiteUrl(brand?.website_url || brand?.website);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <Link href="/brands" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-pink-800">
          <ArrowLeft size={16} />
          Back to brands
        </Link>

        {error && (
          <section className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="text-sm font-semibold">Brand unavailable</p>
            <p className="mt-2 text-sm leading-6">{error}</p>
            <Link href="/brands" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-100 transition hover:bg-red-100">
              Browse all brands
            </Link>
          </section>
        )}

        {!error && brand && (
          <>
            <section className="overflow-hidden rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-orange-50 p-5 sm:p-7 lg:p-8">
              <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-sm ring-1 ring-pink-100 sm:h-44 sm:w-44">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={`${name} logo`}
                      width={176}
                      height={176}
                      unoptimized
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-300">
                      {name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-pink-700 shadow-sm ring-1 ring-pink-100">
                    <Sparkles size={14} />
                    SL Beauty brand
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-normal text-gray-950 sm:text-5xl">
                    {name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-700 px-3 py-1.5 text-xs font-bold text-white">
                        <ShieldCheck size={14} />
                        Verified brand
                      </span>
                    )}
                    {brand?.country?.name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-100">
                        <Globe2 size={14} />
                        {brand.country.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                    {brandDescription(brand)}
                  </p>
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
                    >
                      Visit brand website
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-pink-700">Authenticity</p>
                <h2 className="mt-2 text-base font-bold text-gray-950">
                  {verified ? 'Brand verified seller' : 'Public brand profile'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  SL Beauty displays public brand information only. Seller, distributor, and compliance actions are not available on this page.
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-pink-700">Marketplace</p>
                <h2 className="mt-2 text-base font-bold text-gray-950">Beauty discovery</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Explore skincare, haircare, fragrance, cosmetics, wellness, and premium beauty brands in one public directory.
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-pink-700">Read-only</p>
                <h2 className="mt-2 text-base font-bold text-gray-950">No private actions</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  This page is public and read-only. It does not modify products, carts, orders, seller data, admin reviews, or customer records.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
