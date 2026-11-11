import { afterEach, describe, expect, it, vi } from 'vitest';

function requestFor(path: string, host = 'techromzit.com') {
  const url = new URL(path, `https://${host}`);
  return {
    url: url.toString(),
    nextUrl: Object.assign(url, { clone: () => new URL(url) }),
    cookies: { get: () => undefined },
    headers: new Headers({ host, 'x-forwarded-host': 'untrusted.example' }),
  };
}

async function loadMiddleware(instituteOnly: boolean, indexing = false, appUrl = 'https://techromzit.com') {
  vi.resetModules();
  vi.stubEnv('INSTITUTE_ONLY_MODE', instituteOnly ? 'true' : 'false');
  vi.stubEnv('INSTITUTE_ALLOW_INDEXING', indexing ? 'true' : 'false');
  vi.stubEnv('NEXT_PUBLIC_APP_URL', appUrl);
  return import('@/middleware');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Institute-only deployment routing', () => {
  it('redirects the root and allows only implemented Institute pages and resources', async () => {
    const { middleware } = await loadMiddleware(true);
    const root = middleware(requestFor('/') as never);
    expect(root.status).toBe(307);
    expect(root.headers.get('location')).toBe('https://techromzit.com/institute');

    for (const path of ['/robots.txt', '/sitemap.xml', '/institute', '/institute/about', '/institute/contact', '/institute/courses', '/institute/courses/arduino-for-beginners-bundle', '/institute/departments', '/institute/departments/electronics', '/institute/departments/information-technology', '/institute/departments/business-management', '/institute/departments/trade-logistics', '/institute/departments/law-corporate-governance', '/institute/departments/arts-languages', '/institute/departments/ayurveda-wellness', '/institute/learning-tracks', '/institute/for-organisations', '/institute/admin', '/institute/register', '/api/institute/admin/dashboard', '/api/institute/intakes', '/api/institute/registrations', '/api/institute/course-enquiries', '/api/institute/contact-verification/challenge', '/api/institute/contact-verification/verify', '/_next/static/chunks/app.js', '/images/institute/arduino/01-arduino-orientation.svg']) {
      const response = middleware(requestFor(path) as never);
      expect(response.headers.get('x-middleware-next'), path).toBe('1');
    }
    expect(middleware(requestFor('/institute/community-impact') as never).headers.get('x-middleware-next')).toBe('1');
  });

  it('serves the Institute site by default when the mode variable is unset or empty', async () => {
    vi.resetModules();
    vi.stubEnv('INSTITUTE_ONLY_MODE', '');
    const { middleware } = await import('@/middleware');

    const root = middleware(requestFor('/') as never);
    expect(root.status).toBe(307);
    expect(root.headers.get('location')).toBe('https://techromzit.com/institute');
    expect(middleware(requestFor('/institute') as never).headers.get('x-middleware-next')).toBe('1');
  });

  it('allows only exact public enquiry and contact-verification API routes', async () => {
    const { middleware } = await loadMiddleware(true);
    for (const path of ['/api/institute/course-enquiries', '/api/institute/course-enquiries/delivery', '/api/institute/contact-verification/challenge', '/api/institute/contact-verification/verify']) {
      expect(middleware(requestFor(path) as never).headers.get('x-middleware-next'), path).toBe('1');
    }
    for (const path of ['/api/institute/course-enquiries/export', '/api/institute/course-enquiries/delivery/extra', '/api/institute/contact-verification', '/api/institute/contact-verification/challenge/admin', '/api/institute/contact-verification/verify/history']) {
      expect(middleware(requestFor(path) as never).status, path).toBe(404);
    }
  });

  it('rejects unknown department slugs in Institute-only mode', async () => {
    const { middleware } = await loadMiddleware(true);
    const response = middleware(requestFor('/institute/departments/not-a-department') as never);
    expect(response.status).toBe(404);
  });

  it('allows every published department destination in Institute-only mode', async () => {
    const { middleware } = await loadMiddleware(true);
    for (const slug of ['electronics', 'information-technology', 'business-management', 'trade-logistics', 'law-corporate-governance', 'arts-languages', 'ayurveda-wellness']) {
      const departmentPath = `/institute/departments/${slug}`;
      expect(middleware(requestFor(departmentPath) as never).headers.get('x-middleware-next'), departmentPath).toBe('1');
    }
  });

  it('uses a permanent root redirect only for an explicitly indexable Institute deployment', async () => {
    const { middleware } = await loadMiddleware(true, true, 'https://techromzit.com');
    const root = middleware(requestFor('/') as never);
    expect(root.status).toBe(308);
    expect(root.headers.get('location')).toBe('https://techromzit.com/institute');
  });

  it('returns 404 for APIs, Beauty, admin, account, supplier and checkout routes', async () => {
    const { middleware } = await loadMiddleware(true);
    for (const path of ['/api/catalogue', '/products', '/admin', '/login', '/dashboard', '/supplier-dashboard', '/checkout', '/images/beauty/hero-beauty-01.webp']) {
      const response = middleware(requestFor(path, 'beauty.example') as never);
      expect(response.status, path).toBe(404);
    }
  });

  it('preserves Retail routing when explicitly configured, regardless of host headers', async () => {
    const { middleware } = await loadMiddleware(false);
    const response = middleware(requestFor('/products', 'techromzit.com') as never);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('preserves protected-route redirects in default Retail mode', async () => {
    const { middleware } = await loadMiddleware(false);
    const response = middleware(requestFor('/admin') as never);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });
});
