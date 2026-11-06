import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SuppliersContent from './SuppliersContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Verified Suppliers' };

export default function SuppliersPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Verified Sri Lankan Suppliers</h1>
          <p className="text-sm text-gray-400 mt-1">Browse audited exporters ready to fulfil your orders</p>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <SuppliersContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
