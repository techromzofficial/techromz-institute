'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const PRODUCT_IMAGES = {
  tool1: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&q=80',
  tool2: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=240&q=80',
  tool3: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=240&q=80',
  tool4: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=240&q=80',
  tool5: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&q=80',
  tool6: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=240&q=80',
  tool7: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=240&q=80',
  tool8: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=240&q=80',
  cream1: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=240&q=80',
  cream2: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=240&q=80',
  cream3: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=240&q=80',
  cream4: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=240&q=80',
  cream5: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=240&q=80',
  cream6: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=240&q=80',
  cream7: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=240&q=80',
  cream8: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=240&q=80',
};

const BEAUTY_SHOWCASES = [
  {
    id: 'beauty-tools', 
    title: 'Beauty Tools & Accessories', 
    viewAllUrl: '/products?collection=tools-brushes', 
    introTitle: 'Professional Gear',
    introDescription: 'Hair trimmers, facial massagers, precision tools, and professional brushes', 
    shopUrl: '/products?collection=tools-brushes',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1800&q=80',
    introBackgroundImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80', 
    variant: 'light',
    products: [
      ['essential-beauty-tools-set', 'Essential Beauty Tools Set', 'tool1'], 
      ['makeup-brush-collection', 'Makeup Brush Collection', 'tool2'], 
      ['professional-hair-trimmer', 'Professional Hair Trimmer', 'tool3'], 
      ['premium-beauty-organizer-box', 'Premium Beauty Organizer Box', 'tool4'],
      ['aesthetic-wooden-hair-comb', 'Aesthetic Wooden Hair Comb', 'tool5'], 
      ['salon-blow-hair-dryer', 'Salon Blow Hair Dryer', 'tool6'], 
      ['electric-face-massager', 'Electric Face Massager', 'tool7'], 
      ['heated-eyelash-curler', 'Heated Eyelash Curler', 'tool8'],
    ],
  },
  {
    id: 'premium-beauty-picks', 
    title: 'Premium Beauty Picks', 
    viewAllUrl: '/products?collection=premium-beauty', 
    introTitle: 'Brands To Love',
    introDescription: 'Moisturizing creams, night creams, eye creams, and everyday facial skin formulas', 
    shopUrl: '/brands',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80',
    introBackgroundImageUrl: 'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=700&q=80', 
    variant: 'dark',
    products: [
      ['daily-moisturizing-cream', 'Daily Moisturizing Cream', 'cream1'], 
      ['retinol-night-cream', 'Retinol Night Cream', 'cream2'], 
      ['brightening-eye-cream', 'Brightening Eye Cream', 'cream3'], 
      ['anti-wrinkle-day-cream', 'Anti-Wrinkle Day Cream', 'cream4'],
      ['soothing-aloe-vera-cream', 'Soothing Aloe Vera Cream', 'cream5'], 
      ['clarifying-blemish-cream', 'Clarifying Blemish Cream', 'cream6'], 
      ['deep-hydration-water-cream', 'Deep Hydration Water Cream', 'cream7'], 
      ['vitamin-c-radiance-cream', 'Vitamin C Radiance Cream', 'cream8'],
    ],
  },
].map((showcase) => ({
  ...showcase,
  products: showcase.products.map(([id, name, imageKey]) => ({ 
    id, 
    name, 
    imageUrl: PRODUCT_IMAGES[imageKey], 
    imageAlt: name, 
    productUrl: `/products?search=${encodeURIComponent(name)}` 
  })),
}));

function ShowcasePanel({ showcase }) {
  const dark = showcase.variant === 'dark';

  return (
    <article className={`relative overflow-hidden rounded-[40px] border shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] ${dark ? 'border-white/10 bg-[#3a2027]' : 'border-stone-200/60 bg-[#faf8f6]'}`}>
      <Image 
        src={showcase.backgroundImageUrl} 
        alt="" 
        fill 
        unoptimized 
        sizes="(max-width: 1280px) 100vw, 1200px" 
        className="pointer-events-none object-cover opacity-60" 
      />
      <span aria-hidden="true" className={`absolute inset-0 ${dark ? 'bg-gradient-to-r from-[#2c151c]/95 via-[#4a2631]/80 to-[#2c151c]/95' : 'bg-gradient-to-r from-white/95 via-white/80 to-white/95'}`} />
      
      {dark && (
        <>
          <span aria-hidden="true" className="absolute right-[10%] top-[20%] h-48 w-48 rounded-full bg-rose-400/20 blur-3xl" />
          <span aria-hidden="true" className="absolute bottom-10 right-[20%] h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />
        </>
      )}

      <header className={`relative z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md sm:px-8 ${dark ? 'border-white/10 bg-black/20 text-white' : 'border-stone-200/50 bg-white/40 text-stone-900'}`}>
        <div className="flex items-center gap-3">
          <Sparkles className={dark ? "text-rose-300" : "text-amber-500"} size={18} />
          <h2 className="text-base font-extrabold tracking-wide uppercase sm:text-lg">{showcase.title}</h2>
        </div>
        <Link href={showcase.viewAllUrl} className={`group flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors ${dark ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-stone-900 text-white hover:bg-rose-600'}`}>
          View All <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[22rem_1fr]">
        <aside className="relative flex min-h-[250px] flex-col justify-end overflow-hidden p-6 sm:min-h-[300px] sm:p-8">
          <Image 
            src={showcase.introBackgroundImageUrl} 
            alt="" 
            fill 
            unoptimized 
            sizes="(max-width: 768px) 100vw, 400px" 
            className="pointer-events-none object-cover transition-transform duration-700 hover:scale-105" 
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="relative z-10 flex flex-col items-start">
            <span className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
              Featured Collection
            </span>
            <h3 className="text-2xl font-black text-white drop-shadow-lg">{showcase.introTitle}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-white/90 drop-shadow-md">
              {showcase.introDescription}
            </p>
            <Link 
              href={showcase.shopUrl} 
              className="mt-6 flex items-center justify-between gap-4 rounded-full bg-white px-6 py-3 text-sm font-bold text-stone-950 shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-105 hover:bg-stone-100 hover:shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </aside>

        <div className={`grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 sm:p-8 ${dark ? 'bg-black/10' : 'bg-stone-50/50'}`}>
          {showcase.products.map((product) => (
            <Link 
              key={product.id} 
              href={product.productUrl} 
              className={`group flex flex-col items-center justify-center gap-4 rounded-[32px] p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] ${dark ? 'bg-white/5 hover:bg-white/15' : 'bg-white shadow-sm hover:bg-white'}`}
            >
              <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full shadow-inner ring-4 ring-transparent transition-all duration-500 group-hover:ring-rose-500/20 sm:h-28 sm:w-28 ${dark ? 'bg-white/10' : 'bg-[#faf8f6]'}`}>
                <span className="absolute inset-0 z-10 rounded-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <Image 
                  src={product.imageUrl} 
                  alt={product.imageAlt} 
                  fill 
                  unoptimized 
                  loading="lazy" 
                  sizes="(max-width: 640px) 96px, 112px" 
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                />
              </div>
              <span className={`text-center text-[11px] font-bold leading-tight sm:text-xs ${dark ? 'text-white/90 group-hover:text-white' : 'text-stone-600 group-hover:text-stone-950'}`}>
                {product.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function BeautyProductShowcases() {
  return (
    <section aria-label="Featured beauty product collections" className="relative mt-12 space-y-10 px-4 sm:px-6 lg:px-8">
      {BEAUTY_SHOWCASES.map((showcase) => <ShowcasePanel key={showcase.id} showcase={showcase} />)}
    </section>
  );
}
