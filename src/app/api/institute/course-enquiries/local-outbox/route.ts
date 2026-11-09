import { NextRequest } from 'next/server';
import { adminJson } from '@/features/education/administration/http';
import { isLocalCourseEnquiryRequest, isLocalCourseEnquiryTestMode, listLocalCourseEnquiryOutbox } from '@/features/education/administration/localCourseEnquiry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isLocalCourseEnquiryTestMode() || !isLocalCourseEnquiryRequest(request)) {
    return adminJson({ message: 'Not found.' }, 404);
  }
  return adminJson({ mode: 'local-test', emailSent: false, enquiries: listLocalCourseEnquiryOutbox() }, 200, { 'Cache-Control': 'no-store' });
}
