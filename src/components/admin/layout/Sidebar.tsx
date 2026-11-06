'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Settings, X, ChevronsUpDown, ChevronDown, UserRound, LogOut, ExternalLink
} from 'lucide-react';
import { useClickOutside } from '@/lib/useClickOutside';
import { ADMIN_NAVIGATION } from '@/constants/adminNavigation';
import { AdminBrandLogo } from './AdminBrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { initials } from '@/lib/utils';
import { useAdminContext } from '@/contexts/AdminContext';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { hasPermission } = useAdminContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCustomerSupportRoute = pathname.startsWith('/admin/customer-support');
  const [customerSupportExpanded, setCustomerSupportExpanded] = useState(isCustomerSupportRoute);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  useEffect(() => {
    if (isCustomerSupportRoute) {
      setCustomerSupportExpanded(true);
    }
  }, [isCustomerSupportRoute, pathname]);

  const visibleNavigation = ADMIN_NAVIGATION.flatMap((item) => {
  if (item.disabled || !item.href) {
    return [item];
  }

  const visibleChildren =
    item.children?.filter(
      (child) =>
        !child.permission || hasPermission(child.permission),
    ) ?? [];

  const canAccessParent =
    !item.permission ||
    hasPermission(item.permission);

  if (!canAccessParent && visibleChildren.length === 0) {
    return [];
  }

  return [
    {
      ...item,
      href: canAccessParent
        ? item.href
        : visibleChildren[0]?.href,
      children: visibleChildren,
    },
  ];
});

  const activeParentId =
    visibleNavigation.find((item) => {
      if (!item.href || item.disabled) return false;

      if (item.exact) {
        return pathname === item.href;
      }

      if (
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
      ) {
        return true;
      }

      return item.children?.some(
        (child) =>
          child.href !== undefined &&
          (pathname === child.href || (!child.exact && pathname.startsWith(`${child.href}/`))),
      );
    })?.id ?? null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-rich ${open ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand-row">
          <AdminBrandLogo onNavigate={onClose} />
          <button onClick={onClose} className="sidebar-close-btn" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Admin navigation">
            {visibleNavigation.map((item) =>{
            const Icon = item.icon;
            const isActive = activeParentId === item.id;
            const isCustomerSupport = item.id === 'customer-support';
            const isExpanded = isCustomerSupport ? customerSupportExpanded : isActive;

            if (item.disabled || !item.href) {
              return (
                <div className="sidebar-nav-group" key={item.id}>
                  <span
                    className="nav-link-rich disabled"
                    aria-disabled="true"
                    title={`${item.label} — ${item.badge ?? 'Not Available'}`}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="nav-coming-soon">{item.badge}</span>
                    )}
                  </span>
                </div>
              );
            }

            return (
              <div className="sidebar-nav-group" key={item.id}>
                {isCustomerSupport ? (
                  <div className={`nav-link-rich sidebar-nav-parent ${isActive ? 'active' : ''}`}>
                    <Link
                      href={item.href}
                      className="sidebar-nav-parent-link"
                      aria-current={pathname === item.href ? 'page' : undefined}
                      onClick={onClose}
                    >
                      <Icon size={18} className="nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                    <button
                      type="button"
                      className="sidebar-nav-toggle"
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} Customer Support submenu`}
                      aria-expanded={isExpanded}
                      aria-controls="customer-support-submenu"
                      onClick={() => setCustomerSupportExpanded((expanded) => !expanded)}
                    >
                      <ChevronDown
                        size={15}
                        className={`sidebar-nav-toggle-icon ${isExpanded ? 'expanded' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`nav-link-rich ${isActive ? 'active' : ''}`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    onClick={onClose}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span>{item.label}</span>
                  </Link>
                )}
                {item.children && isExpanded && (
                  <div
                    className="sidebar-subnav"
                    id={isCustomerSupport ? 'customer-support-submenu' : undefined}
                  >
                    {item.children.map((child) => {
                      const childActive =
                        child.href !== undefined &&
                        (pathname === child.href ||
                        (!child.exact && pathname.startsWith(`${child.href}/`)));

                      if (child.disabled || !child.href) {
                        return (
                          <span
                            key={child.id}
                            className="sidebar-subnav-link disabled"
                            aria-disabled="true"
                            title="Screen not implemented"
                          >
                            {child.label}
                          </span>
                        );
                      }

                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`sidebar-subnav-link ${
                            childActive ? 'active' : ''
                          }`}
                          aria-current={childActive ? 'page' : undefined}
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="sidebar-user-footer" ref={menuRef}>
          {menuOpen && (
            <div className="sidebar-user-menu">
              <Link href="/" className="sidebar-user-menu-item">
                <ExternalLink size={15} /> View Storefront
              </Link>
              <Link href="/profile" className="sidebar-user-menu-item" onClick={onClose}>
                <UserRound size={15} /> My Profile
              </Link>
              <Link href="/settings" className="sidebar-user-menu-item" onClick={onClose}>
                <Settings size={15} /> Account Settings
              </Link>
              <div className="sidebar-user-menu-divider" />
              <button onClick={handleLogout} className="sidebar-user-menu-item danger">
                <LogOut size={15} /> Sign Out
              </button>
              <p className="sidebar-user-menu-version">SL Beauty Admin v4.2.0-stable</p>
            </div>
          )}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="sidebar-user-trigger"
          >
            <div className="sidebar-avatar flex items-center justify-center bg-black text-white text-xs font-bold">
              {initials(user?.name || user?.email || 'Admin')}
            </div>
            <span className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'Administrator'}</span>
              <span className="sidebar-user-role">{user?.role || 'System Admin'}</span>
            </span>
            <ChevronsUpDown size={15} className="sidebar-chevron" />
          </button>
        </div>
      </aside>
    </>
  );
}
