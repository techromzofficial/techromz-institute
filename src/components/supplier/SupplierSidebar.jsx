'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  MessageSquare, BarChart2, Settings, BadgeCheck,
  ChevronRight, Store, TrendingUp,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard',   href: '/supplier-dashboard',            icon: LayoutDashboard },
      { label: 'Analytics',   href: '/supplier-dashboard/analytics',  icon: BarChart2 },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { label: 'Products',    href: '/supplier-dashboard/products',   icon: Package },
      { label: 'Orders',      href: '/supplier-dashboard/orders',     icon: ShoppingCart },
      { label: 'RFQs',        href: '/supplier-dashboard/rfqs',       icon: FileText },
    ],
  },
  {
    group: 'Communication',
    items: [
      { label: 'Messages',    href: '/supplier-dashboard/messages',   icon: MessageSquare },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'My Storefront', href: '/suppliers/me',               icon: Store },
      { label: 'Verification',  href: '/company-verification',       icon: BadgeCheck },
      { label: 'Settings',      href: '/supplier-dashboard/settings', icon: Settings },
    ],
  },
];

export default function SupplierSidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/supplier-dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      <nav className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sticky top-4">
        {/* Brand badge */}
        <div className="flex items-center gap-2 px-2 py-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Supplier Hub</span>
        </div>

        <div className="space-y-4">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group ${
                        active
                          ? 'bg-primary-50 text-primary-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={15} className={active ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight size={13} className="text-primary-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade banner */}
        <div className="mt-4 p-3 bg-gradient-to-br from-primary-800 to-primary-600 rounded-xl text-white">
          <p className="text-[11px] font-semibold">Go Premium</p>
          <p className="text-[10px] text-primary-100 mt-0.5">Reach 10× more buyers with a verified badge.</p>
          <Link
            href="/pricing"
            className="mt-2 block text-center text-[11px] bg-white/20 hover:bg-white/30 text-white rounded-lg py-1 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      </nav>
    </aside>
  );
}
