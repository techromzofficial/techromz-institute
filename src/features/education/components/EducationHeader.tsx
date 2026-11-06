'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const active = (href: string) => href === '/institute' ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:h-28 sm:px-6 lg:px-8">
        <Link
          href="/institute"
          className="flex shrink-0 items-center"
          onClick={() => setOpen(false)}
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
          {links.map((link) => link.href === '/institute/departments' ? <div key={link.href} className="group relative py-4"><Link href={link.href} className={`text-xs font-semibold xl:text-sm ${active(link.href) ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>{link.label}</Link><div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">{departmentLinks.map((department) => <Link key={department.href} href={department.href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">{department.label}</Link>)}</div></div> : <Link key={link.href} href={link.href} className={`text-xs font-semibold xl:text-sm ${active(link.href) ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>{link.label}</Link>)}
        </nav>
        <button
          type="button"
          className="rounded-md p-2 text-slate-700 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="institute-mobile-navigation"
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="institute-mobile-navigation" className="border-t border-slate-200 bg-white px-4 py-3" aria-label="Mobile institute navigation">
          {links.map((link) => (
            <div key={link.href}><Link href={link.href} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${active(link.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>{link.label}</Link>{link.href === '/institute/departments' && <div className="ml-4 border-l border-slate-200 pl-2">{departmentLinks.map((department) => <Link key={department.href} href={department.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600">{department.label}</Link>)}</div>}</div>
          ))}
        </nav>
      )}
    </header>
  );
}
