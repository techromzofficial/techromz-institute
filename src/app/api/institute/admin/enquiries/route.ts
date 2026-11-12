import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/features/education/administration/auth';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { decryptPrivateValue } from '@/features/education/administration/crypto';
import { adminJson } from '@/features/education/administration/http';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isInstituteFeatureEnabled('admin')) return adminJson({ message: 'Administration is unavailable.' }, 503);
  try {
    const session = await requireAdminSession(['administrator', 'registrar']);
    const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) return adminJson({ message: 'Invalid page.' }, 400);
    const pool = getInstituteDatabasePool();
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT id, full_name_ciphertext, email_ciphertext, phone_ciphertext,
      course_id, course_name, subject_ciphertext, message_ciphertext, submitted_at, notification_status
      FROM institute_course_enquiries ORDER BY submitted_at DESC, id DESC LIMIT 26 OFFSET ?`, [(page - 1) * 25]);
    const enquiries = rows.slice(0, 25).map(row => ({
      id: row.id, fullName: decryptPrivateValue(row.full_name_ciphertext), email: decryptPrivateValue(row.email_ciphertext),
      phone: row.phone_ciphertext ? decryptPrivateValue(row.phone_ciphertext) : null,
      courseId: row.course_id, courseName: row.course_name,
      subject: row.subject_ciphertext ? decryptPrivateValue(row.subject_ciphertext) : 'Course enquiry',
      message: decryptPrivateValue(row.message_ciphertext), submittedAt: row.submitted_at, notificationStatus: row.notification_status,
    }));
    // Audit access before disclosing contact data; no PII is copied into the audit log.
    await pool.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (?, ?, 'enquiries.read', 'course_enquiries', ?, JSON_OBJECT('page', ?, 'count', ?))`, [randomUUID(), session.adminUserId, session.adminUserId, page, enquiries.length]);
    return adminJson({ enquiries, page, hasMore: rows.length > 25 });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === 'UNAUTHORIZED';
    return adminJson({ message: unauthorized ? 'Authentication required.' : 'Enquiries are unavailable.' }, unauthorized ? 401 : 503);
  }
}
