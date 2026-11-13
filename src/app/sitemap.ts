import type { MetadataRoute } from 'next';
import { instituteIndexingEnabled, instituteProductionOrigin, institutePublicPaths, isApprovedCourseForIndexing } from '@/features/education/config/site';
import { educationCourseService } from '@/features/education/services/courseService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!instituteIndexingEnabled || !instituteProductionOrigin) return [];
  const origin = instituteProductionOrigin;
  const courses = await educationCourseService.listCourses();
  const paths = [
    ...institutePublicPaths,
    ...courses.filter(isApprovedCourseForIndexing).map((course) => `/institute/courses/${course.slug}`),
  ];
  return [...new Set(paths)].map((path) => ({
    url: new URL(path, origin).toString(),
    changeFrequency: path.includes('/courses/') ? 'monthly' : 'weekly',
    priority: path === '/institute' ? 1 : path === '/institute/courses' ? 0.9 : 0.7,
  }));
}
