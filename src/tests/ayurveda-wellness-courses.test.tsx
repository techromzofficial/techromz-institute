import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CourseDetailPage, { generateMetadata } from '@/app/institute/courses/[slug]/page';
import DepartmentPage from '@/app/institute/departments/[slug]/page';
import { educationContentService } from '@/features/education/services/contentService';
import { educationCourseService } from '@/features/education/services/courseService';
import { institutePublicPaths, isApprovedCourseForIndexing } from '@/features/education/config/site';
import { AYURVEDA_WELLNESS_COURSES } from '@/features/education/data/ayurvedaWellnessCourses';

const slugs = [
  'foundations-of-ayurveda-wellness',
  'ayurveda-centre-operations-patient-care',
  'ayurveda-therapy-assistance-safety',
  'medicinal-plants-herbal-materials',
  'ayurvedic-product-manufacturing-gmp',
  'ayurvedic-product-quality-regulatory-compliance',
];
const approvedImageSlugs = [
  'foundations-of-ayurveda-wellness',
  'ayurveda-centre-operations-patient-care',
  'ayurveda-therapy-assistance-safety',
];
const publishedSlugs = slugs.slice(0, 3);
const unpublishedSlugs = slugs.slice(3);

describe('Ayurveda & Wellness department integration', () => {
  it('retains all six records while exposing only three unique courses', async () => {
    const department = await educationContentService.getDepartment('ayurveda-wellness');
    const courses = (await educationCourseService.listCourses()).filter((course) => course.subject === 'Ayurveda & Wellness');
    expect(department?.courseSlugs).toEqual(slugs);
    expect(institutePublicPaths).toContain('/institute/departments/ayurveda-wellness');
    expect(courses.map((course) => course.slug)).toEqual(publishedSlugs);
    expect(new Set(courses.map((course) => course.slug)).size).toBe(3);
    expect(AYURVEDA_WELLNESS_COURSES.map((course) => course.slug)).toEqual(slugs);
  });

  it.each(publishedSlugs)('keeps %s planned, no-index and free of invented commercial details', async (slug) => {
    const course = await educationCourseService.getCourse(slug);
    expect(course).toMatchObject({ demo: false, seoIndexable: false, subject: 'Ayurveda & Wellness' });
    expect(course?.plannedDetails?.weeklyCurriculum).toHaveLength(8);
    expect(course?.plannedDetails?.fee).toBeUndefined();
    expect(course?.plannedDetails?.courseStarts).toBeUndefined();
    expect(course?.plannedDetails?.registrationOpens).toBeUndefined();
    expect(course?.plannedDetails?.registrationDeadline).toBeUndefined();
    expect(course?.plannedDetails?.interestNotice).toContain('does not reserve a seat');
    expect(isApprovedCourseForIndexing(course!)).toBe(false);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it.each(approvedImageSlugs)('maps %s to its approved Ayurveda image', async (slug) => {
    const course = await educationCourseService.getCourse(slug);
    expect(course?.image).toBe(`/images/institute/ayurveda/${slug}.webp`);
    expect(course?.plannedDetails?.imageBaseName).toBe(`ayurveda/${slug}`);
    expect(course?.plannedDetails?.imageAlt).toMatch(/^Illustrative /);
  });

  it.each(unpublishedSlugs)('retains %s and its existing image while making it non-public', async (slug) => {
    const course = AYURVEDA_WELLNESS_COURSES.find((item) => item.slug === slug);
    expect(await educationCourseService.getCourse(slug)).toBeNull();
    expect(course?.publicationStatus).toBe('unpublished');
    expect(course?.image).toBe('/images/institute/learning/generated/collaborative-learning-960.webp');
    expect(course?.plannedDetails?.imageBaseName).toBe('collaborative-learning');
  });

  it.each(unpublishedSlugs)('returns not-found for the unpublished %s detail route', async (slug) => {
    await expect(CourseDetailPage({ params: Promise.resolve({ slug }) })).rejects.toThrow();
    expect((await generateMetadata({ params: Promise.resolve({ slug }) })).robots).toMatchObject({ index: false, follow: false });
  });

  it('renders the department grouped by level with three published courses', async () => {
    render(await DepartmentPage({ params: Promise.resolve({ slug: 'ayurveda-wellness' }) }));
    expect(screen.getByRole('heading', { name: '3 planned Department of Ayurveda & Wellness courses' })).toBeInTheDocument();
    expect(document.getElementById('ayurveda-wellness-beginner-courses')?.parentElement).toHaveTextContent('2 planned courses');
    expect(document.getElementById('ayurveda-wellness-intermediate-courses')?.parentElement).toHaveTextContent('1 planned course');
    for (const slug of publishedSlugs) expect(document.querySelector(`a[href="/institute/courses/${slug}"]`)).toBeInTheDocument();
    for (const slug of unpublishedSlugs) expect(document.querySelector(`a[href="/institute/courses/${slug}"]`)).not.toBeInTheDocument();
  });

  it('renders safety boundaries and practical learning on a course page', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'ayurveda-therapy-assistance-safety' }) }));
    expect(screen.getByRole('heading', { level: 1, name: 'Ayurveda Therapy Assistance & Safety' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Practise safely through guided and simulated work.' })).toBeInTheDocument();
    expect(screen.getAllByText(/does not teach or authorise independent treatment, diagnosis, prescribing/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
  });
});
