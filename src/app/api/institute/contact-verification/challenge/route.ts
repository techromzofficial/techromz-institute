import { readEnquirySession, newEnquirySession, setEnquirySession, enquiryCourseContext } from '@/features/education/administration/enquirySession';
import { educationCourseService } from '@/features/education/services/courseService';
import { readOtpPolicy } from '@/features/education/administration/otpPolicy';
import { NextRequest } from 'next/server';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { ContactChallengeRateLimitError, createContactChallenge } from '@/features/education/administration/contactVerification';
import { getSmtpEmailDelivery } from '@/features/education/administration/smtp';
import { adminJson, readBoundedJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest, trustedClientIp } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export const runtime = 'nodejs';
const unavailableMessage = 'Email verification is temporarily unavailable. Please try again later.';

export async function POST(request: NextRequest) {

  const deliver = getSmtpEmailDelivery();
  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request) || !deliver) return adminJson({ message: unavailableMessage }, 503);
  let body: { type?: unknown; destination?: unknown; purpose?: unknown; courseId?: unknown }; try { body = await readBoundedJson(request) as typeof body; } catch { return adminJson({ message: 'Invalid verification request.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return adminJson({ message: 'Invalid verification request.' }, 400);
  const purpose = body.purpose === 'registration' ? 'registration' : body.purpose === 'course_enquiry' ? 'course_enquiry' : null;
  const enabled = purpose === 'registration' ? isInstituteFeatureEnabled('registration') : purpose === 'course_enquiry' ? isInstituteFeatureEnabled('courseEnquiry') : false;
  if (!purpose || !enabled) return adminJson({ message: unavailableMessage }, 503);
  if (body.type !== 'email' || typeof body.destination !== 'string' || body.destination.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.destination.trim())) return adminJson({ message: 'Invalid verification request.' }, 400);
  try {
    if (purpose === 'course_enquiry' && (typeof body.courseId !== 'string' || !await educationCourseService.getCourse(body.courseId))) return adminJson({ message: 'Select a currently published course.' }, 400);
    const policy = readOtpPolicy();
    const pool = getInstituteDatabasePool();
    const clientIp = trustedClientIp(request, process.env, purpose === 'course_enquiry');
    if (clientIp) {
      const ipLimit = await consumeSharedRateLimit(pool, clientIp, { scope: 'contact.challenge.ip', maximum: 20, windowSeconds: 900 });
      if (!ipLimit.allowed) return adminJson({ message: 'Too many requests. Please try again later.' }, 429, { 'Retry-After': String(ipLimit.retryAfterSeconds) });
    }
    const destination = body.destination.trim().toLowerCase();
    const policies = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'contact.challenge.global', maximum: 120, windowSeconds: 900 }),
      consumeSharedRateLimit(pool, destination, { scope: 'contact.challenge.cooldown', maximum: 1, windowSeconds: policy.resendCooldownSeconds }),
      consumeSharedRateLimit(pool, destination, { scope: 'contact.challenge.destination24h', maximum: 12, windowSeconds: 86_400 }),
      // A 45-message fixed window remains below 100 even when a rolling day overlaps
      // the edges of two windows (maximum 90 accepted attempts).
      consumeSharedRateLimit(pool, 'enrolments-mailbox', { scope: 'contact.challenge.mailbox24h', maximum: 45, windowSeconds: 86_400 }),
    ]);
    const limited = policies.find((policy) => !policy.allowed);
    if (limited) return adminJson({ message: 'Verification is temporarily unavailable.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const session = purpose === 'course_enquiry' ? readEnquirySession(request) ?? newEnquirySession() : undefined;
    const result = await createContactChallenge(pool, { type: 'email', destination, purpose, session: session ? enquiryCourseContext(session, body.courseId as string) : undefined, deliver });
    const response = adminJson({ accepted: true, challengeId: result.challengeId, resendAfterSeconds: policy.resendCooldownSeconds, expiresInMinutes: policy.expiryMinutes }, 202);
    if (session) setEnquirySession(response, session);
    return response;
  } catch (error) {
    if (error instanceof ContactChallengeRateLimitError) return adminJson({ message: error.message }, 429, { 'Retry-After': String(error.retryAfterSeconds) });
    console.error('[contact-verification] challenge delivery failed', error instanceof Error ? error.name : 'UnknownError');
    return adminJson({ message: unavailableMessage }, 503);
  }
}
