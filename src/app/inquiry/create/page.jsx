import { Suspense } from 'react';
import InquiryCreateContent from './InquiryCreateContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Send Inquiry — SL Beauty',
  description: 'Ask a supplier for more details, samples, or a custom quote on SL Beauty',
};

export default function InquiryCreatePage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading inquiry form…" />}>
      <InquiryCreateContent />
    </Suspense>
  );
}
