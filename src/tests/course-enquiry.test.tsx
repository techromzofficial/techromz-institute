import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CourseEnquiryButton from '@/features/education/components/CourseEnquiryButton';
import { COURSE_ENQUIRY_RECIPIENT, createCourseEnquiryDelivery, readCourseEnquiryRecipient, validateCourseEnquiry } from '@/features/education/administration/courseEnquiry';
import { readInstituteSmtpConfig } from '@/features/education/administration/smtp';

const smtpEnvironment = { INSTITUTE_SMTP_HOST: 'smtp.hostinger.com', INSTITUTE_SMTP_PORT: '465', INSTITUTE_SMTP_USER: 'enrolments@techromzit.com', INSTITUTE_SMTP_PASSWORD: 'test-only', INSTITUTE_SMTP_FROM: 'enrolments@techromzit.com', INSTITUTE_SMTP_SECURE: 'true' } as unknown as NodeJS.ProcessEnv;

describe('course enquiry delivery', () => {
  const verificationGrant = 'G'.repeat(43), idempotencyKey = '2ed25e4a-37c7-4a65-8ad6-4debdff178f6';
  it('validates required fields and rejects the anti-spam honeypot', () => {
    expect(validateCourseEnquiry({})).toMatchObject({ valid: false });
    expect(validateCourseEnquiry({ fullName: 'Student Name', email: 'student@example.com', courseId: 'electronics-repair-troubleshooting', subject: 'Course details', courseName: 'AI Kickstart', message: 'Please send course details.', website: 'spam', verificationGrant, idempotencyKey })).toMatchObject({ valid: false });
    expect(validateCourseEnquiry({ fullName: 'Student Name', email: 'student@example.com', phone: '+94 77 123 4567', courseId: 'electronics-repair-troubleshooting', subject: 'Course details', courseName: 'AI Kickstart', message: 'Please send course details.', verificationGrant, idempotencyKey })).toMatchObject({ valid: true });
    expect(validateCourseEnquiry({ fullName: 'Student Name', email: 'student@example.com', courseId: 'electronics-repair-troubleshooting', subject: 'Course details', courseName: 'AI Kickstart', message: 'Please send course details.', idempotencyKey })).toMatchObject({ valid: false, message: expect.stringContaining('Verify') });
  });

  it('uses a fixed recipient and sender, validated reply-to and provider acknowledgement', async () => {
    const sendMail = vi.fn(async (_message: Record<string, unknown>) => ({ accepted: [COURSE_ENQUIRY_RECIPIENT], rejected: [] }));
    const deliver = createCourseEnquiryDelivery(readInstituteSmtpConfig(smtpEnvironment), () => ({ sendMail }));
    await deliver({ fullName: 'Student Name', email: 'student@example.com', courseId: 'electronics-repair-troubleshooting', subject: 'Course details', courseName: 'AI Kickstart', message: '<Please> send details.' }, new Date('2026-11-06T10:00:00Z'));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'Techromz Institute <enrolments@techromzit.com>', to: 'enrolments@techromzit.com', replyTo: 'student@example.com', subject: 'New Course Enquiry - AI Kickstart - Student Name', envelope: { from: 'enrolments@techromzit.com', to: ['enrolments@techromzit.com'] } }));
    expect(String(sendMail.mock.calls[0]![0].html)).toContain('&lt;Please&gt;');
    expect(String(sendMail.mock.calls[0]![0].html)).toContain('New Student Course Enquiry');
    expect(String(sendMail.mock.calls[0]![0].text)).toContain('Submission Date:');
  });

  it('fixes the recipient and fails closed for a different configured recipient', () => {
    expect(COURSE_ENQUIRY_RECIPIENT).toBe('enrolments@techromzit.com');
    expect(readCourseEnquiryRecipient({ ADMIN_EMAIL: 'attacker@example.com' } as unknown as NodeJS.ProcessEnv)).toBe(COURSE_ENQUIRY_RECIPIENT);
    expect(() => readCourseEnquiryRecipient({ ENQUIRY_RECIPIENT_EMAIL: 'attacker@example.com' } as unknown as NodeJS.ProcessEnv)).toThrow();
  });

  it('rejects oversized fields, header injection and unsafe reply-to addresses', () => {
    const input = { fullName: 'Student', email: 'student@example.com', courseId: 'ai-course', subject: 'Course details', message: 'Please send more details.', verificationGrant, idempotencyKey };
    for (const changed of [{ fullName: 'Student\r\nBcc: attacker@example.com' }, { subject: 'Course\r\nBcc: attacker@example.com' }, { email: 'student@example.com,attacker@example.com' }, { message: 'x'.repeat(4001) }]) expect(validateCourseEnquiry({ ...input, ...changed }).valid).toBe(false);
  });

  it('opens an accessible form with the selected course and preserves values on failure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ available: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, challengeId: idempotencyKey }), { status: 202, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ verified: true, verificationGrant }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Email service unavailable.' }), { status: 503, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CourseEnquiryButton courseId="electronics-repair-troubleshooting" courseName="Electronics Repair & Troubleshooting" />);
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    expect(screen.getByRole('dialog', { name: 'Email course enquiry' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electronics Repair & Troubleshooting')).toHaveAttribute('readonly');
    fireEvent.input(screen.getByLabelText('Full name'), { target: { value: 'Test Student' } });
    fireEvent.input(screen.getByLabelText('Email address'), { target: { value: 'student@example.com' } });
    fireEvent.input(screen.getByLabelText('Enquiry subject'), { target: { value: 'Course details' } });
    fireEvent.input(screen.getByLabelText('Enquiry message'), { target: { value: 'Please send me more information.' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify Email' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Verify Email' }));
    await screen.findByLabelText('Verification code');
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Full name')).toHaveValue('Test Student');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled());
    vi.unstubAllGlobals();
  });

  it('requires verification and confirms a successful recorded submission', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ available: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, challengeId: idempotencyKey }), { status: 202, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ verified: true, verificationGrant }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, enquiryId: idempotencyKey }), { status: 202, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CourseEnquiryButton courseId="electronics-repair-troubleshooting" courseName="Electronics Repair & Troubleshooting" />);
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    fireEvent.input(screen.getByLabelText('Full name'), { target: { value: 'Test Student' } });
    fireEvent.input(screen.getByLabelText('Email address'), { target: { value: 'student@example.com' } });
    fireEvent.input(screen.getByLabelText('Enquiry subject'), { target: { value: 'Course details' } });
    fireEvent.input(screen.getByLabelText('Enquiry message'), { target: { value: 'Please send me more information.' } });
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify Email' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Verify Email' }));
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByText('Your enquiry was saved and queued for our enrolments team.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith('/api/institute/course-enquiries', expect.objectContaining({ method: 'POST' }));
    vi.unstubAllGlobals();
  });
  it('clears verification on email changes and ignores an in-flight result for the previous email', async () => {
    let finish: (value: Response) => void = () => {};
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ available: true }))
      .mockResolvedValueOnce(Response.json({ accepted: true, challengeId: idempotencyKey }))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { finish = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CourseEnquiryButton courseId="electronics-repair-troubleshooting" courseName="Electronics Repair & Troubleshooting" />);
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    fireEvent.input(screen.getByLabelText('Email address'), { target: { value: 'first@example.com' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify Email' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Verify Email' }));
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '123456' } });
    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));
    fireEvent.input(screen.getByLabelText('Email address'), { target: { value: 'second@example.com' } });
    finish(Response.json({ verified: true, verificationGrant }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify Email' })).toBeEnabled());
    expect(screen.queryByRole('button', { name: 'Email Verified' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeDisabled();
    vi.unstubAllGlobals();
  });

});
