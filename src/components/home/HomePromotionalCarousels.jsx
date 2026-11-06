'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';

const bestInSkinItems = [
  {
    id: 'top-sellers',
    title: 'Top Sellers',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85',
    caption: 'Up to 50% off on bestselling skincare',
    link: '/products?category=skincare&sort=popular',
    alt: 'Top selling skincare offers',
  },
  {
    id: 'cosrx',
    title: 'COSRX',
    image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=85',
    caption: 'Min. 20% off on viral K-beauty essentials',
    link: '/products?category=skincare&q=cosrx',
    alt: 'COSRX skincare products',
  },
  {
    id: 'the-ordinary',
    title: 'The Ordinary',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=85',
    caption: 'Up to 20% off on bestseller combos',
    link: '/products?category=skincare&q=ordinary',
    alt: 'The Ordinary skincare products',
  },
  {
    id: 'medicube',
    title: 'Medicube',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85',
    caption: 'Flat 20% off on Korean skincare faves',
    link: '/products?category=skincare&q=medicube',
    alt: 'Medicube Korean skincare products',
  },
];

const monsoonItems = [
  {
    id: 'monsoon-skin-sos',
    title: 'Monsoon Skin SOS',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=skincare&q=monsoon',
    alt: 'Monsoon Skin SOS',
  },
  {
    id: 'monsoon-spf',
    title: 'Monsoon SPF',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=skincare&q=sunscreen',
    alt: 'Monsoon SPF essentials',
  },
  {
    id: 'monsoon-hair-edit',
    title: 'Monsoon Hair Edit',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=hair-care&q=monsoon',
    alt: 'Monsoon Hair Edit',
  },
  {
    id: 'waterproof-makeup',
    title: 'Waterproof Makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=makeup&q=waterproof',
    alt: 'Waterproof Makeup',
  },
  {
    id: 'bath-body',
    title: 'Bath & Body',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=bath-body',
    alt: 'Bath and Body care',
  },
  {
    id: 'long-lasting-scents',
    title: 'Long-lasting Scents',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=85',
    link: '/products?category=fragrance&q=long-lasting',
    alt: 'Long-lasting Scents',
  },
];

const carouselConfig = {
  landscape: {
    imageRatio: 'aspect-[1.48/1]',
    sizes: '(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 295px',
    breakpoints: {
      480: { slidesPerView: 1.45, spaceBetween: 16 },
      640: { slidesPerView: 2.2, spaceBetween: 18 },
      1024: { slidesPerView: 3.15, spaceBetween: 20 },
      1280: { slidesPerView: 3.75, spaceBetween: 20 },
    },
    mobileSlides: 1.25,
  },
  category: {
    imageRatio: 'aspect-[1/1.02]',
    sizes: '(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 185px',
    breakpoints: {
      480: { slidesPerView: 2.2, spaceBetween: 16 },
      640: { slidesPerView: 3.05, spaceBetween: 18 },
      1024: { slidesPerView: 4.65, spaceBetween: 18 },
      1280: { slidesPerView: 5.7, spaceBetween: 18 },
    },
    mobileSlides: 1.85,
  },
};

function PromotionalCarousel({ title, items, variant = 'landscape' }) {
  const [swiper, setSwiper] = useState(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const config = carouselConfig[variant] || carouselConfig.landscape;

  const updatePosition = (instance) => {
    setAtStart(Boolean(instance.isBeginning));
    setAtEnd(Boolean(instance.isEnd));
  };

  return (
    <section aria-labelledby={`${variant}-${title.replace(/\s+/g, '-').toLowerCase()}`} className="bg-white">
      <h2
        id={`${variant}-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="mb-5 text-2xl font-medium leading-tight text-gray-950"
      >
        {title}
      </h2>

      <div className="relative overflow-hidden">
        <Swiper
          onSwiper={(instance) => {
            setSwiper(instance);
            updatePosition(instance);
          }}
          onSlideChange={updatePosition}
          onResize={updatePosition}
          onReachBeginning={updatePosition}
          onReachEnd={updatePosition}
          slidesPerView={config.mobileSlides}
          spaceBetween={16}
          watchOverflow
          grabCursor
          breakpoints={config.breakpoints}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="pb-1">
              <Link
                href={item.link}
                className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
              >
                <span className={`relative block ${config.imageRatio} overflow-hidden rounded-md bg-gray-100`}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    unoptimized
                    sizes={config.sizes}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="mt-3 block text-left text-[15px] font-normal leading-6 text-gray-950 sm:text-base">
                  {item.caption || item.title}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          aria-label={`Previous ${title} items`}
          onClick={() => swiper?.slidePrev()}
          disabled={!swiper || atStart}
          className={`absolute left-1 top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-950 shadow-[0_8px_22px_rgba(15,23,42,0.16)] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 sm:flex ${
            atStart ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <ChevronLeft size={23} />
        </button>

        <button
          type="button"
          aria-label={`Next ${title} items`}
          onClick={() => swiper?.slideNext()}
          disabled={!swiper || atEnd}
          className={`absolute right-1 top-[42%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-950 shadow-[0_8px_22px_rgba(15,23,42,0.16)] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 sm:-right-1 ${
            atEnd ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <ChevronRight size={23} />
        </button>
      </div>
    </section>
  );
}

export default function HomePromotionalCarousels() {
  return (
    <div className="space-y-12 bg-white pt-10 sm:space-y-14 sm:pt-12">
      <PromotionalCarousel title="Best In Skin" items={bestInSkinItems} variant="landscape" />
      <PromotionalCarousel title="Monsoon Special" items={monsoonItems} variant="category" />
    </div>
  );
}
