import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { IntakeUnavailableError } from '../database/seatAllocation';

export async function verifyPaymentAndReserveSeat(pool: Pick<Pool, 'getConnection'>, input: { registrationId: string; amountMinor: number; providerReference?: string; actorId: string; reservationMinutes?: number }) {
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) throw new Error('INVALID_AMOUNT');
  const providerReference = input.providerReference?.trim();
  if (!providerReference || providerReference.length > 190) throw new Error('IDEMPOTENCY_REFERENCE_REQUIRED');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [registrations] = await connection.execute<(RowDataPacket & { student_id: string; intake_id: string; status: string })[]>(
      'SELECT student_id, intake_id, status FROM institute_registrations WHERE id = ? FOR UPDATE', [input.registrationId]);
    const registration = registrations[0];
    if (!registration || !['pending', 'awaiting_payment', 'waitlist', 'confirmed'].includes(registration.status)) throw new Error('INVALID_REGISTRATION_STATE');
    const [existingPayments] = await connection.execute<(RowDataPacket & { id: string; registration_id: string; amount_minor: number; status: string })[]>(
      'SELECT id, registration_id, amount_minor, status FROM institute_payment_verifications WHERE provider_reference = ? FOR UPDATE', [providerReference]);
    const existingPayment = existingPayments[0];
    if (existingPayment && (existingPayment.registration_id !== input.registrationId || Number(existingPayment.amount_minor) !== input.amountMinor || existingPayment.status !== 'verified')) throw new Error('IDEMPOTENCY_CONFLICT');
    const [existingReservations] = await connection.execute<(RowDataPacket & { id: string; status: string; expires_at: Date })[]>(
      'SELECT id, status, expires_at FROM institute_seat_reservations WHERE registration_id = ? FOR UPDATE', [input.registrationId]);
    const existingReservation = existingReservations[0];
    if (existingPayment && existingReservation && ['active', 'converted'].includes(existingReservation.status) && (existingReservation.status === 'converted' || existingReservation.expires_at > new Date())) {
      await connection.commit(); return { paymentId: existingPayment.id, reservationId: existingReservation.id };
    }
    const [intakes] = await connection.execute<(RowDataPacket & { max_seats: number; status: string })[]>('SELECT max_seats, status FROM institute_course_intakes WHERE id = ? FOR UPDATE', [registration.intake_id]);
    const intake = intakes[0];
    if (!intake || intake.status !== 'open') throw new IntakeUnavailableError('This intake is not open.');
    const [counts] = await connection.execute<(RowDataPacket & { allocated: number })[]>(`SELECT
      (SELECT COUNT(*) FROM institute_enrolments WHERE intake_id=? AND status IN ('active','completed')) +
      (SELECT COUNT(*) FROM institute_seat_reservations WHERE intake_id=? AND status='active' AND expires_at > UTC_TIMESTAMP(6)) AS allocated`, [registration.intake_id, registration.intake_id]);
    if (Number(counts[0]?.allocated ?? intake.max_seats) >= intake.max_seats) throw new IntakeUnavailableError();
    const paymentId = existingPayment?.id ?? randomUUID(); const reservationId = existingReservation?.id ?? randomUUID();
    if (!existingPayment) await connection.execute(`INSERT INTO institute_payment_verifications
      (id, registration_id, provider_reference, amount_minor, status, verified_at, verified_by)
      VALUES (?, ?, ?, ?, 'verified', UTC_TIMESTAMP(6), ?)`, [paymentId, input.registrationId, providerReference, input.amountMinor, input.actorId]);
    if (existingReservation) await connection.execute(`UPDATE institute_seat_reservations SET status='active', expires_at=DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? MINUTE)
      WHERE id=? AND status IN ('expired','cancelled')`, [input.reservationMinutes ?? 60, reservationId]);
    else await connection.execute(`INSERT INTO institute_seat_reservations
      (id, intake_id, student_id, registration_id, status, expires_at)
      VALUES (?, ?, ?, ?, 'active', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? MINUTE))`, [reservationId, registration.intake_id, registration.student_id, input.registrationId, input.reservationMinutes ?? 60]);
    await connection.execute("UPDATE institute_registrations SET status='awaiting_payment', reviewed_at=UTC_TIMESTAMP(6), reviewed_by=? WHERE id=?", [input.actorId, input.registrationId]);
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (?, ?, 'payment.verified', 'payment_verification', ?, JSON_OBJECT('registrationId', ?, 'reservationId', ?))`, [randomUUID(), input.actorId, paymentId, input.registrationId, reservationId]);
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (?, ?, 'reservation.activated', 'seat_reservation', ?, JSON_OBJECT('registrationId', ?))`, [randomUUID(), input.actorId, reservationId, input.registrationId]);
    await connection.commit();
    return { paymentId, reservationId };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}
