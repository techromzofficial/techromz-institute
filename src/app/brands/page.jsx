import Image from 'next/image';
import Link from 'next/link';
import { Search, ShieldCheck, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSlBeautyBrands } from '@/lib/api/slBeauty';
import { SL_BEAUTY_DISPLAY_CONFIG } from '@/lib/slBeautyConfig';

export const metadata = {
  title: `Brands | ${SL_BEAUTY_DISPLAY_CONFIG.displayName}`,
  description: 'Browse authentic beauty brands and brand verified sellers on SL Beauty Platform.',
};

function asText(value) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanSearchParams(searchParams = {}) {
  const search = String(asText(searchParams.search) || '').trim();
  const page = Number(asText(searchParams.page) || 1);

  return {
    ...(search ? { search } : {}),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    per_page: 24,
  };
}

function brandsFromResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.brands)) return response.brands;
  return [];
}

function paginationFromResponse(response) {
  const meta = response?.meta || {};

  return {
    currentPage: Number(meta.current_page || response?.current_page || 1),
    lastPage: Number(meta.last_page || response?.last_page || 1),
    total: Number(meta.total || response?.total || 0),
  };
}

function brandLogo(brand) {
  const logo = brand?.logo_path || brand?.logo || brand?.image;
  if (!logo || typeof logo !== 'string') return null;
  if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/')) return logo;
  return `/${logo}`;
}

function brandSummary(brand) {
  return brand?.description || brand?.summary || 'Authentic beauty brand available through SL Beauty Platform.';
}

function isVerified(brand) {
  return Boolean(brand?.is_verified || brand?.verified || brand?.verification_status === 'verified');
}

async function loadBrands(params) {
  try {
    const response = await getSlBeautyBrands(params);
    return {
      brands: brandsFromResponse(response),
      pagination: paginationFromResponse(response),
      error: null,
    };
  } catch (error) {
    return {
      brands: [],
      pagination: { currentPage: 1, lastPage: 1, total: 0 },
      error: error.message || 'Could not load brands right now.',
    };
  }
}

function pageHref(page, search) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  return `/brands?${params.toString()}`;
}

export default async function BrandsPage(props) {
  const searchParams = (await props.searchParams) ?? {};
  const query = cleanSearchParams(searchParams);
  const { brands, pagination, error } = await loadBrands(query);
  const hasSearch = Boolean(query.search);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <section className="overflow-hidden rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-orange-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-pink-700 shadow-sm ring-1 ring-pink-100">
              <Sparkles size={14} />
              Brand verified beauty
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">
              Discover authentic beauty brands
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Browse skincare, haircare, fragrance, cosmetics, wellness, and premium beauty partners available through Sri Lanka&apos;s hybrid B2B and B2C beauty marketplace.
            </p>
          </div>

          <form action="/brands" className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <label htmlFor="brand-search" className="sr-only">Search brands</label>
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="brand-search"
                name="search"
                type="search"
                defaultValue={query.search || ''}
                placeholder="Search brands, skincare, fragrance, or cosmetics"
                className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              Search
            </button>
          </form>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-700">SL Beauty brands</p>
              <h2 className="mt-1 text-xl font-bold text-gray-950">
                {hasSearch ? `Results for "${query.search}"` : 'Brand directory'}
              </h2>
            </div>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500">
                {pagination.total.toLocaleString()} brands
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && brands.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-700">
                <Search size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-950">No brands found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try a different search term or check back as more verified beauty brands join SL Beauty Platform.
              </p>
              {hasSearch && (
                <Link href="/brands" className="mt-4 inline-flex rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800">
                  Clear search
                </Link>
              )}
            </div>
          )}

          {!error && brands.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {brands.map((brand) => {
                  const logo = brandLogo(brand);
                  const verified = isVerified(brand);
                  const name = brand?.name || 'Beauty Brand';

                  return (
                    <article key={brand?.uuid || brand?.id || brand?.slug || name} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-pink-100 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          {logo ? (
                            <Image
                              src={logo}
                              alt={`${name} logo`}
                              width={64}
                              height={64}
                              unoptimized
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-400">
                              {name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-950">{name}</h3>
                          {verified && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-1 text-[11px] font-bold text-pink-800">
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 line-clamp-4 text-sm leading-6 text-gray-600">
                        {brandSummary(brand)}
                      </p>
                    </article>
                  );
                })}
              </div>

              {pagination.lastPage > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {pagination.currentPage > 1 && (
                    <Link
                      href={pageHref(pagination.currentPage - 1, query.search)}
                      className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="rounded-full bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600">
                    Page {pagination.currentPage} of {pagination.lastPage}
                  </span>
                  {pagination.currentPage < pagination.lastPage && (
                    <Link
                      href={pageHref(pagination.currentPage + 1, query.search)}
                      className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
