'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Sparkles, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { homepageConfig } from '@/data/homepageConfig';

function Heading({ children, icon: Icon, id }) { return <h2 id={id} className="mb-4 flex items-center gap-2 text-xl font-bold tracking-[-0.03em] text-[#161616] sm:text-2xl">{children}{Icon && <Icon size={18} className="text-primary-700" aria-hidden="true" />}</h2>; }
function HorizontalSlides({ children, slidesPerView, breakpoints }) { return <Swiper slidesPerView={slidesPerView} spaceBetween={12} watchOverflow breakpoints={breakpoints} className="overflow-visible">{children}</Swiper>; }
const CATEGORY_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=480&q=80';

function TrendingCategoryCard({ category }) {
  const [label, href, image] = category;
  const [imageSrc, setImageSrc] = useState(image);
  return <Link href={href} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"><span className="relative block aspect-[1.45/1] overflow-hidden rounded-xl bg-[#f4f2f2]"><Image src={imageSrc} alt={`${label} beauty category`} fill unoptimized loading="lazy" sizes="(max-width: 640px) 42vw, 180px" onError={() => { if (imageSrc !== CATEGORY_IMAGE_FALLBACK) setImageSrc(CATEGORY_IMAGE_FALLBACK); }} className="object-cover transition-transform duration-300 group-hover:scale-105" /></span><span className="mt-2 block text-xs font-semibold text-[#2c2726] group-hover:text-primary-700 sm:text-sm">{label}</span></Link>;
}

function TrendingCategories({ categories }) {
  const [swiper, setSwiper] = useState(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const updatePosition = (instance) => { setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); };
  return <section aria-labelledby="trending-categories"><div className="mb-4 flex items-center justify-between gap-4"><h2 id="trending-categories" className="text-xl font-bold tracking-[-0.03em] text-[#161616] sm:text-2xl">Trending Categories</h2><div className="flex gap-2"><button type="button" aria-label="Previous trending categories" onClick={() => swiper?.slidePrev()} disabled={!swiper || atStart} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e3e3] bg-white text-[#332a27] shadow-sm transition hover:border-primary-200 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={19} aria-hidden="true" /></button><button type="button" aria-label="Next trending categories" onClick={() => swiper?.slideNext()} disabled={!swiper || atEnd} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e3e3] bg-white text-[#332a27] shadow-sm transition hover:border-primary-200 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={19} aria-hidden="true" /></button></div></div><Swiper onSwiper={(instance) => { setSwiper(instance); updatePosition(instance); }} onSlideChange={updatePosition} onResize={updatePosition} slidesPerView={2.45} spaceBetween={12} watchOverflow grabCursor breakpoints={{ 640: { slidesPerView: 4.2, spaceBetween: 14 }, 1024: { slidesPerView: 6, spaceBetween: 16 }, 1280: { slidesPerView: 7, spaceBetween: 16 } }} className="overflow-visible">{categories.map((category) => <SwiperSlide key={category[0]}><TrendingCategoryCard category={category} /></SwiperSlide>)}</Swiper></section>;
}

function BeautyTubeModal({ video, onClose, origin }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&playsinline=1&rel=0`;
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button, a, iframe');
        if (!focusable?.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); origin?.focus(); };
  }, [onClose, origin]);
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="beauty-tube-player-title" className="relative w-[min(420px,calc(88vh*9/16),calc(100vw-32px))] overflow-hidden rounded-[18px] bg-black shadow-2xl"><button ref={closeRef} type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close video"><X size={20} aria-hidden="true" /></button><iframe className="block aspect-[9/16] w-full border-0" src={embedUrl} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /><div className="bg-black px-4 py-3"><h3 id="beauty-tube-player-title" className="text-sm font-bold text-white">{video.title}</h3><a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-white/80 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Watch on YouTube</a></div></div></div>;
}

export default function AfterMonsoonSections() {
  const { trendingCategories, beautyTubeVideos, promotionalBanners } = homepageConfig;
  const { offer, advisor } = promotionalBanners;
  const [selectedVideo, setSelectedVideo] = useState(null);
  const originRef = useRef(null);
  const openVideo = (video, event) => { originRef.current = event.currentTarget; setSelectedVideo(video); };
  return <div className="pb-4 pt-10 sm:pb-6 sm:pt-14">
    <TrendingCategories categories={trendingCategories} />
    <section aria-labelledby="beauty-tube" className="mt-10 sm:mt-14"><Heading id="beauty-tube" icon={Play}>SL Beauty Tube</Heading><HorizontalSlides slidesPerView={1.75} breakpoints={{ 640: { slidesPerView: 3.25, spaceBetween: 14 }, 1024: { slidesPerView: 5, spaceBetween: 16 }, 1280: { slidesPerView: 6, spaceBetween: 16 } }}>{beautyTubeVideos.map((video) => <SwiperSlide key={video.id}><button type="button" onClick={(event) => openVideo(video, event)} aria-label={`Play ${video.title}`} className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-[#242020] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"><Image src={video.posterUrl} alt={`${video.title} video poster`} fill unoptimized loading="lazy" sizes="(max-width: 640px) 58vw, 210px" className="object-cover transition-transform duration-300 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" /><span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">{video.duration}</span><span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary-700 transition-transform group-hover:scale-105"><Play size={17} aria-hidden="true" /></span><span className="absolute inset-x-0 bottom-0 p-3 text-sm font-bold text-white">{video.title}</span></button></SwiperSlide>)}</HorizontalSlides></section>
    <section aria-label="SL Beauty offers" className="relative mt-10 min-h-[220px] overflow-hidden rounded-[20px] bg-[#dc3a42] sm:mt-14 sm:min-h-[250px]"><Image src={offer.imageUrl} alt="" fill unoptimized loading="lazy" sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover object-right opacity-70" /><span className="absolute inset-0 bg-gradient-to-r from-[#d92836] via-[#dd3b43]/85 to-[#dd3b43]/25" /><div className="relative flex min-h-[220px] max-w-lg flex-col justify-center p-6 text-white sm:min-h-[250px] sm:p-10"><p className="text-sm font-bold uppercase tracking-[.12em]">{offer.eyebrow}</p><h2 className="mt-2 text-2xl font-bold tracking-[-.04em] sm:text-4xl">{offer.title}</h2><Link href={offer.buttonUrl} className="mt-5 inline-flex min-h-11 self-start items-center rounded-xl bg-white px-5 text-sm font-bold text-primary-800 shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{offer.buttonLabel}</Link></div></section>
    <section aria-label="SL Beauty advisor" className="relative mt-4 overflow-hidden rounded-[20px] border border-[#f0d9d4] bg-[#fff1ed] sm:mt-6"><Image src={advisor.imageUrl} alt="" fill unoptimized loading="lazy" sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover object-right opacity-25" /><span className="absolute right-[12%] top-6 text-amber-500"><Sparkles aria-hidden="true" /></span><div className="relative max-w-2xl p-6 sm:p-10"><p className="text-sm font-bold uppercase tracking-[.12em] text-primary-700">{advisor.eyebrow}</p><h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#251e1d] sm:text-4xl">{advisor.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#5f5553] sm:text-base">{advisor.description}</p><div className="mt-5 flex flex-wrap gap-3"><Link href={advisor.primaryUrl} className="inline-flex min-h-11 items-center rounded-xl bg-[#201a19] px-5 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700">{advisor.primaryLabel}</Link><Link href={advisor.secondaryUrl} className="inline-flex min-h-11 items-center rounded-xl border border-[#d9c7c3] bg-white px-5 text-sm font-bold text-[#302827] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700">{advisor.secondaryLabel}</Link></div></div></section>
    {selectedVideo && <BeautyTubeModal video={selectedVideo} origin={originRef.current} onClose={() => setSelectedVideo(null)} />}
  </div>;
}
