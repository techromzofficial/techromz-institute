import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CourseDetailPage, { generateMetadata } from '@/app/institute/courses/[slug]/page';
import DepartmentPage from '@/app/institute/departments/[slug]/page';
import { BUSINESS_COURSES } from '@/features/education/data/businessCourses';
import { educationCourseService } from '@/features/education/services/courseService';

const expected = [
  ['business-management-kickstart', 'Business Management Kickstart', 'Beginner', 'LKR 10,000'],
  ['entrepreneurship-small-business-kickstart', 'Entrepreneurship & Small Business Kickstart', 'Beginner', 'LKR 10,000'],
  ['marketing-business-growth-lab', 'Marketing & Business Growth Lab', 'Intermediate', 'LKR 20,000'],
  ['business-operations-financial-management-lab', 'Business Operations & Financial Management Lab', 'Intermediate', 'LKR 20,000'],
  ['strategic-business-leadership', 'Strategic Business Leadership', 'Advanced', 'LKR 30,000'],
  ['digital-business-transformation-strategy', 'Digital Business Transformation & Strategy', 'Advanced', 'LKR 30,000'],
] as const;

describe('Business & Management planned courses', () => {
  it('publishes the six exact titles, levels, fees and eight-week drafts', async () => {
    const courses = (await educationCourseService.listCourses()).filter((course) => course.subject === 'Business & Management');
    expect(courses.map((course) => [course.slug, course.title, course.level, course.plannedDetails?.fee])).toEqual(expected);
    expect(new Set(courses.map((course) => course.slug)).size).toBe(6);
    for (const course of courses) {
      expect(course).toMatchObject({ demo: false, seoIndexable: false });
      expect(course.image).toBe(`/images/institute/learning/generated/business-management/${course.slug}.webp`);
      expect(course.plannedDetails?.imageBaseName).toBe(`business-management/${course.slug}`);
      expect(course.plannedDetails?.imageAlt).toBeTruthy();
      expect(course.plannedDetails?.weeklyCurriculum).toHaveLength(8);
      expect(course.plannedDetails?.courseStarts).toBeUndefined();
      expect(course.plannedDetails?.registrationOpens).toBeUndefined();
      expect(course.plannedDetails?.completionPolicyNote).toMatch(/not yet been approved/i);
    }
  });

  it('preserves the approved first two Business Management Kickstart directions', () => {
    const weeks = BUSINESS_COURSES[0].plannedDetails?.weeklyCurriculum;
    expect(weeks?.[0].title).toBe('Understanding How a Real Business Works');
    expect(weeks?.[0].deliverable).toMatch(/Portfolio Section 1 — Business Overview/);
    expect(weeks?.[1].title).toBe('Business Models & Business Planning');
    expect(weeks?.[1].objectives.join(' ')).toMatch(/customer group.*value offered.*revenue.*sales channel.*key resources.*main costs/i);
    expect(weeks?.slice(2).every((week) => week.title.endsWith('— Draft'))).toBe(true);
  });

  it.each(expected)('renders %s with shared planned-course layout', async (slug, title, level, fee) => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug }) }));
    const imageAlt = BUSINESS_COURSES.find((course) => course.slug === slug)?.plannedDetails?.imageAlt;
    expect(imageAlt).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: imageAlt! })).toHaveAttribute('src', expect.stringContaining(`/business-management/${slug}.webp`));
    expect(screen.getByText('Business & Management course pathway')).toBeInTheDocument();
    expect(screen.getAllByText(level).length).toBeGreaterThan(0);
    expect(screen.getByText(fee)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
    expect(screen.getByText('Does an enquiry reserve a seat?')).toBeInTheDocument();
    expect(screen.getAllByText(/does not reserve a seat/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/one free resubmission within 14 calendar days/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1 December 2026/)).not.toBeInTheDocument();
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it('groups all six department cards by level', async () => {
    render(await DepartmentPage({ params: Promise.resolve({ slug: 'business-management' }) }));
    expect(screen.getByRole('heading', { name: 'Six planned Business & Management courses' })).toBeInTheDocument();
    expect(document.getElementById('business-management-beginner-courses')).toHaveTextContent('Beginner');
    expect(document.getElementById('business-management-intermediate-courses')).toHaveTextContent('Intermediate');
    expect(document.getElementById('business-management-advanced-courses')).toHaveTextContent('Advanced');
    expect(screen.getAllByText('LKR 10,000')).toHaveLength(2);
    expect(screen.getAllByText('LKR 20,000')).toHaveLength(2);
    expect(screen.getAllByText('LKR 30,000')).toHaveLength(2);
  });
});
