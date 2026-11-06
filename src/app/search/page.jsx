/**
 * app/search/page.jsx
 *
 * Fix: useSearchParams() is inside <SearchContent> which is wrapped in <Suspense>
 * to prevent the Next.js 14 build-time warning/error.
 */

import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchContent from './SearchContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Search Products' };

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSpinner label="Loading search results…" />}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
