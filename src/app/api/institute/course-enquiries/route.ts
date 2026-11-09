import { NextRequest } from 'next/server';
import { getCourseEnquiryDelivery, validateCourseEnquiry } from '@/features/education/administration/courseEnquiry';
import { CourseEnquiryVerificationRequiredError, isCourseEnquiryStorageReady, markCourseEnquiryNotification, recordCourseEnquiry } from '@/features/education/administration/courseEnquiryStore';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { adminJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { educationCourseService } from '@/features/education/services/courseService';
import { isLocalCourseEnquiryRequest, isLocalCourseEnquiryTestMode, recordLocalCourseEnquiry } from '@/features/education/administration/localCourseEnquiry';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isLocalCourseEnquiryTestMode()) return adminJson({ available: true, mode: 'local-test' }, 200, { 'Cache-Control': 'no-store' });
  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ available: false });
  const smtpReady = Boolean(getCourseEnquiryDelivery());
  const abuseProtectionReady = isIdentifierRateLimitMode();
  const databaseReady = abuseProtectionReady ? await isCourseEnquiryStorageReady(getInstituteDatabasePool()) : false;
  return adminJson({ available: smtpReady && abuseProtectionReady && databaseReady });
}

export async function POST(request: NextRequest) {
  if (isLocalCourseEnquiryTestMode()) {
    if (!isLocalCourseEnquiryRequest(request)) return adminJson({ message: 'Local test mode only accepts requests from localhost.' }, 403);
    let localBody: unknown;
    try { localBody = await request.json(); } catch { return adminJson({ message: 'Invalid enquiry request.' }, 400); }
    const localValidation = validateCourseEnquiry(localBody);
    if (!localValidation.valid) return adminJson({ message: localValidation.message }, 400);
    const localCourses = await educationCourseService.listCourses();
    if (!localCourses.some((course) => course.title === localValidation.value.courseName)) return adminJson({ message: 'Select a currently published course.' }, 400);
    try {
      const result = recordLocalCourseEnquiry(localValidation.value);
      return adminJson({
        accepted: true,
        localTest: true,
        duplicate: result.duplicate,
        enquiryId: result.enquiryId,
        message: 'Local test enquiry captured. No email was sent.',
      }, result.duplicate ? 200 : 202, { 'Cache-Control': 'no-store' });
    } catch (error) {
      return adminJson({ message: error instanceof Error ? error.message : 'Email verification is required.' }, 400);
    }
  }
  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ message: 'Direct email submission is not configured on this server. Please use WhatsApp or try again later.' }, 503);
  const deliver = getCourseEnquiryDelivery();
  if (!deliver || !isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: 'Direct email submission is not configured on this server. Please use WhatsApp or try again later.' }, 503);
  let body: unknown;
  try { body = await request.json(); } catch { return adminJson({ message: 'Invalid enquiry request.' }, 400); }
  const validation = validateCourseEnquiry(body);
  if (!validation.valid) return adminJson({ message: validation.message }, 400);
  const publishedCourses = await educationCourseService.listCourses().catch((error) => {
    console.error('[course-enquiry] unable to load published course catalogue', error instanceof Error ? error.name : 'UnknownError');
    return null;
  });
  if (!publishedCourses) return adminJson({ message: 'We could not verify the selected course. Please try again later.' }, 503);
  if (!publishedCourses.some((course) => course.title === validation.value.courseName)) return adminJson({ message: 'Select a currently published course.' }, 400);
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
    } catch (error) {
      console.error('[course-enquiry] notification delivery failed', error instanceof Error ? error.name : 'UnknownError');
      try {
        await markCourseEnquiryNotification(pool, stored.enquiryId, false);
      } catch (markError) {
        console.error('[course-enquiry] failed to record notification failure', markError instanceof Error ? markError.name : 'UnknownError');
      }
      return adminJson({ accepted: false, recorded: true, enquiryId: stored.enquiryId, message: 'Your enquiry was recorded, but the notification could not be delivered. Please use WhatsApp if your request is urgent.' }, 503);
    }
  } catch (error) {
    if (error instanceof CourseEnquiryVerificationRequiredError) return adminJson({ message: 'Verify your email address before sending the enquiry.' }, 400);
    console.error('[course-enquiry] enquiry submission failed', error instanceof Error ? error.name : 'UnknownError');
    return adminJson({ message: 'We could not record your enquiry. Please try again or use WhatsApp.' }, 503);
  }
}
