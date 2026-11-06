import 'server-only';
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class IntakeUnavailableError extends Error {
  constructor(message = 'No seats are available for this intake.') { super(message); this.name = 'IntakeUnavailableError'; }
}

type IntakeRow = RowDataPacket & { max_seats: number; status: string };
type CountRow = RowDataPacket & { allocated_seats: number };

export interface SeatReservationInput { id: string; intakeId: string; studentId: string; registrationId: string; expiresAt: Date; }

export async function reserveIntakeSeat(pool: Pick<Pool, 'getConnection'>, input: SeatReservationInput): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await reserveUnderLock(connection, input);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function reserveUnderLock(connection: Pick<PoolConnection, 'execute'>, input: SeatReservationInput) {
  const [intakes] = await connection.execute<IntakeRow[]>('SELECT max_seats, status FROM institute_course_intakes WHERE id = ? FOR UPDATE', [input.intakeId]);
  const intake = intakes[0];
  if (!intake || intake.status !== 'open') throw new IntakeUnavailableError('This intake is not open for seat allocation.');
  const [existingRows] = await connection.execute<(RowDataPacket & { id: string; student_id: string; intake_id: string; status: string; expires_at: Date })[]>(
    'SELECT id, student_id, intake_id, status, expires_at FROM institute_seat_reservations WHERE registration_id = ? FOR UPDATE', [input.registrationId]);
  const existing = existingRows[0];
  if (existing && (existing.student_id !== input.studentId || existing.intake_id !== input.intakeId)) throw new IntakeUnavailableError('The reservation identity does not match this registration.');
  if (existing?.status === 'converted') throw new IntakeUnavailableError('This registration is already enrolled.');
  if (existing?.status === 'active' && existing.expires_at > new Date()) return;
  const [counts] = await connection.execute<CountRow[]>(`SELECT
    (SELECT COUNT(*) FROM institute_enrolments WHERE intake_id = ? AND status IN ('active','completed')) +
    (SELECT COUNT(*) FROM institute_seat_reservations WHERE intake_id = ? AND status = 'active' AND expires_at > UTC_TIMESTAMP()) AS allocated_seats`, [input.intakeId, input.intakeId]);
  if ((counts[0]?.allocated_seats ?? intake.max_seats) >= intake.max_seats) throw new IntakeUnavailableError();
  if (existing) await connection.execute<ResultSetHeader>(`UPDATE institute_seat_reservations SET status='active', expires_at=?, updated_at=UTC_TIMESTAMP(6)
    WHERE id=? AND status IN ('expired','cancelled','active')`, [input.expiresAt, existing.id]);
  else await connection.execute<ResultSetHeader>(`INSERT INTO institute_seat_reservations
    (id, intake_id, student_id, registration_id, status, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'active', ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [input.id, input.intakeId, input.studentId, input.registrationId, input.expiresAt]);
}

export async function convertReservationToEnrolment(pool: Pick<Pool, 'getConnection'>, input: { registrationId: string; reservationId: string; enrolmentId: string; paymentVerificationId: string; actorId: string }): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { id: string; intake_id: string; student_id: string; registration_id: string; status: string; expires_at: Date })[]>(
      `SELECT id, intake_id, student_id, registration_id, status, expires_at FROM institute_seat_reservations WHERE id = ? FOR UPDATE`, [input.reservationId]);
    const reservation = rows[0];
    const [existingEnrolments] = await connection.execute<(RowDataPacket & { id: string; payment_verification_id: string | null; status: string })[]>(
      'SELECT id, payment_verification_id, status FROM institute_enrolments WHERE registration_id = ? FOR UPDATE', [input.registrationId]);
    const existingEnrolment = existingEnrolments[0];
    if (reservation?.status === 'converted' && existingEnrolment?.payment_verification_id === input.paymentVerificationId && ['active', 'completed'].includes(existingEnrolment.status)) {
      await connection.commit(); return;
    }
    if (!reservation || reservation.registration_id !== input.registrationId || reservation.status !== 'active' || reservation.expires_at <= new Date()) throw new IntakeUnavailableError('The seat reservation is no longer active.');
    const [payments] = await connection.execute<(RowDataPacket & { status: string; registration_id: string })[]>(
      'SELECT status, registration_id FROM institute_payment_verifications WHERE id = ? FOR UPDATE', [input.paymentVerificationId]);
    if (payments[0]?.status !== 'verified' || payments[0].registration_id !== reservation.registration_id) throw new IntakeUnavailableError('Verified payment is required before enrolment.');
    await connection.execute(`INSERT INTO institute_enrolments (id, student_id, intake_id, registration_id, payment_verification_id, status)
      VALUES (?, ?, ?, ?, ?, 'active')`, [input.enrolmentId, reservation.student_id, reservation.intake_id, reservation.registration_id, input.paymentVerificationId]);
    await connection.execute("UPDATE institute_seat_reservations SET status = 'converted' WHERE id = ? AND status = 'active'", [reservation.id]);
    await connection.execute("UPDATE institute_registrations SET status = 'confirmed', reviewed_at = UTC_TIMESTAMP(6), reviewed_by = ? WHERE id = ?", [input.actorId, reservation.registration_id]);
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (UUID(), ?, 'registration.confirmed', 'registration', ?, JSON_OBJECT('reservationId', ?, 'paymentVerificationId', ?))`, [input.actorId, reservation.registration_id, reservation.id, input.paymentVerificationId]);
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (UUID(), ?, 'enrolment.confirmed', 'enrolment', ?, JSON_OBJECT('registrationId', ?))`, [input.actorId, input.enrolmentId, reservation.registration_id]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function expireSeatReservations(pool: Pick<Pool, 'execute'>): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>("UPDATE institute_seat_reservations SET status = 'expired' WHERE status = 'active' AND expires_at <= UTC_TIMESTAMP(6)");
  return result.affectedRows;
}
