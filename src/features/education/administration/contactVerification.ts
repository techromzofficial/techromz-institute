import 'server-only';
import { randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { privateLookupHash, secretHash } from './crypto';
export type ContactType = 'email' | 'phone';
export type ContactVerificationPurpose = 'registration' | 'course_enquiry';
export type ContactDelivery = (input: { type: ContactType; destination: string; token: string }) => Promise<void>;

export async function createContactChallenge(pool: Pick<Pool, 'getConnection'>, input: { type: ContactType; destination: string; purpose?: ContactVerificationPurpose; deliver: ContactDelivery }): Promise<{ challengeId: string }> {
  const token = String(randomInt(0, 1_000_000)).padStart(6, '0'); const challengeId = randomUUID();
  const purpose = input.purpose ?? 'registration';
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const contactHash = privateLookupHash(input.destination);
    await connection.execute(`UPDATE institute_contact_verification_challenges SET consumed_at=UTC_TIMESTAMP(6)
      WHERE contact_type=? AND purpose=? AND contact_lookup_hash=? AND consumed_at IS NULL`, [input.type, purpose, contactHash]);
    await connection.execute(`INSERT INTO institute_contact_verification_challenges
      (id, contact_type, purpose, contact_lookup_hash, token_hash, requested_network_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, NULL, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 10 MINUTE))`, [challengeId, input.type, purpose, contactHash, secretHash(token)]);
    await input.deliver({ type: input.type, destination: input.destination, token });
    await connection.commit(); return { challengeId };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function verifyContactChallenge(pool: Pick<Pool, 'getConnection'>, input: { challengeId: string; token: string; purpose?: ContactVerificationPurpose }): Promise<{ verified: boolean; grant?: string }> {
  const purpose = input.purpose ?? 'registration';
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { contact_type: ContactType; purpose: ContactVerificationPurpose; contact_lookup_hash: Buffer; token_hash: Buffer; failed_attempts: number })[]>(`SELECT contact_type, purpose, contact_lookup_hash, token_hash, failed_attempts
      FROM institute_contact_verification_challenges WHERE id = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE`, [input.challengeId, purpose]);
    const challenge = rows[0];
    const tokenHash = secretHash(input.token);
    const valid = !!challenge && challenge.failed_attempts < 5 && challenge.token_hash.length === tokenHash.length && timingSafeEqual(challenge.token_hash, tokenHash);
    if (!valid) {
      if (challenge) await connection.execute('UPDATE institute_contact_verification_challenges SET failed_attempts = failed_attempts + 1 WHERE id = ?', [input.challengeId]);
      await connection.commit(); return { verified: false };
    }
    const grant = randomBytes(32).toString('base64url');
    await connection.execute('UPDATE institute_contact_verification_challenges SET consumed_at = UTC_TIMESTAMP(6) WHERE id = ?', [input.challengeId]);
    await connection.execute(`UPDATE institute_contact_verification_grants SET consumed_at=UTC_TIMESTAMP(6)
      WHERE contact_type=? AND purpose=? AND contact_lookup_hash=? AND consumed_at IS NULL`, [challenge.contact_type, challenge.purpose, challenge.contact_lookup_hash]);
    await connection.execute(`INSERT INTO institute_contact_verification_grants (id, contact_type, purpose, contact_lookup_hash, grant_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 15 MINUTE))`, [randomUUID(), challenge.contact_type, challenge.purpose, challenge.contact_lookup_hash, secretHash(grant)]);
    await connection.commit(); return { verified: true, grant };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

