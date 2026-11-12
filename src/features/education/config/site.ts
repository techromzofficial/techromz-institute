import type { Metadata } from 'next';
import type { EducationCourse } from '../contracts/course';

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
export const instituteOnlyMode = process.env.INSTITUTE_ONLY_MODE !== 'false';
const indexingRequested = process.env.INSTITUTE_ALLOW_INDEXING === 'true';

function validProductionOrigin(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)) return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

export const instituteProductionOrigin = validProductionOrigin(rawAppUrl);
export const instituteIndexingEnabled = Boolean(instituteOnlyMode && indexingRequested && instituteProductionOrigin);

type InstituteMetadataOptions = {
  indexable?: boolean;
};

export function instituteMetadata(path: string, title: Metadata['title'], description: string, options: InstituteMetadataOptions = {}): Metadata {
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;
  const pageIndexingEnabled = instituteIndexingEnabled && options.indexable !== false;
  const canonicalUrl = pageIndexingEnabled ? new URL(canonicalPath, instituteProductionOrigin!).toString() : undefined;
  return {
    metadataBase: instituteIndexingEnabled ? instituteProductionOrigin! : undefined,
    title,
    description,
    robots: { index: pageIndexingEnabled, follow: pageIndexingEnabled },
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: typeof title === 'string' ? title : 'Techromz Institute of Technology',
      description,
      siteName: 'Techromz Institute of Technology',
      type: 'website',
      url: canonicalUrl,
      images: pageIndexingEnabled ? [{ url: '/images/institute/learning/generated/practical-electronics-hero-1200.webp', width: 1200, height: 800, alt: 'Practical electronics learning concept' }] : undefined,
    },
  };
}

export function isApprovedCourseForIndexing(course: Pick<EducationCourse, 'demo' | 'seoIndexable'>) {
  return course.demo === false && course.seoIndexable === true;
}

export const institutePublicPaths = [
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
] as const;
