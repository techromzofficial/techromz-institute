import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { encryptPrivateValue, privateLookupHash } from './crypto';
import { secretHash } from './crypto';
import { consumeSharedRateLimitConnection } from './rateLimit';
import type { RegistrationInput, RegistrationStatus } from './validation';

export class DuplicateRegistrationError extends Error {}
export class IntakeRegistrationClosedError extends Error {}
export class ContactIdentityConflictError extends Error {}
export class ContactVerificationRequiredError extends Error {}
export class RegistrationRateLimitedError extends Error {}

export async function createRegistration(pool: Pick<Pool, 'getConnection'>, input: RegistrationInput, actorId?: string): Promise<{ registrationId: string; status: 'pending' }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [intakes] = await connection.execute<(RowDataPacket & { status: string; registration_opens_at: Date | null; registration_deadline_at: Date })[]>(
      'SELECT status, registration_opens_at, registration_deadline_at FROM institute_course_intakes WHERE id = ? FOR UPDATE', [input.intakeId]);
    const intake = intakes[0]; const now = new Date();
    if (!intake || intake.status !== 'open' || (intake.registration_opens_at && intake.registration_opens_at > now) || intake.registration_deadline_at <= now) throw new IntakeRegistrationClosedError();
    const emailHash = input.email ? privateLookupHash(input.email) : null;
    const phoneHash = input.phone ? privateLookupHash(input.phone) : null;
    let verifiedContactType: 'email' | 'phone' | null = null;
    if (input.source === 'website') {
      const [grants] = await connection.execute<(RowDataPacket & { id: string; contact_type: string; contact_lookup_hash: Buffer })[]>(`SELECT id, contact_type, contact_lookup_hash FROM institute_contact_verification_grants
        WHERE grant_hash = ? AND purpose = 'registration' AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE`, [secretHash(input.verificationGrant!)]);
      const grant = grants[0];
      const expected = grant?.contact_type === 'email' ? emailHash : grant?.contact_type === 'phone' ? phoneHash : null;
      if (!grant || !expected || !grant.contact_lookup_hash.equals(expected)) throw new ContactVerificationRequiredError();
      verifiedContactType = grant.contact_type as 'email' | 'phone';
      await connection.execute('UPDATE institute_contact_verification_grants SET consumed_at = UTC_TIMESTAMP(6) WHERE id = ?', [grant.id]);
    } else if (!actorId) throw new ContactVerificationRequiredError();
    const [emailStudents] = emailHash ? await connection.execute<(RowDataPacket & { id: string })[]>('SELECT id FROM institute_students WHERE email_lookup_hash = ? FOR UPDATE', [emailHash]) : [[], []] as never;
    const [phoneStudents] = phoneHash ? await connection.execute<(RowDataPacket & { id: string })[]>('SELECT id FROM institute_students WHERE phone_lookup_hash = ? FOR UPDATE', [phoneHash]) : [[], []] as never;
    if (emailStudents[0] && phoneStudents[0] && emailStudents[0].id !== phoneStudents[0].id) throw new ContactIdentityConflictError();
    const verifiedStudent = verifiedContactType === 'email' ? emailStudents[0] : verifiedContactType === 'phone' ? phoneStudents[0] : null;
    const unverifiedStudent = verifiedContactType === 'email' ? phoneStudents[0] : verifiedContactType === 'phone' ? emailStudents[0] : null;
    if (verifiedContactType && unverifiedStudent && unverifiedStudent.id !== verifiedStudent?.id) throw new ContactIdentityConflictError();
    const existing = verifiedContactType ? verifiedStudent : emailStudents[0] ?? phoneStudents[0];
    const studentId = existing?.id ?? randomUUID();
    const studentLimit = await consumeSharedRateLimitConnection(connection, studentId, { scope: 'registration.student', maximum: 3, windowSeconds: 86_400 });
    if (!studentLimit.allowed) throw new RegistrationRateLimitedError();
    if (!existing) await connection.execute(`INSERT INTO institute_students
      (id, display_name, email_ciphertext, phone_ciphertext, email_lookup_hash, phone_lookup_hash, privacy_consent_at)
      VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6))`, [studentId, input.fullName, input.email ? encryptPrivateValue(input.email) : null, input.phone ? encryptPrivateValue(input.phone) : null, emailHash, phoneHash]);
    const [duplicates] = await connection.execute<(RowDataPacket & { id: string; status: string })[]>("SELECT id, status FROM institute_registrations WHERE student_id = ? AND intake_id = ? LIMIT 1 FOR UPDATE", [studentId, input.intakeId]);
    if (duplicates[0]?.status !== undefined && duplicates[0].status !== 'cancelled') throw new DuplicateRegistrationError();
    if (duplicates[0]?.status === 'cancelled') {
      await connection.execute("UPDATE institute_registrations SET status='pending', source=?, submitted_at=UTC_TIMESTAMP(6), reviewed_at=NULL, reviewed_by=NULL WHERE id=?", [input.source, duplicates[0].id]);
      if (actorId) await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
        VALUES (?, ?, 'registration.reactivated', 'registration', ?, JSON_OBJECT('source', ?, 'identityVerificationReference', ?))`, [randomUUID(), actorId, duplicates[0].id, input.source, input.identityVerificationReference ?? null]);
      await connection.commit();
      return { registrationId: duplicates[0].id, status: 'pending' };
    }
    const registrationId = randomUUID();
    await connection.execute(`INSERT INTO institute_registrations (id, student_id, intake_id, status, source)
      VALUES (?, ?, ?, 'pending', ?)`, [registrationId, studentId, input.intakeId, input.source]);
    if (actorId) await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (?, ?, 'registration.created', 'registration', ?, JSON_OBJECT('source', ?, 'identityVerificationReference', ?))`, [randomUUID(), actorId, registrationId, input.source, input.identityVerificationReference ?? null]);
    await connection.commit();
    return { registrationId, status: 'pending' };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function updateRegistrationStatus(pool: Pick<Pool, 'getConnection'>, registrationId: string, status: RegistrationStatus, actorId: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { status: string })[]>('SELECT status FROM institute_registrations WHERE id = ? FOR UPDATE', [registrationId]);
    if (!rows[0]) throw new Error('NOT_FOUND');
    if (status === 'confirmed') throw new Error('Confirmation requires the verified-payment seat conversion workflow.');
    const transitions: Record<string, RegistrationStatus[]> = {
      pending: ['awaiting_payment', 'waitlist', 'cancelled'],
      awaiting_payment: ['waitlist', 'cancelled'],
      waitlist: ['pending', 'awaiting_payment', 'cancelled'],
      confirmed: ['cancelled'], cancelled: ['pending'],
    };
    if (!transitions[rows[0].status]?.includes(status)) throw new Error('INVALID_STATUS_TRANSITION');
    await connection.execute<ResultSetHeader>('UPDATE institute_registrations SET status = ?, reviewed_at = UTC_TIMESTAMP(6), reviewed_by = ? WHERE id = ?', [status, actorId, registrationId]);
    if (status === 'cancelled') {
      const [activeReservations] = await connection.execute<(RowDataPacket & { id: string })[]>("SELECT id FROM institute_seat_reservations WHERE registration_id = ? AND status = 'active' FOR UPDATE", [registrationId]);
      const [activeEnrolments] = await connection.execute<(RowDataPacket & { id: string })[]>("SELECT id FROM institute_enrolments WHERE registration_id = ? AND status = 'active' FOR UPDATE", [registrationId]);
      await connection.execute("UPDATE institute_seat_reservations SET status = 'cancelled' WHERE registration_id = ? AND status = 'active'", [registrationId]);
      await connection.execute("UPDATE institute_enrolments SET status = 'cancelled' WHERE registration_id = ? AND status = 'active'", [registrationId]);
      for (const reservation of activeReservations) await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
        VALUES (?, ?, 'reservation.cancelled', 'seat_reservation', ?, JSON_OBJECT('registrationId', ?))`, [randomUUID(), actorId, reservation.id, registrationId]);
      for (const enrolment of activeEnrolments) await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
        VALUES (?, ?, 'enrolment.cancelled', 'enrolment', ?, JSON_OBJECT('registrationId', ?))`, [randomUUID(), actorId, enrolment.id, registrationId]);
    }
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (?, ?, 'registration.status_changed', 'registration', ?, JSON_OBJECT('from', ?, 'to', ?))`, [randomUUID(), actorId, registrationId, rows[0].status, status]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function listDashboard(pool: Pick<Pool, 'execute'>) {
  const [intakes] = await pool.execute<RowDataPacket[]>(`SELECT i.id, i.intake_code, i.max_seats, i.registration_deadline_at, i.starts_at, i.status, c.title,
    (SELECT COUNT(*) FROM institute_enrolments e WHERE e.intake_id=i.id AND e.status IN ('active','completed')) AS confirmed,
    (SELECT COUNT(*) FROM institute_seat_reservations r WHERE r.intake_id=i.id AND r.status='active' AND r.expires_at > UTC_TIMESTAMP(6)) AS reserved
    FROM institute_course_intakes i JOIN institute_courses c ON c.id=i.course_id ORDER BY i.starts_at, c.title`);
  const [registrations] = await pool.execute<RowDataPacket[]>(`SELECT r.id, r.status, r.source, r.submitted_at, s.display_name, i.intake_code, c.title,
    p.id AS payment_verification_id, p.status AS payment_status, p.amount_minor,
    sr.id AS reservation_id, sr.status AS reservation_status, sr.expires_at AS reservation_expires_at
    FROM institute_registrations r JOIN institute_students s ON s.id=r.student_id
    JOIN institute_course_intakes i ON i.id=r.intake_id JOIN institute_courses c ON c.id=i.course_id
    LEFT JOIN institute_payment_verifications p ON p.registration_id=r.id
    LEFT JOIN institute_seat_reservations sr ON sr.registration_id=r.id
    ORDER BY r.submitted_at DESC LIMIT 200`);
  const [audit] = await pool.execute<RowDataPacket[]>(`SELECT l.action, l.entity_type, l.entity_reference, l.occurred_at, u.display_name AS actor_name
    FROM institute_audit_logs l LEFT JOIN institute_admin_users u ON u.id=l.actor_reference
    ORDER BY l.occurred_at DESC LIMIT 100`);
  return { intakes, registrations, audit };
}
