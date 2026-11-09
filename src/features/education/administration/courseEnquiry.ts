import 'server-only';
import nodemailer from 'nodemailer';
import { APPROVED_SMTP_SENDER, hostingerSmtpTransportOptions } from './smtpRuntime.mjs';
import { readInstituteSmtpConfig, type InstituteSmtpConfig } from './smtp';

export const COURSE_ENQUIRY_RECIPIENT = 'sriyanf@techromz.lk';

export type CourseEnquiry = { fullName: string; email: string; phone?: string; courseName: string; message: string };
export type VerifiedCourseEnquiry = CourseEnquiry & { verificationGrant: string; idempotencyKey: string };
type MailTransport = { sendMail(message: Record<string, unknown>): Promise<{ accepted?: Array<string | { address?: string }>; rejected?: unknown[] }> };
type TransportFactory = (options: Record<string, unknown>) => MailTransport;

export function validateCourseEnquiry(value: unknown): { valid: true; value: VerifiedCourseEnquiry } | { valid: false; message: string } {
  if (!value || typeof value !== 'object') return { valid: false, message: 'Enter the required enquiry details.' };
  const input = value as Record<string, unknown>;
  const fullName = clean(input.fullName, 100), email = clean(input.email, 254).toLowerCase();
  const phone = clean(input.phone, 40), courseName = clean(input.courseName, 160), message = cleanMultiline(input.message, 4000);
  const verificationGrant = clean(input.verificationGrant, 64), idempotencyKey = clean(input.idempotencyKey, 64);
  if (typeof input.website === 'string' && input.website.trim()) return { valid: false, message: 'Unable to submit this enquiry.' };
  if (fullName.length < 2) return { valid: false, message: 'Enter your full name.' };
  if (!isEmail(email)) return { valid: false, message: 'Enter a valid email address.' };
  if (!courseName || /[\r\n]/.test(courseName)) return { valid: false, message: 'Select a valid course.' };
  if (phone && !/^[+()\-\s0-9]{7,40}$/.test(phone)) return { valid: false, message: 'Enter a valid phone number or leave it blank.' };
  if (message.length < 10) return { valid: false, message: 'Enter an enquiry message of at least 10 characters.' };
  if (!/^[A-Za-z0-9_-]{43}$/.test(verificationGrant)) return { valid: false, message: 'Verify your email address before sending the enquiry.' };
  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) return { valid: false, message: 'Refresh the form and try again.' };
  return { valid: true, value: { fullName, email, ...(phone ? { phone } : {}), courseName, message, verificationGrant, idempotencyKey } };
}

export function createCourseEnquiryDelivery(
  config: InstituteSmtpConfig,
  createTransport: TransportFactory = nodemailer.createTransport as TransportFactory,
  recipient = readCourseEnquiryRecipient(),
) {
  const transport = createTransport(hostingerSmtpTransportOptions(config.password));
  return async (enquiry: CourseEnquiry, submittedAt = new Date()) => {
    const subject = `New Course Enquiry - ${enquiry.courseName}`;
    const submittedAtDisplay = submittedAt.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'long', timeZone: 'Asia/Colombo' });
    const lines = ['New Student Course Enquiry', '', 'Hello Admin,', '', 'You have received a new course enquiry through your website.', '', 'Student Details:', `Full Name: ${enquiry.fullName}`, `Email Address: ${enquiry.email}`, `Phone Number: ${enquiry.phone || 'Not provided'}`, `Interested Course: ${enquiry.courseName}`, '', 'Enquiry Message:', enquiry.message, '', `Submission Date: ${submittedAtDisplay}`, '', 'Please contact the student as soon as possible.', '', 'Best Regards,', 'Course Registration Website'];
    const result = await transport.sendMail({
      from: `Techromz Institute <${config.from}>`, to: recipient,
      replyTo: enquiry.email, subject, text: lines.join('\n'), html: enquiryHtml(enquiry, submittedAtDisplay),
      envelope: { from: config.from, to: [recipient] },
      headers: { 'X-Entity-Ref-ID': 'institute-course-enquiry' },
    });
    const accepted = (result.accepted ?? []).some((entry) => (typeof entry === 'string' ? entry : entry.address)?.toLowerCase() === recipient);
    if (!accepted || (result.rejected?.length ?? 0) > 0) throw new Error('SMTP_DELIVERY_REJECTED');
  };
}

export function getCourseEnquiryDelivery(environment: NodeJS.ProcessEnv = process.env) {
  try { return createCourseEnquiryDelivery(readInstituteSmtpConfig(environment), nodemailer.createTransport as TransportFactory, readCourseEnquiryRecipient(environment)); } catch { return null; }
}

export function readCourseEnquiryRecipient(environment: NodeJS.ProcessEnv = process.env): string {
  const recipient = (environment.ADMIN_EMAIL || COURSE_ENQUIRY_RECIPIENT).trim().toLowerCase();
  if (!isEmail(recipient) || /[\r\n]/.test(recipient)) throw new Error('Invalid course enquiry recipient configuration.');
  return recipient;
}

function clean(value: unknown, maximum: number) { return typeof value === 'string' ? value.trim().slice(0, maximum) : ''; }
function cleanMultiline(value: unknown, maximum: number) { return clean(value, maximum).replace(/\r\n?/g, '\n'); }
function isEmail(value: string) { return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!); }
function enquiryHtml(enquiry: CourseEnquiry, submittedAt: string) {
  const row = (label: string, value: string) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0">${label}</th><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:640px;margin:0 auto;padding:32px 16px"><div style="overflow:hidden;border:1px solid #dbeafe;border-radius:16px;background:#fff"><div style="padding:24px;background:#1d4ed8;color:#fff"><strong style="font-size:22px">Techromz Institute</strong></div><div style="padding:28px"><h1 style="margin-top:0;font-size:24px">New Student Course Enquiry</h1><p>Hello Admin,</p><p>You have received a new course enquiry through your website.</p><h2 style="margin-top:24px;font-size:18px">Student Details</h2><table style="width:100%;border-collapse:collapse">${row('Full Name', enquiry.fullName)}${row('Email Address', enquiry.email)}${row('Phone Number', enquiry.phone || 'Not provided')}${row('Interested Course', enquiry.courseName)}${row('Submission Date', submittedAt)}</table><h2 style="margin-top:24px;font-size:18px">Enquiry Message</h2><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(enquiry.message)}</p><p>Please contact the student as soon as possible.</p><p>Best Regards,<br />Course Registration Website</p></div></div></div></body></html>`;
}
