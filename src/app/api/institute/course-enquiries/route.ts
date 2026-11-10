import { readEnquirySession } from '@/features/education/administration/enquirySession';
import { NextRequest } from 'next/server';
import { getCourseEnquiryDelivery, validateCourseEnquiry } from '@/features/education/administration/courseEnquiry';
import { CourseEnquiryVerificationRequiredError, CourseEnquiryIdempotencyConflictError, isCourseEnquiryStorageReady, recordCourseEnquiry } from '@/features/education/administration/courseEnquiryStore';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { adminJson, readBoundedJson } from '@/features/education/administration/http';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest, trustedClientIp } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { educationCourseService } from '@/features/education/services/courseService';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ available: false });
  const smtpReady = Boolean(getCourseEnquiryDelivery());
  const abuseProtectionReady = isIdentifierRateLimitMode();
  let databaseReady = false;
  try { databaseReady = abuseProtectionReady && await isCourseEnquiryStorageReady(getInstituteDatabasePool()); } catch { /* fail closed */ }
  const workerReady = (process.env.INSTITUTE_ENQUIRY_WORKER_SECRET?.length ?? 0) >= 32;
  const ipReady = process.env.NODE_ENV !== 'production' || Boolean(process.env.INSTITUTE_TRUSTED_CLIENT_IP_HEADER?.trim());
  return adminJson({ available: smtpReady && abuseProtectionReady && databaseReady && workerReady && ipReady });
}

export async function POST(request: NextRequest) {

  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ message: 'Direct email submission is not configured on this server. Please use WhatsApp or try again later.' }, 503);
  const deliver = getCourseEnquiryDelivery();
  if ((process.env.INSTITUTE_ENQUIRY_WORKER_SECRET?.length ?? 0) < 32 || !deliver || !isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: 'Direct email submission is not configured on this server. Please use WhatsApp or try again later.' }, 503);
  let body: unknown;
  try { body = await readBoundedJson(request); } catch { return adminJson({ message: 'Invalid enquiry request.' }, 400); }
  const validation = validateCourseEnquiry(body);
  if (!validation.valid) return adminJson({ message: validation.message }, 400);
  const publishedCourses = await educationCourseService.listCourses().catch((error) => {
    console.error('[course-enquiry] unable to load published course catalogue', error instanceof Error ? error.name : 'UnknownError');
    return null;
  });
  if (!publishedCourses) return adminJson({ message: 'We could not verify the selected course. Please try again later.' }, 503);
  const selectedCourse = publishedCourses.find((course) => course.slug === validation.value.courseId);
  if (!selectedCourse) return adminJson({ message: 'Select a currently published course.' }, 400);
  validation.value.courseName = selectedCourse.title;
  try {
    const pool = getInstituteDatabasePool();
    const clientIp = trustedClientIp(request, process.env, true);
    if (clientIp) {
      const ipLimit = await consumeSharedRateLimit(pool, clientIp, { scope: 'course.enquiry.ip', maximum: 10, windowSeconds: 900 });
      if (!ipLimit.allowed) return adminJson({ message: 'Too many requests. Please try again later.' }, 429, { 'Retry-After': String(ipLimit.retryAfterSeconds) });
    }
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'course.enquiry.global', maximum: 60, windowSeconds: 3600 }),
      consumeSharedRateLimit(pool, validation.value.email, { scope: 'course.enquiry.email', maximum: 3, windowSeconds: 3600 }),
      consumeSharedRateLimit(pool, 'enrolments-mailbox', { scope: 'course.enquiry.mailbox', maximum: 100, windowSeconds: 86_400 }),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return adminJson({ message: 'Too many enquiries have been submitted. Please wait before trying again.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const stored = await recordCourseEnquiry(pool, validation.value, readEnquirySession(request));
    if (stored.duplicate) return adminJson({ accepted: true, duplicate: true, enquiryId: stored.enquiryId, message: 'This enquiry was already received.' }, 200);
    return adminJson({ accepted: true, queued: true, enquiryId: stored.enquiryId, message: 'Your enquiry was saved and queued for our enrolments team.' }, 202);
  } catch (error) {
    if (error instanceof CourseEnquiryIdempotencyConflictError) return adminJson({ message: 'This submission reference has already been used with different details.' }, 409);
    if (error instanceof CourseEnquiryVerificationRequiredError) return adminJson({ message: 'Verify your email address before sending the enquiry.' }, 400);
    console.error('[course-enquiry] enquiry submission failed', error instanceof Error ? error.name : 'UnknownError');
    return adminJson({ message: 'We could not record your enquiry. Please try again or use WhatsApp.' }, 503);
  }
}
