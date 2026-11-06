import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OrdersContent from './OrdersContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'My Orders' };

export default function OrdersPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">My Orders</h1>
        <p className="text-sm text-gray-400 mb-6">Track and manage your purchase orders</p>
        <Suspense fallback={<LoadingSpinner />}>
          <OrdersContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
