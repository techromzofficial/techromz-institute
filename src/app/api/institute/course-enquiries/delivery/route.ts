import { NextRequest } from 'next/server';
import { isAuthorizedEnquiryWorker } from '@/features/education/administration/enquiryWorkerAuth';
import { adminJson } from '@/features/education/administration/http';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { getCourseEnquiryDelivery } from '@/features/education/administration/courseEnquiry';
import { dispatchCourseEnquiries } from '@/features/education/administration/courseEnquiryDelivery';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
export const runtime = 'nodejs';
export const maxDuration = 300;
export async function POST(request: NextRequest) {
  if (!isAuthorizedEnquiryWorker(request)) return adminJson({ message: 'Unauthorized.' }, 401);
  if (!isInstituteFeatureEnabled('courseEnquiry')) return adminJson({ message: 'Delivery worker unavailable.' }, 503);
  const deliver = getCourseEnquiryDelivery();
  if (!deliver) return adminJson({ message: 'Delivery worker unavailable.' }, 503);
  try { return adminJson(await dispatchCourseEnquiries(getInstituteDatabasePool(), deliver, 5)); }
  catch { console.error('[course-enquiry] delivery worker database failure'); return adminJson({ message: 'Delivery worker failed.' }, 503); }
}
