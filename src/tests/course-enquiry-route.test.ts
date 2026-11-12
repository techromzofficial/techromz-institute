import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deliver: vi.fn(), record: vi.fn(), mark: vi.fn(), rateLimit: vi.fn(), storageReady: vi.fn(), featureEnabled: true,
}));
vi.mock('@/features/education/administration/config', () => ({ isInstituteFeatureEnabled: () => mocks.featureEnabled }));
vi.mock('@/features/education/administration/courseEnquiry', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/features/education/administration/courseEnquiry')>()), getCourseEnquiryDelivery: () => mocks.deliver }));
vi.mock('@/features/education/administration/courseEnquiryStore', () => ({ CourseEnquiryVerificationRequiredError: class extends Error {}, CourseEnquiryIdempotencyConflictError: class extends Error {}, recordCourseEnquiry: mocks.record, markCourseEnquiryNotification: mocks.mark, isCourseEnquiryStorageReady: mocks.storageReady }));
vi.mock('@/features/education/administration/rateLimit', () => ({ isIdentifierRateLimitMode: () => true, consumeSharedRateLimit: mocks.rateLimit }));
vi.mock('@/features/education/administration/requestSecurity', () => ({ isAllowedSensitiveRequest: () => true, unverifiedClientIp: () => null, isAllowedHostsConfigurationReady: () => true }));
vi.mock('@/features/education/administration/enquirySession', () => ({ readEnquirySession: () => 'fixture-server-session' }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => ({ pool: true }) }));

const input = { fullName: 'Test Student', email: 'student@example.com', phone: '+94 77 123 4567', courseId: 'electronics-repair-troubleshooting', subject: 'Course details', courseName: 'Electronics Repair & Troubleshooting', message: 'Please send the course details.', verificationGrant: 'G'.repeat(43), idempotencyKey: '2ed25e4a-37c7-4a65-8ad6-4debdff178f6' };

describe('course enquiry API orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.featureEnabled = true;
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.storageReady.mockResolvedValue(false);
    mocks.record.mockResolvedValue({ enquiryId: 'enquiry-id', duplicate: false, notificationStatus: 'pending', enquiry: input });
    mocks.deliver.mockResolvedValue(undefined); mocks.mark.mockResolvedValue(undefined);
    vi.stubEnv('INSTITUTE_ENQUIRY_WORKER_SECRET', 'W'.repeat(32));
    vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com');
  });

  it('reports unavailable without a database connection', async () => {
    const { GET } = await import('@/app/api/institute/course-enquiries/route');
    const response = await GET();
    expect(await response.json()).toEqual({ available: false });
  });
  it('does not require an unauthenticated IP header for readiness when primary prerequisites pass', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('INSTITUTE_TRUSTED_CLIENT_IP_HEADER', undefined);
    vi.stubEnv('INSTITUTE_PII_ENCRYPTION_KEY', Buffer.alloc(32, 1).toString('base64'));
    vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', Buffer.alloc(32, 2).toString('base64'));
    vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', Buffer.alloc(32, 3).toString('base64'));
    mocks.storageReady.mockResolvedValue(true);
    try {
      const { GET } = await import('@/app/api/institute/course-enquiries/route');
      expect(await (await GET()).json()).toEqual({ available: true });
    } finally { vi.unstubAllEnvs(); }
  });
  it('fails readiness and submission closed for an invalid OTP policy or unusable worker secret', async () => {
    const { GET, POST } = await import('@/app/api/institute/course-enquiries/route');
    mocks.storageReady.mockResolvedValue(true);
    vi.stubEnv('INSTITUTE_PII_ENCRYPTION_KEY', Buffer.alloc(32, 1).toString('base64'));
    vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', Buffer.alloc(32, 2).toString('base64'));
    vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', Buffer.alloc(32, 3).toString('base64'));
    for (const changes of [{ OTP_EXPIRY_MINUTES: '0', INSTITUTE_ENQUIRY_WORKER_SECRET: 'W'.repeat(32) }, { OTP_EXPIRY_MINUTES: '5', INSTITUTE_ENQUIRY_WORKER_SECRET: ' '.repeat(32) }]) {
      vi.stubEnv('OTP_EXPIRY_MINUTES', changes.OTP_EXPIRY_MINUTES);
      vi.stubEnv('INSTITUTE_ENQUIRY_WORKER_SECRET', changes.INSTITUTE_ENQUIRY_WORKER_SECRET);
      expect(await (await GET()).json()).toEqual({ available: false });
      const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
      expect((await POST(request)).status).toBe(503);
    }
    expect(mocks.record).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it('returns the safe unavailable message and does not process submissions while the feature flag is off', async () => {
    mocks.featureEnabled = false;
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify(input) });
    const response = await POST(request);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ message: 'Email enquiries are temporarily unavailable. Please try again later.' });
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it('records and queues the enquiry without sending in the request', async () => {
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify(input) });
    const response = await POST(request);
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ accepted: true, enquiryId: 'enquiry-id' });
    expect(mocks.deliver).not.toHaveBeenCalled(); expect(mocks.record).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ courseName: input.courseName }), 'fixture-server-session');
  });

  it('does not send a second notification for an idempotent replay', async () => {
    mocks.record.mockResolvedValue({ enquiryId: 'enquiry-id', duplicate: true, notificationStatus: 'notified', enquiry: input });
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify(input) });
    const response = await POST(request);
    expect(response.status).toBe(200); expect(await response.json()).toMatchObject({ accepted: true, duplicate: true });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it('resolves the authoritative title from the course ID, ignoring a forged client title', async () => {
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify({ ...input, courseName: 'Forged title' }) });
    expect((await POST(request)).status).toBe(202);
    expect(mocks.record).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ courseName: input.courseName }), 'fixture-server-session');
  });

  it('rejects a course ID that is not in the published catalogue', async () => {
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify({ ...input, courseId: 'unpublished-or-forged', subject: 'Course details', courseName: 'Unpublished or forged course' }) });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Select a currently published course.' });
    expect(mocks.record).not.toHaveBeenCalled();
    expect(mocks.deliver).not.toHaveBeenCalled();
  });
});
