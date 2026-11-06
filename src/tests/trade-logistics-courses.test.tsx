import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CourseDetailPage, { generateMetadata } from '@/app/institute/courses/[slug]/page';
import DepartmentPage from '@/app/institute/departments/[slug]/page';
import { educationCourseService } from '@/features/education/services/courseService';
import { TRADE_LOGISTICS_COURSES } from '@/features/education/data/tradeLogisticsCourses';

const expected = [
  ['international-trade-kickstart', 'International Trade Kickstart', 'Beginner', 'LKR 10,000', 'My First International Trade Plan'],
  ['logistics-warehouse-operations-kickstart', 'Logistics & Warehouse Operations Kickstart', 'Beginner', 'LKR 10,000', 'Mini Warehouse Operations Plan'],
  ['import-export-operations-lab', 'Import & Export Operations Lab', 'Intermediate', 'LKR 20,000', 'End-to-End Import/Export Documentation Portfolio'],
  ['procurement-inventory-distribution-lab', 'Procurement, Inventory & Distribution Lab', 'Intermediate', 'LKR 20,000', 'Integrated Procurement & Inventory Operations Portfolio'],
  ['international-trade-supply-chain-strategy', 'International Trade & Supply Chain Strategy', 'Advanced', 'LKR 30,000', 'International Trade & Supply Chain Strategy Proposal'],
  ['logistics-leadership-optimization', 'Logistics Leadership & Optimization', 'Advanced', 'LKR 30,000', 'Logistics Operations Improvement Plan'],
] as const;

describe('Trade & Logistics planned courses', () => {
  it('registers six unique, noindex, eight-week course records with exact commercial details', async () => {
    const courses = (await educationCourseService.listCourses()).filter((course) => course.subject === 'Trade & Logistics');
    expect(courses.map((course) => [course.slug, course.title, course.level, course.plannedDetails?.fee, course.plannedDetails?.projectTitle])).toEqual(expected);
    expect(new Set(courses.map((course) => course.slug)).size).toBe(6);
    for (const course of courses) {
      expect(course).toMatchObject({ demo: false, seoIndexable: false });
      expect(course.image).toBe(`/images/institute/learning/generated/trade-logistics/${course.slug}.webp`);
      expect(course.plannedDetails?.imageBaseName).toBe(`trade-logistics/${course.slug}`);
      expect(course.plannedDetails?.imageAlt).toBeTruthy();
      expect(course.plannedDetails).toMatchObject({ duration: 'Eight weeks', totalLiveLearning: '16 hours', deliveryMode: 'Online (Zoom)', cohortCapacity: 'Maximum 30 students per course/session' });
      expect(course.plannedDetails?.weeklyCurriculum).toHaveLength(8);
      expect(course.plannedDetails?.courseStarts).toBeUndefined();
      expect(course.plannedDetails?.registrationOpens).toBeUndefined();
    }
  });

  it('keeps every weekly module complete and every project distinct', () => {
    expect(new Set(TRADE_LOGISTICS_COURSES.map((course) => course.plannedDetails?.projectTitle)).size).toBe(6);
    for (const course of TRADE_LOGISTICS_COURSES) {
      for (const week of course.plannedDetails?.weeklyCurriculum ?? []) {
        expect(week.objectives.length).toBeGreaterThanOrEqual(2);
        expect(week.activity).toBeTruthy();
        expect(week.deliverable).toBeTruthy();
        expect(week.outcome).toBeTruthy();
      }
    }
  });

  it.each(expected)('renders %s with the mandatory Trade bottom layout', async (slug, title, level, fee, project) => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug }) }));
    const imageAlt = TRADE_LOGISTICS_COURSES.find((course) => course.slug === slug)?.plannedDetails?.imageAlt;
    expect(imageAlt).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: imageAlt! })).toHaveAttribute('src', expect.stringContaining(`/trade-logistics/${slug}.webp`));
    expect(screen.getByText('Trade & Logistics course pathway')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: project })).toBeInTheDocument();
    expect(screen.getAllByText(level).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maximum 30 students per course/session').length).toBeGreaterThan(0);
    expect(screen.getByText(/planned maximum capacity—not a live count/i)).toBeInTheDocument();
    const details = screen.getByRole('heading', { name: 'Course details' }).closest('aside');
    expect(details).not.toBeNull();
    expect(within(details!).getByText('Live Online via Zoom')).toBeInTheDocument();
    expect(within(details!).getByText(fee)).toBeInTheDocument();
    expect(within(details!).getByText('Sinhala')).toBeInTheDocument();
    expect(within(details!).getByRole('heading', { name: 'Register Your Interest' })).toBeInTheDocument();
    expect(within(details!).getByRole('link', { name: /Register your interest.*WhatsApp/i })).toBeInTheDocument();
    expect(within(details!).getByRole('button', { name: 'Email enquiry' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
    expect(screen.getByText('Does registering interest reserve a seat?')).toBeInTheDocument();
    expect(screen.queryByText('Registration Opens')).not.toBeInTheDocument();
    expect(screen.queryByText('Start Date')).not.toBeInTheDocument();
    expect(screen.getAllByText(/customs-agent authority|customs licence|licensed customs agent/i).length).toBeGreaterThan(0);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it('groups the Trade department cards by level and exposes all fees', async () => {
    render(await DepartmentPage({ params: Promise.resolve({ slug: 'trade-logistics' }) }));
    expect(screen.getByRole('heading', { name: 'Six planned Trade & Logistics courses' })).toBeInTheDocument();
    expect(document.getElementById('trade-logistics-beginner-courses')).toHaveTextContent('Beginner');
    expect(document.getElementById('trade-logistics-intermediate-courses')).toHaveTextContent('Intermediate');
    expect(document.getElementById('trade-logistics-advanced-courses')).toHaveTextContent('Advanced');
    expect(screen.getAllByText('LKR 10,000')).toHaveLength(2);
    expect(screen.getAllByText('LKR 20,000')).toHaveLength(2);
    expect(screen.getAllByText('LKR 30,000')).toHaveLength(2);
  });
});
