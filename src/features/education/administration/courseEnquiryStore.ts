import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { encryptPrivateValue, privateLookupHash, secretHash } from './crypto';
import type { CourseEnquiry, VerifiedCourseEnquiry } from './courseEnquiry';

export class CourseEnquiryVerificationRequiredError extends Error {}
export class CourseEnquiryIdempotencyConflictError extends Error {}
export type StoredCourseEnquiry = {
  enquiryId: string;
  duplicate: boolean;
  notificationStatus: 'pending' | 'sending' | 'notified' | 'notification_failed';
  enquiry: CourseEnquiry;
};
export async function isCourseEnquiryStorageReady(pool: Pick<Pool, 'execute'>): Promise<boolean> {
  try {
    await pool.execute('SELECT course_id, request_hash, subject_ciphertext, delivery_attempts, delivery_claim, next_delivery_at FROM institute_course_enquiries LIMIT 0');
    await pool.execute('SELECT purpose, enquiry_session_hash FROM institute_contact_verification_challenges LIMIT 0');
    await pool.execute('SELECT purpose, enquiry_session_hash FROM institute_contact_verification_grants LIMIT 0');
    await pool.execute('SELECT contact_hash FROM institute_enquiry_otp_locks LIMIT 0');
    return true;
  } catch { return false; }
}
export async function recordCourseEnquiry(pool: Pick<Pool, 'getConnection'>, input: VerifiedCourseEnquiry, session?: string): Promise<StoredCourseEnquiry> {
  for (let attempt = 0; ; attempt++) {
    try { return await recordCourseEnquiryOnce(pool, input, session); }
    catch (error) {
      const code = (error as { code?: string })?.code;
      if (attempt >= 2 || !['ER_LOCK_DEADLOCK', 'ER_DUP_ENTRY', 'ER_LOCK_WAIT_TIMEOUT'].includes(code ?? '')) throw error;
    }
  }
}
async function recordCourseEnquiryOnce(pool: Pick<Pool, 'getConnection'>, input: VerifiedCourseEnquiry, session?: string): Promise<StoredCourseEnquiry> {
  if (!session) throw new CourseEnquiryVerificationRequiredError();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const sessionHash = secretHash(session);
    const idempotencyHash = secretHash(`${session}:${input.idempotencyKey}`);
    const requestHash = secretHash(JSON.stringify(publicEnquiry(input)));
    const [duplicates] = await connection.execute<(RowDataPacket & { id: string; request_hash: Buffer; notification_status: StoredCourseEnquiry['notificationStatus'] })[]>(
      'SELECT id, notification_status, request_hash FROM institute_course_enquiries WHERE idempotency_hash = ? FOR UPDATE', [idempotencyHash]);
    if (duplicates[0]) {
      if (!duplicates[0].request_hash?.equals(requestHash)) throw new CourseEnquiryIdempotencyConflictError();
      await connection.commit();
      return { enquiryId: duplicates[0].id, duplicate: true, notificationStatus: duplicates[0].notification_status, enquiry: publicEnquiry(input) };
    }
    const emailHash = privateLookupHash(input.email);
    const [grants] = await connection.execute<(RowDataPacket & { id: string; contact_lookup_hash: Buffer })[]>(`SELECT id, contact_lookup_hash FROM institute_contact_verification_grants
      WHERE grant_hash = ? AND purpose = 'course_enquiry' AND contact_type='email' AND enquiry_session_hash=?
      AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE`, [secretHash(input.verificationGrant), sessionHash]);
    const grant = grants[0];
    if (!grant || !grant.contact_lookup_hash.equals(emailHash)) throw new CourseEnquiryVerificationRequiredError();
    const enquiryId = randomUUID();
    await connection.execute(`INSERT INTO institute_course_enquiries
      (id, idempotency_hash, email_lookup_hash, full_name_ciphertext, email_ciphertext, phone_ciphertext, course_name, message_ciphertext,
       course_id, subject_ciphertext, enquiry_session_hash, request_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      enquiryId, idempotencyHash, emailHash, encryptPrivateValue(input.fullName), encryptPrivateValue(input.email),
      input.phone ? encryptPrivateValue(input.phone) : null, input.courseName, encryptPrivateValue(input.message),
      input.courseId, encryptPrivateValue(input.subject), sessionHash, requestHash,
    ]);
    await connection.execute('UPDATE institute_contact_verification_grants SET consumed_at = UTC_TIMESTAMP(6) WHERE id = ?', [grant.id]);
    await connection.commit();
    return { enquiryId, duplicate: false, notificationStatus: 'pending', enquiry: publicEnquiry(input) };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}
function publicEnquiry(input: VerifiedCourseEnquiry): CourseEnquiry {
  return { fullName: input.fullName, email: input.email, ...(input.phone ? { phone: input.phone } : {}), courseId: input.courseId, courseName: input.courseName, subject: input.subject, message: input.message };
}
