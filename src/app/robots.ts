import type { MetadataRoute } from 'next';
import { instituteIndexingEnabled, instituteProductionOrigin } from '@/features/education/config/site';

export default function robots(): MetadataRoute.Robots {
  if (instituteIndexingEnabled && instituteProductionOrigin) {
    return {
      rules: [{ userAgent: '*', allow: ['/institute', '/images/institute/', '/_next/'], disallow: ['/', '/api/', '/institute/admin', '/institute/register', '/institute/payment', '/institute/verify'] }, { userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended'], disallow: '/' }],
      sitemap: new URL('/sitemap.xml', instituteProductionOrigin).toString(),
    };
  }

  return { rules: { userAgent: '*', disallow: '/' } };
}
