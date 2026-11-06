'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { FOOTER_APP_LINKS, FOOTER_LEGAL_LINKS, FOOTER_LINKS } from '@/lib/constants';
import { api } from '@/lib/api/client';
import FooterAppBadge from './FooterAppBadge';

export default function Footer() {
  const year = new Date().getFullYear();
  const fallbackAppLinks = FOOTER_APP_LINKS.filter((app) => app.enabled && app.imageUrl);
  const [enabledAppLinks, setEnabledAppLinks] = useState(fallbackAppLinks);

  useEffect(() => {
    let active = true;

    api.get('/public/footer-app-badges')
      .then((response) => {
        const badges = response?.data?.appBadges ?? response?.appBadges;
        if (active && Array.isArray(badges) && badges.length > 0) {
          setEnabledAppLinks(badges.filter((app) => app.imageUrl));
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Footer app badges API unavailable; using local fallback.', error);
        }
      });

    return () => { active = false; };
  }, []);
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      {/* Main links grid */}
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">{heading}</h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-primary-700 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Language options col */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Language Options</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {['Sinhala', 'Tamil', 'Arabic', 'Español', 'Français', 'Deutsch', 'Русский', '日本語', '한국어', 'Português'].map((lang) => (
                <button key={lang} className="text-left text-sm text-gray-500 hover:text-primary-700 transition-colors">
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App + social strip */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Quick Shop:</span>
            <Link
              href="/products"
              className="flex items-center gap-1.5 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              Shop Products
            </Link>
            <Link
              href="/brands"
              className="flex items-center gap-1.5 bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600"
            >
              Browse Brands
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Follow Us:</span>
            {[
              { Icon: Facebook, href: 'https://www.facebook.com/', label: 'Facebook' },
              { Icon: Twitter,  href: 'https://x.com/', label: 'Twitter'  },
              { Icon: Instagram,href: 'https://www.instagram.com/', label: 'Instagram'},
              { Icon: Youtube,  href: 'https://www.youtube.com/', label: 'YouTube'  },
              { Icon: Linkedin, href: 'https://www.linkedin.com/', label: 'LinkedIn' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 text-gray-600 hover:bg-primary-800 hover:text-white transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Legal links and app downloads */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-5 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <nav aria-label="Legal and policy links" className="flex min-w-0 flex-1 flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary-700 hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>

          {enabledAppLinks.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end" aria-label="Download the SL Beauty mobile app">
              {enabledAppLinks.map((app) => (
                <FooterAppBadge key={app.platform} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
            {['New Arrivals','Best Sellers','Makeup','Skincare','Fragrance','Gift Sets'].map((item) => (
              <Link key={item} href={`/products?q=${encodeURIComponent(item)}`} className="hover:text-primary-700">
                {item}
              </Link>
            ))}
          </div>
          <div className="text-center text-xs text-gray-400 flex flex-wrap justify-center gap-x-3">
            <span>© {year} SL Beauty Platform · Premium Beauty Ecommerce Marketplace</span>
            <Link href="/help-center" className="hover:text-primary-700">Help Center</Link>
            <Link href="/brands" className="hover:text-primary-700">Brands</Link>
            <Link href="/gift-cards" className="hover:text-primary-700">Gift Cards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
