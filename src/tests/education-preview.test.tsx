import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CourseCatalogue from '@/features/education/components/CourseCatalogue';
import { DEMO_COURSES } from '@/features/education/data/demoCourses';
import { educationCourseService } from '@/features/education/services/courseService';
import EnquiryUnavailable from '@/features/education/components/EnquiryUnavailable';
import { formatInstituteDate, getInstituteContactLinks } from '@/features/education/config/contact';

describe('Education preview catalogue', () => {
  it('filters by keyword, subject and level', () => {
    render(<CourseCatalogue courses={DEMO_COURSES} />);
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: 'responsible' } });
    expect(screen.getByText('AI Literacy and Responsible Use')).toBeInTheDocument();
    expect(screen.queryByText('IT Support Foundations')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Electronics & Engineering' } });
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'Intermediate' } });
    expect(screen.getByText('Microcontrollers and Prototyping')).toBeInTheDocument();
    expect(screen.queryByText('Electronics and Circuits Basics')).not.toBeInTheDocument();
  });

  it('uses a 50/25/25 desktop filter grid while retaining mobile stacking', async () => {
    render(<CourseCatalogue courses={await educationCourseService.listCourses()} />);
    const search = screen.getByLabelText('Search courses');
    const filters = search.closest('div');
    expect(filters).toHaveClass('grid', 'md:grid-cols-4');
    expect(search.closest('label')).toHaveClass('md:col-span-2');
    expect(screen.getByLabelText('Subject')).toHaveClass('h-11');
    expect(screen.getByLabelText('Level')).toHaveClass('h-11');
  });

  it('shows and clears an empty result', async () => {
    render(<CourseCatalogue courses={await educationCourseService.listCourses()} />);
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: 'no such course' } });
    expect(screen.getByText('No course listings match')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(screen.getByText('37')).toBeInTheDocument();
  });

  it('resolves known slugs and rejects unknown slugs', async () => {
    expect((await educationCourseService.getCourse('build-your-first-ai-assistant'))?.demo).toBe(false);
    expect((await educationCourseService.getCourse('build-an-ai-knowledge-assistant'))?.level).toBe('Intermediate');
    expect((await educationCourseService.getCourse('build-and-launch-your-ai-assistant'))?.title).toBe('AI Launchpad');
    expect((await educationCourseService.getCourse('mobile-kickstart'))?.title).toBe('Mobile Kickstart');
    expect((await educationCourseService.getCourse('mobile-developer-lab'))?.level).toBe('Intermediate');
    expect((await educationCourseService.getCourse('mobile-launchpad'))?.level).toBe('Advanced');
    expect(await educationCourseService.getCourse('it-support-foundations')).toBeNull();
    expect(await educationCourseService.getCourse('ai-literacy-and-responsible-use')).toBeNull();
    expect(await educationCourseService.getCourse('unknown-course')).toBeNull();
  });

  it('publishes the thirty-seven planned courses without exposing unpublished or demonstration concepts', async () => {
    render(<CourseCatalogue courses={await educationCourseService.listCourses()} />);
    const courseLink = screen.getAllByRole('link', { name: 'View details' }).find((link) => link.getAttribute('href') === '/institute/courses/build-your-first-ai-assistant');
    expect(courseLink).toHaveAttribute('href', '/institute/courses/build-your-first-ai-assistant');
    expect(screen.getAllByText('Planned intake')).toHaveLength(35);
    const course = DEMO_COURSES.find((item) => item.slug === 'build-your-first-ai-assistant');
    expect(course).toMatchObject({ demo: false, seoIndexable: false });
    expect(course?.plannedDetails).toMatchObject({ duration: 'Eight weeks', cohortCapacity: 'Maximum 30 students per course' });
  });

  it('keeps all six public course commercial records exact and shared', async () => {
    const courses = await educationCourseService.listCourses();
    expect(courses.slice(0, 6).map((course) => ({
      title: course.title,
      level: course.level,
      fee: course.plannedDetails?.fee,
      start: course.plannedDetails?.courseStarts,
      time: `${course.plannedDetails?.startTime}-${course.plannedDetails?.endTime}`,
      language: course.plannedDetails?.teachingLanguage,
      delivery: course.plannedDetails?.deliveryMode,
      duration: course.plannedDetails?.duration,
      registration: course.plannedDetails?.registrationOpens,
      timeZone: course.plannedDetails?.timeZone,
    }))).toEqual([
      { title: 'AI Kickstart', level: 'Beginner', fee: 'LKR 7,500', start: '2026-12-01T17:30:00+05:30', time: '17:30-19:30', language: 'Sinhala', delivery: 'Online (Zoom)', duration: 'Eight weeks', registration: '2026-11-01T00:00:00+05:30', timeZone: 'Asia/Colombo' },
      { title: 'Retail Kickstart', level: 'Beginner', fee: 'LKR 7,500', start: '2026-12-01T19:30:00+05:30', time: '19:30-21:30', language: 'Sinhala', delivery: 'Online (Zoom)', duration: 'Eight weeks', registration: '2026-11-01T00:00:00+05:30', timeZone: 'Asia/Colombo' },
      { title: 'AI Knowledge Lab', level: 'Intermediate', fee: 'LKR 15,000', start: '2026-12-02T17:30:00+05:30', time: '17:30-19:30', language: 'Sinhala', delivery: 'Online (Zoom)', duration: 'Eight weeks', registration: '2026-11-01T00:00:00+05:30', timeZone: 'Asia/Colombo' },
      { title: 'Retail Developer Lab', level: 'Intermediate', fee: 'LKR 15,000', start: '2026-12-02T19:30:00+05:30', time: '19:30-21:30', language: 'Sinhala', delivery: 'Online (Zoom)', duration: 'Eight weeks', registration: '2026-11-01T00:00:00+05:30', timeZone: 'Asia/Colombo' },
      { title: 'AI Launchpad', level: 'Advanced', fee: 'LKR 25,000', start: '2026-12-03T17:30:00+05:30', time: '17:30-19:30', language: 'Sinhala', delivery: 'Online (Zoom)', duration: 'Eight weeks', registration: '2026-11-01T00:00:00+05:30', timeZone: 'Asia/Colombo' },
      { title: 'Retail Launchpad', level: 'Advanced', fee: 'LKR 25,000', start: '2026-12-03T19:30:00+05:30', time: '19:30-21:30', language: 'Sinhala', delivery: 'Online (Zoom)', duration: 'Eight weeks', registration: '2026-11-01T00:00:00+05:30', timeZone: 'Asia/Colombo' },
    ]);
  });

  it('publishes three complete mobile course records with approved shared policies', async () => {
    const courses = (await educationCourseService.listCourses()).filter((course) => course.subject === 'Mobile App Development');
    expect(courses).toHaveLength(3);
    expect(courses.map((course) => ({ slug: course.slug, fee: course.plannedDetails?.fee, level: course.level, image: course.image }))).toEqual([
      { slug: 'mobile-kickstart', fee: 'LKR 7,500', level: 'Beginner', image: '/images/institute/learning/generated/mobile/mobile-kickstart.webp' },
      { slug: 'mobile-developer-lab', fee: 'LKR 15,000', level: 'Intermediate', image: '/images/institute/learning/generated/mobile/mobile-developer-lab.webp' },
      { slug: 'mobile-launchpad', fee: 'LKR 25,000', level: 'Advanced', image: '/images/institute/learning/generated/mobile/mobile-launchpad.webp' },
    ]);
    for (const course of courses) {
      expect(course).toMatchObject({ demo: false, seoIndexable: false });
      expect(course.plannedDetails?.imageBaseName).toBe(`mobile/${course.slug}`);
      expect(course.plannedDetails).toMatchObject({ duration: 'Eight weeks', totalLiveLearning: '16 hours', cohortCapacity: 'Maximum 30 students per course', teachingLanguage: 'Sinhala', registrationDeadline: '2026-11-27T23:59:59+05:30' });
      expect(course.plannedDetails?.courseStarts).toBeUndefined();
      expect(course.plannedDetails?.weeklyCurriculum).toHaveLength(8);
    }
  });

  it('lists the intermediate knowledge assistant as a planned, unapproved course', () => {
    const course = DEMO_COURSES.find((item) => item.slug === 'build-an-ai-knowledge-assistant');
    expect(course).toMatchObject({ level: 'Intermediate', demo: false, seoIndexable: false });
    expect(course?.plannedDetails).toMatchObject({ duration: 'Eight weeks', admissionFact: 'Application-based admission' });
    expect(course?.plannedDetails?.relatedCourse?.slug).toBe('build-your-first-ai-assistant');
  });

  it('lists the advanced launch course as planned, noindexed and project-gated', () => {
    const course = DEMO_COURSES.find((item) => item.slug === 'build-and-launch-your-ai-assistant');
    expect(course).toMatchObject({ level: 'Advanced', demo: false, seoIndexable: false });
    expect(course?.plannedDetails).toMatchObject({ duration: 'Eight weeks', admissionFact: 'Project-based admission' });
    expect(course?.plannedDetails?.pathwayCourses).toHaveLength(3);
  });

  it('keeps AI discoverable within the Information Technology department', () => {
    render(<CourseCatalogue courses={DEMO_COURSES} />);
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: 'AI' } });
    expect(screen.getByText('AI Literacy and Responsible Use')).toBeInTheDocument();
    expect(screen.getByText('Applied Machine Learning Concepts')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Information Technology' } });
    expect(screen.getByText('IT Support Foundations')).toBeInTheDocument();
    expect(screen.getByText('AI Literacy and Responsible Use')).toBeInTheDocument();
  });

  it('keeps Arduino pricing and duration at bundle level', async () => {
    const course = DEMO_COURSES.find((item) => item.slug === 'arduino-for-beginners-bundle');
    expect(course?.bundle?.miniCourses).toHaveLength(10);
    expect(course?.bundle).toMatchObject({ totalDuration: '24 hours', fee: 'LKR 7,500', languages: ['Sinhala', 'English'], instructor: 'Industry expert' });
    expect(course?.bundle?.miniCourses.every((miniCourse) => !/24 hours|LKR 7,500/.test(`${miniCourse.title} ${miniCourse.description}`))).toBe(true);
    expect(course?.bundle?.notice).toMatch(/pending final curriculum and instructor confirmation/i);
    expect(formatInstituteDate(course!.bundle!.registrationOpens)).toBe('1 November 2026');
    expect(formatInstituteDate(course!.bundle!.courseStarts)).toBe('1 December 2026');
  });

  it('uses verified, course-specific interest destinations', () => {
    const title = 'Arduino for Beginners Bundle';
    const links = getInstituteContactLinks(title);
    expect(links.whatsapp).toBe('https://wa.me/94773663604?text=Hello%20Techromz%20Institute%2C%20I%20am%20interested%20in%20the%20Arduino%20for%20Beginners%20Bundle.');
    render(<EnquiryUnavailable courseTitle={title} />);
    expect(screen.getByRole('heading', { name: 'Express interest' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', links.whatsapp);
    expect(screen.getByRole('button', { name: /Email enquiry/ })).toBeInTheDocument();
    expect(screen.getByText(/does not confirm registration or reserve a place/i)).toBeInTheDocument();
  });
});
