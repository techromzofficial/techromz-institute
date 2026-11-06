import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deliver: vi.fn(), record: vi.fn(), mark: vi.fn(), rateLimit: vi.fn(), storageReady: vi.fn(),
}));
vi.mock('@/features/education/administration/config', () => ({ isInstituteFeatureEnabled: () => true }));
vi.mock('@/features/education/administration/courseEnquiry', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/features/education/administration/courseEnquiry')>()), getCourseEnquiryDelivery: () => mocks.deliver }));
vi.mock('@/features/education/administration/courseEnquiryStore', () => ({ CourseEnquiryVerificationRequiredError: class extends Error {}, recordCourseEnquiry: mocks.record, markCourseEnquiryNotification: mocks.mark, isCourseEnquiryStorageReady: mocks.storageReady }));
vi.mock('@/features/education/administration/rateLimit', () => ({ isIdentifierRateLimitMode: () => true, consumeSharedRateLimit: mocks.rateLimit }));
vi.mock('@/features/education/administration/requestSecurity', () => ({ isAllowedSensitiveRequest: () => true }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => ({ pool: true }) }));

const input = { fullName: 'Test Student', email: 'student@example.com', phone: '+94 77 123 4567', courseName: 'Electronics Repair & Troubleshooting', message: 'Please send the course details.', verificationGrant: 'G'.repeat(43), idempotencyKey: '2ed25e4a-37c7-4a65-8ad6-4debdff178f6' };

describe('course enquiry API orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.storageReady.mockResolvedValue(false);
    mocks.record.mockResolvedValue({ enquiryId: 'enquiry-id', duplicate: false, notificationStatus: 'pending', enquiry: input });
    mocks.deliver.mockResolvedValue(undefined); mocks.mark.mockResolvedValue(undefined);
    vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com');
  });

  it('reports unavailable without a database connection', async () => {
    const { GET } = await import('@/app/api/institute/course-enquiries/route');
    const response = await GET();
    expect(await response.json()).toEqual({ available: false });
  });

  it('records, sends one mocked notification and confirms success', async () => {
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify(input) });
    const response = await POST(request);
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ accepted: true, enquiryId: 'enquiry-id' });
    expect(mocks.deliver).toHaveBeenCalledOnce(); expect(mocks.mark).toHaveBeenCalledWith(expect.anything(), 'enquiry-id', true);
  });

  it('does not send a second notification for an idempotent replay', async () => {
    mocks.record.mockResolvedValue({ enquiryId: 'enquiry-id', duplicate: true, notificationStatus: 'notified', enquiry: input });
    const { POST } = await import('@/app/api/institute/course-enquiries/route');
    const request = new NextRequest('https://techromzit.com/api/institute/course-enquiries', { method: 'POST', headers: { 'content-type': 'application/json', host: 'techromzit.com', origin: 'https://techromzit.com' }, body: JSON.stringify(input) });
    const response = await POST(request);
    expect(response.status).toBe(200); expect(await response.json()).toMatchObject({ accepted: true, duplicate: true });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });
});
