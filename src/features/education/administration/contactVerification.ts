import 'server-only';
import { randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { privateLookupHash, secretHash } from './crypto';
import { readOtpPolicy } from './otpPolicy';
export type ContactType = 'email' | 'phone';
export type ContactVerificationPurpose = 'registration' | 'course_enquiry';
export class ContactChallengeRateLimitError extends Error {
  constructor(public retryAfterSeconds: number) { super('Please wait before requesting another code.'); }
}
export type ContactDelivery = (input: { type: ContactType; destination: string; token: string; purpose?: ContactVerificationPurpose }) => Promise<void>;

export async function createContactChallenge(pool: Pick<Pool, 'getConnection'>, input: { type: ContactType; destination: string; purpose?: ContactVerificationPurpose; session?: string; deliver: ContactDelivery }): Promise<{ challengeId: string }> {
  const policy = readOtpPolicy();
  const token = String(randomInt(0, 1_000_000)).padStart(6, '0'); const challengeId = randomUUID();
  const purpose = input.purpose ?? 'registration';
  if (purpose === 'course_enquiry' && !input.session) throw new Error('ENQUIRY_SESSION_REQUIRED');
  const sessionHash = input.session ? secretHash(input.session) : null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(`DELETE FROM institute_contact_verification_challenges
      WHERE created_at < DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY)`);
    await connection.execute(`DELETE FROM institute_contact_verification_grants
      WHERE expires_at <= UTC_TIMESTAMP(6) OR consumed_at < DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY)`);
    const contactHash = privateLookupHash(input.destination);
    if (purpose === 'course_enquiry') {
      // A persistent per-contact row serializes issuance across backend instances.
      await connection.execute('INSERT IGNORE INTO institute_enquiry_otp_locks (contact_hash) VALUES (?)', [contactHash]);
      await connection.execute('SELECT contact_hash FROM institute_enquiry_otp_locks WHERE contact_hash=? FOR UPDATE', [contactHash]);
      const [recent] = await connection.execute<(RowDataPacket & { age_seconds: number })[]>(`SELECT TIMESTAMPDIFF(SECOND, created_at, UTC_TIMESTAMP(6)) AS age_seconds
        FROM institute_contact_verification_challenges WHERE contact_type=? AND purpose=? AND contact_lookup_hash=?
        AND created_at > DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 15 MINUTE) ORDER BY created_at DESC`, [input.type, purpose, contactHash]);
      if (recent[0] && recent[0].age_seconds < policy.resendCooldownSeconds) throw new ContactChallengeRateLimitError(policy.resendCooldownSeconds - recent[0].age_seconds);
      if (recent.length >= 4) throw new ContactChallengeRateLimitError(Math.max(1, 900 - recent[recent.length - 1]!.age_seconds));
      await connection.execute(`UPDATE institute_contact_verification_grants SET consumed_at=UTC_TIMESTAMP(6)
        WHERE purpose=? AND contact_lookup_hash=? AND enquiry_session_hash=? AND consumed_at IS NULL`, [purpose, contactHash, sessionHash]);
    }
    await connection.execute(`UPDATE institute_contact_verification_challenges SET consumed_at=UTC_TIMESTAMP(6)
      WHERE contact_type=? AND purpose=? AND contact_lookup_hash=? AND consumed_at IS NULL`, [input.type, purpose, contactHash]);
    await connection.execute(`INSERT INTO institute_contact_verification_challenges
      (id, contact_type, purpose, contact_lookup_hash, token_hash, requested_network_hash, enquiry_session_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, NULL, ?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? MINUTE))`, [challengeId, input.type, purpose, contactHash, secretHash(`${challengeId}:${token}`), sessionHash, policy.expiryMinutes]);
    await input.deliver({ type: input.type, destination: input.destination, token, purpose });
    await connection.commit(); return { challengeId };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function verifyContactChallenge(pool: Pick<Pool, 'getConnection'>, input: { challengeId: string; token: string; purpose?: ContactVerificationPurpose; session?: string }): Promise<{ verified: boolean; grant?: string }> {
  const policy = readOtpPolicy();
  const purpose = input.purpose ?? 'registration';
  if (purpose === 'course_enquiry' && !input.session) throw new Error('ENQUIRY_SESSION_REQUIRED');
  const sessionHash = input.session ? secretHash(input.session) : null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { contact_type: ContactType; purpose: ContactVerificationPurpose; contact_lookup_hash: Buffer; token_hash: Buffer; failed_attempts: number; enquiry_session_hash: Buffer | null })[]>(`SELECT contact_type, purpose, contact_lookup_hash, token_hash, failed_attempts, enquiry_session_hash
      FROM institute_contact_verification_challenges WHERE id = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE`, [input.challengeId, purpose]);
    const challenge = rows[0];
    if (purpose === 'course_enquiry' && (!challenge?.enquiry_session_hash || !sessionHash || !challenge.enquiry_session_hash.equals(sessionHash))) {
      await connection.commit(); return { verified: false };
    }
    const tokenHash = secretHash(`${input.challengeId}:${input.token}`);
    const valid = !!challenge && challenge.failed_attempts < policy.maxAttempts && challenge.token_hash.length === tokenHash.length && timingSafeEqual(challenge.token_hash, tokenHash);
    if (!valid) {
      if (challenge) await connection.execute('UPDATE institute_contact_verification_challenges SET failed_attempts = failed_attempts + 1 WHERE id = ?', [input.challengeId]);
      await connection.commit(); return { verified: false };
    }
    const grant = randomBytes(32).toString('base64url');
    await connection.execute('UPDATE institute_contact_verification_challenges SET consumed_at = UTC_TIMESTAMP(6) WHERE id = ?', [input.challengeId]);
    await connection.execute(`UPDATE institute_contact_verification_grants SET consumed_at=UTC_TIMESTAMP(6)
      WHERE contact_type=? AND purpose=? AND contact_lookup_hash=? AND consumed_at IS NULL`, [challenge.contact_type, challenge.purpose, challenge.contact_lookup_hash]);
    await connection.execute(`INSERT INTO institute_contact_verification_grants (id, contact_type, purpose, contact_lookup_hash, grant_hash, enquiry_session_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 15 MINUTE))`, [randomUUID(), challenge.contact_type, challenge.purpose, challenge.contact_lookup_hash, secretHash(grant), sessionHash]);
    await connection.commit(); return { verified: true, grant };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}
