'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { HERO_SLIDES } from '@/lib/constants';

export default function HeroSlider() {
  const slides = HERO_SLIDES;

  if (!slides.length) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-xl">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4600, disableOnInteraction: false }}
          loop={slides.length > 1}
          className="beauty-hero-swiper h-[240px] sm:h-[340px] lg:h-[430px] [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet]:opacity-60 [&_.swiper-pagination-bullet-active]:w-8 [&_.swiper-pagination-bullet-active]:rounded-full [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination-bullet-active]:opacity-100"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <Link href={slide.link || '/products'} className="relative block h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt || slide.title || 'SL Beauty promotion'}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover object-center"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
