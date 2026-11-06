import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductsContent from './ProductsContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'SL Beauty Products' };

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSpinner label="Loading products…" />}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
