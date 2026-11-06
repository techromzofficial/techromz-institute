import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { adminJson } from '@/features/education/administration/http';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import type { RowDataPacket } from 'mysql2/promise';
import { educationCourseService } from '@/features/education/services/courseService';

export const dynamic = 'force-dynamic';
export async function GET() {
  if (!isInstituteFeatureEnabled('registration')) return adminJson({ message: 'Online registration is not currently available.' }, 503);
  try {
    const [rows] = await getInstituteDatabasePool().execute<RowDataPacket[]>(`SELECT i.id, i.intake_code, i.registration_deadline_at, i.starts_at, c.title, c.slug
      FROM institute_course_intakes i JOIN institute_courses c ON c.id=i.course_id
      WHERE i.status='open' AND (i.registration_opens_at IS NULL OR i.registration_opens_at <= UTC_TIMESTAMP(6))
      AND i.registration_deadline_at > UTC_TIMESTAMP(6) ORDER BY i.starts_at, c.title`);
    const visible = await Promise.all(rows.map(async (row) => await educationCourseService.getCourse(String(row.slug)) ? row : null));
    return adminJson({ intakes: visible.filter((row) => row !== null) });
  } catch { return adminJson({ message: 'Registration is temporarily unavailable.' }, 503); }
}
