'use client';

import Link from 'next/link';
import { ArrowRight, Scissors, Heart, GraduationCap, Calendar } from 'lucide-react';

const BEAUTY_BENEFITS = [
  {
    highlightTitle: 'Shop',
    normalTitle: ' Beauty',
    description: 'Shop advanced skincare, dermatology, laser treatments, and anti-aging therapies.',
    href: '#shop-beauty-section',
    Icon: Heart,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Aesthetic beauty clinic facial treatment',
  },
  {
    highlightTitle: 'Experience',
    normalTitle: ' Beauty',
    description: 'Professional hair styling, coloring, bridal makeovers, and nail artistry.',
    href: '#experience-beauty-section',
    Icon: Scissors,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Professional stylist working at a beauty salon',
  },
  {
    highlightTitle: 'Grow',
    normalTitle: ' Beauty',
    description: 'Certified training courses, makeup workshops, and professional beauty certifications.',
    href: '#grow-beauty-section',
    Icon: GraduationCap,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Cosmetics academy training workspace',
  },
  {
    highlightTitle: 'Learn',
    normalTitle: ' Beauty',
    description: 'Exclusive product launches, bridal exhibitions, fashion runways, and expos.',
    href: '/trade-shows',
    Icon: Calendar,
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Luxury beauty launch event setting',
  },
];

export default function FeaturedCards() {
  const handleHashClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <section aria-labelledby="beauty-benefits-title" className="relative mt-8 mb-16 sm:mt-12 lg:mb-24">
      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end lg:mb-14">
          <div className="max-w-2xl">
            <span className="mb-3 inline-block rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm">
              Explore Platform
            </span>
            <h2 id="beauty-benefits-title" className="mt-2 text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
              Professional services, academies & events
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-500">
              Discover professional styling services, certified academies, premium product launches, and exclusive beauty events across Sri Lanka.
            </p>
          </div>
          <Link href="/about" className="group hidden items-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-900 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md md:flex">
            View All Services
            <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {BEAUTY_BENEFITS.map(({ highlightTitle, normalTitle, description, href, Icon, imageUrl, imageAlt }) => (
            <Link 
              key={highlightTitle}
              href={href} 
              onClick={(e) => handleHashClick(e, href)} 
              aria-label={`${highlightTitle}${normalTitle}`}
              className="group relative flex h-[480px] w-full flex-col justify-end overflow-hidden rounded-[32px] bg-stone-900 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-400"
            >
              {/* Image Background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt={imageAlt} 
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-100" 
              />
              
              {/* Gradient Overlay for Text Readability (Dark bottom, transparent top) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/50" />

              {/* Icon Top Left */}
              <div className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/20 text-white shadow-lg backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-stone-950">
                <Icon size={24} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 sm:p-8 transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <h3 className="mb-3 text-3xl font-bold tracking-tight text-white">
                  {highlightTitle}<span className="text-white/70">{normalTitle}</span>
                </h3>
                <p className="mb-6 text-sm font-medium leading-relaxed text-stone-300 transition-colors duration-300 group-hover:text-stone-100 line-clamp-3">
                  {description}
                </p>
                
                {/* Prominent Button */}
                <div className="mt-auto flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-stone-950 group-hover:shadow-lg">
                  <span>Explore {highlightTitle}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-300 group-hover:bg-stone-100 group-hover:text-stone-900">
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
