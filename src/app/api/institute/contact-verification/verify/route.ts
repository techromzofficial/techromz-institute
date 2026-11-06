import { NextRequest } from 'next/server';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { verifyContactChallenge } from '@/features/education/administration/contactVerification';
import { adminJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export async function POST(request: NextRequest) {
  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: 'Contact verification is not available.' }, 503);
  let body: { challengeId?: unknown; token?: unknown; purpose?: unknown }; try { body = await request.json(); } catch { return adminJson({ message: 'Invalid verification request.' }, 400); }
  const purpose = body.purpose === 'registration' ? 'registration' : body.purpose === 'course_enquiry' ? 'course_enquiry' : null;
  const enabled = purpose === 'registration' ? isInstituteFeatureEnabled('registration') : purpose === 'course_enquiry' ? isInstituteFeatureEnabled('courseEnquiry') : false;
  if (!purpose || !enabled) return adminJson({ message: 'Contact verification is not available.' }, 503);
  if (typeof body.challengeId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.challengeId) || typeof body.token !== 'string' || !/^\d{6}$/.test(body.token)) return adminJson({ message: 'Invalid or expired verification code.' }, 400);
  try {
    const pool = getInstituteDatabasePool();
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'contact.verify.global', maximum: 300, windowSeconds: 900 }),
      consumeSharedRateLimit(pool, body.challengeId, { scope: 'contact.verify.challenge', maximum: 6, windowSeconds: 900 }),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return adminJson({ message: 'Invalid or expired verification code.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const result = await verifyContactChallenge(pool, { challengeId: body.challengeId, token: body.token, purpose });
    return result.verified ? adminJson({ verified: true, verificationGrant: result.grant }) : adminJson({ message: 'Invalid or expired verification code.' }, 400);
  } catch { return adminJson({ message: 'Verification is temporarily unavailable.' }, 503); }
}
