import { randomUUID } from 'node:crypto';
import mysql, { type Pool } from 'mysql2/promise';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { consumeSharedRateLimit } from '@/features/education/administration/rateLimit';
import { createContactChallenge, verifyContactChallenge } from '@/features/education/administration/contactVerification';
import { authenticateAdmin } from '@/features/education/administration/auth';
import { encryptPrivateValue, hashPassword, privateLookupHash, secretHash } from '@/features/education/administration/crypto';
import { ContactIdentityConflictError, createRegistration, updateRegistrationStatus } from '@/features/education/administration/registrations';
import { verifyPaymentAndReserveSeat } from '@/features/education/administration/payments';
import { convertReservationToEnrolment, reserveIntakeSeat } from '@/features/education/database/seatAllocation';
import { MySqlCertificateRepository } from '@/features/education/certificates/mysqlRepository';

const integration = process.env.INSTITUTE_MARIADB_INTEGRATION === 'true';
const suite = integration ? describe.sequential : describe.skip;
let pool: Pool;
const ids = { course: randomUUID(), capacityIntake: randomUUID(), lifecycleIntake: randomUUID(), paymentIntake: randomUUID(), certificateIntake: randomUUID(), registrationIntake: randomUUID() };

async function seedIntake(id: string, code: string) {
  await pool.execute(`INSERT INTO institute_course_intakes
    (id, course_id, intake_code, max_seats, fee_minor, fee_currency, registration_deadline_at, status)
    VALUES (?, ?, ?, 30, 750000, 'LKR', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 30 DAY), 'open')`, [id, ids.course, code]);
}

async function seedStudentRegistration(intakeId: string, suffix: string) {
  const studentId = randomUUID(); const registrationId = randomUUID();
  await pool.execute(`INSERT INTO institute_students (id, display_name, privacy_consent_at) VALUES (?, ?, UTC_TIMESTAMP(6))`, [studentId, `Integration Learner ${suffix}`]);
  await pool.execute(`INSERT INTO institute_registrations (id, student_id, intake_id, status, source) VALUES (?, ?, ?, 'pending', 'administrator')`, [registrationId, studentId, intakeId]);
  return { studentId, registrationId };
}

suite('MariaDB 11.8.9 Institute integration', () => {
  beforeAll(async () => {
    pool = mysql.createPool({ host: process.env.INSTITUTE_DB_HOST, port: Number(process.env.INSTITUTE_DB_PORT), database: process.env.INSTITUTE_DB_NAME, user: process.env.INSTITUTE_DB_USER, password: process.env.INSTITUTE_DB_PASSWORD, connectionLimit: 40, timezone: 'Z' });
    await pool.execute(`INSERT INTO institute_courses (id, slug, title, status) VALUES (?, ?, 'Integration Course', 'active')`, [ids.course, `integration-${ids.course}`]);
    await seedIntake(ids.capacityIntake, `CAP-${ids.capacityIntake}`); await seedIntake(ids.lifecycleIntake, `LIFE-${ids.lifecycleIntake}`);
    await seedIntake(ids.paymentIntake, `PAY-${ids.paymentIntake}`); await seedIntake(ids.certificateIntake, `CERT-${ids.certificateIntake}`);
    await seedIntake(ids.registrationIntake, `REG-${ids.registrationIntake}`);
  });
  afterAll(async () => { if (pool) await pool.end(); });

  it('runs the exact MariaDB version with tracked checksums, InnoDB tables, constraints and foreign keys', async () => {
    const [[version]] = await pool.query<mysql.RowDataPacket[]>('SELECT VERSION() AS version');
    expect(version.version).toMatch(/^11\.8\.9-MariaDB/);
    const [migrations] = await pool.query<mysql.RowDataPacket[]>('SELECT migration_name, sha256 FROM institute_schema_migrations ORDER BY migration_name');
    expect(migrations.map((row) => row.migration_name)).toEqual(['001_institute_core.sql', '002_institute_administration.sql', '003_institute_security_remediation.sql', '004_institute_ip_independent_security.sql', '005_institute_course_enquiries.sql']);
    expect(migrations.every((row) => /^[a-f0-9]{64}$/.test(row.sha256))).toBe(true);
    const [[engines]] = await pool.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS non_innodb FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name LIKE 'institute_%' AND engine <> 'InnoDB'`);
    expect(Number(engines.non_innodb)).toBe(0);
    const [[foreignKeys]] = await pool.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS count FROM information_schema.referential_constraints WHERE constraint_schema=DATABASE()`);
    const [[checks]] = await pool.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS count FROM information_schema.table_constraints WHERE constraint_schema=DATABASE() AND constraint_type='CHECK'`);
    expect(Number(foreignKeys.count)).toBeGreaterThanOrEqual(15); expect(Number(checks.count)).toBeGreaterThanOrEqual(7);
  });

  it('serializes 31 simultaneous allocations and caps the intake at 30 seats', async () => {
    const applicants = await Promise.all(Array.from({ length: 31 }, (_, index) => seedStudentRegistration(ids.capacityIntake, `capacity-${index}`)));
    const results = await Promise.allSettled(applicants.map((applicant) => reserveIntakeSeat(pool, { id: randomUUID(), intakeId: ids.capacityIntake, studentId: applicant.studentId, registrationId: applicant.registrationId, expiresAt: new Date(Date.now() + 3_600_000) })));
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(30);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    const [[count]] = await pool.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS count FROM institute_seat_reservations WHERE intake_id=? AND status='active' AND expires_at > UTC_TIMESTAMP(6)`, [ids.capacityIntake]);
    expect(Number(count.count)).toBe(30);
  });

  it('reactivates an expired reservation in place without duplicate rows', async () => {
    const applicant = await seedStudentRegistration(ids.lifecycleIntake, 'lifecycle'); const reservationId = randomUUID();
    await reserveIntakeSeat(pool, { id: reservationId, intakeId: ids.lifecycleIntake, ...applicant, expiresAt: new Date(Date.now() - 1_000) });
    await reserveIntakeSeat(pool, { id: randomUUID(), intakeId: ids.lifecycleIntake, ...applicant, expiresAt: new Date(Date.now() + 3_600_000) });
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT id, status, expires_at FROM institute_seat_reservations WHERE registration_id=?', [applicant.registrationId]);
    expect(rows).toHaveLength(1); expect(rows[0].id).toBe(reservationId); expect(rows[0].status).toBe('active'); expect(new Date(rows[0].expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it('replays payment and enrolment confirmation, then cancels exactly one lifecycle', async () => {
    const applicant = await seedStudentRegistration(ids.paymentIntake, 'payment'); const actorId = randomUUID();
    const first = await verifyPaymentAndReserveSeat(pool, { registrationId: applicant.registrationId, amountMinor: 750000, providerReference: `receipt-${applicant.registrationId}`, actorId });
    const replay = await verifyPaymentAndReserveSeat(pool, { registrationId: applicant.registrationId, amountMinor: 750000, providerReference: `receipt-${applicant.registrationId}`, actorId });
    expect(replay).toEqual(first);
    const enrolmentId = randomUUID();
    await convertReservationToEnrolment(pool, { registrationId: applicant.registrationId, reservationId: first.reservationId, paymentVerificationId: first.paymentId, enrolmentId, actorId });
    await convertReservationToEnrolment(pool, { registrationId: applicant.registrationId, reservationId: first.reservationId, paymentVerificationId: first.paymentId, enrolmentId: randomUUID(), actorId });
    await updateRegistrationStatus(pool, applicant.registrationId, 'cancelled', actorId);
    const [[counts]] = await pool.query<mysql.RowDataPacket[]>(`SELECT
      (SELECT COUNT(*) FROM institute_payment_verifications WHERE registration_id=?) payments,
      (SELECT COUNT(*) FROM institute_seat_reservations WHERE registration_id=?) reservations,
      (SELECT COUNT(*) FROM institute_enrolments WHERE registration_id=?) enrolments`, [applicant.registrationId, applicant.registrationId, applicant.registrationId]);
    expect(Number(counts.payments)).toBe(1); expect(Number(counts.reservations)).toBe(1); expect(Number(counts.enrolments)).toBe(1);
    const [[state]] = await pool.query<mysql.RowDataPacket[]>(`SELECT r.status registration_status, e.status enrolment_status, s.status reservation_status FROM institute_registrations r JOIN institute_enrolments e ON e.registration_id=r.id JOIN institute_seat_reservations s ON s.registration_id=r.id WHERE r.id=?`, [applicant.registrationId]);
    expect(state).toMatchObject({ registration_status: 'cancelled', enrolment_status: 'cancelled', reservation_status: 'converted' });
  });

  it('persists and atomically enforces the shared rate limit', async () => {
    const subject = randomUUID();
    const results = await Promise.all(Array.from({ length: 8 }, () => consumeSharedRateLimit(pool, subject, { scope: 'integration.limit', maximum: 3, windowSeconds: 60 })));
    expect(results.filter((result) => result.allowed)).toHaveLength(3);
    expect(results.filter((result) => !result.allowed)).toHaveLength(5);
    const [[row]] = await pool.query<mysql.RowDataPacket[]>(`SELECT attempt_count FROM institute_rate_limits WHERE scope='integration.limit'`);
    expect(Number(row.attempt_count)).toBe(8);
  });

  it('persists identifier/global counters across separate connections without client-IP input', async () => {
    const identifier = `certificate-${randomUUID()}`;
    const firstConnection = await pool.getConnection(); const secondConnection = await pool.getConnection();
    try {
      const first = await consumeSharedRateLimit({ getConnection: async () => firstConnection } as never, identifier, { scope: 'integration.identifier', maximum: 2, windowSeconds: 60 });
      const second = await consumeSharedRateLimit({ getConnection: async () => secondConnection } as never, identifier, { scope: 'integration.identifier', maximum: 2, windowSeconds: 60 });
      expect(first.allowed).toBe(true); expect(second.allowed).toBe(true);
    } finally {
      // consumeSharedRateLimit releases each borrowed connection.
    }
    const third = await consumeSharedRateLimit(pool, identifier, { scope: 'integration.identifier', maximum: 2, windowSeconds: 60 });
    expect(third.allowed).toBe(false);
    const [[row]] = await pool.query<mysql.RowDataPacket[]>('SELECT attempt_count FROM institute_rate_limits WHERE scope=? AND subject_hash=?', ['integration.identifier', secretHash(`integration.identifier:${identifier}`)]);
    expect(Number(row.attempt_count)).toBe(3);
  });

  it('persists an email challenge, consumes it once, and stores a single-use grant', async () => {
    let delivered = '';
    const challenge = await createContactChallenge(pool, { type: 'email', destination: 'integration@example.com', deliver: async ({ token }) => { delivered = token; } });
    const [[stored]] = await pool.query<mysql.RowDataPacket[]>('SELECT requested_network_hash, consumed_at FROM institute_contact_verification_challenges WHERE id=?', [challenge.challengeId]);
    expect(stored.requested_network_hash).toBeNull(); expect(stored.consumed_at).toBeNull();
    const verified = await verifyContactChallenge(pool, { challengeId: challenge.challengeId, token: delivered });
    expect(verified.verified).toBe(true); expect(verified.grant).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect((await verifyContactChallenge(pool, { challengeId: challenge.challengeId, token: delivered })).verified).toBe(false);
    const [[grants]] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM institute_contact_verification_grants WHERE grant_hash=? AND consumed_at IS NULL', [secretHash(verified.grant!)]);
    expect(Number(grants.count)).toBe(1);
  });

  it('rejects a verified email combined with an existing student telephone identity', async () => {
    const phone = '+94770000123'; const victimId = randomUUID();
    await pool.execute(`INSERT INTO institute_students (id, display_name, phone_ciphertext, phone_lookup_hash, privacy_consent_at)
      VALUES (?, 'Existing Student', ?, ?, UTC_TIMESTAMP(6))`, [victimId, encryptPrivateValue(phone), privateLookupHash(phone)]);
    let token = '';
    const challenge = await createContactChallenge(pool, { type: 'email', destination: 'new-owner@example.com', deliver: async (input) => { token = input.token; } });
    const verification = await verifyContactChallenge(pool, { challengeId: challenge.challengeId, token });
    await expect(createRegistration(pool, {
      fullName: 'Conflicting Learner', email: 'new-owner@example.com', phone, intakeId: ids.registrationIntake,
      consent: true, source: 'website', verificationGrant: verification.grant!,
    })).rejects.toBeInstanceOf(ContactIdentityConflictError);
    const [[registrations]] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM institute_registrations WHERE intake_id=?', [ids.registrationIntake]);
    expect(Number(registrations.count)).toBe(0);
  });

  it('persists administrator sessions and applies database account lockout', async () => {
    const successfulId = randomUUID(); const lockedId = randomUUID();
    const passwordHash = await hashPassword('phase-7 integration administrator passphrase');
    await pool.execute(`INSERT INTO institute_admin_users (id, username, display_name, password_hash, role)
      VALUES (?, 'phase7.admin', 'Phase 7 Admin', ?, 'administrator'), (?, 'phase7.locked', 'Phase 7 Locked', ?, 'administrator')`, [successfulId, passwordHash, lockedId, passwordHash]);
    const session = await authenticateAdmin(pool, 'phase7.admin', 'phase-7 integration administrator passphrase', 'ip-independent-global');
    expect(session).not.toBeNull();
    const [[storedSession]] = await pool.query<mysql.RowDataPacket[]>('SELECT admin_user_id, revoked_at FROM institute_admin_sessions WHERE token_hash=?', [secretHash(session!.token)]);
    expect(storedSession.admin_user_id).toBe(successfulId); expect(storedSession.revoked_at).toBeNull();
    for (let attempt = 0; attempt < 5; attempt += 1) expect(await authenticateAdmin(pool, 'phase7.locked', 'incorrect password', 'ip-independent-global')).toBeNull();
    const [[locked]] = await pool.query<mysql.RowDataPacket[]>('SELECT failed_login_count, locked_until FROM institute_admin_users WHERE id=?', [lockedId]);
    expect(Number(locked.failed_login_count)).toBe(5); expect(new Date(locked.locked_until).getTime()).toBeGreaterThan(Date.now());
  });

  it('enforces certificate eligibility constraints and returns only the public projection', async () => {
    const applicant = await seedStudentRegistration(ids.certificateIntake, 'certificate'); const paymentId = randomUUID(); const enrolmentId = randomUUID(); const assessmentId = randomUUID();
    await pool.execute(`INSERT INTO institute_payment_verifications (id, registration_id, provider_reference, amount_minor, status, verified_at) VALUES (?, ?, ?, 750000, 'verified', UTC_TIMESTAMP(6))`, [paymentId, applicant.registrationId, `cert-${paymentId}`]);
    await pool.execute(`INSERT INTO institute_enrolments (id, student_id, intake_id, registration_id, payment_verification_id, status) VALUES (?, ?, ?, ?, ?, 'completed')`, [enrolmentId, applicant.studentId, ids.certificateIntake, applicant.registrationId, paymentId]);
    for (let session = 1; session <= 5; session += 1) await pool.execute(`INSERT INTO institute_attendance (id, enrolment_id, session_number, attended, recorded_by) VALUES (?, ?, ?, TRUE, ?)`, [randomUUID(), enrolmentId, session, randomUUID()]);
    await pool.execute(`INSERT INTO institute_practical_assessments (id, enrolment_id, attempt_number, score, assessed_at, assessed_by) VALUES (?, ?, 1, 60, UTC_TIMESTAMP(6), ?)`, [assessmentId, enrolmentId, randomUUID()]);
    const certificateId = 'TIT-ABCDEFGHJKLMNPQRSTUVWXY2';
    await pool.execute(`INSERT INTO institute_certificates (id, certificate_id, student_id, course_id, intake_id, enrolment_id, qualifying_assessment_id, issuer_reference, attendance_count, final_assessment_score, eligibility_attempt, issued_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5, 60, 'initial', UTC_TIMESTAMP(6))`, [randomUUID(), certificateId, applicant.studentId, ids.course, ids.certificateIntake, enrolmentId, assessmentId, randomUUID()]);
    await expect(pool.execute(`UPDATE institute_certificates SET attendance_count=4 WHERE certificate_id=?`, [certificateId])).rejects.toThrow(/constraint/i);
    await expect(pool.execute(`UPDATE institute_certificates SET final_assessment_score=59 WHERE certificate_id=?`, [certificateId])).rejects.toThrow(/constraint/i);
    const result = await new MySqlCertificateRepository(pool).findPublicByCertificateId(certificateId);
    expect(result).toMatchObject({ certificateId, courseName: 'Integration Course', status: 'valid', issuerName: 'Techromz Institute' });
    expect(result).not.toHaveProperty('finalAssessmentScore');
  });
});
