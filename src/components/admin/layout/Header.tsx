'use client';

import { useRef, useState } from 'react';
import { Search, Bell, HelpCircle, Menu, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClickOutside } from '@/lib/useClickOutside';

const ctaIconMap: Record<string, React.ElementType> = { Zap };

export function Header({
  onMenuClick,
  searchPlaceholder = 'Global search...',
  ctaLabel = 'Quick Action',
  ctaIcon = null,
}: {
  onMenuClick: () => void;
  searchPlaceholder?: string;
  ctaLabel?: string;
  ctaIcon?: string | null;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef, () => setNotifOpen(false));

  const CtaIcon = ctaIcon ? ctaIconMap[ctaIcon] : null;

  return (
    <header className="header-rich">
      <button
        onClick={onMenuClick}
        className="header-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="header-search-wrap">
        <div className="header-search">
          <Search size={17} className="header-search-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="header-search-input"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="header-actions-right">
        {/* Notification bell */}
        <div className="header-notif-wrap" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="header-icon-btn"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="notif-dot" />
          </button>
          {notifOpen && (
            <div className="header-dropdown notif-dropdown">
              <p className="dropdown-eyebrow">Notifications</p>
              <button className="notif-item">
                <span className="notif-title">Aura Beauty — document expiring</span>
                <span className="notif-sub">3 days remaining · Verification</span>
              </button>
              <button className="notif-item">
                <span className="notif-title">Counterfeit report filed</span>
                <span className="notif-sub">Product #4211 · High risk</span>
              </button>
              <button className="notif-item">
                <span className="notif-title">Order #ORD-9901 processing</span>
                <span className="notif-sub">Spa Ceylon · 2 hours ago</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => toast('Help Center arrives in a later screen.')}
          className="header-icon-btn"
          aria-label="Help"
        >
          <HelpCircle size={19} />
        </button>

        <span className="header-divider" />

        <button
          onClick={() => toast.success(`${ctaLabel} would open here.`)}
          className="button primary header-cta"
        >
          {CtaIcon && <CtaIcon size={16} />}
          {ctaLabel}
        </button>
      </div>
    </header>
  );
}
