import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearLocalCourseEnquiryState,
  createLocalCourseEnquiryChallenge,
  isLocalCourseEnquiryRequest,
  isLocalCourseEnquiryTestMode,
  listLocalCourseEnquiryOutbox,
  recordLocalCourseEnquiry,
  verifyLocalCourseEnquiryCode,
} from '@/features/education/administration/localCourseEnquiry';

afterEach(() => {
  clearLocalCourseEnquiryState();
  vi.unstubAllEnvs();
});

describe('local-only course enquiry test mode', () => {
  it('requires explicit non-production opt-in and accepts loopback or same-origin private LAN requests', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('INSTITUTE_COURSE_ENQUIRY_LOCAL_TEST_MODE', 'true');
    expect(isLocalCourseEnquiryTestMode()).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://localhost:3000/api/test', {
      headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://localhost:3000/api/test', {
      headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://192.168.1.10:3000/api/test', {
      headers: { host: '192.168.1.10:3000', origin: 'http://192.168.1.10:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://localhost:3000/api/test', {
      headers: { host: '192.168.1.10:3000', origin: 'http://192.168.1.10:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://localhost/api/test', {
      headers: { host: '192.168.1.10:3000', origin: 'http://192.168.1.10:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://0.0.0.0:3000/api/test', {
      headers: { host: '192.168.1.10:3000', origin: 'http://192.168.1.10:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://172.20.1.10:3000/api/test', {
      headers: { host: '172.20.1.10:3000', origin: 'http://172.20.1.10:3000' },
    }))).toBe(true);
    expect(isLocalCourseEnquiryRequest(new Request('http://8.8.8.8:3000/api/test', {
      headers: { host: '8.8.8.8:3000', origin: 'http://8.8.8.8:3000' },
    }))).toBe(false);
    expect(isLocalCourseEnquiryRequest(new Request('http://192.168.1.10:3000/api/test', {
      headers: { host: '192.168.1.11:3000', origin: 'http://192.168.1.10:3000' },
    }))).toBe(false);
    vi.stubEnv('NODE_ENV', 'production');
    expect(isLocalCourseEnquiryTestMode()).toBe(false);
  });

  it('verifies a short-lived hashed code, binds a single-use grant to the email, and captures the enquiry', () => {
    const now = 1_800_000_000_000;
    const challenge = createLocalCourseEnquiryChallenge('student@example.com', now);
    const verification = verifyLocalCourseEnquiryCode(challenge.challengeId, challenge.developmentCode, now + 1_000);
    expect(verification.verified).toBe(true);
    expect(verifyLocalCourseEnquiryCode(challenge.challengeId, challenge.developmentCode, now + 2_000).verified).toBe(false);
    const entry = {
      fullName: 'Test Student',
      email: 'student@example.com',
      courseName: 'Electronics Repair & Troubleshooting',
      message: 'Please send the course details.',
      verificationGrant: verification.verificationGrant!,
      idempotencyKey: '2ed25e4a-37c7-4a65-8ad6-4debdff178f6',
    };
    const submitted = recordLocalCourseEnquiry(entry, now + 2_000);
    expect(submitted.duplicate).toBe(false);
    expect(listLocalCourseEnquiryOutbox()).toMatchObject([{
      fullName: entry.fullName,
      email: entry.email,
      courseName: entry.courseName,
      message: entry.message,
      enquiryId: submitted.enquiryId,
      submittedAt: new Date(now + 2_000).toISOString(),
    }]);
    expect(recordLocalCourseEnquiry(entry, now + 3_000)).toMatchObject({ duplicate: true, enquiryId: submitted.enquiryId });
    expect(listLocalCourseEnquiryOutbox()).toHaveLength(1);
  });

  it('rejects expired or incorrect codes and rate-limits resend attempts', () => {
    const now = 1_800_000_000_000;
    const expired = createLocalCourseEnquiryChallenge('expired@example.com', now);
    expect(verifyLocalCourseEnquiryCode(expired.challengeId, expired.developmentCode, now + 5 * 60_000).verified).toBe(false);
    const first = createLocalCourseEnquiryChallenge('rate@example.com', now);
    expect(verifyLocalCourseEnquiryCode(first.challengeId, '000000', now + 1_000).verified).toBe(false);
    expect(() => createLocalCourseEnquiryChallenge('rate@example.com', now + 1_001)).toThrow('Please wait');
  });
});
