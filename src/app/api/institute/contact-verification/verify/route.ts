import { readEnquirySession, enquiryCourseContext } from '@/features/education/administration/enquirySession';
import { educationCourseService } from '@/features/education/services/courseService';
import { NextRequest } from 'next/server';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { verifyContactChallenge } from '@/features/education/administration/contactVerification';
import { adminJson, readBoundedJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest, unverifiedClientIp } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

const unavailableMessage = 'Email verification is temporarily unavailable. Please try again later.';

export async function POST(request: NextRequest) {

  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: unavailableMessage }, 503);
  let body: { challengeId?: unknown; token?: unknown; purpose?: unknown; courseId?: unknown }; try { body = await readBoundedJson(request) as typeof body; } catch { return adminJson({ message: 'Invalid verification request.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return adminJson({ message: 'Invalid verification request.' }, 400);
  const purpose = body.purpose === 'registration' ? 'registration' : body.purpose === 'course_enquiry' ? 'course_enquiry' : null;
  const enabled = purpose === 'registration' ? isInstituteFeatureEnabled('registration') : purpose === 'course_enquiry' ? isInstituteFeatureEnabled('courseEnquiry') : false;
  if (!purpose || !enabled) return adminJson({ message: unavailableMessage }, 503);
  if (typeof body.challengeId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.challengeId) || typeof body.token !== 'string' || !/^\d{6}$/.test(body.token)) return adminJson({ message: 'Invalid or expired verification code.' }, 400);
  const session = readEnquirySession(request);
  if (purpose === 'course_enquiry' && !session) return adminJson({ message: 'Invalid or expired verification code.' }, 400);
  try {
    if (purpose === 'course_enquiry' && (typeof body.courseId !== 'string' || !await educationCourseService.getCourse(body.courseId))) return adminJson({ message: 'Select a currently published course.' }, 400);
    const pool = getInstituteDatabasePool();
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'contact.verify.global', maximum: 300, windowSeconds: 900 }),
      consumeSharedRateLimit(pool, body.challengeId, { scope: 'contact.verify.challenge', maximum: 6, windowSeconds: 900 }),
      ...(session ? [consumeSharedRateLimit(pool, session, { scope: 'contact.verify.session', maximum: 30, windowSeconds: 900 })] : []),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return adminJson({ message: 'Invalid or expired verification code.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const clientIp = unverifiedClientIp(request);
    if (clientIp) {
      const ipLimit = await consumeSharedRateLimit(pool, clientIp, { scope: 'contact.verify.ip', maximum: 60, windowSeconds: 900 });
      if (!ipLimit.allowed) return adminJson({ message: 'Too many requests. Please try again later.' }, 429, { 'Retry-After': String(ipLimit.retryAfterSeconds) });
    }
    const result = await verifyContactChallenge(pool, { challengeId: body.challengeId, token: body.token, purpose, session: session ? enquiryCourseContext(session, body.courseId as string) : undefined });
    return result.verified ? adminJson({ verified: true, verificationGrant: result.grant }) : adminJson({ message: 'Invalid or expired verification code.' }, 400);
  } catch { return adminJson({ message: unavailableMessage }, 503); }
}
