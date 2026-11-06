import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CourseDetailPage from '@/app/institute/courses/[slug]/page';
import DepartmentPage from '@/app/institute/departments/[slug]/page';
import { educationContentService } from '@/features/education/services/contentService';
import { educationCourseService } from '@/features/education/services/courseService';

const slugs = ['electronics-fundamentals-circuit-building', 'electronics-repair-troubleshooting'];

describe('Electronics & Engineering January 2027 launch', () => {
  it('exposes exactly two published coming-soon courses in the department', async () => {
    const department = await educationContentService.getDepartment('electronics');
    const courses = (await educationCourseService.listCourses()).filter((course) => course.subject === 'Electronics & Engineering');
    expect(department).toMatchObject({ name: 'Electronics & Engineering', courseSlugs: slugs });
    expect(courses.map((course) => course.slug)).toEqual(slugs);
    expect(courses.every((course) => course.publicationStatus === 'published' && course.availabilityStatus === 'coming-soon')).toBe(true);
  });

  it.each(slugs)('renders %s as January 2027 with registration and payment unavailable', async (slug) => {
    const course = await educationCourseService.getCourse(slug);
    expect(course?.plannedDetails?.courseStarts).toBeUndefined();
    expect(course?.plannedDetails?.registrationOpens).toBeUndefined();
    expect(course?.plannedDetails?.registrationDeadline).toBeUndefined();
    expect(course?.plannedDetails?.weeklyCurriculum).toHaveLength(8);
    expect(course?.plannedDetails?.interestNotice).toMatch(/does not apply, reserve a seat, allocate capacity or activate payment/i);
    render(await CourseDetailPage({ params: Promise.resolve({ slug }) }));
    expect(screen.getAllByText(/Coming January 2027/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Registration opening soon/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /pay|register now|enrol/i })).not.toBeInTheDocument();
  });

  it('renders the department catalogue without legacy demonstration courses', async () => {
    render(await DepartmentPage({ params: Promise.resolve({ slug: 'electronics' }) }));
    expect(screen.getByRole('heading', { name: 'Electronics & Engineering courses' })).toBeInTheDocument();
    for (const slug of slugs) expect(document.querySelector(`a[href="/institute/courses/${slug}"]`)).toBeInTheDocument();
    expect(document.querySelector('a[href="/institute/courses/arduino-for-beginners-bundle"]')).not.toBeInTheDocument();
  });

  it('keeps the stated certificate and low-voltage safety policy', async () => {
    const course = await educationCourseService.getCourse(slugs[0]);
    expect(course?.plannedDetails?.completionRequirements).toEqual(expect.arrayContaining(['Attend at least 5 of 8 live sessions', 'Achieve at least 60% on the final practical assessment']));
    expect(course?.plannedDetails?.completionPolicyNote).toContain('14 calendar days');
    expect(course?.plannedDetails?.certificate).toContain('QR verification');
    expect(course?.plannedDetails?.scopeExclusions).toContain('Live mains-powered appliance repair');
  });

  it('normalizes public fee, delivery mode and language display text', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: slugs[1] }) }));
    expect(screen.getAllByText('LKR 20,000').length).toBeGreaterThan(0);
    expect(screen.queryByText(/LKR 20,000 proposed fee/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Live Online via Zoom').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sinhala').length).toBeGreaterThan(0);
  });

  it('uses the approved repair image only for the troubleshooting course', async () => {
    const fundamentals = await educationCourseService.getCourse(slugs[0]);
    const repair = await educationCourseService.getCourse(slugs[1]);
    expect(fundamentals?.image).toBe('/images/institute/learning/generated/practical-electronics-hero-1200.webp');
    expect(fundamentals?.plannedDetails?.imageBaseName).toBe('practical-electronics-hero');
    expect(repair?.image).toBe('/images/institute/electronics/electronics-repair-troubleshooting.webp');
    expect(repair?.plannedDetails?.imageBaseName).toBe('electronics/electronics-repair-troubleshooting');
    render(await CourseDetailPage({ params: Promise.resolve({ slug: slugs[1] }) }));
    const hero = screen.getByRole('img', { name: /electronics repair diagnostics workspace/i });
    expect(hero).toHaveAttribute('src', '/images/institute/electronics/electronics-repair-troubleshooting.webp');
    expect(document.querySelector('source[type="image/avif"]')).toHaveAttribute('srcset', '/images/institute/electronics/electronics-repair-troubleshooting.avif');
  });
});
