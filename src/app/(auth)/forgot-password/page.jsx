import { Suspense } from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
