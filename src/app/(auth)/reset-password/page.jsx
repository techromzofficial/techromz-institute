import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Reset Password' };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
