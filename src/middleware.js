import { NextResponse } from 'next/server';
import { loginUrlFor } from './lib/authRedirect';
import { instituteIndexingEnabled } from './features/education/config/site';

const COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE || '_el_tok';
const INSTITUTE_ONLY_MODE = process.env.INSTITUTE_ONLY_MODE !== 'false';

const INSTITUTE_PAGES = new Set([
  '/institute',
  '/institute/about',
  '/institute/contact',
  '/institute/community-impact',
  '/institute/courses',
  '/institute/departments',
  '/institute/departments/electronics',
  '/institute/departments/information-technology',
  '/institute/departments/business-management',
  '/institute/departments/trade-logistics',
  '/institute/departments/law-corporate-governance',
  '/institute/departments/arts-languages',
  '/institute/departments/ayurveda-wellness',
  '/institute/learning-tracks',
  '/institute/for-organisations',
  '/institute/verify',
  '/institute/admin',
  '/institute/register',
]);

// Routes that require authentication
const PROTECTED = [
  '/dashboard',
  '/orders',
  '/wishlist',
  '/profile',
  '/settings',
  '/messages',
  '/checkout',
  '/order-success',
  '/notifications',
  '/quotations',
  '/compare',
  '/supplier-dashboard',
  '/company-verification',
  '/admin',
];

// Routes that should redirect authenticated users away (login/register)
const AUTH_ONLY = [
  '/login',
  '/register',
];

function matchesRoute(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isInstitutePage(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return INSTITUTE_PAGES.has(normalized) || /^\/institute\/courses\/[^/]+$/.test(normalized);
}

function isInstituteResource(pathname) {
  return pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/institute/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';
}

function isInstitutePublicApi(pathname) {
  return pathname === '/api/institute/certificates/verify' ||
    pathname === '/api/institute/course-enquiries' ||
    pathname === '/api/institute/course-enquiries/local-outbox' ||
    pathname === '/api/institute/contact-verification/challenge' ||
    pathname === '/api/institute/contact-verification/verify' ||
    pathname === '/api/institute/registrations' ||
    pathname === '/api/institute/intakes' ||
    pathname.startsWith('/api/institute/admin/');
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (INSTITUTE_ONLY_MODE) {
    if (pathname === '/') {
      const instituteUrl = request.nextUrl.clone();
      instituteUrl.pathname = '/institute';
      return NextResponse.redirect(instituteUrl, instituteIndexingEnabled ? 308 : 307);
    }

    if (isInstitutePage(pathname) || isInstituteResource(pathname) || isInstitutePublicApi(pathname)) {
      return NextResponse.next();
    }

    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // ── Protect dashboard/cart/etc ──────────────────────────
  const isProtected = PROTECTED.some((route) => matchesRoute(pathname, route));
  if (isProtected && !token) {
    const returnUrl = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL(loginUrlFor(returnUrl), request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect logged-in users away from login/register ──
  const isAuthRoute = AUTH_ONLY.some((route) => matchesRoute(pathname, route));
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
