'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function MarketplaceProviders({ children }) {
  const pathname = usePathname();

  if (pathname === '/institute' || pathname?.startsWith('/institute/')) {
    return children;
  }

  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
