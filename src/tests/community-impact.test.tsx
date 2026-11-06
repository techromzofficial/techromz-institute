import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CommunityImpactPage, { metadata } from '@/app/institute/community-impact/page';
import EducationHeader from '@/features/education/components/EducationHeader';
import EducationFooter from '@/features/education/components/EducationFooter';
import { getSchoolWorkshopContactLinks } from '@/features/education/config/contact';

vi.mock('next/navigation', () => ({ usePathname: () => '/institute/community-impact' }));

describe('Techromz Community Impact Programme', () => {
  it('renders completed impact separately from planned support and has no donation action', () => {
    render(<CommunityImpactPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Techromz Community Impact Programme' })).toBeInTheDocument();
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getAllByText('Existing activity')).toHaveLength(1);
    expect(screen.getAllByText('Planned')).toHaveLength(2);
    expect(screen.getByText(/We do not collect public donations through this website/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /donate|sponsor/i })).not.toBeInTheDocument();
    const workshopImages = screen.getAllByRole('img', { name: /students|workshop participants|teachers and a mentor/i });
    expect(workshopImages).toHaveLength(7);
    expect(workshopImages[0]).toHaveAttribute('loading', 'eager');
    expect(workshopImages.slice(1).every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(workshopImages[0]).toHaveAttribute('src', workshopImages[1].getAttribute('src'));
    expect(screen.getByLabelText('Community workshop photo gallery')).toHaveClass('overflow-x-auto');
    expect(screen.queryByText(/photography will be published/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a School Workshop on WhatsApp' })).toHaveAttribute('href', getSchoolWorkshopContactLinks().whatsapp);
  });

  it('adds the route to shared navigation and footer', () => {
    render(<><EducationHeader /><EducationFooter /></>);
    expect(screen.getAllByRole('link', { name: 'Community Impact' }).every((link) => link.getAttribute('href') === '/institute/community-impact')).toBe(true);
  });

  it('uses protected Institute metadata', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

