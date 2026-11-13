import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadSite(mode: string, indexing: string, appUrl: string) {
  vi.resetModules();
  vi.stubEnv('INSTITUTE_ONLY_MODE', mode);
  vi.stubEnv('INSTITUTE_ALLOW_INDEXING', indexing);
  vi.stubEnv('NEXT_PUBLIC_APP_URL', appUrl);
  return import('@/features/education/config/site');
}

async function loadProductionSeoModules() {
  vi.resetModules();
  vi.stubEnv('INSTITUTE_ONLY_MODE', 'true');
  vi.stubEnv('INSTITUTE_ALLOW_INDEXING', 'true');
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://techromzit.com');
  const [site, robots, sitemap, coursePage] = await Promise.all([
    import('@/features/education/config/site'),
    import('@/app/robots'),
    import('@/app/sitemap'),
    import('@/app/institute/courses/[slug]/page'),
  ]);
  return { site, robots: robots.default, sitemap: sitemap.default, generateCourseMetadata: coursePage.generateMetadata };
}

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('Institute SEO safeguards', () => {
  it('keeps staging noindex with the canonical production URL', async () => {
    const site = await loadSite('true', 'false', 'https://staging.example.com');
    const metadata = site.instituteMetadata('/institute/courses', 'Courses', 'Description');
    expect(site.instituteIndexingEnabled).toBe(false);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toEqual({ canonical: 'https://techromzit.com/institute/courses' });
  });

  it('requires all three production conditions before publishing canonicals', async () => {
    let site = await loadSite('false', 'true', 'https://techromzit.com');
    expect(site.instituteIndexingEnabled).toBe(false);
    site = await loadSite('true', 'true', 'http://localhost:3000');
    expect(site.instituteIndexingEnabled).toBe(false);
    site = await loadSite('true', 'true', 'https://learn.example.com');
    expect(site.instituteIndexingEnabled).toBe(false);
    site = await loadSite('true', 'true', 'https://techromzit.com');
    expect(site.instituteIndexingEnabled).toBe(true);
    const metadata = site.instituteMetadata('/institute', 'TIT', 'Description');
    expect(site.instituteProductionOrigin?.toString()).toBe('https://techromzit.com/');
    expect(metadata.metadataBase?.toString()).toBe('https://techromzit.com/');
    expect(metadata.alternates).toEqual({ canonical: 'https://techromzit.com/institute' });
    expect(metadata.openGraph?.url).toBe('https://techromzit.com/institute');
  });

  it('allows both exact Institute homepage forms in production robots rules', async () => {
    const { robots } = await loadProductionSeoModules();
    const result = robots();
    expect(result.rules).toEqual([
      { userAgent: '*', allow: ['/institute', '/images/institute/', '/_next/'], disallow: ['/', '/api/', '/institute/admin', '/institute/register', '/institute/payment', '/institute/verify'] },
      { userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended'], disallow: '/' },
    ]);
    expect(result.sitemap).toBe('https://techromzit.com/sitemap.xml');
  });

  it('preserves restrictive robots rules outside dedicated production indexing', async () => {
    vi.resetModules();
    vi.stubEnv('INSTITUTE_ONLY_MODE', 'true');
    vi.stubEnv('INSTITUTE_ALLOW_INDEXING', 'false');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://staging.example.com');
    let robots = (await import('@/app/robots')).default;
    expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' });

    vi.resetModules();
    vi.stubEnv('INSTITUTE_ONLY_MODE', 'false');
    vi.stubEnv('INSTITUTE_ALLOW_INDEXING', 'true');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://techromzit.com');
    robots = (await import('@/app/robots')).default;
    expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' });
  });

  it('keeps demonstration courses noindex and excludes them from the production sitemap', async () => {
    const { generateCourseMetadata, sitemap } = await loadProductionSeoModules();
    const metadata = await generateCourseMetadata({ params: Promise.resolve({ slug: 'arduino-for-beginners-bundle' }) });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph?.url).toBeUndefined();

    const entries = await sitemap();
    expect(entries).toContainEqual(expect.objectContaining({ url: 'https://techromzit.com/institute' }));
    expect(entries.some((entry) => entry.url.includes('/institute/courses/arduino-for-beginners-bundle'))).toBe(false);
    expect(entries.some((entry) => /\/institute\/courses\/[^/]+$/.test(entry.url))).toBe(false);
  });

  it('keeps the unapproved planned AI course noindex and out of the production sitemap', async () => {
    const { generateCourseMetadata, sitemap } = await loadProductionSeoModules();
    const slug = 'build-your-first-ai-assistant';
    const metadata = await generateCourseMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toMatch(/^https:\/\/techromzit\.com\/institute\/courses\//);
    expect(metadata.openGraph?.url).toMatch(/^https:\/\/techromzit\.com\/institute\/courses\//);
    expect((await sitemap()).some((entry) => entry.url.endsWith(`/institute/courses/${slug}`))).toBe(false);
  });

  it('keeps the intermediate knowledge-assistant course noindex and out of the production sitemap', async () => {
    const { generateCourseMetadata, sitemap } = await loadProductionSeoModules();
    const slug = 'build-an-ai-knowledge-assistant';
    const metadata = await generateCourseMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toMatch(/^https:\/\/techromzit\.com\/institute\/courses\//);
    expect(metadata.openGraph?.url).toMatch(/^https:\/\/techromzit\.com\/institute\/courses\//);
    expect((await sitemap()).some((entry) => entry.url.endsWith(`/institute/courses/${slug}`))).toBe(false);
  });

  it('returns an empty sitemap when production indexing is not explicitly enabled', async () => {
    vi.resetModules();
    vi.stubEnv('INSTITUTE_ONLY_MODE', 'true');
    vi.stubEnv('INSTITUTE_ALLOW_INDEXING', 'false');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://staging.example.com');
    const sitemap = (await import('@/app/sitemap')).default;
    expect(await sitemap()).toEqual([]);
  });
});
