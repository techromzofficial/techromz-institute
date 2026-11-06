import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * CategoryGridSection — a reusable homepage section block.
 *
 * Renders a large promo tile on the left and an 8-item category grid
 * on the right for SL Beauty homepage product and category collections.
 *
 * Backend: GET /api/home/sections returns an array of these objects.
 * Each section's `items` array is independently rendered.
 *
 * @param {Object}   section
 * @param {string}   section.id
 * @param {string}   section.title              — Section heading
 * @param {string}   section.promoTitle         — Bold text on left tile
 * @param {string}   section.promoSubtitle      — Smaller text on left tile
 * @param {string}   section.promoBg            — Inline style background (gradient string)
 * @param {string}   [section.promoImage]       — Optional image URL for left tile
 * @param {string}   section.promoHref          — Where the promo CTA links to
 * @param {string}   [section.promoButtonLabel] — CTA button text
 * @param {Object[]} section.items              — Array of { slug, label, image }
 */
export default function CategoryGridSection({ section }) {
  if (!section) return null;

  const {
    title,
    promoTitle,
    promoSubtitle,
    promoBg,
    promoImage,
    promoHref = '/products',
    promoButtonLabel = 'Shop Now',
    viewAllLabel = 'View All',
    viewAllUrl = promoHref,
    items = [],
  } = section;

  return (
    <section className="mt-6 overflow-hidden rounded-[20px] border border-[#ebe7e5] bg-white shadow-[0_8px_22px_rgba(31,24,21,0.05)] sm:mt-7">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#eee9e6] px-5 py-5 sm:px-7">
        <h2 className="text-xl font-bold tracking-[-0.035em] text-[#142238] sm:text-2xl">{title}</h2>
        <Link
          href={viewAllUrl}
          className="group flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
        >
          {viewAllLabel} <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        </Link>
      </div>

      {/* Body: promo tile + grid */}
      <div className="flex flex-col sm:flex-row">
        {/* Left: Promo tile */}
        <div
          className="relative flex min-h-[188px] flex-shrink-0 flex-col justify-between overflow-hidden p-5 sm:w-[27%] sm:min-h-[250px] sm:p-6 lg:w-[18%]"
          style={{ background: promoBg || '#155e2c' }}
        >
          {promoImage && (
            <Image
              src={promoImage}
              alt=""
              fill
              unoptimized
              className="pointer-events-none object-cover opacity-35"
            />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-rose-800/35" />
          <div className="relative z-10">
            <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{promoTitle}</h3>
            {promoSubtitle && (
              <p className="mt-2 text-xs leading-relaxed text-white/90 sm:text-sm">{promoSubtitle}</p>
            )}
          </div>
          <Link
            href={promoHref}
            className="relative z-10 mt-5 inline-flex min-h-10 self-start items-center rounded-full bg-white px-5 py-2 text-sm font-bold text-primary-800 shadow-[0_5px_12px_rgba(82,24,46,0.22)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(82,24,46,0.30)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-700 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {promoButtonLabel}
          </Link>
        </div>

        {/* Right: 8-item grid */}
        <div className="flex-1 grid grid-cols-2 border-l border-[#e8e1dc] bg-white sm:grid-cols-4">
          {items.slice(0, 8).map((item, index) => (
            <Link
              key={item.id || item.slug || item.label}
              href={item.href || `/categories/${item.slug}`}
              className={`group flex min-h-[135px] flex-col items-center justify-center gap-3 border-b border-r border-[#ece7e3] bg-white p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(55,38,31,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-700 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[125px] ${index === 7 ? 'border-b-0' : ''} sm:[&:nth-last-child(-n+4)]:border-b-0`}
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-[#ebe6e2] bg-[#faf9f8] shadow-[0_6px_16px_rgba(55,38,31,0.10)] transition-[transform,box-shadow] duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_9px_20px_rgba(55,38,31,0.14)] sm:h-[92px] sm:w-[92px]">
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=320&q=80'}
                  alt={item.imageAlt || item.label}
                  width={104}
                  height={104}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="line-clamp-2 text-center text-sm font-medium leading-tight text-[#332a27] transition-colors duration-300 group-hover:text-primary-800">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
