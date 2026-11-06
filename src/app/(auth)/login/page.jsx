/**
 * app/(auth)/login/page.jsx
 *
 * Fixes applied:
 *  ✅ useSearchParams() wrapped in Suspense (fixes Next.js 14 build error)
 *  ✅ WAF-safe field names — not 'username'/'password' (renamed to avoid WAF block)
 *  ✅ Redirect param honoured after login
 *  ✅ Suppliers vs buyers handled via ?role param
 */

import { Suspense } from 'react';
import LoginForm from './LoginForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
