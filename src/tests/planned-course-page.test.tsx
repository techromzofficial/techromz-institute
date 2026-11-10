import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CourseDetailPage, { generateMetadata } from '@/app/institute/courses/[slug]/page';
import { getInstituteContactLinks } from '@/features/education/config/contact';
import { educationCourseService } from '@/features/education/services/courseService';

describe('AI course naming and visibility', () => {
  it('populates the enquiry form from the selected Mobile Kickstart course', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'mobile-kickstart' }) }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Email enquiry' })[0]!);
    expect(screen.getByDisplayValue('Mobile Kickstart')).toHaveAttribute('readonly');
    expect(screen.queryByDisplayValue('General course enquiry')).not.toBeInTheDocument();
  });

  it('renders the planned course content and verified enquiry routes', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'build-your-first-ai-assistant' }) }));

    expect(screen.getByRole('heading', { level: 1, name: 'AI Kickstart' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /warm learning workspace with a laptop showing study-assistant code/i })).toHaveAttribute('src', expect.stringContaining('ai-kickstart-v2-1200.webp'));
    expect(screen.getByText('Build Your First AI Assistant')).toBeInTheDocument();
    expect(screen.getAllByText('Planned intake').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maximum 30 students per course/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/cohort/i)).not.toBeInTheDocument();
    expect(screen.getByText('Live Online via Zoom')).toBeInTheDocument();
    const courseDetails = screen.getByRole('heading', { name: 'Course details' }).closest('aside');
    expect(courseDetails).not.toBeNull();
    const alignedSection = courseDetails!.parentElement!;
    expect(alignedSection).toHaveClass('max-w-5xl');
    expect(within(alignedSection).getByText('Admissions')).toBeInTheDocument();
    expect(screen.getByText('Sinhala')).toBeInTheDocument();
    expect(screen.getByText(/1 December 2026 · 5:30 PM – 7:30 PM \(Sri Lanka Time\)/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My AI Study Assistant' })).toBeInTheDocument();
    expect(screen.getByText(/illustrative interface only/i)).toBeInTheDocument();
    expect(screen.getAllByText(/does not reserve a seat or confirm enrolment/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
    expect(screen.getByText('Do I need coding experience?')).toBeInTheDocument();

    const contact = getInstituteContactLinks('AI Kickstart');
    expect(screen.getAllByRole('link', { name: /Register your interest.*WhatsApp/i })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /Register your interest.*WhatsApp/i })[0]).toHaveAttribute('href', contact.whatsapp);
    expect(screen.getAllByRole('button', { name: 'Email enquiry' })).not.toHaveLength(0);
  });

  it('renders the selective intermediate course without altering the beginner pathway', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'build-an-ai-knowledge-assistant' }) }));

    expect(screen.getByRole('heading', { level: 1, name: 'AI Knowledge Lab' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /application code beside the purple-and-white AI Beauty Advisor/i })).toHaveAttribute('src', expect.stringContaining('ai-knowledge-lab-v2-1200.webp'));
    expect(screen.getByText('Build an Assistant That Answers from Documents')).toBeInTheDocument();
    expect(screen.getByText('Build AI answers grounded in your own learning materials.')).toBeInTheDocument();
    expect(screen.getByText('Application-based admission')).toBeInTheDocument();
    expect(screen.getByText(/searches approved material first/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My Learning Knowledge Assistant' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Selective, fair and transparent admission' })).toBeInTheDocument();
    expect(screen.getByText('Technical readiness')).toBeInTheDocument();
    expect(screen.getAllByText('AI Knowledge Lab — Intermediate').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /AI Kickstart.*Beginner/i })).toHaveAttribute('href', '/institute/courses/build-your-first-ai-assistant');
    expect(screen.getAllByText(/does not submit a formal application or reserve a seat/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not first come, first served/i)).toBeInTheDocument();

    const contact = getInstituteContactLinks('AI Knowledge Lab');
    expect(screen.getAllByRole('link', { name: /Register your interest.*WhatsApp/i })[0]).toHaveAttribute('href', contact.whatsapp);
    expect(screen.getAllByRole('button', { name: 'Email enquiry' })).not.toHaveLength(0);
  });

  it('renders Retail Kickstart with its confirmed fee, Colombo dates and enquiry-only registration', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'retail-kickstart' }) }));

    expect(screen.getByRole('heading', { level: 1, name: 'Retail Kickstart' })).toBeInTheDocument();
    expect(screen.getByText('Build your first retail application, one step at a time.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /simple retail product catalogue and stock indicators/i })).toHaveAttribute('src', expect.stringContaining('retail-kickstart-1200.webp'));
    expect(screen.getByText('LKR 7,500')).toBeInTheDocument();
    expect(screen.getByText('1 November 2026')).toBeInTheDocument();
    expect(screen.getByText(/1 December 2026 · 7:30 PM – 9:30 PM \(Sri Lanka Time\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/Dates are interpreted in Asia\/Colombo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/does not reserve a seat or confirm enrolment/i).length).toBeGreaterThan(0);
    expect(screen.getByText('At least five of eight live classes attended')).toBeInTheDocument();
    expect(screen.getByText('Final project submission')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Register your interest.*WhatsApp/i })[0]).toHaveAttribute('href', getInstituteContactLinks('Retail Kickstart').whatsapp);
  });

  it('renders Retail Developer Lab with its image, fee, dates and intermediate admission rules', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'retail-developer-lab' }) }));

    expect(screen.getByRole('heading', { level: 1, name: 'Retail Developer Lab' })).toBeInTheDocument();
    expect(screen.getByText('Connect your code. Build a working retail application.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /application code beside a retail products and inventory interface/i })).toHaveAttribute('src', expect.stringContaining('retail-developer-lab-1200.webp'));
    expect(screen.getByText('LKR 15,000')).toBeInTheDocument();
    expect(screen.getByText('1 November 2026')).toBeInTheDocument();
    expect(screen.getByText(/2 December 2026 · 7:30 PM – 9:30 PM \(Sri Lanka Time\)/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Selective, fair and transparent admission' })).toBeInTheDocument();
    expect(screen.getByText(/No payment will be collected before the admission decision/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retail Kickstart.*Beginner/i })).toHaveAttribute('href', '/institute/courses/retail-kickstart');
    expect(screen.getAllByRole('link', { name: /Register your interest.*WhatsApp/i })[0]).toHaveAttribute('href', getInstituteContactLinks('Retail Developer Lab').whatsapp);
  });

  it('includes the advanced course in the public visibility rule', async () => {
    expect((await educationCourseService.getCourse('build-and-launch-your-ai-assistant'))?.title).toBe('AI Launchpad');
  });

  it('renders Retail Launchpad with its advanced rules, confirmed fee and Colombo dates', async () => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug: 'retail-launchpad' }) }));

    expect(screen.getByRole('heading', { level: 1, name: 'Retail Launchpad' })).toBeInTheDocument();
    expect(screen.getByText('Build, secure and deploy your retail application.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /deployment checks on a laptop and a multi-store inventory dashboard/i })).toHaveAttribute('src', expect.stringContaining('retail-launchpad-1200.webp'));
    expect(screen.getByText('LKR 25,000')).toBeInTheDocument();
    expect(screen.getByText('1 November 2026')).toBeInTheDocument();
    expect(screen.getByText(/3 December 2026 · 7:30 PM – 9:30 PM \(Sri Lanka Time\)/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project-based admission with a readiness discussion' })).toBeInTheDocument();
    expect(screen.getByText(/No payment is collected before the admission decision/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retail Developer Lab.*Intermediate/i })).toHaveAttribute('href', '/institute/courses/retail-developer-lab');
    expect(screen.getAllByRole('link', { name: /Register your interest.*WhatsApp/i })[0]).toHaveAttribute('href', getInstituteContactLinks('Retail Launchpad').whatsapp);
  });

  it('uses the public course names and subtitles in metadata', async () => {
    const beginner = await generateMetadata({ params: Promise.resolve({ slug: 'build-your-first-ai-assistant' }) });
    const intermediate = await generateMetadata({ params: Promise.resolve({ slug: 'build-an-ai-knowledge-assistant' }) });
    expect(beginner.title).toBe('AI Kickstart — Build Your First AI Assistant');
    expect(intermediate.title).toBe('AI Knowledge Lab — Build an Assistant That Answers from Documents');
  });

  it.each([
    ['mobile-kickstart', 'Mobile Kickstart', 'LKR 7,500', 'Beginner', 'mobile-kickstart.webp'],
    ['mobile-developer-lab', 'Mobile Developer Lab', 'LKR 15,000', 'Intermediate', 'mobile-developer-lab.webp'],
    ['mobile-launchpad', 'Mobile Launchpad', 'LKR 25,000', 'Advanced', 'mobile-launchpad.webp'],
  ])('renders %s with the shared mobile pathway and approved policies', async (slug, title, fee, level, imageName) => {
    render(await CourseDetailPage({ params: Promise.resolve({ slug }) }));
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /mobile app|mobile application/i })).toHaveAttribute('src', expect.stringContaining(`/mobile/${imageName}`));
    expect(screen.getByText('Mobile app development pathway')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mobile Kickstart.*Beginner/i })).toHaveAttribute('href', '/institute/courses/mobile-kickstart');
    expect(screen.getByRole('link', { name: /Mobile Developer Lab.*Intermediate/i })).toHaveAttribute('href', '/institute/courses/mobile-developer-lab');
    expect(screen.getByRole('link', { name: /Mobile Launchpad.*Advanced/i })).toHaveAttribute('href', '/institute/courses/mobile-launchpad');
    expect(screen.getByText(fee)).toBeInTheDocument();
    expect(screen.getAllByText(level).length).toBeGreaterThan(0);
    expect(screen.getAllByText('27 November 2026').length).toBeGreaterThan(0);
    expect(screen.getByText('To be announced')).toBeInTheDocument();
    expect(screen.getByText('At least five of eight live classes attended')).toBeInTheDocument();
    expect(screen.getByText('At least 60% in the final practical assessment')).toBeInTheDocument();
    expect(screen.getAllByText(/one free resubmission within 14 calendar days/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Week 8/i })).toBeInTheDocument();
    expect(screen.queryByText('AI assistant learning pathway')).not.toBeInTheDocument();
    expect(screen.queryByText('Retail software learning pathway')).not.toBeInTheDocument();
  });
});
