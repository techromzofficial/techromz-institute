import Header             from '@/components/layout/Header';
import Footer             from '@/components/layout/Footer';
import HomeCategoryCarousel from '@/components/home/HomeCategoryCarousel';
import HeroSlider         from '@/components/home/HeroSlider';
import FeaturedCards      from '@/components/home/FeaturedCards';
import BeautyFeatureSections from '@/components/home/BeautyFeatureSections';
import TrendingProducts   from '@/components/home/TrendingProducts';
import CategoryGridSection from '@/components/home/CategoryGridSection';
import HomePromoVideo     from '@/components/home/HomePromoVideo';
import HomePromotionalCarousels from '@/components/home/HomePromotionalCarousels';
import BeautyProductShowcases from '@/components/home/BeautyProductShowcases';
import HomeDiscoverySections from '@/components/home/HomeDiscoverySections';
import AIBeautyDiagnosticsSection from '@/components/home/AIBeautyDiagnosticsSection';
import AfterMonsoonSections from '@/components/home/AfterMonsoonSections';
import { SL_BEAUTY_DISPLAY_CONFIG } from '@/lib/slBeautyConfig';

export const metadata = {
  title: `${SL_BEAUTY_DISPLAY_CONFIG.displayName} — Sri Lanka Beauty Marketplace`,
  description: SL_BEAUTY_DISPLAY_CONFIG.description,
};

// Edit every label, image, and destination for the category showcase in this one object.
const BEAUTY_CATEGORY_SECTION = {
  id: 'beauty-categories',
  title: 'Shop Beauty Categories',
  viewAllLabel: 'View All',
  viewAllUrl: '/categories',
  promoTitle: 'Find Your Beauty Routine',
  promoSubtitle: 'Browse skincare, makeup, haircare, fragrance, bath and body, wellness, beauty tools, and luxury beauty',
  promoBg: 'linear-gradient(135deg, #b62f59 0%, #e66b9a 100%)',
  promoImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80',
  promoHref: '/products',
  promoButtonLabel: 'Shop Now',
  items: [
    ['makeup', 'Makeup', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=320&q=80'],
    ['skincare', 'Skincare', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=320&q=80'],
    ['fragrance', 'Fragrance', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=320&q=80'],
    ['hair-care', 'Haircare', 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=320&q=80'],
    ['bath-body', 'Bath & Body', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=320&q=80'],
    ['tools-brushes', 'Beauty Tools', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=320&q=80'],
    ['wellness', 'Wellness', '/images/categories/wellness.jpg'],
    ['luxury-beauty', 'Luxury Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=320&q=80'],
  ].map(([slug, label, image]) => ({ slug, label, image, href: `/categories/${slug}`, imageAlt: `${label} beauty category` })),
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-3 py-3 sm:px-4 sm:py-4">

        {/* ── Full-width beauty hero slider ─────────────────── */}
        <div className="w-full">
          <HeroSlider />
        </div>

        <HomeCategoryCarousel />

        {/* ── Featured service cards ─────────────────────────── */}
        <FeaturedCards />

        {/* ── Custom detailed section targets ─────────────────── */}
        <BeautyFeatureSections />

        {/* ── Trending products grid ─────────────────────────── */}
        <TrendingProducts />

        <BeautyProductShowcases />

        <HomeDiscoverySections afterStories={<AIBeautyDiagnosticsSection />} />

        {/* ── Beauty product category sections, using public SL Beauty display data ── */}
        <CategoryGridSection section={BEAUTY_CATEGORY_SECTION} />
        <HomePromoVideo />
        <HomePromotionalCarousels />
        <AfterMonsoonSections />

      </main>
      <Footer />
    </>
  );
}
