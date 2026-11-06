import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryContent from './CategoryContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SRI_LANKA_CATEGORIES } from '@/lib/constants';

const CATEGORY_ALIASES = {
  hair: 'hair-care',
  haircare: 'hair-care',
  'bath-and-body': 'bath-body',
  'beauty-tools': 'tools-brushes',
  tools: 'tools-brushes',
  men: 'mens-grooming',
  'men-grooming': 'mens-grooming',
};

export async function generateMetadata({ params }) {
  const slug = CATEGORY_ALIASES[params.slug] || params.slug;
  const category = SRI_LANKA_CATEGORIES.find((item) => item.slug === slug);
  const title = category?.label || params.slug.replaceAll('-', ' ');

  return { title: `${title} — SL Beauty Platform` };
}

export default function CategoryPage({ params }) {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryContent slug={params.slug} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
