import { Suspense } from 'react';
import RegisterForm from './RegisterForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}
