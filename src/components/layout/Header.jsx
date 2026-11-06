'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Camera,
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  ShoppingBasket,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { notificationsApi } from '@/lib/api';
import { initials } from '@/lib/utils';
import { homepageConfig } from '@/data/homepageConfig';

import { NAV_DROPDOWNS } from '@/lib/constants';

const BEAUTY_NAV = [
  { label: 'New', href: '/categories/new-arrivals' },
  { label: 'Summer Sets Under $35', href: '/products?collection=summer-sets' },
  { label: 'Makeup', href: '/categories/makeup' },
  { label: 'Skincare', href: '/categories/skincare' },
  { label: 'Fragrance', href: '/categories/fragrance' },
  { label: 'Hair', href: '/categories/hair' },
  { label: 'Bath & Body', href: '/categories/bath-and-body' },
  { label: 'Mini Size', href: '/categories/mini-size' },
  { label: 'Gifts & Value Sets', href: '/categories/gift-sets' },
  { label: 'Gift Cards', href: '/gift-cards' },
  { label: 'Sale & Offers', href: '/categories/sale' },
];

const PRIMARY_NAV = [
  { label: 'Brands', href: '/brands' },
  { label: 'Offers', href: '/categories/sale' },
  { label: 'For You', href: '/products?sort=popular' },
];



export default function Header() {
  const headerRef = useRef(null);
  const closeMenuTimerRef = useRef(null);
  const router = useRouter();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { count: cartCount, total: cartTotal } = useCart();
  const formattedTotal = `Rs ${Number(cartTotal || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [activeMobileCategories, setActiveMobileCategories] = useState({});

  const openMegaMenu = (label) => {
    if (closeMenuTimerRef.current) window.clearTimeout(closeMenuTimerRef.current);
    setHoveredCategory(label);
  };

  const scheduleMegaMenuClose = () => {
    if (closeMenuTimerRef.current) window.clearTimeout(closeMenuTimerRef.current);
    closeMenuTimerRef.current = window.setTimeout(() => setHoveredCategory(null), 150);
  };

  const closeHeaderMenus = () => {
    setHoveredCategory(null);
    setAccountOpen(false);
    setNotificationsOpen(false);
    setMobileOpen(false);
  };

  const toggleMobileCategory = (label) => {
    setActiveMobileCategories((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setUnreadNotifications(0);
      return undefined;
    }

    const loadUnread = async () => {
      try {
        const response = await notificationsApi.list({ per_page: 1 });
        if (!cancelled) {
          setUnreadNotifications(Number(response?.unread_count || 0));
        }
      } catch {
        if (!cancelled) setUnreadNotifications(0);
      }
    };

    loadUnread();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const syncUnread = (event) => {
      setUnreadNotifications(Number(event.detail?.count || 0));
    };

    window.addEventListener('notifications:unread', syncUnread);
    return () => window.removeEventListener('notifications:unread', syncUnread);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setHoveredCategory(null);
        setAccountOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      if (closeMenuTimerRef.current) window.clearTimeout(closeMenuTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setHoveredCategory(null);
        setAccountOpen(false);
        setNotificationsOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) return;

    router.push(`/products?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    await logout();
    router.replace('/');
    router.refresh();
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-[100] overflow-visible border-b border-[#e6e3e3] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="hidden border-b border-[#eeeaea] lg:block">
        <div className="mx-auto flex h-8 max-w-screen-xl items-center justify-end gap-3 px-4 text-[12px] font-medium text-[#36302f]">
          <Link href="/orders" className="transition-colors hover:text-primary-700">Track Order</Link>
          <span aria-hidden="true" className="h-3 border-l border-[#d9d3d2]" />
          <Link href="/help-center" className="transition-colors hover:text-primary-700">Help Centre</Link>
          <span aria-hidden="true" className="h-3 border-l border-[#d9d3d2]" />
          <Link href={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-1.5 transition-colors hover:text-primary-700">
            <User size={13} className="text-[#36302f]" />
            <span>{isAuthenticated ? `Welcome, ${user?.name?.split(' ')[0] || 'User'}` : 'Login'}</span>
          </Link>
        </div>
      </div>
      {homepageConfig.announcement && (
        <Link href={homepageConfig.announcement.href} className="flex min-h-8 items-center justify-center bg-[#f1f1f1] px-4 text-center text-xs font-semibold text-primary-800 transition-colors hover:bg-[#e4e4e4]">
          {homepageConfig.announcement.label}
        </Link>
      )}

      <div className="mx-auto flex h-[72px] max-w-screen-xl items-center gap-3 px-4 sm:px-5">
        <Link href="/" className="flex min-w-fit items-center gap-2" aria-label="SL Beauty Platform home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
            SL
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-bold tracking-normal text-black">SL Beauty</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-gray-400">Platform</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 xl:flex">
          {PRIMARY_NAV.map((item) => <Link key={item.href} href={item.href} className="text-[15px] font-medium text-[#302b2a] transition-colors hover:text-primary-700">{item.label}</Link>)}
        </nav>

        <form onSubmit={handleSearch} className="relative hidden min-w-0 flex-1 md:block xl:ml-auto xl:max-w-[490px]">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search makeup, skincare, fragrance and brands"
            className="h-12 w-full rounded-xl border border-transparent bg-[#f6f4f4] pl-11 pr-14 text-sm text-gray-900 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-primary-700"
            aria-label="Visual search"
          >
            <Camera size={16} />
          </button>
        </form>

        <div className="ml-auto hidden items-center gap-4 md:flex">
          <Link
            href="/messages"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#514a49] transition hover:bg-[#f1f1f1] hover:text-primary-700"
            aria-label="Messages"
          >
            <MessageSquare size={19} />
          </Link>
          <Link
            href="/wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#514a49] transition hover:bg-[#f1f1f1] hover:text-primary-700"
            aria-label="Wishlist"
          >
            <Heart size={19} />
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#514a49] transition hover:bg-[#f1f1f1] hover:text-primary-700"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadNotifications > 0 && (
                <span className="absolute right-1.5 top-1.5 min-w-[16px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-[250] w-[360px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <NotificationCenter compact pageSize={5} />
              </div>
            )}
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-primary-700 transition-colors"
            aria-label="Cart"
          >
            <div className="relative p-1">
              <ShoppingCart size={22} className="text-gray-900 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black text-[9px] font-bold text-white px-1 leading-none">
                {cartCount || 0}
              </span>
            </div>
            <span className="text-[15px] font-medium text-gray-900">Cart ({formattedTotal})</span>
          </Link>

          {isAuthenticated && (
            <div className={`relative ${accountOpen ? 'z-[250]' : ''}`}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-primary-700 transition-colors"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-controls="profile-dropdown"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-950 bg-black text-[11px] font-bold text-white transition hover:bg-gray-800">
                  {initials(user?.name || user?.email || 'User')}
                </div>
                <span className="text-[15px] font-medium text-gray-900 max-w-[120px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
              </button>

              {accountOpen && (
                <div
                  id="profile-dropdown"
                  role="menu"
                  className="absolute right-0 top-full z-[250] mt-2 w-56 overflow-hidden rounded-xl border border-gray-250 bg-white py-2 shadow-xl"
                >
                  {isAdmin && (
                    <Link href="/admin/dashboard" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm font-semibold text-burgundy hover:bg-red-50 border-b border-gray-100">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Dashboard
                  </Link>
                  <Link href="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Orders
                  </Link>
                  <Link href="/settings" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100" aria-label={`Cart with ${cartCount || 0} items`}>
            <ShoppingCart size={21} />
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">{cartCount || 0}</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className="relative hidden border-t border-[#eee9e8] bg-white text-[#211c1b] md:block" onMouseLeave={scheduleMegaMenuClose}>
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-1 overflow-x-auto px-4 sm:px-5">
          {BEAUTY_NAV.map((item) => {
            const hasDropdown = !!NAV_DROPDOWNS[item.label];
            return (
              <div
                key={item.label}
                className="relative flex h-14 flex-shrink-0 items-center"
                onMouseEnter={() => {
                  if (hasDropdown) openMegaMenu(item.label);
                  else setHoveredCategory(null);
                }}
                onFocus={() => {
                  if (hasDropdown) openMegaMenu(item.label);
                }}
              >
                {hasDropdown ? <button
                  type="button"
                  onClick={() => hoveredCategory === item.label ? setHoveredCategory(null) : openMegaMenu(item.label)}
                  className={`relative flex h-14 items-center px-3 text-[15px] font-medium transition-colors hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-black after:transition-transform ${hoveredCategory === item.label ? 'text-black after:scale-x-100' : 'text-[#211c1b] after:scale-x-0'}`}
                  aria-haspopup="menu"
                  aria-expanded={hoveredCategory === item.label}
                  aria-controls={`mega-menu-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                >{item.label}</button> : <Link href={item.href} className="flex h-14 items-center px-3 text-[15px] font-medium text-[#211c1b] transition-colors hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset">{item.label}</Link>}
              </div>
            );
          })}
        </div>

        {/* Mega Menu Dropdown Panel */}
        {hoveredCategory && NAV_DROPDOWNS[hoveredCategory] && (
          <div
            id={`mega-menu-${hoveredCategory.toLowerCase().replaceAll(' ', '-')}`}
            role="menu"
            className="absolute left-0 right-0 top-full z-[200] max-h-[min(70vh,620px)] overflow-y-auto border-t border-[#e8e8e8] bg-white text-[#171717] shadow-[0_16px_38px_rgba(0,0,0,0.1)] animate-slide-up"
            onMouseEnter={() => openMegaMenu(hoveredCategory)}
            onMouseLeave={scheduleMegaMenuClose}
          >
            <div className="mx-auto max-w-screen-xl px-5 py-8 sm:px-8">
              <div className="grid grid-cols-5 gap-8">
                {/* 4 Columns of Categories */}
                <div className="col-span-4 grid grid-cols-4 gap-6">
                  {NAV_DROPDOWNS[hoveredCategory].columns.map((column, colIdx) => (
                    <div key={colIdx} className="space-y-6">
                      {column.sections.map((section) => (
                        <div key={section.title}>
                          <h4 className="mb-2.5 border-b border-gray-100 pb-2 text-[14px] font-bold text-black">
                            {section.title}
                          </h4>
                          <ul className="space-y-1.5">
                            {section.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  className="flex min-h-9 items-center rounded-lg px-2 text-[14px] text-[#5f5f5f] transition-colors duration-150 hover:bg-[#f5f5f5] hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* 1 Column for Featured Promo Card */}
                {NAV_DROPDOWNS[hoveredCategory].featured && (
                  <div className="col-span-1 border-l border-gray-100 pl-6">
                    <Link
                      href={NAV_DROPDOWNS[hoveredCategory].featured.href}
                      className="group relative block overflow-hidden rounded-xl bg-gray-50 flex flex-col justify-end aspect-[4/3] w-full p-4 h-full min-h-[240px] hover:shadow-md transition-all duration-300"
                    >
                      <Image
                        src={NAV_DROPDOWNS[hoveredCategory].featured.image}
                        alt={NAV_DROPDOWNS[hoveredCategory].featured.title}
                        fill
                        unoptimized
                        sizes="(max-width: 1280px) 20vw, 240px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                      <div className="relative z-10 text-white">
                        <h5 className="text-[14px] font-semibold tracking-[0.03em] leading-tight drop-shadow-sm font-sans uppercase">
                          {NAV_DROPDOWNS[hoveredCategory].featured.title}
                        </h5>
                        <p className="text-[11px] text-white/90 mt-1 drop-shadow-sm font-medium">
                          {NAV_DROPDOWNS[hoveredCategory].featured.subtitle}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {mobileOpen && (
        <div className="max-h-[calc(100dvh-104px)] overflow-y-auto border-t border-gray-100 bg-white shadow-lg md:hidden">
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search beauty products"
                className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-black focus:bg-white"
              />
            </div>
          </form>

          <div className="flex flex-col gap-1 px-4 pb-4">
            {BEAUTY_NAV.map((item) => {
              const dropdownData = NAV_DROPDOWNS[item.label];
              const hasDropdown = !!dropdownData;

              if (hasDropdown) {
                const isExpanded = !!activeMobileCategories[item.label];
                return (
                  <div key={item.label} className="border-b border-gray-50 pb-1">
                    <button
                      type="button"
                      onClick={() => toggleMobileCategory(item.label)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <span>{item.label}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    </button>
                    {isExpanded && (
                      <div className="mt-1 ml-4 pl-3 border-l border-gray-200 flex flex-col gap-4 py-2 animate-slide-up">
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-xs font-bold text-red-800 hover:text-red-900 py-1"
                        >
                          Shop All {item.label}
                        </Link>
                        {dropdownData.columns.flatMap((col) => col.sections).map((section) => (
                          <div key={section.title} className="mt-1">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-400 block mb-1.5">
                              {section.title}
                            </span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="text-xs text-gray-600 hover:text-black py-1 block"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-50/50"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-semibold text-burgundy">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gray-50 px-3 py-2 text-center text-sm font-semibold text-gray-800">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg bg-black px-3 py-2 text-center text-sm font-semibold text-white">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg border border-black px-3 py-2 text-center text-sm font-semibold text-black">
                  Register
                </Link>
              </>
            )}
            <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gray-50 px-3 py-2 text-center text-sm font-semibold text-gray-800">
              Wishlist
            </Link>
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gray-50 px-3 py-2 text-center text-sm font-semibold text-gray-800">
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
