import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AboutPage from '@/app/institute/about/page';
import InstituteHomePage from '@/app/institute/page';
import EducationHeader from '@/features/education/components/EducationHeader';

vi.mock('next/navigation', () => ({ usePathname: () => '/institute/about' }));

describe('Institute branding and About page', () => {
  it('uses the official local logo with stable intrinsic dimensions', () => {
    render(<EducationHeader />);
    expect(screen.getByRole('link', { name: 'Techromz Institute of Technology home' })).toHaveAttribute('href', '/institute');
    const logo = screen.getByRole('img', { name: 'Techromz Institute of Technology logo' });
    expect(decodeURIComponent(logo.getAttribute('src') || '')).toContain('/images/institute/techromz-institute-logo-840.webp');
    expect(logo).toHaveAttribute('width', '840');
    expect(logo).toHaveAttribute('height', '480');
  });

  it('keeps the mobile navigation labelled and usable', () => {
    render(<EducationHeader />);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Mobile institute navigation' })).toBeInTheDocument();
  });

  it('renders the approved About content and course call to action', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'About Techromz Institute of Technology' })).toBeInTheDocument();
    expect(screen.getByText('Practical learning. Real-world thinking.')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why Learn with TIT?' })).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative image|Not TIT/i)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /hands assembling a small breadboard/ })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('img', { name: /fictional learners collaborating/ })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('link', { name: /Explore courses/ })).toHaveAttribute('href', '/institute/courses');
  });

  it('uses the approved homepage hero copy, prioritised image and CTA destinations', async () => {
    render(await InstituteHomePage());
    const hero = screen.getByRole('img', { name: /Retail Eco System operating platform and AI Advisor/ });
    expect(hero).not.toHaveAttribute('loading', 'lazy');
    expect(hero).toHaveAttribute('loading', 'eager');
    expect(hero).toHaveAttribute('fetchpriority', 'high');
    expect(hero).toHaveAttribute('width', '1200');
    expect(hero).toHaveAttribute('height', '800');
    expect(hero.getAttribute('src')).toContain('/images/institute/technology/generated/retail-ai-side-by-side-1200.webp');
    expect(screen.getByText('Learn by making')).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative image|Not TIT/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Big ideas start with practical skills.' })).toBeInTheDocument();
    expect(screen.getByText('Explore hands-on learning across seven developing departments in technology, business, trade, law, arts, languages, Ayurveda and wellness with Techromz Institute of Technology.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Explore Courses' })[0]).toHaveAttribute('href', '/institute/courses');
    expect(screen.getByRole('link', { name: 'Discover TIT' })).toHaveAttribute('href', '/institute/about');
  });

  it('keeps homepage discovery honest, linked and lazy-loaded below the fold', async () => {
    render(await InstituteHomePage());
    const departmentSection = screen.getByRole('region', { name: 'Find the field that gets you thinking.' });
    expect(within(departmentSection).getAllByRole('article')).toHaveLength(7);
    const departmentLinks = within(departmentSection).getAllByRole('link', { name: 'Explore department' });
    expect(departmentLinks[0]).toHaveAttribute('href', '/institute/departments/information-technology');
    expect(departmentLinks[1]).toHaveAttribute('href', '/institute/departments/business-management');
    expect(departmentLinks[2]).toHaveAttribute('href', '/institute/departments/trade-logistics');
    expect(departmentLinks[3]).toHaveAttribute('href', '/institute/departments/electronics');
    expect(screen.getByRole('img', { name: /laptop, software, data and network/ })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('img', { name: /business planning materials/ })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('img', { name: /modern container port/i })).toHaveAttribute('loading', 'lazy');
    expect(screen.getAllByText('Planned intake')).toHaveLength(4);
    const intake = screen.getByRole('region', { name: 'December 2026 first intake' });
    expect(within(intake).queryAllByRole('article')).toHaveLength(0);
    expect(within(intake).queryByText('Planned intake')).not.toBeInTheDocument();
    const plannedCourses = screen.getByRole('heading', { name: 'Build practical application skills.' }).closest('section');
    expect(plannedCourses).not.toBeNull();
    expect(within(plannedCourses!).getAllByRole('article')).toHaveLength(4);
    expect(screen.getAllByText('Planned roadmap')).toHaveLength(4);
    expect(screen.queryByRole('heading', { name: 'Your next idea deserves a starting point.' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Technology from the Techromz Group' })).toBeInTheDocument();
    expect(screen.getByText('A Techromz project focused on connected retail operations and digital commerce.')).toBeInTheDocument();
    expect(screen.getByText('A Techromz project exploring AI-assisted product guidance and shopping experiences.')).toBeInTheDocument();
    const technologyImageAlts = new Set([
      'Retail Eco System operating platform banner with a retail analytics dashboard',
      'AI Advisor intelligent assistance banner in a modern workspace',
    ]);
    const technologyImages = screen.getAllByRole('img').filter((image) => technologyImageAlts.has(image.getAttribute('alt') ?? ''));
    expect(technologyImages).toHaveLength(2);
    expect(technologyImages.every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(screen.getByRole('heading', { name: 'Learning That Reaches Beyond Our Classrooms' })).toBeInTheDocument();
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Our Community Impact/i })).toHaveAttribute('href', '/institute/community-impact');
    expect(screen.getByRole('img', { name: /students and mentors learning together with laptops/i })).toHaveAttribute('loading', 'lazy');
  });
});
