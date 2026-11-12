import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ pool: {}, getPool: vi.fn(), getDelivery: vi.fn(), dispatch: vi.fn() }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: mocks.getPool }));
vi.mock('@/features/education/administration/courseEnquiry', () => ({ getCourseEnquiryDelivery: mocks.getDelivery }));
vi.mock('@/features/education/administration/courseEnquiryDelivery', () => ({ dispatchCourseEnquiries: mocks.dispatch }));
import { POST } from '@/app/api/institute/course-enquiries/delivery/route';

const secret = 'fixture-worker-secret-' + 'W'.repeat(32);
const request = (authorization?: string) => new NextRequest('https://staging.example.com/api/institute/course-enquiries/delivery', {
  method: 'POST', headers: authorization ? { authorization } : {},
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('INSTITUTE_ENQUIRY_WORKER_SECRET', secret);
  vi.stubEnv('INSTITUTE_COURSE_ENQUIRY_ENABLED', 'true');
  mocks.getPool.mockReturnValue(mocks.pool);
  mocks.getDelivery.mockReturnValue(vi.fn());
  mocks.dispatch.mockResolvedValue({ acceptedBySmtp: 1, retryScheduled: 0, failed: 0 });
});
afterEach(() => vi.unstubAllEnvs());

describe('scheduled enquiry worker authentication with isolated doubles', () => {
  it.each(['', 'Basic wrong', 'Bearer wrong', `Bearer ${'X'.repeat(secret.length)}`])('rejects absent or wrong authorization before any mail/database work', async authorization => {
    const response = await POST(request(authorization));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized.' });
    expect(mocks.getPool).not.toHaveBeenCalled(); expect(mocks.getDelivery).not.toHaveBeenCalled(); expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it.each(['', 'weak', ' '.repeat(32)])('fails closed for missing/invalid configured credentials', async configured => {
    vi.stubEnv('INSTITUTE_ENQUIRY_WORKER_SECRET', configured);
    expect((await POST(request(`Bearer ${secret}`))).status).toBe(401);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it('does not accept credentials supplied in a query string or cookie', async () => {
    const req = new NextRequest('https://staging.example.com/api/institute/course-enquiries/delivery?token=fixture', { method: 'POST', headers: { cookie: `worker=${secret}` } });
    expect((await POST(req)).status).toBe(401); expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it('keeps delivery disabled with valid credentials when the feature flag is off', async () => {
    vi.stubEnv('INSTITUTE_COURSE_ENQUIRY_ENABLED', 'false');
    expect((await POST(request(`Bearer ${secret}`))).status).toBe(503);
    expect(mocks.getDelivery).not.toHaveBeenCalled(); expect(mocks.getPool).not.toHaveBeenCalled();
  });
  it('dispatches only after authentication, enabled feature and mail configuration pass', async () => {
    const response = await POST(request(`Bearer ${secret}`));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.pool, expect.any(Function), 5);
    expect(JSON.stringify(await response.json())).not.toContain(secret);
  });
  it('handles unavailable SMTP and database errors without leaking credentials or driver errors', async () => {
    mocks.getDelivery.mockReturnValueOnce(null);
    expect((await POST(request(`Bearer ${secret}`))).status).toBe(503);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      mocks.dispatch.mockRejectedValueOnce(new Error(`private ${secret}`));
      const response = await POST(request(`Bearer ${secret}`));
      expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toContain(secret);
      expect(log).toHaveBeenCalledWith('[course-enquiry] delivery worker database failure');
    } finally { log.mockRestore(); }
  });
});
