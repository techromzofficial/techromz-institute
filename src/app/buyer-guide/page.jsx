import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BuyerGuideContent from './BuyerGuideContent';

export const metadata = {
  title: 'Buyer\'s Guide',
  description: 'Learn how to source, vet suppliers, post RFQs, and order confidently from Sri Lankan exporters on SL Beauty.',
};

export default function BuyerGuidePage() {
  return (
    <>
      <Header />
      <BuyerGuideContent />
      <Footer />
    </>
  );
}
