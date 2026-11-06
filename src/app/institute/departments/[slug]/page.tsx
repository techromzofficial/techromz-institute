import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DepartmentExperience from '@/features/education/components/DepartmentExperience';
import ArtsLanguagesDepartmentExperience from '@/features/education/components/ArtsLanguagesDepartmentExperience';
import { DEPARTMENT_SLUGS } from '@/features/education/contracts/content';
import { instituteMetadata } from '@/features/education/config/site';
import { educationContentService } from '@/features/education/services/contentService';
import { educationCourseService } from '@/features/education/services/courseService';

export function generateStaticParams() { return DEPARTMENT_SLUGS.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const department = await educationContentService.getDepartment(slug);
  return department
    ? instituteMetadata(`/institute/departments/${slug}`, `${department.name} Department`, department.introduction)
    : { title: { absolute: 'Department not found | Techromz Institute' }, robots: { index: false, follow: false } };
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const department = await educationContentService.getDepartment((await params).slug);
  if (!department) notFound();
  const [courses, tracks] = await Promise.all([
    Promise.all(department.courseSlugs.map((slug) => educationCourseService.getCourse(slug))),
    educationContentService.listLearningTracks(),
  ]);
  const availableCourses = courses.filter((course) => course !== null);
  if (department.slug === 'arts-languages') return <ArtsLanguagesDepartmentExperience department={department} courses={availableCourses} />;
  return <DepartmentExperience department={department} courses={availableCourses} track={tracks.find((item) => item.title === department.relatedTrackTitle)} />;
}
