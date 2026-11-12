import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { decryptPrivateValue } from './crypto';
import type { CourseEnquiry } from './courseEnquiry';

type Delivery = (enquiry: CourseEnquiry, at: Date, id: string) => Promise<void>;
export function classifyDeliveryError(error: unknown): { category: string; retry: boolean } {
  const value = error as { code?: string; responseCode?: number; command?: string; timeoutType?: string; originalCode?: string } | null;
  if (value?.code === 'EAUTH') return { category: 'authentication', retry: false };
  if (value?.responseCode === 503) return { category: 'temporary_rejection', retry: true };
  if (value?.responseCode && value.responseCode >= 500) return { category: 'rejected', retry: false };
  if (value?.responseCode && value.responseCode >= 400) return { category: 'temporary_rejection', retry: true };
  if (['EDNS', 'ECONNREFUSED'].includes(value?.code ?? '') || value?.originalCode === 'ECONNREFUSED' || value?.code === 'ETIMEDOUT' && ['CONNECT_TIMEOUT', 'GREETING_TIMEOUT'].includes(value.timeoutType ?? '')) return { category: 'connection', retry: true };
  // A disconnect after DATA can mean SMTP accepted the message. Do not resend blindly.
  return { category: 'uncertain_or_configuration', retry: false };
}
export async function dispatchCourseEnquiries(pool: Pick<Pool, 'execute' | 'getConnection'>, deliver: Delivery, maximum = 10, enquiryId?: string) {
  const summary = { acceptedBySmtp: 0, retryScheduled: 0, failed: 0 };
  await pool.execute(`UPDATE institute_course_enquiries SET notification_status='notification_failed',
    delivery_error_category='interrupted_uncertain', next_delivery_at=NULL, delivery_claim=NULL
    WHERE notification_status='sending' AND notification_attempted_at < DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 MINUTE)
    AND (? IS NULL OR id=?)`, [enquiryId ?? null, enquiryId ?? null]);
  for (let index = 0; index < Math.min(25, maximum); index++) {
    const connection = await pool.getConnection();
    let row: RowDataPacket | undefined;
    const claim = randomUUID();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute<RowDataPacket[]>(`SELECT * FROM institute_course_enquiries
        WHERE notification_status IN ('pending','notification_failed') AND delivery_attempts < 5
        AND next_delivery_at <= UTC_TIMESTAMP(6) AND (? IS NULL OR id=?)
        ORDER BY submitted_at LIMIT 1 FOR UPDATE SKIP LOCKED`, [enquiryId ?? null, enquiryId ?? null]);
      row = rows[0];
      if (row) await connection.execute(`UPDATE institute_course_enquiries SET notification_status='sending', delivery_claim=?,
        delivery_attempts=delivery_attempts+1, notification_attempted_at=UTC_TIMESTAMP(6) WHERE id=?`, [claim, row.id]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    if (!row) break;
    let failure: ReturnType<typeof classifyDeliveryError> | undefined;
    try {
      await deliver({
        fullName: decryptPrivateValue(row.full_name_ciphertext), email: decryptPrivateValue(row.email_ciphertext),
        ...(row.phone_ciphertext ? { phone: decryptPrivateValue(row.phone_ciphertext) } : {}),
        courseId: row.course_id ?? 'legacy', courseName: row.course_name,
        subject: row.subject_ciphertext ? decryptPrivateValue(row.subject_ciphertext) : 'Course information',
        message: decryptPrivateValue(row.message_ciphertext),
      }, new Date(row.submitted_at), row.id);
    } catch (error) { failure = classifyDeliveryError(error); }
    // A DB failure after SMTP acceptance leaves the lease for manual reconciliation.
    if (!failure) {
      await pool.execute(`UPDATE institute_course_enquiries SET notification_status='notified', notified_at=UTC_TIMESTAMP(6),
        next_delivery_at=NULL, delivery_claim=NULL, delivery_error_category=NULL WHERE id=? AND delivery_claim=?`, [row.id, claim]);
      summary.acceptedBySmtp++;
    } else {
      const retry = failure.retry && Number(row.delivery_attempts) + 1 < 5;
      const delay = Math.min(3600, 60 * 2 ** Number(row.delivery_attempts));
      await pool.execute(`UPDATE institute_course_enquiries SET notification_status='notification_failed', delivery_error_category=?,
        next_delivery_at=IF(?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? SECOND), NULL), delivery_claim=NULL
        WHERE id=? AND delivery_claim=?`, [failure.category, retry, delay, row.id, claim]);
      if (retry) summary.retryScheduled++; else summary.failed++;
    }
  }
  return summary;
}
