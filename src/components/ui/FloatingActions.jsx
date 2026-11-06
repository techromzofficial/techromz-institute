'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, HelpCircle, Smartphone, ChevronUp } from 'lucide-react';

/**
 * FloatingActions — sticky right-side panel with B2B quick actions.
 * Shows after scrolling 200px down. Matches the Made-in-China style.
 */
export default function FloatingActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <div className="fixed right-3 bottom-24 z-40 flex flex-col gap-1.5 hidden lg:flex">
      {/* RFQ */}
      <Link
        href="/rfq"
        className="group flex flex-col items-center justify-center w-12 h-12 bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-lg transition-all hover:scale-105"
        title="Post My RFQ"
      >
        <FileText size={18} />
        <span className="text-[9px] font-semibold leading-none mt-0.5">RFQ</span>
      </Link>

      {/* Help */}
      <Link
        href="/faq"
        className="flex flex-col items-center justify-center w-12 h-12 bg-white hover:bg-gray-50 text-gray-600 rounded-xl shadow-lg border border-gray-200 transition-all hover:scale-105"
        title="Help Center"
      >
        <HelpCircle size={18} />
        <span className="text-[9px] leading-none mt-0.5 text-gray-500">Help</span>
      </Link>

      {/* App */}
      <Link
        href="/apps"
        className="flex flex-col items-center justify-center w-12 h-12 bg-white hover:bg-gray-50 text-gray-600 rounded-xl shadow-lg border border-gray-200 transition-all hover:scale-105"
        title="Download App"
      >
        <Smartphone size={18} />
        <span className="text-[9px] leading-none mt-0.5 text-gray-500">App</span>
      </Link>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollTop}
        className="flex flex-col items-center justify-center w-12 h-12 bg-primary-800 hover:bg-primary-700 text-white rounded-xl shadow-lg transition-all hover:scale-105"
        title="Back to top"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  );
}
