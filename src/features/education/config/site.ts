import type { Metadata } from 'next';
import type { EducationCourse } from '../contracts/course';

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
export const instituteOnlyMode = process.env.INSTITUTE_ONLY_MODE !== 'false';
const indexingRequested = process.env.INSTITUTE_ALLOW_INDEXING === 'true';

function validProductionOrigin(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'techromzit.com' || url.port || url.username || url.password) return null;
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
  const canonicalUrl = new URL(canonicalPath, 'https://techromzit.com').toString();
  return {
    metadataBase: new URL('https://techromzit.com'),
    title: typeof title === 'string' && title.includes('Techromz Institute') ? { absolute: title } : title,
    description,
    robots: { index: pageIndexingEnabled, follow: pageIndexingEnabled },
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    twitter: { card: 'summary', images: ['/images/institute/techromz-institute-logo.png'], title: typeof title === 'string' ? title : 'Techromz Institute of Technology', description },
    openGraph: {
      title: typeof title === 'string' ? title : 'Techromz Institute of Technology',
      description,
      siteName: 'Techromz Institute of Technology',
      type: 'website',
      url: canonicalUrl,
      locale: 'en_LK',
      images: [{ url: '/images/institute/techromz-institute-logo.png', alt: 'Techromz Institute of Technology' }],
    },
  };
}

export function isApprovedCourseForIndexing(course: Pick<EducationCourse, 'demo' | 'seoIndexable' | 'publicationStatus'>) {
  return course.publicationStatus !== 'unpublished' && course.demo === false && course.seoIndexable === true;
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
