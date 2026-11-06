import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SupplierProfileContent from './SupplierProfileContent';

export async function generateMetadata({ params }) {
  return { title: `Supplier Profile — #${params.id}` };
}

export default function SupplierDetailPage({ params }) {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <SupplierProfileContent id={params.id} />
      </main>
      <Footer />
    </>
  );
}
