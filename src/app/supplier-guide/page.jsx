import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SupplierGuideContent from './SupplierGuideContent';

export const metadata = {
  title: 'Supplier\'s Guide',
  description: 'Set up your storefront, get verified, list products, and start exporting to global buyers through SL Beauty.',
};

export default function SupplierGuidePage() {
  return (
    <>
      <Header />
      <SupplierGuideContent />
      <Footer />
    </>
  );
}
