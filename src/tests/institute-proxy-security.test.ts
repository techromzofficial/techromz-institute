import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { consumeSharedRateLimit, pool, getSmtpEmailDelivery } = vi.hoisted(() => ({
  consumeSharedRateLimit: vi.fn(async (..._args: unknown[]) => ({ allowed: true, retryAfterSeconds: 0 })),
  pool: { test: true },
  getSmtpEmailDelivery: vi.fn(() => vi.fn()),
}));
vi.mock('@/features/education/administration/rateLimit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/education/administration/rateLimit')>();
  return { ...actual, consumeSharedRateLimit };
});
vi.mock('@/features/education/administration/config', () => ({ isInstituteFeatureEnabled: () => true, requireInstituteFeature: vi.fn() }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => pool }));
vi.mock('@/features/education/administration/smtp', () => ({ getSmtpEmailDelivery }));
vi.mock('@/features/education/administration/contactVerification', () => ({
  ContactChallengeRateLimitError: class extends Error {},
  createContactChallenge: vi.fn(async () => ({ challengeId: '8fa27d53-a458-4fba-a295-7103d610f635' })),
  verifyContactChallenge: vi.fn(async () => ({ verified: false })),
}));
vi.mock('@/features/education/administration/registrations', () => ({
  createRegistration: vi.fn(async () => ({ registrationId: 'registration' })),
  DuplicateRegistrationError: class extends Error {}, IntakeRegistrationClosedError: class extends Error {}, RegistrationRateLimitedError: class extends Error {},
}));
vi.mock('@/features/education/administration/auth', () => ({
  authenticateAdmin: vi.fn(async () => null), ADMIN_CSRF_COOKIE: '__Host-tit_admin', ADMIN_SESSION_COOKIE: '__Host-tit_csrf',
}));
vi.mock('@/features/education/certificates/server', () => ({ getCertificateRepository: () => null }));

import { POST as challenge } from '@/app/api/institute/contact-verification/challenge/route';
import { POST as verifyContact } from '@/app/api/institute/contact-verification/verify/route';
import { POST as login } from '@/app/api/institute/admin/auth/login/route';
import { POST as verifyCertificate } from '@/app/api/institute/certificates/verify/route';
import { POST as register } from '@/app/api/institute/registrations/route';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';

const standardHeaders = { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com', 'x-real-ip': '203.0.113.77', 'x-forwarded-for': '198.51.100.9, 203.0.113.77' };
function post(path: string, body: object, headers: Record<string, string> = standardHeaders) {
  return new NextRequest(`https://techromzit.com${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
}
function limiterCalls() {
  return consumeSharedRateLimit.mock.calls.map((call) => [call[1], (call[2] as { scope: string }).scope]);
}

describe('IP-independent Hostinger abuse protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'identifier-and-global');
    vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com,www.techromzit.com');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('rejects missing or mismatched host/origin without treating proxy headers as authority', () => {
    expect(isAllowedSensitiveRequest(post('/', {}))).toBe(true);
    expect(isAllowedSensitiveRequest(post('/', {}, { ...standardHeaders, host: 'origin-host.example' }))).toBe(false);
    expect(isAllowedSensitiveRequest(post('/', {}, { ...standardHeaders, origin: 'https://evil.example' }))).toBe(false);
    const { origin: _origin, ...withoutOrigin } = standardHeaders;
    expect(isAllowedSensitiveRequest(post('/', {}, withoutOrigin))).toBe(false);
  });

  it('uses identical global and certificate-ID buckets when proxy headers rotate or disappear', async () => {
    const body = { certificateId: 'TIT-ABCDEFGHJKLMNPQRSTUVWXY2' };
    await verifyCertificate(post('/api/institute/certificates/verify', body));
    await verifyCertificate(post('/api/institute/certificates/verify', body, { ...standardHeaders, 'x-real-ip': '192.0.2.200', 'x-forwarded-for': '192.0.2.201' }));
    const { 'x-real-ip': _real, 'x-forwarded-for': _forwarded, ...withoutProxy } = standardHeaders;
    await verifyCertificate(post('/api/institute/certificates/verify', body, withoutProxy));
    expect(limiterCalls()).toEqual([
      ['global', 'certificate.lookup.global'], [body.certificateId, 'certificate.lookup.identifier'],
      ['global', 'certificate.lookup.global'], [body.certificateId, 'certificate.lookup.identifier'],
      ['global', 'certificate.lookup.global'], [body.certificateId, 'certificate.lookup.identifier'],
    ]);
  });

  it('layers destination, mailbox and global challenge limits independently of forged IPs', async () => {
    await challenge(post('/api/institute/contact-verification/challenge', { type: 'email', destination: 'Learner@example.com', purpose: 'course_enquiry', courseId: 'electronics-repair-troubleshooting' }));
    expect(limiterCalls()).toEqual([
      ['global', 'contact.challenge.global'], ['learner@example.com', 'contact.challenge.cooldown'],
      ['learner@example.com', 'contact.challenge.destination24h'], ['enrolments-mailbox', 'contact.challenge.mailbox24h'],
    ]);
  });

  it('uses challenge and account identifiers plus shared global limits', async () => {
    const challengeId = '8fa27d53-a458-4fba-a295-7103d610f635';
    await verifyContact(post('/api/institute/contact-verification/verify', { challengeId, token: '123456', purpose: 'course_enquiry', courseId: 'electronics-repair-troubleshooting' }, { ...standardHeaders, cookie: `institute_enquiry_session=${'S'.repeat(43)}` }));
    await login(post('/api/institute/admin/auth/login', { username: 'admin.user', password: 'not-a-real-password' }));
    expect(limiterCalls()).toEqual([
      ['global', 'contact.verify.global'], [challengeId, 'contact.verify.challenge'],
      ['global', 'admin.login.global'], ['admin.user', 'admin.login.account'],
    ]);
  });

  it('retains a shared registration limit when callers rotate email and forged IP values', async () => {
    const base = { fullName: 'Approved Learner', intakeId: '9b49fd03-36d5-4fe2-98d8-c62eb45a6f14', consent: true };
    await register(post('/api/institute/registrations', { ...base, email: 'first@example.com', verificationGrant: 'A'.repeat(43) }));
    await register(post('/api/institute/registrations', { ...base, email: 'second@example.com', verificationGrant: 'B'.repeat(43) }, { ...standardHeaders, 'x-real-ip': '192.0.2.44' }));
    expect(limiterCalls()).toEqual([
      ['global', 'registration.global'], ['first@example.com', 'registration.email'], ['A'.repeat(43), 'registration.grant'],
      ['global', 'registration.global'], ['second@example.com', 'registration.email'], ['B'.repeat(43), 'registration.grant'],
    ]);
  });

  it('fails closed before database work when identifier/global mode is disabled', async () => {
    vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'disabled');
    expect((await verifyCertificate(post('/api/institute/certificates/verify', { certificateId: 'TIT-ABCDEFGHJKLMNPQRSTUVWXY2' }))).status).toBe(503);
    expect(consumeSharedRateLimit).not.toHaveBeenCalled();
  });
});
