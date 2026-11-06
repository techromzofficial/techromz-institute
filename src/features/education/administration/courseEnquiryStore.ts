import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { encryptPrivateValue, privateLookupHash, secretHash } from './crypto';
import type { CourseEnquiry, VerifiedCourseEnquiry } from './courseEnquiry';

export class CourseEnquiryVerificationRequiredError extends Error {}

export type StoredCourseEnquiry = {
  enquiryId: string;
  duplicate: boolean;
  notificationStatus: 'pending' | 'notified' | 'notification_failed';
  enquiry: CourseEnquiry;
};

export async function isCourseEnquiryStorageReady(pool: Pick<Pool, 'execute'>): Promise<boolean> {
  try {
    const [rows] = await pool.execute<(RowDataPacket & { enquiry_table: number; challenge_purpose: number; grant_purpose: number })[]>(`SELECT
      EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='institute_course_enquiries') AS enquiry_table,
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='institute_contact_verification_challenges' AND column_name='purpose') AS challenge_purpose,
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='institute_contact_verification_grants' AND column_name='purpose') AS grant_purpose`);
    const row = rows[0];
    return Number(row?.enquiry_table) === 1 && Number(row?.challenge_purpose) === 1 && Number(row?.grant_purpose) === 1;
  } catch {
    return false;
  }
}

export async function recordCourseEnquiry(pool: Pick<Pool, 'getConnection'>, input: VerifiedCourseEnquiry): Promise<StoredCourseEnquiry> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const idempotencyHash = secretHash(input.idempotencyKey);
    const [duplicates] = await connection.execute<(RowDataPacket & { id: string; notification_status: StoredCourseEnquiry['notificationStatus'] })[]>(
      'SELECT id, notification_status FROM institute_course_enquiries WHERE idempotency_hash = ? FOR UPDATE', [idempotencyHash]);
    if (duplicates[0]) {
      await connection.commit();
      return { enquiryId: duplicates[0].id, duplicate: true, notificationStatus: duplicates[0].notification_status, enquiry: publicEnquiry(input) };
    }
    const emailHash = privateLookupHash(input.email);
    const [grants] = await connection.execute<(RowDataPacket & { id: string; contact_lookup_hash: Buffer })[]>(`SELECT id, contact_lookup_hash FROM institute_contact_verification_grants
      WHERE grant_hash = ? AND purpose = 'course_enquiry' AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE`, [secretHash(input.verificationGrant)]);
    const grant = grants[0];
    if (!grant || !grant.contact_lookup_hash.equals(emailHash)) throw new CourseEnquiryVerificationRequiredError();
    const enquiryId = randomUUID();
    await connection.execute(`INSERT INTO institute_course_enquiries
      (id, idempotency_hash, email_lookup_hash, full_name_ciphertext, email_ciphertext, phone_ciphertext, course_name, message_ciphertext)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      enquiryId, idempotencyHash, emailHash, encryptPrivateValue(input.fullName), encryptPrivateValue(input.email),
      input.phone ? encryptPrivateValue(input.phone) : null, input.courseName, encryptPrivateValue(input.message),
    ]);
    await connection.execute('UPDATE institute_contact_verification_grants SET consumed_at = UTC_TIMESTAMP(6) WHERE id = ?', [grant.id]);
    await connection.commit();
    return { enquiryId, duplicate: false, notificationStatus: 'pending', enquiry: publicEnquiry(input) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function markCourseEnquiryNotification(pool: Pick<Pool, 'execute'>, enquiryId: string, delivered: boolean): Promise<void> {
  await pool.execute(`UPDATE institute_course_enquiries SET notification_status = ?, notification_attempted_at = UTC_TIMESTAMP(6),
    notified_at = IF(?, UTC_TIMESTAMP(6), notified_at) WHERE id = ?`, [delivered ? 'notified' : 'notification_failed', delivered, enquiryId]);
}

function publicEnquiry(input: VerifiedCourseEnquiry): CourseEnquiry {
  return { fullName: input.fullName, email: input.email, ...(input.phone ? { phone: input.phone } : {}), courseName: input.courseName, message: input.message };
}
