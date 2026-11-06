'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBasket, Star, BadgeCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, starRating } from '@/lib/utils';
import { normalizeProduct } from '@/lib/products';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const normalized = normalizeProduct(product);
  const {
    id, name, price, minOrder, moqUnit = 'Item', rating = 0,
    reviews = 0, image, supplier, verified = false, slug,
  } = normalized;

  const supplierName = typeof supplier === 'string'
    ? supplier
    : supplier?.name || supplier?.company_name || '';
  const stars = starRating(rating);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(normalized);
  };

  return (
    <Link
      href={`/products/${id || slug}`}
      className="group relative flex flex-col w-full overflow-hidden bg-white rounded-2xl border border-stone-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(120,95,78,0.12)] hover:-translate-y-1 hover:border-stone-300/60"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#faf9f6]">
        <Image
          src={image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80'}
          alt={name}
          width={240}
          height={240}
          unoptimized
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {verified && (
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-200/50 shadow-sm uppercase tracking-wider">
              <BadgeCheck size={11} className="text-rose-700" /> Verified
            </span>
          )}
        </div>

        <WishlistButton
          productId={id}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 shadow-sm border border-stone-100 hover:scale-105 transition-all duration-200"
        />
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-grow">
        {/* Brand */}
        {supplierName && (
          <span className="mb-1 text-[11px] font-bold tracking-[0.06em] text-stone-400 uppercase truncate">
            {supplierName}
          </span>
        )}

        {/* Product Name */}
        <h3 className="text-sm font-bold text-stone-950 line-clamp-2 leading-snug mb-1.5 min-h-[2.4rem] transition-colors group-hover:text-rose-900">
          {name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">({reviews} reviews)</span>
          </div>
        )}

        {/* Price & MOQ */}
        <div className="mt-auto pt-2 border-t border-stone-100">
          <div className="flex items-baseline flex-wrap gap-1">
            <span className="text-stone-950 font-extrabold text-[15px] sm:text-base">
              {formatCurrency(price)}
            </span>
            <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider">/{moqUnit}</span>
          </div>
          {minOrder && (
            <div className="text-[10px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">
              Min. Order: {minOrder} {moqUnit}
            </div>
          )}
        </div>

        {/* Add to Basket Button */}
        <button
          onClick={handleAddToCart}
          className="mt-3.5 w-full py-2 bg-gradient-to-r from-stone-950 via-stone-900 to-rose-900 hover:from-black hover:to-rose-950 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] border-0 cursor-pointer"
        >
          <ShoppingBasket size={13} />
          Add to Basket
        </button>
      </div>
    </Link>
  );
}
