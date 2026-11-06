import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, ShoppingBasket, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TRENDING_PRODUCTS } from '@/lib/constants';

const BEAUTY_FOCUS = [
  { label: 'Makeup', keywords: ['makeup', 'lipstick', 'foundation', 'concealer', 'mascara', 'eyeliner', 'blush'] },
  { label: 'Skincare', keywords: ['skincare', 'serum', 'moisturizer', 'sunscreen', 'cleanser', 'toner', 'cream'] },
  { label: 'Fragrance', keywords: ['fragrance', 'perfume', 'eau de parfum', 'cologne'] },
  { label: 'Hair Care', keywords: ['hair', 'shampoo', 'conditioner', 'mask', 'kerastase', 'redken'] },
  { label: 'Bath & Body', keywords: ['body', 'lotion', 'shower', 'bath'] },
  { label: 'Tools & Brushes', keywords: ['brush', 'sponge', 'blender', 'tool'] },
  { label: 'Gift Sets', keywords: ['gift', 'set', 'bundle', 'mini'] },
];

const fallbackProducts = [
  'Gentle Hydrating Cleanser',
  'Vitamin C Brightening Serum',
  'SPF 50 Daily Sunscreen',
  'Long Wear Matte Lipstick',
  'Bond Repair Shampoo',
  'Signature Eau de Parfum',
  'Soft Glow Body Lotion',
  'Pore Care Clay Face Mask',
  'Nourishing Hair Oil',
  'Essential Beauty Tools Set',
];

const fallbackImage = (label = 'Beauty Product') =>
  label.toLowerCase().includes('perfume')
    ? 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80'
    : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80';

function numberFrom(...values) {
  const found = values.find((value) => value !== undefined && value !== null && value !== '');
  if (found === undefined) return null;
  const parsed = Number(found);
  return Number.isFinite(parsed) ? parsed : null;
}

function productHref(product) {
  if (product?.id) return `/products/${product.id}`;
  if (product?.slug) return `/products/${product.slug}`;
  if (product?.category?.slug) return `/categories/${product.category.slug}`;
  return '/products';
}

function getBeautyFocus(product) {
  const haystack = [
    product?.name,
    product?.label,
    product?.slug,
    product?.category?.name,
    product?.category?.label,
    product?.category?.slug,
  ].filter(Boolean).join(' ').toLowerCase();

  return BEAUTY_FOCUS.find((focus) => (
    focus.keywords.some((keyword) => haystack.includes(keyword))
  ));
}

function formatPrice(product, index) {
  const price = numberFrom(product?.retail_price, product?.sale_price, product?.price_min, product?.price);
  const currency = product?.currency?.code || product?.currency_code || 'LKR';

  return price !== null ? formatCurrency(price, currency) : formatCurrency([3900, 5200, 6800, 8400][index % 4], currency);
}

function normalizeForCard(product, index) {
  const label = product?.name || product?.label || fallbackProducts[index % fallbackProducts.length];
  const focus = getBeautyFocus(product);
  const rating = numberFrom(product?.rating, product?.average_rating) || (4.5 + (index % 5) / 10);

  return {
    id: product?.id || product?.slug || `${label}-${index}`,
    label,
    href: productHref(product),
    image: product?.featured_image || product?.image || product?.thumbnail || fallbackImage(label),
    categoryLabel: focus?.label || product?.category?.label || product?.category?.name || 'Beauty',
    brand: product?.brand?.name || product?.brand_name || ['L’Oréal', 'Maybelline', 'CeraVe', 'Lancôme', 'Redken'][index % 5],
    price: formatPrice(product, index),
    rating: rating.toFixed(1),
    badge: index % 3 === 0 ? 'Best Seller' : index % 3 === 1 ? 'New' : 'Original',
    focusScore: focus ? BEAUTY_FOCUS.indexOf(focus) : BEAUTY_FOCUS.length + index,
  };
}

export default function TrendingProducts() {
  const sourceProducts = TRENDING_PRODUCTS;

  const items = Array.isArray(sourceProducts)
    ? sourceProducts
      .map(normalizeForCard)
      .sort((a, b) => a.focusScore - b.focusScore)
      .slice(0, 8)
    : [];

  if (!items.length) return null;

  return (
    <section className="mt-5 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm sm:mt-6">
      <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-700">Trending Beauty</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Best Sellers & New Favourites</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Shop original makeup, skincare, fragrance, haircare, bath and body, wellness, and beauty tools from verified beauty brands and authorized sellers.
            </p>
          </div>
          <Link
            href="/products?sort=trending"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800 sm:w-auto md:self-auto"
          >
            View all products <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 p-5 bg-[#faf9f6]">
        {items.map((product) => (
          <article
            key={product.id}
            className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/50 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(120,95,78,0.12)] hover:-translate-y-1 hover:border-stone-300/60"
          >
            {/* Image Link */}
            <Link href={product.href} className="relative block overflow-hidden rounded-xl bg-[#faf9f6] aspect-square border border-stone-100">
              <Image
                src={product.image}
                alt={product.label}
                width={400}
                height={400}
                unoptimized
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/40 px-2.5 py-0.5 text-[10px] font-bold text-stone-900 shadow-sm uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              {product.badge && (
                <span className="absolute right-2.5 top-2.5 rounded-full bg-stone-950 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </Link>

            {/* Info Body */}
            <div className="flex flex-1 flex-col pt-3.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-stone-400">
                {product.brand}
              </span>
              <Link href={product.href}>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-stone-950 min-h-[2.4rem] transition-colors group-hover:text-rose-900">
                  {product.label}
                </h3>
              </Link>

              {/* Rating */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {product.rating}
                </span>
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Customer Rating</span>
              </div>

              {/* Price Tag box */}
              <div className="mt-3.5 rounded-xl border border-stone-100 bg-[#faf9f6] p-3 flex flex-col gap-0.5">
                <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Price</div>
                <div className="text-base font-extrabold text-stone-950">{product.price}</div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-2 pt-3 border-t border-stone-100">
                <Link
                  href={product.href}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-rose-900 hover:from-black hover:to-rose-950 text-white px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98]"
                >
                  <ShoppingBasket size={13} /> Shop
                </Link>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white hover:border-stone-300 px-3.5 py-2.5 text-stone-600 transition-colors hover:text-rose-700 hover:bg-stone-50"
                  aria-label="Add to wishlist"
                >
                  <Heart size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
