import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DecemberFirstIntake from '@/features/education/components/DecemberFirstIntake';
import { educationCourseService } from '@/features/education/services/courseService';
import { FIRST_INTAKE } from '@/features/education/config/intakes';

describe('December first-intake presentation', () => {
  it('renders the approved four records in order with canonical copy, assets and destinations', async () => {
    const courses = await educationCourseService.listCourses();
    render(<DecemberFirstIntake courses={courses} />);
    const section = screen.getByRole('region', { name: 'December 2026 first intake' });
    const cards = within(section).getAllByRole('article');
    expect(cards).toHaveLength(4);
    expect(within(section).getByText('Practical live online learning for Sri Lankan learners. These intakes are planned; enquiries do not confirm admission or payment availability. All times are Sri Lanka time.')).toBeInTheDocument();

    for (const [index, [slug, intake]] of Object.entries(FIRST_INTAKE).entries()) {
      const course = courses.find(item => item.slug === slug)!;
      const card = within(cards[index]);
      expect(card.getByRole('heading', { level: 3, name: course.title })).toBeInTheDocument();
      expect(card.getByText(course.subtitle!)).toBeInTheDocument();
      expect(card.getByText(course.summary)).toBeInTheDocument();
      expect(card.getByText(course.subject)).toBeInTheDocument();
      expect(card.getByText('Beginner')).toBeInTheDocument();
      expect(card.getByText('Planned intake')).toBeInTheDocument();
      expect(card.getByRole('link', { name: `View details about ${course.title}` })).toHaveAttribute('href', `/institute/courses/${slug}`);
      expect(cards[index].querySelector('time')).toHaveAttribute('datetime', intake.date);
      expect(card.getByText(intake.fee.split(' ')[1])).toBeInTheDocument();
      const image = card.getByRole('img', { name: course.plannedDetails!.imageAlt });
      expect(decodeURIComponent(image.getAttribute('src') ?? '')).toContain(course.image);
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('sizes', expect.stringContaining('1440px'));
    }
  });

  it('shows the Sri Lanka time ranges and omits unpublished or unrelated courses', async () => {
    const courses = await educationCourseService.listCourses();
    render(<DecemberFirstIntake courses={courses.map(course => course.slug === 'retail-kickstart' ? { ...course, publicationStatus: 'unpublished' as const } : course)} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.queryByRole('heading', { name: 'Retail Kickstart' })).not.toBeInTheDocument();
    expect(screen.getAllByText('6:00 PM–8:00 PM')).toHaveLength(2);
    expect(screen.getByText('8:00 PM–10:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Tuesday, 1 December 2026')).toBeInTheDocument();
    expect(screen.getAllByText('Monday, 7 December 2026')).toHaveLength(2);
    expect(screen.queryByRole('heading', { name: 'Retail Developer Lab' })).not.toBeInTheDocument();
  });
});
