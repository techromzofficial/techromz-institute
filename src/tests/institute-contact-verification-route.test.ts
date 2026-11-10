import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { consumeSharedRateLimit, createContactChallenge, getSmtpEmailDelivery } = vi.hoisted(() => ({ consumeSharedRateLimit: vi.fn(), createContactChallenge: vi.fn(), getSmtpEmailDelivery: vi.fn() }));
vi.mock('@/features/education/administration/config', () => ({ isInstituteFeatureEnabled: () => true }));
vi.mock('@/features/education/administration/rateLimit', () => ({ isIdentifierRateLimitMode: () => true, consumeSharedRateLimit }));
vi.mock('@/features/education/administration/contactVerification', () => ({ createContactChallenge, ContactChallengeRateLimitError: class extends Error {} }));
vi.mock('@/features/education/administration/smtp', () => ({ getSmtpEmailDelivery }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => ({ test: true }) }));

import { POST } from '@/app/api/institute/contact-verification/challenge/route';

function request(destination = 'learner@example.com', type = 'email', purpose = 'course_enquiry') {
  return new NextRequest('https://techromzit.com/api/institute/contact-verification/challenge', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify({ type, destination, purpose }) });
}

describe('contact verification challenge API', () => {
  beforeEach(() => {
    vi.clearAllMocks(); getSmtpEmailDelivery.mockReturnValue(vi.fn());
    vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com');
    consumeSharedRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    createContactChallenge.mockResolvedValue({ challengeId: '8fa27d53-a458-4fba-a295-7103d610f635' });
  });

  it('uses global, resend, destination and conservative mailbox limits before neutral acceptance', async () => {
    const response = await POST(request());
    expect(response.status).toBe(202); expect(await response.json()).toEqual({ accepted: true, challengeId: '8fa27d53-a458-4fba-a295-7103d610f635', resendAfterSeconds: 60 });
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(consumeSharedRateLimit).toHaveBeenCalledTimes(4);
    expect(createContactChallenge).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ purpose: 'course_enquiry' }));
    expect(consumeSharedRateLimit.mock.calls.map((call) => call[2])).toEqual(expect.arrayContaining([
      expect.objectContaining({ scope: 'contact.challenge.cooldown', maximum: 1, windowSeconds: 60 }),
      expect.objectContaining({ scope: 'contact.challenge.destination24h', maximum: 12, windowSeconds: 86_400 }),
      expect.objectContaining({ scope: 'contact.challenge.mailbox24h', maximum: 45, windowSeconds: 86_400 }),
    ]));
  });

  it('rejects a duplicate request during cooldown without creating or delivering another challenge', async () => {
    consumeSharedRateLimit.mockImplementation(async (_pool, _subject, policy) => policy.scope === 'contact.challenge.cooldown' ? { allowed: false, retryAfterSeconds: 90 } : { allowed: true, retryAfterSeconds: 0 });
    const response = await POST(request());
    expect(response.status).toBe(429); expect(await response.json()).toEqual({ message: 'Verification is temporarily unavailable.' });
    expect(createContactChallenge).not.toHaveBeenCalled(); expect(response.headers.get('retry-after')).toBe('90');
  });

  it('fails closed without SMTP configuration and never supports telephone relay', async () => {
    getSmtpEmailDelivery.mockReturnValue(null);
    const unavailable = await POST(request()); expect(unavailable.status).toBe(503);
    getSmtpEmailDelivery.mockReturnValue(vi.fn());
    const telephone = await POST(request('+94770000000', 'phone')); expect(telephone.status).toBe(400);
    expect(createContactChallenge).not.toHaveBeenCalled();
  });

  it('uses the same accepted response shape for different syntactically valid addresses', async () => {
    const first = await POST(request('known@example.com')); const second = await POST(request('unknown@example.com'));
    expect(first.status).toBe(second.status); expect(await first.json()).toEqual(await second.json());
  });

  it('stops before challenge creation when the shared SMTP mailbox quota is exhausted', async () => {
    consumeSharedRateLimit.mockImplementation(async (_pool, _subject, policy) => policy.scope === 'contact.challenge.mailbox24h'
      ? { allowed: false, retryAfterSeconds: 3600 }
      : { allowed: true, retryAfterSeconds: 0 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('3600');
    expect(createContactChallenge).not.toHaveBeenCalled();
  });
});
