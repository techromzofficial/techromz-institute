'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { INSTITUTE_DEPARTMENT_NAVIGATION } from '../config/navigation';

const links = [
  { href: '/institute/courses', label: 'Explore Courses' },
  { href: '/institute/departments', label: 'Departments' },
  { href: '/institute/learning-tracks', label: 'Learning Tracks' },
  { href: '/institute/community-impact', label: 'Community Impact' },
  { href: '/institute/for-organisations', label: 'For Organisations' },
  { href: '/institute/about', label: 'About' },
  { href: '/institute/contact', label: 'Contact' },
];

const departmentLinks = INSTITUTE_DEPARTMENT_NAVIGATION;

export default function EducationHeader() {
  const pathname = usePathname() ?? '';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);
  const active = (href: string) => href === '/institute' ? pathname === href : pathname.startsWith(href);

  // Close department dropdown on route change
  useEffect(() => {
    setDeptOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close department dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    }
    if (deptOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [deptOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:h-28 sm:px-6 lg:px-8">
        <Link
          href="/institute"
          className="flex shrink-0 items-center"
          onClick={() => {
            setMobileOpen(false);
            setDeptOpen(false);
          }}
          aria-label="Techromz Institute of Technology home"
        >
          <Image
            src="/images/institute/techromz-institute-logo-840.webp"
            alt="Techromz Institute of Technology logo"
            width={840}
            height={480}
            priority
            draggable={false}
            className="h-auto w-[170px] sm:w-[210px]"
          />
        </Link>

        <nav className="hidden items-center gap-4 lg:flex" aria-label="Institute navigation">
          {links.map((link) =>
            link.href === '/institute/departments' ? (
              <div
                key={link.href}
                className="relative py-4"
                ref={deptRef}
                onMouseEnter={() => setDeptOpen(true)}
                onMouseLeave={() => setDeptOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Link
                    href={link.href}
                    onClick={() => setDeptOpen(false)}
                    className={`text-xs font-semibold xl:text-sm ${
                      active(link.href) ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeptOpen((prev) => !prev);
                    }}
                    aria-expanded={deptOpen}
                    aria-label="Toggle departments menu"
                    className="p-0.5 text-slate-500 hover:text-blue-700 focus:outline-none"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${deptOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {deptOpen && (
                  <div
                    className="absolute left-1/2 top-full w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    {departmentLinks.map((department) => (
                      <Link
                        key={department.href}
                        href={department.href}
                        onClick={() => {
                          setDeptOpen(false);
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        {department.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold xl:text-sm ${
                  active(link.href) ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-slate-700 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="institute-mobile-navigation"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="institute-mobile-navigation"
          className="border-t border-slate-200 bg-white px-4 py-3"
          aria-label="Mobile institute navigation"
        >
          {links.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  active(link.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                }`}
              >
                {link.label}
              </Link>
              {link.href === '/institute/departments' && (
                <div className="ml-4 border-l border-slate-200 pl-2">
                  {departmentLinks.map((department) => (
                    <Link
                      key={department.href}
                      href={department.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600"
                    >
                      {department.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
