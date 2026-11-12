import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import toast, { Toaster } from 'react-hot-toast';
import notificationStyles from '@/features/education/components/EnquirySuccessNotification.module.css';
import CourseEnquiryButton from '@/features/education/components/CourseEnquiryButton';
import { COURSE_ENQUIRY_RECIPIENT, createCourseEnquiryDelivery, readCourseEnquiryRecipient, validateCourseEnquiry } from '@/features/education/administration/courseEnquiry';
import { readInstituteSmtpConfig } from '@/features/education/administration/smtp';

const smtpEnvironment = { INSTITUTE_SMTP_HOST: 'smtp.hostinger.com', INSTITUTE_SMTP_PORT: '465', INSTITUTE_SMTP_USER: 'enrolments@techromzit.com', INSTITUTE_SMTP_PASSWORD: 'test-only', INSTITUTE_SMTP_FROM: 'enrolments@techromzit.com', INSTITUTE_SMTP_SECURE: 'true' } as unknown as NodeJS.ProcessEnv;

afterEach(() => { toast.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });
beforeEach(() => { vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() })); });

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
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'Techromz Institute <enrolments@techromzit.com>', to: 'enrolments@techromzit.com', replyTo: 'student@example.com', subject: 'New Course Enquiry - AI Kickstart', envelope: { from: 'enrolments@techromzit.com', to: ['enrolments@techromzit.com'] } }));
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

  it('shows a neutral unavailable message and keeps verification and submission disabled when readiness fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json({ available: false })));
    render(<CourseEnquiryButton courseId="electronics-repair-troubleshooting" courseName="Electronics Repair & Troubleshooting" />);
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email enquiries are temporarily unavailable. Please try again later.');
    expect(screen.getByRole('button', { name: 'Verify Email' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeDisabled();
    vi.unstubAllGlobals();
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
    expect(await screen.findByRole('button', { name: 'Enquiry saved' })).toBeDisabled();
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

describe('enquiry success lifecycle', () => {
  async function prepare(response: () => Promise<Response>) {
    const fetchMock = vi.fn(async () => Response.json({ available: true }))
      .mockResolvedValueOnce(Response.json({ available: true }))
      .mockResolvedValueOnce(Response.json({ accepted: true, challengeId: 'challenge' }))
      .mockResolvedValueOnce(Response.json({ verified: true, verificationGrant: 'G'.repeat(43) }))
      .mockImplementationOnce(response);
    vi.stubGlobal('fetch', fetchMock);
    const view = render(<><CourseEnquiryButton courseId="build-your-first-ai-assistant" courseName="AI Kickstart" /><Toaster /></>);
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    for (const [label, value] of [['Full name', 'Test Student'], ['Email address', 'student@example.com'], ['Enquiry subject', 'Course details'], ['Enquiry message', 'Please send me more information.']]) {
      fireEvent.input(screen.getByLabelText(label!), { target: { value } });
    }
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify Email' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Verify Email' }));
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled());
    return { ...view, fetchMock };
  }

  it('shows one global notification after acknowledgement, closes at two seconds and dismisses at four', async () => {
    let finish!: (response: Response) => void;
    const { fetchMock } = await prepare(() => new Promise((resolve) => { finish = resolve; }));
    vi.useFakeTimers();
    const button = screen.getByRole('button', { name: 'Send enquiry' });
    fireEvent.click(button); fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(button).toBeDisabled();
    expect(screen.queryByText('Enquiry Submitted Successfully!')).not.toBeInTheDocument();
    await act(async () => { finish(Response.json({ accepted: true, queued: true, enquiryId: 'saved' }, { status: 202 })); });
    expect(screen.getAllByText('Enquiry Submitted Successfully!')).toHaveLength(1);
    expect(screen.getByText('Thank you for your interest! Your enquiry has been received and queued for our enrolments team. We will contact you soon.')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1999); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email enquiry' })).toHaveFocus();
    expect(screen.getByText('Enquiry Submitted Successfully!')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('Enquiry Submitted Successfully!').closest('[role="status"]')).toHaveClass(notificationStyles.hidden!);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByText('Enquiry Submitted Successfully!')).not.toBeInTheDocument();
  });

  it('cleans up the close timer when manually closed and reopened', async () => {
    await prepare(async () => Response.json({ accepted: true, queued: true }));
    vi.useFakeTimers();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' })); });
    fireEvent.click(screen.getByRole('button', { name: 'Close enquiry form' }));
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    expect(screen.getByLabelText('Full name')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeDisabled();
    await act(async () => { vi.advanceTimersByTime(2500); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.each(['network', 'rejected', 'unaccepted', 'invalid-json'])('preserves values and allows retry after %s failure', async (failure) => {
    await prepare(async () => {
      if (failure === 'network') throw new Error('Network unavailable');
      if (failure === 'invalid-json') return new Response('invalid', { status: 200 });
      return Response.json({ accepted: failure === 'rejected', message: 'Please retry.' }, { status: failure === 'rejected' ? 503 : 200 });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Full name')).toHaveValue('Test Student');
    expect(screen.getByLabelText('Enquiry message')).toHaveValue('Please send me more information.');
    expect(screen.queryByText('Enquiry Submitted Successfully!')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
    vi.useFakeTimers();
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('ignores a late response after unmount', async () => {
    let finish!: (response: Response) => void;
    const { unmount } = await prepare(() => new Promise((resolve) => { finish = resolve; }));
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    unmount();
    await act(async () => { finish(Response.json({ accepted: true, queued: true })); });
    render(<Toaster />);
    expect(screen.queryByText('Enquiry Submitted Successfully!')).not.toBeInTheDocument();
  });

  it('ignores the previous course response after switching and opening a new enquiry', async () => {
    let finish!: (response: Response) => void;
    const { rerender } = await prepare(() => new Promise((resolve) => { finish = resolve; }));
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    rerender(<><CourseEnquiryButton courseId="build-an-ai-knowledge-assistant" courseName="AI Knowledge Lab" /><Toaster /></>);
    fireEvent.click(screen.getByRole('button', { name: 'Email enquiry' }));
    await act(async () => { finish(Response.json({ accepted: true, queued: true })); });
    expect(screen.getByDisplayValue('AI Knowledge Lab')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveValue('');
    expect(screen.queryByText('Enquiry Submitted Successfully!')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeDisabled();
    vi.useFakeTimers();
    await act(async () => { vi.advanceTimersByTime(2500); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
