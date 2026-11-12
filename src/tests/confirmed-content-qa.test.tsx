import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import PlannedCourseExperience from '@/features/education/components/PlannedCourseExperience';
import { educationCourseService } from '@/features/education/services/courseService';
import { educationContentService } from '@/features/education/services/contentService';
import ContactPage from '@/app/institute/contact/page';

it('keeps AI Kickstart copy and all eight curriculum weeks consistent', async () => {
  const course = (await educationCourseService.getCourse('build-your-first-ai-assistant'))!;
  expect(course.description).toContain('in eight weeks');
  expect(course.plannedDetails?.heroCopy).toContain('in eight weeks');
  expect(course.summary).toContain('eight-week');
  expect(course.plannedDetails?.duration).toBe('Eight weeks');
  expect(course.plannedDetails?.curriculum.map(({ lessons }) => lessons).flat()).toHaveLength(8);
  expect(course.plannedDetails?.curriculum.map(({ title }) => title.match(/^Weeks (\d+)–(\d+)/)?.slice(1))).toEqual([['1', '2'], ['3', '4'], ['5', '6'], ['7', '8']]);
  expect(JSON.stringify(course)).not.toMatch(/four weeks|four-week|4 weeks/i);
  render(<PlannedCourseExperience course={course} />);
  expect(screen.getByText(course.plannedDetails!.heroCopy)).toBeInTheDocument();
});

it.each(['electronics-fundamentals-circuit-building', 'electronics-repair-troubleshooting'])('renders approved course and session capacity for %s', async (slug) => {
  const course = (await educationCourseService.getCourse(slug))!;
  expect(course.plannedDetails?.cohortCapacity).toBe('Maximum 30 students');
  expect(course.plannedDetails?.admissions?.capacityNotice).toMatch(/^Maximum 30 students per session\./);
  render(<PlannedCourseExperience course={course} />);
  expect(screen.getAllByText('Maximum 30 students').length).toBeGreaterThan(0);
  expect(screen.getByText(/Maximum 30 students per session\./)).toBeInTheDocument();
  expect(screen.queryByText(/Maximum 20 students/)).not.toBeInTheDocument();
});

it('derives department counts from the public catalogue', async () => {
  const courses = await educationCourseService.listCourses();
  for (const slug of ['arts-languages', 'ayurveda-wellness']) {
    const department = (await educationContentService.getDepartment(slug))!;
    const count = courses.filter((course) => department.courseSlugs.includes(course.slug)).length;
    expect(department.developmentStatus).toMatch(new RegExp(`^${count} `));
  }
});

it('keeps unconfirmed jewellery capacity and recognition non-promissory', async () => {
  render(<PlannedCourseExperience course={(await educationCourseService.getCourse('gem-jewellery-design'))!} />);
  expect(screen.getByText('Class capacity is to be confirmed.')).toBeInTheDocument();
  expect(screen.getByText('Completion recognition details are to be confirmed.')).toBeInTheDocument();
  expect(screen.queryByText(/Maximum 20/)).not.toBeInTheDocument();
  expect(screen.queryByText(/AI assistant learning pathway/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Study Buddy/)).not.toBeInTheDocument();
});

it('does not promote the unavailable Arduino bundle', async () => {
  render(await ContactPage());
  expect(screen.queryByText(/Arduino bundle/i)).not.toBeInTheDocument();
});
