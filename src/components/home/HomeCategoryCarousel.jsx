'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import useCategories from '@/hooks/useCategories';
import { SRI_LANKA_CATEGORIES } from '@/lib/constants';

const FEATURED_CATEGORY_SLUGS = [
  'makeup',
  'skincare',
  'hair-care',
  'fragrance',
  'bath-body',
  'tools-brushes',
  'mens-grooming',
  'wellness',
];

const FALLBACK_IMAGE = '/images/categories/wellness.jpg';

function isSupportedImageSource(src) {
  if (!src) return false;
  if (String(src).startsWith('/')) return true;

  try {
    const { hostname } = new URL(src);
    return hostname === 'images.unsplash.com' || hostname === 'localhost';
  } catch {
    return false;
  }
}

function getCategoryImage(category, dbCategory) {
  const dbImage = dbCategory?.image || dbCategory?.image_url || dbCategory?.thumbnail;
  if (isSupportedImageSource(dbImage)) return dbImage;
  return category.image || FALLBACK_IMAGE;
}

export default function HomeCategoryCarousel() {
  const { categories } = useCategories();
  const [swiper, setSwiper] = useState(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  const updatePosition = (instance) => {
    setAtStart(instance.isBeginning);
    setAtEnd(instance.isEnd);
  };

  const carouselItems = useMemo(() => FEATURED_CATEGORY_SLUGS.map((slug) => {
    const category = SRI_LANKA_CATEGORIES.find((item) => item.slug === slug);
    if (!category) return null;

    const dbCategory = categories.find((item) => item.slug === slug);
    return {
      ...category,
      image: failedImages[slug] ? FALLBACK_IMAGE : getCategoryImage(category, dbCategory),
      label: dbCategory?.label || dbCategory?.name || category.label,
      href: category.href,
    };
  }).filter(Boolean), [categories, failedImages]);

  return (
    <section aria-label="Shop product categories" className="bg-white pb-5 pt-6 sm:pb-6 sm:pt-7 lg:pt-8">
      <div className="relative overflow-hidden">
        <Swiper
          onSwiper={(instance) => {
            setSwiper(instance);
            updatePosition(instance);
          }}
          onSlideChange={updatePosition}
          onResize={updatePosition}
          slidesPerView={1.65}
          spaceBetween={16}
          watchOverflow
          className="home-category-carousel"
          breakpoints={{
            480: { slidesPerView: 2.2, spaceBetween: 18 },
            640: { slidesPerView: 3.2, spaceBetween: 18 },
            768: { slidesPerView: 4.1, spaceBetween: 20 },
            1024: { slidesPerView: 5.15, spaceBetween: 20 },
            1280: { slidesPerView: 6, spaceBetween: 20 },
          }}
        >
          {carouselItems.map((category, index) => (
            <SwiperSlide key={category.slug} className="pb-1">
              <Link
                href={category.href}
                className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
              >
                <span className="relative block aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={category.image}
                    alt={category.imageAlt || category.label}
                    fill
                    priority={index < 2}
                    sizes="(max-width: 640px) 56vw, (max-width: 1024px) 24vw, 190px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.035]"
                    onError={() => setFailedImages((current) => ({ ...current, [category.slug]: true }))}
                  />
                </span>
                <span className="mt-3 block text-left text-base font-medium leading-snug text-gray-950 sm:text-[17px]">
                  {category.label}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          aria-label="Previous categories"
          onClick={() => swiper?.slidePrev()}
          disabled={!swiper || atStart}
          className={`absolute left-2 top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 sm:flex ${
            atStart ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <ChevronLeft size={23} />
        </button>

        <button
          type="button"
          aria-label="Next categories"
          onClick={() => swiper?.slideNext()}
          disabled={!swiper || atEnd}
          className={`absolute right-2 top-[42%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
            atEnd ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <ChevronRight size={23} />
        </button>
      </div>
    </section>
  );
}
