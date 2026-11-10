import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { adminJson } from '@/features/education/administration/http';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { getCourseEnquiryDelivery } from '@/features/education/administration/courseEnquiry';
import { dispatchCourseEnquiries } from '@/features/education/administration/courseEnquiryDelivery';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
export const runtime = 'nodejs';
export const maxDuration = 300;
export async function POST(request: NextRequest) {
  const secret = process.env.INSTITUTE_ENQUIRY_WORKER_SECRET;
  const authorization = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) return adminJson({ message: 'Unauthorized.' }, 401);
  const deliver = getCourseEnquiryDelivery();
  if (!isInstituteFeatureEnabled('courseEnquiry') || !deliver) return adminJson({ message: 'Delivery worker unavailable.' }, 503);
  try { return adminJson(await dispatchCourseEnquiries(getInstituteDatabasePool(), deliver, 5)); }
  catch { console.error('[course-enquiry] delivery worker database failure'); return adminJson({ message: 'Delivery worker failed.' }, 503); }
}
