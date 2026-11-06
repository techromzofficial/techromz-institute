import { NextRequest } from 'next/server';
import { getCourseEnquiryDelivery, validateCourseEnquiry } from '@/features/education/administration/courseEnquiry';
import { CourseEnquiryVerificationRequiredError, isCourseEnquiryStorageReady, markCourseEnquiryNotification, recordCourseEnquiry } from '@/features/education/administration/courseEnquiryStore';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { adminJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ available: false });
  const smtpReady = Boolean(getCourseEnquiryDelivery());
  const abuseProtectionReady = isIdentifierRateLimitMode();
  const databaseReady = abuseProtectionReady ? await isCourseEnquiryStorageReady(getInstituteDatabasePool()) : false;
  return adminJson({ available: smtpReady && abuseProtectionReady && databaseReady });
}

export async function POST(request: NextRequest) {
  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ message: 'Direct email submission is not configured on this server. Please use WhatsApp or try again later.' }, 503);
  const deliver = getCourseEnquiryDelivery();
  if (!deliver || !isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: 'Direct email submission is not configured on this server. Please use WhatsApp or try again later.' }, 503);
  let body: unknown;
  try { body = await request.json(); } catch { return adminJson({ message: 'Invalid enquiry request.' }, 400); }
  const validation = validateCourseEnquiry(body);
  if (!validation.valid) return adminJson({ message: validation.message }, 400);
  try {
    const pool = getInstituteDatabasePool();
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'course.enquiry.global', maximum: 60, windowSeconds: 3600 }),
      consumeSharedRateLimit(pool, validation.value.email, { scope: 'course.enquiry.email', maximum: 3, windowSeconds: 3600 }),
      consumeSharedRateLimit(pool, 'enrolments-mailbox', { scope: 'course.enquiry.mailbox', maximum: 100, windowSeconds: 86_400 }),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return adminJson({ message: 'Too many enquiries have been submitted. Please wait before trying again.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const stored = await recordCourseEnquiry(pool, validation.value);
    if (stored.duplicate) return adminJson({ accepted: true, duplicate: true, enquiryId: stored.enquiryId, message: 'This enquiry was already received.' }, 200);
    try {
      await deliver(stored.enquiry);
      await markCourseEnquiryNotification(pool, stored.enquiryId, true);
      return adminJson({ accepted: true, enquiryId: stored.enquiryId, message: 'Your enquiry was recorded and accepted by our email provider.' }, 202);
    } catch {
      await markCourseEnquiryNotification(pool, stored.enquiryId, false).catch(() => undefined);
      return adminJson({ accepted: false, recorded: true, enquiryId: stored.enquiryId, message: 'Your enquiry was recorded, but the notification could not be delivered. Please use WhatsApp if your request is urgent.' }, 503);
    }
  } catch (error) {
    if (error instanceof CourseEnquiryVerificationRequiredError) return adminJson({ message: 'Verify your email address before sending the enquiry.' }, 400);
    return adminJson({ message: 'We could not record your enquiry. Please try again or use WhatsApp.' }, 503);
  }
}
