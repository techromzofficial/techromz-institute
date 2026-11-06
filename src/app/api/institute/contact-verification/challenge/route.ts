import { NextRequest } from 'next/server';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { createContactChallenge } from '@/features/education/administration/contactVerification';
import { getSmtpEmailDelivery } from '@/features/education/administration/smtp';
import { adminJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export async function POST(request: NextRequest) {
  const deliver = getSmtpEmailDelivery();
  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request) || !deliver) return adminJson({ message: 'Contact verification is not available.' }, 503);
  let body: { type?: unknown; destination?: unknown; purpose?: unknown }; try { body = await request.json(); } catch { return adminJson({ message: 'Invalid verification request.' }, 400); }
  const purpose = body.purpose === 'registration' ? 'registration' : body.purpose === 'course_enquiry' ? 'course_enquiry' : null;
  const enabled = purpose === 'registration' ? isInstituteFeatureEnabled('registration') : purpose === 'course_enquiry' ? isInstituteFeatureEnabled('courseEnquiry') : false;
  if (!purpose || !enabled) return adminJson({ message: 'Contact verification is not available.' }, 503);
  if (body.type !== 'email' || typeof body.destination !== 'string' || body.destination.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.destination.trim())) return adminJson({ message: 'Invalid verification request.' }, 400);
  try {
    const pool = getInstituteDatabasePool(); const destination = body.destination.trim().toLowerCase();
    const policies = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'contact.challenge.global', maximum: 120, windowSeconds: 900 }),
      consumeSharedRateLimit(pool, destination, { scope: 'contact.challenge.cooldown', maximum: 1, windowSeconds: 120 }),
      consumeSharedRateLimit(pool, destination, { scope: 'contact.challenge.destination24h', maximum: 5, windowSeconds: 86_400 }),
      // A 45-message fixed window remains below 100 even when a rolling day overlaps
      // the edges of two windows (maximum 90 accepted attempts).
      consumeSharedRateLimit(pool, 'enrolments-mailbox', { scope: 'contact.challenge.mailbox24h', maximum: 45, windowSeconds: 86_400 }),
    ]);
    const limited = policies.find((policy) => !policy.allowed);
    if (limited) return adminJson({ message: 'Verification is temporarily unavailable.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const result = await createContactChallenge(pool, { type: 'email', destination, purpose, deliver });
    return adminJson({ accepted: true, challengeId: result.challengeId }, 202);
  } catch { return adminJson({ message: 'Verification is temporarily unavailable.' }, 503); }
}
