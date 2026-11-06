'use client';

import Link from 'next/link';
import { 
  ArrowRight, Heart, Scissors, GraduationCap, Star, 
  MapPin, Clock, Award, ShieldCheck, Sparkles, BookOpen 
} from 'lucide-react';

export default function BeautyFeatureSections() {
  return (
    <div className="space-y-20 py-10 sm:py-16">
      
      {/* ── SECTION 1: SHOP BEAUTY ────────────────────────────────────────── */}
      <section 
        id="shop-beauty-section" 
        className="scroll-mt-24 relative mx-auto max-w-screen-xl overflow-hidden rounded-[40px] border border-stone-200/80 bg-[#fbfbf9] px-6 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] sm:px-10 sm:py-12 lg:px-14 lg:py-16"
      >
        <span aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-50/70 blur-3xl" />
        <span aria-hidden="true" className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl" />

        <div className="relative mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end lg:mb-14">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 shadow-sm border border-emerald-100/50">
              <Heart size={14} className="fill-emerald-700/20" /> Shop Beauty
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
              Premium Beauty Collections
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-500">
              Explore our curated range of genuine skincare, exquisite fragrances, cosmetic essentials, and clinical wellness products.
            </p>
          </div>
          <Link 
            href="/products" 
            className="group hidden md:flex items-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-900 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
          >
            Shop All Products
            <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {[
            {
              title: 'Skincare Solutions',
              desc: 'Advanced serums, hydrators, mineral sunscreens, and clinical acne care.',
              image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80',
              link: '/products?category=skincare',
              tag: 'Active Care',
            },
            {
              title: 'Luxury Fragrance',
              desc: 'Exquisite signature perfumes, cologne formulations, and body mists.',
              image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
              link: '/products?category=fragrance',
              tag: 'Premium Scent',
            },
            {
              title: 'Professional Makeup',
              desc: 'Flawless foundations, vibrant palettes, liners, and artistry brushes.',
              image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
              link: '/products?category=makeup',
              tag: 'Artistry',
            },
            {
              title: 'Nourishing Hair Care',
              desc: 'Scalp treatments, recovery masks, restructuring oils, and stylers.',
              image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=600&q=80',
              link: '/products?category=hair-care',
              tag: 'Salon Grade',
            }
          ].map((cat, i) => (
            <div 
              key={i} 
              className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-stone-200/60 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-200/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold tracking-wide text-emerald-800 shadow-sm">
                  {cat.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="text-xl font-bold text-stone-900 transition-colors duration-300 group-hover:text-emerald-800">
                  {cat.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-stone-500">
                  {cat.desc}
                </p>
                
                {/* Prominent Button */}
                <Link 
                  href={cat.link}
                  className="mt-6 flex w-full items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-900 transition-all duration-300 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-900"
                >
                  <span>Explore Collection</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: EXPERIENCE BEAUTY ──────────────────────────────────── */}
      <section 
        id="experience-beauty-section" 
        className="scroll-mt-24 relative mx-auto max-w-screen-xl overflow-hidden rounded-[40px] border border-stone-200/80 bg-[#fffbfc] px-6 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] sm:px-10 sm:py-12 lg:px-14 lg:py-16"
      >
        <span aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-50/70 blur-3xl" />
        <span aria-hidden="true" className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-rose-100/30 blur-3xl" />

        <div className="relative mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end lg:mb-14">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-700 shadow-sm border border-rose-100/50">
              <Scissors size={14} /> Experience Beauty
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
              Salons &amp; Wellness Partners
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-500">
              Book authorized styling salons, dermatological skin clinics, and premium bridal makeovers near you in Sri Lanka.
            </p>
          </div>
          <Link 
            href="/suppliers?q=salon" 
            className="group hidden md:flex items-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-900 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
          >
            Browse Partners
            <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 md:grid-cols-3">
          {[
            {
              title: 'Elysian Hair & Color Studio',
              desc: 'Specialising in modern balayage, botanical conditioning, custom cuts, and vibrant fashion shades.',
              image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80',
              features: ['Hair Styling & Cut', 'Keratin Treatments', 'Hair Coloring'],
              rating: 4.9,
              reviews: 142,
              location: 'Colombo 07',
              link: '/suppliers?q=salon',
            },
            {
              title: 'Aura Advanced Aesthetic Clinic',
              desc: 'Laser treatments, dermabrasion, anti-aging therapies, and custom medical-grade facials.',
              image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80',
              features: ['Laser Therapy', 'Chemical Peels', 'Diagnostics'],
              rating: 4.8,
              reviews: 89,
              location: 'Kandy Central',
              link: '/suppliers?q=clinic',
            },
            {
              title: 'Glamour Bridal & Nail Lounge',
              desc: 'Stunning wedding makeup styling, airbrush foundation, premium gel extensions, and nail art.',
              image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=80',
              features: ['Bridal Makeovers', 'Gel Nail Artistry', 'Mehndi'],
              rating: 5.0,
              reviews: 210,
              location: 'Negombo Road',
              link: '/suppliers?q=bridal',
            }
          ].map((partner, i) => (
            <div 
              key={i} 
              className="group flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200/60 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-rose-200/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={partner.image} 
                    alt={partner.title} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-amber-600 shadow-sm">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    {partner.rating} <span className="font-medium text-stone-400">({partner.reviews})</span>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <MapPin size={14} /> {partner.location}
                  </div>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 transition-colors duration-300 group-hover:text-rose-800">
                    {partner.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-500">
                    {partner.desc}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {partner.features.map((feat, idx) => (
                      <span 
                        key={idx} 
                        className="rounded-full border border-stone-200/60 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-8 sm:pb-8 mt-auto">
                {/* Prominent Button */}
                <Link 
                  href={partner.link}
                  className="mt-2 flex w-full items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-900 transition-all duration-300 group-hover:border-rose-200 group-hover:bg-rose-50 group-hover:text-rose-900"
                >
                  <span>View Services</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-rose-600 group-hover:text-white">
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: GROW BEAUTY ────────────────────────────────────────── */}
      <section 
        id="grow-beauty-section" 
        className="scroll-mt-24 relative mx-auto max-w-screen-xl overflow-hidden rounded-[40px] border border-stone-200/80 bg-[#fffdfb] px-6 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] sm:px-10 sm:py-12 lg:px-14 lg:py-16"
      >
        <span aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-50/70 blur-3xl" />
        <span aria-hidden="true" className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="relative mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end lg:mb-14">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 shadow-sm border border-amber-100/50">
              <GraduationCap size={15} /> Grow Beauty
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
              Advance Your Career
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-500">
              Enroll in professional cosmetics workshops, bridal makeup masterclasses, and certified beauty training academies.
            </p>
          </div>
          <Link 
            href="/suppliers?q=academy" 
            className="group hidden md:flex items-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-900 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
          >
            Explore Academies
            <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Academies / Courses Grid */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 md:grid-cols-3">
          {[
            {
              title: 'Bridal Makeup Certification',
              academy: 'Lumina Academy',
              duration: '6 Weeks (Saturdays)',
              level: 'Beginner to Inter.',
              credentials: 'SL Beauty Diploma',
              desc: 'Comprehensive training in color theory, face sculpting, HD bridal makeups, and airbrushing.',
              image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
              link: '/suppliers?q=academy',
            },
            {
              title: 'Advanced Hair Styling Masterclass',
              academy: 'Vogue Institute',
              duration: '3 Months (Part-time)',
              level: 'Inter. to Advanced',
              credentials: 'Global Hair Certification',
              desc: 'Master precision scissor cuts, blow-dry chemistry, salon styling, and modern color techniques.',
              image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=80',
              link: '/suppliers?q=academy',
            },
            {
              title: 'Aesthetic Beauty Therapy',
              academy: 'Dermal Science Assoc.',
              duration: '4 Weeks (Fast-track)',
              level: 'All Levels Welcome',
              credentials: 'Dermatology Certificate',
              desc: 'Understand skin structures, custom serum blending, laser safety, and modern facial device protocols.',
              image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=500&q=80',
              link: '/suppliers?q=academy',
            }
          ].map((course, i) => (
            <div 
              key={i} 
              className="group flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200/60 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-200/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-sm border border-stone-100">
                    <BookOpen size={14} className="text-amber-600" /> {course.level}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                    {course.academy}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold leading-tight text-stone-900 transition-colors duration-300 group-hover:text-amber-800">
                    {course.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-500">
                    {course.desc}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-stone-100 pt-4 text-xs text-stone-600">
                    <div className="flex items-center gap-2.5">
                      <Clock size={14} className="text-stone-400" />
                      <span><strong>Duration:</strong> {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Award size={14} className="text-amber-600" />
                      <span><strong>Credential:</strong> {course.credentials}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-8 sm:pb-8 mt-auto">
                {/* Prominent Button */}
                <Link 
                  href={course.link}
                  className="mt-2 flex w-full items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-900 transition-all duration-300 group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:text-amber-900"
                >
                  <span>Enquire Course</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white">
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-[24px] border border-amber-100/50 bg-amber-50/50 p-6 sm:flex-row sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber-100/80 bg-white text-amber-700 shadow-sm">
              <ShieldCheck size={26} />
            </span>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                SL Beauty Certified Academies
              </h4>
              <p className="mt-1 text-xs text-stone-500">
                All listed institutions and academies undergo strict verification to ensure industry standard excellence.
              </p>
            </div>
          </div>
          <span className="flex select-none items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-amber-850">
            <Sparkles size={14} /> Learn from Experts
          </span>
        </div>
      </section>

    </div>
  );
}
