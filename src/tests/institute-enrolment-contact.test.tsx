import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EducationHeader from '@/features/education/components/EducationHeader';
import ContactPage from '@/app/institute/contact/page';
import { getCourseEnquiryEmailLink, INSTITUTE_CONTACT } from '@/features/education/config/contact';

const expectedDepartmentOrder = [
  'Information Technology',
  'Business & Management',
  'Trade & Logistics',
  'Electronics & Engineering',
  'Law & Corporate Governance',
  'Arts & Languages',
  'Ayurveda & Wellness',
];

describe('Institute department navigation and enrolment contact', () => {
  it('places Electronics & Engineering fourth in desktop and mobile department navigation', () => {
    render(<EducationHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle departments menu' }));
    const desktop = screen.getByRole('navigation', { name: 'Institute navigation' });
    const desktopDepartments = within(desktop).getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/institute/departments/'));
    expect(desktopDepartments.map((link) => link.textContent)).toEqual(expectedDepartmentOrder);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    const mobile = screen.getByRole('navigation', { name: 'Mobile institute navigation' });
    const mobileDepartments = within(mobile).getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/institute/departments/'));
    expect(mobileDepartments.map((link) => link.textContent)).toEqual(expectedDepartmentOrder);
  });

  it('builds the required encoded course enquiry mailto', () => {
    const course = 'Electronics Repair & Troubleshooting';
    const href = getCourseEnquiryEmailLink(course);
    const url = new URL(href);
    expect(url.pathname).toBe(INSTITUTE_CONTACT.enrolmentsEmail);
    expect(url.searchParams.get('subject')).toBe(`Course Enquiry - ${course}`);
    expect(url.searchParams.get('body')).toBe(`Hello Techromz Institute,\n\nI would like to request more information about the following course:\n\nCourse: ${course}\n\nMy enquiry:\n\nThank you.`);
  });

  it('shows clickable course-enrolment and general email contacts', async () => {
    render(await ContactPage());
    expect(screen.getByRole('link', { name: 'Choose a course' })).toHaveAttribute('href', '/institute/courses');
    expect(screen.getByRole('link', { name: 'General email' })).toHaveAttribute('href', expect.stringContaining(`mailto:${INSTITUTE_CONTACT.email}`));
  });
});
