'use client';

/**
 * B2BProductCard — legacy component name for product listing cards.
 *
 * Features:
 *  - Price range display
 *  - Brand verification badges
 *  - Add-to-basket CTA button
 *  - Works in both grid and list view modes
 *
 * Connect to Laravel: product data comes from GET /api/products?... 
 * TODO: Rename this component in a later cleanup once imports are migrated.
 */

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Eye, MapPin, PackageCheck, Star, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { FALLBACK_PRODUCT_IMAGE, normalizeProduct } from '@/lib/products';
import WishlistButton from './WishlistButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { conversationsApi } from '@/lib/api';
import { loginUrlFor } from '@/lib/authRedirect';
import toast from 'react-hot-toast';

export default function B2BProductCard({ product, viewMode = 'grid' }) {
  const { addItem } = useCart();
  const router = useRouter();
  const { isAuthenticated, isBuyer } = useAuth();
  const normalized = normalizeProduct(product);

  const {
    id, slug, name,
    priceMin, priceMax, price,
    unit = 'Piece', minOrder = 1, moqUnit,
    rating = 0, reviews = 0,
    image,
    supplier, supplierLocation,
    audited = false, category,
    supplier_id,
  } = normalized;

  const displayUnit = unit || moqUnit || 'Piece';
  const displayPriceMin = priceMin ?? price ?? 0;
  const displayPriceMax = priceMax ?? null;
  const productHref = `/products/${id || slug || ''}`;
  const supplierName = typeof supplier === 'string'
    ? supplier
    : supplier?.name || supplier?.company_name || '';
  const supplierHref = supplierName ? '/brands' : null;
  const displaySupplierLocation = supplierLocation
    || (typeof supplier === 'object' ? supplier?.location : '')
    || '';
  const categoryLabel = category?.label || category?.name || normalized.category_name || 'Beauty product';
  const leadTime = normalized.lead_time_days ?? normalized.leadTimeDays ?? normalized.lead_time ?? null;
  const displayLeadTime = leadTime
    ? (String(leadTime).toLowerCase().includes('day') ? String(leadTime) : `${leadTime} days`)
    : 'Delivery time varies';
  const displayPort = normalized.port || 'Islandwide delivery';
  const supplyAbility = normalized.supply_ability || normalized.supplyAbility || 'Original brand product';
  const status = String(normalized.status || normalized.approval_status || '').toLowerCase();
  const featured = Boolean(normalized.featured || normalized.is_featured || status.includes('featured'));
  const originalBrand = Boolean(
    normalized.is_original_brand
    || normalized.original_brand
    || status.includes('original')
  );
  const priceLabel = displayPriceMax
    ? `${formatCurrency(displayPriceMin)}-${formatCurrency(displayPriceMax)}`
    : displayPriceMin > 0
      ? formatCurrency(displayPriceMin)
      : 'View price';
  const fallbackImage = image || FALLBACK_PRODUCT_IMAGE;

  const handleInquire = (e) => {
    e.preventDefault();
    addItem(normalized);
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      router.push(loginUrlFor(`/products/${id || slug || ''}`));
      return;
    }
    if (!isBuyer) {
      toast.error('Only shopper accounts can start brand conversations.');
      return;
    }
    try {
      const response = await conversationsApi.create({ supplier_id: supplier?.id || supplier_id });
      const conversationId = response?.conversation?.id;
      router.push(conversationId ? `/messages?id=${conversationId}` : '/messages');
    } catch (chatError) {
      toast.error(chatError?.message || 'Could not start this conversation.');
    }
  };

  /* ── Grid view (default) ──────────────────────────────── */
  if (viewMode === 'grid') {
    return (
      <div className="group relative flex h-full flex-col overflow-hidden bg-white rounded-2xl border border-stone-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(120,95,78,0.12)] hover:-translate-y-1 hover:border-stone-300/60">
        {/* Image */}
        <Link href={productHref} className="relative block aspect-[4/3] overflow-hidden bg-[#faf9f6]">
          <Image
            src={fallbackImage}
            alt={name || 'Product image'}
            width={360}
            height={270}
            unoptimized
            onError={(event) => {
              event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 z-10">
            {audited && (
              <span className="flex items-center gap-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/40 px-2 py-0.5 text-[9px] font-bold text-stone-900 shadow-sm uppercase tracking-wider">
                <BadgeCheck size={10} className="text-rose-700" /> Verified
              </span>
            )}
            {(featured || originalBrand) && (
              <span className="rounded-full bg-stone-950 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                {featured ? 'Featured' : 'Original'}
              </span>
            )}
          </div>
          <WishlistButton
            productId={id}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 shadow-sm border border-stone-100 hover:scale-105 transition-all duration-200"
          />
        </Link>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-stone-500">
              {categoryLabel}
            </span>
            {rating > 0 && (
              <span className="flex flex-shrink-0 items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          <Link href={productHref}>
            <h3 className="mb-3.5 min-h-[2.4rem] text-sm font-bold leading-snug text-stone-950 line-clamp-2 transition-colors group-hover:text-rose-900">
              {name || 'Beauty product'}
            </h3>
          </Link>

          {/* Price */}
          <div className="mb-3.5 rounded-xl border border-stone-100 bg-[#faf9f6] px-3 py-2 flex flex-col gap-0.5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">Price</div>
            <div>
              <span className="text-stone-950 font-extrabold text-[15px] sm:text-base">
                {priceLabel}
              </span>
              <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider ml-0.5">/{displayUnit}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded-xl bg-stone-50/50 border border-stone-100 p-2">
              <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Quantity</span>
              <span className="font-bold text-stone-700">{minOrder > 0 ? `${minOrder} ${moqUnit || displayUnit}` : 'Flexible'}</span>
            </div>
            <div className="rounded-xl bg-stone-50/50 border border-stone-100 p-2">
              <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Delivery</span>
              <span className="font-bold text-stone-700">{displayLeadTime}</span>
            </div>
          </div>

          <div className="mt-3.5 space-y-1.5 text-[10.5px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-stone-450" />
              <span className="truncate font-medium">{displayPort}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PackageCheck size={11} className="text-stone-450" />
              <span className="truncate font-medium">{supplyAbility}</span>
            </div>
          </div>

          {/* Brand */}
          {supplierName && (
            supplierHref ? (
              <Link href={supplierHref} className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-stone-400 hover:text-rose-900 truncate">
                {audited && <BadgeCheck size={11} className="text-rose-700 flex-shrink-0" />}
                <span className="truncate">{supplierName}</span>
              </Link>
            ) : (
              <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-stone-400 truncate">
                {audited && <BadgeCheck size={11} className="text-rose-700 flex-shrink-0" />}
                <span className="truncate">{supplierName}</span>
              </div>
            )
          )}
        </div>

        {/* CTA buttons */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 px-4 pb-4">
          <Link
            href={productHref}
            className="flex items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white hover:border-stone-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors"
          >
            <Eye size={13} /> Details
          </Link>
          <button
            onClick={handleInquire}
            className="py-2.5 bg-gradient-to-r from-stone-950 via-stone-900 to-rose-900 hover:from-black hover:to-rose-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] border-0 cursor-pointer text-center"
          >
            Add to Basket
          </button>
        </div>
      </div>
    );
  }

  /* ── List view ────────────────────────────────────────── */
  return (
    <div className="group bg-white border border-stone-200/50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(120,95,78,0.12)] hover:border-stone-300/60 flex flex-col gap-3 p-3.5 transition-all duration-350 sm:flex-row sm:gap-5 sm:p-5">
      {/* Thumbnail */}
      <Link href={productHref} className="relative flex-shrink-0 w-full h-44 rounded-xl overflow-hidden bg-[#faf9f6] border border-stone-100 sm:h-36 sm:w-36">
        <Image
          src={fallbackImage}
          alt={name || 'Product image'}
          width={180}
          height={180}
          unoptimized
          onError={(event) => {
            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        {audited && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/40 px-2 py-0.5 text-[9px] font-bold text-stone-900 shadow-sm uppercase tracking-wider">
            <BadgeCheck size={10} className="text-rose-700" /> Verified
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-stone-500">
            {categoryLabel}
          </span>
          {featured && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">Featured</span>}
          {originalBrand && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">Original</span>}
        </div>
        <Link href={productHref}>
          <h3 className="text-base font-bold text-stone-950 hover:text-rose-900 line-clamp-2 mb-2 transition-colors leading-snug">
            {name || 'Beauty product'}
          </h3>
        </Link>

        {/* Brand */}
        {supplierName && (
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-stone-400 mb-3.5">
            {audited && <BadgeCheck size={11} className="text-rose-700 flex-shrink-0" />}
            {supplierHref ? (
              <Link href={supplierHref} className="text-stone-600 hover:text-rose-900">{supplierName}</Link>
            ) : (
              <span className="text-stone-600">{supplierName}</span>
            )}
            {displaySupplierLocation && (
              <span className="flex items-center gap-0.5 text-stone-300 font-normal normal-case ml-1.5">
                <MapPin size={10} /> {displaySupplierLocation}
              </span>
            )}
          </div>
        )}

        <div className="grid gap-2 text-[10px] sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-stone-50/50 border border-stone-100 p-2.5">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Quantity</span>
            <span className="font-bold text-stone-700">{minOrder > 0 ? `${minOrder} ${moqUnit || displayUnit}` : 'Flexible'}</span>
          </div>
          <div className="rounded-xl bg-stone-50/50 border border-stone-100 p-2.5">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Delivery</span>
            <span className="font-bold text-stone-700">{displayLeadTime}</span>
          </div>
          <div className="rounded-xl bg-stone-50/50 border border-stone-100 p-2.5">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Fulfilment</span>
            <span className="font-bold text-stone-700">{displayPort}</span>
          </div>
          <div className="rounded-xl bg-stone-50/50 border border-stone-100 p-2.5">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Product</span>
            <span className="font-bold text-stone-700 line-clamp-1">{supplyAbility}</span>
          </div>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-3.5 flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md animate-fade-in">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {rating}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">({reviews} reviews)</span>
          </div>
        )}
      </div>

      {/* Price + CTA */}
      <div className="flex-shrink-0 flex flex-col justify-between text-left sm:min-w-[150px] sm:items-end sm:text-right border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">Price</div>
          <div className="text-stone-950 font-extrabold text-base sm:text-lg">
            {priceLabel}
          </div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">/{displayUnit}</div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:flex-col">
          <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:w-full sm:flex-col sm:gap-2">
            <Link
              href={productHref}
              className="flex items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white hover:border-stone-300 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors sm:py-2"
            >
              <Eye size={12} /> Details
            </Link>
            <button
              onClick={handleInquire}
              className="whitespace-nowrap rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-rose-900 hover:from-black hover:to-rose-950 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 sm:py-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] border-0 cursor-pointer"
            >
              Add to Basket
            </button>
            <button
              type="button"
              onClick={handleChat}
              className="flex items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-colors sm:py-2 cursor-pointer"
            >
              <MessageCircle size={12} /> Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
