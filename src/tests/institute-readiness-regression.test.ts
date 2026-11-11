import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readOtpPolicy } from '@/features/education/administration/otpPolicy';
import { sensitiveRequestFailure } from '@/features/education/administration/requestSecurity';
import { enquiryCourseContext } from '@/features/education/administration/enquirySession';

const mocks = vi.hoisted(() => ({ limit: vi.fn(), lookup: vi.fn() }));
vi.mock('@/features/education/administration/rateLimit', async (original) => ({
  ...await original<typeof import('@/features/education/administration/rateLimit')>(), consumeSharedRateLimit: mocks.limit,
}));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => ({}) }));
vi.mock('@/features/education/certificates/server', () => ({ getCertificateRepository: () => ({ findPublicByCertificateId: mocks.lookup }) }));
import { POST } from '@/app/api/institute/certificates/verify/route';

function request(certificateId = 'INVALID', url = 'https://techromzit.com', headers = {}) {
  return new NextRequest(`${url}/api/institute/certificates/verify`, { method: 'POST', headers: {
    host: 'techromzit.com', origin: 'https://techromzit.com', 'content-type': 'application/json', ...headers,
  }, body: JSON.stringify({ certificateId }) });
}
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com,www.techromzit.com');
  vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'identifier-and-global');
  mocks.limit.mockReset().mockResolvedValue({ allowed: true });
  mocks.lookup.mockReset().mockResolvedValue(null);
});
afterEach(() => vi.unstubAllEnvs());

describe('release security guards', () => {
  it('reaches malformed-ID validation without a database dependency', async () => {
    expect((await POST(request())).status).toBe(400);
    expect(mocks.limit).not.toHaveBeenCalled();
  });
  it('keeps internal HTTP fail-closed despite forged forwarded HTTPS headers', async () => {
    const req = request('INVALID', 'http://techromzit.com', { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'techromzit.com', forwarded: 'host=techromzit.com;proto=https' });
    expect(sensitiveRequestFailure(req)).toBe('https_required');
    expect((await POST(req)).status).toBe(503);
    expect(mocks.limit).not.toHaveBeenCalled();
  });
  it('rejects unauthorized hosts, origins and malformed host configuration', async () => {
    for (const headers of [{ host: 'evil.example' }, { origin: 'https://evil.example' }, { origin: 'https://techromzit.com/path' }, { 'sec-fetch-site': 'cross-site' }]) {
      expect((await POST(request('INVALID', undefined, headers))).status).toBe(503);
    }
    vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com,https://evil.example');
    expect(sensitiveRequestFailure(request())).toBe('allowed_hosts_configuration');
  });
  it('returns not-found and preserves both durable rate-limit buckets', async () => {
    const res = await POST(request('TIT-ABCDEFGHJKLMNPQRSTUVWXY2'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ outcome: 'not_found' });
    expect(mocks.limit).toHaveBeenCalledTimes(2);
    mocks.limit.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
    expect((await POST(request('TIT-ABCDEFGHJKLMNPQRSTUVWXY2'))).status).toBe(429);
  });
  it('returns controlled unavailability for rate-limit or repository storage failure', async () => {
    mocks.limit.mockRejectedValue(new Error('private database details'));
    expect((await POST(request('TIT-ABCDEFGHJKLMNPQRSTUVWXY2'))).status).toBe(503);
    mocks.limit.mockResolvedValue({ allowed: true });
    mocks.lookup.mockRejectedValue(new Error('private database details'));
    const res = await POST(request('TIT-ABCDEFGHJKLMNPQRSTUVWXY2'));
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain('private database details');
  });
  it('logs only a fixed failure reason when operator diagnostics are enabled', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      vi.stubEnv('INSTITUTE_SECURITY_DIAGNOSTICS', 'true');
      vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'unknown');
      await POST(request());
      expect(spy).toHaveBeenCalledWith('[certificate-verification]', { reason: 'abuse_mode_configuration' });
    } finally { spy.mockRestore(); }
  });
  it('separates verification contexts across courses and browser sessions', () => {
    expect(enquiryCourseContext('session-a', 'course-a')).not.toBe(enquiryCourseContext('session-a', 'course-b'));
    expect(enquiryCourseContext('session-a', 'course-a')).not.toBe(enquiryCourseContext('session-b', 'course-a'));
  });
});

describe('bounded runtime OTP policy', () => {
  it('uses secure defaults and accepts stricter operator policy', () => {
    expect(readOtpPolicy({} as NodeJS.ProcessEnv)).toEqual({ expiryMinutes: 5, maxAttempts: 5, resendCooldownSeconds: 60 });
    expect(readOtpPolicy({ OTP_EXPIRY_MINUTES: '3', OTP_MAX_ATTEMPTS: '2', OTP_RESEND_COOLDOWN_SECONDS: '90' } as unknown as NodeJS.ProcessEnv)).toEqual({ expiryMinutes: 3, maxAttempts: 2, resendCooldownSeconds: 90 });
  });
  it('fails closed for missing numeric content, zero and unsafe settings', () => {
    for (const [key, values] of Object.entries({ OTP_EXPIRY_MINUTES: ['', '0', '11', '5.5'], OTP_MAX_ATTEMPTS: ['0', '6', 'NaN'], OTP_RESEND_COOLDOWN_SECONDS: ['59', '901', '-1'] })) {
      for (const value of values) expect(() => readOtpPolicy({ [key]: value } as NodeJS.ProcessEnv)).toThrow('INVALID_OTP_POLICY');
    }
  });
});
