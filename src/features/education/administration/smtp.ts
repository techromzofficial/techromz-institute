import 'server-only';
import nodemailer from 'nodemailer';
import type { ContactDelivery } from './contactVerification';
import { APPROVED_SMTP_HOST, APPROVED_SMTP_PORT, APPROVED_SMTP_SENDER, hostingerSmtpTransportOptions } from './smtpRuntime.mjs';

export interface InstituteSmtpConfig { host: string; port: number; user: string; password: string; from: string; secure: true; }
export class InstituteSmtpConfigurationError extends Error {}

export function readInstituteSmtpConfig(environment: NodeJS.ProcessEnv = process.env): InstituteSmtpConfig {
  const host = environment.INSTITUTE_SMTP_HOST?.trim().toLowerCase();
  const port = Number(environment.INSTITUTE_SMTP_PORT);
  const user = environment.INSTITUTE_SMTP_USER?.trim().toLowerCase();
  const password = environment.INSTITUTE_SMTP_PASSWORD;
  const from = environment.INSTITUTE_SMTP_FROM?.trim().toLowerCase();
  const secure = environment.INSTITUTE_SMTP_SECURE;
  if (host !== APPROVED_SMTP_HOST || port !== APPROVED_SMTP_PORT || secure !== 'true') throw new InstituteSmtpConfigurationError('Institute SMTP must use the approved Hostinger TLS endpoint.');
  if (user !== APPROVED_SMTP_SENDER || from !== APPROVED_SMTP_SENDER) throw new InstituteSmtpConfigurationError('Institute SMTP must use the approved enrolments sender.');
  if (!password?.trim()) throw new InstituteSmtpConfigurationError('Missing required server-only SMTP credentials.');
  return { host, port, user, password, from, secure: true };
}

type MailTransport = { sendMail(message: Record<string, unknown>): Promise<{ accepted?: Array<string | { address?: string }>; rejected?: unknown[] }> };
type TransportFactory = (options: Record<string, unknown>) => MailTransport;

export function createSmtpEmailDelivery(config: InstituteSmtpConfig, createTransport: TransportFactory = nodemailer.createTransport as TransportFactory): ContactDelivery {
  const transport = createTransport(hostingerSmtpTransportOptions(config.password));
  return async ({ type, destination, token }) => {
    if (type !== 'email' || !isEmail(destination) || !/^\d{6}$/.test(token)) throw new Error('SMTP_DELIVERY_REJECTED');
    const normalized = destination.trim().toLowerCase();
    const result = await transport.sendMail({
      from: `Techromz Institute <${config.from}>`, to: normalized,
      subject: 'Your Techromz Institute verification code',
      text: verificationText(token), html: verificationHtml(token),
      envelope: { from: config.from, to: [normalized] },
      headers: { 'X-Entity-Ref-ID': 'institute-contact-verification', 'Auto-Submitted': 'auto-generated' },
    });
    const accepted = (result.accepted ?? []).some((entry) => (typeof entry === 'string' ? entry : entry.address)?.toLowerCase() === normalized);
    if (!accepted || (result.rejected?.length ?? 0) > 0) throw new Error('SMTP_DELIVERY_REJECTED');
  };
}

export function getSmtpEmailDelivery(environment: NodeJS.ProcessEnv = process.env): ContactDelivery | null {
  try { return createSmtpEmailDelivery(readInstituteSmtpConfig(environment)); } catch { return null; }
}

function isEmail(value: string) { const email = value.trim(); return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function verificationText(code: string) {
  return `Techromz Institute\n\nYour one-time verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone. Techromz Institute will never ask you to send this code by email or message.\n\nIf you did not request this code, you can ignore this email.\n\nQuestions? Contact info@techromzit.com`;
}
function verificationHtml(code: string) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:600px;margin:0 auto;padding:32px 16px"><div style="background:#ffffff;border:1px solid #dbeafe;border-radius:16px;overflow:hidden"><div style="background:#1d4ed8;padding:24px;color:#ffffff"><strong style="font-size:22px">Techromz Institute</strong></div><div style="padding:32px"><h1 style="margin:0 0 16px;font-size:24px">Verify your email address</h1><p>Use this one-time code to continue your Institute registration:</p><div style="margin:24px 0;padding:18px;border-radius:12px;background:#eff6ff;text-align:center;font-size:34px;font-weight:700;letter-spacing:8px;color:#1d4ed8">${code}</div><p><strong>This code expires in 10 minutes.</strong></p><p>Do not share this code with anyone. Techromz Institute will never ask you to send it by email or message.</p><p>If you did not request this code, you can safely ignore this email.</p><p style="margin-top:28px;color:#475569">Questions? <a href="mailto:info@techromzit.com" style="color:#1d4ed8">info@techromzit.com</a></p></div></div></div></body></html>`;
}
