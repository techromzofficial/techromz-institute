import { Toaster } from 'react-hot-toast';
import MarketplaceProviders from '@/components/providers/MarketplaceProviders';
import './globals.css';

export const metadata = {
  title: {
    default: 'SL Beauty Platform — Premium Beauty Ecommerce Marketplace',
    template: '%s | SL Beauty Platform',
  },
  description:
    'Shop authentic beauty products, makeup, skincare, fragrance, hair care, bath and body essentials, beauty tools, gift sets, and original brands.',
  keywords: ['beauty ecommerce', 'makeup', 'skincare', 'fragrance', 'hair care', 'gift sets', 'beauty brands'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'SL Beauty Platform',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="font-sans">
      <body>
        <MarketplaceProviders>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { fontSize: '14px' },
              success: { iconTheme: { primary: '#155e2c', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </MarketplaceProviders>
      </body>
    </html>
  );
}
