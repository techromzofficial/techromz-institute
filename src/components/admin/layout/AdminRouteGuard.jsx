'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { loginUrlFor } from '@/lib/authRedirect';

export function AdminRouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(loginUrlFor(pathname));
      return;
    }

    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isAuthenticated, loading, pathname, router, user]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <span className="sr-only">Verifying administrator access</span>
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary-800" />
      </div>
    );
  }

  return children;
}
