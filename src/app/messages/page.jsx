import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MessagesContent from './MessagesContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Messages' };

export default function MessagesPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSpinner label="Loading messages…" />}>
          <MessagesContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
