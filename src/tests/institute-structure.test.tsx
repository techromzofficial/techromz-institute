import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DepartmentsPage from '@/app/institute/departments/page';
import LearningTracksPage from '@/app/institute/learning-tracks/page';
import ForOrganisationsPage from '@/app/institute/for-organisations/page';
import EducationHeader from '@/features/education/components/EducationHeader';
import EducationFooter from '@/features/education/components/EducationFooter';
import { getDepartmentContactLinks, getGeneralContactLinks, getInstituteContactLinks, getOrganisationContactLinks, getTrackContactLinks, INSTITUTE_CONTACT } from '@/features/education/config/contact';
import DepartmentPage from '@/app/institute/departments/[slug]/page';
import ContactPage from '@/app/institute/contact/page';
import { educationContentService } from '@/features/education/services/contentService';

describe('Institute information structure', () => {
  it('keeps departments, specialisms and courses as separate typed content', async () => {
    const departments = await educationContentService.listDepartments();
    expect(departments.map((item) => item.name)).toEqual(['Electronics & Engineering', 'Information Technology', 'Business & Management', 'Trade & Logistics', 'Law & Corporate Governance', 'Department of Arts & Languages', 'Department of Ayurveda & Wellness']);
    expect(departments.find((item) => item.slug === 'information-technology')?.specialisms.map((item) => item.name)).toContain('AI & Data Science');
    expect(departments.find((item) => item.slug === 'business-management')?.courseSlugs).toEqual([
      'business-management-kickstart',
      'entrepreneurship-small-business-kickstart',
      'marketing-business-growth-lab',
      'business-operations-financial-management-lab',
      'strategic-business-leadership',
      'digital-business-transformation-strategy',
    ]);
    expect(departments.find((item) => item.slug === 'business-management')?.specialisms.map((item) => item.name)).not.toContain('Logistics & Supply Chain');
    expect(departments.find((item) => item.slug === 'trade-logistics')?.courseSlugs).toEqual([
      'international-trade-kickstart',
      'logistics-warehouse-operations-kickstart',
      'import-export-operations-lab',
      'procurement-inventory-distribution-lab',
      'international-trade-supply-chain-strategy',
      'logistics-leadership-optimization',
    ]);
    expect(await educationContentService.getDepartment('unknown')).toBeNull();
  });

  it('renders the Trade & Logistics development state, FAQs and tailored enquiry', async () => {
    render(await DepartmentPage({ params: Promise.resolve({ slug: 'trade-logistics' }) }));
    expect(screen.getByRole('heading', { level: 1, name: 'Understand trade. Connect markets. Move business forward.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Six planned Trade & Logistics courses' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trade & Logistics FAQs' })).toBeInTheDocument();
    expect(screen.getByText(/does not claim that these proposed learning areas grant a customs licence/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'WhatsApp enquiry' })).toHaveAttribute('href', getDepartmentContactLinks('Trade & Logistics').whatsapp);
  });

  it('renders department destinations without linking individual specialisms', async () => {
    render(await DepartmentsPage());
    expect(screen.getByRole('heading', { name: 'Electronics & Engineering' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Explore department' })[0]).toHaveAttribute('href', '/institute/departments/electronics');
    expect(screen.queryByRole('link', { name: 'Robotics' })).not.toBeInTheDocument();
  });

  it('connects each department to a roadmap, student FAQs and tailored enquiries', async () => {
    const departments = await educationContentService.listDepartments();
    expect(departments.every((item) => item.faqs.length >= 3)).toBe(true);
    const electronics = departments[0];
    render(await DepartmentPage({ params: Promise.resolve({ slug: electronics.slug }) }));
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Electronics & Engineering FAQs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'IoT & Embedded Systems' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'WhatsApp enquiry' })).toHaveAttribute('href', getDepartmentContactLinks('Electronics & Engineering').whatsapp);
  });

  it('labels all four roadmaps as planned and separates their three stages', async () => {
    render(await LearningTracksPage());
    expect(screen.getAllByText('Planned learning roadmap')).toHaveLength(4);
    expect(screen.getByRole('heading', { level: 1, name: 'Find your direction. Build your next skill.' })).toBeInTheDocument();
    expect(screen.getByText('Explore step-by-step learning roadmaps in technology and business, from your first concepts to more advanced projects.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Web Development' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Foundation' })).toHaveLength(4);
    expect(screen.getAllByRole('heading', { name: 'Intermediate' })).toHaveLength(4);
    expect(screen.getAllByRole('heading', { name: 'Advanced' })).toHaveLength(4);
    expect(screen.getAllByRole('heading', { name: 'Illustrative project' })).toHaveLength(4);
    expect(screen.getAllByRole('heading', { name: 'Who this may suit' })).toHaveLength(4);
    expect(screen.getByText(/not guarantee employment, professional status, course progression/i)).toBeInTheDocument();
    const trackLinks = getTrackContactLinks('Web Development');
    expect(screen.getAllByRole('link', { name: 'WhatsApp enquiry' })[0]).toHaveAttribute('href', trackLinks.whatsapp);
    expect(screen.getAllByRole('link', { name: 'Email enquiry' })[0]).toHaveAttribute('href', trackLinks.email);
    expect(screen.queryByRole('link', { name: /Arduino for Beginners/i })).not.toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images[0]).not.toHaveAttribute('loading', 'lazy');
    expect(images.slice(1).every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(screen.queryByText(/Illustrative image/)).not.toBeInTheDocument();
  });

  it('uses audience-specific verified enquiry destinations and limitations', async () => {
    render(await ForOrganisationsPage());
    expect(screen.getByRole('heading', { level: 1, name: 'Build skills that move your organisation forward.' })).toBeInTheDocument();
    expect(screen.getByText('Discuss practical learning tailored to your people, priorities and goals.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Spark curiosity through making.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Support practical digital capability.' })).toBeInTheDocument();
    for (const heading of ['For Schools', 'For Universities', 'For Teachers', 'For Businesses', 'For Government & Public Sector']) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    }
    const audienceNav = screen.getByRole('navigation', { name: 'Organisation audiences' });
    expect(within(audienceNav).getByRole('link', { name: /For Schools/ })).toHaveAttribute('href', '#schools');
    expect(within(audienceNav).getByRole('link', { name: /For Government & Public Sector/ })).toHaveAttribute('href', '#government-public-sector');
    const schools = getOrganisationContactLinks('Schools');
    expect(screen.getAllByRole('link', { name: 'WhatsApp enquiry' })[1]).toHaveAttribute('href', schools.whatsapp);
    expect(screen.getAllByRole('link', { name: 'Email enquiry' })[0]).toHaveAttribute('href', schools.email);
    expect(screen.getByRole('heading', { name: 'How it could work' })).toBeInTheDocument();
    expect(screen.getByText('Confirm arrangements before delivery.')).toBeInTheDocument();
    expect(screen.getByText(/does not confirm availability, a booking or a partnership/i)).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(6);
    expect(images[0]).not.toHaveAttribute('loading', 'lazy');
    expect(images.slice(1).every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(screen.queryByText(/Illustrative image|Not TIT/i)).not.toBeInTheDocument();
  });

  it('renders verified contact options, tailored enquiries and accurate FAQs', async () => {
    render(await ContactPage());
    expect(screen.getByRole('heading', { level: 1, name: 'Let’s talk about your next step.' })).toBeInTheDocument();
    const general = getGeneralContactLinks();
    const whatsappButtons = screen.getAllByRole('link', { name: 'WhatsApp enquiry' });
    const generalEmail = screen.getByRole('link', { name: 'General email' });
    expect(whatsappButtons[0]).toHaveAttribute('href', general.whatsapp);
    expect(generalEmail).toHaveAttribute('href', general.email);
    expect(whatsappButtons[0]).toHaveClass('min-h-11', 'bg-[#047857]', 'text-white');
    expect(generalEmail).toHaveClass('min-h-11', 'border-2', 'border-[#2454F4]', 'text-[#2045B6]');
    expect(screen.getByText('+94 77 366 3604')).toBeInTheDocument();
    expect(screen.getByText('info@techromzit.com')).toBeInTheDocument();
    expect(screen.getByText('enrolments@techromzit.com')).toBeInTheDocument();
    expect(whatsappButtons[1]).toHaveAttribute('href', getInstituteContactLinks().whatsapp);
    expect(whatsappButtons[2]).toHaveAttribute('href', getTrackContactLinks('learning roadmap').whatsapp);
    expect(screen.queryByText(/1 November 2026.*1 December 2026/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Arduino bundle/i)).not.toBeInTheDocument();
    expect(screen.getByText(/does not confirm registration, availability or a booking/i)).toBeInTheDocument();
    expect(screen.getByText(/does not submit or store an enquiry/i)).toBeInTheDocument();
  });

  it('exposes all requested destinations in desktop and mobile navigation', () => {
    render(<EducationHeader />);
    const desktop = screen.getByRole('navigation', { name: 'Institute navigation' });
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    const mobile = screen.getByRole('navigation', { name: 'Mobile institute navigation' });
    for (const label of ['Explore Courses', 'Departments', 'Learning Tracks', 'For Organisations', 'About', 'Contact']) {
      expect(within(desktop).getByRole('link', { name: label })).toBeInTheDocument();
      expect(within(mobile).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('renders the shared Institute footer with verified destinations and preview status', () => {
    render(<EducationFooter />);
    expect(screen.getByRole('link', { name: 'Techromz Institute of Technology home' })).toHaveAttribute('href', '/institute');
    const footerLogo = screen.getByRole('img', { name: 'Techromz Institute of Technology logo' });
    expect(decodeURIComponent(footerLogo.getAttribute('src') || '')).toContain('/images/institute/techromz-institute-logo-white-840.webp');
    expect(footerLogo).toHaveAttribute('width', '840');
    expect(footerLogo).toHaveAttribute('height', '334');
    expect(screen.getByText('Innovation in Action.')).toBeInTheDocument();

    const organisations = screen.getByRole('navigation', { name: 'For Organisations' });
    const expectedAudiences = [
      ['For Schools', '/institute/for-organisations#schools'],
      ['For Universities', '/institute/for-organisations#universities'],
      ['For Teachers', '/institute/for-organisations#teachers'],
      ['For Businesses', '/institute/for-organisations#businesses'],
      ['For Government & Public Sector', '/institute/for-organisations#government-public-sector'],
    ];
    for (const [label, href] of expectedAudiences) {
      expect(within(organisations).getByRole('link', { name: label })).toHaveAttribute('href', href);
    }

    const general = getGeneralContactLinks();
    expect(screen.getByRole('link', { name: /WhatsApp.*\+94 77 366 3604/ })).toHaveAttribute('href', general.whatsapp);
    expect(screen.getByRole('link', { name: /General Enquiries.*info@techromzit.com/ })).toHaveAttribute('href', general.email);
    expect(screen.getByRole('link', { name: /Enrolment Enquiries.*enrolments@techromzit.com/ })).toHaveAttribute('href', `mailto:${INSTITUTE_CONTACT.enrolmentsEmail}`);
    expect(screen.getByText('Techromz (Pvt) Ltd')).toBeInTheDocument();
    expect(screen.getByText('Techromz Trade & Logistics (Pvt) Ltd')).toBeInTheDocument();
    const socialNavigation = screen.getByRole('navigation', { name: 'Techromz social media' });
    const facebook = within(socialNavigation).getByRole('link', { name: 'Techromz on Facebook' });
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/Techromz/');
    expect(facebook).toHaveAttribute('target', '_blank');
    expect(facebook).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(socialNavigation).getAllByRole('link')).toHaveLength(1);
    const techromz = screen.getByRole('link', { name: 'Techromz (Pvt) Ltd' });
    const tradeLogistics = screen.getByRole('link', { name: 'Techromz Trade & Logistics (Pvt) Ltd' });
    expect(techromz).toHaveAttribute('href', 'https://techromz.com/');
    expect(tradeLogistics).toHaveAttribute('href', 'https://techromztl.com/');
    for (const companyLink of [techromz, tradeLogistics]) {
      expect(companyLink).toHaveAttribute('target', '_blank');
      expect(companyLink).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.getByText(/© \d{4} Techromz Institute\. All rights reserved\./)).toBeInTheDocument();
    expect(screen.queryByText(/Preview only.*Details require confirmation before (launch|lunch)/i)).not.toBeInTheDocument();
  });
});
